package com.shop.fashion.service;

import com.shop.fashion.entity.SanPhamYeuThich;
import java.util.List;

public interface SanPhamYeuThichService {
    List<SanPhamYeuThich> getWishlistByUserId(Long userId);
    void addToWishlist(Long userId, Long productId);
    void removeFromWishlist(Long userId, Long productId);
    boolean isFavorite(Long userId, Long productId);
}
