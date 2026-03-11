package com.shop.fashion.repository;

import com.shop.fashion.entity.GoiYSanPham;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GoiYSanPhamRepository extends JpaRepository<GoiYSanPham, Long> {
    List<GoiYSanPham> findByNguoiDungId(Long nguoiDungId);
}
