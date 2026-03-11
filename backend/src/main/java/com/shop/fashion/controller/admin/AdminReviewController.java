package com.shop.fashion.controller.admin;

import com.shop.fashion.entity.DanhGia;
import com.shop.fashion.repository.DanhGiaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin/reviews")
@RequiredArgsConstructor
public class AdminReviewController {

    private final DanhGiaRepository danhGiaRepository;

    // 1. Lấy tất cả đánh giá
    @GetMapping
    public ResponseEntity<?> getAllReviews() {
        try {
            List<DanhGia> reviews = danhGiaRepository.findAll();
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // 2. Xóa đánh giá (Hard Delete luôn vì không có trường trang_thai trong DB)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReview(@PathVariable("id") Long id) {
        try {
            if (id == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "ID không hợp lệ"));
            }
            Optional<DanhGia> exist = danhGiaRepository.findById(id);
            if (exist.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Đánh giá không tồn tại"));
            }
            danhGiaRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Đã xóa đánh giá thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi: " + e.getMessage()));
        }
    }
}
