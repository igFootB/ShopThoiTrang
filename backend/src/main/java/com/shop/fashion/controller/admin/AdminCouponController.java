package com.shop.fashion.controller.admin;

import com.shop.fashion.entity.MaGiamGia;
import com.shop.fashion.repository.MaGiamGiaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin/coupons")
@RequiredArgsConstructor
public class AdminCouponController {

    private final MaGiamGiaRepository maGiamGiaRepository;

    // 1. Lấy tất cả mã giảm giá
    @GetMapping
    public ResponseEntity<?> getAllCoupons() {
        try {
            List<MaGiamGia> coupons = maGiamGiaRepository.findAll();
            return ResponseEntity.ok(coupons);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // 2. Thêm mới mã giảm giá
    @PostMapping
    public ResponseEntity<?> createCoupon(@RequestBody MaGiamGia req) {
        try {
            if (req.getMaGiamGia() == null || req.getMaGiamGia().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Mã code không được trống"));
            }
            if (req.getGiaTriGiam() == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Giá trị giảm không được trống"));
            }

            // Check trùng mã
            Optional<MaGiamGia> existCode = maGiamGiaRepository.findByMaGiamGia(req.getMaGiamGia());
            if (existCode.isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Mã giảm giá này đã tồn tại"));
            }

            if (req.getTrangThai() == null) {
                req.setTrangThai(1);
            }

            MaGiamGia saved = maGiamGiaRepository.save(req);
            return ResponseEntity.ok(Map.of("message", "Tạo khuyến mãi thành công", "data", saved));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi: " + e.getMessage()));
        }
    }

    // 3. Cập nhật mã giảm giá
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCoupon(@PathVariable Long id, @RequestBody MaGiamGia req) {
        try {
            if (id == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "ID không hợp lệ"));
            }
            Optional<MaGiamGia> existOpt = maGiamGiaRepository.findById(id);
            if (existOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Mã không tồn tại"));
            }

            MaGiamGia exist = existOpt.get();
            if (req.getGiaTriGiam() != null)
                exist.setGiaTriGiam(req.getGiaTriGiam());
            if (req.getDonToiThieu() != null)
                exist.setDonToiThieu(req.getDonToiThieu());
            if (req.getSoLuongConLai() != null)
                exist.setSoLuongConLai(req.getSoLuongConLai());
            if (req.getNgayHetHan() != null)
                exist.setNgayHetHan(req.getNgayHetHan());
            if (req.getTrangThai() != null)
                exist.setTrangThai(req.getTrangThai());

            @SuppressWarnings("null")
            MaGiamGia nonNullExist = exist;
            MaGiamGia updated = maGiamGiaRepository.save(nonNullExist);
            return ResponseEntity.ok(Map.of("message", "Cập nhật thành công", "data", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi: " + e.getMessage()));
        }
    }

    // 4. Xóa / Ẩn mã giảm giá
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCoupon(@PathVariable("id") Long id) {
        try {
            if (id == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "ID không hợp lệ"));
            }
            Optional<MaGiamGia> existOpt = maGiamGiaRepository.findById(id);
            if (existOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Mã không tồn tại"));
            }

            MaGiamGia exist = existOpt.get();
            exist.setTrangThai(0); // Soft delete (hủy bỏ)

            @SuppressWarnings("null")
            MaGiamGia nonNullExist = exist;
            maGiamGiaRepository.save(nonNullExist);

            return ResponseEntity.ok(Map.of("message", "Đã ẩn mã giảm giá thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi: " + e.getMessage()));
        }
    }
}
