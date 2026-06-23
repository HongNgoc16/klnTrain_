package com.klntrain.controller.admin;

import com.klntrain.dto.response.PhanHoiApi;
import com.klntrain.service.QuanTriService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/notifications")
@RequiredArgsConstructor
public class QuanTriThongBaoController {

    private final QuanTriService quanTriService;

    @PostMapping("/broadcast")
    public ResponseEntity<PhanHoiApi<?>> phatSong(@RequestBody Map<String, String> body) {
        int soLuong = quanTriService.phatSongThongBao(
            body.get("tieuDe"),
            body.get("noiDung"),
            body.get("loai")
        );
        return ResponseEntity.ok(PhanHoiApi.thanhCong(
            Map.of("soLuong", soLuong),
            "Đã gửi thông báo đến " + soLuong + " người dùng"
        ));
    }
}
