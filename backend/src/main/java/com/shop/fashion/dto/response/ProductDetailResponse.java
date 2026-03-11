package com.shop.fashion.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductDetailResponse {
    private Long id;
    private String tenSanPham;
    private String moTa;
    private BigDecimal gia;
    private Long categoryId;
    private Integer trangThai;
    private List<ImageResponse> images;
    private List<VariantResponse> variants;
}
