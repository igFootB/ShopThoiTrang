package com.shop.fashion.controller.admin;

import com.shop.fashion.entity.ThanhToan;
import com.shop.fashion.repository.ThanhToanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin/payments")
@RequiredArgsConstructor
public class AdminThanhToanController {

    private final ThanhToanRepository thanhToanRepository;

    @GetMapping
    public ResponseEntity<?> getAllPayments() {
        try {
            List<ThanhToan> payments = thanhToanRepository.findAll();
            List<Map<String, Object>> result = payments.stream().map(pt -> {
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("id", pt.getId());
                map.put("maGiaoDich", pt.getMaGiaoDich() != null ? pt.getMaGiaoDich() : "—");
                map.put("phuongThuc", pt.getPhuongThuc());
                map.put("trangThai", pt.getTrangThai());
                map.put("ngayThanhToan", pt.getNgayThanhToan());
                
                if (pt.getDonHang() != null) {
                    map.put("donHangId", pt.getDonHang().getId());
                    map.put("maDonHang", "DH" + String.format("%05d", pt.getDonHang().getId()));
                    map.put("tongTien", pt.getDonHang().getTongTien());
                    map.put("khachHang", pt.getDonHang().getNguoiDung() != null ? pt.getDonHang().getNguoiDung().getTen() : "—");
                } else {
                    map.put("maDonHang", "—");
                    map.put("tongTien", 0);
                    map.put("khachHang", "—");
                }
                return map;
            }).collect(Collectors.toList());
            
            // Sắp xếp ID giảm dần (mới nhất ở trên)
            result.sort((a, b) -> Long.compare((Long) b.get("id"), (Long) a.get("id")));

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
