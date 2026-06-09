-- ============================================================
-- FIX_SoDoGheToa.sql — Fix toàn diện vấn đề sơ đồ ghế toa mới
-- Giải quyết tất cả trường hợp có thể gây lỗi:
--   1. CauHinhGhe rỗng cho LoaiToa
--   2. GheChuyen thiếu cho toa mới
--   3. ToaChuyen thiếu toa gốc
-- ============================================================
USE [Train]
GO

-- ============================================================
-- PHẦN 1: Kiểm tra và sửa CauHinhGhe rỗng
-- Nếu CauHinhGhe không có data cho một LoaiToa → copy từ loại tương tự
-- ============================================================

-- Xem tình trạng trước khi fix
PRINT N'CauHinhGhe trước khi fix:'
SELECT lt.id_loai_toa, lt.ten_loai_toa, COUNT(cg.id_cau_hinh_ghe) AS so_ghe
FROM LoaiToa lt LEFT JOIN CauHinhGhe cg ON cg.id_loai_toa = lt.id_loai_toa
GROUP BY lt.id_loai_toa, lt.ten_loai_toa
ORDER BY lt.id_loai_toa
GO

-- Nếu CauHinhGhe rỗng cho GN4 (loai_ghe_chinh = 'GN4') → tạo 28 ghế
-- Quy ước: GN4 có 7 khoang × 4 ghế (A/B tầng 1 và 2) = 28 ghế
IF NOT EXISTS (SELECT 1 FROM CauHinhGhe cg JOIN LoaiToa lt ON lt.id_loai_toa=cg.id_loai_toa WHERE lt.loai_ghe_chinh='GN4')
BEGIN
    PRINT N'Tạo CauHinhGhe cho GN4...'
    DECLARE @gn4_id INT = (SELECT TOP 1 id_loai_toa FROM LoaiToa WHERE loai_ghe_chinh='GN4' ORDER BY id_loai_toa)
    DECLARE @lg_gn4_tren INT = (SELECT TOP 1 id_loai_ghe FROM LoaiGhe WHERE ma_loai_ghe LIKE '%T_GN4%' OR ten_loai_ghe LIKE '%Tầng trên%Khoang 4%' ORDER BY id_loai_ghe)
    DECLARE @lg_gn4_duoi INT = (SELECT TOP 1 id_loai_ghe FROM LoaiGhe WHERE ma_loai_ghe LIKE '%D_GN4%' OR ten_loai_ghe LIKE '%Tầng dưới%Khoang 4%' ORDER BY id_loai_ghe)

    -- Fallback: lấy bất kỳ LoaiGhe nào thuộc LoaiToa GN4
    IF @lg_gn4_tren IS NULL SELECT @lg_gn4_tren = MIN(id_loai_ghe) FROM LoaiGhe WHERE id_loai_toa = @gn4_id
    IF @lg_gn4_duoi IS NULL SELECT @lg_gn4_duoi = MIN(id_loai_ghe) FROM LoaiGhe WHERE id_loai_toa = @gn4_id

    IF @gn4_id IS NOT NULL AND @lg_gn4_tren IS NOT NULL
    BEGIN
        DECLARE @k INT=1, @g INT=1
        WHILE @k <= 7  -- 7 khoang
        BEGIN
            -- Tầng 2 (Tren): ghế A và B
            INSERT INTO CauHinhGhe(id_loai_toa,so_ghe_trong_toa,id_loai_ghe,vi_tri,tang,khoang_so,ben)
            VALUES(@gn4_id,@g,ISNULL(@lg_gn4_tren,@lg_gn4_duoi),'ghe','Tren',@k,'A')
            SET @g=@g+1
            INSERT INTO CauHinhGhe(id_loai_toa,so_ghe_trong_toa,id_loai_ghe,vi_tri,tang,khoang_so,ben)
            VALUES(@gn4_id,@g,ISNULL(@lg_gn4_tren,@lg_gn4_duoi),'ghe','Tren',@k,'B')
            SET @g=@g+1
            -- Tầng 1 (Duoi): ghế A và B
            INSERT INTO CauHinhGhe(id_loai_toa,so_ghe_trong_toa,id_loai_ghe,vi_tri,tang,khoang_so,ben)
            VALUES(@gn4_id,@g,@lg_gn4_duoi,'ghe','Duoi',@k,'A')
            SET @g=@g+1
            INSERT INTO CauHinhGhe(id_loai_toa,so_ghe_trong_toa,id_loai_ghe,vi_tri,tang,khoang_so,ben)
            VALUES(@gn4_id,@g,@lg_gn4_duoi,'ghe','Duoi',@k,'B')
            SET @g=@g+1
            SET @k=@k+1
        END
        PRINT N'Đã tạo ' + CAST(@@ROWCOUNT AS VARCHAR) + N' ghế cho GN4'
    END
END
GO

-- Nếu CauHinhGhe rỗng cho GN6 → tạo 42 ghế (7 khoang × 6 ghế)
IF NOT EXISTS (SELECT 1 FROM CauHinhGhe cg JOIN LoaiToa lt ON lt.id_loai_toa=cg.id_loai_toa WHERE lt.loai_ghe_chinh='GN6')
BEGIN
    PRINT N'Tạo CauHinhGhe cho GN6...'
    DECLARE @gn6_id INT = (SELECT TOP 1 id_loai_toa FROM LoaiToa WHERE loai_ghe_chinh='GN6' ORDER BY id_loai_toa)
    DECLARE @lg_gn6 INT = (SELECT TOP 1 id_loai_ghe FROM LoaiGhe WHERE id_loai_toa=@gn6_id ORDER BY id_loai_ghe)

    IF @gn6_id IS NOT NULL AND @lg_gn6 IS NOT NULL
    BEGIN
        DECLARE @k6 INT=1, @g6 INT=1
        WHILE @k6 <= 7
        BEGIN
            DECLARE @tang6 NVARCHAR(10), @b6 NVARCHAR(5)
            -- Tầng 3: A, B | Tầng 2: A, B | Tầng 1: A, B
            DECLARE @t6 INT=1
            WHILE @t6 <= 3
            BEGIN
                SET @tang6 = CASE @t6 WHEN 3 THEN 'Tren' WHEN 2 THEN 'Giua' ELSE 'Duoi' END
                INSERT INTO CauHinhGhe(id_loai_toa,so_ghe_trong_toa,id_loai_ghe,vi_tri,tang,khoang_so,ben)
                VALUES(@gn6_id,@g6,@lg_gn6,'giuong',@tang6,@k6,'A')
                SET @g6=@g6+1
                INSERT INTO CauHinhGhe(id_loai_toa,so_ghe_trong_toa,id_loai_ghe,vi_tri,tang,khoang_so,ben)
                VALUES(@gn6_id,@g6,@lg_gn6,'giuong',@tang6,@k6,'B')
                SET @g6=@g6+1
                SET @t6=@t6+1
            END
            SET @k6=@k6+1
        END
        PRINT N'Đã tạo CauHinhGhe cho GN6'
    END
END
GO

-- ============================================================
-- PHẦN 2: Đảm bảo ToaChuyen đầy đủ cho tất cả chuyến có toa mới
-- ============================================================
PRINT N'=== Phần 2: Migrate ToaChuyen từ CauHinhToa ==='

INSERT INTO ToaChuyen(id_chuyen, so_toa_thu_tu, id_loai_toa, so_ghe_toi_da, trang_thai)
SELECT DISTINCT
    ct.id_chuyen, cht.so_toa_thu_tu, cht.id_loai_toa,
    lt.so_cho_toi_da, 'hoat_dong'
FROM ChuyenTau ct
JOIN LichChay lc    ON lc.id_lich_chay = ct.id_lich_chay
JOIN CauHinhToa cht ON cht.id_tau = lc.id_tau
JOIN LoaiToa lt     ON lt.id_loai_toa = cht.id_loai_toa
-- Chỉ cho chuyến đang có ít nhất 1 ToaChuyen (đã dùng runtime)
WHERE EXISTS (SELECT 1 FROM ToaChuyen tc2 WHERE tc2.id_chuyen = ct.id_chuyen)
-- Nhưng toa gốc này chưa có trong ToaChuyen
  AND NOT EXISTS (
      SELECT 1 FROM ToaChuyen tc3
      WHERE tc3.id_chuyen = ct.id_chuyen AND tc3.so_toa_thu_tu = cht.so_toa_thu_tu
  )

PRINT N'Đã migrate ' + CAST(@@ROWCOUNT AS VARCHAR) + N' ToaChuyen còn thiếu'
GO

-- ============================================================
-- PHẦN 3: Tạo đầy đủ GheChuyen cho TẤT CẢ ToaChuyen
-- ============================================================
PRINT N'=== Phần 3: Rebuild GheChuyen incremental ==='

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

PRINT N'Đã tạo ' + CAST(@@ROWCOUNT AS VARCHAR) + N' GheChuyen còn thiếu'
GO

-- ============================================================
-- PHẦN 4: Cập nhật sp_EnsureGheChuyen (incremental, không RETURN sớm)
-- ============================================================
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
        JOIN CauHinhToa cht ON cht.id_tau = lc.id_tau
        JOIN CauHinhGhe cg  ON cg.id_loai_toa = cht.id_loai_toa
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

-- ============================================================
-- PHẦN 5: Verification sau fix
-- ============================================================
PRINT N'=== Kết quả sau khi fix ==='

SELECT
    ct.id_chuyen,
    tau.so_hieu,
    ct.ngay_chay,
    tc.so_toa_thu_tu AS toa,
    lt.ten_loai_toa,
    (SELECT COUNT(*) FROM CauHinhGhe cg WHERE cg.id_loai_toa=tc.id_loai_toa) AS cau_hinh_ghe,
    (SELECT COUNT(*) FROM GheChuyen gc WHERE gc.id_chuyen=ct.id_chuyen AND gc.so_toa_thu_tu=tc.so_toa_thu_tu) AS ghe_chuyen,
    CASE
        WHEN (SELECT COUNT(*) FROM CauHinhGhe cg WHERE cg.id_loai_toa=tc.id_loai_toa) = 0 THEN N'❌ CauHinhGhe RỖNG'
        WHEN (SELECT COUNT(*) FROM GheChuyen gc WHERE gc.id_chuyen=ct.id_chuyen AND gc.so_toa_thu_tu=tc.so_toa_thu_tu) = 0 THEN N'⚠️ GheChuyen RỖNG'
        ELSE N'✅ OK'
    END AS trang_thai_fix
FROM ToaChuyen tc
JOIN ChuyenTau ct ON ct.id_chuyen = tc.id_chuyen
JOIN LichChay lc  ON lc.id_lich_chay = ct.id_lich_chay
JOIN Tau tau      ON tau.id_tau = lc.id_tau
JOIN LoaiToa lt   ON lt.id_loai_toa = tc.id_loai_toa
WHERE tau.so_hieu = 'SE5' AND ct.ngay_chay = '2026-06-05'
ORDER BY tc.so_toa_thu_tu

PRINT N'=== FIX_SoDoGheToa.sql HOÀN THÀNH ==='
GO
