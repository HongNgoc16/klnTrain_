package com.klntrain.controller.dieuphoi;

import com.klntrain.dto.response.ApiResponse;
import com.klntrain.security.JwtPrincipal;
import com.klntrain.service.DieuPhoiService;
import com.klntrain.util.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/dispatch")
@RequiredArgsConstructor
public class DieuPhoiController {

    private final DieuPhoiService dieuPhoiService;

    // ─── Dashboard ────────────────────────────────────────────────
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<?>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.ok(dieuPhoiService.getDashboard()));
    }

    // ─── Danh sách chuyến ─────────────────────────────────────────
    @GetMapping("/chuyen-tau")
    public ResponseEntity<ApiResponse<?>> getChuyenTauList(
        @RequestParam(required = false) String ngay,
        @RequestParam(required = false) String ngayDen,
        @RequestParam(required = false) String trangThai,
        @RequestParam(required = false) Long idTau,
        @RequestParam(required = false) Long idLichChay,
        @RequestParam(defaultValue = "1") int page,
        @RequestParam(defaultValue = "20") int limit
    ) {
        var result = dieuPhoiService.getChuyenTauList(ngay, ngayDen, trangThai, idTau, idLichChay, page, limit);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    // ─── Chi tiết chuyến ──────────────────────────────────────────
    @GetMapping("/chuyen-tau/{id}")
    public ResponseEntity<ApiResponse<?>> getChuyenDetail(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(dieuPhoiService.getChuyenDetail(id)));
    }

    // ─── Cập nhật trạng thái chuyến ───────────────────────────────
    @PutMapping("/chuyen-tau/{id}/trang-thai")
    public ResponseEntity<ApiResponse<?>> updateTrangThai(
        @PathVariable Long id,
        @RequestBody Map<String, String> body,
        @AuthenticationPrincipal JwtPrincipal principal
    ) {
        String trangThai = body.get("trangThai");
        String ghiChu    = body.get("ghiChu");
        if (trangThai == null) throw AppException.badRequest("Thiếu trangThai");
        dieuPhoiService.updateTrangThai(id, trangThai, ghiChu, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(
            Map.of("idChuyen", id, "trangThai", trangThai),
            "Cập nhật trạng thái thành công"
        ));
    }

    // ─── Ghi nhận sự kiện ─────────────────────────────────────────
    @PostMapping("/chuyen-tau/{id}/su-kien")
    public ResponseEntity<ApiResponse<?>> logSuKien(
        @PathVariable Long id,
        @RequestBody Map<String, Object> body,
        @AuthenticationPrincipal JwtPrincipal principal
    ) {
        String loaiSuKien = (String) body.get("loaiSuKien");
        if (loaiSuKien == null) throw AppException.badRequest("Thiếu loại sự kiện");
        String moTa       = (String) body.get("moTa");
        Integer delayPhut = body.get("delayPhut") != null ? Integer.parseInt(body.get("delayPhut").toString()) : null;
        Long idGaAnhHuong = body.get("idGaAnhHuong") != null ? Long.parseLong(body.get("idGaAnhHuong").toString()) : null;
        Integer soToa     = body.get("soToa") != null ? Integer.parseInt(body.get("soToa").toString()) : null;

        var result = dieuPhoiService.logSuKien(id, loaiSuKien, moTa, delayPhut, idGaAnhHuong, soToa, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(result, "Ghi nhận sự kiện thành công"));
    }

    // ─── Lịch chạy ────────────────────────────────────────────────
    @GetMapping("/lich-chay")
    public ResponseEntity<ApiResponse<?>> getLichChayList(@RequestParam(required = false) Long idTau) {
        return ResponseEntity.ok(ApiResponse.ok(dieuPhoiService.getLichChayList(idTau)));
    }

    @PostMapping("/lich-chay")
    public ResponseEntity<ApiResponse<?>> createLichChay(@RequestBody Map<String, Object> body) {
        var result = dieuPhoiService.createLichChay(body);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(result, "Tạo lịch chạy thành công"));
    }

    @PutMapping("/lich-chay/{id}")
    public ResponseEntity<ApiResponse<?>> updateLichChay(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        dieuPhoiService.updateLichChay(id, body);
        return ResponseEntity.ok(ApiResponse.ok(null, "Cập nhật lịch chạy thành công"));
    }

    @DeleteMapping("/lich-chay/{id}")
    public ResponseEntity<ApiResponse<?>> deleteLichChay(@PathVariable Long id) {
        dieuPhoiService.deleteLichChay(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Xóa lịch chạy thành công"));
    }

    // ─── Ga dừng ──────────────────────────────────────────────────
    @GetMapping("/lich-chay/{id}/ga-dung")
    public ResponseEntity<ApiResponse<?>> getGaDungList(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(dieuPhoiService.getGaDungList(id)));
    }

    @PostMapping("/lich-chay/{id}/ga-dung")
    public ResponseEntity<ApiResponse<?>> addGaDung(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        var result = dieuPhoiService.addGaDung(id, body);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(result, "Thêm ga dừng thành công"));
    }

    @PutMapping("/ga-dung/{id}")
    public ResponseEntity<ApiResponse<?>> updateGaDung(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        dieuPhoiService.updateGaDung(id, body);
        return ResponseEntity.ok(ApiResponse.ok(null, "Cập nhật ga dừng thành công"));
    }

    @DeleteMapping("/ga-dung/{id}")
    public ResponseEntity<ApiResponse<?>> removeGaDung(@PathVariable Long id) {
        dieuPhoiService.removeGaDung(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Xóa ga dừng thành công"));
    }

    // ─── Toa chuyến ───────────────────────────────────────────────
    @PostMapping("/chuyen-tau/{id}/toa")
    public ResponseEntity<ApiResponse<?>> addToaChuyen(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        var result = dieuPhoiService.addToaChuyen(id, body);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(result, "Thêm toa thành công"));
    }

    @PutMapping("/toa/{toaId}")
    public ResponseEntity<ApiResponse<?>> updateToaChuyen(@PathVariable Long toaId, @RequestBody Map<String, Object> body) {
        var result = dieuPhoiService.updateToaChuyen(toaId, body);
        return ResponseEntity.ok(ApiResponse.ok(result, "Cập nhật toa thành công"));
    }

    @DeleteMapping("/toa/{toaId}")
    public ResponseEntity<ApiResponse<?>> removeToaChuyen(@PathVariable Long toaId) {
        dieuPhoiService.removeToaChuyen(toaId);
        return ResponseEntity.ok(ApiResponse.ok(null, "Xóa toa thành công"));
    }

    // ─── Sinh chuyến ──────────────────────────────────────────────
    @PostMapping("/sinh-chuyen")
    public ResponseEntity<ApiResponse<?>> sinhChuyen(@RequestBody Map<String, Object> body) {
        Long idLichChay = Long.parseLong(body.get("idLichChay").toString());
        String tuNgay   = (String) body.get("tuNgay");
        String denNgay  = (String) body.get("denNgay");
        if (idLichChay == null || tuNgay == null || denNgay == null)
            throw AppException.badRequest("Thiếu thông tin bắt buộc");
        var result = dieuPhoiService.sinhChuyenTau(idLichChay, tuNgay, denNgay);
        return ResponseEntity.ok(ApiResponse.ok(result, "Sinh chuyến thành công"));
    }

    // ─── Metadata ─────────────────────────────────────────────────
    @GetMapping("/tau")
    public ResponseEntity<ApiResponse<?>> getTauList() {
        return ResponseEntity.ok(ApiResponse.ok(dieuPhoiService.getTauList()));
    }

    @GetMapping("/ga")
    public ResponseEntity<ApiResponse<?>> getGaList() {
        return ResponseEntity.ok(ApiResponse.ok(dieuPhoiService.getGaList()));
    }

    @GetMapping("/loai-toa")
    public ResponseEntity<ApiResponse<?>> getLoaiToaList() {
        return ResponseEntity.ok(ApiResponse.ok(dieuPhoiService.getLoaiToaList()));
    }
}
