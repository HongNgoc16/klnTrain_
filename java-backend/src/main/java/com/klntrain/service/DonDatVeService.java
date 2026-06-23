package com.klntrain.service;

import com.klntrain.dto.request.YeuCauDatVe;
import com.klntrain.entity.*;
import com.klntrain.repository.*;
import com.klntrain.util.NgoaiLeUngDung;
import com.klntrain.util.SinhMa;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DonDatVeService {

    private final DonDatVeRepository donDatVeRepo;
    private final VeRepository veRepo;
    private final HanhKhachRepository hanhKhachRepo;
    private final TamGiuGheRepository tamGiuGheRepo;
    private final KhuyenMaiRepository khuyenMaiRepo;

    @Transactional
    public Map<String, Object> giuGheTam(List<YeuCauDatVe.ThongTinChuyen> trips) {
        String sessionId = UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();
        LocalDateTime hetHan = LocalDateTime.now().plusMinutes(15);

        for (var trip : trips) {
            kiemTraGheTrong(trip.getIdChuyen(), trip.getPassengerSeats(), null);
            for (var ghe : trip.getPassengerSeats()) {
                TamGiuGhe tgg = TamGiuGhe.builder()
                    .idChuyen(trip.getIdChuyen())
                    .soToaThuTu(ghe.getSoToaThuTu())
                    .soGheTrongToa(ghe.getSoGhe())
                    .sessionId(sessionId)
                    .idGaLen(trip.getIdGaLen())
                    .idGaXuong(trip.getIdGaXuong())
                    .trangThai("dang_giu")
                    .thoiGianHetHan(hetHan)
                    .build();
                tamGiuGheRepo.save(tgg);
            }
        }

        return Map.of("sessionId", sessionId, "hetHan", hetHan);
    }

    @Transactional
    public Map<String, Object> taoDonDatVe(YeuCauDatVe req, Long idTaiKhoan) {
        // 1. Validate khuyến mãi
        KhuyenMai km = null;
        BigDecimal tienGiam = BigDecimal.ZERO;
        if (req.getMaKhuyenMai() != null && !req.getMaKhuyenMai().isBlank()) {
            km = khuyenMaiRepo.findByMaKhuyenMai(req.getMaKhuyenMai().toUpperCase())
                .orElseThrow(() -> NgoaiLeUngDung.loiYeuCau("Mã khuyến mãi không hợp lệ"));
            LocalDate today = LocalDate.now();
            if (today.isBefore(km.getNgayBatDau()) || today.isAfter(km.getNgayHetHan()))
                throw NgoaiLeUngDung.loiYeuCau("Mã khuyến mãi đã hết hạn");
            if (km.getSoLuong() != null && km.getDaDung() >= km.getSoLuong())
                throw NgoaiLeUngDung.loiYeuCau("Mã khuyến mãi đã hết lượt");
        }

        // 2. Tính tổng tiền
        BigDecimal tongTienVe = req.getTrips().stream()
            .flatMap(t -> t.getPassengerSeats().stream())
            .map(YeuCauDatVe.GheHanhKhach::getGiaVe)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal phiDichVu = req.getTrips().size() > 1 ? new BigDecimal("40000") : new BigDecimal("20000");
        BigDecimal tongTruocGiam = tongTienVe.add(phiDichVu);

        if (km != null && tongTruocGiam.compareTo(km.getGiaTri_donToiThieu()) >= 0) {
            if ("phan_tram".equals(km.getLoaiGiam())) {
                tienGiam = tongTruocGiam.multiply(km.getGiaTri()).divide(new BigDecimal("100"));
                if (km.getGiamToiDa() != null) tienGiam = tienGiam.min(km.getGiamToiDa());
            } else {
                tienGiam = km.getGiaTri().min(tongTruocGiam);
            }
        }
        BigDecimal tongThanhToan = tongTruocGiam.subtract(tienGiam);

        // 3. Kiểm tra ghế còn trống
        for (var trip : req.getTrips()) {
            kiemTraGheTrong(trip.getIdChuyen(), trip.getPassengerSeats(), trip.getSessionId());
        }

        // 4. Sinh mã
        String maDatCho;
        do { maDatCho = SinhMa.sinhMaDatCho(); }
        while (donDatVeRepo.existsByMaDatCho(maDatCho));
        String maDon = SinhMa.sinhMaDon();

        // 5. Tạo DonDatVe
        var lienLac = req.getContactInfo();
        var hanhKhachs = req.getPassengers();
        DonDatVe don = DonDatVe.builder()
            .maDon(maDon)
            .maDatCho(maDatCho)
            .idTaiKhoan(idTaiKhoan)
            .hoTenLienLac(lienLac.getHoTen() != null ? lienLac.getHoTen() : (hanhKhachs.isEmpty() ? "" : hanhKhachs.get(0).getHoTen()))
            .emailDatCho(lienLac.getEmail())
            .sdtDatCho(lienLac.getSoDienThoai().replaceAll("\\s", ""))
            .cccd(hanhKhachs.isEmpty() ? "000000000" : Optional.ofNullable(hanhKhachs.get(0).getCccd()).orElse("000000000"))
            .loaiVe(req.getTrips().size() > 1 ? "khu_hoi" : "mot_chieu")
            .tongTien(tongTruocGiam)
            .tienGiam(tienGiam)
            .tienThanhToan(tongThanhToan)
            .idKhuyenMai(km != null ? km.getIdKhuyenMai() : null)
            .trangThai("cho_thanh_toan")
            .thoiGianHetHan(LocalDateTime.now().plusMinutes(15))
            .build();
        don = donDatVeRepo.save(don);

        // 6. Tạo Ve + HanhKhach
        int idx = 0;
        for (var trip : req.getTrips()) {
            for (var ghe : trip.getPassengerSeats()) {
                var hk_req = idx < hanhKhachs.size() ? hanhKhachs.get(idx++) : hanhKhachs.get(hanhKhachs.size() - 1);
                String loaiHK = hk_req.isLaTreEm() ? "tre_em"
                    : hk_req.isLaNguoiCaoTuoi() ? "nguoi_cao_tuoi"
                    : hk_req.isLaSinhVien() ? "sinh_vien"
                    : "nguoi_lon";

                LocalDate ngaySinhParsed = null;
                if (hk_req.getNgaySinh() != null && !hk_req.getNgaySinh().isBlank()) {
                    try { ngaySinhParsed = LocalDate.parse(hk_req.getNgaySinh()); } catch (Exception ignored) {}
                }

                LocalDate finalNgaySinh = ngaySinhParsed;
                HanhKhach hanhKhach = (ngaySinhParsed != null)
                    ? hanhKhachRepo.findByHoTenAndNgaySinh(hk_req.getHoTen(), ngaySinhParsed).orElse(null)
                    : null;

                if (hanhKhach == null) {
                    hanhKhach = hanhKhachRepo.save(HanhKhach.builder()
                        .idTaiKhoan(idTaiKhoan)
                        .hoTen(hk_req.getHoTen())
                        .ngaySinh(finalNgaySinh)
                        .cccd(hk_req.getCccd())
                        .loaiHanhKhach(loaiHK)
                        .soDienThoai(lienLac.getSoDienThoai().replaceAll("\\s", ""))
                        .laChinh(idx == 1)
                        .build());
                }

                Ve ve = Ve.builder()
                    .donDatVe(don)
                    .hanhKhach(hanhKhach)
                    .chuyenTau(new ChuyenTau().toBuilder().idChuyen(trip.getIdChuyen()).build())
                    .soToaThuTu(ghe.getSoToaThuTu())
                    .soGheTrongToa(ghe.getSoGhe())
                    .gaLen(trip.getIdGaLen() != null ? GaTau.builder().idGa(trip.getIdGaLen()).build() : null)
                    .gaXuong(trip.getIdGaXuong() != null ? GaTau.builder().idGa(trip.getIdGaXuong()).build() : null)
                    .loaiHanhKhach(loaiHK)
                    .giaVe(ghe.getGiaVe())
                    .trangThai("cho_xac_nhan")
                    .ngayXuatVe(LocalDateTime.now())
                    .build();
                veRepo.save(ve);
            }

            if (trip.getSessionId() != null) {
                tamGiuGheRepo.releaseBySessionId(trip.getSessionId());
            }
        }

        // 7. Tăng lượt dùng khuyến mãi
        if (km != null) {
            km.setDaDung(km.getDaDung() == null ? 1 : km.getDaDung() + 1);
            khuyenMaiRepo.save(km);
        }

        return Map.of(
            "maDon", maDon,
            "maDatCho", maDatCho,
            "idDon", don.getIdDonDatVe(),
            "tongThanhToan", tongThanhToan,
            "tienGiam", tienGiam
        );
    }

    public Map<String, Object> traDonDatVe(String maDatCho, String email, String phone) {
        DonDatVe don = donDatVeRepo.findByMaDatCho(maDatCho).orElse(null);
        if (don == null) return null;

        boolean emailOk = don.getEmailDatCho().equalsIgnoreCase(email.strip());
        String phoneClean = don.getSdtDatCho().replaceAll("\\D", "");
        String inputPhone = phone.strip().replaceAll("\\D", "");
        boolean phoneOk = phoneClean.equals(inputPhone) ||
            phoneClean.substring(Math.max(0, phoneClean.length() - 9)).equals(inputPhone.substring(Math.max(0, inputPhone.length() - 9)));

        if (!emailOk || !phoneOk) return null;

        return dinhDangDon(don);
    }

    public List<Map<String, Object>> layLichSuDatVe(Long idTaiKhoan) {
        return donDatVeRepo.findByIdTaiKhoanOrderByThoiGianDatDesc(idTaiKhoan)
            .stream().map(this::dinhDangDon).toList();
    }

    public Map<String, Object> dinhDangDon(DonDatVe don) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("idDon", don.getIdDonDatVe());
        m.put("maDon", don.getMaDon());
        m.put("maDatCho", don.getMaDatCho());
        m.put("trangThai", don.getTrangThai());
        m.put("loaiVe", don.getLoaiVe());
        m.put("tongTien", don.getTongTien());
        m.put("tienGiam", don.getTienGiam());
        m.put("tienThanhToan", don.getTienThanhToan());
        m.put("hoTenLienLac", don.getHoTenLienLac());
        m.put("emailDatCho", don.getEmailDatCho());
        m.put("sdtDatCho", don.getSdtDatCho());
        m.put("thoiGianDat", don.getThoiGianDat());
        m.put("thoiGianHetHan", don.getThoiGianHetHan());

        List<Map<String, Object>> veData = new ArrayList<>();
        if (don.getVeList() != null) {
            for (Ve ve : don.getVeList()) {
                Map<String, Object> vm = new LinkedHashMap<>();
                vm.put("idVe", ve.getIdVe());
                vm.put("idChuyen", ve.getChuyenTau() != null ? ve.getChuyenTau().getIdChuyen() : null);
                vm.put("soToa", ve.getSoToaThuTu());
                vm.put("soGhe", ve.getSoGheTrongToa());
                vm.put("giaVe", ve.getGiaVe());
                vm.put("loaiHanhKhach", ve.getLoaiHanhKhach());
                vm.put("trangThai", ve.getTrangThai());
                if (ve.getHanhKhach() != null) {
                    vm.put("hanhKhach", Map.of(
                        "hoTen", ve.getHanhKhach().getHoTen(),
                        "ngaySinh", ve.getHanhKhach().getNgaySinh() != null ? ve.getHanhKhach().getNgaySinh().toString() : "",
                        "cccd", ve.getHanhKhach().getCccd() != null ? ve.getHanhKhach().getCccd() : ""
                    ));
                }
                veData.add(vm);
            }
        }
        m.put("ve", veData);
        return m;
    }

    private void kiemTraGheTrong(Long idChuyen, List<YeuCauDatVe.GheHanhKhach> ghes, String sessionId) {
        for (var ghe : ghes) {
            long cnt = veRepo.countActiveByChuyenAndGhe(idChuyen, ghe.getSoToaThuTu(), ghe.getSoGhe());
            if (cnt > 0) throw NgoaiLeUngDung.xungDot("Ghế " + ghe.getSoGhe() + " toa " + ghe.getSoToaThuTu() + " đã được đặt");

            List<TamGiuGhe> holds = tamGiuGheRepo.findConflictingHolds(
                idChuyen, ghe.getSoToaThuTu(), List.of(ghe.getSoGhe()),
                LocalDateTime.now(), sessionId
            );
            if (!holds.isEmpty()) throw NgoaiLeUngDung.xungDot("Ghế đang được giữ bởi người khác");
        }
    }
}
