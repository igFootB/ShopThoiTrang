package com.shop.fashion.repository;

import com.shop.fashion.entity.Lookbook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface LookbookRepository extends JpaRepository<Lookbook, Long> {

    @Query("SELECT l FROM Lookbook l WHERE l.trangThai = 1 ORDER BY l.createdAt DESC")
    Page<Lookbook> findActiveLookbooks(Pageable pageable);
}
