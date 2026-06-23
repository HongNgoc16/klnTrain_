package com.klntrain.controller.admin;

import com.klntrain.dto.response.PhanHoiApi;
import com.klntrain.service.QuanTriService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class QuanTriNguoiDungController {

    private final QuanTriService quanTriService;

    @GetMapping
    public ResponseEntity<PhanHoiApi<?>> layTatCa() {
        return ResponseEntity.ok(PhanHoiApi.thanhCong(quanTriService.layTatCaNguoiDung()));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<PhanHoiApi<?>> capNhatTrangThai(@PathVariable Long id, @RequestBody Map<String, String> body) {
        var tk = quanTriService.capNhatTrangThaiNguoiDung(id, body.get("trangThai"));
        return ResponseEntity.ok(PhanHoiApi.thanhCong(tk, "Cập nhật trạng thái thành công"));
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<PhanHoiApi<?>> capNhatVaiTro(@PathVariable Long id, @RequestBody Map<String, String> body) {
        var tk = quanTriService.capNhatVaiTroNguoiDung(id, body.get("vaiTro"));
        return ResponseEntity.ok(PhanHoiApi.thanhCong(tk, "Cập nhật vai trò thành công"));
    }
}
