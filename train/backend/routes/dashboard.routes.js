const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/db');

// ==================== DASHBOARD TỔNG QUAN ====================

// 1. THỐNG KÊ TỔNG QUAN
router.get('/stats', async (req, res) => {
  try {
    // Tổng doanh thu từ bảng DonDatVe
    const revenueResult = await executeQuery(`
      SELECT ISNULL(SUM(tong_tien), 0) as total_revenue 
      FROM DonDatVe 
      WHERE trang_thai = N'da_thanh_toan'
    `);
    
    // Tổng số vé đã bán
    const ticketResult = await executeQuery(`
      SELECT COUNT(*) as total_tickets 
      FROM Ve
    `);
    
    // Tổng số khách hàng
    const customerResult = await executeQuery(`
      SELECT COUNT(*) as total_customers 
      FROM TaiKhoan 
      WHERE vai_tro = 'hanh_khach'
    `);
    
    // Tổng số tàu đang hoạt động
    const trainResult = await executeQuery(`
      SELECT COUNT(*) as total_trains 
      FROM Tau 
      WHERE trang_thai = 'hoat_dong'
    `);
    
    // Tỷ lệ lấp đầy trung bình
    const occupancyResult = await executeQuery(`
      SELECT AVG(CAST(ticket_count AS FLOAT) / seat_count * 100) as avg_occupancy
      FROM (
        SELECT 
          ct.ma_chuyen,
          COUNT(v.ma_ve) as ticket_count,
          SUM(cg.so_ghe_trong_toa) as seat_count
        FROM ChuyenTau ct
        LEFT JOIN Ve v ON ct.ma_chuyen = v.ma_chuyen AND v.trang_thai = 'hieu_luc'
        CROSS JOIN CauHinhGhe cg
        WHERE ct.ngay_chay >= DATEADD(day, -30, GETDATE())
        GROUP BY ct.ma_chuyen
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
    console.error('Lỗi dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Lỗi lấy thống kê' });
  }
});

// 2. DOANH THU THEO THÁNG (12 tháng gần nhất)
router.get('/revenue-by-month', async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT 
        MONTH(ngay_xuat_ve) as month,
        YEAR(ngay_xuat_ve) as year,
        SUM(gia_ve) as revenue,
        COUNT(*) as tickets
      FROM Ve v
      JOIN DonDatVe d ON v.ma_don = d.ma_don
      WHERE d.trang_thai = N'da_thanh_toan'
        AND ngay_xuat_ve >= DATEADD(month, -12, GETDATE())
      GROUP BY YEAR(ngay_xuat_ve), MONTH(ngay_xuat_ve)
      ORDER BY year ASC, month ASC
    `);
    
    // Format lại dữ liệu cho biểu đồ
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
    console.error('Lỗi revenue by month:', error);
    res.status(500).json({ success: false, message: 'Lỗi lấy doanh thu theo tháng' });
  }
});

// 3. DOANH THU THEO TUẦN (7 ngày gần nhất)
router.get('/revenue-by-week', async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT 
        DATEPART(weekday, ngay_xuat_ve) as day_of_week,
        SUM(gia_ve) as revenue,
        COUNT(*) as tickets
      FROM Ve v
      JOIN DonDatVe d ON v.ma_don = d.ma_don
      WHERE d.trang_thai = N'da_thanh_toan'
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
    console.error('Lỗi revenue by week:', error);
    res.status(500).json({ success: false, message: 'Lỗi lấy doanh thu theo tuần' });
  }
});

// 4. TUYẾN PHỔ BIẾN NHẤT (Top 10)
router.get('/popular-routes', async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT TOP 10
        g1.ten_ga as from_station,
        g2.ten_ga as to_station,
        COUNT(v.ma_ve) as total_tickets,
        SUM(v.gia_ve) as total_revenue
      FROM Ve v
      JOIN GaTau g1 ON v.ma_ga_len = g1.ma_ga
      JOIN GaTau g2 ON v.ma_ga_xuong = g2.ma_ga
      JOIN DonDatVe d ON v.ma_don = d.ma_don
      WHERE d.trang_thai = N'da_thanh_toan'
      GROUP BY g1.ten_ga, g2.ten_ga
      ORDER BY total_tickets DESC
    `);
    
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error('Lỗi popular routes:', error);
    res.status(500).json({ success: false, message: 'Lỗi lấy tuyến phổ biến' });
  }
});

// 5. ĐƠN HÀNG GẦN ĐÂY (Top 10)
router.get('/recent-orders', async (req, res) => {
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
      JOIN TaiKhoan tk ON d.ma_tai_khoan = tk.ma_tai_khoan
      JOIN Ve v ON d.ma_don = v.ma_don
      JOIN ChuyenTau ct ON v.ma_chuyen = ct.ma_chuyen
      JOIN LichChay lc ON ct.ma_lich_chay = lc.ma_lich_chay
      JOIN Tau t ON lc.ma_tau = t.ma_tau
      JOIN GaTau g1 ON v.ma_ga_len = g1.ma_ga
      JOIN GaTau g2 ON v.ma_ga_xuong = g2.ma_ga
      ORDER BY d.thoi_gian_dat DESC
    `);
    
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error('Lỗi recent orders:', error);
    res.status(500).json({ success: false, message: 'Lỗi lấy đơn hàng gần đây' });
  }
});

// 6. LỊCH CHẠY SẮP TỚI (24h tới)
router.get('/upcoming-trains', async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT TOP 10
        t.so_hieu as id,
        g1.ten_ga as from_station,
        g2.ten_ga as to_station,
        FORMAT(lc.gio_khoi_hanh, 'HH:mm') as departure,
        ct.trang_thai as status
      FROM ChuyenTau ct
      JOIN LichChay lc ON ct.ma_lich_chay = lc.ma_lich_chay
      JOIN Tau t ON lc.ma_tau = t.ma_tau
      JOIN GaTau g1 ON lc.ma_ga_di = g1.ma_ga
      JOIN GaTau g2 ON lc.ma_ga_den = g2.ma_ga
      WHERE ct.ngay_chay = CAST(GETDATE() AS DATE)
        AND CAST(lc.gio_khoi_hanh AS TIME) >= CAST(GETDATE() AS TIME)
      ORDER BY lc.gio_khoi_hanh ASC
    `);
    
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error('Lỗi upcoming trains:', error);
    res.status(500).json({ success: false, message: 'Lỗi lấy lịch chạy sắp tới' });
  }
});

// 7. TOP GA CÓ LƯỢNG KHÁCH LỚN NHẤT
router.get('/top-stations', async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT TOP 5
        g.ten_ga as name,
        COUNT(v.ma_ve) as traffic
      FROM Ve v
      JOIN GaTau g ON v.ma_ga_len = g.ma_ga
      GROUP BY g.ten_ga
      ORDER BY traffic DESC
    `);
    
    // Tính tổng để lấy phần trăm
    const total = result.recordset.reduce((sum, r) => sum + r.traffic, 0);
    const data = result.recordset.map(r => ({
      ...r,
      percentage: total > 0 ? Math.round(r.traffic / total * 100) : 0
    }));
    
    res.json({ success: true, data: data });
  } catch (error) {
    console.error('Lỗi top stations:', error);
    res.status(500).json({ success: false, message: 'Lỗi lấy top ga' });
  }
});

// 8. PHÂN BỐ LOẠI KHÁCH HÀNG
router.get('/customer-distribution', async (req, res) => {
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
    
    const data = result.recordset.map(r => ({
      name: r.name === 'nguoi_lon' ? 'Người lớn' :
            r.name === 'sinh_vien' ? 'Sinh viên' :
            r.name === 'tre_em' ? 'Trẻ em' : 'Người cao tuổi',
      value: r.value,
      color: colors[r.name] || '#8C1D19'
    }));
    
    res.json({ success: true, data: data });
  } catch (error) {
    console.error('Lỗi customer distribution:', error);
    res.status(500).json({ success: false, message: 'Lỗi lấy phân bố khách hàng' });
  }
});

module.exports = router;