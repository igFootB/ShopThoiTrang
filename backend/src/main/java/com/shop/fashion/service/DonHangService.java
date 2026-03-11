package com.shop.fashion.service;

import com.shop.fashion.entity.DonHang;
import com.shop.fashion.repository.DonHangRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DonHangService {

    private final DonHangRepository donHangRepository;

    private final com.shop.fashion.repository.NguoiDungRepository nguoiDungRepository;
    private final com.shop.fashion.repository.DiaChiGiaoHangRepository diaChiGiaoHangRepository;
    private final com.shop.fashion.repository.BienTheSanPhamRepository bienTheRepo;
    private final com.shop.fashion.repository.ChiTietGioHangRepository cartItemRepo;
    private final com.shop.fashion.repository.GioHangRepository gioHangRepository;
    private final com.shop.fashion.repository.MaGiamGiaRepository couponRepo;
    private final com.shop.fashion.repository.ChiTietDonHangRepository orderItemRepo;

    public List<DonHang> layDonHangTheoNguoiDung(Long nguoiDungId) {
        return donHangRepository.findByNguoiDungId(nguoiDungId);
    }

    public Optional<DonHang> layDonHangTheoId(Long id) {
        if (id == null) return Optional.empty();
        return donHangRepository.findById(id);
    }

    public DonHang luuDonHang(DonHang donHang) {
        if (donHang == null) {
            throw new IllegalArgumentException("Đơn hàng không được null");
        }
        return donHangRepository.save(donHang);
    }

    @org.springframework.transaction.annotation.Transactional(rollbackFor = Exception.class)
    public DonHang checkout(Long userId, com.shop.fashion.dto.request.CheckoutRequest request) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID không được null");
        }
        // 1. Lấy thông tin User và Address
        com.shop.fashion.entity.NguoiDung user = nguoiDungRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        if (request.getAddressId() == null) {
            throw new IllegalArgumentException("Địa chỉ giao hàng không được null");
        }
        Long addressId = request.getAddressId();
        com.shop.fashion.entity.DiaChiGiaoHang address = diaChiGiaoHangRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Địa chỉ không tồn tại"));

        // 2. Tạo đơn hàng dự thảo
        DonHang order = new DonHang();
        order.setNguoiDung(user);
        order.setDiaChiGiaoHang(address);
        order.setPhiVanChuyen(request.getPhiVanChuyen() != null ? request.getPhiVanChuyen() : java.math.BigDecimal.ZERO);
        order.setTrangThai("PENDING");

        java.math.BigDecimal tongTienHang = java.math.BigDecimal.ZERO;
        java.util.List<com.shop.fashion.entity.ChiTietDonHang> orderItems = new java.util.ArrayList<>();
        java.util.List<Long> cartItemIdsToRemove = new java.util.ArrayList<>();

        // 3. Xử lý từng Item trong danh sách mua
        for (com.shop.fashion.dto.request.CartItemRequest itemReq : request.getItems()) {
            if (itemReq.getVariantId() == null) {
                throw new IllegalArgumentException("Biến thể sản phẩm không được null");
            }
            Long variantId = itemReq.getVariantId();
            com.shop.fashion.entity.BienTheSanPham variant = bienTheRepo.findById(variantId)
                    .orElseThrow(() -> new RuntimeException("Biến thể sản phẩm không tồn tại: " + variantId));

            if (variant.getSoLuong() < itemReq.getSoLuong()) {
                throw new RuntimeException("Sản phẩm " + variant.getSanPham().getTenSanPham() + " (Size: " + variant.getSize() + ", Màu: " + variant.getMauSac() + ") không đủ số lượng. Tồn kho: " + variant.getSoLuong());
            }

            // Trừ tồn kho
            variant.setSoLuong(variant.getSoLuong() - itemReq.getSoLuong());
            bienTheRepo.save(variant);

            // Tạo chi tiết đơn hàng (Snapshot)
            com.shop.fashion.entity.ChiTietDonHang orderItem = new com.shop.fashion.entity.ChiTietDonHang();
            orderItem.setDonHang(order);
            orderItem.setBienTheSanPham(variant);
            orderItem.setTenSanPhamLucMua(variant.getSanPham().getTenSanPham());
            orderItem.setGiaLucMua(variant.getSanPham().getGia());
            orderItem.setMauSacLucMua(variant.getMauSac());
            orderItem.setSizeLucMua(variant.getSize());
            orderItem.setSoLuong(itemReq.getSoLuong());

            orderItems.add(orderItem);
            
            // Tính tổng tiền
            tongTienHang = tongTienHang.add(variant.getSanPham().getGia().multiply(java.math.BigDecimal.valueOf(itemReq.getSoLuong())));

            // Thu thập ID trong giỏ hàng để xóa
            gioHangRepository.findByNguoiDungId(userId).ifPresent(cart -> 
                cartItemRepo.findByGioHangIdAndBienTheSanPhamId(cart.getId(), variant.getId())
                .ifPresent(cartItem -> cartItemIdsToRemove.add(cartItem.getId()))
            );
        }

        // 4. Xử lý Coupon (nếu có)
        java.math.BigDecimal soTienGiam = java.math.BigDecimal.ZERO;
        if (request.getCouponId() != null) {
            Long couponId = request.getCouponId();
            com.shop.fashion.entity.MaGiamGia coupon = couponRepo.findById(couponId)
                    .orElseThrow(() -> new RuntimeException("Mã giảm giá không hợp lệ"));
                    
            java.time.LocalDateTime today = java.time.LocalDateTime.now();
            if (coupon.getNgayHetHan() != null && coupon.getNgayHetHan().isBefore(today)) {
                throw new RuntimeException("Mã giảm giá đã hết hạn");
            }

            // Check số lượng
            if (coupon.getSoLuongConLai() != null && coupon.getSoLuongConLai() <= 0) {
                 throw new RuntimeException("Mã giảm giá đã hết lượt sử dụng");
            }

            // Tính số tiền giảm (Giả định loaiGiamGia = PERCENT, giá trị giảm = % hoặc FIXED)
            if ("PERCENT".equals(coupon.getLoaiGiamGia()) && coupon.getGiaTriGiam() != null) {
               soTienGiam = tongTienHang.multiply(coupon.getGiaTriGiam()).divide(java.math.BigDecimal.valueOf(100));
            } else if ("FIXED".equals(coupon.getLoaiGiamGia()) && coupon.getGiaTriGiam() != null) {
               soTienGiam = coupon.getGiaTriGiam();
            }

            order.setMaGiamGia(coupon);
            
            // Trừ số lượng coupon
            if (coupon.getSoLuongConLai() != null) {
                coupon.setSoLuongConLai(coupon.getSoLuongConLai() - 1);
                couponRepo.save(coupon);
            }
        }

        order.setSoTienGiam(soTienGiam);
        order.setTongTien(tongTienHang.add(order.getPhiVanChuyen()).subtract(soTienGiam));

        // 5. Lưu Order và OrderItems
        DonHang savedOrder = donHangRepository.save(order);
        for (com.shop.fashion.entity.ChiTietDonHang oi : orderItems) {
            oi.setDonHang(savedOrder);
            orderItemRepo.save(oi);
        }

        // 6. Xóa các sản phẩm đã mua khỏi Giỏ Hàng
        if (!cartItemIdsToRemove.isEmpty()) {
            cartItemRepo.deleteAllByIdInBatchCustom(cartItemIdsToRemove);
        }

        return savedOrder;
    }
}
