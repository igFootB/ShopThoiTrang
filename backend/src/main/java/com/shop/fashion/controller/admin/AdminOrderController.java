package com.shop.fashion.controller.admin;

import com.shop.fashion.entity.ChiTietDonHang;
import com.shop.fashion.entity.DonHang;
import com.shop.fashion.entity.ThanhToan;
import com.shop.fashion.repository.ChiTietDonHangRepository;
import com.shop.fashion.repository.DonHangRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final DonHangRepository donHangRepository;
    private final ChiTietDonHangRepository chiTietDonHangRepository;
    private final com.shop.fashion.repository.ThanhToanRepository thanhToanRepository;

    @GetMapping
    public ResponseEntity<?> getAllOrders() {
        try {
            List<DonHang> orders = donHangRepository.findAll();
            List<Map<String, Object>> result = orders.stream().map(o -> {
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("id", o.getId());
                map.put("maDonHang", "DH" + String.format("%05d", o.getId()));
                map.put("khachHang", o.getNguoiDung() != null ? o.getNguoiDung().getTen() : "—");
                map.put("ngayDat", o.getNgayTao());
                map.put("tongTien", o.getTongTien());
                map.put("trangThai", o.getTrangThai());
                map.put("phuongThucThanhToan", "COD"); // default
                return map;
            }).collect(Collectors.toList());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable Long id) {
        try {
            DonHang order = donHangRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại"));

            List<ChiTietDonHang> items = chiTietDonHangRepository.findByDonHangId(id);
            List<Map<String, Object>> itemDetails = items.stream().map(ct -> {
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("id", ct.getId());
                map.put("sanPhamTen", ct.getTenSanPhamLucMua());
                
                String hinhAnh = null;
                if (ct.getBienTheSanPham() != null && ct.getBienTheSanPham().getSanPham().getListHinhAnh() != null) {
                    hinhAnh = ct.getBienTheSanPham().getSanPham().getListHinhAnh().stream()
                            .filter(img -> img.getIsThumbnail() != null && img.getIsThumbnail() == 1)
                            .map(img -> img.getDuongDanAnh())
                            .findFirst()
                            .orElse(ct.getBienTheSanPham().getSanPham().getListHinhAnh().isEmpty() ? null : ct.getBienTheSanPham().getSanPham().getListHinhAnh().get(0).getDuongDanAnh());
                }
                map.put("hinhAnh", hinhAnh);
                
                map.put("mauSac", ct.getMauSacLucMua());
                map.put("kichThuoc", ct.getSizeLucMua());
                map.put("soLuong", ct.getSoLuong());
                map.put("donGia", ct.getGiaLucMua());
                map.put("thanhTien", ct.getGiaLucMua().multiply(java.math.BigDecimal.valueOf(ct.getSoLuong())));
                return map;
            }).collect(Collectors.toList());

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("id", order.getId());
            result.put("maDonHang", "DH" + String.format("%05d", order.getId()));
            result.put("khachHang", order.getNguoiDung() != null ? order.getNguoiDung().getTen() : "—");
            result.put("soDienThoai", order.getDiaChiGiaoHang() != null ? order.getDiaChiGiaoHang().getSoDienThoai() : "—");
            result.put("diaChi", order.getDiaChiGiaoHang() != null ? order.getDiaChiGiaoHang().getDiaChi() + ", " + order.getDiaChiGiaoHang().getThanhPho() : "—");
            result.put("ngayDat", order.getNgayTao());
            result.put("tongTien", order.getTongTien());
            result.put("trangThai", order.getTrangThai());
            
            String paymentMethod = "COD";
            Optional<ThanhToan> paymentOpt = thanhToanRepository.findByDonHangId(id);
            if (paymentOpt.isPresent()) {
                paymentMethod = paymentOpt.get().getPhuongThuc();
            }
            result.put("phuongThucThanhToan", paymentMethod);
            
            result.put("items", itemDetails);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            String newStatus = body.get("trangThai");
            DonHang order = donHangRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại"));
            order.setTrangThai(newStatus);
            donHangRepository.save(order);

            // Nếu trạng thái là "Hoàn thành", cập nhật trạng thái thanh toán sang SUCCESS
            if ("Hoàn thành".equalsIgnoreCase(newStatus)) {
                thanhToanRepository.findByDonHangId(id).ifPresent(p -> {
                    p.setTrangThai("SUCCESS");
                    p.setNgayThanhToan(java.time.LocalDateTime.now());
                    thanhToanRepository.save(p);
                });
            }

            return ResponseEntity.ok(Map.of("message", "Cập nhật trạng thái thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
