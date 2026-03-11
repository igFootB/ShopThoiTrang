package com.shop.fashion.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class CheckoutRequest {

    @NotNull(message = "Vui lòng chọn địa chỉ giao hàng")
    private Long addressId;

    private Long couponId;

    private BigDecimal phiVanChuyen = BigDecimal.ZERO;

    @NotEmpty(message = "Giỏ hàng không được để trống")
    @Valid
    private List<CartItemRequest> items;

    private String paymentMethod = "COD"; // Mặc định là thanh toán khi nhận hàng
}
