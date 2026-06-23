package com.klntrain.service;

import com.klntrain.entity.*;
import com.klntrain.repository.*;
import com.klntrain.util.NgoaiLeUngDung;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DieuPhoiService {

    private final ChuyenTauRepository chuyenTauRepo;
    private final DieuPhoiRepository dieuPhoiRepo;
    private final LichChayRepository lichChayRepo;
    private final LichTrinhChuyenRepository lichTrinhChuyenRepo;
    private final ToaChuyenRepository toaChuyenRepo;
    private final ThongBaoRepository thongBaoRepo;
    private final VeRepository veRepo;
    private final EntityManager em;

    public Map<String, Object> getDashboard() {
        LocalDate today = LocalDate.now();

        List<ChuyenTau> todayTrips = chuyenTauRepo.findByNgayChayWithDetails(today);

        Map<String, Integer> byStatus = new LinkedHashMap<>();
        for (ChuyenTau ct : todayTrips) {
            byStatus.merge(ct.getTrangThai(), 1, Integer::sum);
        }

        long tomorrowCount = chuyenTauRepo.findByNgayChayOrderByLichChayGioKhoiHanhAsc(today.plusDays(1)).size();

        List<DieuPhoi> recentEvents = dieuPhoiRepo.findAll().stream()
            .filter(e -> e.getThoiGianTao().isAfter(java.time.LocalDateTime.now().minusHours(24)))
            .sorted(Comparator.comparing(DieuPhoi::getThoiGianTao).reversed())
            .limit(10)
            .toList();

        return Map.of(
            "today", Map.of(
                "total", todayTrips.size(),
                "byStatus", byStatus,
                "trips", todayTrips.stream().map(this::mapChuyenTau).toList()
            ),
            "tomorrowCount", tomorrowCount,
            "recentEvents", recentEvents.stream().map(e -> Map.of(
                "id", e.getIdDieuPhoi(),
                "idChuyen", e.getIdChuyen(),
                "loaiSuKien", e.getLoaiSuKien(),
                "moTa", e.getMoTa() != null ? e.getMoTa() : "",
                "delayPhut", e.getDelayPhut() != null ? e.getDelayPhut() : 0,
                "thoiGian", e.getThoiGianTao()
            )).toList()
        );
    }

    @Transactional
    public Map<String, Object> logSuKien(Long idChuyen, String loaiSuKien, String moTa,
                                          Integer delayPhut, Long idGaAnhHuong, Integer soToa, Long nguoiTao) {
        ChuyenTau ct = chuyenTauRepo.findById(idChuyen)
            .orElseThrow(() -> NgoaiLeUngDung.khongTimThay("Không tìm thấy chuyến tàu"));

        if ("da_chay".equals(ct.getTrangThai())) {
            throw NgoaiLeUngDung.loiYeuCau("Chuyến tàu đã chạy, không thể ghi nhận sự kiện");
        }

        DieuPhoi dp = DieuPhoi.builder()
            .idChuyen(idChuyen)
            .loaiSuKien(loaiSuKien)
            .moTa(moTa)
            .delayPhut(delayPhut)
            .idGaAnhHuong(idGaAnhHuong)
            .soToa(soToa)
            .nguoiTao(nguoiTao)
            .trangThai("hieu_luc")
            .build();
        dp = dieuPhoiRepo.save(dp);

        // Cập nhật trạng thái chuyến
        if ("delay".equals(loaiSuKien)) {
            ct.setTrangThai("dieu_chinh");
            chuyenTauRepo.save(ct);
        } else if ("cancel".equals(loaiSuKien)) {
            ct.setTrangThai("huy");
            chuyenTauRepo.save(ct);
        }

        // Gửi thông báo khách hàng có vé active
        notifyCustomers(idChuyen, ct, loaiSuKien, moTa, delayPhut);

        return Map.of("id", dp.getIdDieuPhoi(), "message", "Ghi nhận sự kiện thành công");
    }

    @Transactional
    public void updateTrangThai(Long idChuyen, String trangThai, String ghiChu, Long nguoiTao) {
        List<String> valid = List.of("dung_gio", "da_chay", "huy", "dieu_chinh", "sap_den");
        if (!valid.contains(trangThai)) throw NgoaiLeUngDung.loiYeuCau("Trạng thái không hợp lệ");

        ChuyenTau ct = chuyenTauRepo.findById(idChuyen)
            .orElseThrow(() -> NgoaiLeUngDung.khongTimThay("Không tìm thấy chuyến tàu"));
        ct.setTrangThai(trangThai);
        if (ghiChu != null) ct.setGhiChu(ghiChu);
        chuyenTauRepo.save(ct);

        if ("huy".equals(trangThai)) {
            DieuPhoi dp = DieuPhoi.builder()
                .idChuyen(idChuyen)
                .loaiSuKien("cancel")
                .moTa(ghiChu != null ? ghiChu : "Hủy chuyến tàu")
                .nguoiTao(nguoiTao)
                .build();
            dieuPhoiRepo.save(dp);
        }
    }

    public Map<String, Object> getChuyenDetail(Long idChuyen) {
        ChuyenTau ct = chuyenTauRepo.findById(idChuyen)
            .orElseThrow(() -> NgoaiLeUngDung.khongTimThay("Không tìm thấy chuyến tàu"));

        List<ToaChuyen> toaList = toaChuyenRepo.findByIdChuyenWithLoaiToa(idChuyen);
        List<DieuPhoi> events = dieuPhoiRepo.findByIdChuyenOrderByThoiGianTaoDesc(idChuyen);

        List<LichTrinhChuyen> lichTrinh = ct.getLichChay() != null
            ? lichTrinhChuyenRepo.findByIdLichChayWithGa(ct.getLichChay().getIdLichChay())
            : List.of();

        Map<Integer, Long> banByToa = new HashMap<>();
        for (Ve ve : veRepo.findActiveByIdChuyen(idChuyen)) {
            banByToa.merge(ve.getSoToaThuTu(), 1L, Long::sum);
        }

        return Map.of(
            "idChuyen", ct.getIdChuyen(),
            "ngayChay", ct.getNgayChay(),
            "trangThai", ct.getTrangThai(),
            "ghiChu", ct.getGhiChu() != null ? ct.getGhiChu() : "",
            "lichChay", ct.getLichChay(),
            "toaList", toaList.stream().map(t -> Map.of(
                "idToaChuyen", t.getIdToaChuyen(),
                "soToaThuTu", t.getSoToaThuTu(),
                "soGheToiDa", t.getSoGheToiDa() != null ? t.getSoGheToiDa() : 0,
                "loaiToa", t.getLoaiToa() != null ? Map.of("tenLoaiToa", t.getLoaiToa().getTenLoaiToa()) : Map.of(),
                "vesBan", banByToa.getOrDefault(t.getSoToaThuTu(), 0L)
            )).toList(),
            "events", events.stream().map(e -> Map.of(
                "id", e.getIdDieuPhoi(),
                "loaiSuKien", e.getLoaiSuKien(),
                "moTa", e.getMoTa() != null ? e.getMoTa() : "",
                "delayPhut", e.getDelayPhut() != null ? e.getDelayPhut() : 0,
                "trangThai", e.getTrangThai(),
                "thoiGian", e.getThoiGianTao()
            )).toList(),
            "lichTrinh", lichTrinh.stream().map(s -> Map.of(
                "idGa", s.getIdGa(),
                "tenGa", s.getGaTau() != null ? s.getGaTau().getTenGa() : "",
                "thuTuDung", s.getThuTuDung(),
                "gioDen", s.getGioDen() != null ? s.getGioDen().toString() : "",
                "gioDi", s.getGioDi() != null ? s.getGioDi().toString() : ""
            )).toList()
        );
    }

    @Transactional
    public Map<String, Object> sinhChuyenTau(Long idLichChay, String tuNgay, String denNgay) {
        LichChay lc = lichChayRepo.findById(idLichChay)
            .orElseThrow(() -> NgoaiLeUngDung.loiYeuCau("Lịch chạy không tồn tại"));

        LocalDate start = LocalDate.parse(tuNgay);
        LocalDate end   = LocalDate.parse(denNgay);

        if (start.isAfter(end)) throw NgoaiLeUngDung.loiYeuCau("Khoảng ngày không hợp lệ");
        if (java.time.temporal.ChronoUnit.DAYS.between(start, end) > 90)
            throw NgoaiLeUngDung.loiYeuCau("Tối đa 90 ngày mỗi lần sinh chuyến");

        Set<LocalDate> existing = new HashSet<>();
        chuyenTauRepo.findByLichChayAndDateRange(idLichChay, start, end)
            .forEach(ct -> existing.add(ct.getNgayChay()));

        int created = 0, skipped = 0;
        List<ChuyenTau> toCreate = new ArrayList<>();
        for (LocalDate d = start; !d.isAfter(end); d = d.plusDays(1)) {
            if (existing.contains(d)) { skipped++; }
            else {
                toCreate.add(ChuyenTau.builder()
                    .lichChay(lc)
                    .ngayChay(d)
                    .trangThai("dung_gio")
                    .build());
                created++;
            }
        }
        chuyenTauRepo.saveAll(toCreate);

        return Map.of("created", created, "skipped", skipped);
    }

    private Map<String, Object> mapChuyenTau(ChuyenTau ct) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("idChuyen", ct.getIdChuyen());
        m.put("ngayChay", ct.getNgayChay());
        m.put("trangThai", ct.getTrangThai());
        m.put("ghiChu", ct.getGhiChu());
        if (ct.getLichChay() != null) {
            LichChay lc = ct.getLichChay();
            m.put("maTau", lc.getTau() != null ? lc.getTau().getSoHieu() : null);
            m.put("tenTau", lc.getTau() != null ? lc.getTau().getTenTau() : null);
            m.put("gaDi", lc.getGaDi() != null ? lc.getGaDi().getTenGa() : null);
            m.put("gaDen", lc.getGaDen() != null ? lc.getGaDen().getTenGa() : null);
            m.put("gioKhoiHanh", lc.getGioKhoiHanh() != null ? lc.getGioKhoiHanh().toString() : null);
        }
        return m;
    }

    public List<LichChay> getLichChayList(Long idTau) {
        return idTau != null ? lichChayRepo.findByTauIdWithDetails(idTau) : lichChayRepo.findAllWithDetails();
    }

    @Transactional
    public Map<String, Object> createLichChay(Map<String, Object> body) {
        LichChay lc = new LichChay();
        if (body.get("idTau") != null) lc.setTau(com.klntrain.entity.Tau.builder().idTau(Long.parseLong(body.get("idTau").toString())).build());
        if (body.get("idGaDi") != null) lc.setGaDi(com.klntrain.entity.GaTau.builder().idGa(Long.parseLong(body.get("idGaDi").toString())).build());
        if (body.get("idGaDen") != null) lc.setGaDen(com.klntrain.entity.GaTau.builder().idGa(Long.parseLong(body.get("idGaDen").toString())).build());
        if (body.get("gioKhoiHanh") != null) lc.setGioKhoiHanh(java.time.LocalTime.parse(body.get("gioKhoiHanh").toString()));
        if (body.get("gioDuKienDen") != null) lc.setGioDuKienDen(java.time.LocalTime.parse(body.get("gioDuKienDen").toString()));
        lc = lichChayRepo.save(lc);
        return Map.of("idLichChay", lc.getIdLichChay());
    }

    @Transactional
    public void updateLichChay(Long id, Map<String, Object> body) {
        LichChay lc = lichChayRepo.findById(id).orElseThrow(() -> NgoaiLeUngDung.khongTimThay("Không tìm thấy lịch chạy"));
        if (body.get("gioKhoiHanh") != null) lc.setGioKhoiHanh(java.time.LocalTime.parse(body.get("gioKhoiHanh").toString()));
        if (body.get("gioDuKienDen") != null) lc.setGioDuKienDen(java.time.LocalTime.parse(body.get("gioDuKienDen").toString()));
        lichChayRepo.save(lc);
    }

    @Transactional
    public void deleteLichChay(Long id) {
        LichChay lc = lichChayRepo.findById(id).orElseThrow(() -> NgoaiLeUngDung.khongTimThay("Không tìm thấy lịch chạy"));
        if (chuyenTauRepo.countByIdLichChay(id) > 0) throw NgoaiLeUngDung.loiYeuCau("Không thể xóa lịch trình đã có chuyến tàu");
        lichTrinhChuyenRepo.deleteByIdLichChay(id);
        lichChayRepo.delete(lc);
    }

    public List<LichTrinhChuyen> getGaDungList(Long idLichChay) {
        return lichTrinhChuyenRepo.findByIdLichChayWithGa(idLichChay);
    }

    @Transactional
    public Map<String, Object> addGaDung(Long idLichChay, Map<String, Object> body) {
        LichChay lc = lichChayRepo.findById(idLichChay).orElseThrow(() -> NgoaiLeUngDung.khongTimThay("Không tìm thấy lịch chạy"));
        LichTrinhChuyen ltc = new LichTrinhChuyen();
        ltc.setIdLichChay(idLichChay);
        ltc.setIdGa(Long.parseLong(body.get("idGa").toString()));
        ltc.setThuTuDung(Integer.parseInt(body.get("thuTuDung").toString()));
        ltc.setGioDen(java.time.LocalTime.parse(body.get("gioDen").toString()));
        ltc.setGioDi(java.time.LocalTime.parse(body.get("gioDi").toString()));
        ltc.setKhoangCachKm(new java.math.BigDecimal(body.get("khoangCachKm").toString()));
        ltc.setThoiGianDung(Integer.parseInt(body.get("thoiGianDung").toString()));
        ltc = lichTrinhChuyenRepo.save(ltc);
        return Map.of("idLichTrinh", ltc.getIdLichTrinh());
    }

    @Transactional
    public void updateGaDung(Long id, Map<String, Object> body) {
        LichTrinhChuyen ltc = lichTrinhChuyenRepo.findById(id).orElseThrow(() -> NgoaiLeUngDung.khongTimThay("Không tìm thấy ga dừng"));
        if (body.get("gioDen") != null) ltc.setGioDen(java.time.LocalTime.parse(body.get("gioDen").toString()));
        if (body.get("gioDi") != null)  ltc.setGioDi(java.time.LocalTime.parse(body.get("gioDi").toString()));
        if (body.get("khoangCachKm") != null) ltc.setKhoangCachKm(new java.math.BigDecimal(body.get("khoangCachKm").toString()));
        lichTrinhChuyenRepo.save(ltc);
    }

    @Transactional
    public void removeGaDung(Long id) {
        LichTrinhChuyen ltc = lichTrinhChuyenRepo.findById(id).orElseThrow(() -> NgoaiLeUngDung.khongTimThay("Không tìm thấy ga dừng"));
        lichTrinhChuyenRepo.delete(ltc);
    }

    @Transactional
    public Map<String, Object> addToaChuyen(Long idChuyen, Map<String, Object> body) {
        int soToaThuTu = Integer.parseInt(body.get("soToaThuTu").toString());
        if (toaChuyenRepo.existsByIdChuyenAndSoToaThuTu(idChuyen, soToaThuTu))
            throw NgoaiLeUngDung.loiYeuCau("Toa số " + soToaThuTu + " đã tồn tại");
        ToaChuyen tc = ToaChuyen.builder()
            .idChuyen(idChuyen)
            .soToaThuTu(soToaThuTu)
            .idLoaiToa(body.get("idLoaiToa") != null ? Long.parseLong(body.get("idLoaiToa").toString()) : null)
            .soGheToiDa(body.get("soGheToiDa") != null ? Integer.parseInt(body.get("soGheToiDa").toString()) : null)
            .trangThai("hoat_dong")
            .build();
        tc = toaChuyenRepo.save(tc);
        return Map.of("idToaChuyen", tc.getIdToaChuyen());
    }

    @Transactional
    public Map<String, Object> updateToaChuyen(Long toaId, Map<String, Object> body) {
        ToaChuyen tc = toaChuyenRepo.findById(toaId).orElseThrow(() -> NgoaiLeUngDung.khongTimThay("Không tìm thấy toa"));
        if (body.get("soGheToiDa") != null) tc.setSoGheToiDa(Integer.parseInt(body.get("soGheToiDa").toString()));
        if (body.get("trangThai") != null) tc.setTrangThai((String) body.get("trangThai"));
        toaChuyenRepo.save(tc);
        return Map.of("idToaChuyen", tc.getIdToaChuyen());
    }

    @Transactional
    public void removeToaChuyen(Long toaId) {
        ToaChuyen tc = toaChuyenRepo.findById(toaId).orElseThrow(() -> NgoaiLeUngDung.khongTimThay("Không tìm thấy toa"));
        long cnt = veRepo.countActiveByChuyenAndToa(tc.getIdChuyen(), tc.getSoToaThuTu());
        if (cnt > 0) throw NgoaiLeUngDung.loiYeuCau("Không thể xóa toa đã có " + cnt + " vé đặt");
        toaChuyenRepo.delete(tc);
    }

    public Map<String, Object> getChuyenTauList(String ngay, String ngayDen, String trangThai,
                                                  Long idTau, Long idLichChay, int page, int limit) {
        // Đơn giản hóa: trả danh sách từ DB dùng filter Java
        var all = chuyenTauRepo.findAll();
        var filtered = all.stream()
            .filter(ct -> ngay == null || ct.getNgayChay().toString().compareTo(ngay) >= 0)
            .filter(ct -> ngayDen == null || ct.getNgayChay().toString().compareTo(ngayDen) <= 0)
            .filter(ct -> trangThai == null || trangThai.equals(ct.getTrangThai()))
            .filter(ct -> idTau == null || (ct.getLichChay() != null && ct.getLichChay().getTau() != null && idTau.equals(ct.getLichChay().getTau().getIdTau())))
            .filter(ct -> idLichChay == null || (ct.getLichChay() != null && idLichChay.equals(ct.getLichChay().getIdLichChay())))
            .sorted(java.util.Comparator.comparing(ct -> ct.getNgayChay().toString()))
            .toList();

        int total = filtered.size();
        int offset = (page - 1) * limit;
        var items = filtered.stream().skip(offset).limit(limit).map(this::mapChuyenTau).toList();

        return Map.of("total", total, "page", page, "limit", limit, "items", items);
    }

    public com.klntrain.entity.Tau[] getTauList() {
        return em.createQuery("FROM Tau ORDER BY soHieu", com.klntrain.entity.Tau.class)
            .getResultList().toArray(new com.klntrain.entity.Tau[0]);
    }

    public List<com.klntrain.entity.GaTau> getGaList() {
        return em.createQuery("FROM GaTau WHERE trangThai='hoat_dong' ORDER BY thuTuTuyen", com.klntrain.entity.GaTau.class)
            .getResultList();
    }

    public List<com.klntrain.entity.LoaiToa> getLoaiToaList() {
        return em.createQuery("FROM LoaiToa", com.klntrain.entity.LoaiToa.class).getResultList();
    }

    private void notifyCustomers(Long idChuyen, ChuyenTau ct, String loaiSuKien, String moTa, Integer delayPhut) {
        // Lấy danh sách khách có vé active trên chuyến này
        List<Ve> veList = veRepo.findActiveByIdChuyen(idChuyen);
        Set<Long> idTKSet = new HashSet<>();
        for (Ve ve : veList) {
            if (ve.getDonDatVe() != null && ve.getDonDatVe().getIdTaiKhoan() != null) {
                idTKSet.add(ve.getDonDatVe().getIdTaiKhoan());
            }
        }

        String maTau = ct.getLichChay() != null && ct.getLichChay().getTau() != null
            ? ct.getLichChay().getTau().getSoHieu() : "Chuyến tàu";

        String tieuDe = null, noiDung = null;
        if ("delay".equals(loaiSuKien) && delayPhut != null) {
            tieuDe  = "Chuyến " + maTau + " bị chậm giờ";
            noiDung = "Chuyến tàu " + maTau + " sẽ khởi hành muộn hơn " + delayPhut + " phút"
                + (moTa != null ? ". Lý do: " + moTa : "") + ".";
        } else if ("cancel".equals(loaiSuKien)) {
            tieuDe  = "Chuyến " + maTau + " đã bị hủy";
            noiDung = "Chuyến tàu " + maTau + " đã bị hủy"
                + (moTa != null ? ". Lý do: " + moTa : "") + ". Vui lòng liên hệ tổng đài.";
        } else if ("info".equals(loaiSuKien) && moTa != null) {
            tieuDe  = "Thông báo về chuyến " + maTau;
            noiDung = moTa;
        }

        if (tieuDe != null) {
            String finalTieuDe = tieuDe;
            String finalNoiDung = noiDung;
            String finalLoai = loaiSuKien;
            idTKSet.forEach(idTK -> {
                ThongBao tb = ThongBao.builder()
                    .idTaiKhoan(idTK)
                    .tieuDe(finalTieuDe)
                    .noiDung(finalNoiDung)
                    .loai(finalLoai)
                    .daDoc(false)
                    .lienKet("/tra-cuu-don")
                    .build();
                thongBaoRepo.save(tb);
            });
        }
    }
}
