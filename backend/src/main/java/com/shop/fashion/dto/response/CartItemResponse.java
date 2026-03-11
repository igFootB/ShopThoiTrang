package com.shop.fashion.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItemResponse {
    private Long id; // CartItem ID
    private Long productId;
    private String tenSanPham;
    private String hinhAnh; // Thumbnail
    private BigDecimal gia;
    
    private Long variantId;
    private String size;
    private String mauSac;
    
    private Integer soLuong;
}
