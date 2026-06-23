package com.klntrain.controller;

import com.klntrain.dto.request.YeuCauDatVe;
import com.klntrain.dto.response.PhanHoiApi;
import com.klntrain.security.ThongTinNguoiDung;
import com.klntrain.service.DonDatVeService;
import com.klntrain.util.NgoaiLeUngDung;
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
public class DonDatVeController {

    private final DonDatVeService donDatVeService;

    @PostMapping("/hold-seats")
    public ResponseEntity<PhanHoiApi<?>> giuGheTam(@RequestBody Map<String, Object> body) {
        @SuppressWarnings("unchecked")
        var trips = (List<YeuCauDatVe.ThongTinChuyen>) body.get("trips");
        if (trips == null || trips.isEmpty()) throw NgoaiLeUngDung.loiYeuCau("Thiếu danh sách chuyến");
        var result = donDatVeService.giuGheTam(trips);
        return ResponseEntity.ok(PhanHoiApi.thanhCong(result, "Giữ ghế thành công"));
    }

    @PostMapping
    public ResponseEntity<PhanHoiApi<?>> taoDonDatVe(
        @RequestBody YeuCauDatVe req,
        @AuthenticationPrincipal ThongTinNguoiDung principal
    ) {
        if (req.getTrips() == null || req.getTrips().isEmpty() ||
            req.getPassengers() == null || req.getPassengers().isEmpty() ||
            req.getContactInfo() == null) {
            throw NgoaiLeUngDung.loiYeuCau("Thiếu thông tin đặt vé");
        }
        Long idTaiKhoan = principal != null ? principal.getId() : null;
        var result = donDatVeService.taoDonDatVe(req, idTaiKhoan);
        return ResponseEntity.status(HttpStatus.CREATED).body(PhanHoiApi.thanhCong(result, "Đặt vé thành công"));
    }

    @PostMapping("/lookup")
    public ResponseEntity<PhanHoiApi<?>> traDonDatVe(@RequestBody Map<String, String> body) {
        String maDatCho = body.get("maDatCho");
        if (maDatCho == null || maDatCho.isBlank()) throw NgoaiLeUngDung.loiYeuCau("Vui lòng nhập mã đặt chỗ");
        var don = donDatVeService.traDonDatVe(maDatCho, body.getOrDefault("email", ""), body.getOrDefault("phone", ""));
        if (don == null) throw NgoaiLeUngDung.khongTimThay("Không tìm thấy đơn hoặc thông tin không khớp");
        return ResponseEntity.ok(PhanHoiApi.thanhCong(don));
    }

    @GetMapping("/history")
    public ResponseEntity<PhanHoiApi<?>> layLichSu(@AuthenticationPrincipal ThongTinNguoiDung principal) {
        var history = donDatVeService.layLichSuDatVe(principal.getId());
        return ResponseEntity.ok(PhanHoiApi.thanhCong(history));
    }

    @PostMapping("/release-hold")
    public ResponseEntity<PhanHoiApi<?>> giaPhongGhe(@RequestBody Map<String, String> body) {
        String sessionId = body.get("sessionId");
        if (sessionId == null || sessionId.isBlank()) throw NgoaiLeUngDung.loiYeuCau("Thiếu sessionId");
        return ResponseEntity.ok(PhanHoiApi.thanhCong(null, "Giải phóng ghế thành công"));
    }
}
