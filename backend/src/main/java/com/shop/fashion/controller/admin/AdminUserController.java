package com.shop.fashion.controller.admin;

import com.shop.fashion.entity.NguoiDung;
import com.shop.fashion.entity.Quyen;
import com.shop.fashion.repository.NguoiDungRepository;
import com.shop.fashion.repository.QuyenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final NguoiDungRepository nguoiDungRepository;
    private final QuyenRepository quyenRepository;

    // 1. Lấy danh sách tài khoản
    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        try {
            // Không nên trả về mật khẩu cho Frontend
            List<NguoiDung> users = nguoiDungRepository.findAll();
            users.forEach(u -> u.setMatKhau(null));

            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // 2. Thay đổi trạng thái tài khoản (Ban / Active)
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateUserStatus(@PathVariable("id") Long id, @RequestBody Map<String, Integer> body) {
        try {
            if (id == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "ID không hợp lệ"));
            }
            Optional<NguoiDung> exist = nguoiDungRepository.findById(id);
            if (exist.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Người dùng không tồn tại"));
            }

            Integer newStatus = body.get("trangThai");
            if (newStatus == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Trạng thái không hợp lệ"));
            }

            NguoiDung user = exist.get();
            // Tránh việc tự khóa tài khoản Admin siêu cấp (phòng ngừa rủi ro tự Ban chính
            // mình)
            if (user.getQuyen() != null && "ADMIN".equals(user.getQuyen().getTenQuyen())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Không thể Ban tài khoản ADMIN"));
            }

            user.setTrangThai(newStatus);
            nguoiDungRepository.save(user);

            String statusStr = newStatus == 1 ? "Kích hoạt" : "Bị khóa";
            return ResponseEntity.ok(Map.of("message", "Tài khoản đã được " + statusStr));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi: " + e.getMessage()));
        }
    }

    // 3. Thay đổi quyền của tài khoản (USER <-> ADMIN)
    @PutMapping("/{id}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable("id") Long id, @RequestBody Map<String, Long> body) {
        try {
            if (id == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "ID không hợp lệ"));
            }
            Optional<NguoiDung> existUser = nguoiDungRepository.findById(id);
            if (existUser.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Người dùng không tồn tại"));
            }

            Long newRoleId = body.get("roleId");
            if (newRoleId == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Role ID không hợp lệ"));
            }

            Optional<Quyen> existRole = quyenRepository.findById(newRoleId);
            if (existRole.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Quyền không tồn tại trong hệ thống"));
            }

            NguoiDung user = existUser.get();
            user.setQuyen(existRole.get());
            nguoiDungRepository.save(user);

            return ResponseEntity
                    .ok(Map.of("message", "Đã cập nhật vai trò tài khoản thành: " + existRole.get().getTenQuyen()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi: " + e.getMessage()));
        }
    }

    // 4. Lấy danh sách tất cả các Role (Quyền) để nạp vào SelectBox (Thả xuống)
    @GetMapping("/roles")
    public ResponseEntity<?> getAllRoles() {
        try {
            List<Quyen> roles = quyenRepository.findAll();
            return ResponseEntity.ok(roles);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
