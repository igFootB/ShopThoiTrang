package com.shop.fashion.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "hanh_vi_nguoi_dung")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HanhViNguoiDung {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private NguoiDung nguoiDung;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private SanPham sanPham;

    @Column(name = "loai_hanh_vi", length = 50)
    private String loaiHanhVi;

    @Column(name = "thoi_gian", updatable = false)
    private LocalDateTime thoiGian;

    @PrePersist
    protected void onCreate() {
        thoiGian = LocalDateTime.now();
    }
}
