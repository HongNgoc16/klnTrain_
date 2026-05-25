const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/db');

// GET: Thống kê tổng quan
router.get('/stats', async (req, res) => {
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
      FROM TaiKhoan WHERE vai_tro = 'hanh_khach'
    `);
    
    res.json({
      success: true,
      data: {
        total_revenue: revenueResult.recordset[0]?.total_revenue || 0,
        total_tickets: ticketResult.recordset[0]?.total_tickets || 0,
        total_customers: customerResult.recordset[0]?.total_customers || 0
      }
    });
  } catch (error) {
    console.error('Lỗi dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Lỗi lấy thống kê' });
  }
});

// GET: Doanh thu theo tháng
router.get('/revenue-by-month', async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT 
        MONTH(ngay_xuat_ve) as month,
        SUM(gia_ve) as revenue,
        COUNT(*) as tickets
      FROM Ve v
      JOIN DonDatVe d ON v.ma_don = d.ma_don
      WHERE d.trang_thai = 'da_thanh_toan'
        AND ngay_xuat_ve >= DATEADD(month, -12, GETDATE())
      GROUP BY MONTH(ngay_xuat_ve)
      ORDER BY month ASC
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
    console.error('Lỗi revenue by month:', error);
    res.status(500).json({ success: false, message: 'Lỗi lấy doanh thu' });
  }
});

// GET: Đơn hàng gần đây
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
      LEFT JOIN Ve v ON d.ma_don = v.ma_don
      LEFT JOIN ChuyenTau ct ON v.ma_chuyen = ct.ma_chuyen
      LEFT JOIN LichChay lc ON ct.ma_lich_chay = lc.ma_lich_chay
      LEFT JOIN Tau t ON lc.ma_tau = t.ma_tau
      LEFT JOIN GaTau g1 ON v.ma_ga_len = g1.ma_ga
      LEFT JOIN GaTau g2 ON v.ma_ga_xuong = g2.ma_ga
      ORDER BY d.thoi_gian_dat DESC
    `);
    
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error('Lỗi recent orders:', error);
    res.status(500).json({ success: false, message: 'Lỗi lấy đơn hàng' });
  }
});

module.exports = router;