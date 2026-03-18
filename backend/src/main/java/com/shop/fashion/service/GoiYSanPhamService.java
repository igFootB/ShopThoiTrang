package com.shop.fashion.service;

import com.shop.fashion.entity.GoiYSanPham;
import com.shop.fashion.entity.HanhViNguoiDung;
import com.shop.fashion.entity.NguoiDung;
import com.shop.fashion.entity.SanPham;
import com.shop.fashion.repository.GoiYSanPhamRepository;
import com.shop.fashion.repository.HanhViNguoiDungRepository;
import com.shop.fashion.repository.NguoiDungRepository;
import com.shop.fashion.repository.SanPhamRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class GoiYSanPhamService {

    private final HanhViNguoiDungRepository hanhViNguoiDungRepository;
    private final GoiYSanPhamRepository goiYSanPhamRepository;
    private final NguoiDungRepository nguoiDungRepository;
    private final SanPhamRepository sanPhamRepository;

    @Value("${ai.service.url:http://localhost:8000}")
    private String aiServiceUrl;

    /**
     * Gọi Python AI Service để predict gợi ý cho 1 user.
     * Fallback: nếu Python unavailable → dùng rule-based cũ.
     */
    @Transactional
    public List<GoiYSanPham> generateForUser(NguoiDung user) {
        try {
            // Thử gọi Python AI Service
            return callPythonPredict(user.getId());
        } catch (Exception e) {
            log.warn("Python AI Service không khả dụng, fallback rule-based: {}", e.getMessage());
            return fallbackRuleBased(user);
        }
    }

    /**
     * Gọi Python FastAPI /predict/{userId}
     */
    @SuppressWarnings("unchecked")
    private List<GoiYSanPham> callPythonPredict(Long userId) {
        RestTemplate rest = new RestTemplate();
        String url = aiServiceUrl + "/predict/" + userId + "?top_n=20";

        Map<String, Object> response = rest.getForObject(url, Map.class);
        if (response == null || !response.containsKey("recommendations")) {
            return Collections.emptyList();
        }

        List<Map<String, Object>> recommendations = (List<Map<String, Object>>) response.get("recommendations");

        NguoiDung user = nguoiDungRepository.findById(userId).orElse(null);
        if (user == null) return Collections.emptyList();

        // Xóa gợi ý cũ
        goiYSanPhamRepository.deleteByNguoiDungId(userId);

        // Lưu gợi ý mới từ Python
        List<GoiYSanPham> results = new ArrayList<>();
        for (Map<String, Object> rec : recommendations) {
            Long productId = ((Number) rec.get("product_id")).longValue();
            Float score = ((Number) rec.get("score")).floatValue();

            SanPham sp = sanPhamRepository.findById(productId).orElse(null);
            if (sp == null || sp.getTrangThai() == null || sp.getTrangThai() != 1) continue;

            GoiYSanPham goiY = new GoiYSanPham();
            goiY.setNguoiDung(user);
            goiY.setSanPham(sp);
            goiY.setDiemGoiY(score);
            results.add(goiY);
        }

        goiYSanPhamRepository.saveAll(results);
        log.info("Đã lưu {} gợi ý từ Python AI cho user {}", results.size(), userId);
        return results;
    }

    /**
     * Fallback: Rule-based scoring (logic cũ khi Python unavailable)
     */
    @Transactional
    public List<GoiYSanPham> fallbackRuleBased(NguoiDung user) {
        List<HanhViNguoiDung> behaviors = hanhViNguoiDungRepository
                .findByNguoiDungIdOrderByThoiGianDesc(user.getId());

        if (behaviors.isEmpty()) return Collections.emptyList();

        List<SanPham> allProducts = sanPhamRepository.findAll();
        Map<Long, Float> categoryScores = new HashMap<>();
        Set<Long> interactedProductIds = new HashSet<>();
        LocalDateTime now = LocalDateTime.now();

        for (HanhViNguoiDung bh : behaviors) {
            SanPham sp = bh.getSanPham();
            if (sp == null) continue;
            interactedProductIds.add(sp.getId());

            float weight = getWeight(bh.getLoaiHanhVi());
            float timeDecay = calculateTimeDecay(bh.getThoiGian(), now);
            weight *= timeDecay;

            if (sp.getDanhMuc() != null) {
                categoryScores.merge(sp.getDanhMuc().getId(), weight, Float::sum);
            }
        }

        goiYSanPhamRepository.deleteByNguoiDungId(user.getId());

        List<GoiYSanPham> newRecommendations = new ArrayList<>();
        for (SanPham sp : allProducts) {
            if (sp.getTrangThai() == null || sp.getTrangThai() != 1 || interactedProductIds.contains(sp.getId())) {
                continue;
            }
            float score = 0f;
            if (sp.getDanhMuc() != null && categoryScores.containsKey(sp.getDanhMuc().getId())) {
                score += categoryScores.get(sp.getDanhMuc().getId());
            }
            if (score > 0) {
                GoiYSanPham goiY = new GoiYSanPham();
                goiY.setNguoiDung(user);
                goiY.setSanPham(sp);
                goiY.setDiemGoiY(score);
                newRecommendations.add(goiY);
            }
        }

        List<GoiYSanPham> top = newRecommendations.stream()
                .sorted((a, b) -> Float.compare(b.getDiemGoiY(), a.getDiemGoiY()))
                .limit(20)
                .collect(Collectors.toList());

        goiYSanPhamRepository.saveAll(top);
        return top;
    }

    private float getWeight(String loaiHanhVi) {
        if (loaiHanhVi == null) return 1.0f;
        return switch (loaiHanhVi.toUpperCase()) {
            case "ADD_TO_CART" -> 3.0f;
            case "PURCHASE" -> 5.0f;
            case "WISHLIST" -> 2.0f;
            default -> 1.0f;
        };
    }

    private float calculateTimeDecay(LocalDateTime thoiGian, LocalDateTime now) {
        if (thoiGian == null) return 1.0f;
        long daysBetween = ChronoUnit.DAYS.between(thoiGian, now);
        if (daysBetween <= 7) return 1.5f;
        if (daysBetween <= 30) return 1.0f;
        return 0.5f;
    }
}
