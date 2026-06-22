package com.klntrain.controller.admin;

import com.klntrain.dto.response.ApiResponse;
import com.klntrain.entity.TaiKhoan;
import com.klntrain.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminService adminService;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getAllUsers()));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<?>> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        var tk = adminService.updateUserStatus(id, body.get("trangThai"));
        return ResponseEntity.ok(ApiResponse.ok(tk, "Cập nhật trạng thái thành công"));
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<ApiResponse<?>> updateRole(@PathVariable Long id, @RequestBody Map<String, String> body) {
        var tk = adminService.updateUserRole(id, body.get("vaiTro"));
        return ResponseEntity.ok(ApiResponse.ok(tk, "Cập nhật vai trò thành công"));
    }
}
