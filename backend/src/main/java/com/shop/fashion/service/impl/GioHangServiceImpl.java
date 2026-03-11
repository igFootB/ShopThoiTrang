package com.shop.fashion.service.impl;

import com.shop.fashion.dto.request.AddToCartRequest;
import com.shop.fashion.dto.response.CartItemResponse;
import com.shop.fashion.dto.response.CartResponse;
import com.shop.fashion.entity.*;
import com.shop.fashion.repository.*;
import com.shop.fashion.service.GioHangService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GioHangServiceImpl implements GioHangService {

    private final GioHangRepository gioHangRepository;
    private final ChiTietGioHangRepository chiTietGioHangRepository;
    private final NguoiDungRepository nguoiDungRepository;
    private final BienTheSanPhamRepository bienTheSanPhamRepository;
    private final HinhAnhSanPhamRepository hinhAnhSanPhamRepository;

    @Override
    public CartResponse getCartByUserId(Long userId) {
        GioHang cart = gioHangRepository.findByNguoiDungId(userId)
                .orElse(null);

        if (cart == null) {
            return new CartResponse(null, List.of(), BigDecimal.ZERO);
        }

        List<ChiTietGioHang> items = chiTietGioHangRepository.findByGioHangId(cart.getId());

        BigDecimal total = BigDecimal.ZERO;
        List<CartItemResponse> itemResponses = items.stream().map(item -> {
            BienTheSanPham variant = item.getBienTheSanPham();
            SanPham product = variant.getSanPham();

            String thumbnailUrl = hinhAnhSanPhamRepository.findBySanPhamId(product.getId())
                    .stream().filter(img -> img.getIsThumbnail() != null && img.getIsThumbnail() == 1)
                    .map(HinhAnhSanPham::getDuongDanAnh)
                    .findFirst().orElse(null);

            CartItemResponse response = new CartItemResponse();
            response.setId(item.getId());
            response.setProductId(product.getId());
            response.setTenSanPham(product.getTenSanPham());
            response.setHinhAnh(thumbnailUrl);
            response.setGia(product.getGia());
            response.setVariantId(variant.getId());
            response.setSize(variant.getSize());
            response.setMauSac(variant.getMauSac());
            response.setSoLuong(item.getSoLuong());
            
            return response;
        }).collect(Collectors.toList());

        for (CartItemResponse res : itemResponses) {
            total = total.add(res.getGia().multiply(BigDecimal.valueOf(res.getSoLuong())));
        }

        return new CartResponse(cart.getId(), itemResponses, total);
    }

    @Override
    @Transactional
    public void addToCart(Long userId, AddToCartRequest request) {
        // 1. Kiểm tra User và Giỏ hàng, nếu chưa có thì tạo mới
        GioHang cart = gioHangRepository.findByNguoiDungId(userId).orElseGet(() -> {
            NguoiDung user = nguoiDungRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại."));
            GioHang newCart = new GioHang();
            newCart.setNguoiDung(user);
            return gioHangRepository.save(newCart);
        });

        // 2. Tìm biến thể sản phẩm & kiểm tra tồn kho
        BienTheSanPham variant = bienTheSanPhamRepository.findById(request.getVariantId())
                .orElseThrow(() -> new RuntimeException("Biến thể sản phẩm không tồn tại."));

        if (variant.getSoLuong() < request.getSoLuong()) {
            throw new RuntimeException("Lỗi: Số lượng sản phẩm trong kho không đủ. Chỉ còn " + variant.getSoLuong() + " sản phẩm.");
        }

        // 3. Tìm xem trong giỏ đã có biến thể này chưa
        ChiTietGioHang item = chiTietGioHangRepository.findByGioHangIdAndBienTheSanPhamId(cart.getId(), variant.getId())
                .orElse(null);

        if (item != null) {
            // Đã có -> cộng dồn số lượng
            int totalQuantity = item.getSoLuong() + request.getSoLuong();
            if (variant.getSoLuong() < totalQuantity) {
               throw new RuntimeException("Lỗi: Tổng số lượng vượt quá số lượng tồn kho. Kho còn: " + variant.getSoLuong());
            }
            item.setSoLuong(totalQuantity);
        } else {
            // Chưa có -> thêm mới
            item = new ChiTietGioHang();
            item.setGioHang(cart);
            item.setBienTheSanPham(variant);
            item.setSoLuong(request.getSoLuong());
        }

        chiTietGioHangRepository.save(item);
    }
}
