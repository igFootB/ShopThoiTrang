package com.shop.fashion.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class HanhViRequest {
    @NotNull(message = "ID sản phẩm không được trống")
    private Long productId;

    @NotBlank(message = "Loại hành vi không được trống (VIEW, ADD_TO_CART, ...)")
    private String loaiHanhVi;
}
