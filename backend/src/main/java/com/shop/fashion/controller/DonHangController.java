package com.shop.fashion.controller;

import com.shop.fashion.dto.request.CheckoutRequest;
import com.shop.fashion.entity.ChiTietDonHang;
import com.shop.fashion.entity.DonHang;
import com.shop.fashion.repository.ChiTietDonHangRepository;
import com.shop.fashion.security.UserDetailsImpl;
import com.shop.fashion.service.DonHangService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class DonHangController {

    private final DonHangService donHangService;
    private final com.shop.fashion.service.VNPAYService vnpayService;
    private final com.shop.fashion.repository.ThanhToanRepository thanhToanRepository;
    private final ChiTietDonHangRepository chiTietDonHangRepository;

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            throw new RuntimeException("Tài khoản chưa được xác thực");
        }
        return ((UserDetailsImpl) authentication.getPrincipal()).getId();
    }

    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(@Valid @RequestBody CheckoutRequest request, jakarta.servlet.http.HttpServletRequest httpRequest) {
        try {
            Long userId = getCurrentUserId();
            DonHang order = donHangService.checkout(userId, request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Đặt hàng thành công!");
            response.put("orderId", order.getId());
            response.put("tongTien", order.getTongTien());

            // Xử lý tạo thông tin thanh toán
            if ("VNPAY".equalsIgnoreCase(request.getPaymentMethod())) {
                String paymentUrl = vnpayService.createPaymentUrl(order, httpRequest);
                
                com.shop.fashion.entity.ThanhToan payment = new com.shop.fashion.entity.ThanhToan();
                payment.setDonHang(order);
                payment.setPhuongThuc("VNPAY");
                payment.setTrangThai("PENDING");
                thanhToanRepository.save(payment);

                response.put("paymentUrl", paymentUrl);
            } else {
                com.shop.fashion.entity.ThanhToan payment = new com.shop.fashion.entity.ThanhToan();
                payment.setDonHang(order);
                payment.setPhuongThuc("COD");
                payment.setTrangThai("PENDING"); // Sẽ thành SUCCESS khi giao hàng thành công
                thanhToanRepository.save(payment);
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Lỗi đặt hàng: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Lấy danh sách đơn hàng của user đang đăng nhập
    @GetMapping("/my-orders")
    public ResponseEntity<?> getMyOrders() {
        try {
            Long userId = getCurrentUserId();
            List<DonHang> orders = donHangService.layDonHangTheoNguoiDung(userId);
            List<Map<String, Object>> result = orders.stream().map(o -> {
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("id", o.getId());
                map.put("maDonHang", "DH" + String.format("%05d", o.getId()));
                map.put("ngayDat", o.getNgayTao());
                map.put("tongTien", o.getTongTien());
                map.put("trangThai", o.getTrangThai());
                return map;
            }).collect(Collectors.toList());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // Lấy chi tiết 1 đơn hàng (kèm order items)
    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderDetail(@PathVariable Long id) {
        try {
            Long userId = getCurrentUserId();
            DonHang order = donHangService.layDonHangTheoId(id)
                    .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại"));

            // Kiểm tra quyền sở hữu
            if (!order.getNguoiDung().getId().equals(userId)) {
                return ResponseEntity.status(403).body(Map.of("message", "Bạn không có quyền xem đơn hàng này"));
            }

            List<ChiTietDonHang> orderItems = chiTietDonHangRepository.findByDonHangId(id);

            List<Map<String, Object>> items = orderItems.stream().map(item -> {
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("id", item.getId());
                map.put("tenSanPham", item.getTenSanPhamLucMua());
                map.put("size", item.getSizeLucMua());
                map.put("mauSac", item.getMauSacLucMua());
                map.put("soLuong", item.getSoLuong());
                map.put("gia", item.getGiaLucMua());
                return map;
            }).collect(Collectors.toList());

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("id", order.getId());
            result.put("maDonHang", "DH" + String.format("%05d", order.getId()));
            result.put("ngayDat", order.getNgayTao());
            result.put("tongTien", order.getTongTien());
            result.put("trangThai", order.getTrangThai());
            result.put("items", items);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
