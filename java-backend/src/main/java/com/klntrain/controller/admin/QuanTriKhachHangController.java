package com.klntrain.controller.admin;

import com.klntrain.dto.response.PhanHoiApi;
import com.klntrain.service.QuanTriService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/customers")
@RequiredArgsConstructor
public class QuanTriKhachHangController {

    private final QuanTriService quanTriService;

    @GetMapping
    public ResponseEntity<PhanHoiApi<?>> layTatCa() {
        var users = quanTriService.layTatCaNguoiDung().stream()
            .filter(u -> "khach_hang".equals(u.getVaiTro()))
            .toList();
        return ResponseEntity.ok(PhanHoiApi.thanhCong(users));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<PhanHoiApi<?>> capNhatTrangThai(@PathVariable Long id, @RequestBody Map<String, String> body) {
        var tk = quanTriService.capNhatTrangThaiNguoiDung(id, body.get("trangThai"));
        return ResponseEntity.ok(PhanHoiApi.thanhCong(tk, "Cập nhật trạng thái thành công"));
    }
}
