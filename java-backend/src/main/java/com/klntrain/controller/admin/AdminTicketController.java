package com.klntrain.controller.admin;

import com.klntrain.dto.response.ApiResponse;
import com.klntrain.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/tickets")
@RequiredArgsConstructor
public class AdminTicketController {

    private final AdminService adminService;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAll(@RequestParam(required = false) String trangThai) {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getAllOrders(trangThai)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> getDetail(@PathVariable Long id) {
        var don = adminService.getOrderDetail(id)
            .orElseThrow(() -> com.klntrain.util.AppException.notFound("Không tìm thấy đơn"));
        return ResponseEntity.ok(ApiResponse.ok(don));
    }
}
