package com.klntrain.controller;

import com.klntrain.dto.response.PhanHoiApi;
import com.klntrain.security.ThongTinNguoiDung;
import com.klntrain.service.ThongBaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class ThongBaoController {

    private final ThongBaoService thongBaoService;

    @GetMapping
    public ResponseEntity<PhanHoiApi<?>> layTatCa(@AuthenticationPrincipal ThongTinNguoiDung principal) {
        var list = thongBaoService.layThongBao(principal.getId());
        return ResponseEntity.ok(PhanHoiApi.thanhCong(list));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<PhanHoiApi<?>> laySoChuaDoc(@AuthenticationPrincipal ThongTinNguoiDung principal) {
        long count = thongBaoService.demChuaDoc(principal.getId());
        return ResponseEntity.ok(PhanHoiApi.thanhCong(Map.of("count", count)));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<PhanHoiApi<?>> danhDauDaDoc(
        @PathVariable Long id,
        @AuthenticationPrincipal ThongTinNguoiDung principal
    ) {
        thongBaoService.danhDauDaDoc(id, principal.getId());
        return ResponseEntity.ok(PhanHoiApi.thanhCong(null, "Đã đánh dấu đọc"));
    }

    @PutMapping("/read-all")
    public ResponseEntity<PhanHoiApi<?>> danhDauTatCaDaDoc(@AuthenticationPrincipal ThongTinNguoiDung principal) {
        thongBaoService.danhDauTatCaDaDoc(principal.getId());
        return ResponseEntity.ok(PhanHoiApi.thanhCong(null, "Đã đánh dấu tất cả đã đọc"));
    }
}
