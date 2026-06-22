package com.klntrain.controller.admin;

import com.klntrain.dto.response.ApiResponse;
import com.klntrain.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/customers")
@RequiredArgsConstructor
public class AdminCustomerController {

    private final AdminService adminService;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAll() {
        var users = adminService.getAllUsers().stream()
            .filter(u -> "khach_hang".equals(u.getVaiTro()))
            .toList();
        return ResponseEntity.ok(ApiResponse.ok(users));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<?>> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        var tk = adminService.updateUserStatus(id, body.get("trangThai"));
        return ResponseEntity.ok(ApiResponse.ok(tk, "Cập nhật trạng thái thành công"));
    }
}
