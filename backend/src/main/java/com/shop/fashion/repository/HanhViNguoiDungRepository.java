package com.shop.fashion.repository;

import com.shop.fashion.entity.HanhViNguoiDung;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HanhViNguoiDungRepository extends JpaRepository<HanhViNguoiDung, Long> {
    List<HanhViNguoiDung> findByNguoiDungId(Long nguoiDungId);
    List<HanhViNguoiDung> findByNguoiDungIdOrderByThoiGianDesc(Long nguoiDungId);
}
