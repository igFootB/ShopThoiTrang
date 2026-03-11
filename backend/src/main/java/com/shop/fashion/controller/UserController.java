package com.shop.fashion.controller;

import com.shop.fashion.entity.NguoiDung;
import com.shop.fashion.repository.NguoiDungRepository;
import com.shop.fashion.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final NguoiDungRepository nguoiDungRepository;

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            throw new RuntimeException("Tài khoản chưa được xác thực");
        }
        return ((UserDetailsImpl) authentication.getPrincipal()).getId();
    }

    // Lấy thông tin cá nhân
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        try {
            Long userId = getCurrentUserId();
            NguoiDung user = nguoiDungRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User không tồn tại"));

            Map<String, Object> profile = new LinkedHashMap<>();
            profile.put("ten", user.getTen());
            profile.put("email", user.getEmail());
            profile.put("soDienThoai", user.getSoDienThoai() != null ? user.getSoDienThoai() : "");

            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // Cập nhật thông tin cá nhân
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> body) {
        try {
            Long userId = getCurrentUserId();
            NguoiDung user = nguoiDungRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User không tồn tại"));

            if (body.containsKey("ten")) {
                user.setTen(body.get("ten"));
            }
            if (body.containsKey("soDienThoai")) {
                user.setSoDienThoai(body.get("soDienThoai"));
            }

            nguoiDungRepository.save(user);

            return ResponseEntity.ok(Map.of("message", "Cập nhật thông tin thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
