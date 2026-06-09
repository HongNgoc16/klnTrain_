const { executeQuery } = require('../config/db');

// Báo cáo doanh thu
exports.getRevenueReport = async (req, res) => {
  const { tu_ngay, den_ngay, nhom_theo } = req.query; // nhom_theo: 'ngay', 'thang', 'nam'
  
  try {
    let groupBy = '';
    let dateFormat = '';
    
    switch (nhom_theo) {
      case 'ngay':
        groupBy = 'CAST(ngay_xuat_ve AS DATE)';
        dateFormat = 'yyyy-MM-dd';
        break;
      case 'thang':
        groupBy = 'FORMAT(ngay_xuat_ve, \'yyyy-MM\')';
        dateFormat = 'yyyy-MM';
        break;
      default:
        groupBy = 'YEAR(ngay_xuat_ve)';
        dateFormat = 'yyyy';
    }
    
    const result = await executeQuery(`
      SELECT 
        ${groupBy} AS ky,
        COUNT(DISTINCT v.id_ve) AS so_ve,
        SUM(v.gia_ve) AS doanh_thu,
        SUM(d.tien_giam) AS tong_giam,
        SUM(d.tien_thanh_toan) AS doanh_thu_thuc_thu
      FROM Ve v
      JOIN DonDatVe d ON d.id_don_dat_ve = v.id_don_dat_ve
      WHERE d.trang_thai = 'da_thanh_toan'
        AND v.ngay_xuat_ve >= @tu_ngay
        AND v.ngay_xuat_ve <= @den_ngay
      GROUP BY ${groupBy}
      ORDER BY ky
    `, { tu_ngay, den_ngay });
    
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Báo cáo doanh thu theo tuyến
exports.getRevenueByRoute = async (req, res) => {
  const { tu_ngay, den_ngay } = req.query;
  
  try {
    const result = await executeQuery(`
      SELECT 
        gd.ten_ga AS ga_di,
        gn.ten_ga AS ga_den,
        COUNT(v.id_ve) AS so_luong,
        SUM(v.gia_ve) AS doanh_thu
      FROM Ve v
      JOIN DonDatVe d ON d.id_don_dat_ve = v.id_don_dat_ve
      JOIN GaTau gd ON gd.id_ga = v.id_ga_len
      JOIN GaTau gn ON gn.id_ga = v.id_ga_xuong
      WHERE d.trang_thai = 'da_thanh_toan'
        AND v.ngay_xuat_ve >= @tu_ngay
        AND v.ngay_xuat_ve <= @den_ngay
      GROUP BY gd.ten_ga, gn.ten_ga
      ORDER BY doanh_thu DESC
    `, { tu_ngay, den_ngay });
    
    res.json({ success: true, data: result.recordset });
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
  let dateCondition = '';
  
  if (range === 'week') dateCondition = 'DATEADD(day, -7, GETDATE())';
  else if (range === 'month') dateCondition = 'DATEADD(month, -1, GETDATE())';
  else if (range === 'quarter') dateCondition = 'DATEADD(month, -3, GETDATE())';
  else if (range === 'year') dateCondition = 'DATEADD(year, -1, GETDATE())';
  else dateCondition = 'DATEADD(month, -1, GETDATE())';
  
  try {
    const result = await executeQuery(`
      SELECT 
        ISNULL(SUM(CASE WHEN ngay_xuat_ve >= @dateCondition THEN gia_ve ELSE 0 END), 0) AS total_revenue,
        COUNT(CASE WHEN ngay_xuat_ve >= @dateCondition THEN 1 END) AS total_tickets,
        (SELECT COUNT(*) FROM TaiKhoan WHERE vai_tro = 'khach_hang') AS total_customers,
        AVG(CASE WHEN ngay_xuat_ve >= @dateCondition THEN occupancy ELSE NULL END) AS avg_occupancy
      FROM Ve v
      LEFT JOIN (
        SELECT id_chuyen, AVG(CAST(so_ve AS FLOAT) / so_ghe * 100) AS occupancy
        FROM (
          SELECT ct.id_chuyen, COUNT(v.id_ve) AS so_ve, SUM(lt.so_cho_toi_da) AS so_ghe
          FROM ChuyenTau ct
          LEFT JOIN Ve v ON ct.id_chuyen = v.id_chuyen
          JOIN LichChay lc ON ct.id_lich_chay = lc.id_lich_chay
          JOIN CauHinhToa cto ON cto.id_tau = lc.id_tau
          JOIN LoaiToa lt ON lt.id_loai_toa = cto.id_loai_toa
          GROUP BY ct.id_chuyen
        ) t
        GROUP BY id_chuyen
      ) occ ON occ.id_chuyen = v.id_chuyen
      WHERE v.ngay_xuat_ve >= @dateCondition
    `, { dateCondition });
    
    res.json({ success: true, data: result.recordset[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};