package com.klntrain.service;

import com.klntrain.entity.*;
import com.klntrain.repository.*;
import com.klntrain.util.AppException;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final TaiKhoanRepository taiKhoanRepo;
    private final TauRepository tauRepo;
    private final GaTauRepository gaTauRepo;
    private final LichChayRepository lichChayRepo;
    private final ChuyenTauRepository chuyenTauRepo;
    private final DonDatVeRepository donDatVeRepo;
    private final VeRepository veRepo;
    private final KhuyenMaiRepository khuyenMaiRepo;
    private final ThongBaoRepository thongBaoRepo;
    private final EntityManager em;

    // ─── Dashboard ───────────────────────────────────────────────
    public Map<String, Object> getDashboardStats() {
        long totalCustomers = taiKhoanRepo.findAll().stream()
            .filter(tk -> "khach_hang".equals(tk.getVaiTro())).count();
        long totalTrains = tauRepo.findByTrangThai("hoat_dong").size();
        long totalTickets = veRepo.count();

        BigDecimal totalRevenue = donDatVeRepo.findAll().stream()
            .filter(d -> "da_thanh_toan".equals(d.getTrangThai()))
            .map(DonDatVe::getTienThanhToan)
            .filter(Objects::nonNull)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        return Map.of(
            "total_revenue", totalRevenue,
            "total_tickets", totalTickets,
            "total_customers", totalCustomers,
            "total_trains", totalTrains
        );
    }

    // ─── Stations ────────────────────────────────────────────────
    public List<GaTau> getAllStations() { return gaTauRepo.findAll(); }

    public GaTau saveStation(GaTau ga) { return gaTauRepo.save(ga); }

    public void deleteStation(Long id) {
        if (!gaTauRepo.existsById(id)) throw AppException.notFound("Không tìm thấy ga");
        gaTauRepo.deleteById(id);
    }

    // ─── Trains ──────────────────────────────────────────────────
    public List<Tau> getAllTrains() { return tauRepo.findAllByOrderBySoHieuAsc(); }

    public Tau saveTrain(Tau tau) { return tauRepo.save(tau); }

    public void deleteTrain(Long id) {
        tauRepo.findById(id).orElseThrow(() -> AppException.notFound("Không tìm thấy tàu"));
        tauRepo.deleteById(id);
    }

    // ─── Users / Customers ───────────────────────────────────────
    public List<TaiKhoan> getAllUsers() { return taiKhoanRepo.findAll(); }

    @Transactional
    public TaiKhoan updateUserStatus(Long id, String trangThai) {
        TaiKhoan tk = taiKhoanRepo.findById(id)
            .orElseThrow(() -> AppException.notFound("Không tìm thấy người dùng"));
        tk.setTrangThai(trangThai);
        return taiKhoanRepo.save(tk);
    }

    // ─── Coupons ─────────────────────────────────────────────────
    public List<KhuyenMai> getAllCoupons() { return khuyenMaiRepo.findAll(); }

    public KhuyenMai saveCoupon(KhuyenMai km) { return khuyenMaiRepo.save(km); }

    public void deleteCoupon(Long id) {
        if (!khuyenMaiRepo.existsById(id)) throw AppException.notFound("Không tìm thấy mã khuyến mãi");
        khuyenMaiRepo.deleteById(id);
    }

    // ─── Schedules ───────────────────────────────────────────────
    public List<LichChay> getAllSchedules(Long idTau) {
        return idTau != null
            ? lichChayRepo.findByTauIdWithDetails(idTau)
            : lichChayRepo.findAllWithDetails();
    }

    @Transactional
    public LichChay createSchedule(LichChay lichChay) { return lichChayRepo.save(lichChay); }

    @Transactional
    public void deleteSchedule(Long id) {
        LichChay lc = lichChayRepo.findById(id)
            .orElseThrow(() -> AppException.notFound("Không tìm thấy lịch chạy"));
        if (chuyenTauRepo.countByIdLichChay(id) > 0)
            throw AppException.badRequest("Không thể xóa lịch trình đã có chuyến tàu");
        lichChayRepo.delete(lc);
    }

    // ─── Notifications (admin broadcast) ─────────────────────────
    @Transactional
    public int broadcastNotification(String tieuDe, String noiDung, String loai) {
        List<TaiKhoan> users = taiKhoanRepo.findAll().stream()
            .filter(tk -> "hoat_dong".equals(tk.getTrangThai())).toList();

        users.forEach(u -> thongBaoRepo.save(ThongBao.builder()
            .idTaiKhoan(u.getIdTaiKhoan())
            .tieuDe(tieuDe)
            .noiDung(noiDung)
            .loai(loai != null ? loai : "info")
            .daDoc(false)
            .build()));

        return users.size();
    }

    // ─── Tickets / Refunds ───────────────────────────────────────
    public List<DonDatVe> getAllOrders(String trangThai) {
        if (trangThai != null) {
            return donDatVeRepo.findAll().stream()
                .filter(d -> trangThai.equals(d.getTrangThai())).toList();
        }
        return donDatVeRepo.findAll();
    }

    public Optional<DonDatVe> getOrderDetail(Long id) {
        return donDatVeRepo.findById(id);
    }

    @Transactional
    public TaiKhoan updateUserRole(Long id, String vaiTro) {
        TaiKhoan tk = taiKhoanRepo.findById(id)
            .orElseThrow(() -> AppException.notFound("Không tìm thấy người dùng"));
        tk.setVaiTro(vaiTro);
        return taiKhoanRepo.save(tk);
    }

    // ─── Dashboard chart queries ──────────────────────────────────
    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getRevenueByMonth() {
        String sql = """
            SELECT MONTH(ngay_xuat_ve) as month, YEAR(ngay_xuat_ve) as year,
                   ISNULL(SUM(gia_ve), 0) as revenue, COUNT(*) as tickets
            FROM Ve v JOIN DonDatVe d ON v.id_don_dat_ve = d.id_don_dat_ve
            WHERE d.trang_thai = 'da_thanh_toan'
              AND ngay_xuat_ve >= DATEADD(month, -12, GETDATE())
            GROUP BY YEAR(ngay_xuat_ve), MONTH(ngay_xuat_ve)
            ORDER BY year ASC, month ASC
            """;
        return em.createNativeQuery(sql).getResultList();
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getRevenueByWeek() {
        String sql = """
            SELECT DATEPART(weekday, ngay_xuat_ve) as day_of_week,
                   ISNULL(SUM(gia_ve), 0) as revenue, COUNT(*) as tickets
            FROM Ve v JOIN DonDatVe d ON v.id_don_dat_ve = d.id_don_dat_ve
            WHERE d.trang_thai = 'da_thanh_toan'
              AND ngay_xuat_ve >= DATEADD(day, -7, GETDATE())
            GROUP BY DATEPART(weekday, ngay_xuat_ve)
            """;
        return em.createNativeQuery(sql).getResultList();
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getPopularRoutes() {
        String sql = """
            SELECT TOP 5 g1.ten_ga as from_station, g2.ten_ga as to_station,
                   COUNT(v.id_ve) as total_tickets, ISNULL(SUM(v.gia_ve),0) as total_revenue
            FROM Ve v JOIN GaTau g1 ON v.id_ga_len = g1.id_ga
                      JOIN GaTau g2 ON v.id_ga_xuong = g2.id_ga
                      JOIN DonDatVe d ON v.id_don_dat_ve = d.id_don_dat_ve
            WHERE d.trang_thai = 'da_thanh_toan'
            GROUP BY g1.ten_ga, g2.ten_ga ORDER BY total_tickets DESC
            """;
        return em.createNativeQuery(sql).getResultList();
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getRecentOrders() {
        String sql = """
            SELECT TOP 10 d.ma_don as id, tk.ho_ten as customer,
                   t.so_hieu as train, g1.ten_ga as from_station, g2.ten_ga as to_station,
                   FORMAT(d.thoi_gian_dat, 'yyyy-MM-dd') as date, d.tong_tien as amount, d.trang_thai as status
            FROM DonDatVe d
            JOIN TaiKhoan tk ON d.id_tai_khoan = tk.id_tai_khoan
            LEFT JOIN Ve v ON d.id_don_dat_ve = v.id_don_dat_ve
            LEFT JOIN ChuyenTau ct ON v.id_chuyen = ct.id_chuyen
            LEFT JOIN LichChay lc ON ct.id_lich_chay = lc.id_lich_chay
            LEFT JOIN Tau t ON lc.id_tau = t.id_tau
            LEFT JOIN GaTau g1 ON v.id_ga_len = g1.id_ga
            LEFT JOIN GaTau g2 ON v.id_ga_xuong = g2.id_ga
            ORDER BY d.thoi_gian_dat DESC
            """;
        return em.createNativeQuery(sql).getResultList();
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getUpcomingTrains() {
        String sql = """
            SELECT TOP 10 t.so_hieu as id, g1.ten_ga as from_station, g2.ten_ga as to_station,
                   FORMAT(lc.gio_khoi_hanh,'HH:mm') as departure, ct.trang_thai as status
            FROM ChuyenTau ct JOIN LichChay lc ON ct.id_lich_chay = lc.id_lich_chay
            JOIN Tau t ON lc.id_tau = t.id_tau
            JOIN GaTau g1 ON lc.id_ga_di = g1.id_ga JOIN GaTau g2 ON lc.id_ga_den = g2.id_ga
            WHERE ct.ngay_chay = CAST(GETDATE() AS DATE)
              AND CAST(lc.gio_khoi_hanh AS TIME) >= CAST(GETDATE() AS TIME)
            ORDER BY lc.gio_khoi_hanh ASC
            """;
        return em.createNativeQuery(sql).getResultList();
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getTopStations() {
        String sql = """
            SELECT TOP 5 g.ten_ga as name, COUNT(v.id_ve) as traffic
            FROM Ve v JOIN GaTau g ON v.id_ga_len = g.id_ga
            GROUP BY g.ten_ga ORDER BY traffic DESC
            """;
        return em.createNativeQuery(sql).getResultList();
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getCustomerDistribution() {
        String sql = "SELECT loai_hanh_khach as name, COUNT(*) as value FROM HanhKhach GROUP BY loai_hanh_khach";
        return em.createNativeQuery(sql).getResultList();
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> getRates() {
        String sql1 = "SELECT COUNT(CASE WHEN trang_thai='dung_gio' THEN 1 END)*100.0/NULLIF(COUNT(*),0) as ontime_rate FROM ChuyenTau WHERE ngay_chay >= DATEADD(day,-30,GETDATE())";
        String sql2 = "SELECT COUNT(CASE WHEN trang_thai='da_huy' THEN 1 END)*100.0/NULLIF(COUNT(*),0) as cancel_rate FROM Ve WHERE ngay_xuat_ve >= DATEADD(day,-30,GETDATE())";
        Object r1 = em.createNativeQuery(sql1).getSingleResult();
        Object r2 = em.createNativeQuery(sql2).getSingleResult();
        return Map.of(
            "ontime_rate", r1 != null ? r1 : 0,
            "cancel_rate", r2 != null ? r2 : 0
        );
    }
}
