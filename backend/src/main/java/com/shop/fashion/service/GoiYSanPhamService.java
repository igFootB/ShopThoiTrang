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
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    // Chạy mỗi đêm lúc 2:00 AM
    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional
    public void generateRecommendationsDaily() {
        log.info("Bắt đầu tiến trình AI tạo gợi ý sản phẩm cho người dùng...");

        List<NguoiDung> users = nguoiDungRepository.findAll();
        List<SanPham> allProducts = sanPhamRepository.findAll();

        for (NguoiDung user : users) {
            // 1. Lấy lịch sử hành vi của user
            List<HanhViNguoiDung> behaviors = hanhViNguoiDungRepository.findByNguoiDungId(user.getId());

            if (behaviors.isEmpty()) continue; // Không có tương tác -> bỏ qua

            // 2. Tính điểm quan tâm đối với Category và Brand
            Map<Long, Float> categoryScores = new HashMap<>();
            Set<Long> interactedProductIds = new HashSet<>();

            for (HanhViNguoiDung bh : behaviors) {
                SanPham sp = bh.getSanPham();
                interactedProductIds.add(sp.getId());

                // Tính điểm theo Trọng số hành vi (VD: Mua/Thêm vào giỏ = cao hơn Xem)
                float weight = 1.0f;
                if ("ADD_TO_CART".equals(bh.getLoaiHanhVi())) weight = 3.0f;
                if ("PURCHASE".equals(bh.getLoaiHanhVi())) weight = 5.0f;

                if (sp.getDanhMuc() != null) {
                    categoryScores.put(sp.getDanhMuc().getId(), categoryScores.getOrDefault(sp.getDanhMuc().getId(), 0f) + weight);
                }
            }

            // 3. Xóa các gợi ý cũ của User đó (tối ưu: chỉ giữ lại mới nhất)
            List<GoiYSanPham> oldRecommendations = goiYSanPhamRepository.findByNguoiDungId(user.getId());
            goiYSanPhamRepository.deleteAll(oldRecommendations);

            // 4. Tìm các sản phẩm cùng loại nhưng CHƯA tương tác, đánh giá điểm
            List<GoiYSanPham> newRecommendations = new ArrayList<>();
            for (SanPham sp : allProducts) {
                if (sp.getTrangThai() != 1 || interactedProductIds.contains(sp.getId())) {
                    continue; // Bỏ qua sản phẩm đã ẩn hoặc đã mua/đã xem rồi
                }

                float score = 0f;
                if (sp.getDanhMuc() != null && categoryScores.containsKey(sp.getDanhMuc().getId())) {
                    score += categoryScores.get(sp.getDanhMuc().getId());
                }

                if (score > 0) { // Có quan tâm
                    GoiYSanPham goiY = new GoiYSanPham();
                    goiY.setNguoiDung(user);
                    goiY.setSanPham(sp);
                    goiY.setDiemGoiY(score);
                    newRecommendations.add(goiY);
                }
            }

            // 5. Lấy TOP 10 Gợi ý điểm cao nhất và Lưu vào Database
            List<GoiYSanPham> topRecommendations = newRecommendations.stream()
                    .sorted((a, b) -> Float.compare(b.getDiemGoiY(), a.getDiemGoiY()))
                    .limit(10)
                    .collect(Collectors.toList());

            goiYSanPhamRepository.saveAll(topRecommendations);
        }

        log.info("Đã hoàn tất tiến trình tạo gợi ý AI.");
    }
}
