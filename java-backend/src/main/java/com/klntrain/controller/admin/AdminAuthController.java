package com.klntrain.controller.admin;

import com.klntrain.dto.response.ApiResponse;
import com.klntrain.security.JwtPrincipal;
import com.klntrain.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/auth")
@RequiredArgsConstructor
public class AdminAuthController {

    private final AuthService authService;

    // Admin login sử dụng chung AuthService — chỉ cần kiểm tra vai_tro sau đó
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Map<String, Object>>> login(@RequestBody Map<String, String> body) {
        var req = new com.klntrain.dto.request.LoginRequest();
        req.setEmail(body.get("email"));
        req.setMatKhau(body.getOrDefault("password", body.get("matKhau")));
        var result = authService.login(req);

        // Kiểm tra vai trò admin/nhân viên
        @SuppressWarnings("unchecked")
        var user = (Map<String, Object>) result.get("user");
        String role = (String) user.get("vaiTro");
        if (!role.equals("quan_tri") && !role.equals("nhan_vien") && !role.equals("dieu_phoi")) {
            return ResponseEntity.status(403)
                .body(ApiResponse.error("Tài khoản không có quyền truy cập hệ thống quản trị"));
        }

        return ResponseEntity.ok(ApiResponse.ok(result, "Đăng nhập thành công"));
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProfile(@AuthenticationPrincipal JwtPrincipal principal) {
        var result = authService.getProfile(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<Map<String, Object>>> refresh(@AuthenticationPrincipal JwtPrincipal principal) {
        var result = authService.refreshToken(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(result, "Gia hạn token thành công"));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        return ResponseEntity.ok(ApiResponse.ok(null, "Đăng xuất thành công"));
    }
}
