package com.shop.fashion.controller.admin;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.shop.fashion.entity.Banner;
import com.shop.fashion.repository.BannerRepository;

@RestController
@RequestMapping("/api/admin/banners")
@CrossOrigin("*")
public class AdminBannerController {

    @Autowired
    private BannerRepository bannerRepository;

    @GetMapping
    public ResponseEntity<?> getAllBanners(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int limit) {
        
        Pageable pageable = PageRequest.of(page, limit, Sort.by("id").descending());
        Page<Banner> bannerPage = bannerRepository.findAll(pageable);
        
        Map<String, Object> response = new HashMap<>();
        response.put("content", bannerPage.getContent());
        response.put("totalPages", bannerPage.getTotalPages());
        response.put("totalElements", bannerPage.getTotalElements());
        
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<?> createBanner(@RequestBody Banner banner) {
        if (banner.getHinhAnh() == null || banner.getHinhAnh().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Hình ảnh không được để trống");
        }
        
        if (banner.getTrangThai() == null) banner.setTrangThai(1);
        banner.setCreatedAt(LocalDateTime.now());
        
        Banner savedBanner = bannerRepository.save(banner);
        return ResponseEntity.ok(savedBanner);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateBanner(@PathVariable Long id, @RequestBody Banner bannerDetails) {
        return bannerRepository.findById(id).map(existing -> {
            if (bannerDetails.getTieuDe() != null) existing.setTieuDe(bannerDetails.getTieuDe());
            if (bannerDetails.getMoTa() != null) existing.setMoTa(bannerDetails.getMoTa());
            if (bannerDetails.getHinhAnh() != null) existing.setHinhAnh(bannerDetails.getHinhAnh());
            if (bannerDetails.getDuongDan() != null) existing.setDuongDan(bannerDetails.getDuongDan());
            if (bannerDetails.getTrangThai() != null) existing.setTrangThai(bannerDetails.getTrangThai());
            
            Banner updated = bannerRepository.save(existing);
            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBanner(@PathVariable Long id) {
        return bannerRepository.findById(id).map(existing -> {
            bannerRepository.delete(existing);
            return ResponseEntity.ok(Map.of("message", "Xóa banner thành công"));
        }).orElse(ResponseEntity.notFound().build());
    }
}
