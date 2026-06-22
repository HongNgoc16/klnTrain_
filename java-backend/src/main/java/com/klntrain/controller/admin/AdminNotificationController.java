package com.klntrain.controller.admin;

import com.klntrain.dto.response.ApiResponse;
import com.klntrain.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/notifications")
@RequiredArgsConstructor
public class AdminNotificationController {

    private final AdminService adminService;

    @PostMapping("/broadcast")
    public ResponseEntity<ApiResponse<?>> broadcast(@RequestBody Map<String, String> body) {
        int count = adminService.broadcastNotification(
            body.get("tieuDe"),
            body.get("noiDung"),
            body.get("loai")
        );
        return ResponseEntity.ok(ApiResponse.ok(
            Map.of("soLuong", count),
            "Đã gửi thông báo đến " + count + " người dùng"
        ));
    }
}
