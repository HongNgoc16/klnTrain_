package com.klntrain.controller.admin;

import com.klntrain.dto.response.ApiResponse;
import com.klntrain.entity.Tau;
import com.klntrain.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/trains")
@RequiredArgsConstructor
public class AdminTrainController {

    private final AdminService adminService;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getAllTrains()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<?>> create(@RequestBody Tau tau) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(adminService.saveTrain(tau), "Thêm tàu thành công"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> update(@PathVariable Long id, @RequestBody Tau tau) {
        tau.setIdTau(id);
        return ResponseEntity.ok(ApiResponse.ok(adminService.saveTrain(tau), "Cập nhật tàu thành công"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> delete(@PathVariable Long id) {
        adminService.deleteTrain(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Xóa tàu thành công"));
    }
}
