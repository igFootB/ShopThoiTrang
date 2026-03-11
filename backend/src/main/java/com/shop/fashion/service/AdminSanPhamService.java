package com.shop.fashion.service;

import com.shop.fashion.dto.request.CreateProductRequest;
import com.shop.fashion.entity.SanPham;

public interface AdminSanPhamService {
    SanPham createProduct(CreateProductRequest request);
    SanPham updateProduct(Long id, CreateProductRequest request);
    void softDeleteProduct(Long id);
    void hardDeleteProduct(Long id);
}
