package com.shop.fashion.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "chatbot_faq")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FAQChatbot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cau_hoi", columnDefinition = "TEXT")
    private String cauHoi;

    @Column(name = "cau_tra_loi", columnDefinition = "TEXT")
    private String cauTraLoi;

    @Column(name = "thu_tu_uu_tien")
    private Integer thuTuUuTien = 0;
}
