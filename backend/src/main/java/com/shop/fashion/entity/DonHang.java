package com.shop.fashion.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DonHang {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private NguoiDung nguoiDung;

    @ManyToOne
    @JoinColumn(name = "address_id")
    private DiaChiGiaoHang diaChiGiaoHang;

    @ManyToOne
    @JoinColumn(name = "coupon_id")
    private MaGiamGia maGiamGia;

    @Column(name = "phi_van_chuyen")
    private BigDecimal phiVanChuyen = BigDecimal.ZERO;

    @Column(name = "so_tien_giam")
    private BigDecimal soTienGiam = BigDecimal.ZERO;

    @Column(name = "tong_tien")
    private BigDecimal tongTien;

    @Column(name = "trang_thai", length = 50)
    private String trangThai = "PENDING";

    @Column(name = "ngay_tao", updatable = false)
    private LocalDateTime ngayTao;

    @Column(name = "ngay_cap_nhat")
    private LocalDateTime ngayCapNhat;

    @PrePersist
    protected void onCreate() {
        ngayTao = LocalDateTime.now();
        ngayCapNhat = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        ngayCapNhat = LocalDateTime.now();
    }
}
