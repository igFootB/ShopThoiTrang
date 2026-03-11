package com.shop.fashion.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DanhGia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private NguoiDung nguoiDung;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private SanPham sanPham;

    @ManyToOne
    @JoinColumn(name = "order_id")
    private DonHang donHang;

    @Column(name = "danh_gia")
    private Integer danhGia;

    @Column(name = "binh_luan", columnDefinition = "TEXT")
    private String binhLuan;

    @Column(name = "ngay_tao", updatable = false)
    private LocalDateTime ngayTao;

    @PrePersist
    protected void onCreate() {
        ngayTao = LocalDateTime.now();
    }
}
