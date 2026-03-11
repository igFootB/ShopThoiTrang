package com.shop.fashion.controller.admin;

import com.shop.fashion.dto.request.CreateProductRequest;
import com.shop.fashion.entity.SanPham;
import com.shop.fashion.service.AdminSanPhamService;
import com.shop.fashion.service.SanPhamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
public class AdminProductController {

    private final AdminSanPhamService adminSanPhamService;
    private final SanPhamService sanPhamService; // Sử dụng để lấy danh sách

    @GetMapping
    public ResponseEntity<?> getAllProductsForAdmin() {
        // Admin lấy tất cả sản phẩm
        try {
           return ResponseEntity.ok(sanPhamService.layTatCaSanPham()); 
        } catch (Exception e) {
           return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createProduct(@Valid @RequestBody CreateProductRequest request) {
        try {
            SanPham product = adminSanPhamService.createProduct(request);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Thêm sản phẩm thành công");
            response.put("productId", product.getId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @Valid @RequestBody CreateProductRequest request) {
        try {
            SanPham product = adminSanPhamService.updateProduct(id, request);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Cập nhật sản phẩm thành công");
            response.put("productId", product.getId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        try {
            adminSanPhamService.softDeleteProduct(id);
            return ResponseEntity.ok(Map.of("message", "Xóa sản phẩm thành công (Soft Delete)"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi: " + e.getMessage()));
        }
    }

    @DeleteMapping("/hard/{id}")
    public ResponseEntity<?> hardDeleteProduct(@PathVariable Long id) {
        try {
            adminSanPhamService.hardDeleteProduct(id);
            return ResponseEntity.ok(Map.of("message", "Đã xóa vĩnh viễn sản phẩm"));
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Không thể xóa sản phẩm này do đã phát sinh giao dịch/đơn hàng. Bạn chỉ có thể ẩn sản phẩm!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi: " + e.getMessage()));
        }
    }
}
