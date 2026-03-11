package com.shop.fashion.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChiTietDonHang {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "order_id")
    private DonHang donHang;

    @ManyToOne
    @JoinColumn(name = "variant_id")
    private BienTheSanPham bienTheSanPham;

    @Column(name = "ten_san_pham_luc_mua", length = 200)
    private String tenSanPhamLucMua;

    @Column(name = "mau_sac_luc_mua", length = 50)
    private String mauSacLucMua;

    @Column(name = "size_luc_mua", length = 10)
    private String sizeLucMua;

    @Column(name = "so_luong")
    private Integer soLuong;

    @Column(name = "gia_luc_mua")
    private BigDecimal giaLucMua;
}
