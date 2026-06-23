package com.klntrain.controller;

import com.klntrain.dto.request.YeuCauDangNhap;
import com.klntrain.dto.request.YeuCauDangKy;
import com.klntrain.dto.response.PhanHoiApi;
import com.klntrain.security.ThongTinNguoiDung;
import com.klntrain.service.XacThucService;
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
public class XacThucController {

    private final XacThucService xacThucService;

    @PostMapping("/register")
    public ResponseEntity<PhanHoiApi<Map<String, Object>>> dangKy(@Valid @RequestBody YeuCauDangKy req) {
        var result = xacThucService.dangKy(req);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(PhanHoiApi.thanhCong(result, "Đăng ký thành công"));
    }

    @PostMapping("/login")
    public ResponseEntity<PhanHoiApi<Map<String, Object>>> dangNhap(@Valid @RequestBody YeuCauDangNhap req) {
        var result = xacThucService.dangNhap(req);
        return ResponseEntity.ok(PhanHoiApi.thanhCong(result, "Đăng nhập thành công"));
    }

    @GetMapping("/profile")
    public ResponseEntity<PhanHoiApi<Map<String, Object>>> layHoSo(@AuthenticationPrincipal ThongTinNguoiDung principal) {
        var result = xacThucService.layHoSo(principal.getId());
        return ResponseEntity.ok(PhanHoiApi.thanhCong(result));
    }

    @PutMapping("/profile")
    public ResponseEntity<PhanHoiApi<Map<String, Object>>> capNhatHoSo(
        @AuthenticationPrincipal ThongTinNguoiDung principal,
        @RequestBody Map<String, Object> body
    ) {
        var result = xacThucService.capNhatHoSo(principal.getId(), body);
        return ResponseEntity.ok(PhanHoiApi.thanhCong(result, "Cập nhật thông tin thành công"));
    }

    @PostMapping("/change-password")
    public ResponseEntity<PhanHoiApi<Void>> doiMatKhau(
        @AuthenticationPrincipal ThongTinNguoiDung principal,
        @RequestBody Map<String, String> body
    ) {
        xacThucService.doiMatKhau(principal.getId(), body.get("matKhauCu"), body.get("matKhauMoi"));
        return ResponseEntity.ok(PhanHoiApi.thanhCong(null, "Đổi mật khẩu thành công"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<PhanHoiApi<Map<String, Object>>> lamMoiToken(@AuthenticationPrincipal ThongTinNguoiDung principal) {
        var result = xacThucService.lamMoiToken(principal.getId());
        return ResponseEntity.ok(PhanHoiApi.thanhCong(result, "Gia hạn token thành công"));
    }
}
