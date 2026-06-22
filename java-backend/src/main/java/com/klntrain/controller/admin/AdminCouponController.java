package com.klntrain.controller.admin;

import com.klntrain.dto.response.ApiResponse;
import com.klntrain.entity.KhuyenMai;
import com.klntrain.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/coupons")
@RequiredArgsConstructor
public class AdminCouponController {

    private final AdminService adminService;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getAllCoupons()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<?>> create(@RequestBody KhuyenMai km) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok(adminService.saveCoupon(km), "Tạo mã khuyến mãi thành công"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> update(@PathVariable Long id, @RequestBody KhuyenMai km) {
        km.setIdKhuyenMai(id);
        return ResponseEntity.ok(ApiResponse.ok(adminService.saveCoupon(km), "Cập nhật mã khuyến mãi thành công"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> delete(@PathVariable Long id) {
        adminService.deleteCoupon(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Xóa mã khuyến mãi thành công"));
    }
}
