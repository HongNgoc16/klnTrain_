const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));
app.use('/api/stations', require('./routes/stations.routes'));
app.use('/api/trains', require('./routes/trains.routes'));
app.use('/api/carriages', require('./routes/carriages.routes'));
app.use('/api/customers', require('./routes/customers.routes'));
app.use('/api/seats', require('./routes/seats.routes'));
app.use('/api/policies', require('./routes/policies.routes'));
app.use('/api/schedules', require('./routes/schedules.routes'));
app.use('/api/users', require('./routes/users.routes'));
app.use('/api/coupons', require('./routes/coupons.routes'));
app.use('/api/refunds', require('./routes/refunds.routes'));
app.use('/api/reports', require('./routes/reports.routes'));
app.use('/api/notifications', require('./routes/notifications.routes'));
app.use('/api/tickets', require('./routes/ticket.routes'));


// Test route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({ success: false, message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📌 Test login: POST http://localhost:${PORT}/api/auth/login`);
});

// Chạy mỗi giờ để cập nhật vé đã qua giờ
const cron = require('node-cron');
const { executeQuery } = require('./config/db');

cron.schedule('0 * * * *', async () => {
  console.log(' Đang cập nhật trạng thái vé tự động...');
  try {
    const result = await executeQuery(`
      UPDATE Ve 
      SET trang_thai = 'da_su_dung' 
      WHERE trang_thai IN ('hieu_luc', 'da_xac_nhan')
        AND EXISTS (
          SELECT 1 FROM ChuyenTau ct 
          WHERE ct.id_chuyen = Ve.id_chuyen 
            AND ct.ngay_chay < GETDATE()
        )
    `);
    console.log(` Đã cập nhật ${result.rowsAffected?.[0] || 0} vé`);
  } catch (error) {
    console.error(' Lỗi cập nhật tự động:', error);
  }
});