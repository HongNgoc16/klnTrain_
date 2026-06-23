package com.klntrain.controller.admin;

import com.klntrain.dto.response.PhanHoiApi;
import com.klntrain.service.QuanTriService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class QuanTriTongQuanController {

    private final QuanTriService quanTriService;

    @GetMapping("/stats")
    public ResponseEntity<PhanHoiApi<?>> layThongKe() {
        return ResponseEntity.ok(PhanHoiApi.thanhCong(quanTriService.layThongKeTongQuan()));
    }

    @GetMapping("/revenue-by-month")
    public ResponseEntity<PhanHoiApi<?>> layDoanhThuTheoThang() {
        return ResponseEntity.ok(PhanHoiApi.thanhCong(quanTriService.layDoanhThuTheoThang()));
    }

    @GetMapping("/revenue-by-week")
    public ResponseEntity<PhanHoiApi<?>> layDoanhThuTheoTuan() {
        return ResponseEntity.ok(PhanHoiApi.thanhCong(quanTriService.layDoanhThuTheoTuan()));
    }

    @GetMapping("/popular-routes")
    public ResponseEntity<PhanHoiApi<?>> layTuyenPhoBien() {
        return ResponseEntity.ok(PhanHoiApi.thanhCong(quanTriService.layTuyenPhoBien()));
    }

    @GetMapping("/recent-orders")
    public ResponseEntity<PhanHoiApi<?>> layDonGanDay() {
        return ResponseEntity.ok(PhanHoiApi.thanhCong(quanTriService.layDonGanDay()));
    }

    @GetMapping("/upcoming-trains")
    public ResponseEntity<PhanHoiApi<?>> layChuyenSapKhoiHanh() {
        return ResponseEntity.ok(PhanHoiApi.thanhCong(quanTriService.layChuyenSapKhoiHanh()));
    }

    @GetMapping("/top-stations")
    public ResponseEntity<PhanHoiApi<?>> layGaTauHangDau() {
        return ResponseEntity.ok(PhanHoiApi.thanhCong(quanTriService.layGaTauHangDau()));
    }

    @GetMapping("/customer-distribution")
    public ResponseEntity<PhanHoiApi<?>> layCoCauHanhKhach() {
        return ResponseEntity.ok(PhanHoiApi.thanhCong(quanTriService.layCoCauHanhKhach()));
    }

    @GetMapping("/rates")
    public ResponseEntity<PhanHoiApi<?>> layTyLe() {
        return ResponseEntity.ok(PhanHoiApi.thanhCong(quanTriService.layTyLe()));
    }
}
