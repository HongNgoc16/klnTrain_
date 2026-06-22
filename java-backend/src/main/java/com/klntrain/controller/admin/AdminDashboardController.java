package com.klntrain.controller.admin;

import com.klntrain.dto.response.ApiResponse;
import com.klntrain.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final AdminService adminService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<?>> getStats() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getDashboardStats()));
    }

    @GetMapping("/revenue-by-month")
    public ResponseEntity<ApiResponse<?>> getRevenueByMonth() {
        // Query trực tiếp trong service hoặc repository nếu cần
        return ResponseEntity.ok(ApiResponse.ok(adminService.getRevenueByMonth()));
    }

    @GetMapping("/revenue-by-week")
    public ResponseEntity<ApiResponse<?>> getRevenueByWeek() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getRevenueByWeek()));
    }

    @GetMapping("/popular-routes")
    public ResponseEntity<ApiResponse<?>> getPopularRoutes() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getPopularRoutes()));
    }

    @GetMapping("/recent-orders")
    public ResponseEntity<ApiResponse<?>> getRecentOrders() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getRecentOrders()));
    }

    @GetMapping("/upcoming-trains")
    public ResponseEntity<ApiResponse<?>> getUpcomingTrains() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getUpcomingTrains()));
    }

    @GetMapping("/top-stations")
    public ResponseEntity<ApiResponse<?>> getTopStations() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getTopStations()));
    }

    @GetMapping("/customer-distribution")
    public ResponseEntity<ApiResponse<?>> getCustomerDistribution() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getCustomerDistribution()));
    }

    @GetMapping("/rates")
    public ResponseEntity<ApiResponse<?>> getRates() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getRates()));
    }
}
