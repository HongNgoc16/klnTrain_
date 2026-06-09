-- ============================================================
-- AMEND05: Trigger + SP quản lý ToaChuyen tự động
-- Chạy trên database KLN_Train
-- ============================================================

USE KLN_Train;
GO

-- ============================================================
-- TRIGGER: tự động tạo ToaChuyen ngay khi ChuyenTau được INSERT
-- (sp_DP_SinhChuyen tạo ChuyenTau → trigger chạy → ToaChuyen được populate)
-- ============================================================
CREATE OR ALTER TRIGGER trg_ChuyenTau_AutoToaChuyen
ON ChuyenTau
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO ToaChuyen (id_chuyen, so_toa_thu_tu, id_loai_toa, so_ghe_toi_da, trang_thai)
    SELECT
        i.id_chuyen,
        cht.so_toa_thu_tu,
        cht.id_loai_toa,
        lt.so_cho_toi_da,
        'hoat_dong'
    FROM INSERTED i
    JOIN  LichChay   lc  ON  lc.id_lich_chay = i.id_lich_chay
    JOIN  CauHinhToa cht ON  cht.id_tau       = lc.id_tau
    LEFT JOIN LoaiToa lt ON  lt.id_loai_toa   = cht.id_loai_toa
    WHERE NOT EXISTS (
        SELECT 1 FROM ToaChuyen tc2
        WHERE tc2.id_chuyen    = i.id_chuyen
          AND tc2.so_toa_thu_tu = cht.so_toa_thu_tu
    );
END;
GO

-- ============================================================
-- SP: đảm bảo ToaChuyen tồn tại cho một chuyến (idempotent)
-- Gọi từ controller trước khi đọc/ghi ToaChuyen.
-- Chỉ INSERT những toa còn thiếu, không chạm toa đã được dispatcher chỉnh sửa.
-- ============================================================
CREATE OR ALTER PROCEDURE sp_DP_EnsureToaChuyen
    @id_chuyen INT
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO ToaChuyen (id_chuyen, so_toa_thu_tu, id_loai_toa, so_ghe_toi_da, trang_thai)
    SELECT
        @id_chuyen,
        cht.so_toa_thu_tu,
        cht.id_loai_toa,
        lt.so_cho_toi_da,
        'hoat_dong'
    FROM ChuyenTau ct
    JOIN  LichChay   lc  ON  lc.id_lich_chay = ct.id_lich_chay
    JOIN  CauHinhToa cht ON  cht.id_tau       = lc.id_tau
    LEFT JOIN LoaiToa lt  ON  lt.id_loai_toa  = cht.id_loai_toa
    WHERE ct.id_chuyen = @id_chuyen
      AND NOT EXISTS (
          SELECT 1 FROM ToaChuyen tc2
          WHERE tc2.id_chuyen    = @id_chuyen
            AND tc2.so_toa_thu_tu = cht.so_toa_thu_tu
      );

    -- Trả về danh sách toa sau khi ensure (kể cả toa đã có từ trước)
    SELECT
        tc.id_toa_chuyen,
        tc.so_toa_thu_tu,
        tc.id_loai_toa,
        tc.so_ghe_toi_da,
        tc.trang_thai,
        lt.ten_loai_toa,
        lt.so_cho_toi_da AS loai_so_cho_toi_da
    FROM ToaChuyen tc
    LEFT JOIN LoaiToa lt ON lt.id_loai_toa = tc.id_loai_toa
    WHERE tc.id_chuyen = @id_chuyen
    ORDER BY tc.so_toa_thu_tu;
END;
GO

-- Backfill: đảm bảo mọi chuyến tàu hiện có đều có ToaChuyen
-- (chạy một lần cho các chuyến được tạo trước khi có trigger)
INSERT INTO ToaChuyen (id_chuyen, so_toa_thu_tu, id_loai_toa, so_ghe_toi_da, trang_thai)
SELECT
    ct.id_chuyen,
    cht.so_toa_thu_tu,
    cht.id_loai_toa,
    lt.so_cho_toi_da,
    'hoat_dong'
FROM ChuyenTau ct
JOIN  LichChay   lc  ON  lc.id_lich_chay = ct.id_lich_chay
JOIN  CauHinhToa cht ON  cht.id_tau       = lc.id_tau
LEFT JOIN LoaiToa lt  ON  lt.id_loai_toa  = cht.id_loai_toa
WHERE NOT EXISTS (
    SELECT 1 FROM ToaChuyen tc2
    WHERE tc2.id_chuyen    = ct.id_chuyen
      AND tc2.so_toa_thu_tu = cht.so_toa_thu_tu
);
GO

PRINT 'AMEND05 applied: trigger trg_ChuyenTau_AutoToaChuyen + sp_DP_EnsureToaChuyen + backfill';
GO
