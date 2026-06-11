const { executeQuery } = require('../config/db');

// Số ngày tương ứng với khoảng thời gian lọc của trang Báo cáo
const getRangeDays = (range) => {
  switch (range) {
    case 'week': return 7;
    case 'quarter': return 90;
    case 'year': return 365;
    case 'month':
    default: return 30;
  }
};

// Báo cáo doanh thu theo thời gian (dùng cho biểu đồ doanh thu/vé bán)
exports.getRevenueReport = async (req, res) => {
  const { range } = req.query;
  const days = getRangeDays(range);
  const groupByMonth = range === 'quarter' || range === 'year';
  const groupExpr = groupByMonth ? "FORMAT(v.ngay_xuat_ve, 'yyyy-MM')" : 'CAST(v.ngay_xuat_ve AS DATE)';
  const labelExpr = groupByMonth ? "FORMAT(v.ngay_xuat_ve, 'MM/yyyy')" : "FORMAT(v.ngay_xuat_ve, 'dd/MM')";

  try {
    const result = await executeQuery(`
      SELECT
        ${groupExpr} AS ky,
        MIN(${labelExpr}) AS month,
        COUNT(v.id_ve) AS tickets,
        SUM(v.gia_ve) AS revenue
      FROM Ve v
      JOIN DonDatVe d ON d.id_don_dat_ve = v.id_don_dat_ve
      WHERE d.trang_thai IN ('da_thanh_toan', 'da_xac_nhan')
        AND v.trang_thai != 'da_huy'
        AND v.ngay_xuat_ve >= DATEADD(day, -@days, CAST(GETDATE() AS DATE))
      GROUP BY ${groupExpr}
      ORDER BY ky
    `, { days });

    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Báo cáo doanh thu theo tuyến
exports.getRevenueByRoute = async (req, res) => {
  const { range } = req.query;
  const days = getRangeDays(range);

  try {
    const result = await executeQuery(`
      SELECT TOP 10
        gd.ten_ga AS from_station,
        gn.ten_ga AS to_station,
        COUNT(v.id_ve) AS total_tickets,
        SUM(v.gia_ve) AS total_revenue
      FROM Ve v
      JOIN DonDatVe d ON d.id_don_dat_ve = v.id_don_dat_ve
      JOIN GaTau gd ON gd.id_ga = v.id_ga_len
      JOIN GaTau gn ON gn.id_ga = v.id_ga_xuong
      WHERE d.trang_thai IN ('da_thanh_toan', 'da_xac_nhan')
        AND v.trang_thai != 'da_huy'
        AND v.ngay_xuat_ve >= DATEADD(day, -@days, CAST(GETDATE() AS DATE))
      GROUP BY gd.ten_ga, gn.ten_ga
      ORDER BY total_revenue DESC
    `, { days });

    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Báo cáo doanh thu theo đoàn tàu
exports.getRevenueByTrain = async (req, res) => {
  const { range } = req.query;
  const days = getRangeDays(range);

  try {
    const result = await executeQuery(`
      SELECT
        t.so_hieu AS train_code,
        t.ten_tau AS train_name,
        agg.total_tickets,
        agg.total_revenue,
        ROUND(agg.total_tickets * 100.0 / NULLIF(seats.tong_ghe, 0), 1) AS occupancy_rate
      FROM (
        SELECT lc.id_tau, COUNT(v.id_ve) AS total_tickets, SUM(v.gia_ve) AS total_revenue
        FROM Ve v
        JOIN DonDatVe d ON d.id_don_dat_ve = v.id_don_dat_ve
        JOIN ChuyenTau ct ON ct.id_chuyen = v.id_chuyen
        JOIN LichChay lc ON lc.id_lich_chay = ct.id_lich_chay
        WHERE d.trang_thai IN ('da_thanh_toan', 'da_xac_nhan')
          AND v.trang_thai != 'da_huy'
          AND v.ngay_xuat_ve >= DATEADD(day, -@days, CAST(GETDATE() AS DATE))
        GROUP BY lc.id_tau
      ) agg
      JOIN Tau t ON t.id_tau = agg.id_tau
      LEFT JOIN (
        SELECT cto.id_tau, SUM(lt.so_cho_toi_da) AS tong_ghe
        FROM CauHinhToa cto
        JOIN LoaiToa lt ON lt.id_loai_toa = cto.id_loai_toa
        GROUP BY cto.id_tau
      ) seats ON seats.id_tau = t.id_tau
      ORDER BY agg.total_revenue DESC
    `, { days });

    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Phân bố khách hàng theo loại hành khách
exports.getCustomerDistribution = async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT v.loai_hanh_khach, COUNT(*) AS so_luong
      FROM Ve v
      JOIN DonDatVe d ON d.id_don_dat_ve = v.id_don_dat_ve
      WHERE d.trang_thai IN ('da_thanh_toan', 'da_xac_nhan')
        AND v.trang_thai != 'da_huy'
      GROUP BY v.loai_hanh_khach
    `);

    const labels = {
      nguoi_lon:      { name: 'Người lớn',          color: '#8C1D19' },
      tre_em:         { name: 'Trẻ em',             color: '#27ae60' },
      nguoi_cao_tuoi: { name: 'Người cao tuổi',     color: '#3498db' },
      sinh_vien:      { name: 'Học sinh, sinh viên', color: '#e67e22' },
    };

    const total = result.recordset.reduce((sum, r) => sum + r.so_luong, 0) || 1;
    const data = result.recordset.map(r => ({
      name: labels[r.loai_hanh_khach]?.name || r.loai_hanh_khach,
      value: Math.round((r.so_luong / total) * 1000) / 10,
      color: labels[r.loai_hanh_khach]?.color || '#95a5a6',
    }));

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Báo cáo tỷ lệ lấp đầy
exports.getOccupancyReport = async (req, res) => {
  const { tu_ngay, den_ngay } = req.query;
  
  try {
    const result = await executeQuery(`
      SELECT 
        ct.id_chuyen,
        t.so_hieu AS ma_tau,
        ct.ngay_chay,
        SUM(lt.so_cho_toi_da) AS tong_ghe,
        COUNT(v.id_ve) AS ghe_da_ban,
        ROUND(COUNT(v.id_ve) * 100.0 / SUM(lt.so_cho_toi_da), 2) AS ty_le_lap_day
      FROM ChuyenTau ct
      JOIN LichChay lc ON lc.id_lich_chay = ct.id_lich_chay
      JOIN Tau t ON t.id_tau = lc.id_tau
      JOIN CauHinhToa cto ON cto.id_tau = t.id_tau
      JOIN LoaiToa lt ON lt.id_loai_toa = cto.id_loai_toa
      LEFT JOIN Ve v ON v.id_chuyen = ct.id_chuyen AND v.trang_thai = 'da_xac_nhan'
      WHERE ct.ngay_chay BETWEEN @tu_ngay AND @den_ngay
      GROUP BY ct.id_chuyen, t.so_hieu, ct.ngay_chay
      ORDER BY ty_le_lap_day DESC
    `, { tu_ngay, den_ngay });
    
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Báo cáo tỷ lệ hủy vé
exports.getCancellationReport = async (req, res) => {
  const { tu_ngay, den_ngay } = req.query;
  
  try {
    const result = await executeQuery(`
      SELECT 
        d.ma_don,
        tk.ho_ten,
        v.gia_ve,
        h.phi_huy,
        h.tien_hoan,
        h.ly_do,
        h.thoi_gian_hoan
      FROM HoanTien h
      JOIN Ve v ON v.id_ve = h.id_ve
      JOIN DonDatVe d ON d.id_don_dat_ve = v.id_don_dat_ve
      JOIN TaiKhoan tk ON tk.id_tai_khoan = d.id_tai_khoan
      WHERE h.trang_thai_hoan = 'hoan_thanh'
        AND h.thoi_gian_hoan BETWEEN @tu_ngay AND @den_ngay
      ORDER BY h.thoi_gian_hoan DESC
    `, { tu_ngay, den_ngay });
    
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Báo cáo hiệu quả khuyến mãi
exports.getCouponEffectiveness = async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT 
        km.ma_khuyen_mai,
        km.mo_ta,
        km.loai_giam,
        km.gia_tri,
        km.so_luong,
        km.da_dung,
        ROUND(km.da_dung * 100.0 / NULLIF(km.so_luong, 0), 2) AS ty_le_su_dung,
        SUM(d.tien_giam) AS tong_tien_giam
      FROM KhuyenMai km
      LEFT JOIN DonDatVe d ON d.id_khuyen_mai = km.id_khuyen_mai AND d.trang_thai = 'da_thanh_toan'
      GROUP BY km.id_khuyen_mai, km.ma_khuyen_mai, km.mo_ta, km.loai_giam, km.gia_tri, km.so_luong, km.da_dung
      ORDER BY ty_le_su_dung DESC
    `);
    
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Dashboard tổng quan
exports.getDashboardStats = async (req, res) => {
  try {
    const stats = await executeQuery(`
      SELECT 
        (SELECT COUNT(*) FROM TaiKhoan WHERE vai_tro = 'khach_hang') AS tong_khach,
        (SELECT COUNT(*) FROM DonDatVe WHERE trang_thai = 'da_thanh_toan') AS tong_don,
        (SELECT ISNULL(SUM(tien_thanh_toan), 0) FROM DonDatVe WHERE trang_thai = 'da_thanh_toan') AS tong_doanh_thu,
        (SELECT COUNT(*) FROM KhuyenMai WHERE ngay_het_han >= GETDATE()) AS khuyen_mai_dang_chay,
        (SELECT COUNT(*) FROM HoanTien WHERE trang_thai_hoan = 'cho_xu_ly') AS hoan_cho_xu_ly,
        (SELECT COUNT(*) FROM ChuyenTau WHERE ngay_chay >= CAST(GETDATE() AS DATE) AND trang_thai = 'dung_gio') AS chuyen_hoat_dong
    `);
    
    const recentOrders = await executeQuery(`
      SELECT TOP 10
        d.ma_don, tk.ho_ten, d.tong_tien, d.trang_thai, d.thoi_gian_dat
      FROM DonDatVe d
      JOIN TaiKhoan tk ON tk.id_tai_khoan = d.id_tai_khoan
      ORDER BY d.thoi_gian_dat DESC
    `);
    
    res.json({
      success: true,
      data: {
        stats: stats.recordset[0],
        recent_orders: recentOrders.recordset
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy thống kê tóm tắt
exports.getSummaryStats = async (req, res) => {
  const { range } = req.query;
  const days = getRangeDays(range);

  try {
    const ticketStats = await executeQuery(`
      SELECT
        ISNULL(SUM(CASE WHEN v.ngay_xuat_ve >= DATEADD(day, -@days, CAST(GETDATE() AS DATE)) AND v.trang_thai != 'da_huy' THEN v.gia_ve ELSE 0 END), 0) AS total_revenue,
        COUNT(CASE WHEN v.ngay_xuat_ve >= DATEADD(day, -@days, CAST(GETDATE() AS DATE)) AND v.trang_thai != 'da_huy' THEN 1 END) AS total_tickets,
        ISNULL(SUM(CASE WHEN v.ngay_xuat_ve >= DATEADD(day, -2*@days, CAST(GETDATE() AS DATE)) AND v.ngay_xuat_ve < DATEADD(day, -@days, CAST(GETDATE() AS DATE)) AND v.trang_thai != 'da_huy' THEN v.gia_ve ELSE 0 END), 0) AS prev_revenue,
        COUNT(CASE WHEN v.ngay_xuat_ve >= DATEADD(day, -2*@days, CAST(GETDATE() AS DATE)) AND v.ngay_xuat_ve < DATEADD(day, -@days, CAST(GETDATE() AS DATE)) AND v.trang_thai != 'da_huy' THEN 1 END) AS prev_tickets,
        COUNT(CASE WHEN v.ngay_xuat_ve >= DATEADD(day, -@days, CAST(GETDATE() AS DATE)) AND v.trang_thai = 'da_huy' THEN 1 END) AS cancelled_tickets
      FROM Ve v
      JOIN DonDatVe d ON d.id_don_dat_ve = v.id_don_dat_ve
      WHERE d.trang_thai IN ('da_thanh_toan', 'da_xac_nhan', 'da_huy')
    `, { days });

    const customersResult = await executeQuery(`
      SELECT COUNT(*) AS total_customers FROM TaiKhoan WHERE vai_tro = 'khach_hang'
    `);

    const occupancyResult = await executeQuery(`
      SELECT AVG(ty_le) AS avg_occupancy
      FROM (
        SELECT ct.id_chuyen, COUNT(v.id_ve) * 100.0 / NULLIF(seats.tong_ghe, 0) AS ty_le
        FROM ChuyenTau ct
        JOIN LichChay lc ON lc.id_lich_chay = ct.id_lich_chay
        LEFT JOIN Ve v ON v.id_chuyen = ct.id_chuyen AND v.trang_thai != 'da_huy'
        LEFT JOIN (
          SELECT cto.id_tau, SUM(lt.so_cho_toi_da) AS tong_ghe
          FROM CauHinhToa cto
          JOIN LoaiToa lt ON lt.id_loai_toa = cto.id_loai_toa
          GROUP BY cto.id_tau
        ) seats ON seats.id_tau = lc.id_tau
        WHERE ct.ngay_chay >= DATEADD(day, -@days, CAST(GETDATE() AS DATE))
        GROUP BY ct.id_chuyen, seats.tong_ghe
      ) occ
    `, { days });

    const row = ticketStats.recordset[0];
    const total_revenue = Number(row.total_revenue) || 0;
    const total_tickets = Number(row.total_tickets) || 0;
    const prev_revenue = Number(row.prev_revenue) || 0;
    const prev_tickets = Number(row.prev_tickets) || 0;
    const cancelled_tickets = Number(row.cancelled_tickets) || 0;
    const total_count = total_tickets + cancelled_tickets;

    const growth_revenue = prev_revenue > 0 ? Math.round(((total_revenue - prev_revenue) / prev_revenue) * 1000) / 10 : 0;
    const growth_tickets = prev_tickets > 0 ? Math.round(((total_tickets - prev_tickets) / prev_tickets) * 1000) / 10 : 0;
    const cancel_rate = total_count > 0 ? Math.round((cancelled_tickets / total_count) * 1000) / 10 : 0;

    res.json({
      success: true,
      data: {
        total_revenue,
        total_tickets,
        total_customers: customersResult.recordset[0].total_customers,
        avg_occupancy: Math.round((occupancyResult.recordset[0].avg_occupancy || 0) * 10) / 10,
        growth_revenue,
        growth_tickets,
        cancel_rate,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};