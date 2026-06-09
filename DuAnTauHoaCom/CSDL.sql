-- ============================================================
--  CSDL.SQL  –  KLN TRAIN  v2.0
--  Phiên bản cải tiến toàn diện
--  Ngày: 02/06/2026
--  Dựa trên phân tích: KLNTrainn.sql + BoSungHeThong.docx
-- ============================================================
-- Cải tiến so với v1:
--   1. Tách Template/Runtime: ToaChuyen, GheChuyen
--   2. Quản lý chặng: ChangTauHanhTrinh, GheChang
--   3. Lịch trình thực tế: LichTrinhThucTe + DieuPhoi
--   4. Cấu hình hệ thống: SystemConfig
--   5. RBAC đầy đủ: VaiTro, Quyen, VaiTroQuyen, TaiKhoanVaiTro
--   6. Check-in QR: CheckIn
--   7. Thanh toán gateway: trường bổ sung trong ThanhToan
--   8. Giữ chỗ: thêm trạng thái 'da_giai_phong', 'het_han'
--   9. Stored Procedures, Functions, Triggers đầy đủ
-- ============================================================

USE [master]
GO

IF DB_ID('KLNTrain') IS NOT NULL
    ALTER DATABASE [KLNTrain] SET SINGLE_USER WITH ROLLBACK IMMEDIATE
GO
IF DB_ID('KLNTrain') IS NOT NULL
    DROP DATABASE [KLNTrain]
GO

CREATE DATABASE [KLNTrain]
    CONTAINMENT = NONE
    ON PRIMARY (
        NAME = N'KLNTrain',
        FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL16.SQLEXPRESS\MSSQL\DATA\KLNTrain.mdf',
        SIZE = 73728KB, MAXSIZE = UNLIMITED, FILEGROWTH = 65536KB
    )
    LOG ON (
        NAME = N'KLNTrain_log',
        FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL16.SQLEXPRESS\MSSQL\DATA\KLNTrain_log.ldf',
        SIZE = 8192KB, MAXSIZE = 2048GB, FILEGROWTH = 65536KB
    )
    WITH CATALOG_COLLATION = DATABASE_DEFAULT, LEDGER = OFF
GO
ALTER DATABASE [KLNTrain] SET COMPATIBILITY_LEVEL = 160
GO
ALTER DATABASE [KLNTrain] SET RECOVERY SIMPLE
GO
ALTER DATABASE [KLNTrain] SET MULTI_USER
GO

USE [KLNTrain]
GO

-- ============================================================
--  PHẦN 1: CẤU HÌNH HỆ THỐNG
-- ============================================================

CREATE TABLE [dbo].[SystemConfig] (
    [id_config]     INT IDENTITY(1,1) NOT NULL,
    [config_key]    VARCHAR(60)       NOT NULL,
    [config_value]  NVARCHAR(500)     NOT NULL,
    [kieu_du_lieu]  VARCHAR(20)       NOT NULL DEFAULT 'string', -- string|int|decimal|boolean|json
    [nhom]          VARCHAR(50)       NULL,
    [mo_ta]         NVARCHAR(300)     NULL,
    [co_the_sua]    BIT               NOT NULL DEFAULT 1,
    [ngay_cap_nhat] DATETIME          NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [PK_SystemConfig] PRIMARY KEY CLUSTERED ([id_config] ASC),
    CONSTRAINT [UQ_SystemConfig_Key] UNIQUE ([config_key])
)
GO

-- ============================================================
--  PHẦN 2: PHÂN QUYỀN (RBAC)
-- ============================================================

CREATE TABLE [dbo].[VaiTro] (
    [id_vai_tro]  INT IDENTITY(1,1) NOT NULL,
    [ma_vai_tro]  VARCHAR(30)       NOT NULL,
    [ten_vai_tro] NVARCHAR(100)     NOT NULL,
    [mo_ta]       NVARCHAR(500)     NULL,
    [trang_thai]  VARCHAR(20)       NOT NULL DEFAULT 'hoat_dong',
    CONSTRAINT [PK_VaiTro] PRIMARY KEY CLUSTERED ([id_vai_tro] ASC),
    CONSTRAINT [UQ_VaiTro_Ma] UNIQUE ([ma_vai_tro]),
    CONSTRAINT [CK_VaiTro_TrangThai] CHECK ([trang_thai] IN ('hoat_dong','khoa'))
)
GO

CREATE TABLE [dbo].[Quyen] (
    [id_quyen]   INT IDENTITY(1,1) NOT NULL,
    [ma_quyen]   VARCHAR(60)       NOT NULL,
    [ten_quyen]  NVARCHAR(150)     NOT NULL,
    [nhom_quyen] VARCHAR(50)       NULL,
    [mo_ta]      NVARCHAR(500)     NULL,
    CONSTRAINT [PK_Quyen] PRIMARY KEY CLUSTERED ([id_quyen] ASC),
    CONSTRAINT [UQ_Quyen_Ma] UNIQUE ([ma_quyen])
)
GO

CREATE TABLE [dbo].[VaiTroQuyen] (
    [id_vai_tro] INT NOT NULL,
    [id_quyen]   INT NOT NULL,
    CONSTRAINT [PK_VaiTroQuyen] PRIMARY KEY CLUSTERED ([id_vai_tro] ASC, [id_quyen] ASC),
    CONSTRAINT [FK_VTQ_VaiTro] FOREIGN KEY ([id_vai_tro]) REFERENCES [VaiTro]([id_vai_tro]),
    CONSTRAINT [FK_VTQ_Quyen]  FOREIGN KEY ([id_quyen])   REFERENCES [Quyen]([id_quyen])
)
GO

-- ============================================================
--  PHẦN 3: TÀI KHOẢN
-- ============================================================

CREATE TABLE [dbo].[TaiKhoan] (
    [id_tai_khoan]  INT IDENTITY(1,1)  NOT NULL,
    [email]         VARCHAR(100)        NOT NULL,
    [mat_khau]      VARCHAR(255)        NOT NULL,
    [ho_ten]        NVARCHAR(100)       NOT NULL,
    [so_dien_thoai] VARCHAR(15)         NULL,
    [ngay_sinh]     DATE                NULL,
    [gioi_tinh]     VARCHAR(10)         NULL,
    [vai_tro]       VARCHAR(20)         NOT NULL DEFAULT 'khach_hang', -- legacy, dùng TaiKhoanVaiTro
    [trang_thai]    VARCHAR(20)         NOT NULL DEFAULT 'hoat_dong',
    [ngay_tao]      DATETIME            NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [PK_TaiKhoan]          PRIMARY KEY CLUSTERED ([id_tai_khoan] ASC),
    CONSTRAINT [UQ_TaiKhoan_Email]    UNIQUE ([email]),
    CONSTRAINT [CK_TaiKhoan_GioiTinh] CHECK ([gioi_tinh] IN ('nam','nu') OR [gioi_tinh] IS NULL),
    CONSTRAINT [CK_TaiKhoan_TrangThai] CHECK ([trang_thai] IN ('hoat_dong','bi_khoa')),
    CONSTRAINT [CK_TaiKhoan_VaiTro]   CHECK ([vai_tro] IN ('quan_tri','nhan_vien','khach_hang'))
)
GO

CREATE TABLE [dbo].[TaiKhoanVaiTro] (
    [id_tai_khoan]  INT      NOT NULL,
    [id_vai_tro]    INT      NOT NULL,
    [nguoi_cap]     INT      NULL,
    [ngay_tao]      DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [PK_TaiKhoanVaiTro] PRIMARY KEY CLUSTERED ([id_tai_khoan] ASC, [id_vai_tro] ASC),
    CONSTRAINT [FK_TKVT_TK]  FOREIGN KEY ([id_tai_khoan]) REFERENCES [TaiKhoan]([id_tai_khoan]),
    CONSTRAINT [FK_TKVT_VT]  FOREIGN KEY ([id_vai_tro])   REFERENCES [VaiTro]([id_vai_tro]),
    CONSTRAINT [FK_TKVT_Cap] FOREIGN KEY ([nguoi_cap])    REFERENCES [TaiKhoan]([id_tai_khoan])
)
GO

-- ============================================================
--  PHẦN 4: HẠ TẦNG TÀU / GA
-- ============================================================

CREATE TABLE [dbo].[GaTau] (
    [id_ga]             INT IDENTITY(1,1) NOT NULL,
    [ma_ga_viet_tat]    VARCHAR(10)       NOT NULL,
    [ten_ga]            NVARCHAR(50)      NOT NULL,
    [tinh_thanh]        NVARCHAR(50)      NULL,
    [thu_tu_tuyen]      INT               NOT NULL,
    [vi_do]             DECIMAL(10,6)     NULL,
    [kinh_do]           DECIMAL(10,6)     NULL,
    [do_uu_tien]        INT               NOT NULL DEFAULT 50,
    [trang_thai]        VARCHAR(15)       NOT NULL DEFAULT 'hoat_dong',
    CONSTRAINT [PK_GaTau]           PRIMARY KEY CLUSTERED ([id_ga] ASC),
    CONSTRAINT [UQ_GaTau_Ma]        UNIQUE ([ma_ga_viet_tat]),
    CONSTRAINT [CK_GaTau_TrangThai] CHECK ([trang_thai] IN ('hoat_dong','tam_dung'))
)
GO

CREATE TABLE [dbo].[Tau] (
    [id_tau]     INT IDENTITY(1,1) NOT NULL,
    [so_hieu]    VARCHAR(20)       NOT NULL,
    [ten_tau]    NVARCHAR(100)     NULL,
    [so_toa]     INT               NOT NULL,
    [trang_thai] VARCHAR(20)       NOT NULL DEFAULT 'hoat_dong',
    CONSTRAINT [PK_Tau]           PRIMARY KEY CLUSTERED ([id_tau] ASC),
    CONSTRAINT [UQ_Tau_SoHieu]    UNIQUE ([so_hieu]),
    CONSTRAINT [CK_Tau_TrangThai] CHECK ([trang_thai] IN ('hoat_dong','bao_tri','ngung'))
)
GO

CREATE TABLE [dbo].[LoaiToa] (
    [id_loai_toa]    INT IDENTITY(1,1) NOT NULL,
    [ma_loai_toa]    VARCHAR(20)       NOT NULL,
    [ten_loai_toa]   NVARCHAR(100)     NOT NULL,
    [loai_ghe_chinh] VARCHAR(20)       NOT NULL,
    [so_cho_toi_da]  INT               NOT NULL,
    CONSTRAINT [PK_LoaiToa]        PRIMARY KEY CLUSTERED ([id_loai_toa] ASC),
    CONSTRAINT [UQ_LoaiToa_Ma]     UNIQUE ([ma_loai_toa])
)
GO

CREATE TABLE [dbo].[LoaiGhe] (
    [id_loai_ghe]  INT IDENTITY(1,1) NOT NULL,
    [ma_loai_ghe]  VARCHAR(15)       NOT NULL,
    [id_loai_toa]  INT               NOT NULL,
    [ten_loai_ghe] NVARCHAR(150)     NOT NULL,
    [he_so_gia]    DECIMAL(4,2)      NOT NULL DEFAULT 1.00,
    [trang_thai]   VARCHAR(20)       NOT NULL DEFAULT 'dang_ban',
    CONSTRAINT [PK_LoaiGhe]        PRIMARY KEY CLUSTERED ([id_loai_ghe] ASC),
    CONSTRAINT [UQ_LoaiGhe_Ma]     UNIQUE ([ma_loai_ghe]),
    CONSTRAINT [FK_LoaiGhe_LoaiToa] FOREIGN KEY ([id_loai_toa]) REFERENCES [LoaiToa]([id_loai_toa]),
    CONSTRAINT [CK_LoaiGhe_TrangThai] CHECK ([trang_thai] IN ('dang_ban','ngung_ban'))
)
GO

-- Template: cấu hình toa/ghế mặc định của từng loại tàu
CREATE TABLE [dbo].[CauHinhToa] (
    [id_cau_hinh_toa] INT IDENTITY(1,1) NOT NULL,
    [id_tau]          INT               NOT NULL,
    [so_toa_thu_tu]   INT               NOT NULL,
    [id_loai_toa]     INT               NOT NULL,
    CONSTRAINT [PK_CauHinhToa]         PRIMARY KEY CLUSTERED ([id_cau_hinh_toa] ASC),
    CONSTRAINT [UK_CauHinhToa_Tau_Toa] UNIQUE ([id_tau],[so_toa_thu_tu]),
    CONSTRAINT [FK_CHT_Tau]     FOREIGN KEY ([id_tau])      REFERENCES [Tau]([id_tau]),
    CONSTRAINT [FK_CHT_LoaiToa] FOREIGN KEY ([id_loai_toa]) REFERENCES [LoaiToa]([id_loai_toa])
)
GO

CREATE TABLE [dbo].[CauHinhGhe] (
    [id_cau_hinh_ghe]  INT IDENTITY(1,1) NOT NULL,
    [id_loai_toa]      INT               NOT NULL,
    [so_ghe_trong_toa] INT               NOT NULL,
    [id_loai_ghe]      INT               NOT NULL,
    [vi_tri]           NVARCHAR(100)     NULL,
    [tang]             VARCHAR(10)       NULL,
    [khoang_so]        INT               NULL,
    [ben]              NVARCHAR(10)      NULL,
    CONSTRAINT [PK_CauHinhGhe]            PRIMARY KEY CLUSTERED ([id_cau_hinh_ghe] ASC),
    CONSTRAINT [UK_CauHinhGhe_LoaiToa_So] UNIQUE ([id_loai_toa],[so_ghe_trong_toa]),
    CONSTRAINT [FK_CHG_LoaiToa] FOREIGN KEY ([id_loai_toa])  REFERENCES [LoaiToa]([id_loai_toa]),
    CONSTRAINT [FK_CHG_LoaiGhe] FOREIGN KEY ([id_loai_ghe])  REFERENCES [LoaiGhe]([id_loai_ghe]),
    CONSTRAINT [CK_CHG_Tang] CHECK ([tang] IN ('Tren','Giua','Duoi') OR [tang] IS NULL),
    CONSTRAINT [CK_CHG_Ben]  CHECK ([ben] IN ('A','B','T','P')       OR [ben]  IS NULL)
)
GO

-- ============================================================
--  PHẦN 5: LỊCH CHẠY (TEMPLATE)
-- ============================================================

CREATE TABLE [dbo].[LichChay] (
    [id_lich_chay]      INT IDENTITY(1,1) NOT NULL,
    [id_tau]            INT               NOT NULL,
    [id_ga_di]          INT               NOT NULL,
    [id_ga_den]         INT               NOT NULL,
    [gio_khoi_hanh]     TIME(0)           NOT NULL,
    [gio_du_kien_den]   TIME(0)           NOT NULL,
    [thu_trong_tuan]    NVARCHAR(50)      NULL,
    CONSTRAINT [PK_LichChay]             PRIMARY KEY CLUSTERED ([id_lich_chay] ASC),
    CONSTRAINT [FK_LC_Tau]   FOREIGN KEY ([id_tau])    REFERENCES [Tau]([id_tau]),
    CONSTRAINT [FK_LC_GaDi]  FOREIGN KEY ([id_ga_di])  REFERENCES [GaTau]([id_ga]),
    CONSTRAINT [FK_LC_GaDen] FOREIGN KEY ([id_ga_den]) REFERENCES [GaTau]([id_ga])
)
GO

CREATE TABLE [dbo].[LichTrinhChuyen] (
    [id_lich_trinh]    INT IDENTITY(1,1) NOT NULL,
    [id_lich_chay]     INT               NOT NULL,
    [id_ga]            INT               NOT NULL,
    [thu_tu_dung]      INT               NOT NULL,
    [gio_den]          TIME(0)           NOT NULL,
    [gio_di]           TIME(0)           NOT NULL,
    [khoang_cach_km]   DECIMAL(8,2)      NOT NULL DEFAULT 0,
    [thoi_gian_dung]   INT               NOT NULL DEFAULT 0,
    CONSTRAINT [PK_LichTrinhChuyen]            PRIMARY KEY CLUSTERED ([id_lich_trinh] ASC),
    CONSTRAINT [UK_LTC_LichChay_Ga]            UNIQUE ([id_lich_chay],[id_ga]),
    CONSTRAINT [FK_LTC_LichChay] FOREIGN KEY ([id_lich_chay]) REFERENCES [LichChay]([id_lich_chay]),
    CONSTRAINT [FK_LTC_Ga]       FOREIGN KEY ([id_ga])        REFERENCES [GaTau]([id_ga])
)
GO

-- ============================================================
--  PHẦN 6: CHUYẾN TÀU (RUNTIME)
-- ============================================================

CREATE TABLE [dbo].[ChuyenTau] (
    [id_chuyen]    INT IDENTITY(1,1) NOT NULL,
    [id_lich_chay] INT               NOT NULL,
    [ngay_chay]    DATE              NOT NULL,
    [trang_thai]   VARCHAR(25)       NOT NULL DEFAULT 'dung_gio',
    [ghi_chu]      NVARCHAR(500)     NULL,
    CONSTRAINT [PK_ChuyenTau]            PRIMARY KEY CLUSTERED ([id_chuyen] ASC),
    CONSTRAINT [UK_ChuyenTau_Lich_Ngay]  UNIQUE ([id_lich_chay],[ngay_chay]),
    CONSTRAINT [FK_CT_LichChay] FOREIGN KEY ([id_lich_chay]) REFERENCES [LichChay]([id_lich_chay]),
    CONSTRAINT [CK_ChuyenTau_TrangThai]  CHECK ([trang_thai] IN ('dung_gio','tre_gio','da_chay','huy'))
)
GO

-- *** MỚI: ToaChuyen – thành phần toa RUNTIME cho từng chuyến ***
CREATE TABLE [dbo].[ToaChuyen] (
    [id_toa_chuyen] INT IDENTITY(1,1) NOT NULL,
    [id_chuyen]     INT               NOT NULL,
    [so_toa_thu_tu] INT               NOT NULL,
    [id_loai_toa]   INT               NOT NULL,
    [so_ghe_toi_da] INT               NOT NULL,
    [trang_thai]    VARCHAR(20)       NOT NULL DEFAULT 'hoat_dong',
    [ghi_chu]       NVARCHAR(500)     NULL,
    CONSTRAINT [PK_ToaChuyen]         PRIMARY KEY CLUSTERED ([id_toa_chuyen] ASC),
    CONSTRAINT [UK_ToaChuyen_CT_Toa]  UNIQUE ([id_chuyen],[so_toa_thu_tu]),
    CONSTRAINT [FK_TC_Chuyen]  FOREIGN KEY ([id_chuyen])   REFERENCES [ChuyenTau]([id_chuyen]),
    CONSTRAINT [FK_TC_LoaiToa] FOREIGN KEY ([id_loai_toa]) REFERENCES [LoaiToa]([id_loai_toa]),
    CONSTRAINT [CK_ToaChuyen_TrangThai] CHECK ([trang_thai] IN ('hoat_dong','bao_tri','khong_kha_dung'))
)
GO

-- *** MỚI: GheChuyen – trạng thái ghế RUNTIME cho từng chuyến ***
CREATE TABLE [dbo].[GheChuyen] (
    [id_ghe_chuyen]    INT IDENTITY(1,1) NOT NULL,
    [id_toa_chuyen]    INT               NOT NULL,
    [so_ghe_trong_toa] INT               NOT NULL,
    [id_loai_ghe]      INT               NULL,
    [trang_thai]       VARCHAR(20)       NOT NULL DEFAULT 'trong',
    -- 'trong' | 'da_dat' | 'dang_giu' | 'khong_kha_dung'
    CONSTRAINT [PK_GheChuyen]           PRIMARY KEY CLUSTERED ([id_ghe_chuyen] ASC),
    CONSTRAINT [UK_GheChuyen_Toa_So]    UNIQUE ([id_toa_chuyen],[so_ghe_trong_toa]),
    CONSTRAINT [FK_GC_ToaChuyen] FOREIGN KEY ([id_toa_chuyen]) REFERENCES [ToaChuyen]([id_toa_chuyen]),
    CONSTRAINT [FK_GC_LoaiGhe]   FOREIGN KEY ([id_loai_ghe])   REFERENCES [LoaiGhe]([id_loai_ghe]),
    CONSTRAINT [CK_GheChuyen_TrangThai] CHECK ([trang_thai] IN ('trong','da_dat','dang_giu','khong_kha_dung'))
)
GO

-- *** MỚI: ChangTauHanhTrinh – từng chặng ghép trên một chuyến ***
-- Mục đích: quản lý ghế theo chặng (Segment Seat)
-- Ví dụ HN->Vinh, ghế A1 bán HN->Nam Định rồi có thể bán lại Nam Định->Vinh
CREATE TABLE [dbo].[ChangTauHanhTrinh] (
    [id_chang]          INT IDENTITY(1,1) NOT NULL,
    [id_chuyen]         INT               NOT NULL,
    [id_ga_di]          INT               NOT NULL,
    [id_ga_den]         INT               NOT NULL,
    [thu_tu_chang]      INT               NOT NULL,
    [khoang_cach_km]    DECIMAL(10,2)     NOT NULL DEFAULT 0,
    [thoi_gian_chay_phut] INT             NOT NULL DEFAULT 0,
    CONSTRAINT [PK_ChangTau]     PRIMARY KEY CLUSTERED ([id_chang] ASC),
    CONSTRAINT [FK_CHG_Chuyen]   FOREIGN KEY ([id_chuyen]) REFERENCES [ChuyenTau]([id_chuyen]),
    CONSTRAINT [FK_CHG_GaDi2]    FOREIGN KEY ([id_ga_di])  REFERENCES [GaTau]([id_ga]),
    CONSTRAINT [FK_CHG_GaDen2]   FOREIGN KEY ([id_ga_den]) REFERENCES [GaTau]([id_ga])
)
GO

-- *** MỚI: LichTrinhThucTe – giờ đến/đi thực tế, hỗ trợ theo dõi delay ***
CREATE TABLE [dbo].[LichTrinhThucTe] (
    [id_lt_thuc_te]     INT IDENTITY(1,1) NOT NULL,
    [id_chuyen]         INT               NOT NULL,
    [id_ga]             INT               NOT NULL,
    [thu_tu_dung]       INT               NOT NULL,
    [gio_den_du_kien]   TIME(0)           NULL,
    [gio_di_du_kien]    TIME(0)           NULL,
    [gio_den_thuc_te]   DATETIME          NULL,
    [gio_di_thuc_te]    DATETIME          NULL,
    [delay_den_phut]    INT               NOT NULL DEFAULT 0,
    [delay_di_phut]     INT               NOT NULL DEFAULT 0,
    [trang_thai]        VARCHAR(20)       NOT NULL DEFAULT 'chua_toi',
    -- 'chua_toi'|'dang_den'|'dung_gio'|'tre_gio'|'da_qua'|'huy'
    [ghi_chu]           NVARCHAR(500)     NULL,
    CONSTRAINT [PK_LTTT]          PRIMARY KEY CLUSTERED ([id_lt_thuc_te] ASC),
    CONSTRAINT [UK_LTTT_CT_Ga]    UNIQUE ([id_chuyen],[id_ga]),
    CONSTRAINT [FK_LTTT_Chuyen] FOREIGN KEY ([id_chuyen]) REFERENCES [ChuyenTau]([id_chuyen]),
    CONSTRAINT [FK_LTTT_Ga]     FOREIGN KEY ([id_ga])     REFERENCES [GaTau]([id_ga]),
    CONSTRAINT [CK_LTTT_TrangThai] CHECK ([trang_thai] IN
        ('chua_toi','dang_den','dung_gio','tre_gio','da_qua','huy'))
)
GO

-- *** MỚI: DieuPhoi – log điều phối (delay, hủy, bảo trì, thêm/bớt toa) ***
CREATE TABLE [dbo].[DieuPhoi] (
    [id_dieu_phoi]    INT IDENTITY(1,1) NOT NULL,
    [id_chuyen]       INT               NOT NULL,
    [loai_su_kien]    VARCHAR(30)       NOT NULL,
    -- 'delay'|'cancel'|'maintenance'|'them_toa'|'bot_toa'|'doi_toa'
    [mo_ta]           NVARCHAR(1000)    NULL,
    [id_ga_anh_huong] INT               NULL,
    [delay_phut]      INT               NULL,
    [nguoi_tao]       INT               NOT NULL,
    [thoi_gian_tao]   DATETIME          NOT NULL DEFAULT GETDATE(),
    [trang_thai]      VARCHAR(20)       NOT NULL DEFAULT 'hieu_luc',
    CONSTRAINT [PK_DieuPhoi]         PRIMARY KEY CLUSTERED ([id_dieu_phoi] ASC),
    CONSTRAINT [FK_DP_Chuyen]  FOREIGN KEY ([id_chuyen])        REFERENCES [ChuyenTau]([id_chuyen]),
    CONSTRAINT [FK_DP_Ga]      FOREIGN KEY ([id_ga_anh_huong])  REFERENCES [GaTau]([id_ga]),
    CONSTRAINT [FK_DP_NguoiTao] FOREIGN KEY ([nguoi_tao])       REFERENCES [TaiKhoan]([id_tai_khoan]),
    CONSTRAINT [CK_DP_LoaiSuKien] CHECK ([loai_su_kien] IN
        ('delay','cancel','maintenance','them_toa','bot_toa','doi_toa','other'))
)
GO

-- ============================================================
--  PHẦN 7: GIÁ VÉ / CHÍNH SÁCH
-- ============================================================

CREATE TABLE [dbo].[BieuGia] (
    [id_bieu_gia]       INT IDENTITY(1,1) NOT NULL,
    [ten_dip]           NVARCHAR(150)     NOT NULL,
    [ngay_bat_dau]      DATE              NOT NULL,
    [ngay_ket_thuc]     DATE              NOT NULL,
    [he_so_tang]        DECIMAL(4,2)      NOT NULL DEFAULT 1.00,
    [don_gia_km_goc]    DECIMAL(12,2)     NOT NULL,
    [id_loai_ghe]       INT               NULL,
    [trang_thai]        VARCHAR(25)       NOT NULL DEFAULT 'dang_ap_dung',
    CONSTRAINT [PK_BieuGia] PRIMARY KEY CLUSTERED ([id_bieu_gia] ASC),
    CONSTRAINT [FK_BG_LoaiGhe] FOREIGN KEY ([id_loai_ghe]) REFERENCES [LoaiGhe]([id_loai_ghe]),
    CONSTRAINT [CK_BieuGia_TrangThai] CHECK ([trang_thai] IN ('dang_ap_dung','ngung_ap_dung'))
)
GO

CREATE TABLE [dbo].[ChinhSachGia] (
    [id_chinh_sach]    INT IDENTITY(1,1) NOT NULL,
    [ten_chinh_sach]   NVARCHAR(150)     NOT NULL,
    [loai_hanh_khach]  VARCHAR(25)       NOT NULL,
    [phan_tram_giam]   DECIMAL(5,2)      NOT NULL DEFAULT 0,
    [tu_ngay]          DATE              NULL,
    [den_ngay]         DATE              NULL,
    CONSTRAINT [PK_ChinhSachGia] PRIMARY KEY CLUSTERED ([id_chinh_sach] ASC),
    CONSTRAINT [CK_CSG_LoaiHK] CHECK ([loai_hanh_khach] IN
        ('nguoi_lon','tre_em','nguoi_cao_tuoi','sinh_vien'))
)
GO

CREATE TABLE [dbo].[ChinhSachHuy] (
    [id_cs_huy]           INT IDENTITY(1,1) NOT NULL,
    [gio_truoc_gio_chay]  INT               NOT NULL,
    [phi_huy]             DECIMAL(5,2)      NOT NULL,
    CONSTRAINT [PK_ChinhSachHuy] PRIMARY KEY CLUSTERED ([id_cs_huy] ASC)
)
GO

CREATE TABLE [dbo].[KhuyenMai] (
    [id_khuyen_mai]         INT IDENTITY(1,1) NOT NULL,
    [ma_khuyen_mai]         VARCHAR(30)       NOT NULL,
    [mo_ta]                 NVARCHAR(255)     NULL,
    [loai_giam]             VARCHAR(20)       NOT NULL,
    [gia_tri]               DECIMAL(15,2)     NOT NULL,
    [gia_tri_don_toi_thieu] DECIMAL(15,2)     NOT NULL DEFAULT 0,
    [giam_toi_da]           DECIMAL(15,2)     NULL,
    [so_luong]              INT               NULL,
    [da_dung]               INT               NOT NULL DEFAULT 0,
    [ngay_bat_dau]          DATE              NOT NULL,
    [ngay_het_han]          DATE              NOT NULL,
    [ap_dung_cho]           VARCHAR(30)       NULL DEFAULT 'tat_ca',
    CONSTRAINT [PK_KhuyenMai]      PRIMARY KEY CLUSTERED ([id_khuyen_mai] ASC),
    CONSTRAINT [UQ_KhuyenMai_Ma]   UNIQUE ([ma_khuyen_mai]),
    CONSTRAINT [CK_KM_LoaiGiam]    CHECK ([loai_giam] IN ('phan_tram','so_tien')),
    CONSTRAINT [CK_KM_ApDungCho]   CHECK ([ap_dung_cho] IN ('tat_ca','nguoi_moi','thanh_vien'))
)
GO

-- ============================================================
--  PHẦN 8: ĐẶT VÉ
-- ============================================================

CREATE TABLE [dbo].[HanhKhach] (
    [id_hanh_khach]  INT IDENTITY(1,1) NOT NULL,
    [id_tai_khoan]   INT               NULL,
    [ho_ten]         NVARCHAR(150)     NOT NULL,
    [ngay_sinh]      DATE              NOT NULL,
    [cccd]           VARCHAR(20)       NULL,
    [loai_hanh_khach] VARCHAR(20)      NOT NULL DEFAULT 'nguoi_lon',
    [so_dien_thoai]  VARCHAR(15)       NULL,
    [la_chinh]       BIT               NOT NULL DEFAULT 0,
    CONSTRAINT [PK_HanhKhach]          PRIMARY KEY CLUSTERED ([id_hanh_khach] ASC),
    CONSTRAINT [FK_HK_TaiKhoan] FOREIGN KEY ([id_tai_khoan]) REFERENCES [TaiKhoan]([id_tai_khoan]),
    CONSTRAINT [CK_HK_LoaiHK] CHECK ([loai_hanh_khach] IN
        ('nguoi_lon','tre_em','nguoi_cao_tuoi','sinh_vien'))
)
GO

CREATE TABLE [dbo].[DonDatVe] (
    [id_don_dat_ve]    INT IDENTITY(1,1) NOT NULL,
    [ma_don]           VARCHAR(20)       NOT NULL,
    [ma_dat_cho]       VARCHAR(20)       NOT NULL,
    [id_tai_khoan]     INT               NULL,
    [ho_ten_lien_lac]  NVARCHAR(100)     NOT NULL,
    [email_dat_cho]    VARCHAR(255)      NOT NULL,
    [sdt_dat_cho]      VARCHAR(15)       NOT NULL,
    [cccd]             VARCHAR(20)       NOT NULL DEFAULT '000000000',
    [loai_ve]          VARCHAR(15)       NOT NULL,
    [tong_tien]        DECIMAL(15,2)     NOT NULL,
    [tien_giam]        DECIMAL(15,2)     NOT NULL DEFAULT 0,
    [tien_thanh_toan]  DECIMAL(15,2)     NOT NULL,
    [id_khuyen_mai]    INT               NULL,
    [trang_thai]       VARCHAR(25)       NOT NULL DEFAULT 'cho_thanh_toan',
    [thoi_gian_dat]    DATETIME          NOT NULL DEFAULT GETDATE(),
    [thoi_gian_het_han] DATETIME         NOT NULL,
    CONSTRAINT [PK_DonDatVe]           PRIMARY KEY CLUSTERED ([id_don_dat_ve] ASC),
    CONSTRAINT [UQ_DonDatVe_MaDon]     UNIQUE ([ma_don]),
    CONSTRAINT [UQ_DonDatVe_MaDatCho]  UNIQUE ([ma_dat_cho]),
    CONSTRAINT [FK_DDV_TaiKhoan]   FOREIGN KEY ([id_tai_khoan]) REFERENCES [TaiKhoan]([id_tai_khoan]),
    CONSTRAINT [FK_DDV_KhuyenMai]  FOREIGN KEY ([id_khuyen_mai]) REFERENCES [KhuyenMai]([id_khuyen_mai]),
    CONSTRAINT [CK_DDV_LoaiVe]    CHECK ([loai_ve] IN ('mot_chieu','khu_hoi')),
    CONSTRAINT [CK_DDV_TrangThai] CHECK ([trang_thai] IN
        ('cho_thanh_toan','da_thanh_toan','da_huy','het_han'))
)
GO

CREATE TABLE [dbo].[Ve] (
    [id_ve]            INT IDENTITY(1,1) NOT NULL,
    [id_don_dat_ve]    INT               NOT NULL,
    [id_hanh_khach]    INT               NOT NULL,
    [id_chuyen]        INT               NOT NULL,
    [so_toa_thu_tu]    INT               NOT NULL,
    [so_ghe_trong_toa] INT               NOT NULL,
    [id_ga_len]        INT               NOT NULL,
    [id_ga_xuong]      INT               NOT NULL,
    [loai_hanh_khach]  VARCHAR(25)       NOT NULL,
    [gia_ve]           DECIMAL(15,2)     NOT NULL,
    [qr_ve]            NVARCHAR(MAX)     NULL,
    [trang_thai]       VARCHAR(25)       NOT NULL DEFAULT 'cho_xac_nhan',
    [ngay_xuat_ve]     DATETIME          NOT NULL DEFAULT GETDATE(),
    [id_cs_huy]        INT               NULL,
    CONSTRAINT [PK_Ve]              PRIMARY KEY CLUSTERED ([id_ve] ASC),
    CONSTRAINT [FK_Ve_DonDatVe]     FOREIGN KEY ([id_don_dat_ve])   REFERENCES [DonDatVe]([id_don_dat_ve]),
    CONSTRAINT [FK_Ve_HanhKhach]    FOREIGN KEY ([id_hanh_khach])   REFERENCES [HanhKhach]([id_hanh_khach]),
    CONSTRAINT [FK_Ve_ChuyenTau]    FOREIGN KEY ([id_chuyen])       REFERENCES [ChuyenTau]([id_chuyen]),
    CONSTRAINT [FK_Ve_GaLen]        FOREIGN KEY ([id_ga_len])       REFERENCES [GaTau]([id_ga]),
    CONSTRAINT [FK_Ve_GaXuong]      FOREIGN KEY ([id_ga_xuong])     REFERENCES [GaTau]([id_ga]),
    CONSTRAINT [FK_Ve_ChinhSachHuy] FOREIGN KEY ([id_cs_huy])       REFERENCES [ChinhSachHuy]([id_cs_huy]),
    CONSTRAINT [CK_Ve_TrangThai]    CHECK ([trang_thai] IN
        ('cho_xac_nhan','da_xac_nhan','da_huy','da_doi','da_su_dung')),
    CONSTRAINT [CK_Ve_LoaiHK]       CHECK ([loai_hanh_khach] IN
        ('nguoi_lon','tre_em','nguoi_cao_tuoi','sinh_vien')),
    CONSTRAINT [CK_Ve_QrVe]         CHECK (ISJSON([qr_ve]) = 1 OR [qr_ve] IS NULL)
)
GO

-- Unique: mỗi (chuyến, toa, ghế) chỉ có 1 vé hiệu lực
CREATE UNIQUE NONCLUSTERED INDEX [UK_Ve_Active_Chuyen_Toa_Ghe]
    ON [dbo].[Ve]([id_chuyen],[so_toa_thu_tu],[so_ghe_trong_toa])
    WHERE ([trang_thai] NOT IN ('da_huy','da_doi'))
GO

-- ============================================================
--  PHẦN 9: GIỮ GHẾ TẠM
-- ============================================================

CREATE TABLE [dbo].[TamGiuGhe] (
    [id_giu]              INT IDENTITY(1,1) NOT NULL,
    [id_chuyen]           INT               NOT NULL,
    [so_toa_thu_tu]       INT               NOT NULL,
    [so_ghe_trong_toa]    INT               NOT NULL,
    [id_don_dat_ve]       INT               NULL,
    [id_tai_khoan]        INT               NULL,
    [session_id]          VARCHAR(100)      NULL,
    [trang_thai]          VARCHAR(20)       NOT NULL DEFAULT 'dang_giu',
    -- 'dang_giu'|'da_dat'|'da_giai_phong'|'het_han'
    [thoi_gian_giu]       DATETIME          NOT NULL DEFAULT GETDATE(),
    [thoi_gian_het_han]   DATETIME          NOT NULL,
    CONSTRAINT [PK_TamGiuGhe]       PRIMARY KEY CLUSTERED ([id_giu] ASC),
    CONSTRAINT [FK_TGG_Chuyen]      FOREIGN KEY ([id_chuyen])       REFERENCES [ChuyenTau]([id_chuyen]),
    CONSTRAINT [FK_TGG_Don]         FOREIGN KEY ([id_don_dat_ve])   REFERENCES [DonDatVe]([id_don_dat_ve]),
    CONSTRAINT [FK_TGG_TaiKhoan]    FOREIGN KEY ([id_tai_khoan])    REFERENCES [TaiKhoan]([id_tai_khoan]),
    CONSTRAINT [CK_TGG_TrangThai]   CHECK ([trang_thai] IN
        ('dang_giu','da_dat','da_giai_phong','het_han'))
)
GO

-- ============================================================
--  PHẦN 10: THANH TOÁN
-- ============================================================

CREATE TABLE [dbo].[ThanhToan] (
    [id_thanh_toan]          INT IDENTITY(1,1) NOT NULL,
    [ma_giao_dich]           VARCHAR(30)       NOT NULL,
    [id_don_dat_ve]          INT               NOT NULL,
    [phuong_thuc]            VARCHAR(30)       NOT NULL,
    [so_tien]                DECIMAL(15,2)     NOT NULL,
    [phi_giao_dich]          DECIMAL(15,2)     NOT NULL DEFAULT 0,
    [trang_thai]             VARCHAR(25)       NOT NULL,
    -- *** MỚI: trường hỗ trợ tích hợp payment gateway ***
    [payment_gateway]        VARCHAR(30)       NULL, -- 'vietqr'|'vnpay'|'momo'|'zalopay'
    [gateway_transaction_id] VARCHAR(100)      NULL,
    [gateway_response]       NVARCHAR(MAX)     NULL, -- JSON response từ gateway
    [ma_gd_ngan_hang]        VARCHAR(50)       NULL,
    [qr_thanh_toan]          NVARCHAR(MAX)     NULL,
    [url_thanh_toan]         VARCHAR(500)      NULL,
    [so_lan_thu]             INT               NOT NULL DEFAULT 1,
    [thoi_gian_tao]          DATETIME          NOT NULL DEFAULT GETDATE(),
    [thoi_gian_het_han]      DATETIME          NULL,
    [thoi_gian_thanh_toan]   DATETIME          NULL,
    CONSTRAINT [PK_ThanhToan]          PRIMARY KEY CLUSTERED ([id_thanh_toan] ASC),
    CONSTRAINT [UQ_ThanhToan_MaGD]     UNIQUE ([ma_giao_dich]),
    CONSTRAINT [FK_TT_DonDatVe] FOREIGN KEY ([id_don_dat_ve]) REFERENCES [DonDatVe]([id_don_dat_ve]),
    CONSTRAINT [CK_TT_PhuongThuc] CHECK ([phuong_thuc] IN
        ('tien_mat','the_ngan_hang','zalopay','momo','vnpay')),
    CONSTRAINT [CK_TT_TrangThai] CHECK ([trang_thai] IN
        ('dang_xu_ly','thanh_cong','that_bai','hoan_tien'))
)
GO

CREATE TABLE [dbo].[HoaDon] (
    [id_hoa_don]           INT IDENTITY(1,1) NOT NULL,
    [so_hoa_don]           VARCHAR(30)       NOT NULL,
    [id_don_dat_ve]        INT               NOT NULL,
    [id_thanh_toan]        INT               NOT NULL,
    [ho_ten_khach]         NVARCHAR(100)     NOT NULL,
    [email_khach]          VARCHAR(100)      NOT NULL,
    [tong_tien_truoc_giam] DECIMAL(15,2)     NOT NULL,
    [tien_giam]            DECIMAL(15,2)     NOT NULL DEFAULT 0,
    [tong_tien_thanh_toan] DECIMAL(15,2)     NOT NULL,
    [ngay_xuat]            DATETIME          NOT NULL DEFAULT GETDATE(),
    [da_gui_email]         BIT               NOT NULL DEFAULT 0,
    [trang_thai]           VARCHAR(20)       NOT NULL DEFAULT 'hop_le',
    CONSTRAINT [PK_HoaDon]        PRIMARY KEY CLUSTERED ([id_hoa_don] ASC),
    CONSTRAINT [UQ_HoaDon_SoHD]   UNIQUE ([so_hoa_don]),
    CONSTRAINT [FK_HD_DonDatVe]   FOREIGN KEY ([id_don_dat_ve]) REFERENCES [DonDatVe]([id_don_dat_ve]),
    CONSTRAINT [FK_HD_ThanhToan]  FOREIGN KEY ([id_thanh_toan]) REFERENCES [ThanhToan]([id_thanh_toan]),
    CONSTRAINT [CK_HD_TrangThai]  CHECK ([trang_thai] IN ('hop_le','da_huy'))
)
GO

CREATE TABLE [dbo].[HoanTien] (
    [id_hoan]              INT IDENTITY(1,1) NOT NULL,
    [id_ve]                INT               NOT NULL,
    [id_thanh_toan]        INT               NOT NULL,
    [tien_goc]             DECIMAL(15,2)     NOT NULL,
    [phi_huy]              DECIMAL(15,2)     NOT NULL DEFAULT 0,
    [tien_hoan]            DECIMAL(15,2)     NOT NULL,
    [ly_do]                NVARCHAR(500)     NULL,
    [phuong_thuc_hoan]     VARCHAR(25)       NULL,
    [ten_ngan_hang]        NVARCHAR(50)      NULL,
    [so_tai_khoan_hoan]    VARCHAR(30)       NULL,
    [trang_thai_hoan]      VARCHAR(25)       NOT NULL DEFAULT 'cho_xu_ly',
    [thoi_gian_hoan]       DATETIME          NOT NULL DEFAULT GETDATE(),
    [thoi_gian_hoan_xong]  DATETIME          NULL,
    CONSTRAINT [PK_HoanTien]       PRIMARY KEY CLUSTERED ([id_hoan] ASC),
    CONSTRAINT [FK_HT_Ve]          FOREIGN KEY ([id_ve])           REFERENCES [Ve]([id_ve]),
    CONSTRAINT [FK_HT_ThanhToan]   FOREIGN KEY ([id_thanh_toan])   REFERENCES [ThanhToan]([id_thanh_toan]),
    CONSTRAINT [CK_HT_PhuongThuc]  CHECK ([phuong_thuc_hoan] IN ('nguon_goc','ngan_hang','vi_dien_tu') OR [phuong_thuc_hoan] IS NULL),
    CONSTRAINT [CK_HT_TrangThai]   CHECK ([trang_thai_hoan] IN ('cho_xu_ly','dang_xu_ly','hoan_thanh','that_bai'))
)
GO

CREATE TABLE [dbo].[DoiVe] (
    [id_doi]          INT IDENTITY(1,1) NOT NULL,
    [id_ve_cu]        INT               NOT NULL,
    [id_ve_moi]       INT               NOT NULL,
    [phi_doi]         DECIMAL(15,2)     NOT NULL DEFAULT 0,
    [chenh_lech_gia]  DECIMAL(15,2)     NOT NULL DEFAULT 0,
    [tong_phai_tra]   DECIMAL(15,2)     NOT NULL DEFAULT 0,
    [id_thanh_toan]   INT               NULL,
    [trang_thai]      VARCHAR(20)       NOT NULL DEFAULT 'da_doi',
    [thoi_gian_doi]   DATETIME          NOT NULL DEFAULT GETDATE(),
    [ghi_chu]         NVARCHAR(500)     NULL,
    CONSTRAINT [PK_DoiVe]         PRIMARY KEY CLUSTERED ([id_doi] ASC),
    CONSTRAINT [UQ_DoiVe_VeCu]    UNIQUE ([id_ve_cu]),
    CONSTRAINT [FK_DV_VeCu]       FOREIGN KEY ([id_ve_cu])       REFERENCES [Ve]([id_ve]),
    CONSTRAINT [FK_DV_VeMoi]      FOREIGN KEY ([id_ve_moi])      REFERENCES [Ve]([id_ve]),
    CONSTRAINT [FK_DV_ThanhToan]  FOREIGN KEY ([id_thanh_toan])  REFERENCES [ThanhToan]([id_thanh_toan]),
    CONSTRAINT [CK_DoiVe_TrangThai] CHECK ([trang_thai] IN ('da_doi','huy'))
)
GO

-- ============================================================
--  PHẦN 11: CHECK-IN QR  (MỚI)
-- ============================================================

CREATE TABLE [dbo].[CheckIn] (
    [id_checkin]       INT IDENTITY(1,1) NOT NULL,
    [id_ve]            INT               NOT NULL,
    [id_ga]            INT               NOT NULL,
    [thoi_gian]        DATETIME          NOT NULL DEFAULT GETDATE(),
    [phuong_thuc]      VARCHAR(20)       NOT NULL DEFAULT 'qr',
    -- 'qr'|'manual'|'nfc'
    [ket_qua]          VARCHAR(25)       NOT NULL,
    -- 'hop_le'|'khong_hop_le'|'da_checkin'|'sai_ga'|'qua_han'|'da_huy'
    [nhan_vien_id]     INT               NULL,
    [thiet_bi]         VARCHAR(100)      NULL,
    [ghi_chu]          NVARCHAR(500)     NULL,
    CONSTRAINT [PK_CheckIn]       PRIMARY KEY CLUSTERED ([id_checkin] ASC),
    CONSTRAINT [FK_CI_Ve]         FOREIGN KEY ([id_ve])         REFERENCES [Ve]([id_ve]),
    CONSTRAINT [FK_CI_Ga]         FOREIGN KEY ([id_ga])         REFERENCES [GaTau]([id_ga]),
    CONSTRAINT [FK_CI_NhanVien]   FOREIGN KEY ([nhan_vien_id])  REFERENCES [TaiKhoan]([id_tai_khoan]),
    CONSTRAINT [CK_CI_PhuongThuc] CHECK ([phuong_thuc] IN ('qr','manual','nfc')),
    CONSTRAINT [CK_CI_KetQua]     CHECK ([ket_qua] IN
        ('hop_le','khong_hop_le','da_checkin','sai_ga','qua_han','da_huy'))
)
GO

-- ============================================================
--  PHẦN 12: TIỆN ÍCH
-- ============================================================

CREATE TABLE [dbo].[DonKhuHoi] (
    [id_don_di]  INT NOT NULL,
    [id_don_ve]  INT NOT NULL,
    CONSTRAINT [PK_DonKhuHoi] PRIMARY KEY CLUSTERED ([id_don_di] ASC,[id_don_ve] ASC),
    CONSTRAINT [FK_DKH_Di]  FOREIGN KEY ([id_don_di]) REFERENCES [DonDatVe]([id_don_dat_ve]),
    CONSTRAINT [FK_DKH_Ve2] FOREIGN KEY ([id_don_ve]) REFERENCES [DonDatVe]([id_don_dat_ve])
)
GO

CREATE TABLE [dbo].[PhanHoi] (
    [id_phan_hoi]   INT IDENTITY(1,1) NOT NULL,
    [id_ve]         INT               NOT NULL,
    [id_tai_khoan]  INT               NULL,
    [so_sao]        TINYINT           NOT NULL,
    [noi_dung]      NVARCHAR(MAX)     NULL,
    [loai_phan_hoi] VARCHAR(30)       NOT NULL DEFAULT 'chung',
    [trang_thai]    VARCHAR(25)       NOT NULL DEFAULT 'cho_duyet',
    [thoi_gian_gui] DATETIME          NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [PK_PhanHoi]          PRIMARY KEY CLUSTERED ([id_phan_hoi] ASC),
    CONSTRAINT [UQ_PhanHoi_Ve]       UNIQUE ([id_ve]),
    CONSTRAINT [FK_PH_Ve]            FOREIGN KEY ([id_ve])        REFERENCES [Ve]([id_ve]),
    CONSTRAINT [FK_PH_TaiKhoan]      FOREIGN KEY ([id_tai_khoan]) REFERENCES [TaiKhoan]([id_tai_khoan]),
    CONSTRAINT [CK_PH_SoSao]         CHECK ([so_sao] >= 1 AND [so_sao] <= 5),
    CONSTRAINT [CK_PH_LoaiPhanHoi]   CHECK ([loai_phan_hoi] IN ('chung','dich_vu','ve_sinh','dung_gio')),
    CONSTRAINT [CK_PH_TrangThai]     CHECK ([trang_thai] IN ('cho_duyet','da_duyet','an'))
)
GO

CREATE TABLE [dbo].[ThongBao] (
    [id_thong_bao]  INT IDENTITY(1,1) NOT NULL,
    [id_tai_khoan]  INT               NOT NULL,
    [tieu_de]       NVARCHAR(200)     NOT NULL,
    [noi_dung]      NVARCHAR(MAX)     NOT NULL,
    [loai]          VARCHAR(30)       NOT NULL DEFAULT 'he_thong',
    [da_doc]        BIT               NOT NULL DEFAULT 0,
    [lien_ket]      VARCHAR(255)      NULL,
    [thoi_gian_tao] DATETIME          NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [PK_ThongBao]         PRIMARY KEY CLUSTERED ([id_thong_bao] ASC),
    CONSTRAINT [FK_TB_TaiKhoan]      FOREIGN KEY ([id_tai_khoan]) REFERENCES [TaiKhoan]([id_tai_khoan]),
    CONSTRAINT [CK_TB_Loai]          CHECK ([loai] IN ('dat_ve','huy_ve','doi_ve','khuyen_mai','he_thong'))
)
GO

CREATE TABLE [dbo].[AuditLog] (
    [id_log]        BIGINT IDENTITY(1,1) NOT NULL,
    [bang]          VARCHAR(100)         NOT NULL,
    [ma_ban_ghi]    VARCHAR(100)         NOT NULL,
    [hanh_dong]     VARCHAR(15)          NOT NULL,
    [gia_tri_cu]    NVARCHAR(MAX)        NULL,
    [gia_tri_moi]   NVARCHAR(MAX)        NULL,
    [id_tai_khoan]  INT                  NULL,
    [ip_address]    VARCHAR(45)          NULL,
    [user_agent]    NVARCHAR(500)        NULL,
    [thoi_gian]     DATETIME             NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [PK_AuditLog] PRIMARY KEY CLUSTERED ([id_log] ASC),
    CONSTRAINT [CK_AuditLog_HanhDong] CHECK ([hanh_dong] IN ('INSERT','UPDATE','DELETE'))
)
GO

-- ============================================================
--  PHẦN 13: SEQUENCE cho mã đơn
-- ============================================================

IF OBJECT_ID('sq_ma_don','SO') IS NULL
    CREATE SEQUENCE [sq_ma_don] AS INT START WITH 1 INCREMENT BY 1
GO

-- ============================================================
--  PHẦN 14: INDEX BỔ SUNG
-- ============================================================

CREATE INDEX [IX_ChuyenTau_NgayChay]  ON [ChuyenTau]([ngay_chay])
CREATE INDEX [IX_Ve_DonDatVe]          ON [Ve]([id_don_dat_ve])
CREATE INDEX [IX_Ve_Chuyen_Toa_Ghe]    ON [Ve]([id_chuyen],[so_toa_thu_tu],[so_ghe_trong_toa])
CREATE INDEX [IX_TamGiuGhe_Chuyen]     ON [TamGiuGhe]([id_chuyen],[so_toa_thu_tu],[so_ghe_trong_toa])
CREATE INDEX [IX_TamGiuGhe_HetHan]     ON [TamGiuGhe]([thoi_gian_het_han]) WHERE ([trang_thai] = 'dang_giu')
CREATE INDEX [IX_ToaChuyen_Chuyen]     ON [ToaChuyen]([id_chuyen])
CREATE INDEX [IX_GheChuyen_ToaChuyen]  ON [GheChuyen]([id_toa_chuyen])
CREATE INDEX [IX_LichTrinhTT_Chuyen]  ON [LichTrinhThucTe]([id_chuyen])
CREATE INDEX [IX_DonDatVe_TaiKhoan]   ON [DonDatVe]([id_tai_khoan])
CREATE INDEX [IX_ThanhToan_Don]        ON [ThanhToan]([id_don_dat_ve])
CREATE INDEX [IX_CheckIn_Ve]           ON [CheckIn]([id_ve])
GO

-- ============================================================
--  PHẦN 15: DỮ LIỆU MẶC ĐỊNH
-- ============================================================

-- SystemConfig
INSERT INTO [SystemConfig] ([config_key],[config_value],[kieu_du_lieu],[nhom],[mo_ta]) VALUES
('HOLD_MINUTES',        '15',       'int',     'booking',  N'Số phút giữ chỗ tạm'),
('PAYMENT_TIMEOUT',     '15',       'int',     'payment',  N'Thời gian thanh toán tối đa (phút)'),
('MAX_TICKETS_PER_ORDER','4',       'int',     'booking',  N'Số vé tối đa mỗi đơn'),
('REFUND_PROCESSING_DAYS','3',      'int',     'cancel',   N'Số ngày hoàn tiền'),
('SERVICE_FEE_ONE_WAY', '20000',    'decimal', 'pricing',  N'Phí dịch vụ vé 1 chiều'),
('SERVICE_FEE_ROUND',   '40000',    'decimal', 'pricing',  N'Phí dịch vụ vé khứ hồi'),
('DEFAULT_GIA_KM',      '264',      'decimal', 'pricing',  N'Đơn giá gốc (đ/km)'),
('CHILD_DISCOUNT_PCT',  '25',       'decimal', 'pricing',  N'Giảm giá trẻ em (%)'),
('EXCHANGE_FEE_PCT',    '5',        'decimal', 'exchange', N'Phí đổi vé (%)'),
('EXCHANGE_FEE_MIN',    '20000',    'decimal', 'exchange', N'Phí đổi vé tối thiểu'),
('EXCHANGE_MIN_HOURS',  '24',       'int',     'exchange', N'Tối thiểu bao nhiêu giờ trước khi đổi'),
('QR_BASE_URL',         'https://img.vietqr.io/image','string','payment',N'Base URL VietQR'),
('BANK_ACCOUNT',        '9630630005144911','string','payment',N'Số tài khoản ngân hàng'),
('BANK_NAME',           'BIDV',     'string',  'payment',  N'Ngân hàng nhận thanh toán')
GO

-- VaiTro
INSERT INTO [VaiTro] ([ma_vai_tro],[ten_vai_tro],[mo_ta]) VALUES
('quan_tri',        N'Quản trị viên',     N'Toàn quyền hệ thống'),
('dieu_phoi',       N'Điều phối viên',    N'Điều phối lịch tàu, toa, chuyến'),
('kiem_soat_ve',    N'Kiểm soát vé',      N'Kiểm tra vé tại ga, check-in'),
('ke_toan',         N'Kế toán',           N'Xem báo cáo tài chính, hoàn tiền'),
('nhan_vien_ban',   N'Nhân viên bán vé',  N'Bán vé tại quầy'),
('khach_hang',      N'Khách hàng',        N'Đặt vé, tra cứu, quản lý đơn')
GO

-- Quyen
INSERT INTO [Quyen] ([ma_quyen],[ten_quyen],[nhom_quyen]) VALUES
('ve.create',           N'Tạo vé',                  've'),
('ve.view',             N'Xem vé',                  've'),
('ve.cancel',           N'Hủy vé',                  've'),
('ve.exchange',         N'Đổi vé',                  've'),
('ve.checkin',          N'Check-in vé',             've'),
('don.view',            N'Xem đơn đặt vé',          'don'),
('don.manage',          N'Quản lý đơn đặt vé',      'don'),
('chuyen.view',         N'Xem chuyến tàu',          'chuyen'),
('chuyen.create',       N'Tạo chuyến tàu',          'chuyen'),
('chuyen.manage',       N'Quản lý chuyến tàu',      'chuyen'),
('dieu_phoi.manage',    N'Điều phối vận hành',      'dieu_phoi'),
('thanhtoan.view',      N'Xem thanh toán',          'thanhtoan'),
('thanhtoan.refund',    N'Hoàn tiền',               'thanhtoan'),
('baocao.view',         N'Xem báo cáo',             'baocao'),
('user.manage',         N'Quản lý người dùng',      'user'),
('config.manage',       N'Quản lý cấu hình',        'config')
GO

-- VaiTroQuyen
DECLARE @admin   INT = (SELECT [id_vai_tro] FROM [VaiTro] WHERE [ma_vai_tro]='quan_tri')
DECLARE @dp      INT = (SELECT [id_vai_tro] FROM [VaiTro] WHERE [ma_vai_tro]='dieu_phoi')
DECLARE @ksv     INT = (SELECT [id_vai_tro] FROM [VaiTro] WHERE [ma_vai_tro]='kiem_soat_ve')
DECLARE @kt      INT = (SELECT [id_vai_tro] FROM [VaiTro] WHERE [ma_vai_tro]='ke_toan')
DECLARE @nvb     INT = (SELECT [id_vai_tro] FROM [VaiTro] WHERE [ma_vai_tro]='nhan_vien_ban')
DECLARE @kh      INT = (SELECT [id_vai_tro] FROM [VaiTro] WHERE [ma_vai_tro]='khach_hang')
-- Admin: mọi quyền
INSERT INTO [VaiTroQuyen] SELECT @admin, [id_quyen] FROM [Quyen]
-- Điều phối
INSERT INTO [VaiTroQuyen]
SELECT @dp, [id_quyen] FROM [Quyen]
WHERE [ma_quyen] IN ('chuyen.view','chuyen.create','chuyen.manage','dieu_phoi.manage','baocao.view')
-- Kiểm soát vé
INSERT INTO [VaiTroQuyen]
SELECT @ksv, [id_quyen] FROM [Quyen]
WHERE [ma_quyen] IN ('ve.view','ve.checkin','don.view','chuyen.view')
-- Kế toán
INSERT INTO [VaiTroQuyen]
SELECT @kt, [id_quyen] FROM [Quyen]
WHERE [ma_quyen] IN ('thanhtoan.view','thanhtoan.refund','baocao.view','don.view')
-- Nhân viên bán
INSERT INTO [VaiTroQuyen]
SELECT @nvb, [id_quyen] FROM [Quyen]
WHERE [ma_quyen] IN ('ve.create','ve.view','ve.cancel','don.view','don.manage','chuyen.view','thanhtoan.view')
-- Khách hàng
INSERT INTO [VaiTroQuyen]
SELECT @kh, [id_quyen] FROM [Quyen]
WHERE [ma_quyen] IN ('ve.create','ve.view','ve.cancel','ve.exchange','don.view')
GO

-- Chính sách hủy
INSERT INTO [ChinhSachHuy] ([gio_truoc_gio_chay],[phi_huy]) VALUES
(72,  10.00),
(24,  20.00),
(4,   50.00),
(0,   100.00)
GO

-- Chính sách giá hành khách
INSERT INTO [ChinhSachGia] ([ten_chinh_sach],[loai_hanh_khach],[phan_tram_giam],[tu_ngay]) VALUES
(N'Người lớn từ 10 tuổi',        'nguoi_lon',          0.00, '2024-01-01'),
(N'Trẻ em 6-9 tuổi – giảm 25%', 'tre_em',            25.00, '2024-01-01'),
(N'Người cao tuổi từ 60',        'nguoi_cao_tuoi',    15.00, '2024-01-01'),
(N'Học sinh, sinh viên',         'sinh_vien',         10.00, '2024-01-01')
GO

-- ============================================================
--  PHẦN 16: FUNCTIONS
-- ============================================================

-- Tính giờ thực tế từ offset (phục vụ tương lai)
GO
CREATE FUNCTION [dbo].[fn_TinhGiaVe] (
    @id_chuyen     INT,
    @id_ga_len     INT,
    @id_ga_xuong   INT,
    @id_loai_ghe   INT
)
RETURNS DECIMAL(15,2)
AS
BEGIN
    DECLARE @id_lich_chay  INT
    DECLARE @ngay_chay     DATE
    DECLARE @km            DECIMAL(10,2)
    DECLARE @don_gia       DECIMAL(12,2)
    DECLARE @he_so_tang    DECIMAL(4,2)
    DECLARE @he_so_ghe     DECIMAL(4,2)

    SELECT @id_lich_chay = ct.id_lich_chay,
           @ngay_chay    = ct.ngay_chay
    FROM   ChuyenTau ct WHERE ct.id_chuyen = @id_chuyen

    -- Khoảng cách
    SELECT @km = ABS(
        (SELECT khoang_cach_km FROM LichTrinhChuyen WHERE id_lich_chay=@id_lich_chay AND id_ga=@id_ga_xuong)
      - (SELECT khoang_cach_km FROM LichTrinhChuyen WHERE id_lich_chay=@id_lich_chay AND id_ga=@id_ga_len)
    )

    -- Biểu giá
    SELECT TOP 1 @don_gia = bg.don_gia_km_goc, @he_so_tang = bg.he_so_tang
    FROM   BieuGia bg
    WHERE  bg.trang_thai = 'dang_ap_dung'
      AND  @ngay_chay BETWEEN bg.ngay_bat_dau AND bg.ngay_ket_thuc
      AND  (bg.id_loai_ghe IS NULL OR bg.id_loai_ghe = @id_loai_ghe)
    ORDER BY bg.he_so_tang DESC

    SET @don_gia    = ISNULL(@don_gia,    264.00)
    SET @he_so_tang = ISNULL(@he_so_tang, 1.00)

    -- Hệ số ghế
    SELECT @he_so_ghe = he_so_gia FROM LoaiGhe WHERE id_loai_ghe = @id_loai_ghe
    SET @he_so_ghe = ISNULL(@he_so_ghe, 1.00)

    RETURN CEILING(@km * @don_gia * @he_so_tang * @he_so_ghe / 1000.0) * 1000.0
END
GO

-- Đếm ghế trống trong một toa của một chuyến
CREATE FUNCTION [dbo].[fn_GheTrongCuaToa] (
    @id_chuyen    INT,
    @so_toa       INT
)
RETURNS INT
AS
BEGIN
    DECLARE @tong      INT
    DECLARE @da_dat    INT
    DECLARE @dang_giu  INT
    DECLARE @id_tau    INT
    DECLARE @id_loai_toa INT

    SELECT @id_tau = lc.id_tau
    FROM   ChuyenTau ct JOIN LichChay lc ON lc.id_lich_chay=ct.id_lich_chay
    WHERE  ct.id_chuyen = @id_chuyen

    SELECT @id_loai_toa = id_loai_toa
    FROM   CauHinhToa
    WHERE  id_tau = @id_tau AND so_toa_thu_tu = @so_toa

    SELECT @tong = so_cho_toi_da FROM LoaiToa WHERE id_loai_toa = @id_loai_toa

    SELECT @da_dat = COUNT(*)
    FROM   Ve
    WHERE  id_chuyen = @id_chuyen
      AND  so_toa_thu_tu = @so_toa
      AND  trang_thai NOT IN ('da_huy','da_doi')

    SELECT @dang_giu = COUNT(*)
    FROM   TamGiuGhe
    WHERE  id_chuyen = @id_chuyen
      AND  so_toa_thu_tu = @so_toa
      AND  trang_thai = 'dang_giu'
      AND  thoi_gian_het_han > DATEADD(HOUR,7,GETUTCDATE())

    RETURN ISNULL(@tong,0) - ISNULL(@da_dat,0) - ISNULL(@dang_giu,0)
END
GO

-- Tính tiền hoàn khi hủy vé
CREATE FUNCTION [dbo].[fn_TienHoanUocTinh] (@id_ve INT)
RETURNS DECIMAL(15,2)
AS
BEGIN
    DECLARE @gia_ve       DECIMAL(15,2)
    DECLARE @ngay_chay    DATE
    DECLARE @gio_chay     TIME
    DECLARE @gio_con      DECIMAL(10,2)
    DECLARE @phi_pct      DECIMAL(5,2)

    SELECT @gia_ve     = v.gia_ve,
           @ngay_chay  = ct.ngay_chay,
           @gio_chay   = lc.gio_khoi_hanh
    FROM   Ve v
    JOIN   ChuyenTau ct ON ct.id_chuyen    = v.id_chuyen
    JOIN   LichChay  lc ON lc.id_lich_chay = ct.id_lich_chay
    WHERE  v.id_ve = @id_ve

    SET @gio_con = DATEDIFF(MINUTE, GETDATE(),
        CAST(@ngay_chay AS DATETIME) + CAST(@gio_chay AS DATETIME)) / 60.0
    IF @gio_con < 0 SET @gio_con = 0

    SELECT TOP 1 @phi_pct = phi_huy
    FROM   ChinhSachHuy
    WHERE  gio_truoc_gio_chay >= @gio_con
    ORDER  BY gio_truoc_gio_chay ASC

    SET @phi_pct = ISNULL(@phi_pct, 100.00)
    RETURN ISNULL(@gia_ve,0) - FLOOR(ISNULL(@gia_ve,0) * @phi_pct / 100.0)
END
GO

-- ============================================================
--  PHẦN 17: STORED PROCEDURES
-- ============================================================

-- SP1: Giữ ghế tạm
CREATE PROCEDURE [dbo].[sp_GiuGheTam]
    @id_chuyen               INT,
    @so_toa_thu_tu           INT,
    @so_ghe_trong_toa        INT,
    @id_tai_khoan            INT           = NULL,
    @session_id              VARCHAR(100)  = NULL
AS
BEGIN
    SET NOCOUNT ON
    BEGIN TRANSACTION
    BEGIN TRY
        DECLARE @hold_min INT = CAST((SELECT config_value FROM SystemConfig WHERE config_key='HOLD_MINUTES') AS INT)
        IF @hold_min IS NULL SET @hold_min = 15

        -- Dọn hết hạn
        DELETE FROM TamGiuGhe
        WHERE  id_chuyen=@id_chuyen AND so_toa_thu_tu=@so_toa_thu_tu
           AND so_ghe_trong_toa=@so_ghe_trong_toa
           AND (trang_thai='het_han' OR thoi_gian_het_han < DATEADD(HOUR,7,GETUTCDATE()))

        IF EXISTS (SELECT 1 FROM Ve WHERE id_chuyen=@id_chuyen
                    AND so_toa_thu_tu=@so_toa_thu_tu AND so_ghe_trong_toa=@so_ghe_trong_toa
                    AND trang_thai NOT IN ('da_huy','da_doi'))
        BEGIN ROLLBACK; SELECT 0 AS thanh_cong, N'Ghế đã được bán' AS message; RETURN END

        IF EXISTS (SELECT 1 FROM TamGiuGhe WHERE id_chuyen=@id_chuyen
                    AND so_toa_thu_tu=@so_toa_thu_tu AND so_ghe_trong_toa=@so_ghe_trong_toa
                    AND trang_thai='dang_giu'
                    AND thoi_gian_het_han > DATEADD(HOUR,7,GETUTCDATE())
                    AND ((id_tai_khoan<>@id_tai_khoan AND @id_tai_khoan IS NOT NULL)
                      OR (session_id<>@session_id    AND @session_id    IS NOT NULL)))
        BEGIN ROLLBACK; SELECT 0 AS thanh_cong, N'Ghế đang được người khác giữ' AS message; RETURN END

        IF EXISTS (SELECT 1 FROM TamGiuGhe WHERE id_chuyen=@id_chuyen
                    AND so_toa_thu_tu=@so_toa_thu_tu AND so_ghe_trong_toa=@so_ghe_trong_toa)
            UPDATE TamGiuGhe SET
                trang_thai='dang_giu',
                thoi_gian_het_han=DATEADD(MINUTE,@hold_min,GETDATE())
            WHERE id_chuyen=@id_chuyen AND so_toa_thu_tu=@so_toa_thu_tu AND so_ghe_trong_toa=@so_ghe_trong_toa
        ELSE
            INSERT INTO TamGiuGhe (id_chuyen,so_toa_thu_tu,so_ghe_trong_toa,id_tai_khoan,session_id,trang_thai,thoi_gian_giu,thoi_gian_het_han)
            VALUES (@id_chuyen,@so_toa_thu_tu,@so_ghe_trong_toa,@id_tai_khoan,@session_id,'dang_giu',GETDATE(),DATEADD(MINUTE,@hold_min,GETDATE()))

        COMMIT
        SELECT 1 AS thanh_cong, DATEADD(MINUTE,@hold_min,GETDATE()) AS het_han, N'Giữ ghế thành công' AS message
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT>0 ROLLBACK; THROW;
    END CATCH
END
GO

-- SP2: Giải phóng ghế
CREATE PROCEDURE [dbo].[sp_GiaiPhongGhe]
    @id_chuyen               INT,
    @so_toa_thu_tu           INT,
    @so_ghe_trong_toa        INT,
    @session_id              VARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON
    UPDATE TamGiuGhe SET trang_thai='da_giai_phong'
    WHERE  id_chuyen=@id_chuyen AND so_toa_thu_tu=@so_toa_thu_tu
       AND so_ghe_trong_toa=@so_ghe_trong_toa
       AND (@session_id IS NULL OR session_id=@session_id)
    SELECT @@ROWCOUNT AS so_dong_cap_nhat
END
GO

-- SP3: Dọn giữ ghế hết hạn (gọi từ SQL Agent Job mỗi 5 phút)
CREATE PROCEDURE [dbo].[sp_DonGiuGheHetHan]
AS
BEGIN
    SET NOCOUNT ON
    UPDATE TamGiuGhe SET trang_thai='het_han'
    WHERE  trang_thai='dang_giu' AND thoi_gian_het_han < DATEADD(HOUR,7,GETUTCDATE())

    UPDATE DonDatVe SET trang_thai='het_han'
    WHERE  trang_thai='cho_thanh_toan' AND thoi_gian_het_han < DATEADD(HOUR,7,GETUTCDATE())

    UPDATE Ve SET trang_thai='da_huy'
    WHERE  trang_thai='cho_xac_nhan'
      AND  id_don_dat_ve IN (SELECT id_don_dat_ve FROM DonDatVe WHERE trang_thai='het_han')

    SELECT @@ROWCOUNT AS so_dong_cap_nhat
END
GO

-- SP4: Tạo chuyến từ lịch chạy
CREATE PROCEDURE [dbo].[sp_TaoChuyenTauTuLich]
    @id_lich_chay  INT,
    @tu_ngay       DATE,
    @den_ngay      DATE
AS
BEGIN
    SET NOCOUNT ON
    DECLARE @ngay DATE = @tu_ngay
    DECLARE @id_chuyen_moi INT

    WHILE @ngay <= @den_ngay
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM ChuyenTau WHERE id_lich_chay=@id_lich_chay AND ngay_chay=@ngay)
        BEGIN
            INSERT INTO ChuyenTau (id_lich_chay,ngay_chay,trang_thai)
            VALUES (@id_lich_chay,@ngay,'dung_gio')

            SET @id_chuyen_moi = SCOPE_IDENTITY()

            -- Sinh ToaChuyen từ CauHinhToa template
            INSERT INTO ToaChuyen (id_chuyen,so_toa_thu_tu,id_loai_toa,so_ghe_toi_da)
            SELECT @id_chuyen_moi, cto.so_toa_thu_tu, cto.id_loai_toa, lt.so_cho_toi_da
            FROM   CauHinhToa cto
            JOIN   LoaiToa lt ON lt.id_loai_toa=cto.id_loai_toa
            JOIN   LichChay lc ON lc.id_tau=cto.id_tau AND lc.id_lich_chay=@id_lich_chay

            -- Sinh LichTrinhThucTe từ LichTrinhChuyen template
            INSERT INTO LichTrinhThucTe (id_chuyen,id_ga,thu_tu_dung,gio_den_du_kien,gio_di_du_kien)
            SELECT @id_chuyen_moi, ltc.id_ga, ltc.thu_tu_dung, ltc.gio_den, ltc.gio_di
            FROM   LichTrinhChuyen ltc
            WHERE  ltc.id_lich_chay=@id_lich_chay
        END
        SET @ngay = DATEADD(DAY,1,@ngay)
    END

    SELECT N'Tạo chuyến hoàn tất' AS message
END
GO

-- SP5: Xác nhận thanh toán
CREATE PROCEDURE [dbo].[sp_XacNhanThanhToan]
    @ma_giao_dich       VARCHAR(30),
    @ma_gd_ngan_hang    VARCHAR(50)   = NULL,
    @gateway_response   NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON
    BEGIN TRANSACTION
    BEGIN TRY
        DECLARE @id_tt    INT
        DECLARE @id_don   INT
        DECLARE @tt_hien  VARCHAR(25)
        DECLARE @het_han  DATETIME

        SELECT @id_tt=id_thanh_toan, @id_don=id_don_dat_ve,
               @tt_hien=trang_thai,  @het_han=thoi_gian_het_han
        FROM   ThanhToan WHERE ma_giao_dich=@ma_giao_dich

        IF @id_tt IS NULL BEGIN ROLLBACK; SELECT -1 AS error_code, N'Giao dịch không tồn tại' AS message; RETURN END
        IF @tt_hien='thanh_cong' BEGIN ROLLBACK; SELECT -2 AS error_code, N'Đã xác nhận trước đó' AS message; RETURN END
        IF GETDATE() > @het_han   BEGIN ROLLBACK; SELECT -3 AS error_code, N'Phiên thanh toán hết hạn' AS message; RETURN END

        UPDATE ThanhToan SET
            trang_thai='thanh_cong',
            ma_gd_ngan_hang=@ma_gd_ngan_hang,
            gateway_response=@gateway_response,
            thoi_gian_thanh_toan=GETDATE()
        WHERE id_thanh_toan=@id_tt

        UPDATE DonDatVe SET trang_thai='da_thanh_toan' WHERE id_don_dat_ve=@id_don
        UPDATE Ve SET trang_thai='da_xac_nhan'
        WHERE  id_don_dat_ve=@id_don AND trang_thai='cho_xac_nhan'
        UPDATE TamGiuGhe SET trang_thai='da_dat'
        WHERE  id_don_dat_ve=@id_don AND trang_thai='dang_giu'

        -- Tạo hóa đơn
        DECLARE @ma_hd   VARCHAR(30) = 'HD' + FORMAT(GETDATE(),'yyyyMMddHHmmss') + RIGHT(CAST(@id_don AS VARCHAR),4)
        DECLARE @ho_ten  NVARCHAR(100)
        DECLARE @email   VARCHAR(255)
        DECLARE @tong    DECIMAL(15,2)
        DECLARE @giam    DECIMAL(15,2)
        DECLARE @tt_pay  DECIMAL(15,2)
        SELECT @ho_ten=ho_ten_lien_lac, @email=email_dat_cho,
               @tong=tong_tien, @giam=tien_giam, @tt_pay=tien_thanh_toan
        FROM   DonDatVe WHERE id_don_dat_ve=@id_don

        INSERT INTO HoaDon (so_hoa_don,id_don_dat_ve,id_thanh_toan,ho_ten_khach,email_khach,
                            tong_tien_truoc_giam,tien_giam,tong_tien_thanh_toan)
        VALUES (@ma_hd,@id_don,@id_tt,@ho_ten,@email,@tong,@giam,@tt_pay)

        COMMIT
        SELECT @id_tt AS id_thanh_toan, 'thanh_cong' AS ket_qua, @ma_hd AS so_hoa_don
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT>0 ROLLBACK; THROW;
    END CATCH
END
GO

-- SP6: Hủy vé
CREATE PROCEDURE [dbo].[sp_HuyVe]
    @id_ve                INT,
    @ly_do                NVARCHAR(500) = NULL,
    @phuong_thuc_hoan     VARCHAR(25)   = 'nguon_goc',
    @ten_ngan_hang        NVARCHAR(50)  = NULL,
    @so_tai_khoan_hoan    VARCHAR(30)   = NULL
AS
BEGIN
    SET NOCOUNT ON
    BEGIN TRANSACTION
    BEGIN TRY
        DECLARE @trang_thai  VARCHAR(25)
        DECLARE @gia_ve      DECIMAL(15,2)
        DECLARE @id_don      INT
        DECLARE @id_chuyen   INT

        SELECT @trang_thai=v.trang_thai, @gia_ve=v.gia_ve,
               @id_don=v.id_don_dat_ve, @id_chuyen=v.id_chuyen
        FROM   Ve v WHERE id_ve=@id_ve

        IF @trang_thai IS NULL BEGIN ROLLBACK; SELECT -1 AS id_hoan, N'Vé không tồn tại' AS message; RETURN END
        IF @trang_thai NOT IN ('da_xac_nhan','cho_xac_nhan') BEGIN ROLLBACK; SELECT -2 AS id_hoan, N'Vé không thể hủy' AS message; RETURN END

        -- Kiểm tra thời gian
        DECLARE @gio_khoi_hanh DATETIME
        SELECT @gio_khoi_hanh =
            CAST(ct.ngay_chay AS DATETIME) + CAST(lc.gio_khoi_hanh AS DATETIME)
        FROM ChuyenTau ct JOIN LichChay lc ON lc.id_lich_chay=ct.id_lich_chay
        WHERE ct.id_chuyen=@id_chuyen

        DECLARE @gio_con DECIMAL(10,2) = DATEDIFF(MINUTE,GETDATE(),@gio_khoi_hanh) / 60.0
        IF @gio_con < 0 SET @gio_con=0

        DECLARE @phi_pct DECIMAL(5,2)
        SELECT TOP 1 @phi_pct=phi_huy FROM ChinhSachHuy
        WHERE gio_truoc_gio_chay >= @gio_con ORDER BY gio_truoc_gio_chay ASC
        SET @phi_pct = ISNULL(@phi_pct,100.00)

        IF @phi_pct=100.00 AND @gio_con<4 BEGIN ROLLBACK; SELECT -3 AS id_hoan, N'Không thể hủy dưới 4 giờ' AS message; RETURN END

        DECLARE @phi_tien  DECIMAL(15,2) = FLOOR(@gia_ve * @phi_pct / 100.0)
        DECLARE @tien_hoan DECIMAL(15,2) = @gia_ve - @phi_tien

        UPDATE Ve SET trang_thai='da_huy' WHERE id_ve=@id_ve

        DECLARE @id_tt INT
        SELECT TOP 1 @id_tt=id_thanh_toan FROM ThanhToan
        WHERE id_don_dat_ve=@id_don AND trang_thai='thanh_cong'
        ORDER BY thoi_gian_thanh_toan DESC

        INSERT INTO HoanTien (id_ve,id_thanh_toan,tien_goc,phi_huy,tien_hoan,
                              ly_do,phuong_thuc_hoan,ten_ngan_hang,so_tai_khoan_hoan,trang_thai_hoan)
        VALUES (@id_ve,@id_tt,@gia_ve,@phi_tien,@tien_hoan,
                @ly_do,@phuong_thuc_hoan,@ten_ngan_hang,@so_tai_khoan_hoan,'cho_xu_ly')

        DECLARE @id_hoan INT = SCOPE_IDENTITY()

        -- Thông báo
        DECLARE @id_tk INT = (SELECT id_tai_khoan FROM DonDatVe WHERE id_don_dat_ve=@id_don)
        IF @id_tk IS NOT NULL
            INSERT INTO ThongBao (id_tai_khoan,tieu_de,noi_dung,loai)
            VALUES (@id_tk, N'Hủy vé thành công',
                   N'Vé đã hủy. Tiền hoàn: ' + FORMAT(@tien_hoan,'N0') + N'đ (phí hủy '+CAST(@phi_pct AS VARCHAR)+'%)', 'huy_ve')

        COMMIT
        SELECT @id_hoan AS id_hoan, @tien_hoan AS tien_hoan, @phi_tien AS phi_huy,
               @phi_pct AS pct_phi, N'Hủy vé thành công' AS message
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT>0 ROLLBACK; THROW;
    END CATCH
END
GO

-- SP7: Check-in QR
CREATE PROCEDURE [dbo].[sp_CheckIn]
    @id_ve           INT,
    @id_ga           INT,
    @nhan_vien_id    INT          = NULL,
    @phuong_thuc     VARCHAR(20)  = 'qr',
    @thiet_bi        VARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON
    DECLARE @trang_thai_ve VARCHAR(25)
    DECLARE @id_ga_len     INT
    DECLARE @id_ga_xuong   INT
    DECLARE @id_chuyen     INT
    DECLARE @ket_qua       VARCHAR(25)
    DECLARE @ghi_chu       NVARCHAR(500)

    SELECT @trang_thai_ve=v.trang_thai, @id_ga_len=v.id_ga_len,
           @id_ga_xuong=v.id_ga_xuong, @id_chuyen=v.id_chuyen
    FROM   Ve v WHERE v.id_ve=@id_ve

    IF @trang_thai_ve IS NULL
        SET @ket_qua='khong_hop_le', @ghi_chu=N'Vé không tồn tại'
    ELSE IF @trang_thai_ve='da_huy'
        SET @ket_qua='da_huy', @ghi_chu=N'Vé đã bị hủy'
    ELSE IF @trang_thai_ve='da_doi'
        SET @ket_qua='khong_hop_le', @ghi_chu=N'Vé đã được đổi'
    ELSE IF EXISTS (SELECT 1 FROM CheckIn WHERE id_ve=@id_ve AND ket_qua='hop_le')
        SET @ket_qua='da_checkin', @ghi_chu=N'Vé đã check-in trước đó'
    ELSE IF @id_ga <> @id_ga_len
        SET @ket_qua='sai_ga', @ghi_chu=N'Ga check-in không khớp với ga lên tàu'
    ELSE BEGIN
        -- Kiểm tra giờ chạy
        DECLARE @gio_chay DATETIME
        SELECT @gio_chay = CAST(ct.ngay_chay AS DATETIME) + CAST(lc.gio_khoi_hanh AS DATETIME)
        FROM ChuyenTau ct JOIN LichChay lc ON lc.id_lich_chay=ct.id_lich_chay
        WHERE ct.id_chuyen=@id_chuyen

        IF GETDATE() > DATEADD(HOUR,2,@gio_chay)
            SET @ket_qua='qua_han', @ghi_chu=N'Quá 2 giờ kể từ giờ chạy'
        ELSE BEGIN
            SET @ket_qua='hop_le', @ghi_chu=N'Check-in thành công'
            UPDATE Ve SET trang_thai='da_su_dung' WHERE id_ve=@id_ve
        END
    END

    INSERT INTO CheckIn (id_ve,id_ga,phuong_thuc,ket_qua,nhan_vien_id,thiet_bi,ghi_chu)
    VALUES (@id_ve,@id_ga,@phuong_thuc,@ket_qua,@nhan_vien_id,@thiet_bi,@ghi_chu)

    SELECT SCOPE_IDENTITY() AS id_checkin, @ket_qua AS ket_qua, @ghi_chu AS ghi_chu
END
GO

-- SP8: Ghi nhận điều phối (delay, hủy chuyến…)
CREATE PROCEDURE [dbo].[sp_GhiDieuPhoi]
    @id_chuyen        INT,
    @loai_su_kien     VARCHAR(30),
    @mo_ta            NVARCHAR(1000) = NULL,
    @id_ga_anh_huong  INT            = NULL,
    @delay_phut       INT            = NULL,
    @nguoi_tao        INT
AS
BEGIN
    SET NOCOUNT ON
    INSERT INTO DieuPhoi (id_chuyen,loai_su_kien,mo_ta,id_ga_anh_huong,delay_phut,nguoi_tao)
    VALUES (@id_chuyen,@loai_su_kien,@mo_ta,@id_ga_anh_huong,@delay_phut,@nguoi_tao)

    -- Nếu delay: cập nhật LichTrinhThucTe
    IF @loai_su_kien='delay' AND @delay_phut IS NOT NULL AND @id_ga_anh_huong IS NOT NULL
    BEGIN
        UPDATE LichTrinhThucTe
        SET delay_den_phut = delay_den_phut + @delay_phut,
            delay_di_phut  = delay_di_phut  + @delay_phut,
            trang_thai     = 'tre_gio'
        WHERE id_chuyen=@id_chuyen
          AND thu_tu_dung >= (SELECT thu_tu_dung FROM LichTrinhThucTe
                              WHERE id_chuyen=@id_chuyen AND id_ga=@id_ga_anh_huong)
    END

    -- Nếu hủy chuyến
    IF @loai_su_kien='cancel'
    BEGIN
        UPDATE ChuyenTau SET trang_thai='huy' WHERE id_chuyen=@id_chuyen
        UPDATE LichTrinhThucTe SET trang_thai='huy' WHERE id_chuyen=@id_chuyen
    END

    SELECT SCOPE_IDENTITY() AS id_dieu_phoi, N'Ghi nhận điều phối thành công' AS message
END
GO

-- SP9: Tra cứu đặt chỗ
CREATE PROCEDURE [dbo].[sp_TraCuuDatCho]
    @ma_dat_cho  VARCHAR(20),
    @sdt         VARCHAR(15),
    @email       VARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON
    IF NOT EXISTS (
        SELECT 1 FROM DonDatVe
        WHERE  ma_dat_cho=@ma_dat_cho
          AND  REPLACE(sdt_dat_cho,' ','')=REPLACE(@sdt,' ','')
          AND  LOWER(email_dat_cho)=LOWER(@email)
    )
    BEGIN SELECT NULL AS id_don_dat_ve; RETURN END

    SELECT
        d.id_don_dat_ve, d.ma_don, d.ma_dat_cho, d.ho_ten_lien_lac,
        d.email_dat_cho, d.sdt_dat_cho, d.loai_ve,
        d.tong_tien, d.tien_giam, d.tien_thanh_toan,
        d.trang_thai AS trang_thai_don, d.thoi_gian_dat, d.thoi_gian_het_han,
        tt.phuong_thuc, tt.thoi_gian_thanh_toan, tt.ma_giao_dich,
        v.id_ve, v.trang_thai AS trang_thai_ve, v.gia_ve,
        v.so_toa_thu_tu, v.so_ghe_trong_toa, v.loai_hanh_khach, v.qr_ve,
        hk.ho_ten, hk.cccd, hk.ngay_sinh,
        ct.ngay_chay, tau.so_hieu AS ma_tau, tau.ten_tau,
        ltc_len.gio_di  AS gio_di,
        ltc_xuo.gio_den AS gio_den,
        gd.ten_ga AS ga_di, gd.ma_ga_viet_tat AS vt_ga_di,
        gn.ten_ga AS ga_den, gn.ma_ga_viet_tat AS vt_ga_den,
        ht.tien_hoan, ht.phi_huy, ht.trang_thai_hoan,
        dv.id_ve_moi
    FROM  DonDatVe d
    JOIN  Ve         v   ON v.id_don_dat_ve=d.id_don_dat_ve
    JOIN  HanhKhach  hk  ON hk.id_hanh_khach=v.id_hanh_khach
    JOIN  ChuyenTau  ct  ON ct.id_chuyen=v.id_chuyen
    JOIN  LichChay   lc  ON lc.id_lich_chay=ct.id_lich_chay
    JOIN  Tau        tau ON tau.id_tau=lc.id_tau
    JOIN  GaTau      gd  ON gd.id_ga=v.id_ga_len
    JOIN  GaTau      gn  ON gn.id_ga=v.id_ga_xuong
    LEFT JOIN LichTrinhChuyen ltc_len ON ltc_len.id_lich_chay=lc.id_lich_chay AND ltc_len.id_ga=v.id_ga_len
    LEFT JOIN LichTrinhChuyen ltc_xuo ON ltc_xuo.id_lich_chay=lc.id_lich_chay AND ltc_xuo.id_ga=v.id_ga_xuong
    LEFT JOIN ThanhToan  tt  ON tt.id_don_dat_ve=d.id_don_dat_ve AND tt.trang_thai='thanh_cong'
    LEFT JOIN HoanTien   ht  ON ht.id_ve=v.id_ve
    LEFT JOIN DoiVe      dv  ON dv.id_ve_cu=v.id_ve
    WHERE d.ma_dat_cho=@ma_dat_cho
      AND REPLACE(d.sdt_dat_cho,' ','')=REPLACE(@sdt,' ','')
      AND LOWER(d.email_dat_cho)=LOWER(@email)
    ORDER BY v.id_ve
END
GO

-- SP10: Lấy sơ đồ ghế toa
CREATE PROCEDURE [dbo].[sp_GetSoDoGhe]
    @id_chuyen         INT,
    @so_toa_thu_tu     INT,
    @id_ga_len         INT,
    @id_ga_xuong       INT
AS
BEGIN
    SET NOCOUNT ON
    DECLARE @id_tau      INT
    DECLARE @id_loai_toa INT
    SELECT @id_tau = lc.id_tau
    FROM   ChuyenTau ct JOIN LichChay lc ON lc.id_lich_chay=ct.id_lich_chay
    WHERE  ct.id_chuyen=@id_chuyen

    SELECT @id_loai_toa=id_loai_toa FROM CauHinhToa
    WHERE  id_tau=@id_tau AND so_toa_thu_tu=@so_toa_thu_tu

    SELECT
        cg.so_ghe_trong_toa AS so_ghe,
        cg.vi_tri, cg.tang, cg.khoang_so, cg.ben,
        lg.ma_loai_ghe, lg.ten_loai_ghe,
        dbo.fn_TinhGiaVe(@id_chuyen,@id_ga_len,@id_ga_xuong,cg.id_loai_ghe) AS gia,
        CASE
            WHEN EXISTS (
                SELECT 1 FROM Ve v
                WHERE v.id_chuyen=@id_chuyen AND v.so_toa_thu_tu=@so_toa_thu_tu
                  AND v.so_ghe_trong_toa=cg.so_ghe_trong_toa
                  AND v.trang_thai NOT IN ('da_huy','da_doi')
            ) THEN 'sold'
            WHEN EXISTS (
                SELECT 1 FROM TamGiuGhe tg
                WHERE tg.id_chuyen=@id_chuyen AND tg.so_toa_thu_tu=@so_toa_thu_tu
                  AND tg.so_ghe_trong_toa=cg.so_ghe_trong_toa
                  AND tg.trang_thai='dang_giu'
                  AND tg.thoi_gian_het_han > DATEADD(HOUR,7,GETUTCDATE())
            ) THEN 'held'
            ELSE 'empty'
        END AS trang_thai
    FROM CauHinhGhe cg
    JOIN LoaiGhe    lg  ON lg.id_loai_ghe=cg.id_loai_ghe
    WHERE cg.id_loai_toa=@id_loai_toa
    ORDER BY cg.so_ghe_trong_toa
END
GO

-- ============================================================
--  PHẦN 18: TRIGGERS
-- ============================================================

-- Trigger: Khi DonDatVe chuyển sang 'da_thanh_toan' → Cập nhật GheChuyen nếu có
CREATE TRIGGER [trg_DonDatVe_AfterUpdate_TrangThai]
ON [dbo].[DonDatVe]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON
    IF NOT UPDATE(trang_thai) RETURN

    -- Cập nhật GheChuyen khi đơn được thanh toán
    UPDATE gc SET gc.trang_thai = 'da_dat'
    FROM GheChuyen gc
    JOIN ToaChuyen tc ON tc.id_toa_chuyen = gc.id_toa_chuyen
    JOIN Ve v         ON v.id_chuyen=tc.id_chuyen AND v.so_toa_thu_tu=tc.so_toa_thu_tu
                     AND v.so_ghe_trong_toa=gc.so_ghe_trong_toa
    JOIN inserted i   ON i.id_don_dat_ve=v.id_don_dat_ve
    WHERE i.trang_thai='da_thanh_toan'
END
GO

-- Trigger: Ghi AuditLog khi Ve thay đổi trang_thai
CREATE TRIGGER [trg_Ve_AuditLog]
ON [dbo].[Ve]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON
    IF NOT UPDATE(trang_thai) RETURN

    INSERT INTO AuditLog (bang, ma_ban_ghi, hanh_dong, gia_tri_cu, gia_tri_moi)
    SELECT 'Ve', CAST(i.id_ve AS VARCHAR),
           'UPDATE',
           '{"trang_thai":"' + d.trang_thai + '"}',
           '{"trang_thai":"' + i.trang_thai + '"}'
    FROM inserted i JOIN deleted d ON d.id_ve=i.id_ve
    WHERE i.trang_thai <> d.trang_thai
END
GO

-- Trigger: Khi hủy vé, trả GheChuyen về 'trong'
CREATE TRIGGER [trg_Ve_HuyVe_GiaiPhongGhe]
ON [dbo].[Ve]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON
    IF NOT UPDATE(trang_thai) RETURN

    -- Giải phóng GheChuyen khi vé bị hủy hoặc đổi
    UPDATE gc SET gc.trang_thai = 'trong'
    FROM GheChuyen gc
    JOIN ToaChuyen tc ON tc.id_toa_chuyen=gc.id_toa_chuyen
    JOIN inserted i   ON i.id_chuyen=tc.id_chuyen
                     AND i.so_toa_thu_tu=tc.so_toa_thu_tu
                     AND i.so_ghe_trong_toa=gc.so_ghe_trong_toa
    WHERE i.trang_thai IN ('da_huy','da_doi')
      AND NOT EXISTS (
            SELECT 1 FROM Ve v2
            WHERE v2.id_chuyen=i.id_chuyen AND v2.so_toa_thu_tu=i.so_toa_thu_tu
              AND v2.so_ghe_trong_toa=i.so_ghe_trong_toa
              AND v2.trang_thai NOT IN ('da_huy','da_doi')
              AND v2.id_ve <> i.id_ve
      )
END
GO

-- ============================================================
--  PHẦN 19: VIEW HỮU ÍCH
-- ============================================================

CREATE VIEW [dbo].[vw_VeChiTiet]
AS
SELECT
    v.id_ve, v.trang_thai AS trang_thai_ve, v.gia_ve,
    v.so_toa_thu_tu, v.so_ghe_trong_toa, v.loai_hanh_khach,
    d.ma_dat_cho, d.ma_don, d.trang_thai AS trang_thai_don,
    hk.ho_ten, hk.cccd, hk.ngay_sinh,
    ct.ngay_chay, tau.so_hieu AS ma_tau,
    gd.ten_ga AS ga_len, gd.ma_ga_viet_tat AS vt_ga_len,
    gn.ten_ga AS ga_xuong, gn.ma_ga_viet_tat AS vt_ga_xuong,
    ltc_len.gio_di AS gio_len_tau, ltc_xuo.gio_den AS gio_xuong_tau,
    lt.ten_loai_toa, lg.ten_loai_ghe
FROM Ve v
JOIN DonDatVe    d    ON d.id_don_dat_ve=v.id_don_dat_ve
JOIN HanhKhach   hk   ON hk.id_hanh_khach=v.id_hanh_khach
JOIN ChuyenTau   ct   ON ct.id_chuyen=v.id_chuyen
JOIN LichChay    lc   ON lc.id_lich_chay=ct.id_lich_chay
JOIN Tau         tau  ON tau.id_tau=lc.id_tau
JOIN GaTau       gd   ON gd.id_ga=v.id_ga_len
JOIN GaTau       gn   ON gn.id_ga=v.id_ga_xuong
LEFT JOIN LichTrinhChuyen ltc_len ON ltc_len.id_lich_chay=lc.id_lich_chay AND ltc_len.id_ga=v.id_ga_len
LEFT JOIN LichTrinhChuyen ltc_xuo ON ltc_xuo.id_lich_chay=lc.id_lich_chay AND ltc_xuo.id_ga=v.id_ga_xuong
LEFT JOIN CauHinhToa cto ON cto.id_tau=tau.id_tau AND cto.so_toa_thu_tu=v.so_toa_thu_tu
LEFT JOIN LoaiToa    lt  ON lt.id_loai_toa=cto.id_loai_toa
LEFT JOIN CauHinhGhe cg  ON cg.id_loai_toa=lt.id_loai_toa AND cg.so_ghe_trong_toa=v.so_ghe_trong_toa
LEFT JOIN LoaiGhe    lg  ON lg.id_loai_ghe=cg.id_loai_ghe
GO

CREATE VIEW [dbo].[vw_GheTrongTheoToa]
AS
SELECT
    ct.id_chuyen, ct.ngay_chay,
    cto.so_toa_thu_tu,
    lt.ten_loai_toa, lt.so_cho_toi_da,
    dbo.fn_GheTrongCuaToa(ct.id_chuyen, cto.so_toa_thu_tu) AS so_cho_trong
FROM ChuyenTau ct
JOIN LichChay  lc  ON lc.id_lich_chay=ct.id_lich_chay
JOIN CauHinhToa cto ON cto.id_tau=lc.id_tau
JOIN LoaiToa   lt  ON lt.id_loai_toa=cto.id_loai_toa
WHERE ct.trang_thai NOT IN ('huy')
GO

-- ============================================================
--  PHẦN 20: STORED PROCEDURE sp_DonGiuGheHetHan (Job mỗi 5p)
-- ============================================================

-- Đã tạo ở SP3 phía trên.

-- ============================================================
--  PHẦN 21: NOTE CẦN THỰC HIỆN Ở BACKEND
-- ============================================================
/*
  SAU KHI RESTORE CSDL NÀY, cần:

  1. Chạy script nhập dữ liệu mẫu từ file KLNTrainn.sql
     (chỉ lấy phần INSERT INTO các bảng cốt lõi)

  2. Tạo SQL Agent Job gọi sp_DonGiuGheHetHan mỗi 5 phút:
     EXEC msdb.dbo.sp_add_job @job_name=N'KLNTrain_CleanExpiredHolds'
     -- ... (cấu hình theo tài liệu SQL Server Agent)

  3. Sau khi nhập dữ liệu ChuyenTau + CauHinhToa, chạy:
     EXEC sp_TaoChuyenTauTuLich @id_lich_chay=1, @tu_ngay='2026-06-01', @den_ngay='2026-12-31'
     -- Để sinh ToaChuyen + LichTrinhThucTe cho tất cả chuyến

  4. Sync TaiKhoanVaiTro từ cột vai_tro cũ:
     INSERT INTO TaiKhoanVaiTro (id_tai_khoan, id_vai_tro)
     SELECT tk.id_tai_khoan, vt.id_vai_tro
     FROM TaiKhoan tk
     JOIN VaiTro vt ON vt.ma_vai_tro = tk.vai_tro
     WHERE NOT EXISTS (SELECT 1 FROM TaiKhoanVaiTro x WHERE x.id_tai_khoan=tk.id_tai_khoan AND x.id_vai_tro=vt.id_vai_tro)

  5. Cập nhật backend để dùng TaiKhoanVaiTro/VaiTroQuyen thay vì cột vai_tro cũ.
*/

PRINT N'CSDL.SQL đã được tạo thành công – KLN Train v2.0'
GO
