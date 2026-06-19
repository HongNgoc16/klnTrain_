/*
  sql_dieuphoi_procs.sql
  ------------------------------------------------------------------
  Stored procedures dùng cho DieuPhoiController.js (module Điều phối viên).
  Gom các câu lệnh SQL thô (raw SQL) trong controller thành proc để dễ
  bảo trì, tái sử dụng và tối ưu (set-based thay vì loop ở tầng ứng dụng).

  Cách dùng: chạy file này trên SQL Server, ở context của database hiện
  đang dùng cho KLN_Train (sau khi đã restore CoSoDuLieuHoanChinh.sql).
  Yêu cầu SQL Server 2016+ (dùng STRING_SPLIT, DROP PROCEDURE IF EXISTS).

  Controller sẽ thử EXEC các proc này trước; nếu proc chưa tồn tại
  (chưa chạy file này) sẽ tự rơi về logic JS/raw SQL cũ tương đương.
  ------------------------------------------------------------------
*/

-- ════════════════════════════════════════════════════════════════
-- 1. Thông báo cho khách hàng có vé active trên 1 chuyến
--    (thay cho notifyAffectedCustomers: SELECT DISTINCT + INSERT ThongBao)
-- ════════════════════════════════════════════════════════════════
DROP PROCEDURE IF EXISTS [dbo].[sp_DP_ThongBaoKhachChuyen]
GO
CREATE PROCEDURE [dbo].[sp_DP_ThongBaoKhachChuyen]
    @id_chuyen INT,
    @tieu_de   NVARCHAR(200),
    @noi_dung  NVARCHAR(MAX),
    @loai      VARCHAR(30)
AS
BEGIN
    SET NOCOUNT ON

    INSERT INTO ThongBao (id_tai_khoan, tieu_de, noi_dung, loai, da_doc, lien_ket, thoi_gian_tao)
    SELECT DISTINCT ddv.id_tai_khoan, @tieu_de, @noi_dung, @loai, 0, '/tra-cuu-don', GETDATE()
    FROM Ve v WITH (NOLOCK)
    JOIN DonDatVe ddv WITH (NOLOCK) ON ddv.id_don_dat_ve = v.id_don_dat_ve
    WHERE v.id_chuyen = @id_chuyen
      AND v.trang_thai NOT IN ('da_huy','da_doi')
      AND ddv.id_tai_khoan IS NOT NULL

    SELECT @@ROWCOUNT AS so_luong
END
GO

-- ════════════════════════════════════════════════════════════════
-- 2. Dashboard điều phối: số chuyến trong 1 ngày (trừ chuyến đã hủy)
-- ════════════════════════════════════════════════════════════════
DROP PROCEDURE IF EXISTS [dbo].[sp_DP_DemChuyenTheoNgay]
GO
CREATE PROCEDURE [dbo].[sp_DP_DemChuyenTheoNgay]
    @ngay DATE
AS
BEGIN
    SET NOCOUNT ON
    SELECT COUNT(*) AS cnt FROM ChuyenTau WHERE ngay_chay = @ngay AND trang_thai <> 'huy'
END
GO

-- ════════════════════════════════════════════════════════════════
-- 3. Dashboard điều phối: các sự kiện điều phối gần đây
-- ════════════════════════════════════════════════════════════════
DROP PROCEDURE IF EXISTS [dbo].[sp_DP_SuKienGanDay]
GO
CREATE PROCEDURE [dbo].[sp_DP_SuKienGanDay]
    @gio_truoc INT = 24,
    @top_n     INT = 10
AS
BEGIN
    SET NOCOUNT ON
    SELECT TOP (@top_n)
           dp.id_dieu_phoi, dp.id_chuyen, dp.loai_su_kien, dp.mo_ta,
           dp.delay_phut, dp.thoi_gian_tao,
           t.so_hieu AS ma_tau,
           ga.ten_ga AS ga_anh_huong
    FROM DieuPhoi dp
    LEFT JOIN ChuyenTau ct ON ct.id_chuyen = dp.id_chuyen
    LEFT JOIN LichChay lc  ON lc.id_lich_chay = ct.id_lich_chay
    LEFT JOIN Tau t        ON t.id_tau = lc.id_tau
    LEFT JOIN GaTau ga     ON ga.id_ga = dp.id_ga_anh_huong
    WHERE dp.thoi_gian_tao >= DATEADD(HOUR, -@gio_truoc, DATEADD(HOUR, 7, GETUTCDATE()))
    ORDER BY dp.thoi_gian_tao DESC
END
GO

-- ════════════════════════════════════════════════════════════════
-- 4. Danh sách chuyến tàu (lọc + phân trang), kèm tổng số bản ghi
--    (total_count trả về trong từng dòng qua COUNT(*) OVER())
-- ════════════════════════════════════════════════════════════════
DROP PROCEDURE IF EXISTS [dbo].[sp_DP_DanhSachChuyen]
GO
CREATE PROCEDURE [dbo].[sp_DP_DanhSachChuyen]
    @ngay         DATE = NULL,
    @ngay_den     DATE = NULL,
    @trang_thai   VARCHAR(25) = NULL,
    @id_tau       INT = NULL,
    @id_lich_chay INT = NULL,
    @offset       INT = 0,
    @limit        INT = 20
AS
BEGIN
    SET NOCOUNT ON

    SELECT
        ct.id_chuyen, ct.id_lich_chay, ct.ngay_chay, ct.trang_thai, ct.ghi_chu,
        tau.id_tau, tau.so_hieu AS ma_tau, tau.ten_tau,
        gdi.id_ga AS id_ga_di, gdi.ten_ga AS ten_ga_di, gdi.ma_ga_viet_tat AS vt_ga_di,
        gden.id_ga AS id_ga_den, gden.ten_ga AS ten_ga_den, gden.ma_ga_viet_tat AS vt_ga_den,
        lc.gio_khoi_hanh, lc.gio_du_kien_den,
        COUNT(*) OVER() AS total_count
    FROM ChuyenTau ct
    JOIN LichChay lc ON lc.id_lich_chay = ct.id_lich_chay
    JOIN Tau tau     ON tau.id_tau = lc.id_tau
    JOIN GaTau gdi   ON gdi.id_ga = lc.id_ga_di
    JOIN GaTau gden  ON gden.id_ga = lc.id_ga_den
    WHERE
      (
        @ngay IS NULL
        OR (@ngay_den IS NULL     AND ct.ngay_chay >= @ngay)
        OR (@ngay_den IS NOT NULL AND ct.ngay_chay BETWEEN @ngay AND @ngay_den)
      )
      AND (@trang_thai   IS NULL OR ct.trang_thai = @trang_thai)
      AND (@id_tau       IS NULL OR lc.id_tau = @id_tau)
      AND (@id_lich_chay IS NULL OR ct.id_lich_chay = @id_lich_chay)
    ORDER BY ct.ngay_chay DESC, lc.gio_khoi_hanh ASC
    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
END
GO

-- ════════════════════════════════════════════════════════════════
-- 5. Số vé đã bán cho 1 danh sách chuyến (id cách nhau bởi dấu phẩy)
-- ════════════════════════════════════════════════════════════════
DROP PROCEDURE IF EXISTS [dbo].[sp_DP_DemVeTheoDanhSachChuyen]
GO
CREATE PROCEDURE [dbo].[sp_DP_DemVeTheoDanhSachChuyen]
    @ids VARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON
    SELECT v.id_chuyen, COUNT(*) AS cnt
    FROM Ve v WITH (NOLOCK)
    WHERE v.id_chuyen IN (SELECT TRY_CAST(value AS INT) FROM STRING_SPLIT(@ids, ','))
      AND v.trang_thai NOT IN ('da_huy','da_doi')
    GROUP BY v.id_chuyen
END
GO

-- ════════════════════════════════════════════════════════════════
-- 6. Sự kiện điều phối gần nhất cho 1 danh sách chuyến
-- ════════════════════════════════════════════════════════════════
DROP PROCEDURE IF EXISTS [dbo].[sp_DP_SuKienMoiNhatTheoDanhSachChuyen]
GO
CREATE PROCEDURE [dbo].[sp_DP_SuKienMoiNhatTheoDanhSachChuyen]
    @ids VARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON
    SELECT id_chuyen, loai_su_kien, delay_phut, thoi_gian_tao
    FROM DieuPhoi
    WHERE id_chuyen IN (SELECT TRY_CAST(value AS INT) FROM STRING_SPLIT(@ids, ','))
      AND id_dieu_phoi IN (
          SELECT MAX(id_dieu_phoi) FROM DieuPhoi
          WHERE id_chuyen IN (SELECT TRY_CAST(value AS INT) FROM STRING_SPLIT(@ids, ','))
          GROUP BY id_chuyen
      )
END
GO

-- ════════════════════════════════════════════════════════════════
-- 7. Đếm vé đã bán cho 1 toa cụ thể trong 1 chuyến
--    (dùng cho updateToaChuyen / removeToaChuyen kiểm tra trước khi sửa/xóa)
-- ════════════════════════════════════════════════════════════════
DROP PROCEDURE IF EXISTS [dbo].[sp_DP_DemVeTheoToa]
GO
CREATE PROCEDURE [dbo].[sp_DP_DemVeTheoToa]
    @id_chuyen     INT,
    @so_toa_thu_tu INT
AS
BEGIN
    SET NOCOUNT ON
    SELECT COUNT(*) AS cnt
    FROM Ve WITH (NOLOCK)
    WHERE id_chuyen = @id_chuyen AND so_toa_thu_tu = @so_toa_thu_tu
      AND trang_thai NOT IN ('da_huy','da_doi')
END
GO

-- ════════════════════════════════════════════════════════════════
-- 8. Đếm vé đã bán cho cả chuyến (dùng cho reorderToa)
-- ════════════════════════════════════════════════════════════════
DROP PROCEDURE IF EXISTS [dbo].[sp_DP_DemVeTheoChuyen]
GO
CREATE PROCEDURE [dbo].[sp_DP_DemVeTheoChuyen]
    @id_chuyen INT
AS
BEGIN
    SET NOCOUNT ON
    SELECT COUNT(*) AS cnt
    FROM Ve WITH (NOLOCK)
    WHERE id_chuyen = @id_chuyen AND trang_thai NOT IN ('da_huy','da_doi')
END
GO

-- ════════════════════════════════════════════════════════════════
-- 9. Hoán đổi thứ tự 2 toa trong 1 chuyến (qua giá trị tạm -1)
-- ════════════════════════════════════════════════════════════════
DROP PROCEDURE IF EXISTS [dbo].[sp_DP_HoanDoiToa]
GO
CREATE PROCEDURE [dbo].[sp_DP_HoanDoiToa]
    @id_toa_chuyen_1 INT,
    @so_toa_cu_1     INT,
    @id_toa_chuyen_2 INT,
    @so_toa_cu_2     INT
AS
BEGIN
    SET NOCOUNT ON
    BEGIN TRANSACTION
    BEGIN TRY
        UPDATE ToaChuyen SET so_toa_thu_tu = -1           WHERE id_toa_chuyen = @id_toa_chuyen_1
        UPDATE ToaChuyen SET so_toa_thu_tu = @so_toa_cu_1 WHERE id_toa_chuyen = @id_toa_chuyen_2
        UPDATE ToaChuyen SET so_toa_thu_tu = @so_toa_cu_2 WHERE id_toa_chuyen = @id_toa_chuyen_1
        COMMIT
        SELECT 1 AS thanh_cong
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK
        THROW
    END CATCH
END
GO

-- ════════════════════════════════════════════════════════════════
-- 10. Đảm bảo ToaChuyen tồn tại cho 1 chuyến (migrate từ CauHinhToa
--     nếu chưa có), trả về danh sách toa kèm thông tin LoaiToa
-- ════════════════════════════════════════════════════════════════
DROP PROCEDURE IF EXISTS [dbo].[sp_DP_EnsureToaChuyen]
GO
CREATE PROCEDURE [dbo].[sp_DP_EnsureToaChuyen]
    @id_chuyen INT
AS
BEGIN
    SET NOCOUNT ON

    IF NOT EXISTS (SELECT 1 FROM ToaChuyen WHERE id_chuyen = @id_chuyen)
    BEGIN
        DECLARE @id_tau INT
        SELECT @id_tau = lc.id_tau
        FROM ChuyenTau ct
        JOIN LichChay lc ON lc.id_lich_chay = ct.id_lich_chay
        WHERE ct.id_chuyen = @id_chuyen

        IF @id_tau IS NOT NULL
        BEGIN
            INSERT INTO ToaChuyen (id_chuyen, so_toa_thu_tu, id_loai_toa, so_ghe_toi_da, trang_thai)
            SELECT @id_chuyen, cht.so_toa_thu_tu, cht.id_loai_toa, lt.so_cho_toi_da, 'hoat_dong'
            FROM CauHinhToa cht
            JOIN LoaiToa lt ON lt.id_loai_toa = cht.id_loai_toa
            WHERE cht.id_tau = @id_tau
        END
    END

    SELECT tc.id_toa_chuyen, tc.so_toa_thu_tu, tc.id_loai_toa, tc.so_ghe_toi_da, tc.trang_thai,
           lt.ten_loai_toa, lt.so_cho_toi_da AS loai_so_cho_toi_da
    FROM ToaChuyen tc
    LEFT JOIN LoaiToa lt ON lt.id_loai_toa = tc.id_loai_toa
    WHERE tc.id_chuyen = @id_chuyen
    ORDER BY tc.so_toa_thu_tu
END
GO

-- ════════════════════════════════════════════════════════════════
-- 11. Đồng bộ GheChuyen cho tất cả toa của 1 chuyến dựa theo CauHinhGhe
--     (bỏ qua ghế đã tồn tại)
-- ════════════════════════════════════════════════════════════════
DROP PROCEDURE IF EXISTS [dbo].[sp_DP_DongBoGheChuyen]
GO
CREATE PROCEDURE [dbo].[sp_DP_DongBoGheChuyen]
    @id_chuyen INT
AS
BEGIN
    SET NOCOUNT ON

    INSERT INTO GheChuyen (id_chuyen, so_toa_thu_tu, so_ghe_trong_toa, id_loai_ghe)
    SELECT @id_chuyen, tc.so_toa_thu_tu, chg.so_ghe_trong_toa, chg.id_loai_ghe
    FROM ToaChuyen tc
    JOIN CauHinhGhe chg ON chg.id_loai_toa = tc.id_loai_toa
    WHERE tc.id_chuyen = @id_chuyen
      AND NOT EXISTS (
          SELECT 1 FROM GheChuyen gc
          WHERE gc.id_chuyen = @id_chuyen
            AND gc.so_toa_thu_tu = tc.so_toa_thu_tu
            AND gc.so_ghe_trong_toa = chg.so_ghe_trong_toa
      )

    SELECT @@ROWCOUNT AS so_ghe_tao
END
GO

-- ════════════════════════════════════════════════════════════════
-- 12. Đếm vé theo từng toa của 1 chuyến (dùng cho getChuyenTauDetail)
-- ════════════════════════════════════════════════════════════════
DROP PROCEDURE IF EXISTS [dbo].[sp_DP_ThongKeVeTheoToa]
GO
CREATE PROCEDURE [dbo].[sp_DP_ThongKeVeTheoToa]
    @id_chuyen INT
AS
BEGIN
    SET NOCOUNT ON
    SELECT so_toa_thu_tu, COUNT(*) AS ban
    FROM Ve WITH (NOLOCK)
    WHERE id_chuyen = @id_chuyen AND trang_thai NOT IN ('da_huy','da_doi')
    GROUP BY so_toa_thu_tu
END
GO

-- ════════════════════════════════════════════════════════════════
-- 13. Ghi nhận sự kiện điều phối (delay / cancel / maintenance / info)
-- ════════════════════════════════════════════════════════════════
DROP PROCEDURE IF EXISTS [dbo].[sp_DP_GhiSuKien]
GO
CREATE PROCEDURE [dbo].[sp_DP_GhiSuKien]
    @id_chuyen    INT,
    @loai_su_kien VARCHAR(30),
    @mo_ta        NVARCHAR(MAX) = NULL,
    @delay_phut   INT = NULL,
    @id_ga        INT = NULL,
    @so_toa       INT = NULL,
    @nguoi_tao    INT
AS
BEGIN
    SET NOCOUNT ON

    IF NOT EXISTS (SELECT 1 FROM ChuyenTau WHERE id_chuyen = @id_chuyen)
    BEGIN
        SELECT CAST(NULL AS INT) AS id_dieu_phoi, N'Không tìm thấy chuyến tàu' AS message
        RETURN
    END

    INSERT INTO DieuPhoi (id_chuyen, loai_su_kien, mo_ta, id_ga_anh_huong, delay_phut, nguoi_tao, thoi_gian_tao, trang_thai)
    VALUES (@id_chuyen, @loai_su_kien, @mo_ta, @id_ga, @delay_phut, @nguoi_tao, GETDATE(), 'hieu_luc')

    DECLARE @id INT = SCOPE_IDENTITY()

    SELECT @id AS id_dieu_phoi, N'Ghi nhận sự kiện thành công' AS message
END
GO

-- ════════════════════════════════════════════════════════════════
-- 14. Cập nhật LichTrinhThucTe (giờ đến/đi dự kiến) cho các ga từ
--     1 ga ảnh hưởng trở đi theo số phút trễ (set-based, thay cho
--     vòng lặp MERGE từng ga ở tầng ứng dụng)
-- ════════════════════════════════════════════════════════════════
DROP PROCEDURE IF EXISTS [dbo].[sp_DP_CapNhatLichTrinhTheoDelay]
GO
CREATE PROCEDURE [dbo].[sp_DP_CapNhatLichTrinhTheoDelay]
    @id_chuyen      INT,
    @id_lich_chay   INT,
    @tu_thu_tu_dung INT,
    @delay_phut     INT,
    @ghi_chu        NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON

    MERGE LichTrinhThucTe AS tgt
    USING (
        SELECT ltc.id_ga, ltc.thu_tu_dung,
               CAST(DATEADD(MINUTE, @delay_phut, CAST(ltc.gio_den AS DATETIME)) AS TIME) AS gio_den_du_kien,
               CAST(DATEADD(MINUTE, @delay_phut, CAST(ltc.gio_di  AS DATETIME)) AS TIME) AS gio_di_du_kien
        FROM LichTrinhChuyen ltc
        WHERE ltc.id_lich_chay = @id_lich_chay
          AND ltc.thu_tu_dung >= @tu_thu_tu_dung
    ) AS src
    ON tgt.id_chuyen = @id_chuyen AND tgt.id_ga = src.id_ga
    WHEN MATCHED THEN
        UPDATE SET gio_den_du_kien = src.gio_den_du_kien,
                   gio_di_du_kien  = src.gio_di_du_kien,
                   delay_den_phut  = @delay_phut,
                   delay_di_phut   = @delay_phut,
                   trang_thai      = 'delay',
                   ghi_chu         = COALESCE(@ghi_chu, ghi_chu)
    WHEN NOT MATCHED THEN
        INSERT (id_chuyen, id_ga, thu_tu_dung, gio_den_du_kien, gio_di_du_kien, delay_den_phut, delay_di_phut, trang_thai, ghi_chu)
        VALUES (@id_chuyen, src.id_ga, src.thu_tu_dung, src.gio_den_du_kien, src.gio_di_du_kien, @delay_phut, @delay_phut, 'delay', @ghi_chu);

    SELECT @@ROWCOUNT AS so_ga_cap_nhat
END
GO
