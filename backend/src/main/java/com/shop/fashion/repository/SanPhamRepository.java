package com.shop.fashion.repository;

import com.shop.fashion.entity.SanPham;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

@Repository
public interface SanPhamRepository extends JpaRepository<SanPham, Long> {
    List<SanPham> findByDanhMucId(Long danhMucId);
    Page<SanPham> findByDanhMucIdAndTrangThaiAndIdNot(Long danhMucId, Integer trangThai, Long excludeId, Pageable pageable);
    
    long countByDanhMucId(Long danhMucId);
    @Query("SELECT new com.shop.fashion.dto.response.ProductListResponse(" +
           "p.id, p.tenSanPham, p.gia, MAX(i.duongDanAnh), d.id) " +
           "FROM SanPham p " +
           "LEFT JOIN p.danhMuc d " +
           "LEFT JOIN HinhAnhSanPham i ON i.sanPham = p AND i.isThumbnail = 1 " +
           "WHERE p.trangThai = 1 " +
           "AND (:categoryId IS NULL OR d.id = :categoryId) " +
           "AND (:keyword IS NULL OR LOWER(p.tenSanPham) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "GROUP BY p.id, p.tenSanPham, p.gia, d.id")
    Page<com.shop.fashion.dto.response.ProductListResponse> filterProducts(
            @Param("categoryId") Long categoryId,
            @Param("keyword") String keyword,
            Pageable pageable);
}
