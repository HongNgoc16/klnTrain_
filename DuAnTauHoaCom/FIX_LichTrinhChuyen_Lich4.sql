-- ============================================================
-- FIX_LichTrinhChuyen_Lich4.sql
-- Thêm LichTrinhChuyen cho LichChay id=4 (SE3 19:20 HN→SG)
--
-- Nguyên nhân: searchChuyen dùng INNER JOIN LichTrinhChuyen,
-- lich=4 không có data nên SE3 không xuất hiện trong kết quả tìm kiếm.
--
-- Giải pháp: Copy điểm dừng từ lich=1 (SE7 cùng tuyến HN→SG),
-- chỉ offset giờ +800 phút (19:20 - 06:00 = 13h20m = 800 phút).
-- offset_phut (phút từ lúc xuất phát) giữ nguyên vì cùng tuyến đường.
-- ============================================================
USE [Train]
GO

PRINT N'=== Kiểm tra LichChay id=4 ==='
SELECT id_lich_chay, id_tau, id_ga_di, id_ga_den, gio_khoi_hanh FROM LichChay WHERE id_lich_chay = 4
GO

PRINT N'=== Kiểm tra LichTrinhChuyen của lich=4 trước khi thêm ==='
SELECT COUNT(*) AS so_diem_dung FROM LichTrinhChuyen WHERE id_lich_chay = 4
GO

-- ── Thêm LichTrinhChuyen cho lich=4 bằng cách copy từ lich=1
-- với offset giờ +800 phút (từ 06:00 → 19:20)
INSERT INTO LichTrinhChuyen(
    id_lich_chay, id_ga, thu_tu_dung,
    gio_den, gio_di,
    khoang_cach_km, thoi_gian_dung, offset_phut
)
SELECT
    4 AS id_lich_chay,
    id_ga,
    thu_tu_dung,
    -- Cộng thêm 800 phút (13h20m) vào giờ của lich=1 rồi lấy phần TIME (tự wrap midnight)
    CAST(DATEADD(MINUTE, 800, CAST(CONVERT(CHAR(8), gio_den, 108) AS DATETIME)) AS TIME(0)) AS gio_den,
    CAST(DATEADD(MINUTE, 800, CAST(CONVERT(CHAR(8), gio_di,  108) AS DATETIME)) AS TIME(0)) AS gio_di,
    khoang_cach_km,
    thoi_gian_dung,
    offset_phut     -- Giữ nguyên: là phút từ xuất phát, không phụ thuộc giờ tuyệt đối
FROM LichTrinhChuyen
WHERE id_lich_chay = 1   -- Copy từ SE7 (cùng tuyến HN→SG)
  AND NOT EXISTS (        -- Chỉ insert nếu chưa có
      SELECT 1 FROM LichTrinhChuyen ltc2
      WHERE ltc2.id_lich_chay = 4 AND ltc2.id_ga = LichTrinhChuyen.id_ga
  )
GO

PRINT N'=== Kết quả sau khi thêm ==='
SELECT COUNT(*) AS so_diem_dung FROM LichTrinhChuyen WHERE id_lich_chay = 4
GO

PRINT N'=== Kiểm tra 5 điểm đầu của lich=4 ==='
SELECT TOP 5 id_lich_trinh, id_ga,
       (SELECT ten_ga FROM GaTau WHERE id_ga = ltc.id_ga) AS ten_ga,
       thu_tu_dung, gio_den, gio_di, khoang_cach_km, offset_phut
FROM LichTrinhChuyen ltc
WHERE id_lich_chay = 4
ORDER BY thu_tu_dung
GO

PRINT N'=== Test: Tìm lich chạy HN→SG sau khi thêm (phải có lich=4) ==='
SELECT lc.id_lich_chay, tau.so_hieu, lc.gio_khoi_hanh
FROM LichChay lc
JOIN Tau tau ON tau.id_tau = lc.id_tau
JOIN LichTrinhChuyen ltc_di  ON ltc_di.id_lich_chay  = lc.id_lich_chay AND ltc_di.id_ga  = 1   -- HN
JOIN LichTrinhChuyen ltc_den ON ltc_den.id_lich_chay = lc.id_lich_chay AND ltc_den.id_ga = 81  -- SG
WHERE ltc_di.thu_tu_dung < ltc_den.thu_tu_dung
ORDER BY lc.gio_khoi_hanh
GO

PRINT N'=== FIX HOÀN TẤT — restart backend để áp dụng ==='
GO
