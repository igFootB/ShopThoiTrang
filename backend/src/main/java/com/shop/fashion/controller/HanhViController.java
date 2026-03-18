package com.shop.fashion.controller;

import com.shop.fashion.config.RabbitMQConfig;
import com.shop.fashion.dto.request.HanhViRequest;
import com.shop.fashion.entity.HanhViNguoiDung;
import com.shop.fashion.entity.NguoiDung;
import com.shop.fashion.entity.SanPham;
import com.shop.fashion.repository.HanhViNguoiDungRepository;
import com.shop.fashion.repository.NguoiDungRepository;
import com.shop.fashion.repository.SanPhamRepository;
import com.shop.fashion.security.UserDetailsImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/tracking")
@RequiredArgsConstructor
public class HanhViController {

    private final HanhViNguoiDungRepository hanhViNguoiDungRepository;
    private final NguoiDungRepository nguoiDungRepository;
    private final SanPhamRepository sanPhamRepository;
    private final RabbitTemplate rabbitTemplate;

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            return null;
        }
        return ((UserDetailsImpl) authentication.getPrincipal()).getId();
    }

    @PostMapping("/behavior")
    public ResponseEntity<?> logBehavior(@Valid @RequestBody HanhViRequest request) {
        try {
            Long userId = getCurrentUserId();
            if (userId == null) {
                return ResponseEntity.status(401).body(Map.of("message", "Vui lòng đăng nhập để lưu lịch sử"));
            }

            NguoiDung user = nguoiDungRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User không tồn tại"));

            SanPham product = sanPhamRepository.findById(request.getProductId())
                    .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));

            // Lưu hành vi vào DB
            HanhViNguoiDung behavior = new HanhViNguoiDung();
            behavior.setNguoiDung(user);
            behavior.setSanPham(product);
            behavior.setLoaiHanhVi(request.getLoaiHanhVi());
            hanhViNguoiDungRepository.save(behavior);

            // Nếu là ADD_TO_CART, PURCHASE, hoặc WISHLIST → publish event qua RabbitMQ
            String loai = request.getLoaiHanhVi();
            if ("ADD_TO_CART".equals(loai) || "PURCHASE".equals(loai) || "WISHLIST".equals(loai)) {
                publishBehaviorEvent(userId, request.getProductId(), loai);
            }

            return ResponseEntity.ok(Map.of("message", "Đã lưu lịch sử hành vi"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi lưu hành vi: " + e.getMessage()));
        }
    }

    /**
     * Publish event tới RabbitMQ để Python AI service re-predict real-time
     */
    private void publishBehaviorEvent(Long userId, Long productId, String loaiHanhVi) {
        try {
            Map<String, Object> event = Map.of(
                    "userId", userId,
                    "productId", productId,
                    "loaiHanhVi", loaiHanhVi
            );
            rabbitTemplate.convertAndSend(RabbitMQConfig.BEHAVIOR_QUEUE, event);
            log.info("Đã publish event RabbitMQ: user={}, product={}, behavior={}", userId, productId, loaiHanhVi);
        } catch (Exception e) {
            log.warn("Không thể gửi event RabbitMQ (bỏ qua): {}", e.getMessage());
        }
    }
}
