package com.klntrain.controller.admin;

import com.klntrain.dto.response.PhanHoiApi;
import com.klntrain.entity.KhuyenMai;
import com.klntrain.service.QuanTriService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/coupons")
@RequiredArgsConstructor
public class QuanTriKhuyenMaiController {

    private final QuanTriService quanTriService;

    @GetMapping
    public ResponseEntity<PhanHoiApi<?>> layTatCa() {
        return ResponseEntity.ok(PhanHoiApi.thanhCong(quanTriService.layTatCaKhuyenMai()));
    }

    @PostMapping
    public ResponseEntity<PhanHoiApi<?>> them(@RequestBody KhuyenMai km) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(PhanHoiApi.thanhCong(quanTriService.luuKhuyenMai(km), "Tạo mã khuyến mãi thành công"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PhanHoiApi<?>> capNhat(@PathVariable Long id, @RequestBody KhuyenMai km) {
        km.setIdKhuyenMai(id);
        return ResponseEntity.ok(PhanHoiApi.thanhCong(quanTriService.luuKhuyenMai(km), "Cập nhật mã khuyến mãi thành công"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<PhanHoiApi<?>> xoa(@PathVariable Long id) {
        quanTriService.xoaKhuyenMai(id);
        return ResponseEntity.ok(PhanHoiApi.thanhCong(null, "Xóa mã khuyến mãi thành công"));
    }
}
