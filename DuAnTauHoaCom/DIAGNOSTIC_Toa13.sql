-- ============================================================
-- DIAGNOSTIC_Toa13.sql — Chẩn đoán vấn đề sơ đồ ghế toa 13
-- Chạy từng SELECT để xem dữ liệu hiện tại
-- ============================================================
USE [Train]
GO

PRINT N'=== BƯỚC 1: Kiểm tra ToaChuyen của SE5 ngày 5/6/2026 ==='

SELECT
    ct.id_chuyen,
    ct.ngay_chay,
    tau.so_hieu AS ma_tau,
    tc.so_toa_thu_tu,
    tc.id_loai_toa,
    lt.ten_loai_toa,
    lt.so_cho_toi_da,
    tc.trang_thai,
    (SELECT COUNT(*) FROM CauHinhGhe cg WHERE cg.id_loai_toa = tc.id_loai_toa) AS so_ghe_cau_hinh,
    (SELECT COUNT(*) FROM GheChuyen gc
     WHERE gc.id_chuyen = ct.id_chuyen AND gc.so_toa_thu_tu = tc.so_toa_thu_tu) AS so_ghe_chuyen
FROM ChuyenTau ct
JOIN LichChay lc  ON lc.id_lich_chay = ct.id_lich_chay
JOIN Tau tau      ON tau.id_tau = lc.id_tau
JOIN ToaChuyen tc ON tc.id_chuyen = ct.id_chuyen
JOIN LoaiToa lt   ON lt.id_loai_toa = tc.id_loai_toa
WHERE tau.so_hieu = 'SE5' AND ct.ngay_chay = '2026-06-05'
ORDER BY tc.so_toa_thu_tu
GO

PRINT N'=== BƯỚC 2: Kiểm tra CauHinhGhe có dữ liệu không ==='

SELECT
    lt.id_loai_toa,
    lt.ten_loai_toa,
    lt.ma_loai_toa,
    COUNT(cg.id_cau_hinh_ghe) AS so_ghe_trong_cau_hinh
FROM LoaiToa lt
LEFT JOIN CauHinhGhe cg ON cg.id_loai_toa = lt.id_loai_toa
GROUP BY lt.id_loai_toa, lt.ten_loai_toa, lt.ma_loai_toa
ORDER BY lt.id_loai_toa
GO

PRINT N'=== BƯỚC 3: Kiểm tra GheChuyen của toa 13 ==='

SELECT TOP 5 gc.*
FROM GheChuyen gc
JOIN ChuyenTau ct ON ct.id_chuyen = gc.id_chuyen
JOIN LichChay lc  ON lc.id_lich_chay = ct.id_lich_chay
JOIN Tau tau      ON tau.id_tau = lc.id_tau
WHERE tau.so_hieu = 'SE5' AND ct.ngay_chay = '2026-06-05'
  AND gc.so_toa_thu_tu = 13
GO

PRINT N'=== BƯỚC 4: Kiểm tra CauHinhToa của SE5 (template gốc) ==='

SELECT cht.so_toa_thu_tu, lt.ten_loai_toa, lt.so_cho_toi_da,
       (SELECT COUNT(*) FROM CauHinhGhe cg WHERE cg.id_loai_toa = cht.id_loai_toa) AS so_ghe
FROM CauHinhToa cht
JOIN Tau t  ON t.id_tau = cht.id_tau
JOIN LoaiToa lt ON lt.id_loai_toa = cht.id_loai_toa
WHERE t.so_hieu = 'SE5'
ORDER BY cht.so_toa_thu_tu
GO

PRINT N'=== BƯỚC 5: Tìm id_chuyen của SE5 ngày 5/6 ==='

SELECT ct.id_chuyen, ct.ngay_chay, tau.so_hieu
FROM ChuyenTau ct
JOIN LichChay lc ON lc.id_lich_chay = ct.id_lich_chay
JOIN Tau tau     ON tau.id_tau = lc.id_tau
WHERE tau.so_hieu = 'SE5' AND ct.ngay_chay = '2026-06-05'
GO
