-- ============================================================
-- HOTFIX_ToaChuyen.sql — Sửa dữ liệu ToaChuyen bị thiếu toa
-- Chạy khi đã thêm toa mới qua portal nhưng các toa cũ bị mất
-- ============================================================
USE [Train]
GO

-- Bước 1: Migrate ToaChuyen từ CauHinhToa cho các chuyến
-- đang có ToaChuyen nhưng chưa đủ (thiếu toa so với template)
INSERT INTO ToaChuyen(id_chuyen, so_toa_thu_tu, id_loai_toa, so_ghe_toi_da, trang_thai)
SELECT DISTINCT
    ct.id_chuyen,
    cht.so_toa_thu_tu,
    cht.id_loai_toa,
    lt.so_cho_toi_da,
    'hoat_dong'
FROM ChuyenTau ct
JOIN LichChay lc    ON lc.id_lich_chay = ct.id_lich_chay
JOIN CauHinhToa cht ON cht.id_tau       = lc.id_tau
JOIN LoaiToa lt     ON lt.id_loai_toa   = cht.id_loai_toa
-- Chỉ cho các chuyến đã có ít nhất 1 ToaChuyen (đã dùng runtime)
WHERE EXISTS (SELECT 1 FROM ToaChuyen tc2 WHERE tc2.id_chuyen = ct.id_chuyen)
-- Nhưng chưa có toa này trong ToaChuyen
  AND NOT EXISTS (
      SELECT 1 FROM ToaChuyen tc3
      WHERE tc3.id_chuyen     = ct.id_chuyen
        AND tc3.so_toa_thu_tu = cht.so_toa_thu_tu
  )
GO

PRINT N'=== Bước 1: Migrate ToaChuyen còn thiếu DONE ==='
GO

-- Bước 2: Cập nhật sp_EnsureGheChuyen (incremental version)
-- Copy từ AMEND02.sql hoặc chạy lại AMEND02.sql
CREATE OR ALTER PROCEDURE [dbo].[sp_EnsureGheChuyen]
    @id_chuyen INT
AS
BEGIN
    SET NOCOUNT ON
    IF EXISTS (SELECT 1 FROM ToaChuyen WHERE id_chuyen = @id_chuyen)
    BEGIN
        INSERT INTO GheChuyen(id_chuyen, so_toa_thu_tu, so_ghe_trong_toa, id_loai_ghe)
        SELECT tc.id_chuyen, tc.so_toa_thu_tu, cg.so_ghe_trong_toa, cg.id_loai_ghe
        FROM ToaChuyen tc
        JOIN CauHinhGhe cg ON cg.id_loai_toa = tc.id_loai_toa
        WHERE tc.id_chuyen = @id_chuyen
          AND NOT EXISTS (
              SELECT 1 FROM GheChuyen gc
              WHERE gc.id_chuyen        = tc.id_chuyen
                AND gc.so_toa_thu_tu    = tc.so_toa_thu_tu
                AND gc.so_ghe_trong_toa = cg.so_ghe_trong_toa
          )
    END
    ELSE
    BEGIN
        INSERT INTO GheChuyen(id_chuyen, so_toa_thu_tu, so_ghe_trong_toa, id_loai_ghe)
        SELECT @id_chuyen, cht.so_toa_thu_tu, cg.so_ghe_trong_toa, cg.id_loai_ghe
        FROM ChuyenTau ct
        JOIN LichChay lc    ON lc.id_lich_chay = ct.id_lich_chay
        JOIN CauHinhToa cht ON cht.id_tau       = lc.id_tau
        JOIN CauHinhGhe cg  ON cg.id_loai_toa   = cht.id_loai_toa
        WHERE ct.id_chuyen = @id_chuyen
          AND NOT EXISTS (
              SELECT 1 FROM GheChuyen gc
              WHERE gc.id_chuyen        = @id_chuyen
                AND gc.so_toa_thu_tu    = cht.so_toa_thu_tu
                AND gc.so_ghe_trong_toa = cg.so_ghe_trong_toa
          )
    END
END
GO

PRINT N'=== Bước 2: sp_EnsureGheChuyen cập nhật DONE ==='
GO

-- Bước 3: Tạo GheChuyen cho tất cả chuyến đang thiếu
DECLARE @id INT
DECLARE cur CURSOR FOR
    SELECT DISTINCT ct.id_chuyen
    FROM ChuyenTau ct
    WHERE EXISTS (SELECT 1 FROM ToaChuyen tc WHERE tc.id_chuyen = ct.id_chuyen)

OPEN cur
FETCH NEXT FROM cur INTO @id
WHILE @@FETCH_STATUS = 0
BEGIN
    EXEC sp_EnsureGheChuyen @id
    FETCH NEXT FROM cur INTO @id
END
CLOSE cur; DEALLOCATE cur
GO

PRINT N'=== Bước 3: GheChuyen rebuild DONE ==='
GO

-- Bước 4: Đảm bảo tất cả toa trong ToaChuyen đều có GheChuyen
-- (Bổ sung incremental — không xóa gì cũ)
INSERT INTO GheChuyen(id_chuyen, so_toa_thu_tu, so_ghe_trong_toa, id_loai_ghe)
SELECT tc.id_chuyen, tc.so_toa_thu_tu, cg.so_ghe_trong_toa, cg.id_loai_ghe
FROM ToaChuyen tc
JOIN CauHinhGhe cg ON cg.id_loai_toa = tc.id_loai_toa
WHERE NOT EXISTS (
    SELECT 1 FROM GheChuyen gc
    WHERE gc.id_chuyen        = tc.id_chuyen
      AND gc.so_toa_thu_tu    = tc.so_toa_thu_tu
      AND gc.so_ghe_trong_toa = cg.so_ghe_trong_toa
)
GO

PRINT N'=== Bước 4: GheChuyen bổ sung DONE ==='
PRINT N'=== HOTFIX hoàn tất — restart backend ==='
GO
