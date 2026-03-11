package com.shop.fashion.controller;

import com.shop.fashion.entity.DonHang;
import com.shop.fashion.repository.DonHangRepository;
import com.shop.fashion.service.VNPAYService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final VNPAYService vnpayService;
    private final DonHangRepository donHangRepository;
    private final com.shop.fashion.repository.ThanhToanRepository thanhToanRepository;

    @GetMapping("/vnpay-return")
    public ResponseEntity<?> vnpayReturn(HttpServletRequest request) {
        Map<String, String> vnp_Params = new HashMap<>();
        Map<String, String[]> requestParams = request.getParameterMap();
        for (Map.Entry<String, String[]> entry : requestParams.entrySet()) {
            vnp_Params.put(entry.getKey(), entry.getValue()[0]);
        }

        boolean isValid = vnpayService.verifyPayment(vnp_Params);
        if (isValid) {
            String vnp_ResponseCode = vnp_Params.get("vnp_ResponseCode");
            String vnp_TxnRef = vnp_Params.get("vnp_TxnRef");
            String vnp_TransactionNo = vnp_Params.get("vnp_TransactionNo");
            
            Long orderId = Long.parseLong(vnp_TxnRef.split("_")[0]);

            if ("00".equals(vnp_ResponseCode)) {
                // Prompt 8.1: Cập nhật đơn hàng thành PROCESSING
                donHangRepository.findById(orderId).ifPresent(order -> {
                    order.setTrangThai("PROCESSING");
                    donHangRepository.save(order);

                    // Cập nhật bản ghi thanh toán sang SUCCESS
                    thanhToanRepository.findByDonHangId(orderId).ifPresent(pt -> {
                        pt.setTrangThai("SUCCESS");
                        pt.setMaGiaoDich(vnp_TransactionNo);
                        pt.setNgayThanhToan(java.time.LocalDateTime.now());
                        thanhToanRepository.save(pt);
                    });
                });
                return org.springframework.http.ResponseEntity
                        .status(org.springframework.http.HttpStatus.FOUND)
                        .location(java.net.URI.create("http://localhost:3000/"))
                        .build();
            } else {
                // Thất bại
                thanhToanRepository.findByDonHangId(orderId).ifPresent(pt -> {
                    pt.setTrangThai("FAILED");
                    thanhToanRepository.save(pt);
                });
                return org.springframework.http.ResponseEntity
                        .status(org.springframework.http.HttpStatus.FOUND)
                        .location(java.net.URI.create("http://localhost:3000/cart?error=payment_failed"))
                        .build();
            }
        } else {
            return org.springframework.http.ResponseEntity
                    .status(org.springframework.http.HttpStatus.FOUND)
                    .location(java.net.URI.create("http://localhost:3000/cart?error=invalid_signature"))
                    .build();
        }
    }

    @GetMapping("/vnpay-ipn")
    public ResponseEntity<?> vnpayIPN(HttpServletRequest request) {
        Map<String, String> vnp_Params = new HashMap<>();
        Map<String, String[]> requestParams = request.getParameterMap();
        for (Map.Entry<String, String[]> entry : requestParams.entrySet()) {
            vnp_Params.put(entry.getKey(), entry.getValue()[0]);
        }

        boolean isValid = vnpayService.verifyPayment(vnp_Params);
        if (isValid) {
            String vnp_ResponseCode = vnp_Params.get("vnp_ResponseCode");
            String vnp_TxnRef = vnp_Params.get("vnp_TxnRef");
            String vnp_TransactionNo = vnp_Params.get("vnp_TransactionNo");
            Long orderId = Long.parseLong(vnp_TxnRef.split("_")[0]);

            DonHang order = donHangRepository.findById(orderId).orElse(null);
            if (order == null) {
                return ResponseEntity.ok(Map.of("RspCode", "01", "Message", "Order not found"));
            }

            long amount = Long.parseLong(vnp_Params.get("vnp_Amount")) / 100;
            if (order.getTongTien().longValue() != amount) {
                return ResponseEntity.ok(Map.of("RspCode", "04", "Message", "Invalid amount"));
            }

            // Prompt 8.1: Cập nhật thành SUCCESS và PROCESSING
            if ("00".equals(vnp_ResponseCode)) {
                if ("PENDING".equals(order.getTrangThai())) {
                    order.setTrangThai("PROCESSING");
                    donHangRepository.save(order);

                    thanhToanRepository.findByDonHangId(orderId).ifPresent(pt -> {
                        pt.setTrangThai("SUCCESS");
                        pt.setMaGiaoDich(vnp_TransactionNo);
                        pt.setNgayThanhToan(java.time.LocalDateTime.now());
                        thanhToanRepository.save(pt);
                    });
                }
            } else {
                thanhToanRepository.findByDonHangId(orderId).ifPresent(pt -> {
                    pt.setTrangThai("FAILED");
                    thanhToanRepository.save(pt);
                });
                // Nếu thanh toán thất bại, có thể giữ PENDING hoặc CANCELLED
                order.setTrangThai("CANCELLED");
                donHangRepository.save(order);
            }

            return ResponseEntity.ok(Map.of("RspCode", "00", "Message", "Confirm Success"));
        } else {
            return ResponseEntity.ok(Map.of("RspCode", "97", "Message", "Invalid Checksum"));
        }
    }
}
