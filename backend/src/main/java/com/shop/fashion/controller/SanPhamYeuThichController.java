package com.shop.fashion.controller;

import com.shop.fashion.entity.SanPhamYeuThich;
import com.shop.fashion.security.UserDetailsImpl;
import com.shop.fashion.service.SanPhamYeuThichService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class SanPhamYeuThichController {

    private final SanPhamYeuThichService sanPhamYeuThichService;

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            throw new RuntimeException("Tài khoản chưa được xác thực");
        }
        return ((UserDetailsImpl) authentication.getPrincipal()).getId();
    }

    @GetMapping
    public ResponseEntity<?> getWishlist() {
        try {
            Long userId = getCurrentUserId();
            List<SanPhamYeuThich> wishlist = sanPhamYeuThichService.getWishlistByUserId(userId);
            return ResponseEntity.ok(wishlist);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/add/{productId}")
    public ResponseEntity<?> addToWishlist(@PathVariable Long productId) {
        try {
            Long userId = getCurrentUserId();
            sanPhamYeuThichService.addToWishlist(userId, productId);
            return ResponseEntity.ok(Map.of("message", "Đã thêm vào danh sách yêu thích"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<?> removeFromWishlist(@PathVariable Long productId) {
        try {
            Long userId = getCurrentUserId();
            sanPhamYeuThichService.removeFromWishlist(userId, productId);
            return ResponseEntity.ok(Map.of("message", "Đã xóa khỏi danh sách yêu thích"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/check/{productId}")
    public ResponseEntity<?> checkFavorite(@PathVariable Long productId) {
        try {
            Long userId = getCurrentUserId();
            boolean isFavorite = sanPhamYeuThichService.isFavorite(userId, productId);
            return ResponseEntity.ok(Map.of("isFavorite", isFavorite));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("isFavorite", false));
        }
    }
}
