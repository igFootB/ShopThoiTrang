package com.shop.fashion.repository;

import com.shop.fashion.entity.Quyen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface QuyenRepository extends JpaRepository<Quyen, Long> {
    Optional<Quyen> findByTenQuyen(String tenQuyen);
}
