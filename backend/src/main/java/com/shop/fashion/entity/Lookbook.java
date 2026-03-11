package com.shop.fashion.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "lookbooks")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Lookbook {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String hinhAnh;

    @Column(length = 255)
    private String moTa;

    @Column(length = 500)
    private String duongDan;

    @Column(nullable = false)
    private Integer trangThai = 1; // 1: Hoạt động, 0: Ẩn

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
