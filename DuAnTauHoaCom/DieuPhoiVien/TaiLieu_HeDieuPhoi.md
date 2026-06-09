# HỆ THỐNG ĐIỀU PHỐI VIÊN — KLN TRAIN
## Tài liệu Thiết kế & Vận hành

---

## 1. TỔNG QUAN HỆ THỐNG

### 1.1 Mục đích
Hệ thống Điều Phối Viên (DispatcherPortal) là công cụ nội bộ dành cho nhân viên KLN Train để:
- Quản lý và theo dõi các chuyến tàu theo thời gian thực
- Điều chỉnh lịch chạy và cấu hình toa tàu linh hoạt
- Ghi nhận và phát sóng các sự kiện vận hành (chậm giờ, hủy chuyến, bảo trì)
- Sinh hàng loạt chuyến tàu từ lịch chạy định kỳ

### 1.2 Đối tượng sử dụng
| Vai trò | Quyền truy cập |
|---------|----------------|
| `quan_tri` | Toàn bộ chức năng |
| `nhan_vien` | Toàn bộ chức năng điều phối |
| `dieu_phoi` | Toàn bộ chức năng điều phối |

### 1.3 URL truy cập
- **Portal Điều Phối Viên**: http://localhost:5174
- **Backend API**: http://localhost:8000/api/dispatch/
- **Portal Hành Khách**: http://localhost:5173 (riêng biệt)

---

## 2. KIẾN TRÚC HỆ THỐNG

```
DieuPhoiVien/
├── frontend/                    ← React 19 + Vite + Tailwind (port 5174)
│   └── src/
│       ├── pages/
│       │   ├── Login.jsx        ← Đăng nhập
│       │   ├── Dashboard.jsx    ← Tổng quan thời gian thực
│       │   ├── QuanLyChuyen.jsx ← Danh sách và quản lý chuyến
│       │   ├── ChiTietChuyen.jsx← Chi tiết: toa + sự kiện
│       │   └── QuanLyLich.jsx   ← Quản lý lịch chạy
│       ├── components/
│       │   ├── Layout.jsx       ← Sidebar + Header
│       │   └── StatusBadge.jsx  ← Badge trạng thái
│       ├── api/
│       │   ├── client.js        ← Axios với JWT interceptor
│       │   └── dieuphoi.js      ← Tất cả API calls
│       └── utils/auth.js        ← Token management (KLN_DP_AUTH)
│
backend/src/                     ← Tích hợp vào backend hiện tại
├── models/
│   ├── DieuPhoi.js              ← Model sự kiện điều phối
│   └── LichTrinhThucTe.js       ← Model lịch trình thực tế
├── controllers/
│   └── DieuPhoiController.js   ← 15 endpoints
└── routes/dieuphoi.js          ← /api/dispatch/* + middleware auth
```

### 2.1 Cơ sở dữ liệu
Kết nối SQL Server `Train` (cùng DB với hệ thống hành khách).

**Bảng chính:**
| Bảng | Mục đích |
|------|---------|
| `ChuyenTau` | Chuyến tàu cụ thể theo ngày |
| `LichChay` | Lịch chạy định kỳ |
| `ToaChuyen` | Cấu hình toa theo chuyến (runtime) |
| `DieuPhoi` | Log sự kiện vận hành |
| `LichTrinhThucTe` | Thời gian thực tế tại từng ga |

---

## 3. CÁC TÍNH NĂNG CHÍNH

### 3.1 Tổng quan Dashboard
- **Thống kê chuyến hôm nay** theo trạng thái (màu sắc phân loại)
- **Danh sách chuyến** với trạng thái và giờ khởi hành
- **Sự kiện 24h gần nhất** với chi tiết loại sự kiện và ga ảnh hưởng
- **Auto-refresh** mỗi 60 giây
- Click vào chuyến để xem chi tiết

### 3.2 Quản lý Chuyến Tàu
**Tìm kiếm & Lọc:**
- Theo khoảng ngày (từ/đến)
- Theo tàu
- Theo trạng thái
- Phân trang 20 chuyến/trang

**Thao tác nhanh:**
- `Chi tiết` → xem và quản lý đầy đủ
- `✓ Đã chạy` → đổi trạng thái sang `da_chay`
- `✕ Hủy` → hủy với lý do (tự tạo sự kiện cancel)

**Sinh chuyến hàng loạt:**
- Chọn lịch chạy + khoảng ngày (tối đa 90 ngày)
- Tự động bỏ qua chuyến đã tồn tại
- Báo cáo số chuyến tạo mới / bỏ qua

### 3.3 Chi tiết Chuyến Tàu

**Tab Quản lý Toa:**
- Danh sách toa với loại toa, sức chứa, số vé đã bán
- Thêm toa: chọn số thứ tự + loại toa + sức chứa tùy chỉnh
- Chỉnh sửa toa: đổi loại toa (chỉ khi chưa có vé)
- Xóa toa: chỉ được khi chưa có vé đặt
- Sắp xếp lại thứ tự: di chuyển lên/xuống
- Tự động tạo `GheChuyen` sau khi thêm toa

**Tab Lịch sử Sự kiện:**
- Timeline các sự kiện điều phối
- Hiển thị loại, mô tả, ga ảnh hưởng, số phút trễ
- Phân biệt màu theo loại sự kiện

**Đổi trạng thái:**
| Trạng thái | Ý nghĩa |
|-----------|---------|
| `dung_gio` | Đang chờ giờ khởi hành |
| `sap_den` | Tàu sắp đến ga tiếp theo |
| `dieu_chinh` | Có điều chỉnh lịch |
| `da_chay` | Đã xuất phát |
| `huy` | Hủy chuyến (tự tạo sự kiện) |

**Ghi nhận sự kiện:**
| Loại | Mô tả |
|------|-------|
| `delay` | Chậm giờ — nhập số phút + ga ảnh hưởng |
| `cancel` | Hủy chuyến — tự đổi trạng thái = `huy` |
| `maintenance` | Bảo trì kỹ thuật |
| `info` | Thông báo chung |

### 3.4 Quản lý Lịch Chạy
- Xem tất cả lịch chạy, lọc theo tàu
- **Tạo lịch mới**: tàu, ga đi/đến, giờ khởi hành/đến, thứ trong tuần
- **Chỉnh sửa**: cập nhật giờ, ga, lịch chạy
- Hiển thị "Hằng ngày" khi không giới hạn thứ

---

## 4. API ENDPOINTS

Tất cả endpoint yêu cầu: `Authorization: Bearer <JWT Token>`  
Vai trò hợp lệ: `quan_tri`, `nhan_vien`, `dieu_phoi`

| Method | Path | Mô tả | Params |
|--------|------|-------|--------|
| GET | `/api/dispatch/dashboard` | Thống kê tổng quan | — |
| GET | `/api/dispatch/chuyen-tau` | Danh sách chuyến | ngay, ngayDen, trangThai, idTau, page, limit |
| GET | `/api/dispatch/chuyen-tau/:id` | Chi tiết chuyến | — |
| PUT | `/api/dispatch/chuyen-tau/:id/trang-thai` | Đổi trạng thái | { trangThai, ghiChu } |
| POST | `/api/dispatch/chuyen-tau/:id/su-kien` | Ghi sự kiện | { loaiSuKien, moTa, delayPhut, idGaAnhHuong } |
| POST | `/api/dispatch/chuyen-tau/:id/toa` | Thêm toa | { soToaThuTu, idLoaiToa, soGheToidDa } |
| PUT | `/api/dispatch/chuyen-tau/:id/sap-xep-toa` | Sắp xếp toa | { order: [{idToaChuyen, soToaThuTu}] } |
| PUT | `/api/dispatch/toa/:id` | Sửa toa | { soToaThuTu, idLoaiToa, soGheToidDa } |
| DELETE | `/api/dispatch/toa/:id` | Xóa toa | — |
| GET | `/api/dispatch/lich-chay` | Danh sách lịch | idTau |
| POST | `/api/dispatch/lich-chay` | Tạo lịch | { idTau, idGaDi, idGaDen, gioKhoiHanh, gioDuKienDen, thuTrongTuan } |
| PUT | `/api/dispatch/lich-chay/:id` | Sửa lịch | { gioKhoiHanh, ... } |
| POST | `/api/dispatch/sinh-chuyen` | Sinh chuyến hàng loạt | { idLichChay, tuNgay, denNgay } |
| GET | `/api/dispatch/tau` | Danh sách tàu | — |
| GET | `/api/dispatch/ga` | Danh sách ga | — |
| GET | `/api/dispatch/loai-toa` | Danh sách loại toa | — |

---

## 5. CÀI ĐẶT & KHỞI ĐỘNG

### Backend (tích hợp vào backend hiện tại)
```bash
cd backend
npm run dev     # Chạy tại port 8000 — đã bao gồm /api/dispatch/*
```

### Frontend Điều Phối Viên
```bash
cd DieuPhoiVien/frontend
npm install     # Cài lần đầu
npm run dev     # Truy cập: http://localhost:5174
```

### Tài khoản thử nghiệm
| Email | Vai trò | Ghi chú |
|-------|---------|---------|
| admin@klntrain.vn | quan_tri | Full quyền |
| nv2@klntrain.vn | nhan_vien | Điều phối viên |
| dp1@klntrain.vn | nhan_vien | Điều phối viên |

---

## 6. LƯU Ý KỸ THUẬT

### 6.1 Xác thực
- Dùng cùng JWT với hệ thống chính (backend chung)
- Token lưu tại `localStorage` key `KLN_DP_AUTH` (tách biệt với `KLN_AUTH` của khách hàng)
- Tự động logout khi nhận 401

### 6.2 Ràng buộc nghiệp vụ
- **Xóa toa**: chỉ khi chưa có vé đặt (kiểm tra bảng `Ve`)
- **Đổi loại toa**: chỉ khi chưa có vé đặt
- **Sinh chuyến**: tối đa 90 ngày mỗi lần, tự bỏ qua nếu đã tồn tại
- **Hủy chuyến**: tự động tạo `DieuPhoi(loai_su_kien='cancel')`
- **Ghi delay**: tự động đổi `trang_thai = 'dieu_chinh'` nếu đang `dung_gio/sap_den`

### 6.3 Segment Seat & GheChuyen
Khi thêm toa mới vào chuyến, hệ thống tự gọi `sp_EnsureGheChuyen` để tạo `GheChuyen` records — đảm bảo tính năng đặt vé theo chặng hoạt động đúng.

### 6.4 Phân biệt Portal
| Portal | URL | Key Auth | Backend Prefix |
|--------|-----|----------|----------------|
| Hành khách | :5173 | KLN_AUTH | /api/* |
| Điều phối viên | :5174 | KLN_DP_AUTH | /api/dispatch/* |

---

*Tài liệu cập nhật: 2026-06-03 — KLN Train Development Team*
