package com.shop.fashion.repository;

import com.shop.fashion.entity.DonHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.util.List;

@Repository
public interface DonHangRepository extends JpaRepository<DonHang, Long> {
    List<DonHang> findByNguoiDungId(Long nguoiDungId);

    @Query("SELECT SUM(d.tongTien) FROM DonHang d WHERE d.trangThai = 'DELIVERED' AND MONTH(d.ngayTao) = :month AND YEAR(d.ngayTao) = :year")
    BigDecimal getTotalRevenueByMonthAndYear(@Param("month") int month, @Param("year") int year);
}
