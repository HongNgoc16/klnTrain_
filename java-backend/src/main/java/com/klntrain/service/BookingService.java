package com.klntrain.service;

import com.klntrain.dto.request.CreateBookingRequest;
import com.klntrain.entity.*;
import com.klntrain.repository.*;
import com.klntrain.util.AppException;
import com.klntrain.util.CodeGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final DonDatVeRepository donDatVeRepo;
    private final VeRepository veRepo;
    private final HanhKhachRepository hanhKhachRepo;
    private final TamGiuGheRepository tamGiuGheRepo;
    private final KhuyenMaiRepository khuyenMaiRepo;

    // Giữ ghế tạm (trước khi điền form)
    @Transactional
    public Map<String, Object> holdSeatsForCheckout(List<CreateBookingRequest.TripInfo> trips) {
        String sessionId = UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();
        LocalDateTime hetHan = LocalDateTime.now().plusMinutes(15);

        for (var trip : trips) {
            checkSeatsAvailable(trip.getIdChuyen(), trip.getPassengerSeats(), null);
            for (var ps : trip.getPassengerSeats()) {
                TamGiuGhe tgg = TamGiuGhe.builder()
                    .idChuyen(trip.getIdChuyen())
                    .soToaThuTu(ps.getSoToaThuTu())
                    .soGheTrongToa(ps.getSeatNumber())
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
    public Map<String, Object> createBooking(CreateBookingRequest req, Long idTaiKhoan) {
        // 1. Validate khuyến mãi
        KhuyenMai km = null;
        BigDecimal tienGiam = BigDecimal.ZERO;
        if (req.getMaKhuyenMai() != null && !req.getMaKhuyenMai().isBlank()) {
            km = khuyenMaiRepo.findByMaKhuyenMai(req.getMaKhuyenMai().toUpperCase())
                .orElseThrow(() -> AppException.badRequest("Mã khuyến mãi không hợp lệ"));
            LocalDate today = LocalDate.now();
            if (today.isBefore(km.getNgayBatDau()) || today.isAfter(km.getNgayHetHan()))
                throw AppException.badRequest("Mã khuyến mãi đã hết hạn");
            if (km.getSoLuong() != null && km.getDaDung() >= km.getSoLuong())
                throw AppException.badRequest("Mã khuyến mãi đã hết lượt");
        }

        // 2. Tính tổng tiền
        BigDecimal tongTienVe = req.getTrips().stream()
            .flatMap(t -> t.getPassengerSeats().stream())
            .map(CreateBookingRequest.PassengerSeat::getSeatPrice)
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
            checkSeatsAvailable(trip.getIdChuyen(), trip.getPassengerSeats(), trip.getSessionId());
        }

        // 4. Sinh mã
        String maDatCho;
        do { maDatCho = CodeGenerator.genBookingCode(); }
        while (donDatVeRepo.existsByMaDatCho(maDatCho));
        String maDon = CodeGenerator.genOrderCode();

        // 5. Tạo DonDatVe
        var contact = req.getContactInfo();
        var passengers = req.getPassengers();
        DonDatVe don = DonDatVe.builder()
            .maDon(maDon)
            .maDatCho(maDatCho)
            .idTaiKhoan(idTaiKhoan)
            .hoTenLienLac(contact.getHoTen() != null ? contact.getHoTen() : (passengers.isEmpty() ? "" : passengers.get(0).getHoTen()))
            .emailDatCho(contact.getEmail())
            .sdtDatCho(contact.getPhone().replaceAll("\\s", ""))
            .cccd(passengers.isEmpty() ? "000000000" : Optional.ofNullable(passengers.get(0).getCccd()).orElse("000000000"))
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
        int pIdx = 0;
        for (var trip : req.getTrips()) {
            for (var ps : trip.getPassengerSeats()) {
                var p = pIdx < passengers.size() ? passengers.get(pIdx++) : passengers.get(passengers.size() - 1);
                String loaiHK = p.isChild() ? "tre_em" : p.isElderly() ? "nguoi_cao_tuoi" : p.isStudent() ? "sinh_vien" : "nguoi_lon";

                LocalDate ngaySinhParsed = null;
                if (p.getNgaySinh() != null && !p.getNgaySinh().isBlank()) {
                    try { ngaySinhParsed = LocalDate.parse(p.getNgaySinh()); } catch (Exception ignored) {}
                }

                LocalDate finalNgaySinh = ngaySinhParsed;
                HanhKhach hk = (ngaySinhParsed != null)
                    ? hanhKhachRepo.findByHoTenAndNgaySinh(p.getHoTen(), ngaySinhParsed).orElse(null)
                    : null;

                if (hk == null) {
                    hk = hanhKhachRepo.save(HanhKhach.builder()
                        .idTaiKhoan(idTaiKhoan)
                        .hoTen(p.getHoTen())
                        .ngaySinh(finalNgaySinh)
                        .cccd(p.getCccd())
                        .loaiHanhKhach(loaiHK)
                        .soDienThoai(contact.getPhone().replaceAll("\\s", ""))
                        .laChinh(pIdx == 1)
                        .build());
                }

                Ve ve = Ve.builder()
                    .donDatVe(don)
                    .hanhKhach(hk)
                    .chuyenTau(new ChuyenTau().toBuilder().idChuyen(trip.getIdChuyen()).build())
                    .soToaThuTu(ps.getSoToaThuTu())
                    .soGheTrongToa(ps.getSeatNumber())
                    .gaLen(trip.getIdGaLen() != null ? GaTau.builder().idGa(trip.getIdGaLen()).build() : null)
                    .gaXuong(trip.getIdGaXuong() != null ? GaTau.builder().idGa(trip.getIdGaXuong()).build() : null)
                    .loaiHanhKhach(loaiHK)
                    .giaVe(ps.getSeatPrice())
                    .trangThai("cho_xac_nhan")
                    .ngayXuatVe(LocalDateTime.now())
                    .build();
                veRepo.save(ve);
            }

            // Cập nhật / tạo TamGiuGhe
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

    public Map<String, Object> lookupBooking(String maDatCho, String email, String phone) {
        DonDatVe don = donDatVeRepo.findByMaDatCho(maDatCho)
            .orElse(null);
        if (don == null) return null;

        boolean emailOk = don.getEmailDatCho().equalsIgnoreCase(email.strip());
        String phoneClean = don.getSdtDatCho().replaceAll("\\D", "");
        String inputPhone = phone.strip().replaceAll("\\D", "");
        boolean phoneOk = phoneClean.equals(inputPhone) ||
            phoneClean.substring(Math.max(0, phoneClean.length() - 9)).equals(inputPhone.substring(Math.max(0, inputPhone.length() - 9)));

        if (!emailOk || !phoneOk) return null;

        return formatDon(don);
    }

    public List<Map<String, Object>> getBookingHistory(Long idTaiKhoan) {
        return donDatVeRepo.findByIdTaiKhoanOrderByThoiGianDatDesc(idTaiKhoan)
            .stream().map(this::formatDon).toList();
    }

    public Map<String, Object> formatDon(DonDatVe don) {
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

    private void checkSeatsAvailable(Long idChuyen, List<CreateBookingRequest.PassengerSeat> pSeats, String sessionId) {
        for (var ps : pSeats) {
            long cnt = veRepo.countActiveByChuyenAndGhe(idChuyen, ps.getSoToaThuTu(), ps.getSeatNumber());
            if (cnt > 0) throw AppException.conflict("Ghế " + ps.getSeatNumber() + " toa " + ps.getSoToaThuTu() + " đã được đặt");

            // Kiểm tra TamGiuGhe
            List<TamGiuGhe> holds = tamGiuGheRepo.findConflictingHolds(
                idChuyen, ps.getSoToaThuTu(), List.of(ps.getSeatNumber()),
                LocalDateTime.now(), sessionId
            );
            if (!holds.isEmpty()) throw AppException.conflict("Ghế đang được giữ bởi người khác");
        }
    }
}
