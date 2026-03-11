package com.shop.fashion.controller.admin;

import com.shop.fashion.entity.BienTheSanPham;
import com.shop.fashion.entity.SanPham;
import com.shop.fashion.repository.BienTheSanPhamRepository;
import com.shop.fashion.repository.SanPhamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin/products/{productId}/variants")
@RequiredArgsConstructor
public class AdminProductVariantController {

    private final BienTheSanPhamRepository bienTheSanPhamRepository;
    private final SanPhamRepository sanPhamRepository;

    // 1. Liệt kê tất cả biến thể của 1 sản phẩm
    @GetMapping
    public ResponseEntity<?> getVariantsByProduct(@PathVariable Long productId) {
        try {
            List<BienTheSanPham> variants = bienTheSanPhamRepository.findBySanPhamId(productId);
            // Để tránh lỗi vòng lặp JSON (Circular Reference), ta chỉ gọn data
            List<Map<String, Object>> result = variants.stream().map(v -> {
                Map<String, Object> map = new java.util.HashMap<>();
                map.put("id", v.getId());
                map.put("size", v.getSize());
                map.put("mauSac", v.getMauSac());
                map.put("soLuong", v.getSoLuong());
                return map;
            }).collect(java.util.stream.Collectors.toList());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi: " + e.getMessage()));
        }
    }

    // 2. Thêm mới 1 biến thể (Size/Màu) vào Kho
    @PostMapping
    public ResponseEntity<?> addVariant(@PathVariable("productId") Long productId,
            @RequestBody Map<String, Object> body) {
        try {
            if (productId == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "ID sản phẩm không hợp lệ"));
            }
            SanPham product = sanPhamRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));

            String size = (String) body.get("size");
            String mauSac = (String) body.get("mauSac");
            Integer soLuong = (Integer) body.get("soLuong");

            if (size == null || size.trim().isEmpty() || mauSac == null || mauSac.trim().isEmpty()) {
                throw new RuntimeException("Size và Màu sắc không được để trống");
            }
            if (soLuong == null)
                soLuong = 0;

            BienTheSanPham variant = new BienTheSanPham();
            variant.setSanPham(product);
            variant.setSize(size);
            variant.setMauSac(mauSac);
            variant.setSoLuong(soLuong);

            bienTheSanPhamRepository.save(variant);

            return ResponseEntity.ok(Map.of("message", "Đã thêm biến thể mới thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // 3. Cập nhật Số lượng Tồn kho của 1 Biến thể
    @PutMapping("/{variantId}")
    public ResponseEntity<?> updateVariantQuantity(@PathVariable("productId") Long productId,
            @PathVariable("variantId") Long variantId, @RequestBody Map<String, Integer> body) {
        try {
            if (productId == null || variantId == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "ID không hợp lệ"));
            }
            BienTheSanPham variant = bienTheSanPhamRepository.findById(variantId)
                    .orElseThrow(() -> new RuntimeException("Biến thể không tồn tại"));

            // Xac nhận biến thể thuộc về sản phẩm
            if (!variant.getSanPham().getId().equals(productId)) {
                throw new RuntimeException("Biến thể không khớp với Sản phẩm");
            }

            Integer newQty = body.get("soLuong");
            if (newQty != null && newQty >= 0) {
                variant.setSoLuong(newQty);
                bienTheSanPhamRepository.save(variant);
            }

            return ResponseEntity.ok(Map.of("message", "Cập nhật số lượng thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // 4. Xóa luôn 1 biến thể (Hard delete)
    @DeleteMapping("/{variantId}")
    public ResponseEntity<?> deleteVariant(@PathVariable("productId") Long productId,
            @PathVariable("variantId") Long variantId) {
        try {
            if (productId == null || variantId == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "ID không hợp lệ"));
            }
            BienTheSanPham variant = bienTheSanPhamRepository.findById(variantId)
                    .orElseThrow(() -> new RuntimeException("Biến thể không tồn tại"));

            // Xac nhận biến thể thuộc về sản phẩm
            if (!variant.getSanPham().getId().equals(productId)) {
                throw new RuntimeException("Biến thể không khớp với Sản phẩm");
            }

            bienTheSanPhamRepository.delete(variant);
            return ResponseEntity.ok(Map.of("message", "Đã xóa biến thể thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
