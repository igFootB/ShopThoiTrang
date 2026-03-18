package com.shop.fashion.repository;

import com.shop.fashion.entity.SanPhamYeuThich;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SanPhamYeuThichRepository extends JpaRepository<SanPhamYeuThich, Long> {
    List<SanPhamYeuThich> findByNguoiDungId(Long nguoiDungId);
    Optional<SanPhamYeuThich> findByNguoiDungIdAndSanPhamId(Long nguoiDungId, Long sanPhamId);
    void deleteByNguoiDungIdAndSanPhamId(Long nguoiDungId, Long sanPhamId);
}
