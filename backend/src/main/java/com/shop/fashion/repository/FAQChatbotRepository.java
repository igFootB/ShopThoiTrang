package com.shop.fashion.repository;

import com.shop.fashion.entity.FAQChatbot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FAQChatbotRepository extends JpaRepository<FAQChatbot, Long> {
    
    @org.springframework.data.jpa.repository.Query("SELECT f FROM FAQChatbot f WHERE f.cauHoi LIKE %:keyword% ORDER BY f.thuTuUuTien DESC LIMIT 1")
    java.util.Optional<FAQChatbot> findBestMatch(@org.springframework.data.repository.query.Param("keyword") String keyword);
}
