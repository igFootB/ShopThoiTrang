package com.shop.fashion.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationResponse {
    private Long id;
    private String tenSanPham;
    private BigDecimal gia;
    private String thumbnail;
    private Long categoryId;
    private String tenDanhMuc;
    private Float diemGoiY;
}
