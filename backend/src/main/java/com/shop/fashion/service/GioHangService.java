package com.shop.fashion.service;

import com.shop.fashion.dto.request.AddToCartRequest;
import com.shop.fashion.dto.response.CartResponse;

public interface GioHangService {
    CartResponse getCartByUserId(Long userId);
    void addToCart(Long userId, AddToCartRequest request);
}
