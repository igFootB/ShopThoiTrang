package com.shop.fashion.controller;

import com.shop.fashion.dto.request.LoginRequest;
import com.shop.fashion.dto.request.RegisterRequest;
import com.shop.fashion.dto.response.AuthResponse;
import com.shop.fashion.entity.NguoiDung;
import com.shop.fashion.entity.Quyen;
import com.shop.fashion.repository.NguoiDungRepository;
import com.shop.fashion.repository.QuyenRepository;
import com.shop.fashion.security.JwtUtils;
import com.shop.fashion.security.UserDetailsImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final NguoiDungRepository nguoiDungRepository;
    private final QuyenRepository quyenRepository;
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getMatKhau()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String quyen = userDetails.getAuthorities().iterator().next().getAuthority();

        return ResponseEntity.ok(new AuthResponse(
                jwt,
                userDetails.getId(),
                userDetails.getEmail(),
                userDetails.getTen(),
                quyen));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest signUpRequest) {
        if (nguoiDungRepository.existsByEmail(signUpRequest.getEmail())) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Lỗi: Email đã được sử dụng!");
            return ResponseEntity.badRequest().body(response);
        }

        // Create new user's account
        NguoiDung user = new NguoiDung();
        user.setTen(signUpRequest.getTen());
        user.setEmail(signUpRequest.getEmail());
        user.setMatKhau(encoder.encode(signUpRequest.getMatKhau()));
        user.setSoDienThoai(signUpRequest.getSoDienThoai());
        user.setTrangThai(1);

        // Lấy quyền mặc định là USER (Có thể là "USER" hoặc "ROLE_USER")
        Quyen userRole = quyenRepository.findByTenQuyen("USER")
                .orElseGet(() -> quyenRepository.findByTenQuyen("ROLE_USER")
                        .orElseGet(() -> {
                            // Nếu không tìm thấy, tạo mới cho dễ test
                            Quyen quyen = new Quyen();
                            quyen.setTenQuyen("USER");
                            return quyenRepository.save(quyen);
                        }));

        user.setQuyen(userRole);

        nguoiDungRepository.save(user);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Đăng ký tài khoản thành công!");
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser() {
        return ResponseEntity.ok("Đăng xuất thành công");
    }
}
