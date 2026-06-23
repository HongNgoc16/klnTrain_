package com.klntrain.controller;

import com.klntrain.dto.request.YeuCauThanhToan;
import com.klntrain.dto.response.PhanHoiApi;
import com.klntrain.service.ThanhToanService;
import com.klntrain.util.NgoaiLeUngDung;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class ThanhToanController {

    private final ThanhToanService thanhToanService;

    @Value("${sepay.webhook-token:}")
    private String sePayToken;

    @PostMapping
    public ResponseEntity<PhanHoiApi<?>> taoThanhToan(@RequestBody YeuCauThanhToan req) {
        if (req.getIdDonDatVe() == null) throw NgoaiLeUngDung.loiYeuCau("Thiếu idDonDatVe");
        var result = thanhToanService.taoThanhToan(req.getIdDonDatVe(), req.getPhuongThuc());
        return ResponseEntity.status(HttpStatus.CREATED).body(PhanHoiApi.thanhCong(result, "Tạo giao dịch thành công"));
    }

    @PutMapping("/{idThanhToan}/confirm")
    public ResponseEntity<PhanHoiApi<?>> xacNhanThanhToan(@PathVariable Long idThanhToan) {
        var result = thanhToanService.xacNhanThanhToan(idThanhToan);
        return ResponseEntity.ok(PhanHoiApi.thanhCong(result, "Xác nhận thanh toán thành công"));
    }

    @GetMapping("/{idThanhToan}/status")
    public ResponseEntity<PhanHoiApi<?>> layTrangThai(@PathVariable Long idThanhToan) {
        var result = thanhToanService.layTrangThaiThanhToan(idThanhToan);
        return ResponseEntity.ok(PhanHoiApi.thanhCong(result));
    }

    @PostMapping("/webhook")
    public ResponseEntity<Map<String, Object>> nhanWebhook(
        @RequestHeader(value = "Authorization", required = false) String authHeader,
        @RequestHeader(value = "x-sepay-token", required = false) String sePayHeader,
        @RequestBody Map<String, Object> body
    ) {
        if (sePayToken != null && !sePayToken.isBlank()) {
            String token = authHeader != null ? authHeader.replace("Bearer ", "") : sePayHeader;
            if (!sePayToken.equals(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false));
            }
        }
        thanhToanService.xuLyWebhook(body);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PostMapping("/dev-confirm/{maDon}")
    public ResponseEntity<PhanHoiApi<?>> xacNhanDev(@PathVariable String maDon) {
        String profile = System.getProperty("spring.profiles.active", "");
        if ("prod".equalsIgnoreCase(profile)) throw NgoaiLeUngDung.loiYeuCau("Không khả dụng");

        var result = thanhToanService.xacNhanDevTheoMaDon(maDon);
        return ResponseEntity.ok(PhanHoiApi.thanhCong(result, "Dev confirm thành công"));
    }
}
