package com.shop.fashion.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shop.fashion.dto.response.RecommendationResponse;
import com.shop.fashion.entity.GoiYSanPham;
import com.shop.fashion.entity.HinhAnhSanPham;
import com.shop.fashion.entity.NguoiDung;
import com.shop.fashion.entity.SanPham;
import com.shop.fashion.repository.GoiYSanPhamRepository;
import com.shop.fashion.repository.NguoiDungRepository;
import com.shop.fashion.repository.SanPhamRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AIService {

    private final GoiYSanPhamRepository goiYSanPhamRepository;
    private final GoiYSanPhamService goiYSanPhamService;
    private final NguoiDungRepository nguoiDungRepository;
    private final SanPhamRepository sanPhamRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;

    private static final String CACHE_PREFIX = "rec:user:";
    private static final long CACHE_TTL_HOURS = 24;

    /**
     * Lấy danh sách gợi ý cho user.
     * Flow: Redis cache → Python AI → DB fallback → rule-based fallback
     */
    public List<RecommendationResponse> getRecommendationsForUser(Long userId) {
        // 1. Check Redis cache
        try {
            String cacheKey = CACHE_PREFIX + userId;
            String cached = redisTemplate.opsForValue().get(cacheKey);
            if (cached != null && !cached.isEmpty()) {
                log.info("Cache HIT cho user {} (Redis)", userId);
                JsonNode root = objectMapper.readTree(cached);
                if (root.isArray() && root.size() > 0) {
                    if (root.get(0).has("product_id")) {
                        // Python cache format: [{"product_id": 1, "score": 2.0}]
                        List<RecommendationResponse> list = new ArrayList<>();
                        for (JsonNode node : root) {
                            Long pid = node.get("product_id").asLong();
                            Float score = node.has("score") ? (float) node.get("score").asDouble() : null;
                            SanPham sp = sanPhamRepository.findById(pid).orElse(null);
                            if (sp != null) {
                                RecommendationResponse resp = new RecommendationResponse();
                                resp.setId(sp.getId());
                                resp.setTenSanPham(sp.getTenSanPham());
                                resp.setGia(sp.getGia());
                                resp.setThumbnail(getThumbnail(sp));
                                resp.setCategoryId(sp.getDanhMuc() != null ? sp.getDanhMuc().getId() : null);
                                resp.setTenDanhMuc(sp.getDanhMuc() != null ? sp.getDanhMuc().getTenDanhMuc() : null);
                                resp.setDiemGoiY(score);
                                list.add(resp);
                            }
                        }
                        return list;
                    } else {
                        // Java cache format
                        return objectMapper.readValue(cached, new TypeReference<List<RecommendationResponse>>() {});
                    }
                } else if (root.isArray() && root.size() == 0) {
                    return Collections.emptyList();
                }
            }
        } catch (Exception e) {
            log.debug("Redis cache lỗi (bỏ qua): {}", e.getMessage());
        }

        // 2. Check DB (có thể Python đã lưu trước đó)
        List<GoiYSanPham> recommendations = goiYSanPhamRepository.findByNguoiDungIdOrderByDiemGoiYDesc(userId);

        // 3. Nếu chưa có → gọi Python AI / rule-based fallback
        if (recommendations.isEmpty()) {
            NguoiDung user = nguoiDungRepository.findById(userId).orElse(null);
            if (user == null) return Collections.emptyList();
            recommendations = goiYSanPhamService.generateForUser(user);
        }

        List<RecommendationResponse> result = recommendations.stream()
                .map(this::toRecommendationResponse)
                .collect(Collectors.toList());

        // 4. Lưu vào Redis cache
        try {
            String cacheKey = CACHE_PREFIX + userId;
            String json = objectMapper.writeValueAsString(result);
            redisTemplate.opsForValue().set(cacheKey, json, CACHE_TTL_HOURS, TimeUnit.HOURS);
            log.info("Đã cache {} gợi ý cho user {} vào Redis", result.size(), userId);
        } catch (Exception e) {
            log.debug("Không thể cache vào Redis (bỏ qua): {}", e.getMessage());
        }

        return result;
    }

    /**
     * Lấy sản phẩm tương tự (cùng danh mục, loại trừ sản phẩm hiện tại)
     */
    public List<RecommendationResponse> getSimilarProducts(Long productId, int limit) {
        SanPham product = sanPhamRepository.findById(productId).orElse(null);
        if (product == null || product.getDanhMuc() == null) {
            return Collections.emptyList();
        }

        return sanPhamRepository
                .findByDanhMucIdAndTrangThaiAndIdNot(
                        product.getDanhMuc().getId(), 1, productId,
                        PageRequest.of(0, limit))
                .getContent()
                .stream()
                .map(sp -> {
                    RecommendationResponse resp = new RecommendationResponse();
                    resp.setId(sp.getId());
                    resp.setTenSanPham(sp.getTenSanPham());
                    resp.setGia(sp.getGia());
                    resp.setThumbnail(getThumbnail(sp));
                    resp.setCategoryId(sp.getDanhMuc() != null ? sp.getDanhMuc().getId() : null);
                    resp.setTenDanhMuc(sp.getDanhMuc() != null ? sp.getDanhMuc().getTenDanhMuc() : null);
                    resp.setDiemGoiY(null);
                    return resp;
                })
                .collect(Collectors.toList());
    }

    private RecommendationResponse toRecommendationResponse(GoiYSanPham goiY) {
        SanPham sp = goiY.getSanPham();
        RecommendationResponse resp = new RecommendationResponse();
        resp.setId(sp.getId());
        resp.setTenSanPham(sp.getTenSanPham());
        resp.setGia(sp.getGia());
        resp.setThumbnail(getThumbnail(sp));
        resp.setCategoryId(sp.getDanhMuc() != null ? sp.getDanhMuc().getId() : null);
        resp.setTenDanhMuc(sp.getDanhMuc() != null ? sp.getDanhMuc().getTenDanhMuc() : null);
        resp.setDiemGoiY(goiY.getDiemGoiY());
        return resp;
    }

    private String getThumbnail(SanPham sp) {
        if (sp.getListHinhAnh() != null && !sp.getListHinhAnh().isEmpty()) {
            return sp.getListHinhAnh().stream()
                    .filter(img -> img.getIsThumbnail() != null && img.getIsThumbnail() == 1)
                    .findFirst()
                    .map(HinhAnhSanPham::getDuongDanAnh)
                    .orElse(sp.getListHinhAnh().get(0).getDuongDanAnh());
        }
        return null;
    }
}
