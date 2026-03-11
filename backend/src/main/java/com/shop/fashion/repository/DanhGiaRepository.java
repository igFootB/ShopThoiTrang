package com.shop.fashion.repository;

import com.shop.fashion.entity.DanhGia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DanhGiaRepository extends JpaRepository<DanhGia, Long> {
    List<DanhGia> findBySanPhamId(Long sanPhamId);

    @org.springframework.data.jpa.repository.Query("SELECT AVG(d.danhGia) FROM DanhGia d WHERE d.sanPham.id = :sanPhamId")
    Double getAverageRatingBySanPhamId(@org.springframework.data.repository.query.Param("sanPhamId") Long sanPhamId);
}
