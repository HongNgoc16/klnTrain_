const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { executeQuery, testConnection } = require('./config/db');

dotenv.config();

const app = express();

// CORS
// Thêm middleware CORS trước các route
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
// TEST ROUTE TRỰC TIẾP - KHÔNG QUA FILE ROUTE
app.get('/api/schedules-direct', (req, res) => {
  console.log('✅ Direct route called!');
  res.json({ success: true, message: 'Direct route works!', data: [] });
});

// Import routes
const authRoutes = require('./routes/auth.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const trainRoutes = require('./routes/train.routes');
const stationRoutes = require('./routes/station.routes');
const ticketRoutes = require('./routes/ticket.routes');
const scheduleRoutes = require('./routes/schedule.routes'); 
const customerRoutes = require('./routes/customer.routes');

// Sử dụng routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/trains', trainRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/schedules', scheduleRoutes);

// API ĐĂNG NHẬP - DÙNG DATABASE THẬT 
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  console.log('🔐 Login attempt:', email);
  
  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Vui lòng nhập email và mật khẩu' 
    });
  }
  
  try {
    // Truy vấn database thật
    const result = await executeQuery(
      `SELECT ma_tai_khoan, email, mat_khau, ho_ten, vai_tro, trang_thai 
       FROM TaiKhoan 
       WHERE email = @email`,
      { email }
    );
    
    console.log(' Query result:', result.recordset.length);
    
    if (result.recordset.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Email hoặc mật khẩu không đúng' 
      });
    }
    
    const user = result.recordset[0];
    
    // Kiểm tra mật khẩu
    if (password !== user.mat_khau) {
      console.log(' Sai mật khẩu');
      return res.status(401).json({ 
        success: false, 
        message: 'Email hoặc mật khẩu không đúng' 
      });
    }
    
    // Kiểm tra tài khoản bị khóa
    if (!user.trang_thai) {
      return res.status(401).json({ 
        success: false, 
        message: 'Tài khoản đã bị khóa' 
      });
    }
    
    // Kiểm tra quyền (chỉ cho quan_tri hoặc nhan_vien)
    if (user.vai_tro !== 'quan_tri' && user.vai_tro !== 'nhan_vien') {
      return res.status(403).json({ 
        success: false, 
        message: 'Bạn không có quyền truy cập hệ thống quản trị' 
      });
    }
    
    console.log(' Đăng nhập thành công:', user.ho_ten);
    
    res.json({
      success: true,
      user: {
        id: user.ma_tai_khoan,
        email: user.email,
        name: user.ho_ten,
        role: user.vai_tro === 'quan_tri' ? 'admin' : 'staff'
      }
    });
    
  } catch (error) {
    console.error(' Lỗi đăng nhập:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server, vui lòng thử lại sau' 
    });
  }
});

// ==================== API DASHBOARD STATS ====================
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    // Tổng doanh thu từ database
    const revenueResult = await executeQuery(`
      SELECT ISNULL(SUM(tong_tien), 0) as total_revenue 
      FROM DonDatVe 
      WHERE trang_thai = 'da_thanh_toan'
    `);
    
    // Tổng vé đã bán
    const ticketResult = await executeQuery(`
      SELECT COUNT(*) as total_tickets FROM Ve
    `);
    
    // schedule
  const scheduleRoutes = require('./routes/schedule.routes');
  app.use('/api/schedules', scheduleRoutes);

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

// ==================== API DOANH THU THEO THÁNG ====================
app.get('/api/dashboard/revenue-by-month', async (req, res) => {
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

// ==================== API ĐƠN HÀNG GẦN ĐÂY ====================
app.get('/api/dashboard/recent-orders', async (req, res) => {
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

// ==================== HEALTH CHECK ====================
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running with REAL DATABASE' });
});

// ==================== KHỞI ĐỘNG SERVER ====================
const PORT = process.env.PORT || 5000;

async function startServer() {
  console.log('\n Đang khởi động server...\n');
  
  // Kiểm tra kết nối database
  const dbConnected = await testConnection();
  
  if (!dbConnected) {
    console.log(' Không thể kết nối database, server vẫn chạy nhưng API database sẽ lỗi');
  }
  
  app.listen(PORT, () => {
    console.log(`\n Server running on http://localhost:${PORT}`);
    console.log(`\n API Endpoints:`);
    console.log(`   POST http://localhost:${PORT}/api/auth/login`);
    console.log(`   GET  http://localhost:${PORT}/api/dashboard/stats`);
    console.log(`   GET  http://localhost:${PORT}/api/coupons`);
    console.log(`   POST http://localhost:${PORT}/api/coupons`);
    console.log(`   GET  http://localhost:${PORT}/api/health`);
  });
}

startServer();