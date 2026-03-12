package com.shop.fashion.controller;

import com.shop.fashion.dto.request.ReviewRequest;
import com.shop.fashion.entity.DanhGia;
import com.shop.fashion.security.UserDetailsImpl;
import com.shop.fashion.service.DanhGiaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class DanhGiaController {

    private final DanhGiaService danhGiaService;

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            return null;
        }
        return ((UserDetailsImpl) authentication.getPrincipal()).getId();
    }

    @PostMapping("/reviews")
    public ResponseEntity<?> createReview(@Valid @RequestBody ReviewRequest request) {
        try {
            Long userId = getCurrentUserId();
            if (userId == null) {
                return ResponseEntity.status(401).body(Map.of("message", "Vui lòng đăng nhập để đánh giá"));
            }

            DanhGia review = danhGiaService.createReview(userId, request);
            return ResponseEntity.ok(Map.of("message", "Đánh giá thành công!", "reviewId", review.getId()));
        } catch (RuntimeException e) {
            // Theo yêu cầu trả về 403 nếu chưa mua/không có quyền
            if (e.getMessage() != null && (e.getMessage().contains("không có quyền") || e.getMessage().contains("chưa mua"))) {
                return ResponseEntity.status(403).body(Map.of("message", e.getMessage()));
            }
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage() != null ? e.getMessage() : "Bad Request"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("message", "Lỗi: " + e.getMessage()));
        }
    }

    @GetMapping("/public/reviews/product/{productId}")
    public ResponseEntity<?> getProductReviews(@PathVariable Long productId) {
        try {
            return ResponseEntity.ok(danhGiaService.getProductReviews(productId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
