package com.shop.fashion.controller.admin;

import com.shop.fashion.entity.Lookbook;
import com.shop.fashion.repository.LookbookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/lookbooks")
@CrossOrigin("*")
public class AdminLookbookController {

    @Autowired
    private LookbookRepository lookbookRepository;

    @GetMapping
    public ResponseEntity<?> getAllLookbooks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int limit) {

        Pageable pageable = PageRequest.of(page, limit, Sort.by("id").descending());
        Page<Lookbook> lookbookPage = lookbookRepository.findAll(pageable);

        Map<String, Object> response = new HashMap<>();
        response.put("content", lookbookPage.getContent());
        response.put("totalPages", lookbookPage.getTotalPages());
        response.put("totalElements", lookbookPage.getTotalElements());

        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<?> createLookbook(@RequestBody Lookbook lookbook) {
        if (lookbook.getHinhAnh() == null || lookbook.getHinhAnh().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Hình ảnh không được để trống");
        }

        if (lookbook.getTrangThai() == null) lookbook.setTrangThai(1);
        lookbook.setCreatedAt(LocalDateTime.now());

        Lookbook savedLookbook = lookbookRepository.save(lookbook);
        return ResponseEntity.ok(savedLookbook);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateLookbook(@PathVariable Long id, @RequestBody Lookbook lookbookDetails) {
        return lookbookRepository.findById((Long) id).map(existingData -> {
            Lookbook existing = (Lookbook) existingData;
            if (lookbookDetails.getMoTa() != null) existing.setMoTa(lookbookDetails.getMoTa());
            if (lookbookDetails.getHinhAnh() != null) existing.setHinhAnh(lookbookDetails.getHinhAnh());
            if (lookbookDetails.getDuongDan() != null) existing.setDuongDan(lookbookDetails.getDuongDan());
            if (lookbookDetails.getTrangThai() != null) existing.setTrangThai(lookbookDetails.getTrangThai());

            Lookbook updated = lookbookRepository.save(existing);
            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteLookbook(@PathVariable Long id) {
        return lookbookRepository.findById((Long) id).map(existingData -> {
            Lookbook existing = (Lookbook) existingData;
            lookbookRepository.delete(existing);
            return ResponseEntity.ok(Map.of("message", "Xóa lookbook thành công"));
        }).orElse(ResponseEntity.notFound().build());
    }
}
