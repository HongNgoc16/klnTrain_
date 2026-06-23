package com.klntrain.controller.admin;

import com.klntrain.dto.response.PhanHoiApi;
import com.klntrain.security.ThongTinNguoiDung;
import com.klntrain.service.XacThucService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/auth")
@RequiredArgsConstructor
public class QuanTriXacThucController {

    private final XacThucService xacThucService;

    @PostMapping("/login")
    public ResponseEntity<PhanHoiApi<Map<String, Object>>> dangNhap(@RequestBody Map<String, String> body) {
        var req = new com.klntrain.dto.request.YeuCauDangNhap();
        req.setEmail(body.get("email"));
        req.setMatKhau(body.getOrDefault("password", body.get("matKhau")));
        var result = xacThucService.dangNhap(req);

        @SuppressWarnings("unchecked")
        var user = (Map<String, Object>) result.get("user");
        String role = (String) user.get("vaiTro");
        if (!role.equals("quan_tri") && !role.equals("nhan_vien") && !role.equals("dieu_phoi")) {
            return ResponseEntity.status(403)
                .body(PhanHoiApi.loi("Tài khoản không có quyền truy cập hệ thống quản trị"));
        }

        return ResponseEntity.ok(PhanHoiApi.thanhCong(result, "Đăng nhập thành công"));
    }

    @GetMapping("/profile")
    public ResponseEntity<PhanHoiApi<Map<String, Object>>> layHoSo(@AuthenticationPrincipal ThongTinNguoiDung principal) {
        var result = xacThucService.layHoSo(principal.getId());
        return ResponseEntity.ok(PhanHoiApi.thanhCong(result));
    }

    @PostMapping("/refresh")
    public ResponseEntity<PhanHoiApi<Map<String, Object>>> lamMoiToken(@AuthenticationPrincipal ThongTinNguoiDung principal) {
        var result = xacThucService.lamMoiToken(principal.getId());
        return ResponseEntity.ok(PhanHoiApi.thanhCong(result, "Gia hạn token thành công"));
    }

    @PostMapping("/logout")
    public ResponseEntity<PhanHoiApi<Void>> dangXuat() {
        return ResponseEntity.ok(PhanHoiApi.thanhCong(null, "Đăng xuất thành công"));
    }
}
