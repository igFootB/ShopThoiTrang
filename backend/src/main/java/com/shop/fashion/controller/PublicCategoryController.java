package com.shop.fashion.controller;

import com.shop.fashion.entity.DanhMuc;
import com.shop.fashion.service.DanhMucService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class PublicCategoryController {

    private final DanhMucService danhMucService;

    @GetMapping
    public ResponseEntity<?> getActiveCategories() {
        try {
            // Trả về tất cả danh mục (bao gồm cả danh mục gốc dù trangThai = 0)
            // Frontend sẽ tự quản lý cấu trúc phân cấp cha-con
            List<DanhMuc> categories = danhMucService.layTatCaDanhMuc();
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }
}
