package com.klntrain.service;

import com.klntrain.entity.*;
import com.klntrain.repository.*;
import com.klntrain.util.NgoaiLeUngDung;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class ChuyenTauService {

    private final GaTauRepository gaTauRepo;
    private final ChuyenTauRepository chuyenTauRepo;
    private final LichTrinhChuyenRepository lichTrinhChuyenRepo;
    private final ToaChuyenRepository toaChuyenRepo;
    private final VeRepository veRepo;
    private final EntityManager em;

    public List<GaTau> layDanhSachGa() {
        return gaTauRepo.findByTrangThaiOrderByThuTuTuyenAsc("hoat_dong");
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> timChuyenTau(Long idGaDi, Long idGaDen, String ngayChay) {
        String sql = """
            SELECT ct.id_chuyen, ct.ngay_chay, ct.trang_thai,
                   lc.id_lich_chay, lc.gio_khoi_hanh, lc.gio_du_kien_den,
                   t.id_tau, t.so_hieu, t.ten_tau,
                   gdi.id_ga AS id_ga_di,  gdi.ten_ga AS ten_ga_di,
                   gden.id_ga AS id_ga_den, gden.ten_ga AS ten_ga_den,
                   ltc_di.khoang_cach_km  AS km_di,
                   ltc_den.khoang_cach_km AS km_den
            FROM ChuyenTau ct
            JOIN LichChay lc   ON lc.id_lich_chay = ct.id_lich_chay
            JOIN Tau t          ON t.id_tau = lc.id_tau
            JOIN GaTau gdi     ON gdi.id_ga = lc.id_ga_di
            JOIN GaTau gden    ON gden.id_ga = lc.id_ga_den
            JOIN LichTrinhChuyen ltc_di  ON ltc_di.id_lich_chay  = lc.id_lich_chay AND ltc_di.id_ga  = :idGaDi
            JOIN LichTrinhChuyen ltc_den ON ltc_den.id_lich_chay = lc.id_lich_chay AND ltc_den.id_ga = :idGaDen
            WHERE ct.ngay_chay = :ngayChay
              AND ct.trang_thai <> 'huy'
              AND ltc_di.thu_tu_dung < ltc_den.thu_tu_dung
            ORDER BY lc.gio_khoi_hanh
            """;

        List<Object[]> rows = em.createNativeQuery(sql)
            .setParameter("idGaDi", idGaDi)
            .setParameter("idGaDen", idGaDen)
            .setParameter("ngayChay", ngayChay)
            .getResultList();

        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] r : rows) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("idChuyen", ((Number) r[0]).longValue());
            m.put("ngayChay", r[1]);
            m.put("trangThai", r[2]);
            m.put("idLichChay", ((Number) r[3]).longValue());
            m.put("gioKhoiHanh", r[4]);
            m.put("gioDuKienDen", r[5]);
            m.put("tau", Map.of("idTau", ((Number) r[6]).longValue(), "soHieu", r[7], "tenTau", r[8]));
            m.put("gaDi", Map.of("idGa", ((Number) r[9]).longValue(), "tenGa", r[10]));
            m.put("gaDen", Map.of("idGa", ((Number) r[11]).longValue(), "tenGa", r[12]));
            double kmDi  = r[13] != null ? ((Number) r[13]).doubleValue() : 0;
            double kmDen = r[14] != null ? ((Number) r[14]).doubleValue() : 0;
            m.put("khoangCachKm", kmDen - kmDi);
            result.add(m);
        }
        return result;
    }

    public Map<String, Object> laySoDoGhe(Long idChuyen, Integer soToa, Long idGaLen, Long idGaXuong) {
        List<Ve> veList = veRepo.findActiveByIdChuyen(idChuyen);

        Set<Integer> occupied = new HashSet<>();
        for (Ve ve : veList) {
            if (ve.getSoToaThuTu().equals(soToa)) {
                occupied.add(ve.getSoGheTrongToa());
            }
        }

        ToaChuyen toa = toaChuyenRepo.findByIdChuyenAndSoToaThuTu(idChuyen, soToa)
            .orElseThrow(() -> NgoaiLeUngDung.khongTimThay("Không tìm thấy toa " + soToa));

        int soGhe = toa.getSoGheToiDa() != null ? toa.getSoGheToiDa() : 36;

        List<Map<String, Object>> seats = new ArrayList<>();
        for (int i = 1; i <= soGhe; i++) {
            seats.add(Map.of(
                "soGhe", i,
                "trangThai", occupied.contains(i) ? "da_ban" : "trong"
            ));
        }

        return Map.of(
            "idChuyen", idChuyen,
            "soToa", soToa,
            "soGheToiDa", soGhe,
            "seats", seats
        );
    }
}
