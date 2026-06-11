require('dotenv').config()
const express = require('express')
const cors    = require('cors')
const { connectDB } = require('./src/config/database')
const routes  = require('./src/routes')
const { errorHandler, notFoundHandler } = require('./src/middleware/errorHandler')

// Khởi tạo models (chạy associations)
require('./src/models')

const app  = express()
const PORT = process.env.PORT || 5000

// ─── Middleware ────────────────────────────────────────────────────
// Cho phép nhiều origin: portal hành khách (5173) + portal điều phối (5174) + portal quản trị (3000)
const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL      || 'http://localhost:5173',
  process.env.DISPATCHER_URL    || 'http://localhost:5174',
  process.env.ADMIN_URL         || 'http://localhost:3000',
]
app.use(cors({
  origin: (origin, callback) => {
    // Cho phép request không có origin (Postman, curl, mobile app)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return callback(null, true)
    callback(new Error(`CORS: origin ${origin} không được phép`))
  },
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// ─── Routes ───────────────────────────────────────────────────────
app.use('/api', routes)
app.use('/api/admin', require('./src/admin'))

// ─── Error Handling ───────────────────────────────────────────────
app.use(notFoundHandler)
app.use(errorHandler)

// ─── Cron: tự động cập nhật trạng thái ChuyenTau ─────────────────────
const { sequelize: db } = require('./src/config/database')
const startCron = () => {
  const runUpdate = async () => {
    try {
      await db.query('EXEC sp_CapNhatTrangThaiChuyen')
    } catch (e) {
      // Im lặng nếu proc chưa có (chạy AMEND01.sql trước)
    }
  }
  runUpdate()                                  // Chạy ngay khi khởi động
  setInterval(runUpdate, 5 * 60 * 1000)        // Sau đó mỗi 5 phút
}

// ─── Khởi động server ─────────────────────────────────────────────
const start = async () => {
  try {
    await connectDB()
    startCron()
    app.listen(PORT, () => {
      console.log(`✅ Server đang chạy tại http://localhost:${PORT}`)
      console.log(`📋 API docs: http://localhost:${PORT}/api/health`)
    })
  } catch (err) {
    console.error('❌ Không thể khởi động server:', err.message)
    process.exit(1)
  }
}

start()
