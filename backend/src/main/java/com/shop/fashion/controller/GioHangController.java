package com.shop.fashion.controller;

import com.shop.fashion.dto.request.AddToCartRequest;
import com.shop.fashion.dto.response.CartResponse;
import com.shop.fashion.security.UserDetailsImpl;
import com.shop.fashion.service.GioHangService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class GioHangController {

    private final GioHangService gioHangService;

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            throw new RuntimeException("Tài khoản chưa được xác thực");
        }
        return ((UserDetailsImpl) authentication.getPrincipal()).getId();
    }

    @GetMapping
    public ResponseEntity<?> getCart() {
        try {
            Long userId = getCurrentUserId();
            CartResponse cartResponse = gioHangService.getCartByUserId(userId);
            return ResponseEntity.ok(cartResponse);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/add")
    public ResponseEntity<?> addToCart(@Valid @RequestBody AddToCartRequest request) {
        try {
            Long userId = getCurrentUserId();
            gioHangService.addToCart(userId, request);
            return ResponseEntity.ok(Map.of("message", "Đã thêm sản phẩm vào giỏ hàng thành công"));
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/remove/{variantId}")
    public ResponseEntity<?> removeFromCart(@PathVariable Long variantId) {
        try {
            Long userId = getCurrentUserId();
            gioHangService.removeFromCart(userId, variantId);
            return ResponseEntity.ok(Map.of("message", "Đã xoá sản phẩm khỏi giỏ hàng"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage() != null ? e.getMessage() : "Lỗi không xác định"));
        }
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateCartItem(@RequestBody Map<String, Object> payload) {
        try {
            Long userId = getCurrentUserId();
            Long variantId = Long.valueOf(payload.get("variantId").toString());
            Integer soLuong = Integer.valueOf(payload.get("soLuong").toString());
            gioHangService.updateCartItem(userId, variantId, soLuong);
            return ResponseEntity.ok(Map.of("message", "Cập nhật giỏ hàng thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage() != null ? e.getMessage() : "Lỗi không xác định"));
        }
    }
}
