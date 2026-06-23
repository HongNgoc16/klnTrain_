package com.klntrain.controller;

import com.klntrain.dto.response.PhanHoiApi;
import com.klntrain.service.ChuyenTauService;
import com.klntrain.util.NgoaiLeUngDung;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/trains")
@RequiredArgsConstructor
public class ChuyenTauController {

    private final ChuyenTauService chuyenTauService;

    @GetMapping("/stations")
    public ResponseEntity<PhanHoiApi<?>> layDanhSachGa() {
        return ResponseEntity.ok(PhanHoiApi.thanhCong(chuyenTauService.layDanhSachGa()));
    }

    @GetMapping("/search")
    public ResponseEntity<PhanHoiApi<?>> timChuyenTau(
        @RequestParam Long gaDi,
        @RequestParam Long gaDen,
        @RequestParam String ngayChay
    ) {
        if (gaDi == null || gaDen == null || ngayChay == null || ngayChay.isBlank()) {
            throw NgoaiLeUngDung.loiYeuCau("Thiếu tham số: gaDi, gaDen, ngayChay");
        }
        var results = chuyenTauService.timChuyenTau(gaDi, gaDen, ngayChay);
        return ResponseEntity.ok(PhanHoiApi.thanhCong(results));
    }

    @GetMapping("/{idChuyen}/seats/{soToa}")
    public ResponseEntity<PhanHoiApi<?>> laySoDoGhe(
        @PathVariable Long idChuyen,
        @PathVariable Integer soToa,
        @RequestParam(required = false) Long idGaLen,
        @RequestParam(required = false) Long idGaXuong
    ) {
        var result = chuyenTauService.laySoDoGhe(idChuyen, soToa, idGaLen, idGaXuong);
        return ResponseEntity.ok(PhanHoiApi.thanhCong(result));
    }
}
