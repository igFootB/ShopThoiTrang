package com.shop.fashion.service;

import com.shop.fashion.entity.TinNhanChatbot;
import com.shop.fashion.entity.FAQChatbot;
import com.shop.fashion.repository.TinNhanChatbotRepository;
import com.shop.fashion.repository.FAQChatbotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatbotService {

    private final TinNhanChatbotRepository tinNhanChatbotRepository;
    private final FAQChatbotRepository faqChatbotRepository;
    private final com.shop.fashion.repository.NguoiDungRepository nguoiDungRepository;

    public List<TinNhanChatbot> layLichSuChat(Long nguoiDungId) {
        return tinNhanChatbotRepository.findByNguoiDungId(nguoiDungId);
    }

    public TinNhanChatbot luuTinNhan(TinNhanChatbot tinNhanChatbot) {
        return tinNhanChatbotRepository.save(tinNhanChatbot);
    }

    public List<FAQChatbot> layTatCaFAQ() {
        return faqChatbotRepository.findAll();
    }

    @org.springframework.transaction.annotation.Transactional
    public String xuLyChatbot(Long userId, String userContent) {
        // 1. Lưu tin nhắn của USER
        TinNhanChatbot userMsg = new TinNhanChatbot();
        if (userId != null) {
            userMsg.setNguoiDung(nguoiDungRepository.getReferenceById(userId));
        }
        userMsg.setNoiDung(userContent);
        userMsg.setNguoiGui("USER");
        tinNhanChatbotRepository.save(userMsg);

        // 2. Tìm kiếm câu hỏi khớp nhất trong FAQ
        java.util.Optional<FAQChatbot> match = faqChatbotRepository.findBestMatch(userContent);
        
        String botResponse;
        if (match.isPresent()) {
            botResponse = match.get().getCauTraLoi();
        } else {
            botResponse = "Xin lỗi, tôi chưa hiểu câu hỏi của bạn. Vui lòng liên hệ Hotline: 0123.456.789 để được hỗ trợ trực tiếp!";
        }

        // 3. Lưu tin nhắn của BOT
        TinNhanChatbot botMsg = new TinNhanChatbot();
        if (userId != null) {
            botMsg.setNguoiDung(nguoiDungRepository.getReferenceById(userId));
        }
        botMsg.setNoiDung(botResponse);
        botMsg.setNguoiGui("BOT");
        tinNhanChatbotRepository.save(botMsg);

        return botResponse;
    }
}
