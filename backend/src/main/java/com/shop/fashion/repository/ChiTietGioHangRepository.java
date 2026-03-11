package com.shop.fashion.repository;

import com.shop.fashion.entity.ChiTietGioHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface ChiTietGioHangRepository extends JpaRepository<ChiTietGioHang, Long> {
    List<ChiTietGioHang> findByGioHangId(Long gioHangId);
    Optional<ChiTietGioHang> findByGioHangIdAndBienTheSanPhamId(Long gioHangId, Long bienTheSanPhamId);

    @Modifying
    @Query("DELETE FROM ChiTietGioHang c WHERE c.id IN :itemIds")
    void deleteAllByIdInBatchCustom(@Param("itemIds") List<Long> itemIds);
}
