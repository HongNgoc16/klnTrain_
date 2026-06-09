-- ============================================================
-- AMEND04_DieuPhoi.sql — Stored Procedures, Functions & Views
-- dành riêng cho Hệ thống Điều Phối Viên
-- Chạy sau AMEND01, AMEND02
-- ============================================================
USE [Train]
GO

-- ============================================================
-- PHẦN 1: FIX MODEL — thêm trang_thai, ghi_chu vào ToaChuyen
-- (nếu chưa có từ lần restore CSDL)
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id=OBJECT_ID('ToaChuyen') AND name='trang_thai')
    ALTER TABLE ToaChuyen ADD trang_thai VARCHAR(20) NOT NULL DEFAULT 'hoat_dong'
GO
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id=OBJECT_ID('ToaChuyen') AND name='ghi_chu')
    ALTER TABLE ToaChuyen ADD ghi_chu NVARCHAR(500) NULL
GO

-- ============================================================
-- PHẦN 2: STORED PROCEDURES ĐIỀU PHỐI VIÊN
-- ============================================================

-- ── SP 1: Ghi sự kiện điều phối (tổng hợp) ──────────────────
-- Thay cho raw INSERT DieuPhoi + cập nhật trang_thai riêng lẻ
-- Tự động:
--   delay    → ChuyenTau.trang_thai = 'dieu_chinh'
--   cancel   → ChuyenTau.trang_thai = 'huy'
--   maintenance → ToaChuyen.trang_thai = 'bao_tri' (nếu cung cấp soToa)
CREATE OR ALTER PROCEDURE [dbo].[sp_DP_GhiSuKien]
    @id_chuyen      INT,
    @loai_su_kien   VARCHAR(30),
    @mo_ta          NVARCHAR(1000) = NULL,
    @delay_phut     INT = NULL,
    @id_ga          INT = NULL,
    @so_toa         INT = NULL,
    @nguoi_tao      INT
AS
BEGIN
    SET NOCOUNT ON
    BEGIN TRANSACTION
    BEGIN TRY
        -- Kiểm tra chuyến tồn tại
        IF NOT EXISTS (SELECT 1 FROM ChuyenTau WHERE id_chuyen = @id_chuyen)
        BEGIN ROLLBACK; RAISERROR(N'Chuyến tàu không tồn tại', 16, 1); RETURN END

        -- Ghi sự kiện
        INSERT INTO DieuPhoi(id_chuyen, loai_su_kien, mo_ta, id_ga_anh_huong, delay_phut, nguoi_tao)
        VALUES (@id_chuyen, @loai_su_kien, @mo_ta, @id_ga, @delay_phut, @nguoi_tao)

        DECLARE @id_moi INT = SCOPE_IDENTITY()

        -- Tự động cập nhật trạng thái ChuyenTau
        IF @loai_su_kien = 'delay'
            UPDATE ChuyenTau SET trang_thai = 'dieu_chinh'
            WHERE id_chuyen = @id_chuyen AND trang_thai IN ('dung_gio','sap_den')

        IF @loai_su_kien = 'cancel'
            UPDATE ChuyenTau SET trang_thai = 'huy', ghi_chu = ISNULL(@mo_ta, ghi_chu)
            WHERE id_chuyen = @id_chuyen

        -- Cập nhật toa bảo trì nếu cung cấp
        IF @loai_su_kien = 'maintenance' AND @so_toa IS NOT NULL
            UPDATE ToaChuyen SET trang_thai = 'bao_tri', ghi_chu = @mo_ta
            WHERE id_chuyen = @id_chuyen AND so_toa_thu_tu = @so_toa

        -- Nếu là delay → cập nhật LichTrinhThucTe cho các ga chưa qua
        IF @loai_su_kien = 'delay' AND @delay_phut IS NOT NULL AND @id_ga IS NOT NULL
        BEGIN
            DECLARE @thu_tu_ga INT
            SELECT @thu_tu_ga = thu_tu_dung FROM LichTrinhThucTe
            WHERE id_chuyen = @id_chuyen AND id_ga = @id_ga

            IF @thu_tu_ga IS NOT NULL
                UPDATE LichTrinhThucTe
                SET delay_di_phut = delay_di_phut + @delay_phut,
                    delay_den_phut = delay_den_phut + @delay_phut
                WHERE id_chuyen = @id_chuyen
                  AND thu_tu_dung >= @thu_tu_ga
                  AND trang_thai = 'chua_toi'
        END

        COMMIT
        SELECT @id_moi AS id_dieu_phoi, N'Ghi nhận thành công' AS message
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK; THROW
    END CATCH
END
GO

-- ── SP 2: Thêm toa vào chuyến ────────────────────────────────
-- Bao gồm: kiểm tra trùng + tạo ToaChuyen + gọi sp_EnsureGheChuyen
CREATE OR ALTER PROCEDURE [dbo].[sp_DP_ThemToa]
    @id_chuyen      INT,
    @so_toa_thu_tu  INT,
    @id_loai_toa    INT,
    @so_ghe_toi_da  INT = NULL,
    @nguoi_tao      INT
AS
BEGIN
    SET NOCOUNT ON
    -- Kiểm tra chuyến
    IF NOT EXISTS (SELECT 1 FROM ChuyenTau WHERE id_chuyen = @id_chuyen)
    BEGIN RAISERROR(N'Chuyến tàu không tồn tại', 16, 1); RETURN END
    -- Kiểm tra trùng toa
    IF EXISTS (SELECT 1 FROM ToaChuyen WHERE id_chuyen=@id_chuyen AND so_toa_thu_tu=@so_toa_thu_tu)
    BEGIN RAISERROR(N'Toa số này đã tồn tại trong chuyến', 16, 1); RETURN END
    -- Lấy sức chứa mặc định nếu chưa cung cấp
    IF @so_ghe_toi_da IS NULL
        SELECT @so_ghe_toi_da = so_cho_toi_da FROM LoaiToa WHERE id_loai_toa = @id_loai_toa

    INSERT INTO ToaChuyen(id_chuyen, so_toa_thu_tu, id_loai_toa, so_ghe_toi_da, trang_thai)
    VALUES (@id_chuyen, @so_toa_thu_tu, @id_loai_toa, @so_ghe_toi_da, 'hoat_dong')

    DECLARE @id_toa INT = SCOPE_IDENTITY()

    -- Tạo GheChuyen cho toa mới
    EXEC sp_EnsureGheChuyen @id_chuyen

    -- Ghi log
    INSERT INTO DieuPhoi(id_chuyen, loai_su_kien, mo_ta, nguoi_tao)
    VALUES (@id_chuyen, 'them_toa',
            N'Thêm Toa ' + CAST(@so_toa_thu_tu AS NVARCHAR) + N' vào chuyến',
            @nguoi_tao)

    SELECT @id_toa AS id_toa_chuyen, N'Thêm toa thành công' AS message
END
GO

-- ── SP 3: Xóa toa khỏi chuyến ───────────────────────────────
CREATE OR ALTER PROCEDURE [dbo].[sp_DP_XoaToa]
    @id_toa_chuyen  INT,
    @nguoi_tao      INT
AS
BEGIN
    SET NOCOUNT ON
    DECLARE @id_chuyen INT, @so_toa INT

    SELECT @id_chuyen = id_chuyen, @so_toa = so_toa_thu_tu
    FROM ToaChuyen WHERE id_toa_chuyen = @id_toa_chuyen

    IF @id_chuyen IS NULL
    BEGIN RAISERROR(N'Không tìm thấy toa', 16, 1); RETURN END

    -- Kiểm tra vé đã bán
    DECLARE @ve_ban INT
    SELECT @ve_ban = COUNT(*) FROM Ve
    WHERE id_chuyen=@id_chuyen AND so_toa_thu_tu=@so_toa
      AND trang_thai NOT IN ('da_huy','da_doi')

    IF @ve_ban > 0
    BEGIN
        DECLARE @msg NVARCHAR(200) = N'Không thể xóa Toa ' + CAST(@so_toa AS NVARCHAR)
            + N' vì đã có ' + CAST(@ve_ban AS NVARCHAR) + N' vé đặt'
        RAISERROR(@msg, 16, 1); RETURN
    END

    DELETE FROM ToaChuyen WHERE id_toa_chuyen = @id_toa_chuyen

    INSERT INTO DieuPhoi(id_chuyen, loai_su_kien, mo_ta, nguoi_tao)
    VALUES (@id_chuyen, 'xoa_toa',
            N'Xóa Toa ' + CAST(@so_toa AS NVARCHAR) + N' khỏi chuyến',
            @nguoi_tao)

    SELECT N'Xóa toa thành công' AS message
END
GO

-- ── SP 4: Hủy chuyến tàu (với cascade) ──────────────────────
-- Hủy chuyến, cập nhật Ve đang chờ xác nhận, ghi log
CREATE OR ALTER PROCEDURE [dbo].[sp_DP_HuyChuyen]
    @id_chuyen  INT,
    @ly_do      NVARCHAR(500),
    @nguoi_tao  INT
AS
BEGIN
    SET NOCOUNT ON
    BEGIN TRANSACTION
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM ChuyenTau WHERE id_chuyen=@id_chuyen)
        BEGIN ROLLBACK; RAISERROR(N'Chuyến tàu không tồn tại', 16, 1); RETURN END

        IF EXISTS (SELECT 1 FROM ChuyenTau WHERE id_chuyen=@id_chuyen AND trang_thai='huy')
        BEGIN ROLLBACK; RAISERROR(N'Chuyến đã được hủy trước đó', 16, 1); RETURN END

        -- Cập nhật trạng thái chuyến
        UPDATE ChuyenTau SET trang_thai='huy', ghi_chu=@ly_do WHERE id_chuyen=@id_chuyen

        -- Hủy các GheChang còn dang_giu (chưa thanh toán)
        UPDATE GheChang SET trang_thai='trong'
        FROM GheChang gc
        JOIN GheChuyen gh ON gh.id_ghe_chuyen=gc.id_ghe_chuyen
        WHERE gh.id_chuyen=@id_chuyen AND gc.trang_thai='dang_giu'

        -- Hủy TamGiuGhe
        UPDATE TamGiuGhe SET trang_thai='het_han'
        WHERE id_chuyen=@id_chuyen AND trang_thai='dang_giu'

        -- Hủy Ve chưa thanh toán
        UPDATE Ve SET trang_thai='da_huy'
        WHERE id_chuyen=@id_chuyen AND trang_thai='cho_xac_nhan'

        -- Hủy DonDatVe chưa thanh toán
        UPDATE DonDatVe SET trang_thai='het_han'
        WHERE trang_thai='cho_thanh_toan'
          AND id_don_dat_ve IN (
              SELECT DISTINCT id_don_dat_ve FROM Ve
              WHERE id_chuyen=@id_chuyen AND trang_thai='da_huy'
          )

        -- Ghi log sự kiện
        INSERT INTO DieuPhoi(id_chuyen, loai_su_kien, mo_ta, nguoi_tao)
        VALUES (@id_chuyen, 'cancel', @ly_do, @nguoi_tao)

        DECLARE @ves_huy INT = @@ROWCOUNT
        COMMIT
        SELECT N'Hủy chuyến thành công' AS message, @ves_huy AS so_ve_huy
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK; THROW
    END CATCH
END
GO

-- ── SP 5: Sinh chuyến từ lịch chạy ──────────────────────────
CREATE OR ALTER PROCEDURE [dbo].[sp_DP_SinhChuyen]
    @id_lich_chay   INT,
    @tu_ngay        DATE,
    @den_ngay       DATE
AS
BEGIN
    SET NOCOUNT ON
    IF NOT EXISTS (SELECT 1 FROM LichChay WHERE id_lich_chay=@id_lich_chay)
    BEGIN RAISERROR(N'Lịch chạy không tồn tại', 16, 1); RETURN END

    IF DATEDIFF(DAY, @tu_ngay, @den_ngay) > 90
    BEGIN RAISERROR(N'Tối đa 90 ngày mỗi lần sinh chuyến', 16, 1); RETURN END

    DECLARE @ngay DATE = @tu_ngay
    DECLARE @tao INT = 0, @bo_qua INT = 0

    WHILE @ngay <= @den_ngay
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM ChuyenTau WHERE id_lich_chay=@id_lich_chay AND ngay_chay=@ngay)
        BEGIN
            INSERT INTO ChuyenTau(id_lich_chay, ngay_chay, trang_thai)
            VALUES (@id_lich_chay, @ngay, 'dung_gio')
            SET @tao = @tao + 1
        END
        ELSE SET @bo_qua = @bo_qua + 1

        SET @ngay = DATEADD(DAY, 1, @ngay)
    END

    SELECT @tao AS created, @bo_qua AS skipped,
           N'Sinh ' + CAST(@tao AS NVARCHAR) + N' chuyến thành công' AS message
END
GO

-- ── SP 6: Cập nhật delay tại ga cụ thể ──────────────────────
-- Lan truyền delay xuống các ga tiếp theo trong LichTrinhThucTe
CREATE OR ALTER PROCEDURE [dbo].[sp_DP_CapNhatDelay]
    @id_chuyen  INT,
    @id_ga      INT,
    @delay_phut INT,
    @nguoi_tao  INT
AS
BEGIN
    SET NOCOUNT ON
    BEGIN TRANSACTION
    BEGIN TRY
        DECLARE @thu_tu INT
        SELECT @thu_tu = thu_tu_dung FROM LichTrinhThucTe
        WHERE id_chuyen=@id_chuyen AND id_ga=@id_ga

        IF @thu_tu IS NULL
        BEGIN
            -- Nếu chưa có LichTrinhThucTe, tạo mới từ LichTrinhChuyen
            INSERT INTO LichTrinhThucTe(id_chuyen, id_ga, thu_tu_dung, delay_den_phut, delay_di_phut, trang_thai)
            SELECT @id_chuyen, id_ga, thu_tu_dung, @delay_phut, @delay_phut, 'chua_toi'
            FROM LichTrinhChuyen lc
            JOIN ChuyenTau ct ON ct.id_lich_chay=lc.id_lich_chay
            WHERE ct.id_chuyen=@id_chuyen

            -- Lấy lại thu_tu sau khi insert
            SELECT @thu_tu = thu_tu_dung FROM LichTrinhThucTe
            WHERE id_chuyen=@id_chuyen AND id_ga=@id_ga
        END
        ELSE
        BEGIN
            -- Cập nhật delay cho ga này và các ga tiếp theo
            UPDATE LichTrinhThucTe
            SET delay_di_phut  = delay_di_phut  + @delay_phut,
                delay_den_phut = delay_den_phut + @delay_phut
            WHERE id_chuyen=@id_chuyen
              AND thu_tu_dung >= @thu_tu
              AND trang_thai = 'chua_toi'
        END

        -- Đổi trạng thái chuyến
        UPDATE ChuyenTau SET trang_thai='dieu_chinh'
        WHERE id_chuyen=@id_chuyen AND trang_thai IN ('dung_gio','sap_den')

        -- Ghi sự kiện
        DECLARE @ga_ten NVARCHAR(100)
        SELECT @ga_ten = ten_ga FROM GaTau WHERE id_ga=@id_ga
        INSERT INTO DieuPhoi(id_chuyen, loai_su_kien, mo_ta, id_ga_anh_huong, delay_phut, nguoi_tao)
        VALUES (@id_chuyen, 'delay',
                N'Chậm ' + CAST(@delay_phut AS NVARCHAR) + N' phút tại ga ' + ISNULL(@ga_ten, CAST(@id_ga AS NVARCHAR)),
                @id_ga, @delay_phut, @nguoi_tao)

        COMMIT
        SELECT N'Cập nhật delay thành công' AS message
    END TRY
    BEGIN CATCH IF @@TRANCOUNT>0 ROLLBACK; THROW END CATCH
END
GO

PRINT N'=== Phần 2: Stored Procedures DONE ==='
GO

-- ============================================================
-- PHẦN 3: FUNCTIONS HỖ TRỢ ĐIỀU PHỐI VIÊN
-- ============================================================

-- ── Fn 1: Số chỗ trống theo chặng [id_ga_len → id_ga_xuong] ─
CREATE OR ALTER FUNCTION [dbo].[fn_DP_ChoTrong]
    (@id_chuyen INT, @so_toa INT, @id_ga_len INT, @id_ga_xuong INT)
RETURNS INT
AS
BEGIN
    DECLARE @tong_cho INT, @chiem INT, @result INT

    -- Tổng ghế của toa
    SELECT @tong_cho = ISNULL(tc.so_ghe_toi_da, lt.so_cho_toi_da)
    FROM ToaChuyen tc
    JOIN LoaiToa lt ON lt.id_loai_toa = tc.id_loai_toa
    WHERE tc.id_chuyen=@id_chuyen AND tc.so_toa_thu_tu=@so_toa

    IF @tong_cho IS NULL RETURN 0

    -- Ghế bị chiếm (segment overlap)
    SELECT @chiem = COUNT(DISTINCT gc.so_ghe_trong_toa)
    FROM Ve v
    JOIN GheChuyen gc ON gc.id_chuyen=v.id_chuyen AND gc.so_toa_thu_tu=v.so_toa_thu_tu AND gc.so_ghe_trong_toa=v.so_ghe_trong_toa
    JOIN LichTrinhChuyen len_ex ON len_ex.id_lich_chay=(SELECT id_lich_chay FROM ChuyenTau WHERE id_chuyen=@id_chuyen) AND len_ex.id_ga=v.id_ga_len
    JOIN LichTrinhChuyen xuo_ex ON xuo_ex.id_lich_chay=(SELECT id_lich_chay FROM ChuyenTau WHERE id_chuyen=@id_chuyen) AND xuo_ex.id_ga=v.id_ga_xuong
    JOIN LichTrinhChuyen len_new ON len_new.id_lich_chay=(SELECT id_lich_chay FROM ChuyenTau WHERE id_chuyen=@id_chuyen) AND len_new.id_ga=@id_ga_len
    JOIN LichTrinhChuyen xuo_new ON xuo_new.id_lich_chay=(SELECT id_lich_chay FROM ChuyenTau WHERE id_chuyen=@id_chuyen) AND xuo_new.id_ga=@id_ga_xuong
    WHERE v.id_chuyen=@id_chuyen AND v.so_toa_thu_tu=@so_toa
      AND v.trang_thai NOT IN ('da_huy','da_doi')
      AND len_ex.thu_tu_dung < xuo_new.thu_tu_dung
      AND xuo_ex.thu_tu_dung > len_new.thu_tu_dung

    SET @result = @tong_cho - ISNULL(@chiem, 0)
    RETURN CASE WHEN @result < 0 THEN 0 ELSE @result END
END
GO

-- ── Fn 2: Tổng vé bán của chuyến ─────────────────────────────
CREATE OR ALTER FUNCTION [dbo].[fn_DP_TongVeBan](@id_chuyen INT)
RETURNS INT
AS
BEGIN
    DECLARE @cnt INT
    SELECT @cnt = COUNT(*) FROM Ve
    WHERE id_chuyen=@id_chuyen AND trang_thai NOT IN ('da_huy','da_doi')
    RETURN ISNULL(@cnt, 0)
END
GO

PRINT N'=== Phần 3: Functions DONE ==='
GO

-- ============================================================
-- PHẦN 4: VIEWS TỔNG HỢP CHO ĐIỀU PHỐI VIÊN
-- ============================================================

-- ── View 1: Tổng quan chuyến tàu hôm nay ────────────────────
CREATE OR ALTER VIEW [dbo].[vw_DP_ChuyenHomNay]
AS
SELECT
    ct.id_chuyen,
    ct.ngay_chay,
    ct.trang_thai,
    ct.ghi_chu,
    lc.gio_khoi_hanh,
    lc.gio_du_kien_den,
    t.so_hieu AS ma_tau,
    t.ten_tau,
    gdi.ten_ga AS ga_di,
    gden.ten_ga AS ga_den,
    (SELECT COUNT(*) FROM ToaChuyen tc2 WHERE tc2.id_chuyen=ct.id_chuyen) AS so_toa,
    dbo.fn_DP_TongVeBan(ct.id_chuyen) AS tong_ve_ban,
    (SELECT TOP 1 loai_su_kien + ISNULL(' (+' + CAST(delay_phut AS VARCHAR) + 'p)','')
     FROM DieuPhoi dp WHERE dp.id_chuyen=ct.id_chuyen ORDER BY thoi_gian_tao DESC) AS su_kien_moi_nhat
FROM ChuyenTau ct
JOIN LichChay lc ON lc.id_lich_chay = ct.id_lich_chay
JOIN Tau t       ON t.id_tau = lc.id_tau
JOIN GaTau gdi   ON gdi.id_ga = lc.id_ga_di
JOIN GaTau gden  ON gden.id_ga = lc.id_ga_den
WHERE ct.ngay_chay = CAST(DATEADD(HOUR,7,GETUTCDATE()) AS DATE)
GO

-- ── View 2: Chi tiết toa của chuyến ─────────────────────────
CREATE OR ALTER VIEW [dbo].[vw_DP_ToaChuyenChiTiet]
AS
SELECT
    tc.id_toa_chuyen,
    tc.id_chuyen,
    tc.so_toa_thu_tu,
    tc.id_loai_toa,
    tc.trang_thai AS trang_thai_toa,
    tc.ghi_chu AS ghi_chu_toa,
    ISNULL(tc.so_ghe_toi_da, lt.so_cho_toi_da) AS so_ghe_toi_da,
    lt.ten_loai_toa,
    lt.ma_loai_toa,
    (SELECT COUNT(*) FROM Ve v
     WHERE v.id_chuyen=tc.id_chuyen AND v.so_toa_thu_tu=tc.so_toa_thu_tu
       AND v.trang_thai NOT IN ('da_huy','da_doi')) AS ve_ban
FROM ToaChuyen tc
JOIN LoaiToa lt ON lt.id_loai_toa = tc.id_loai_toa
GO

-- ── View 3: Sự kiện điều phối theo chuyến ───────────────────
CREATE OR ALTER VIEW [dbo].[vw_DP_SuKienChuyen]
AS
SELECT
    dp.id_dieu_phoi,
    dp.id_chuyen,
    ct.ngay_chay,
    t.so_hieu AS ma_tau,
    dp.loai_su_kien,
    dp.mo_ta,
    dp.delay_phut,
    ga.ten_ga AS ga_anh_huong,
    dp.trang_thai,
    dp.thoi_gian_tao,
    tk.ho_ten AS nguoi_tao_ten
FROM DieuPhoi dp
JOIN ChuyenTau ct ON ct.id_chuyen = dp.id_chuyen
JOIN LichChay lc  ON lc.id_lich_chay = ct.id_lich_chay
JOIN Tau t        ON t.id_tau = lc.id_tau
LEFT JOIN GaTau ga ON ga.id_ga = dp.id_ga_anh_huong
LEFT JOIN TaiKhoan tk ON tk.id_tai_khoan = dp.nguoi_tao
GO

PRINT N'=== Phần 4: Views DONE ==='
GO

-- ============================================================
-- PHẦN 5: CẬP NHẬT TRẠNG THÁI CHUYẾN (mở rộng từ AMEND01)
-- Thêm case cho 'sap_den' và 'dieu_chinh'
-- ============================================================
CREATE OR ALTER PROCEDURE [dbo].[sp_CapNhatTrangThaiChuyen]
AS
BEGIN
    SET NOCOUNT ON

    -- Đánh dấu đã chạy
    UPDATE ct SET ct.trang_thai = 'da_chay'
    FROM ChuyenTau ct
    JOIN LichChay lc ON lc.id_lich_chay = ct.id_lich_chay
    WHERE ct.trang_thai IN ('dung_gio','sap_den','dieu_chinh')
      AND CAST(CONVERT(CHAR(10), ct.ngay_chay, 23) + ' ' + CONVERT(CHAR(8), lc.gio_khoi_hanh, 108) AS DATETIME)
          < DATEADD(HOUR, 7, GETUTCDATE())

    -- Đánh dấu 'sap_den' cho chuyến sắp khởi hành trong 30 phút
    UPDATE ct SET ct.trang_thai = 'sap_den'
    FROM ChuyenTau ct
    JOIN LichChay lc ON lc.id_lich_chay = ct.id_lich_chay
    WHERE ct.trang_thai = 'dung_gio'
      AND CAST(CONVERT(CHAR(10), ct.ngay_chay, 23) + ' ' + CONVERT(CHAR(8), lc.gio_khoi_hanh, 108) AS DATETIME)
          BETWEEN DATEADD(HOUR, 7, GETUTCDATE())
              AND DATEADD(MINUTE, 30, DATEADD(HOUR, 7, GETUTCDATE()))

    -- Hủy đơn hết hạn
    UPDATE DonDatVe SET trang_thai='het_han'
    WHERE trang_thai='cho_thanh_toan'
      AND thoi_gian_het_han < DATEADD(HOUR,7,GETUTCDATE())

    UPDATE Ve SET trang_thai='da_huy'
    WHERE trang_thai='cho_xac_nhan'
      AND id_don_dat_ve IN (SELECT id_don_dat_ve FROM DonDatVe WHERE trang_thai='het_han')

    UPDATE TamGiuGhe SET trang_thai='het_han'
    WHERE trang_thai='dang_giu'
      AND thoi_gian_het_han < DATEADD(HOUR,7,GETUTCDATE())

    UPDATE GheChang SET trang_thai='trong'
    WHERE trang_thai='dang_giu'
      AND (thoi_gian_het_han IS NOT NULL AND thoi_gian_het_han <= DATEADD(HOUR,7,GETUTCDATE()))
END
GO

PRINT N'=== AMEND04_DieuPhoi.sql DONE ==='
PRINT N'Các SP mới: sp_DP_GhiSuKien, sp_DP_ThemToa, sp_DP_XoaToa, sp_DP_HuyChuyen, sp_DP_SinhChuyen, sp_DP_CapNhatDelay'
PRINT N'Functions mới: fn_DP_ChoTrong, fn_DP_TongVeBan'
PRINT N'Views mới: vw_DP_ChuyenHomNay, vw_DP_ToaChuyenChiTiet, vw_DP_SuKienChuyen'
GO
