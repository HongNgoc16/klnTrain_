package com.klntrain.controller;

import com.klntrain.dto.request.CreatePaymentRequest;
import com.klntrain.dto.response.ApiResponse;
import com.klntrain.service.PaymentService;
import com.klntrain.util.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @Value("${sepay.webhook-token:}")
    private String sePayToken;

    @PostMapping
    public ResponseEntity<ApiResponse<?>> createPayment(@RequestBody CreatePaymentRequest req) {
        if (req.getIdDonDatVe() == null) throw AppException.badRequest("Thiếu idDonDatVe");
        var result = paymentService.createPayment(req.getIdDonDatVe(), req.getPhuongThuc());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(result, "Tạo giao dịch thành công"));
    }

    @PutMapping("/{idThanhToan}/confirm")
    public ResponseEntity<ApiResponse<?>> confirmPayment(@PathVariable Long idThanhToan) {
        var result = paymentService.confirmPayment(idThanhToan);
        return ResponseEntity.ok(ApiResponse.ok(result, "Xác nhận thanh toán thành công"));
    }

    @GetMapping("/{idThanhToan}/status")
    public ResponseEntity<ApiResponse<?>> getStatus(@PathVariable Long idThanhToan) {
        var result = paymentService.getPaymentStatus(idThanhToan);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @PostMapping("/webhook")
    public ResponseEntity<Map<String, Object>> receiveWebhook(
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
        paymentService.processWebhook(body);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PostMapping("/dev-confirm/{maDon}")
    public ResponseEntity<ApiResponse<?>> devConfirm(@PathVariable String maDon) {
        // Chỉ dùng khi phát triển/kiểm thử
        String profile = System.getProperty("spring.profiles.active", "");
        if ("prod".equalsIgnoreCase(profile)) throw AppException.badRequest("Không khả dụng");

        var result = paymentService.devConfirmByMaDon(maDon);
        return ResponseEntity.ok(ApiResponse.ok(result, "Dev confirm thành công"));
    }
}
