-- ============================================================
-- AMEND01.sql — Segment Seat + Offset Time + Runtime ToaChuyen + Auto-Status
-- Chạy file này trong SSMS sau khi đã restore CSDLHC.sql
-- ============================================================
USE [Train]
GO

-- ============================================================
-- PHẦN 1: OFFSET TIME — thêm phút tích lũy vào LichTrinhChuyen
-- offset_phut = số phút kể từ khi tàu xuất phát tại ga đầu tiên
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id=OBJECT_ID('LichTrinhChuyen') AND name='offset_phut')
    ALTER TABLE LichTrinhChuyen ADD offset_phut INT NULL
GO

-- Schedule 1 (SE7: HN→SG, xuất phát 06:00 = 360 phút từ 0h)
UPDATE LichTrinhChuyen SET offset_phut=0    WHERE id_lich_trinh=1
UPDATE LichTrinhChuyen SET offset_phut=64   WHERE id_lich_trinh=2
UPDATE LichTrinhChuyen SET offset_phut=100  WHERE id_lich_trinh=3
UPDATE LichTrinhChuyen SET offset_phut=136  WHERE id_lich_trinh=4
UPDATE LichTrinhChuyen SET offset_phut=202  WHERE id_lich_trinh=5
UPDATE LichTrinhChuyen SET offset_phut=228  WHERE id_lich_trinh=6
UPDATE LichTrinhChuyen SET offset_phut=313  WHERE id_lich_trinh=7
UPDATE LichTrinhChuyen SET offset_phut=359  WHERE id_lich_trinh=8
UPDATE LichTrinhChuyen SET offset_phut=395  WHERE id_lich_trinh=9
UPDATE LichTrinhChuyen SET offset_phut=454  WHERE id_lich_trinh=10
UPDATE LichTrinhChuyen SET offset_phut=519  WHERE id_lich_trinh=11
UPDATE LichTrinhChuyen SET offset_phut=627  WHERE id_lich_trinh=12
UPDATE LichTrinhChuyen SET offset_phut=662  WHERE id_lich_trinh=13
UPDATE LichTrinhChuyen SET offset_phut=745  WHERE id_lich_trinh=14
UPDATE LichTrinhChuyen SET offset_phut=823  WHERE id_lich_trinh=15
UPDATE LichTrinhChuyen SET offset_phut=990  WHERE id_lich_trinh=16
UPDATE LichTrinhChuyen SET offset_phut=1156 WHERE id_lich_trinh=17
UPDATE LichTrinhChuyen SET offset_phut=1332 WHERE id_lich_trinh=18
UPDATE LichTrinhChuyen SET offset_phut=1474 WHERE id_lich_trinh=19
UPDATE LichTrinhChuyen SET offset_phut=1563 WHERE id_lich_trinh=20
UPDATE LichTrinhChuyen SET offset_phut=1607 WHERE id_lich_trinh=21
UPDATE LichTrinhChuyen SET offset_phut=1705 WHERE id_lich_trinh=22
UPDATE LichTrinhChuyen SET offset_phut=1860 WHERE id_lich_trinh=23
UPDATE LichTrinhChuyen SET offset_phut=1935 WHERE id_lich_trinh=24
UPDATE LichTrinhChuyen SET offset_phut=1987 WHERE id_lich_trinh=25
UPDATE LichTrinhChuyen SET offset_phut=2052 WHERE id_lich_trinh=26
UPDATE LichTrinhChuyen SET offset_phut=2069 WHERE id_lich_trinh=27
UPDATE LichTrinhChuyen SET offset_phut=2100 WHERE id_lich_trinh=28
GO

-- Schedule 2 (SE3: HN→SG, xuất phát 08:00 = 480 phút)
UPDATE LichTrinhChuyen SET offset_phut=0    WHERE id_lich_trinh=29
UPDATE LichTrinhChuyen SET offset_phut=64   WHERE id_lich_trinh=30
UPDATE LichTrinhChuyen SET offset_phut=100  WHERE id_lich_trinh=31
UPDATE LichTrinhChuyen SET offset_phut=136  WHERE id_lich_trinh=32
UPDATE LichTrinhChuyen SET offset_phut=170  WHERE id_lich_trinh=33
UPDATE LichTrinhChuyen SET offset_phut=207  WHERE id_lich_trinh=34
UPDATE LichTrinhChuyen SET offset_phut=349  WHERE id_lich_trinh=35
UPDATE LichTrinhChuyen SET offset_phut=374  WHERE id_lich_trinh=36
UPDATE LichTrinhChuyen SET offset_phut=432  WHERE id_lich_trinh=37
UPDATE LichTrinhChuyen SET offset_phut=496  WHERE id_lich_trinh=38
UPDATE LichTrinhChuyen SET offset_phut=554  WHERE id_lich_trinh=39
UPDATE LichTrinhChuyen SET offset_phut=611  WHERE id_lich_trinh=40
UPDATE LichTrinhChuyen SET offset_phut=726  WHERE id_lich_trinh=41
UPDATE LichTrinhChuyen SET offset_phut=820  WHERE id_lich_trinh=42
UPDATE LichTrinhChuyen SET offset_phut=996  WHERE id_lich_trinh=43
UPDATE LichTrinhChuyen SET offset_phut=1150 WHERE id_lich_trinh=44
UPDATE LichTrinhChuyen SET offset_phut=1322 WHERE id_lich_trinh=45
UPDATE LichTrinhChuyen SET offset_phut=1399 WHERE id_lich_trinh=46
UPDATE LichTrinhChuyen SET offset_phut=1452 WHERE id_lich_trinh=47
UPDATE LichTrinhChuyen SET offset_phut=1516 WHERE id_lich_trinh=48
UPDATE LichTrinhChuyen SET offset_phut=1585 WHERE id_lich_trinh=49
UPDATE LichTrinhChuyen SET offset_phut=1688 WHERE id_lich_trinh=50
UPDATE LichTrinhChuyen SET offset_phut=1828 WHERE id_lich_trinh=51
UPDATE LichTrinhChuyen SET offset_phut=1935 WHERE id_lich_trinh=52
UPDATE LichTrinhChuyen SET offset_phut=2000 WHERE id_lich_trinh=53
UPDATE LichTrinhChuyen SET offset_phut=2017 WHERE id_lich_trinh=54
UPDATE LichTrinhChuyen SET offset_phut=2060 WHERE id_lich_trinh=55
GO

-- Schedule 6 (SE8: SG→HN, xuất phát 06:00 = 360 phút)
UPDATE LichTrinhChuyen SET offset_phut=0    WHERE id_lich_trinh=126
UPDATE LichTrinhChuyen SET offset_phut=31   WHERE id_lich_trinh=127
UPDATE LichTrinhChuyen SET offset_phut=47   WHERE id_lich_trinh=128
UPDATE LichTrinhChuyen SET offset_phut=109  WHERE id_lich_trinh=129
UPDATE LichTrinhChuyen SET offset_phut=160  WHERE id_lich_trinh=130
UPDATE LichTrinhChuyen SET offset_phut=222  WHERE id_lich_trinh=131
UPDATE LichTrinhChuyen SET offset_phut=370  WHERE id_lich_trinh=132
UPDATE LichTrinhChuyen SET offset_phut=483  WHERE id_lich_trinh=133
UPDATE LichTrinhChuyen SET offset_phut=610  WHERE id_lich_trinh=134
UPDATE LichTrinhChuyen SET offset_phut=727  WHERE id_lich_trinh=135
UPDATE LichTrinhChuyen SET offset_phut=901  WHERE id_lich_trinh=136
UPDATE LichTrinhChuyen SET offset_phut=1061 WHERE id_lich_trinh=137
UPDATE LichTrinhChuyen SET offset_phut=1217 WHERE id_lich_trinh=138
UPDATE LichTrinhChuyen SET offset_phut=1291 WHERE id_lich_trinh=139
UPDATE LichTrinhChuyen SET offset_phut=1414 WHERE id_lich_trinh=140
UPDATE LichTrinhChuyen SET offset_phut=1537 WHERE id_lich_trinh=141
UPDATE LichTrinhChuyen SET offset_phut=1600 WHERE id_lich_trinh=142
UPDATE LichTrinhChuyen SET offset_phut=1661 WHERE id_lich_trinh=143
UPDATE LichTrinhChuyen SET offset_phut=1692 WHERE id_lich_trinh=144
UPDATE LichTrinhChuyen SET offset_phut=1853 WHERE id_lich_trinh=145
UPDATE LichTrinhChuyen SET offset_phut=1919 WHERE id_lich_trinh=146
UPDATE LichTrinhChuyen SET offset_phut=1959 WHERE id_lich_trinh=147
UPDATE LichTrinhChuyen SET offset_phut=1997 WHERE id_lich_trinh=148
UPDATE LichTrinhChuyen SET offset_phut=2060 WHERE id_lich_trinh=149
GO
PRINT N'=== Phần 1: offset_phut DONE ==='
GO

-- ============================================================
-- PHẦN 2: SEGMENT SEAT
-- ============================================================

-- 2a. Xóa index UNIQUE ngăn cùng ghế cho chặng khác nhau
IF EXISTS (SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID('Ve') AND name='UK_Ve_Active')
    DROP INDEX [UK_Ve_Active] ON [Ve]
GO

-- 2b. Thêm id_ga_len, id_ga_xuong vào TamGiuGhe để check segment
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id=OBJECT_ID('TamGiuGhe') AND name='id_ga_len')
    ALTER TABLE TamGiuGhe ADD id_ga_len INT NULL
GO
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id=OBJECT_ID('TamGiuGhe') AND name='id_ga_xuong')
    ALTER TABLE TamGiuGhe ADD id_ga_xuong INT NULL
GO

PRINT N'=== Phần 2: Segment seat columns DONE ==='
GO

-- ============================================================
-- PHẦN 3: RUNTIME TOACHUYEN — model ToaChuyen đã có trong CSDLHC.sql
-- Không cần ALTER, chỉ cần thêm model JS
-- ============================================================

-- ============================================================
-- PHẦN 4: AUTO-STATUS — Stored Procedure cập nhật trang_thai ChuyenTau
-- ============================================================
CREATE OR ALTER PROCEDURE [dbo].[sp_CapNhatTrangThaiChuyen]
AS
BEGIN
    SET NOCOUNT ON
    -- Đánh dấu các chuyến đã qua giờ khởi hành → da_chay
    UPDATE ct
    SET ct.trang_thai = 'da_chay'
    FROM ChuyenTau ct
    JOIN LichChay lc ON lc.id_lich_chay = ct.id_lich_chay
    WHERE ct.trang_thai IN ('dung_gio', 'sap_den', 'dieu_chinh')
      AND CAST(
              CONVERT(CHAR(10), ct.ngay_chay, 23)
            + ' '
            + CONVERT(CHAR(8), lc.gio_khoi_hanh, 108)
          AS DATETIME) < DATEADD(HOUR, 7, GETUTCDATE())

    -- Hủy đơn chờ thanh toán quá hạn
    UPDATE DonDatVe SET trang_thai = 'het_han'
    WHERE trang_thai = 'cho_thanh_toan'
      AND thoi_gian_het_han < DATEADD(HOUR, 7, GETUTCDATE())

    -- Hủy vé của đơn quá hạn
    UPDATE Ve SET trang_thai = 'da_huy'
    WHERE trang_thai = 'cho_xac_nhan'
      AND id_don_dat_ve IN (
          SELECT id_don_dat_ve FROM DonDatVe WHERE trang_thai = 'het_han'
      )

    -- Hết hạn TamGiuGhe
    UPDATE TamGiuGhe SET trang_thai = 'het_han'
    WHERE trang_thai = 'dang_giu'
      AND thoi_gian_het_han < DATEADD(HOUR, 7, GETUTCDATE())

    DECLARE @updated INT = @@ROWCOUNT
    IF @updated > 0
        PRINT N'sp_CapNhatTrangThaiChuyen: cập nhật ' + CAST(@updated AS VARCHAR) + N' dòng'
END
GO

-- Chạy ngay một lần để fix dữ liệu hiện tại
EXEC sp_CapNhatTrangThaiChuyen
GO

PRINT N'=== AMEND01.sql DONE — khởi động lại backend để áp dụng ==='
GO
