package com.shop.fashion.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "product_images")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HinhAnhSanPham {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private SanPham sanPham;

    @Column(name = "duong_dan_anh", columnDefinition = "TEXT")
    private String duongDanAnh;

    @Column(name = "is_thumbnail")
    private Integer isThumbnail = 0;

    @Column(name = "mau_sac", length = 50)
    private String mauSac; // null = ảnh mặc định, "Đen"/"Trắng" = ảnh theo màu
}
