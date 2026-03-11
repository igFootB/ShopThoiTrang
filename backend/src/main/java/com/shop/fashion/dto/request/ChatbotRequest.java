package com.shop.fashion.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ChatbotRequest {
    @NotBlank(message = "Nội dung tin nhắn không được để trống")
    private String content;
}
