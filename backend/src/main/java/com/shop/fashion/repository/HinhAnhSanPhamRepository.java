package com.shop.fashion.repository;

import com.shop.fashion.entity.HinhAnhSanPham;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HinhAnhSanPhamRepository extends JpaRepository<HinhAnhSanPham, Long> {
    List<HinhAnhSanPham> findBySanPhamId(Long sanPhamId);
}
