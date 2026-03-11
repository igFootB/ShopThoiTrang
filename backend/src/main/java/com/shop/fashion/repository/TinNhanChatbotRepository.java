package com.shop.fashion.repository;

import com.shop.fashion.entity.TinNhanChatbot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TinNhanChatbotRepository extends JpaRepository<TinNhanChatbot, Long> {
    List<TinNhanChatbot> findByNguoiDungId(Long nguoiDungId);
}
