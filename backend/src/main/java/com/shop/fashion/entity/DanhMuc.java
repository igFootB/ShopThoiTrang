package com.shop.fashion.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DanhMuc {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ten_danh_muc", length = 100, nullable = false)
    private String tenDanhMuc;

    @Column(name = "mo_ta", columnDefinition = "TEXT")
    private String moTa;

    @Column(name = "trang_thai")
    private Integer trangThai = 1;

    // NAM, NU, UNISEX
    @Column(name = "gioi_tinh", length = 10)
    private String gioiTinh;

    @Column(name = "hinh_anh", columnDefinition = "TEXT")
    private String hinhAnh;

}
