package com.klntrain.controller;

import com.klntrain.dto.request.YeuCauHuyVe;
import com.klntrain.dto.response.PhanHoiApi;
import com.klntrain.service.HuyVeService;
import com.klntrain.util.NgoaiLeUngDung;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cancel")
@RequiredArgsConstructor
public class HuyVeController {

    private final HuyVeService huyVeService;

    @GetMapping("/fee/{idVe}")
    public ResponseEntity<PhanHoiApi<?>> layPhiHuy(@PathVariable Long idVe) {
        var result = huyVeService.tinhPhiHuy(idVe);
        return ResponseEntity.ok(PhanHoiApi.thanhCong(result));
    }

    @PostMapping
    public ResponseEntity<PhanHoiApi<?>> huyVe(@RequestBody YeuCauHuyVe req) {
        if (req.getMaDatCho() == null || req.getIdVeList() == null || req.getIdVeList().isEmpty()) {
            throw NgoaiLeUngDung.loiYeuCau("Thiếu maDatCho hoặc danh sách vé");
        }
        var result = huyVeService.huyVe(req.getMaDatCho(), req.getIdVeList(), req.getLyDo());
        return ResponseEntity.ok(PhanHoiApi.thanhCong(result,
            "Hủy " + result.get("soVeHuy") + " vé thành công"));
    }
}
