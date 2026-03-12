package com.shop.fashion.controller.publics;

import com.shop.fashion.entity.MaGiamGia;
import com.shop.fashion.service.MaGiamGiaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/public/coupons")
@RequiredArgsConstructor
public class PublicCouponController {

    private final MaGiamGiaService maGiamGiaService;

    @GetMapping("/check")
    public ResponseEntity<?> checkCoupon(@RequestParam String code, @RequestParam(required = false, defaultValue = "0") java.math.BigDecimal total) {
        try {
            Optional<MaGiamGia> couponOpt = maGiamGiaService.kiemTraMaGiamGia(code);
            if (couponOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Mã giảm giá không tồn tại"));
            }
            
            MaGiamGia coupon = couponOpt.get();
            LocalDateTime today = LocalDateTime.now();
            
            if (coupon.getTrangThai() != 1) {
                return ResponseEntity.badRequest().body(Map.of("message", "Mã giảm giá không còn hoạt động"));
            }
            
            if (coupon.getNgayHetHan() != null && coupon.getNgayHetHan().isBefore(today)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Mã giảm giá đã hết hạn"));
            }
            if (coupon.getSoLuongConLai() != null && coupon.getSoLuongConLai() <= 0) {
                return ResponseEntity.badRequest().body(Map.of("message", "Mã giảm giá đã hết số lượt sử dụng"));
            }
            if (coupon.getDonToiThieu() != null && total.compareTo(coupon.getDonToiThieu()) < 0) {
                return ResponseEntity.badRequest().body(Map.of("message", "Đơn hàng chưa đạt giá trị tối thiểu " + coupon.getDonToiThieu() + "đ để sử dụng mã này"));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("id", coupon.getId());
            response.put("maGiamGia", coupon.getMaGiamGia());
            response.put("loaiGiamGia", coupon.getLoaiGiamGia());
            response.put("giaTriGiam", coupon.getGiaTriGiam());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi kiểm tra mã giảm giá: " + e.getMessage()));
        }
    }
}
