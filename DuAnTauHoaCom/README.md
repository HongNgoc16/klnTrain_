# DuAnTauHoa — KLN Train Booking System

Hệ thống đặt vé tàu hỏa hoàn chỉnh với Frontend React + Backend Node.js + SQL Server.

## Cấu trúc dự án

```
DuAnTauHoa/
├── frontend/   ← React 19 + Vite + Tailwind CSS
├── backend/    ← Node.js + Express + Sequelize + SQL Server + JWT
├── CLAUDE.md   ← Hướng dẫn cho Claude Code
└── README.md
```

## Yêu cầu hệ thống

- Node.js >= 18
- SQL Server (2019 hoặc mới hơn)
- npm >= 8

## Cài đặt và chạy

### Bước 1: Restore CSDL

```sql
-- Mở SQL Server Management Studio
-- Restore file: D:\Nam3\Ki2_Nam3\CNLTTH\klntrain\kln_train.sql
-- hoặc chạy file SQL để tạo database KLN_Train
```

### Bước 2: Cấu hình Backend

```bash
cd backend

# Sao chép và chỉnh sửa file cấu hình
copy .env.example .env

# Chỉnh sửa .env với thông tin SQL Server của bạn:
# DB_SERVER=localhost
# DB_USER=sa
# DB_PASSWORD=YourPassword
# DB_NAME=KLN_Train

# Cài dependencies
npm install

# Chạy backend (http://localhost:5000)
npm run dev
```

### Bước 3: Chạy Frontend

```bash
cd frontend

# Cài dependencies
npm install

# Chạy frontend (http://localhost:5173)
npm run dev
```

## API Endpoints chính

| Method | URL | Mô tả |
|--------|-----|-------|
| POST | /api/auth/register | Đăng ký |
| POST | /api/auth/login | Đăng nhập |
| GET | /api/trains/search | Tìm chuyến tàu |
| GET | /api/trains/stations | Danh sách ga |
| GET | /api/trains/:id/seats/:toa | Sơ đồ ghế |
| POST | /api/bookings | Đặt vé |
| POST | /api/bookings/lookup | Tra cứu đặt chỗ |
| POST | /api/payments | Tạo giao dịch |
| PUT | /api/payments/:id/confirm | Xác nhận TT |
| POST | /api/cancel | Hủy vé |
| POST | /api/exchange | Đổi vé |

## Luồng đặt vé

```
Trang chủ → Tìm kiếm → Chọn tàu → Chọn ghế → Thông tin HK → QR Thanh toán → Thành công
```

## Công nghệ sử dụng

**Backend:**
- Node.js + Express 4
- Sequelize 6 (ORM)
- SQL Server (mssql + tedious)
- JWT (jsonwebtoken)
- bcryptjs (mã hóa mật khẩu)
- express-validator (validation)

**Frontend:**
- React 19
- React Router DOM 7
- Tailwind CSS 3
- Vite 8
- framer-motion (animations)
- react-icons
