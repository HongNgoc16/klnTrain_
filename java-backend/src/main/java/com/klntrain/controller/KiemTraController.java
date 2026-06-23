package com.klntrain.controller;

import com.klntrain.dto.response.PhanHoiApi;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class KiemTraController {

    @GetMapping("/health")
    public ResponseEntity<PhanHoiApi<?>> kiemTra() {
        return ResponseEntity.ok(PhanHoiApi.thanhCong(
            Map.of("time", LocalDateTime.now()),
            "KLN Train API đang hoạt động"
        ));
    }
}
