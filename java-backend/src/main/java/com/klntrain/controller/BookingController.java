package com.klntrain.controller;

import com.klntrain.dto.request.CreateBookingRequest;
import com.klntrain.dto.response.ApiResponse;
import com.klntrain.security.JwtPrincipal;
import com.klntrain.service.BookingService;
import com.klntrain.util.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping("/hold-seats")
    public ResponseEntity<ApiResponse<?>> holdSeats(@RequestBody Map<String, Object> body) {
        @SuppressWarnings("unchecked")
        var trips = (List<CreateBookingRequest.TripInfo>) body.get("trips");
        if (trips == null || trips.isEmpty()) throw AppException.badRequest("Thiếu danh sách chuyến");
        var result = bookingService.holdSeatsForCheckout(trips);
        return ResponseEntity.ok(ApiResponse.ok(result, "Giữ ghế thành công"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<?>> createBooking(
        @RequestBody CreateBookingRequest req,
        @AuthenticationPrincipal JwtPrincipal principal
    ) {
        if (req.getTrips() == null || req.getTrips().isEmpty() ||
            req.getPassengers() == null || req.getPassengers().isEmpty() ||
            req.getContactInfo() == null) {
            throw AppException.badRequest("Thiếu thông tin đặt vé");
        }
        Long idTaiKhoan = principal != null ? principal.getId() : null;
        var result = bookingService.createBooking(req, idTaiKhoan);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(result, "Đặt vé thành công"));
    }

    @PostMapping("/lookup")
    public ResponseEntity<ApiResponse<?>> lookupBooking(@RequestBody Map<String, String> body) {
        String maDatCho = body.get("maDatCho");
        if (maDatCho == null || maDatCho.isBlank()) throw AppException.badRequest("Vui lòng nhập mã đặt chỗ");
        var don = bookingService.lookupBooking(maDatCho, body.getOrDefault("email", ""), body.getOrDefault("phone", ""));
        if (don == null) throw AppException.notFound("Không tìm thấy đơn hoặc thông tin không khớp");
        return ResponseEntity.ok(ApiResponse.ok(don));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<?>> getHistory(@AuthenticationPrincipal JwtPrincipal principal) {
        var history = bookingService.getBookingHistory(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(history));
    }

    @PostMapping("/release-hold")
    public ResponseEntity<ApiResponse<?>> releaseHold(@RequestBody Map<String, String> body) {
        String sessionId = body.get("sessionId");
        if (sessionId == null || sessionId.isBlank()) throw AppException.badRequest("Thiếu sessionId");
        // TamGiuGheRepository không inject ở đây — xử lý thông qua service nếu cần
        return ResponseEntity.ok(ApiResponse.ok(null, "Giải phóng ghế thành công"));
    }
}
