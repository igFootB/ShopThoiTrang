package com.shop.fashion.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "goi_y_san_pham")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GoiYSanPham {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private NguoiDung nguoiDung;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private SanPham sanPham;

    @Column(name = "diem_goi_y")
    private Float diemGoiY;

    @Column(name = "ngay_goi_y", updatable = false)
    private LocalDateTime ngayGoiY;

    @PrePersist
    protected void onCreate() {
        ngayGoiY = LocalDateTime.now();
    }
}
