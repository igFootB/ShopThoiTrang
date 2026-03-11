package com.shop.fashion.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cart_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChiTietGioHang {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "cart_id")
    private GioHang gioHang;

    @ManyToOne
    @JoinColumn(name = "variant_id")
    private BienTheSanPham bienTheSanPham;

    @Column(name = "so_luong")
    private Integer soLuong;
}
