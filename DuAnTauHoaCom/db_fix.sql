USE [KLN_Train]
GO

-- ================================================================
-- FIX 1: Bảng Ve — đổi UNIQUE constraint thành filtered index
--   Vấn đề: UK_Ve_Chuyen_Toa_Ghe apply cho TẤT CẢ dòng kể cả
--           da_huy/da_doi → block INSERT vé mới cùng ghế
--   Fix:    Chỉ enforce uniqueness cho vé còn hiệu lực
-- ================================================================
IF EXISTS (
    SELECT 1 FROM sys.key_constraints
    WHERE name = 'UK_Ve_Chuyen_Toa_Ghe'
      AND parent_object_id = OBJECT_ID('dbo.Ve')
)
BEGIN
    ALTER TABLE [dbo].[Ve] DROP CONSTRAINT [UK_Ve_Chuyen_Toa_Ghe]
    PRINT 'Da xoa UK_Ve_Chuyen_Toa_Ghe'
END
ELSE
    PRINT 'UK_Ve_Chuyen_Toa_Ghe khong ton tai, bo qua'
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'UK_Ve_Active_Chuyen_Toa_Ghe'
      AND object_id = OBJECT_ID('dbo.Ve')
)
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX [UK_Ve_Active_Chuyen_Toa_Ghe]
    ON [dbo].[Ve] ([id_chuyen], [so_toa_thu_tu], [so_ghe_trong_toa])
    WHERE [trang_thai] NOT IN ('da_huy', 'da_doi')
    PRINT 'Da tao UK_Ve_Active_Chuyen_Toa_Ghe (filtered index)'
END
ELSE
    PRINT 'UK_Ve_Active_Chuyen_Toa_Ghe da ton tai, bo qua'
GO

-- ================================================================
-- FIX 2: Bảng TamGiuGhe — thêm trạng thái da_giai_phong
--   Giải thích trạng thái:
--     dang_giu    : Đang giữ chỗ (15 phút trong lúc thanh toán)
--     da_dat      : Đã xác nhận sau thanh toán thành công
--     da_giai_phong: Đã giải phóng (khách hủy, bỏ trang, hoặc đổi vé)
--     het_han     : Hết thời gian giữ mà chưa thanh toán
--   Vấn đề: CHECK cũ không có da_giai_phong
--           → UPDATE trang_thai='da_giai_phong' sẽ bị lỗi khi hủy/đổi vé
-- ================================================================
DECLARE @ck_name NVARCHAR(256)
SELECT @ck_name = cc.name
FROM sys.check_constraints cc
WHERE cc.parent_object_id = OBJECT_ID('dbo.TamGiuGhe')
  AND cc.definition LIKE '%trang_thai%'

IF @ck_name IS NOT NULL
BEGIN
    DECLARE @sql NVARCHAR(500) = 'ALTER TABLE [dbo].[TamGiuGhe] DROP CONSTRAINT [' + @ck_name + ']'
    EXEC(@sql)
    PRINT 'Da xoa CHECK constraint cu: ' + @ck_name
END
ELSE
    PRINT 'Khong tim thay CHECK constraint trang_thai tren TamGiuGhe'
GO

-- Tạo lại CHECK constraint với đầy đủ 4 trạng thái
IF NOT EXISTS (
    SELECT 1 FROM sys.check_constraints cc
    JOIN sys.tables t ON cc.parent_object_id = t.object_id
    WHERE t.name = 'TamGiuGhe' AND cc.definition LIKE '%da_giai_phong%'
)
BEGIN
    ALTER TABLE [dbo].[TamGiuGhe]
    ADD CONSTRAINT [CK_TamGiuGhe_trang_thai]
    CHECK ([trang_thai] IN ('dang_giu', 'da_dat', 'da_giai_phong', 'het_han'))
    PRINT 'Da tao CK_TamGiuGhe_trang_thai (co da_giai_phong + het_han)'
END
ELSE
    PRINT 'CHECK constraint da co da_giai_phong, bo qua'
GO

-- ================================================================
-- FIX 3: Sửa datetime bị lệch +7h (do lưu giờ VN thay vì UTC)
--   Giải thích: Trong giai đoạn phát triển, code đã cộng thêm +7h
--   vào tất cả datetime trước khi lưu, nên cần trừ lại 7h.
--   CHỈ CHẠY NẾU THẤY GIỜ HIỂN THỊ SAI LỆCH 7H SO VỚI THỰC TẾ
-- ================================================================
-- Kiểm tra trước khi chạy (uncomment để xem):
-- SELECT TOP 5 ma_don, thoi_gian_dat FROM DonDatVe ORDER BY thoi_gian_dat DESC

-- Sửa DonDatVe (ngày đặt và ngày hết hạn)
UPDATE [dbo].[DonDatVe]
SET thoi_gian_dat     = DATEADD(HOUR, -7, thoi_gian_dat),
    thoi_gian_het_han = DATEADD(HOUR, -7, thoi_gian_het_han)
WHERE thoi_gian_dat > '2026-05-29 00:00:00'
GO

-- Sửa ThanhToan
UPDATE [dbo].[ThanhToan]
SET thoi_gian_tao          = DATEADD(HOUR, -7, thoi_gian_tao),
    thoi_gian_het_han      = CASE WHEN thoi_gian_het_han IS NOT NULL THEN DATEADD(HOUR, -7, thoi_gian_het_han) END,
    thoi_gian_thanh_toan   = CASE WHEN thoi_gian_thanh_toan IS NOT NULL THEN DATEADD(HOUR, -7, thoi_gian_thanh_toan) END
WHERE thoi_gian_tao > '2026-05-29 00:00:00'
GO

-- Sửa Ve
UPDATE [dbo].[Ve]
SET ngay_xuat_ve = DATEADD(HOUR, -7, ngay_xuat_ve)
WHERE ngay_xuat_ve > '2026-05-29 00:00:00'
GO

-- Sửa HoaDon
UPDATE [dbo].[HoaDon]
SET ngay_xuat = DATEADD(HOUR, -7, ngay_xuat)
WHERE ngay_xuat > '2026-05-29 00:00:00'
GO

PRINT '=== DB fix hoan thanh ==='
GO
