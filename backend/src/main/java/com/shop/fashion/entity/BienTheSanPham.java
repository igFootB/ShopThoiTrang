package com.shop.fashion.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "product_variants")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BienTheSanPham {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private SanPham sanPham;

    @Column(name = "size", length = 10)
    private String size;

    @Column(name = "mau_sac", length = 50)
    private String mauSac;

    @Column(name = "so_luong")
    private Integer soLuong = 0;
}
