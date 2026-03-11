package com.shop.fashion.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String email;
    private String ten;
    private String quyen;

    public AuthResponse(String token, Long id, String email, String ten, String quyen) {
        this.token = token;
        this.id = id;
        this.email = email;
        this.ten = ten;
        this.quyen = quyen;
    }
}
