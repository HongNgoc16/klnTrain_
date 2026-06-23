package com.klntrain.controller.admin;

import com.klntrain.dto.response.PhanHoiApi;
import com.klntrain.entity.Tau;
import com.klntrain.service.QuanTriService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/trains")
@RequiredArgsConstructor
public class QuanTriTauController {

    private final QuanTriService quanTriService;

    @GetMapping
    public ResponseEntity<PhanHoiApi<?>> layTatCa() {
        return ResponseEntity.ok(PhanHoiApi.thanhCong(quanTriService.layTatCaTau()));
    }

    @PostMapping
    public ResponseEntity<PhanHoiApi<?>> them(@RequestBody Tau tau) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(PhanHoiApi.thanhCong(quanTriService.luuTau(tau), "Thêm tàu thành công"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PhanHoiApi<?>> capNhat(@PathVariable Long id, @RequestBody Tau tau) {
        tau.setIdTau(id);
        return ResponseEntity.ok(PhanHoiApi.thanhCong(quanTriService.luuTau(tau), "Cập nhật tàu thành công"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<PhanHoiApi<?>> xoa(@PathVariable Long id) {
        quanTriService.xoaTau(id);
        return ResponseEntity.ok(PhanHoiApi.thanhCong(null, "Xóa tàu thành công"));
    }
}
