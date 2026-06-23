package com.klntrain.controller.dieuphoi;

import com.klntrain.dto.response.PhanHoiApi;
import com.klntrain.security.ThongTinNguoiDung;
import com.klntrain.service.DieuPhoiService;
import com.klntrain.util.NgoaiLeUngDung;
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
    public ResponseEntity<PhanHoiApi<?>> getDashboard() {
        return ResponseEntity.ok(PhanHoiApi.thanhCong(dieuPhoiService.getDashboard()));
    }

    // ─── Danh sách chuyến ─────────────────────────────────────────
    @GetMapping("/chuyen-tau")
    public ResponseEntity<PhanHoiApi<?>> getChuyenTauList(
        @RequestParam(required = false) String ngay,
        @RequestParam(required = false) String ngayDen,
        @RequestParam(required = false) String trangThai,
        @RequestParam(required = false) Long idTau,
        @RequestParam(required = false) Long idLichChay,
        @RequestParam(defaultValue = "1") int page,
        @RequestParam(defaultValue = "20") int limit
    ) {
        var result = dieuPhoiService.getChuyenTauList(ngay, ngayDen, trangThai, idTau, idLichChay, page, limit);
        return ResponseEntity.ok(PhanHoiApi.thanhCong(result));
    }

    // ─── Chi tiết chuyến ──────────────────────────────────────────
    @GetMapping("/chuyen-tau/{id}")
    public ResponseEntity<PhanHoiApi<?>> getChuyenDetail(@PathVariable Long id) {
        return ResponseEntity.ok(PhanHoiApi.thanhCong(dieuPhoiService.getChuyenDetail(id)));
    }

    // ─── Cập nhật trạng thái chuyến ───────────────────────────────
    @PutMapping("/chuyen-tau/{id}/trang-thai")
    public ResponseEntity<PhanHoiApi<?>> updateTrangThai(
        @PathVariable Long id,
        @RequestBody Map<String, String> body,
        @AuthenticationPrincipal ThongTinNguoiDung principal
    ) {
        String trangThai = body.get("trangThai");
        String ghiChu    = body.get("ghiChu");
        if (trangThai == null) throw NgoaiLeUngDung.loiYeuCau("Thiếu trangThai");
        dieuPhoiService.updateTrangThai(id, trangThai, ghiChu, principal.getId());
        return ResponseEntity.ok(PhanHoiApi.thanhCong(
            Map.of("idChuyen", id, "trangThai", trangThai),
            "Cập nhật trạng thái thành công"
        ));
    }

    // ─── Ghi nhận sự kiện ─────────────────────────────────────────
    @PostMapping("/chuyen-tau/{id}/su-kien")
    public ResponseEntity<PhanHoiApi<?>> logSuKien(
        @PathVariable Long id,
        @RequestBody Map<String, Object> body,
        @AuthenticationPrincipal ThongTinNguoiDung principal
    ) {
        String loaiSuKien = (String) body.get("loaiSuKien");
        if (loaiSuKien == null) throw NgoaiLeUngDung.loiYeuCau("Thiếu loại sự kiện");
        String moTa       = (String) body.get("moTa");
        Integer delayPhut = body.get("delayPhut") != null ? Integer.parseInt(body.get("delayPhut").toString()) : null;
        Long idGaAnhHuong = body.get("idGaAnhHuong") != null ? Long.parseLong(body.get("idGaAnhHuong").toString()) : null;
        Integer soToa     = body.get("soToa") != null ? Integer.parseInt(body.get("soToa").toString()) : null;

        var result = dieuPhoiService.logSuKien(id, loaiSuKien, moTa, delayPhut, idGaAnhHuong, soToa, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(PhanHoiApi.thanhCong(result, "Ghi nhận sự kiện thành công"));
    }

    // ─── Lịch chạy ────────────────────────────────────────────────
    @GetMapping("/lich-chay")
    public ResponseEntity<PhanHoiApi<?>> getLichChayList(@RequestParam(required = false) Long idTau) {
        return ResponseEntity.ok(PhanHoiApi.thanhCong(dieuPhoiService.getLichChayList(idTau)));
    }

    @PostMapping("/lich-chay")
    public ResponseEntity<PhanHoiApi<?>> createLichChay(@RequestBody Map<String, Object> body) {
        var result = dieuPhoiService.createLichChay(body);
        return ResponseEntity.status(HttpStatus.CREATED).body(PhanHoiApi.thanhCong(result, "Tạo lịch chạy thành công"));
    }

    @PutMapping("/lich-chay/{id}")
    public ResponseEntity<PhanHoiApi<?>> updateLichChay(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        dieuPhoiService.updateLichChay(id, body);
        return ResponseEntity.ok(PhanHoiApi.thanhCong(null, "Cập nhật lịch chạy thành công"));
    }

    @DeleteMapping("/lich-chay/{id}")
    public ResponseEntity<PhanHoiApi<?>> deleteLichChay(@PathVariable Long id) {
        dieuPhoiService.deleteLichChay(id);
        return ResponseEntity.ok(PhanHoiApi.thanhCong(null, "Xóa lịch chạy thành công"));
    }

    // ─── Ga dừng ──────────────────────────────────────────────────
    @GetMapping("/lich-chay/{id}/ga-dung")
    public ResponseEntity<PhanHoiApi<?>> getGaDungList(@PathVariable Long id) {
        return ResponseEntity.ok(PhanHoiApi.thanhCong(dieuPhoiService.getGaDungList(id)));
    }

    @PostMapping("/lich-chay/{id}/ga-dung")
    public ResponseEntity<PhanHoiApi<?>> addGaDung(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        var result = dieuPhoiService.addGaDung(id, body);
        return ResponseEntity.status(HttpStatus.CREATED).body(PhanHoiApi.thanhCong(result, "Thêm ga dừng thành công"));
    }

    @PutMapping("/ga-dung/{id}")
    public ResponseEntity<PhanHoiApi<?>> updateGaDung(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        dieuPhoiService.updateGaDung(id, body);
        return ResponseEntity.ok(PhanHoiApi.thanhCong(null, "Cập nhật ga dừng thành công"));
    }

    @DeleteMapping("/ga-dung/{id}")
    public ResponseEntity<PhanHoiApi<?>> removeGaDung(@PathVariable Long id) {
        dieuPhoiService.removeGaDung(id);
        return ResponseEntity.ok(PhanHoiApi.thanhCong(null, "Xóa ga dừng thành công"));
    }

    // ─── Toa chuyến ───────────────────────────────────────────────
    @PostMapping("/chuyen-tau/{id}/toa")
    public ResponseEntity<PhanHoiApi<?>> addToaChuyen(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        var result = dieuPhoiService.addToaChuyen(id, body);
        return ResponseEntity.status(HttpStatus.CREATED).body(PhanHoiApi.thanhCong(result, "Thêm toa thành công"));
    }

    @PutMapping("/toa/{toaId}")
    public ResponseEntity<PhanHoiApi<?>> updateToaChuyen(@PathVariable Long toaId, @RequestBody Map<String, Object> body) {
        var result = dieuPhoiService.updateToaChuyen(toaId, body);
        return ResponseEntity.ok(PhanHoiApi.thanhCong(result, "Cập nhật toa thành công"));
    }

    @DeleteMapping("/toa/{toaId}")
    public ResponseEntity<PhanHoiApi<?>> removeToaChuyen(@PathVariable Long toaId) {
        dieuPhoiService.removeToaChuyen(toaId);
        return ResponseEntity.ok(PhanHoiApi.thanhCong(null, "Xóa toa thành công"));
    }

    // ─── Sinh chuyến ──────────────────────────────────────────────
    @PostMapping("/sinh-chuyen")
    public ResponseEntity<PhanHoiApi<?>> sinhChuyen(@RequestBody Map<String, Object> body) {
        Long idLichChay = Long.parseLong(body.get("idLichChay").toString());
        String tuNgay   = (String) body.get("tuNgay");
        String denNgay  = (String) body.get("denNgay");
        if (idLichChay == null || tuNgay == null || denNgay == null)
            throw NgoaiLeUngDung.loiYeuCau("Thiếu thông tin bắt buộc");
        var result = dieuPhoiService.sinhChuyenTau(idLichChay, tuNgay, denNgay);
        return ResponseEntity.ok(PhanHoiApi.thanhCong(result, "Sinh chuyến thành công"));
    }

    // ─── Metadata ─────────────────────────────────────────────────
    @GetMapping("/tau")
    public ResponseEntity<PhanHoiApi<?>> getTauList() {
        return ResponseEntity.ok(PhanHoiApi.thanhCong(dieuPhoiService.getTauList()));
    }

    @GetMapping("/ga")
    public ResponseEntity<PhanHoiApi<?>> getGaList() {
        return ResponseEntity.ok(PhanHoiApi.thanhCong(dieuPhoiService.getGaList()));
    }

    @GetMapping("/loai-toa")
    public ResponseEntity<PhanHoiApi<?>> getLoaiToaList() {
        return ResponseEntity.ok(PhanHoiApi.thanhCong(dieuPhoiService.getLoaiToaList()));
    }
}
