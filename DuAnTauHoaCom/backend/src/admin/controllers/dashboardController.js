const { executeQuery } = require('../config/db');

// Lấy thống kê tổng quan
exports.getStats = async (req, res) => {
  try {
    // Tổng doanh thu
    const revenueResult = await executeQuery(`
      SELECT ISNULL(SUM(tong_tien), 0) as total_revenue 
      FROM DonDatVe 
      WHERE trang_thai = 'da_thanh_toan'
    `);
    
    // Tổng vé đã bán
    const ticketResult = await executeQuery(`
      SELECT COUNT(*) as total_tickets FROM Ve
    `);
    
    // Tổng khách hàng
    const customerResult = await executeQuery(`
      SELECT COUNT(*) as total_customers 
      FROM TaiKhoan 
      WHERE vai_tro = 'khach_hang'
    `);
    
    // Tổng tàu đang hoạt động
    const trainResult = await executeQuery(`
      SELECT COUNT(*) as total_trains 
      FROM Tau 
      WHERE trang_thai = 'hoat_dong'
    `);
    
    // Tỷ lệ lấp đầy trung bình 30 ngày qua
    const occupancyResult = await executeQuery(`
      SELECT AVG(CAST(so_ve AS FLOAT) / so_ghe * 100) as avg_occupancy
      FROM (
        SELECT 
          ct.id_chuyen,
          COUNT(v.id_ve) as so_ve,
          SUM(lt.so_cho_toi_da) as so_ghe
        FROM ChuyenTau ct
        LEFT JOIN Ve v ON ct.id_chuyen = v.id_chuyen AND v.trang_thai IN ('da_su_dung', 'da_xac_nhan')
        JOIN LichChay lc ON ct.id_lich_chay = lc.id_lich_chay
        JOIN Tau t ON lc.id_tau = t.id_tau
        JOIN CauHinhToa cto ON cto.id_tau = t.id_tau
        JOIN LoaiToa lt ON lt.id_loai_toa = cto.id_loai_toa
        WHERE ct.ngay_chay >= DATEADD(day, -30, GETDATE())
        GROUP BY ct.id_chuyen
      ) t
    `);
    
    res.json({
      success: true,
      data: {
        total_revenue: revenueResult.recordset[0]?.total_revenue || 0,
        total_tickets: ticketResult.recordset[0]?.total_tickets || 0,
        total_customers: customerResult.recordset[0]?.total_customers || 0,
        total_trains: trainResult.recordset[0]?.total_trains || 0,
        avg_occupancy: Math.round(occupancyResult.recordset[0]?.avg_occupancy || 0)
      }
    });
  } catch (error) {
    console.error('Lỗi lấy stats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Doanh thu theo tháng (12 tháng gần nhất)
exports.getRevenueByMonth = async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT 
        MONTH(ngay_xuat_ve) as month,
        YEAR(ngay_xuat_ve) as year,
        ISNULL(SUM(gia_ve), 0) as revenue,
        COUNT(*) as tickets
      FROM Ve v
      JOIN DonDatVe d ON v.id_don_dat_ve = d.id_don_dat_ve
      WHERE d.trang_thai = 'da_thanh_toan'
        AND ngay_xuat_ve >= DATEADD(month, -12, GETDATE())
      GROUP BY YEAR(ngay_xuat_ve), MONTH(ngay_xuat_ve)
      ORDER BY year ASC, month ASC
    `);
    
    const months = ['Thg 1', 'Thg 2', 'Thg 3', 'Thg 4', 'Thg 5', 'Thg 6', 
                    'Thg 7', 'Thg 8', 'Thg 9', 'Thg 10', 'Thg 11', 'Thg 12'];
    
    const chartData = [];
    for (let i = 1; i <= 12; i++) {
      const found = result.recordset.find(r => r.month === i);
      chartData.push({
        month: months[i - 1],
        revenue: found ? found.revenue : 0,
        tickets: found ? found.tickets : 0
      });
    }
    
    res.json({ success: true, data: chartData });
  } catch (error) {
    console.error('Lỗi lấy doanh thu tháng:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Doanh thu theo tuần (7 ngày gần nhất)
exports.getRevenueByWeek = async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT 
        DATEPART(weekday, ngay_xuat_ve) as day_of_week,
        ISNULL(SUM(gia_ve), 0) as revenue,
        COUNT(*) as tickets
      FROM Ve v
      JOIN DonDatVe d ON v.id_don_dat_ve = d.id_don_dat_ve
      WHERE d.trang_thai = 'da_thanh_toan'
        AND ngay_xuat_ve >= DATEADD(day, -7, GETDATE())
      GROUP BY DATEPART(weekday, ngay_xuat_ve)
    `);
    
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const chartData = days.map((day, index) => {
      const found = result.recordset.find(r => r.day_of_week === index + 1);
      return {
        day: day,
        revenue: found ? found.revenue : 0,
        tickets: found ? found.tickets : 0
      };
    });
    
    res.json({ success: true, data: chartData });
  } catch (error) {
    console.error('Lỗi lấy doanh thu tuần:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Tuyến phổ biến nhất (Top 5)
exports.getPopularRoutes = async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT TOP 5
        g1.ten_ga as from_station,
        g2.ten_ga as to_station,
        COUNT(v.id_ve) as total_tickets,
        ISNULL(SUM(v.gia_ve), 0) as total_revenue
      FROM Ve v
      JOIN GaTau g1 ON v.id_ga_len = g1.id_ga
      JOIN GaTau g2 ON v.id_ga_xuong = g2.id_ga
      JOIN DonDatVe d ON v.id_don_dat_ve = d.id_don_dat_ve
      WHERE d.trang_thai = 'da_thanh_toan'
      GROUP BY g1.ten_ga, g2.ten_ga
      ORDER BY total_tickets DESC
    `);
    
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error('Lỗi lấy tuyến phổ biến:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Đơn hàng gần đây (Top 10)
exports.getRecentOrders = async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT TOP 10
        d.ma_don as id,
        tk.ho_ten as customer,
        t.so_hieu as train,
        g1.ten_ga as from_station,
        g2.ten_ga as to_station,
        FORMAT(d.thoi_gian_dat, 'yyyy-MM-dd') as date,
        d.tong_tien as amount,
        d.trang_thai as status
      FROM DonDatVe d
      JOIN TaiKhoan tk ON d.id_tai_khoan = tk.id_tai_khoan
      LEFT JOIN Ve v ON d.id_don_dat_ve = v.id_don_dat_ve
      LEFT JOIN ChuyenTau ct ON v.id_chuyen = ct.id_chuyen
      LEFT JOIN LichChay lc ON ct.id_lich_chay = lc.id_lich_chay
      LEFT JOIN Tau t ON lc.id_tau = t.id_tau
      LEFT JOIN GaTau g1 ON v.id_ga_len = g1.id_ga
      LEFT JOIN GaTau g2 ON v.id_ga_xuong = g2.id_ga
      ORDER BY d.thoi_gian_dat DESC
    `);
    
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error('Lỗi lấy đơn hàng gần đây:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lịch chạy sắp tới
exports.getUpcomingTrains = async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT TOP 10
        t.so_hieu as id,
        g1.ten_ga as from_station,
        g2.ten_ga as to_station,
        FORMAT(lc.gio_khoi_hanh, 'HH:mm') as departure,
        ct.trang_thai as status
      FROM ChuyenTau ct
      JOIN LichChay lc ON ct.id_lich_chay = lc.id_lich_chay
      JOIN Tau t ON lc.id_tau = t.id_tau
      JOIN GaTau g1 ON lc.id_ga_di = g1.id_ga
      JOIN GaTau g2 ON lc.id_ga_den = g2.id_ga
      WHERE ct.ngay_chay = CAST(GETDATE() AS DATE)
        AND CAST(lc.gio_khoi_hanh AS TIME) >= CAST(GETDATE() AS TIME)
      ORDER BY lc.gio_khoi_hanh ASC
    `);
    
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error('Lỗi lấy lịch chạy sắp tới:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Top ga có lượng khách lớn nhất
exports.getTopStations = async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT TOP 5
        g.ten_ga as name,
        COUNT(v.id_ve) as traffic
      FROM Ve v
      JOIN GaTau g ON v.id_ga_len = g.id_ga
      GROUP BY g.ten_ga
      ORDER BY traffic DESC
    `);
    
    const total = result.recordset.reduce((sum, r) => sum + r.traffic, 0);
    const data = result.recordset.map(r => ({
      ...r,
      percentage: total > 0 ? Math.round(r.traffic / total * 100) : 0
    }));
    
    res.json({ success: true, data: data });
  } catch (error) {
    console.error('Lỗi lấy top ga:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Phân bố loại khách hàng
exports.getCustomerDistribution = async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT 
        loai_hanh_khach as name,
        COUNT(*) as value
      FROM HanhKhach
      GROUP BY loai_hanh_khach
    `);
    
    const colors = {
      'nguoi_lon': '#8C1D19',
      'sinh_vien': '#e67e22',
      'tre_em': '#27ae60',
      'nguoi_cao_tuoi': '#3498db'
    };
    
    const nameMap = {
      'nguoi_lon': 'Người lớn',
      'sinh_vien': 'Sinh viên',
      'tre_em': 'Trẻ em',
      'nguoi_cao_tuoi': 'Người cao tuổi'
    };
    
    const data = result.recordset.map(r => ({
      name: nameMap[r.name] || r.name,
      value: r.value,
      color: colors[r.name] || '#8C1D19'
    }));
    
    res.json({ success: true, data: data });
  } catch (error) {
    console.error('Lỗi lấy phân bố khách hàng:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Tỷ lệ đúng giờ và hủy vé
exports.getRates = async (req, res) => {
  try {
    // Tỷ lệ đúng giờ 30 ngày qua
    const ontimeResult = await executeQuery(`
      SELECT 
        COUNT(CASE WHEN trang_thai = 'dung_gio' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0) as ontime_rate
      FROM ChuyenTau
      WHERE ngay_chay >= DATEADD(day, -30, GETDATE())
    `);
    
    // Tỷ lệ hủy vé 30 ngày qua
    const cancelResult = await executeQuery(`
      SELECT 
        COUNT(CASE WHEN trang_thai = 'da_huy' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0) as cancel_rate
      FROM Ve
      WHERE ngay_xuat_ve >= DATEADD(day, -30, GETDATE())
    `);
    
    res.json({
      success: true,
      data: {
        ontime_rate: parseFloat(ontimeResult.recordset[0]?.ontime_rate || 0).toFixed(1),
        cancel_rate: parseFloat(cancelResult.recordset[0]?.cancel_rate || 0).toFixed(1)
      }
    });
  } catch (error) {
    console.error('Lỗi lấy tỷ lệ:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};