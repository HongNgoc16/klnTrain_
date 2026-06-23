package com.klntrain.controller.admin;

import com.klntrain.dto.response.PhanHoiApi;
import com.klntrain.entity.LichChay;
import com.klntrain.service.QuanTriService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/schedules")
@RequiredArgsConstructor
public class QuanTriLichChayController {

    private final QuanTriService quanTriService;

    @GetMapping
    public ResponseEntity<PhanHoiApi<?>> layTatCa(@RequestParam(required = false) Long idTau) {
        return ResponseEntity.ok(PhanHoiApi.thanhCong(quanTriService.layTatCaLichChay(idTau)));
    }

    @PostMapping
    public ResponseEntity<PhanHoiApi<?>> them(@RequestBody LichChay lichChay) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(PhanHoiApi.thanhCong(quanTriService.taoLichChay(lichChay), "Tạo lịch chạy thành công"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PhanHoiApi<?>> capNhat(@PathVariable Long id, @RequestBody LichChay lichChay) {
        lichChay.setIdLichChay(id);
        return ResponseEntity.ok(PhanHoiApi.thanhCong(quanTriService.taoLichChay(lichChay), "Cập nhật lịch chạy thành công"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<PhanHoiApi<?>> xoa(@PathVariable Long id) {
        quanTriService.xoaLichChay(id);
        return ResponseEntity.ok(PhanHoiApi.thanhCong(null, "Xóa lịch chạy thành công"));
    }
}
