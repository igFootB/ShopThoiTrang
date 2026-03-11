package com.shop.fashion.controller;

import com.shop.fashion.dto.request.AddressRequest;
import com.shop.fashion.entity.DiaChiGiaoHang;
import com.shop.fashion.security.UserDetailsImpl;
import com.shop.fashion.service.DiaChiGiaoHangService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final DiaChiGiaoHangService diaChiService;

    // Helper method để lấy User ID từ JWT
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            throw new RuntimeException("Tài khoản chưa được xác thực");
        }
        return ((UserDetailsImpl) authentication.getPrincipal()).getId();
    }

    // Lấy danh sách địa chỉ của user đang đăng nhập
    @GetMapping
    public ResponseEntity<?> getAllAddresses() {
        try {
            Long userId = getCurrentUserId();
            List<DiaChiGiaoHang> addresses = diaChiService.getAllAddressesByUserId(userId);
            return ResponseEntity.ok(addresses);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Thêm địa chỉ mới
    @PostMapping
    public ResponseEntity<?> addAddress(@Valid @RequestBody AddressRequest request) {
        try {
            Long userId = getCurrentUserId();
            DiaChiGiaoHang newAddress = diaChiService.addAddress(userId, request);
            return ResponseEntity.ok(newAddress);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Thiết lập địa chỉ mặc định
    @PutMapping("/{id}/default")
    public ResponseEntity<?> setDefaultAddress(@PathVariable("id") Long addressId) {
        try {
            Long userId = getCurrentUserId();
            DiaChiGiaoHang updatedAddress = diaChiService.setDefaultAddress(userId, addressId);
            return ResponseEntity.ok(updatedAddress);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    // Xoá địa chỉ
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAddress(@PathVariable("id") Long addressId) {
        try {
             Long userId = getCurrentUserId();
             diaChiService.deleteAddress(userId, addressId);
             Map<String, String> response = new HashMap<>();
             response.put("message", "Xóa địa chỉ thành công");
             return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
