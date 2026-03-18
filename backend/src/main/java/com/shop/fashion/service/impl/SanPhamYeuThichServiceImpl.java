package com.shop.fashion.service.impl;

import com.shop.fashion.entity.NguoiDung;
import com.shop.fashion.entity.SanPham;
import com.shop.fashion.entity.SanPhamYeuThich;
import com.shop.fashion.repository.NguoiDungRepository;
import com.shop.fashion.repository.SanPhamRepository;
import com.shop.fashion.repository.SanPhamYeuThichRepository;
import com.shop.fashion.service.SanPhamYeuThichService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SanPhamYeuThichServiceImpl implements SanPhamYeuThichService {

    private final SanPhamYeuThichRepository sanPhamYeuThichRepository;
    private final SanPhamRepository sanPhamRepository;
    private final NguoiDungRepository nguoiDungRepository;

    @Override
    public List<SanPhamYeuThich> getWishlistByUserId(Long userId) {
        return sanPhamYeuThichRepository.findByNguoiDungId(userId);
    }

    @Override
    @Transactional
    public void addToWishlist(Long userId, Long productId) {
        if (isFavorite(userId, productId)) {
            return;
        }

        NguoiDung user = nguoiDungRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại."));
        SanPham product = sanPhamRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại."));

        SanPhamYeuThich favorite = new SanPhamYeuThich();
        favorite.setNguoiDung(user);
        favorite.setSanPham(product);
        sanPhamYeuThichRepository.save(favorite);
    }

    @Override
    @Transactional
    public void removeFromWishlist(Long userId, Long productId) {
        sanPhamYeuThichRepository.findByNguoiDungIdAndSanPhamId(userId, productId)
                .ifPresent(sanPhamYeuThichRepository::delete);
    }

    @Override
    public boolean isFavorite(Long userId, Long productId) {
        return sanPhamYeuThichRepository.findByNguoiDungIdAndSanPhamId(userId, productId).isPresent();
    }
}
