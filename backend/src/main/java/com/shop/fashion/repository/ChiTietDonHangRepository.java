package com.shop.fashion.repository;

import com.shop.fashion.entity.ChiTietDonHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Pageable;
import java.util.List;

@Repository
public interface ChiTietDonHangRepository extends JpaRepository<ChiTietDonHang, Long> {
    List<ChiTietDonHang> findByDonHangId(Long donHangId);

    @Query("SELECT c.bienTheSanPham.sanPham.id as productId, c.tenSanPhamLucMua as productName, SUM(c.soLuong) as totalSold FROM ChiTietDonHang c JOIN c.donHang d WHERE d.trangThai = 'DELIVERED' AND MONTH(d.ngayTao) = :month AND YEAR(d.ngayTao) = :year GROUP BY c.bienTheSanPham.sanPham.id, c.tenSanPhamLucMua ORDER BY totalSold DESC")
    List<Object[]> getTopSellingProducts(@Param("month") int month, @Param("year") int year, Pageable pageable);
}
