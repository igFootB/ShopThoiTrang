package com.shop.fashion.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "coupons")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MaGiamGia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ma_giam_gia", length = 50, unique = true)
    private String maGiamGia;

    @Column(name = "loai_giam_gia", length = 20)
    private String loaiGiamGia;

    @Column(name = "gia_tri_giam")
    private BigDecimal giaTriGiam;

    @Column(name = "don_toi_thieu")
    private BigDecimal donToiThieu = BigDecimal.ZERO;

    @Column(name = "so_luong_con_lai")
    private Integer soLuongConLai;

    @Column(name = "ngay_het_han")
    private LocalDateTime ngayHetHan;

    @Column(name = "trang_thai")
    private Integer trangThai = 1;
}
