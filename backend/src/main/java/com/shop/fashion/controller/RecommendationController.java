package com.shop.fashion.controller;

import com.shop.fashion.dto.response.RecommendationResponse;
import com.shop.fashion.security.UserDetailsImpl;
import com.shop.fashion.service.AIService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final AIService aiService;

    /**
     * Lấy danh sách gợi ý AI cho user đang đăng nhập
     * GET /api/recommendations
     */
    @GetMapping
    public ResponseEntity<?> getRecommendations() {
        try {
            Long userId = getCurrentUserId();
            if (userId == null) {
                return ResponseEntity.status(401)
                        .body(Map.of("message", "Vui lòng đăng nhập để xem gợi ý"));
            }

            List<RecommendationResponse> recommendations = aiService.getRecommendationsForUser(userId);
            return ResponseEntity.ok(recommendations);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Lỗi lấy gợi ý: " + e.getMessage()));
        }
    }

    /**
     * Gợi ý sản phẩm tương tự (cùng danh mục)
     * GET /api/recommendations/similar/{productId}
     */
    @GetMapping("/similar/{productId}")
    public ResponseEntity<?> getSimilarProducts(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "8") int limit) {
        try {
            List<RecommendationResponse> similar = aiService.getSimilarProducts(productId, limit);
            return ResponseEntity.ok(similar);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Lỗi lấy sản phẩm tương tự: " + e.getMessage()));
        }
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            return null;
        }
        return ((UserDetailsImpl) authentication.getPrincipal()).getId();
    }
}
