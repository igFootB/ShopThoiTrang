package com.shop.fashion.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VariantRequest {
    @NotBlank(message = "Vui lòng nhập Size")
    private String size;

    @NotBlank(message = "Vui lòng nhập Màu Sắc")
    private String mauSac;

    @NotNull(message = "Vui lòng nhập số lượng")
    private Integer soLuong;
}
