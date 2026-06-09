-- ============================================================
-- AMEND02.sql — GheChuyen + GheChang: Segment Seat đúng
-- Chạy sau AMEND01.sql (cần offset_phut đã có)
-- ============================================================
USE [Train]
GO

-- ============================================================
-- PHẦN 1: TẠO BẢNG GheChuyen + GheChang
-- ============================================================

IF OBJECT_ID('GheChang') IS NOT NULL DROP TABLE GheChang
IF OBJECT_ID('GheChuyen') IS NOT NULL DROP TABLE GheChuyen
GO

CREATE TABLE [dbo].[GheChuyen](
    [id_ghe_chuyen]    INT IDENTITY(1,1) NOT NULL,
    [id_chuyen]        INT NOT NULL,
    [so_toa_thu_tu]    INT NOT NULL,
    [so_ghe_trong_toa] INT NOT NULL,
    [id_loai_ghe]      INT NOT NULL,
    CONSTRAINT [PK_GheChuyen] PRIMARY KEY([id_ghe_chuyen]),
    CONSTRAINT [UK_GheChuyen] UNIQUE([id_chuyen],[so_toa_thu_tu],[so_ghe_trong_toa]),
    CONSTRAINT [FK_GC_Chuyen]  FOREIGN KEY([id_chuyen])   REFERENCES [ChuyenTau]([id_chuyen]),
    CONSTRAINT [FK_GC_LoaiGhe] FOREIGN KEY([id_loai_ghe]) REFERENCES [LoaiGhe]([id_loai_ghe])
)
GO
CREATE INDEX [IX_GheChuyen_Chuyen] ON [GheChuyen]([id_chuyen],[so_toa_thu_tu])
GO

CREATE TABLE [dbo].[GheChang](
    [id_ghe_chang]      INT IDENTITY(1,1) NOT NULL,
    [id_ghe_chuyen]     INT  NOT NULL,
    [thu_tu_tu]         INT  NOT NULL,  -- stop order lên tàu (inclusive)
    [thu_tu_den]        INT  NOT NULL,  -- stop order xuống tàu (exclusive)
    [trang_thai]        VARCHAR(20) NOT NULL DEFAULT 'dang_giu',
                        -- 'dang_giu' | 'da_dat' | 'trong'
    [id_ve]             INT  NULL,
    [session_id]        VARCHAR(100) NULL,
    [thoi_gian_het_han] DATETIME NULL,  -- chỉ dùng cho 'dang_giu'
    CONSTRAINT [PK_GheChang] PRIMARY KEY([id_ghe_chang]),
    CONSTRAINT [FK_GCH_GheChuyen] FOREIGN KEY([id_ghe_chuyen]) REFERENCES [GheChuyen]([id_ghe_chuyen]),
    CONSTRAINT [FK_GCH_Ve]        FOREIGN KEY([id_ve])          REFERENCES [Ve]([id_ve]),
    CONSTRAINT [CK_GCH_TrangThai] CHECK([trang_thai] IN ('dang_giu','da_dat','trong')),
    CONSTRAINT [CK_GCH_Thu_tu]    CHECK([thu_tu_tu] < [thu_tu_den])
)
GO
CREATE INDEX [IX_GheChang_Lookup] ON [GheChang]([id_ghe_chuyen],[trang_thai],[thu_tu_tu],[thu_tu_den])
GO
CREATE INDEX [IX_GheChang_Session] ON [GheChang]([session_id]) WHERE [session_id] IS NOT NULL
GO

PRINT N'=== Phần 1: Tạo bảng DONE ==='
GO

-- ============================================================
-- PHẦN 2: NẠP DỮ LIỆU GheChuyen
-- Mỗi (chuyến, toa, ghế) có 1 bản ghi
-- Ưu tiên ToaChuyen runtime; fallback CauHinhToa template
-- ============================================================

-- 2a. Từ ToaChuyen (runtime - các chuyến đã có cấu hình riêng)
INSERT INTO GheChuyen(id_chuyen, so_toa_thu_tu, so_ghe_trong_toa, id_loai_ghe)
SELECT tc.id_chuyen, tc.so_toa_thu_tu, cg.so_ghe_trong_toa, cg.id_loai_ghe
FROM ToaChuyen tc
JOIN CauHinhGhe cg ON cg.id_loai_toa = tc.id_loai_toa
WHERE NOT EXISTS (
    SELECT 1 FROM GheChuyen g
    WHERE g.id_chuyen = tc.id_chuyen
      AND g.so_toa_thu_tu = tc.so_toa_thu_tu
      AND g.so_ghe_trong_toa = cg.so_ghe_trong_toa
)
GO

-- 2b. Từ CauHinhToa template (tất cả chuyến còn lại)
INSERT INTO GheChuyen(id_chuyen, so_toa_thu_tu, so_ghe_trong_toa, id_loai_ghe)
SELECT ct.id_chuyen, cht.so_toa_thu_tu, cg.so_ghe_trong_toa, cg.id_loai_ghe
FROM ChuyenTau ct
JOIN LichChay lc  ON lc.id_lich_chay = ct.id_lich_chay
JOIN CauHinhToa cht ON cht.id_tau    = lc.id_tau
JOIN CauHinhGhe cg  ON cg.id_loai_toa = cht.id_loai_toa
WHERE NOT EXISTS (
    SELECT 1 FROM GheChuyen g
    WHERE g.id_chuyen      = ct.id_chuyen
      AND g.so_toa_thu_tu  = cht.so_toa_thu_tu
      AND g.so_ghe_trong_toa = cg.so_ghe_trong_toa
)
GO

PRINT N'=== Phần 2: GheChuyen DONE (' + CAST(@@ROWCOUNT AS VARCHAR) + ' rows) ==='
GO

-- ============================================================
-- PHẦN 3: NẠP DỮ LIỆU GheChang từ Ve hiện có
-- ============================================================
INSERT INTO GheChang(id_ghe_chuyen, thu_tu_tu, thu_tu_den, trang_thai, id_ve)
SELECT
    gc.id_ghe_chuyen,
    ltc_len.thu_tu_dung AS thu_tu_tu,
    ltc_xuo.thu_tu_dung AS thu_tu_den,
    CASE v.trang_thai
        WHEN 'da_xac_nhan'  THEN 'da_dat'
        WHEN 'cho_xac_nhan' THEN 'da_dat'
        ELSE 'trong'
    END AS trang_thai,
    v.id_ve
FROM Ve v
JOIN GheChuyen gc ON gc.id_chuyen = v.id_chuyen
    AND gc.so_toa_thu_tu = v.so_toa_thu_tu
    AND gc.so_ghe_trong_toa = v.so_ghe_trong_toa
JOIN ChuyenTau ct ON ct.id_chuyen = v.id_chuyen
JOIN LichChay lc  ON lc.id_lich_chay = ct.id_lich_chay
JOIN LichTrinhChuyen ltc_len ON ltc_len.id_lich_chay = lc.id_lich_chay
    AND ltc_len.id_ga = v.id_ga_len
JOIN LichTrinhChuyen ltc_xuo ON ltc_xuo.id_lich_chay = lc.id_lich_chay
    AND ltc_xuo.id_ga = v.id_ga_xuong
WHERE v.trang_thai NOT IN ('da_huy', 'da_doi')
  AND ltc_len.thu_tu_dung < ltc_xuo.thu_tu_dung
GO

PRINT N'=== Phần 3: GheChang DONE ==='
GO

-- ============================================================
-- PHẦN 4: XÓA UK_Ve_Active (nếu còn, chạy AMEND01 trước)
-- ============================================================
IF EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID('Ve') AND name='UK_Ve_Active')
    DROP INDEX [UK_Ve_Active] ON [Ve]
GO

-- ============================================================
-- PHẦN 5: Stored Procedure sp_EnsureGheChuyen
-- Tạo GheChuyen on-demand cho chuyến mới (chưa có bản ghi)
-- ============================================================
-- sp_EnsureGheChuyen: tạo GheChuyen INCREMENTAL (không xóa cũ, chỉ thêm thiếu)
-- Không dùng RETURN sớm — để sau khi thêm/migrate ToaChuyen vẫn tạo đủ GheChuyen
CREATE OR ALTER PROCEDURE [dbo].[sp_EnsureGheChuyen]
    @id_chuyen INT
AS
BEGIN
    SET NOCOUNT ON

    -- Ưu tiên ToaChuyen (runtime) nếu có, nếu không dùng CauHinhToa (template)
    IF EXISTS (SELECT 1 FROM ToaChuyen WHERE id_chuyen = @id_chuyen)
    BEGIN
        -- Chỉ insert những ghế CHƯA có trong GheChuyen (incremental)
        INSERT INTO GheChuyen(id_chuyen, so_toa_thu_tu, so_ghe_trong_toa, id_loai_ghe)
        SELECT tc.id_chuyen, tc.so_toa_thu_tu, cg.so_ghe_trong_toa, cg.id_loai_ghe
        FROM ToaChuyen tc
        JOIN CauHinhGhe cg ON cg.id_loai_toa = tc.id_loai_toa
        WHERE tc.id_chuyen = @id_chuyen
          AND NOT EXISTS (
              SELECT 1 FROM GheChuyen gc
              WHERE gc.id_chuyen      = tc.id_chuyen
                AND gc.so_toa_thu_tu  = tc.so_toa_thu_tu
                AND gc.so_ghe_trong_toa = cg.so_ghe_trong_toa
          )
    END
    ELSE
    BEGIN
        -- Fallback từ CauHinhToa template
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

PRINT N'=== AMEND02.sql DONE — restart backend sau khi chạy ==='
GO
