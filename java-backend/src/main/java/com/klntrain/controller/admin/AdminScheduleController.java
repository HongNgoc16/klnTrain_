package com.klntrain.controller.admin;

import com.klntrain.dto.response.ApiResponse;
import com.klntrain.entity.LichChay;
import com.klntrain.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/schedules")
@RequiredArgsConstructor
public class AdminScheduleController {

    private final AdminService adminService;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAll(@RequestParam(required = false) Long idTau) {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getAllSchedules(idTau)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<?>> create(@RequestBody LichChay lichChay) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok(adminService.createSchedule(lichChay), "Tạo lịch chạy thành công"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> update(@PathVariable Long id, @RequestBody LichChay lichChay) {
        lichChay.setIdLichChay(id);
        return ResponseEntity.ok(ApiResponse.ok(adminService.createSchedule(lichChay), "Cập nhật lịch chạy thành công"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> delete(@PathVariable Long id) {
        adminService.deleteSchedule(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Xóa lịch chạy thành công"));
    }
}
