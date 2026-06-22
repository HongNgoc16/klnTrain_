package com.klntrain.controller.admin;

import com.klntrain.dto.response.ApiResponse;
import com.klntrain.entity.GaTau;
import com.klntrain.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/stations")
@RequiredArgsConstructor
public class AdminStationController {

    private final AdminService adminService;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getAllStations()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<?>> create(@RequestBody GaTau ga) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(adminService.saveStation(ga), "Thêm ga thành công"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> update(@PathVariable Long id, @RequestBody GaTau ga) {
        ga.setIdGa(id);
        return ResponseEntity.ok(ApiResponse.ok(adminService.saveStation(ga), "Cập nhật ga thành công"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> delete(@PathVariable Long id) {
        adminService.deleteStation(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Xóa ga thành công"));
    }
}
