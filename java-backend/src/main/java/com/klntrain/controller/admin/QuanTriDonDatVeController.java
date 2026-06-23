package com.klntrain.controller.admin;

import com.klntrain.dto.response.PhanHoiApi;
import com.klntrain.service.QuanTriService;
import com.klntrain.util.NgoaiLeUngDung;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/tickets")
@RequiredArgsConstructor
public class QuanTriDonDatVeController {

    private final QuanTriService quanTriService;

    @GetMapping
    public ResponseEntity<PhanHoiApi<?>> layTatCa(@RequestParam(required = false) String trangThai) {
        return ResponseEntity.ok(PhanHoiApi.thanhCong(quanTriService.layTatCaDonDatVe(trangThai)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PhanHoiApi<?>> layChiTiet(@PathVariable Long id) {
        var don = quanTriService.layChiTietDon(id)
            .orElseThrow(() -> NgoaiLeUngDung.khongTimThay("Không tìm thấy đơn"));
        return ResponseEntity.ok(PhanHoiApi.thanhCong(don));
    }
}
