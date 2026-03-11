package com.shop.fashion.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ImageResponse {
    private Long id;
    private String duongDanAnh;
    private Integer isThumbnail;
    private String mauSac;
}
