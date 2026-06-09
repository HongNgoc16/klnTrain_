# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**DuAnTauHoa** — Hệ thống đặt vé tàu hỏa KLN Train, gồm:
- `frontend/` — React 19 + Vite SPA (Tailwind CSS)
- `backend/`  — Node.js + Express REST API (SQL Server + Sequelize + JWT)

## Commands

### Backend
```bash
cd backend
npm install          # Cài dependencies lần đầu
npm run dev          # Chạy dev server (nodemon) tại http://localhost:5000
npm start            # Chạy production
```

### Frontend
```bash
cd frontend
npm install          # Cài dependencies lần đầu
npm run dev          # Vite HMR tại http://localhost:5173
npm run build        # Build → dist/
npm run preview      # Preview build
npm run lint         # ESLint
```

### Database
- Restore file `D:\Nam3\Ki2_Nam3\CNLTTH\klntrain\kln_train.sql` vào SQL Server
- Đặt tên DB: `KLN_Train`
- Cập nhật `backend/.env` với thông tin kết nối DB

## Architecture

### Backend — Layered Architecture (BaseCore-style)

```
backend/src/
├── config/          # database.js (Sequelize + SQL Server)
├── models/          # Sequelize models → index.js gộp + khai báo associations
├── repositories/    # Data access layer
│   ├── BaseRepository.js   — CRUD chung (findAll, findById, create, update, delete)
│   ├── TaiKhoanRepository.js
│   ├── TrainRepository.js  — searchChuyen, getCoachesByChuyen, getSeatMap
│   └── BookingRepository.js — findByMaDatCho, holdSeats, checkSeatsAvailable
├── services/        # Business logic
│   ├── AuthService.js      — register, login, JWT signing
│   ├── TrainService.js     — searchTrains, getSeatMap, tinhGiaVe (km × biểu giá × hệ số ghế)
│   ├── BookingService.js   — createBooking (transaction), lookupBooking, formatDon
│   ├── PaymentService.js   — createPayment (QR VietQR), confirmPayment (→ tạo HoaDon)
│   ├── CancelService.js    — tinhPhiHuy (ChinhSachHuy), cancelTickets
│   └── ExchangeService.js  — checkExchangeable, exchangeTicket
├── controllers/     # Express request handlers
├── routes/          # Express routers → aggregated in index.js
├── middleware/
│   ├── auth.js      — authenticate (JWT), optionalAuth, requireAdmin
│   └── errorHandler.js — global error + 404 handler
└── utils/
    ├── response.js  — ok, created, error, notFound, badRequest, unauthorized
    └── helpers.js   — genBookingCode, genOrderCode, calcCancelFee, calcExchangeFee
```

### Frontend — React SPA

State flows via React Router `navigate(path, { state })` + `useLocation().state`.  
API calls go through `src/api/` (fetch-based client with JWT bearer token).

```
frontend/src/
├── api/             # Backend API client modules
│   ├── client.js   — fetch wrapper, auto-attaches JWT token
│   ├── auth.js     — register, login, profile
│   ├── trains.js   — searchTrains, getStations, getSeatMap
│   ├── bookings.js — createBooking, lookupBooking, history
│   ├── payments.js — createPayment, confirmPayment
│   ├── cancel.js   — getCancelFee, cancelTickets
│   └── exchange.js — checkExchangeable, exchangeTicket
├── pages/          — 11 route pages (Vietnamese slugs)
├── components/     — TicketCard
├── component/      — Navbar
├── data/           — Static mock data (trains.js, stations.js, bookingMock.js)
│                     (legacy — production uses backend API)
├── utils/
│   ├── authUtils.js — getUser/getToken (KLN_AUTH localStorage), loginUser({ token, user })
│   └── dateUtils.js
└── layout/         — RootLayout
```

### Database Schema — SQL Server `KLN_Train`

Key tables and relationships:
- **Tau** → **LichChay** (tuyến + giờ chạy) → **ChuyenTau** (chuyến cụ thể theo ngày)
- **ChuyenTau** → **Ve** (vé cụ thể, ghế + hành khách)
- **DonDatVe** (đơn) → **Ve** (nhiều vé) → **ThanhToan** → **HoaDon**
- **TamGiuGhe** — giữ ghế 15 phút trong lúc thanh toán
- **BieuGia** — biểu giá theo đợt (ngày lễ/hè/thường); giá = km × đơn giá × hệ số tăng × hệ số ghế
- **ChinhSachHuy** — phí hủy theo số giờ trước giờ chạy
- **ChinhSachGia** — giảm giá theo loại hành khách (trẻ em, người cao tuổi)
- **KhuyenMai** — mã giảm giá (% hoặc số tiền cố định)

### API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | — | Đăng ký tài khoản |
| POST | /api/auth/login | — | Đăng nhập → JWT |
| GET | /api/auth/profile | ✅ | Thông tin tài khoản |
| GET | /api/trains/search | — | Tìm chuyến tàu |
| GET | /api/trains/stations | — | Danh sách ga |
| GET | /api/trains/:id/seats/:soToa | — | Sơ đồ ghế |
| POST | /api/bookings | optional | Đặt vé (tạo đơn + giữ ghế) |
| POST | /api/bookings/lookup | — | Tra cứu đơn (mã + email/phone) |
| GET | /api/bookings/history | ✅ | Lịch sử đặt vé |
| POST | /api/payments | — | Tạo giao dịch + QR |
| PUT | /api/payments/:id/confirm | — | Xác nhận thanh toán |
| GET | /api/cancel/fee/:idVe | — | Tính phí hủy vé |
| POST | /api/cancel | — | Hủy vé |
| GET | /api/exchange/check/:idVe | — | Kiểm tra điều kiện đổi |
| POST | /api/exchange | — | Đổi vé |

### Booking Flow (tích hợp Backend)

1. `Home` → search → navigate to `/tim-ve`
2. `TicketSearch` → chọn tàu (gọi `/api/trains/search`) → chọn ghế (gọi `/api/trains/:id/seats/:soToa`) → navigate to `/checkout`
3. `Checkout` → form hành khách → submit → gọi `POST /api/bookings` → nhận `{ maDon, maDatCho, idDon, tongThanhToan }` → navigate to `/thanh-toan`
4. `PaymentMethod` → chọn phương thức → navigate to `/thanh-toan/qr`
5. `QRPayment` → gọi `POST /api/payments` → hiển thị QR + 15 phút countdown → confirm → `PUT /api/payments/:id/confirm` → navigate to `/thanh-toan/thanh-cong`

## Configuration

### Backend `.env`
```
DB_SERVER=localhost
DB_PORT=1433
DB_NAME=KLN_Train
DB_USER=sa
DB_PASSWORD=YourPassword

JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=24h

PORT=5000
FRONTEND_URL=http://localhost:5173
```

### Frontend `.env`
```
VITE_API_URL=http://localhost:5000/api
```
