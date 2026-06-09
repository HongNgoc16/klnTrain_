-- ============================================================
-- AMEND03.sql — Fix dữ liệu sinh viên bị lưu sai thành nguoi_lon
-- Chạy sau AMEND01, AMEND02
-- ============================================================
USE [Train]
GO

-- Thêm 'sinh_vien' vào cột nếu chưa có (không có CHECK constraint nên không cần ALTER)
-- Kiểm tra các Ve bị lưu sai: sinh viên đã đặt vé với giảm giá 10%
-- Cách nhận biết: gia_ve = ROUND(base_price * 0.9 / 1000) * 1000
-- KHÔNG thể tự động sửa chắc chắn vì không có cờ isStudent trong DB cũ.
-- Sửa thủ công những vé cụ thể nếu biết id_ve:

-- Ví dụ sửa vé sinh viên bị lưu sai:
-- UPDATE Ve SET loai_hanh_khach = 'sinh_vien' WHERE id_ve IN (...)
-- UPDATE HanhKhach SET loai_hanh_khach = 'sinh_vien' WHERE id_hanh_khach IN (...)

PRINT N'=== AMEND03: Sau khi deploy code mới, tất cả vé sinh viên mới sẽ lưu đúng loại ==='
PRINT N'=== Để sửa dữ liệu cũ, chạy lệnh UPDATE thủ công với id_ve cụ thể ==='
GO
