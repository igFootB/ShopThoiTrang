package com.shop.fashion.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class CreateProductRequest {
    @NotBlank(message = "Tên sản phẩm không được để trống")
    private String tenSanPham;

    private String moTa;

    @NotNull(message = "Giá sản phẩm không được để trống")
    private BigDecimal gia;

    private Long danhMucId;
    // 1 - Hiển thị, 0 - Ẩn
    private Integer trangThai = 1;

    // Danh sách URL hình ảnh mặc định (ảnh đầu tiên là thumbnail, không gắn màu)
    private List<String> hinhAnh;

    // Danh sách ảnh theo từng màu sắc
    private List<ColorImageRequest> colorImages;

    // Danh sách các biến thể (size, màu)
    private List<VariantRequest> variants;

    @Data
    public static class ColorImageRequest {
        private String mauSac;
        private List<String> urls;
    }
}
