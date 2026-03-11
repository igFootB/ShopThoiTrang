package com.shop.fashion.controller;

import com.shop.fashion.dto.request.HanhViRequest;
import com.shop.fashion.entity.HanhViNguoiDung;
import com.shop.fashion.entity.NguoiDung;
import com.shop.fashion.entity.SanPham;
import com.shop.fashion.repository.HanhViNguoiDungRepository;
import com.shop.fashion.repository.NguoiDungRepository;
import com.shop.fashion.repository.SanPhamRepository;
import com.shop.fashion.security.UserDetailsImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/tracking")
@RequiredArgsConstructor
public class HanhViController {

    private final HanhViNguoiDungRepository hanhViNguoiDungRepository;
    private final NguoiDungRepository nguoiDungRepository;
    private final SanPhamRepository sanPhamRepository;

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            return null; // Có thể chưa đăng nhập
        }
        return ((UserDetailsImpl) authentication.getPrincipal()).getId();
    }

    @PostMapping("/behavior")
    public ResponseEntity<?> logBehavior(@Valid @RequestBody HanhViRequest request) {
        try {
            Long userId = getCurrentUserId();
            if (userId == null) {
                // Tracking behavior requires login for AI personalization
                return ResponseEntity.status(401).body(Map.of("message", "Vui lòng đăng nhập để lưu lịch sử"));
            }

            NguoiDung user = nguoiDungRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User không tồn tại"));

            SanPham product = sanPhamRepository.findById(request.getProductId())
                    .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));

            HanhViNguoiDung behavior = new HanhViNguoiDung();
            behavior.setNguoiDung(user);
            behavior.setSanPham(product);
            behavior.setLoaiHanhVi(request.getLoaiHanhVi());

            hanhViNguoiDungRepository.save(behavior);

            return ResponseEntity.ok(Map.of("message", "Đã lưu lịch sử hành vi"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi lưu hành vi: " + e.getMessage()));
        }
    }
}
