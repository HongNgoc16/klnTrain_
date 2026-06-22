package com.klntrain.controller;

import com.klntrain.dto.request.LoginRequest;
import com.klntrain.dto.request.RegisterRequest;
import com.klntrain.dto.response.ApiResponse;
import com.klntrain.security.JwtPrincipal;
import com.klntrain.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Map<String, Object>>> register(@Valid @RequestBody RegisterRequest req) {
        var result = authService.register(req);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok(result, "Đăng ký thành công"));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Map<String, Object>>> login(@Valid @RequestBody LoginRequest req) {
        var result = authService.login(req);
        return ResponseEntity.ok(ApiResponse.ok(result, "Đăng nhập thành công"));
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProfile(@AuthenticationPrincipal JwtPrincipal principal) {
        var result = authService.getProfile(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateProfile(
        @AuthenticationPrincipal JwtPrincipal principal,
        @RequestBody Map<String, Object> body
    ) {
        var result = authService.updateProfile(principal.getId(), body);
        return ResponseEntity.ok(ApiResponse.ok(result, "Cập nhật thông tin thành công"));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
        @AuthenticationPrincipal JwtPrincipal principal,
        @RequestBody Map<String, String> body
    ) {
        authService.changePassword(principal.getId(), body.get("matKhauCu"), body.get("matKhauMoi"));
        return ResponseEntity.ok(ApiResponse.ok(null, "Đổi mật khẩu thành công"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<Map<String, Object>>> refreshToken(@AuthenticationPrincipal JwtPrincipal principal) {
        var result = authService.refreshToken(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(result, "Gia hạn token thành công"));
    }
}
