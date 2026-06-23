package com.klntrain.controller.admin;

import com.klntrain.dto.response.PhanHoiApi;
import com.klntrain.entity.GaTau;
import com.klntrain.service.QuanTriService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/stations")
@RequiredArgsConstructor
public class QuanTriGaTauController {

    private final QuanTriService quanTriService;

    @GetMapping
    public ResponseEntity<PhanHoiApi<?>> layTatCa() {
        return ResponseEntity.ok(PhanHoiApi.thanhCong(quanTriService.layTatCaGaTau()));
    }

    @PostMapping
    public ResponseEntity<PhanHoiApi<?>> them(@RequestBody GaTau ga) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(PhanHoiApi.thanhCong(quanTriService.luuGaTau(ga), "Thêm ga thành công"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PhanHoiApi<?>> capNhat(@PathVariable Long id, @RequestBody GaTau ga) {
        ga.setIdGa(id);
        return ResponseEntity.ok(PhanHoiApi.thanhCong(quanTriService.luuGaTau(ga), "Cập nhật ga thành công"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<PhanHoiApi<?>> xoa(@PathVariable Long id) {
        quanTriService.xoaGaTau(id);
        return ResponseEntity.ok(PhanHoiApi.thanhCong(null, "Xóa ga thành công"));
    }
}
