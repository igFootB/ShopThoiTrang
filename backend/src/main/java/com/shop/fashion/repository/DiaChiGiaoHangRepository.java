package com.shop.fashion.repository;

import com.shop.fashion.entity.DiaChiGiaoHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DiaChiGiaoHangRepository extends JpaRepository<DiaChiGiaoHang, Long> {
    List<DiaChiGiaoHang> findByNguoiDungId(Long nguoiDungId);

    @Modifying
    @Query("UPDATE DiaChiGiaoHang d SET d.isDefault = 0 WHERE d.nguoiDung.id = :userId")
    void resetDefaultAddressForUser(@Param("userId") Long userId);
}
