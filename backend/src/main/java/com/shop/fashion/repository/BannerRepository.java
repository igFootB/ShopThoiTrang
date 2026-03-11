package com.shop.fashion.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.shop.fashion.entity.Banner;

@Repository
public interface BannerRepository extends JpaRepository<Banner, Long> {
    
    @Query("SELECT b FROM Banner b WHERE b.trangThai = 1 ORDER BY b.createdAt DESC")
    Page<Banner> findActiveBanners(Pageable pageable);
}
