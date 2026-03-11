package com.shop.fashion.controller.admin;

import com.shop.fashion.entity.DanhMuc;
import com.shop.fashion.service.DanhMucService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin/categories")
@RequiredArgsConstructor
public class AdminCategoryController {

    private final DanhMucService danhMucService;
    private final com.shop.fashion.repository.SanPhamRepository sanPhamRepository;

    // 1. Lấy tất cả danh mục
    @GetMapping
    public ResponseEntity<?> getAllCategories() {
        try {
            List<DanhMuc> categories = danhMucService.layTatCaDanhMuc();
            List<Map<String, Object>> result = categories.stream().map(c -> {
                long count = sanPhamRepository.countByDanhMucId(c.getId());
                return Map.<String, Object>of(
                        "id", c.getId(),
                        "tenDanhMuc", c.getTenDanhMuc(),
                        "moTa", c.getMoTa() != null ? c.getMoTa() : "",
                        "trangThai", c.getTrangThai(),
                        "gioiTinh", c.getGioiTinh() != null ? c.getGioiTinh() : "NAM",
                        "hinhAnh", c.getHinhAnh() != null ? c.getHinhAnh() : "",
                        "soLuongSanPham", count
                );
            }).toList();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi: " + e.getMessage()));
        }
    }

    // 2. Thêm mới danh mục
    @PostMapping
    public ResponseEntity<?> createCategory(@RequestBody DanhMuc request) {
        try {
            if (request.getTenDanhMuc() == null || request.getTenDanhMuc().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Tên danh mục không được để trống"));
            }
            // Mặc định luôn hoạt động khi tạo mới
            if (request.getTrangThai() == null) {
                request.setTrangThai(1);
            }
            // Mặc định giới tính
            if (request.getGioiTinh() == null || request.getGioiTinh().trim().isEmpty()) {
                request.setGioiTinh("NAM");
            }
            // Lưu hình ảnh nếu có
            if (request.getHinhAnh() != null && !request.getHinhAnh().trim().isEmpty()) {
                request.setHinhAnh(request.getHinhAnh().trim());
            }

            DanhMuc saved = danhMucService.luuDanhMuc(request);
            return ResponseEntity.ok(Map.of(
                    "message", "Thêm danh mục thành công",
                    "data", saved));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi: " + e.getMessage()));
        }
    }

    // 3. Cập nhật danh mục
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategory(@PathVariable Long id, @RequestBody DanhMuc request) {
        try {
            Optional<DanhMuc> exist = danhMucService.layDanhMucTheoId(id);
            if (exist.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Danh mục không tồn tại"));
            }

            DanhMuc category = exist.get();
            if (request.getTenDanhMuc() != null && !request.getTenDanhMuc().trim().isEmpty()) {
                category.setTenDanhMuc(request.getTenDanhMuc());
            }
            if (request.getMoTa() != null) {
                category.setMoTa(request.getMoTa());
            }
            if (request.getTrangThai() != null) {
                category.setTrangThai(request.getTrangThai());
            }
            if (request.getGioiTinh() != null && !request.getGioiTinh().trim().isEmpty()) {
                category.setGioiTinh(request.getGioiTinh());
            }
            if (request.getHinhAnh() != null) {
                category.setHinhAnh(request.getHinhAnh());
            }

            DanhMuc updated = danhMucService.luuDanhMuc(category);
            return ResponseEntity.ok(Map.of(
                    "message", "Cập nhật danh mục thành công",
                    "data", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi: " + e.getMessage()));
        }
    }

    // 4. Xóa / Ẩn danh mục (Soft delete)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        try {
            Optional<DanhMuc> exist = danhMucService.layDanhMucTheoId(id);
            if (exist.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Danh mục không tồn tại"));
            }

            DanhMuc category = exist.get();
            // Thay vì xóa cứng khỏi DB (ảnh hưởng khóa ngoại SP), ta chuyển trạng thái về 0
            // (ẩn)
            category.setTrangThai(0);
            danhMucService.luuDanhMuc(category);
            
            return ResponseEntity.ok(Map.of("message", "Đã ẩn danh mục thành công"));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi: " + e.getMessage()));
        }
    }

    // 5. Xóa Cứng danh mục (Hard delete)
    @DeleteMapping("/hard/{id}")
    public ResponseEntity<?> hardDeleteCategory(@PathVariable Long id) {
        try {
            Optional<DanhMuc> exist = danhMucService.layDanhMucTheoId(id);
            if (exist.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Danh mục không tồn tại"));
            }

            danhMucService.xoaDanhMucBangId(id);
            return ResponseEntity.ok(Map.of("message", "Đã xóa vĩnh viễn danh mục"));
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Không thể xóa danh mục này do vẫn còn Sản phẩm hoặc dữ liệu liên kết"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi: " + e.getMessage()));
        }
    }
}
