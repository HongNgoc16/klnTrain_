-- ============================================================
--  CSDLHC.SQL  –  KLN TRAIN v2.0  –  DỮ LIỆU HOÀN CHỈNH
--  Ngày: 02/06/2026
-- ============================================================

USE [master]
GO
IF DB_ID('KLNTrain') IS NOT NULL
    ALTER DATABASE [KLNTrain] SET SINGLE_USER WITH ROLLBACK IMMEDIATE
GO
IF DB_ID('KLNTrain') IS NOT NULL DROP DATABASE [KLNTrain]
GO
CREATE DATABASE [KLNTrain] CONTAINMENT=NONE
    ON PRIMARY(NAME=N'KLNTrain',
        FILENAME=N'C:\Program Files\Microsoft SQL Server\MSSQL16.SQLEXPRESS\MSSQL\DATA\KLNTrain.mdf',
        SIZE=73728KB,MAXSIZE=UNLIMITED,FILEGROWTH=65536KB)
    LOG ON(NAME=N'KLNTrain_log',
        FILENAME=N'C:\Program Files\Microsoft SQL Server\MSSQL16.SQLEXPRESS\MSSQL\DATA\KLNTrain_log.ldf',
        SIZE=8192KB,MAXSIZE=2048GB,FILEGROWTH=65536KB)
    WITH CATALOG_COLLATION=DATABASE_DEFAULT,LEDGER=OFF
GO
ALTER DATABASE [KLNTrain] SET COMPATIBILITY_LEVEL=160
GO
ALTER DATABASE [KLNTrain] SET RECOVERY SIMPLE
GO
ALTER DATABASE [KLNTrain] SET MULTI_USER
GO
USE [KLNTrain]
GO

-- ============================================================
-- SECTION 1: SCHEMA
-- ============================================================

CREATE TABLE [dbo].[SystemConfig](
    [id_config]     INT IDENTITY(1,1) NOT NULL,
    [config_key]    VARCHAR(60)       NOT NULL,
    [config_value]  NVARCHAR(500)     NOT NULL,
    [kieu_du_lieu]  VARCHAR(20)       NOT NULL DEFAULT 'string',
    [nhom]          VARCHAR(50)       NULL,
    [mo_ta]         NVARCHAR(300)     NULL,
    [co_the_sua]    BIT               NOT NULL DEFAULT 1,
    [ngay_cap_nhat] DATETIME          NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [PK_SystemConfig] PRIMARY KEY([id_config]),
    CONSTRAINT [UQ_SystemConfig_Key] UNIQUE([config_key])
)
GO
CREATE TABLE [dbo].[VaiTro](
    [id_vai_tro]  INT IDENTITY(1,1) NOT NULL,
    [ma_vai_tro]  VARCHAR(30)       NOT NULL,
    [ten_vai_tro] NVARCHAR(100)     NOT NULL,
    [mo_ta]       NVARCHAR(500)     NULL,
    [trang_thai]  VARCHAR(20)       NOT NULL DEFAULT 'hoat_dong',
    CONSTRAINT [PK_VaiTro] PRIMARY KEY([id_vai_tro]),
    CONSTRAINT [UQ_VaiTro_Ma] UNIQUE([ma_vai_tro])
)
GO
CREATE TABLE [dbo].[Quyen](
    [id_quyen]   INT IDENTITY(1,1) NOT NULL,
    [ma_quyen]   VARCHAR(60)       NOT NULL,
    [ten_quyen]  NVARCHAR(150)     NOT NULL,
    [nhom_quyen] VARCHAR(50)       NULL,
    [mo_ta]      NVARCHAR(500)     NULL,
    CONSTRAINT [PK_Quyen] PRIMARY KEY([id_quyen]),
    CONSTRAINT [UQ_Quyen_Ma] UNIQUE([ma_quyen])
)
GO
CREATE TABLE [dbo].[VaiTroQuyen](
    [id_vai_tro] INT NOT NULL,
    [id_quyen]   INT NOT NULL,
    CONSTRAINT [PK_VaiTroQuyen] PRIMARY KEY([id_vai_tro],[id_quyen]),
    CONSTRAINT [FK_VTQ_VaiTro] FOREIGN KEY([id_vai_tro]) REFERENCES [VaiTro]([id_vai_tro]),
    CONSTRAINT [FK_VTQ_Quyen]  FOREIGN KEY([id_quyen])   REFERENCES [Quyen]([id_quyen])
)
GO
CREATE TABLE [dbo].[TaiKhoan](
    [id_tai_khoan]  INT IDENTITY(1,1) NOT NULL,
    [email]         VARCHAR(100)      NOT NULL,
    [mat_khau]      VARCHAR(255)      NOT NULL,
    [ho_ten]        NVARCHAR(100)     NOT NULL,
    [so_dien_thoai] VARCHAR(15)       NULL,
    [ngay_sinh]     DATE              NULL,
    [gioi_tinh]     VARCHAR(10)       NULL,
    [vai_tro]       VARCHAR(20)       NOT NULL DEFAULT 'khach_hang',
    [trang_thai]    VARCHAR(20)       NOT NULL DEFAULT 'hoat_dong',
    [ngay_tao]      DATETIME          NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [PK_TaiKhoan]           PRIMARY KEY([id_tai_khoan]),
    CONSTRAINT [UQ_TaiKhoan_Email]     UNIQUE([email]),
    CONSTRAINT [CK_TaiKhoan_TrangThai] CHECK([trang_thai] IN ('hoat_dong','bi_khoa')),
    CONSTRAINT [CK_TaiKhoan_VaiTro]    CHECK([vai_tro] IN ('quan_tri','nhan_vien','khach_hang'))
)
GO
CREATE TABLE [dbo].[TaiKhoanVaiTro](
    [id_tai_khoan] INT      NOT NULL,
    [id_vai_tro]   INT      NOT NULL,
    [nguoi_cap]    INT      NULL,
    [ngay_tao]     DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [PK_TaiKhoanVaiTro] PRIMARY KEY([id_tai_khoan],[id_vai_tro]),
    CONSTRAINT [FK_TKVT_TK]  FOREIGN KEY([id_tai_khoan]) REFERENCES [TaiKhoan]([id_tai_khoan]),
    CONSTRAINT [FK_TKVT_VT]  FOREIGN KEY([id_vai_tro])   REFERENCES [VaiTro]([id_vai_tro])
)
GO
CREATE TABLE [dbo].[GaTau](
    [id_ga]          INT IDENTITY(1,1) NOT NULL,
    [ma_ga_viet_tat] VARCHAR(10)       NOT NULL,
    [ten_ga]         NVARCHAR(50)      NOT NULL,
    [tinh_thanh]     NVARCHAR(50)      NULL,
    [thu_tu_tuyen]   INT               NOT NULL,
    [do_uu_tien]     INT               NOT NULL DEFAULT 50,
    [trang_thai]     VARCHAR(15)       NOT NULL DEFAULT 'hoat_dong',
    CONSTRAINT [PK_GaTau]       PRIMARY KEY([id_ga]),
    CONSTRAINT [UQ_GaTau_Ma]    UNIQUE([ma_ga_viet_tat]),
    CONSTRAINT [CK_GaTau_TT]    CHECK([trang_thai] IN ('hoat_dong','tam_dung'))
)
GO
CREATE TABLE [dbo].[Tau](
    [id_tau]     INT IDENTITY(1,1) NOT NULL,
    [so_hieu]    VARCHAR(20)       NOT NULL,
    [ten_tau]    NVARCHAR(100)     NULL,
    [so_toa]     INT               NOT NULL,
    [trang_thai] VARCHAR(20)       NOT NULL DEFAULT 'hoat_dong',
    CONSTRAINT [PK_Tau]        PRIMARY KEY([id_tau]),
    CONSTRAINT [UQ_Tau_SoHieu] UNIQUE([so_hieu]),
    CONSTRAINT [CK_Tau_TT]     CHECK([trang_thai] IN ('hoat_dong','bao_tri','ngung'))
)
GO
CREATE TABLE [dbo].[LoaiToa](
    [id_loai_toa]    INT IDENTITY(1,1) NOT NULL,
    [ma_loai_toa]    VARCHAR(20)       NOT NULL,
    [ten_loai_toa]   NVARCHAR(100)     NOT NULL,
    [loai_ghe_chinh] VARCHAR(20)       NOT NULL,
    [so_cho_toi_da]  INT               NOT NULL,
    CONSTRAINT [PK_LoaiToa]     PRIMARY KEY([id_loai_toa]),
    CONSTRAINT [UQ_LoaiToa_Ma]  UNIQUE([ma_loai_toa])
)
GO
CREATE TABLE [dbo].[LoaiGhe](
    [id_loai_ghe]  INT IDENTITY(1,1) NOT NULL,
    [ma_loai_ghe]  VARCHAR(15)       NOT NULL,
    [id_loai_toa]  INT               NOT NULL,
    [ten_loai_ghe] NVARCHAR(150)     NOT NULL,
    [he_so_gia]    DECIMAL(4,2)      NOT NULL DEFAULT 1.00,
    [trang_thai]   VARCHAR(20)       NOT NULL DEFAULT 'dang_ban',
    CONSTRAINT [PK_LoaiGhe]       PRIMARY KEY([id_loai_ghe]),
    CONSTRAINT [UQ_LoaiGhe_Ma]    UNIQUE([ma_loai_ghe]),
    CONSTRAINT [FK_LG_LoaiToa]    FOREIGN KEY([id_loai_toa]) REFERENCES [LoaiToa]([id_loai_toa])
)
GO
CREATE TABLE [dbo].[CauHinhToa](
    [id_cau_hinh_toa] INT IDENTITY(1,1) NOT NULL,
    [id_tau]          INT               NOT NULL,
    [so_toa_thu_tu]   INT               NOT NULL,
    [id_loai_toa]     INT               NOT NULL,
    CONSTRAINT [PK_CauHinhToa]        PRIMARY KEY([id_cau_hinh_toa]),
    CONSTRAINT [UK_CHT_Tau_Toa]       UNIQUE([id_tau],[so_toa_thu_tu]),
    CONSTRAINT [FK_CHT_Tau]           FOREIGN KEY([id_tau])      REFERENCES [Tau]([id_tau]),
    CONSTRAINT [FK_CHT_LoaiToa]       FOREIGN KEY([id_loai_toa]) REFERENCES [LoaiToa]([id_loai_toa])
)
GO
CREATE TABLE [dbo].[CauHinhGhe](
    [id_cau_hinh_ghe]  INT IDENTITY(1,1) NOT NULL,
    [id_loai_toa]      INT               NOT NULL,
    [so_ghe_trong_toa] INT               NOT NULL,
    [id_loai_ghe]      INT               NOT NULL,
    [vi_tri]           NVARCHAR(100)     NULL,
    [tang]             VARCHAR(10)       NULL,
    [khoang_so]        INT               NULL,
    [ben]              NVARCHAR(10)      NULL,
    CONSTRAINT [PK_CauHinhGhe]         PRIMARY KEY([id_cau_hinh_ghe]),
    CONSTRAINT [UK_CHG_LoaiToa_SoGhe]  UNIQUE([id_loai_toa],[so_ghe_trong_toa]),
    CONSTRAINT [FK_CHG_LoaiToa]        FOREIGN KEY([id_loai_toa]) REFERENCES [LoaiToa]([id_loai_toa]),
    CONSTRAINT [FK_CHG_LoaiGhe]        FOREIGN KEY([id_loai_ghe]) REFERENCES [LoaiGhe]([id_loai_ghe])
)
GO
CREATE TABLE [dbo].[LichChay](
    [id_lich_chay]    INT IDENTITY(1,1) NOT NULL,
    [id_tau]          INT               NOT NULL,
    [id_ga_di]        INT               NOT NULL,
    [id_ga_den]       INT               NOT NULL,
    [gio_khoi_hanh]   TIME(0)           NOT NULL,
    [gio_du_kien_den] TIME(0)           NOT NULL,
    [thu_trong_tuan]  NVARCHAR(50)      NULL,
    CONSTRAINT [PK_LichChay]  PRIMARY KEY([id_lich_chay]),
    CONSTRAINT [FK_LC_Tau]    FOREIGN KEY([id_tau])    REFERENCES [Tau]([id_tau]),
    CONSTRAINT [FK_LC_GaDi]   FOREIGN KEY([id_ga_di])  REFERENCES [GaTau]([id_ga]),
    CONSTRAINT [FK_LC_GaDen]  FOREIGN KEY([id_ga_den]) REFERENCES [GaTau]([id_ga])
)
GO
CREATE TABLE [dbo].[LichTrinhChuyen](
    [id_lich_trinh]  INT IDENTITY(1,1) NOT NULL,
    [id_lich_chay]   INT               NOT NULL,
    [id_ga]          INT               NOT NULL,
    [thu_tu_dung]    INT               NOT NULL,
    [gio_den]        TIME(0)           NOT NULL,
    [gio_di]         TIME(0)           NOT NULL,
    [khoang_cach_km] DECIMAL(8,2)      NOT NULL DEFAULT 0,
    [thoi_gian_dung] INT               NOT NULL DEFAULT 0,
    CONSTRAINT [PK_LichTrinhChuyen]  PRIMARY KEY([id_lich_trinh]),
    CONSTRAINT [UK_LTC_LichChay_Ga]  UNIQUE([id_lich_chay],[id_ga]),
    CONSTRAINT [FK_LTC_LichChay]     FOREIGN KEY([id_lich_chay]) REFERENCES [LichChay]([id_lich_chay]),
    CONSTRAINT [FK_LTC_Ga]           FOREIGN KEY([id_ga])        REFERENCES [GaTau]([id_ga])
)
GO
CREATE TABLE [dbo].[BieuGia](
    [id_bieu_gia]    INT IDENTITY(1,1) NOT NULL,
    [ten_dip]        NVARCHAR(150)     NOT NULL,
    [ngay_bat_dau]   DATE              NOT NULL,
    [ngay_ket_thuc]  DATE              NOT NULL,
    [he_so_tang]     DECIMAL(4,2)      NOT NULL DEFAULT 1.00,
    [don_gia_km_goc] DECIMAL(12,2)     NOT NULL,
    [id_loai_ghe]    INT               NULL,
    [trang_thai]     VARCHAR(25)       NOT NULL DEFAULT 'dang_ap_dung',
    CONSTRAINT [PK_BieuGia]     PRIMARY KEY([id_bieu_gia]),
    CONSTRAINT [FK_BG_LoaiGhe]  FOREIGN KEY([id_loai_ghe]) REFERENCES [LoaiGhe]([id_loai_ghe])
)
GO
CREATE TABLE [dbo].[ChinhSachGia](
    [id_chinh_sach]   INT IDENTITY(1,1) NOT NULL,
    [ten_chinh_sach]  NVARCHAR(150)     NOT NULL,
    [loai_hanh_khach] VARCHAR(25)       NOT NULL,
    [phan_tram_giam]  DECIMAL(5,2)      NOT NULL DEFAULT 0,
    [tu_ngay]         DATE              NULL,
    [den_ngay]        DATE              NULL,
    CONSTRAINT [PK_ChinhSachGia] PRIMARY KEY([id_chinh_sach])
)
GO
CREATE TABLE [dbo].[ChinhSachHuy](
    [id_cs_huy]          INT IDENTITY(1,1) NOT NULL,
    [gio_truoc_gio_chay] INT               NOT NULL,
    [phi_huy]            DECIMAL(5,2)      NOT NULL,
    CONSTRAINT [PK_ChinhSachHuy] PRIMARY KEY([id_cs_huy])
)
GO
CREATE TABLE [dbo].[KhuyenMai](
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
    CONSTRAINT [PK_KhuyenMai]     PRIMARY KEY([id_khuyen_mai]),
    CONSTRAINT [UQ_KhuyenMai_Ma]  UNIQUE([ma_khuyen_mai]),
    CONSTRAINT [CK_KM_LoaiGiam]   CHECK([loai_giam] IN ('phan_tram','so_tien')),
    CONSTRAINT [CK_KM_ApDungCho]  CHECK([ap_dung_cho] IN ('tat_ca','nguoi_moi','thanh_vien'))
)
GO
CREATE TABLE [dbo].[ChuyenTau](
    [id_chuyen]    INT IDENTITY(1,1) NOT NULL,
    [id_lich_chay] INT               NOT NULL,
    [ngay_chay]    DATE              NOT NULL,
    [trang_thai]   VARCHAR(25)       NOT NULL DEFAULT 'dung_gio',
    [ghi_chu]      NVARCHAR(500)     NULL,
    CONSTRAINT [PK_ChuyenTau]           PRIMARY KEY([id_chuyen]),
    CONSTRAINT [UK_ChuyenTau_Lich_Ngay] UNIQUE([id_lich_chay],[ngay_chay]),
    CONSTRAINT [FK_CT_LichChay]         FOREIGN KEY([id_lich_chay]) REFERENCES [LichChay]([id_lich_chay]),
    CONSTRAINT [CK_CT_TrangThai]        CHECK([trang_thai] IN ('dung_gio','tre_gio','da_chay','huy'))
)
GO
CREATE TABLE [dbo].[ToaChuyen](
    [id_toa_chuyen] INT IDENTITY(1,1) NOT NULL,
    [id_chuyen]     INT               NOT NULL,
    [so_toa_thu_tu] INT               NOT NULL,
    [id_loai_toa]   INT               NOT NULL,
    [so_ghe_toi_da] INT               NOT NULL,
    [trang_thai]    VARCHAR(20)       NOT NULL DEFAULT 'hoat_dong',
    [ghi_chu]       NVARCHAR(500)     NULL,
    CONSTRAINT [PK_ToaChuyen]        PRIMARY KEY([id_toa_chuyen]),
    CONSTRAINT [UK_ToaChuyen_CT_Toa] UNIQUE([id_chuyen],[so_toa_thu_tu]),
    CONSTRAINT [FK_TC_Chuyen]        FOREIGN KEY([id_chuyen])   REFERENCES [ChuyenTau]([id_chuyen]),
    CONSTRAINT [FK_TC_LoaiToa]       FOREIGN KEY([id_loai_toa]) REFERENCES [LoaiToa]([id_loai_toa])
)
GO
CREATE TABLE [dbo].[LichTrinhThucTe](
    [id_lt_thuc_te]   INT IDENTITY(1,1) NOT NULL,
    [id_chuyen]       INT               NOT NULL,
    [id_ga]           INT               NOT NULL,
    [thu_tu_dung]     INT               NOT NULL,
    [gio_den_du_kien] TIME(0)           NULL,
    [gio_di_du_kien]  TIME(0)           NULL,
    [gio_den_thuc_te] DATETIME          NULL,
    [gio_di_thuc_te]  DATETIME          NULL,
    [delay_den_phut]  INT               NOT NULL DEFAULT 0,
    [delay_di_phut]   INT               NOT NULL DEFAULT 0,
    [trang_thai]      VARCHAR(20)       NOT NULL DEFAULT 'chua_toi',
    [ghi_chu]         NVARCHAR(500)     NULL,
    CONSTRAINT [PK_LTTT]         PRIMARY KEY([id_lt_thuc_te]),
    CONSTRAINT [UK_LTTT_CT_Ga]   UNIQUE([id_chuyen],[id_ga]),
    CONSTRAINT [FK_LTTT_Chuyen]  FOREIGN KEY([id_chuyen]) REFERENCES [ChuyenTau]([id_chuyen]),
    CONSTRAINT [FK_LTTT_Ga]      FOREIGN KEY([id_ga])     REFERENCES [GaTau]([id_ga])
)
GO
CREATE TABLE [dbo].[DieuPhoi](
    [id_dieu_phoi]    INT IDENTITY(1,1) NOT NULL,
    [id_chuyen]       INT               NOT NULL,
    [loai_su_kien]    VARCHAR(30)       NOT NULL,
    [mo_ta]           NVARCHAR(1000)    NULL,
    [id_ga_anh_huong] INT               NULL,
    [delay_phut]      INT               NULL,
    [nguoi_tao]       INT               NOT NULL,
    [thoi_gian_tao]   DATETIME          NOT NULL DEFAULT GETDATE(),
    [trang_thai]      VARCHAR(20)       NOT NULL DEFAULT 'hieu_luc',
    CONSTRAINT [PK_DieuPhoi]       PRIMARY KEY([id_dieu_phoi]),
    CONSTRAINT [FK_DP_Chuyen]      FOREIGN KEY([id_chuyen])       REFERENCES [ChuyenTau]([id_chuyen]),
    CONSTRAINT [FK_DP_Ga]          FOREIGN KEY([id_ga_anh_huong]) REFERENCES [GaTau]([id_ga]),
    CONSTRAINT [FK_DP_NguoiTao]    FOREIGN KEY([nguoi_tao])       REFERENCES [TaiKhoan]([id_tai_khoan])
)
GO
CREATE TABLE [dbo].[HanhKhach](
    [id_hanh_khach]   INT IDENTITY(1,1) NOT NULL,
    [id_tai_khoan]    INT               NULL,
    [ho_ten]          NVARCHAR(150)     NOT NULL,
    [ngay_sinh]       DATE              NOT NULL,
    [cccd]            VARCHAR(20)       NULL,
    [loai_hanh_khach] VARCHAR(20)       NOT NULL DEFAULT 'nguoi_lon',
    [so_dien_thoai]   VARCHAR(15)       NULL,
    [la_chinh]        BIT               NOT NULL DEFAULT 0,
    CONSTRAINT [PK_HanhKhach]    PRIMARY KEY([id_hanh_khach]),
    CONSTRAINT [FK_HK_TaiKhoan]  FOREIGN KEY([id_tai_khoan]) REFERENCES [TaiKhoan]([id_tai_khoan])
)
GO
CREATE TABLE [dbo].[DonDatVe](
    [id_don_dat_ve]     INT IDENTITY(1,1) NOT NULL,
    [ma_don]            VARCHAR(20)       NOT NULL,
    [ma_dat_cho]        VARCHAR(20)       NOT NULL,
    [id_tai_khoan]      INT               NULL,
    [ho_ten_lien_lac]   NVARCHAR(100)     NOT NULL,
    [email_dat_cho]     VARCHAR(255)      NOT NULL,
    [sdt_dat_cho]       VARCHAR(15)       NOT NULL,
    [cccd]              VARCHAR(20)       NOT NULL DEFAULT '000000000',
    [loai_ve]           VARCHAR(15)       NOT NULL,
    [tong_tien]         DECIMAL(15,2)     NOT NULL,
    [tien_giam]         DECIMAL(15,2)     NOT NULL DEFAULT 0,
    [tien_thanh_toan]   DECIMAL(15,2)     NOT NULL,
    [id_khuyen_mai]     INT               NULL,
    [trang_thai]        VARCHAR(25)       NOT NULL DEFAULT 'cho_thanh_toan',
    [thoi_gian_dat]     DATETIME          NOT NULL DEFAULT GETDATE(),
    [thoi_gian_het_han] DATETIME          NOT NULL,
    CONSTRAINT [PK_DonDatVe]          PRIMARY KEY([id_don_dat_ve]),
    CONSTRAINT [UQ_DDV_MaDon]         UNIQUE([ma_don]),
    CONSTRAINT [UQ_DDV_MaDatCho]      UNIQUE([ma_dat_cho]),
    CONSTRAINT [FK_DDV_TaiKhoan]      FOREIGN KEY([id_tai_khoan]) REFERENCES [TaiKhoan]([id_tai_khoan]),
    CONSTRAINT [FK_DDV_KhuyenMai]     FOREIGN KEY([id_khuyen_mai]) REFERENCES [KhuyenMai]([id_khuyen_mai]),
    CONSTRAINT [CK_DDV_LoaiVe]        CHECK([loai_ve] IN ('mot_chieu','khu_hoi')),
    CONSTRAINT [CK_DDV_TrangThai]     CHECK([trang_thai] IN ('cho_thanh_toan','da_thanh_toan','da_huy','het_han'))
)
GO
CREATE TABLE [dbo].[Ve](
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
    CONSTRAINT [PK_Ve]              PRIMARY KEY([id_ve]),
    CONSTRAINT [FK_Ve_Don]          FOREIGN KEY([id_don_dat_ve]) REFERENCES [DonDatVe]([id_don_dat_ve]),
    CONSTRAINT [FK_Ve_HanhKhach]    FOREIGN KEY([id_hanh_khach]) REFERENCES [HanhKhach]([id_hanh_khach]),
    CONSTRAINT [FK_Ve_Chuyen]       FOREIGN KEY([id_chuyen])     REFERENCES [ChuyenTau]([id_chuyen]),
    CONSTRAINT [FK_Ve_GaLen]        FOREIGN KEY([id_ga_len])     REFERENCES [GaTau]([id_ga]),
    CONSTRAINT [FK_Ve_GaXuong]      FOREIGN KEY([id_ga_xuong])   REFERENCES [GaTau]([id_ga]),
    CONSTRAINT [FK_Ve_CsHuy]        FOREIGN KEY([id_cs_huy])     REFERENCES [ChinhSachHuy]([id_cs_huy]),
    CONSTRAINT [CK_Ve_TrangThai]    CHECK([trang_thai] IN ('cho_xac_nhan','da_xac_nhan','da_huy','da_doi','da_su_dung')),
    CONSTRAINT [CK_Ve_QrVe]         CHECK(ISJSON([qr_ve])=1 OR [qr_ve] IS NULL)
)
GO
CREATE UNIQUE NONCLUSTERED INDEX [UK_Ve_Active]
    ON [dbo].[Ve]([id_chuyen],[so_toa_thu_tu],[so_ghe_trong_toa])
    WHERE ([trang_thai] <> 'da_huy' AND [trang_thai] <> 'da_doi')
GO
CREATE TABLE [dbo].[TamGiuGhe](
    [id_giu]             INT IDENTITY(1,1) NOT NULL,
    [id_chuyen]          INT               NOT NULL,
    [so_toa_thu_tu]      INT               NOT NULL,
    [so_ghe_trong_toa]   INT               NOT NULL,
    [id_don_dat_ve]      INT               NULL,
    [id_tai_khoan]       INT               NULL,
    [session_id]         VARCHAR(100)      NULL,
    [trang_thai]         VARCHAR(20)       NOT NULL DEFAULT 'dang_giu',
    [thoi_gian_giu]      DATETIME          NOT NULL DEFAULT GETDATE(),
    [thoi_gian_het_han]  DATETIME          NOT NULL,
    CONSTRAINT [PK_TamGiuGhe]     PRIMARY KEY([id_giu]),
    CONSTRAINT [FK_TGG_Chuyen]    FOREIGN KEY([id_chuyen])      REFERENCES [ChuyenTau]([id_chuyen]),
    CONSTRAINT [FK_TGG_Don]       FOREIGN KEY([id_don_dat_ve])  REFERENCES [DonDatVe]([id_don_dat_ve]),
    CONSTRAINT [FK_TGG_TaiKhoan]  FOREIGN KEY([id_tai_khoan])   REFERENCES [TaiKhoan]([id_tai_khoan]),
    CONSTRAINT [CK_TGG_TrangThai] CHECK([trang_thai] IN ('dang_giu','da_dat','da_giai_phong','het_han'))
)
GO
CREATE TABLE [dbo].[ThanhToan](
    [id_thanh_toan]          INT IDENTITY(1,1) NOT NULL,
    [ma_giao_dich]           VARCHAR(30)       NOT NULL,
    [id_don_dat_ve]          INT               NOT NULL,
    [phuong_thuc]            VARCHAR(30)       NOT NULL,
    [so_tien]                DECIMAL(15,2)     NOT NULL,
    [phi_giao_dich]          DECIMAL(15,2)     NOT NULL DEFAULT 0,
    [trang_thai]             VARCHAR(25)       NOT NULL,
    [payment_gateway]        VARCHAR(30)       NULL,
    [gateway_transaction_id] VARCHAR(100)      NULL,
    [gateway_response]       NVARCHAR(MAX)     NULL,
    [ma_gd_ngan_hang]        VARCHAR(50)       NULL,
    [qr_thanh_toan]          NVARCHAR(MAX)     NULL,
    [url_thanh_toan]         VARCHAR(500)      NULL,
    [so_lan_thu]             INT               NOT NULL DEFAULT 1,
    [thoi_gian_tao]          DATETIME          NOT NULL DEFAULT GETDATE(),
    [thoi_gian_het_han]      DATETIME          NULL,
    [thoi_gian_thanh_toan]   DATETIME          NULL,
    CONSTRAINT [PK_ThanhToan]        PRIMARY KEY([id_thanh_toan]),
    CONSTRAINT [UQ_ThanhToan_MaGD]   UNIQUE([ma_giao_dich]),
    CONSTRAINT [FK_TT_Don]           FOREIGN KEY([id_don_dat_ve]) REFERENCES [DonDatVe]([id_don_dat_ve]),
    CONSTRAINT [CK_TT_PhuongThuc]    CHECK([phuong_thuc] IN ('tien_mat','the_ngan_hang','zalopay','momo','vnpay')),
    CONSTRAINT [CK_TT_TrangThai]     CHECK([trang_thai] IN ('dang_xu_ly','thanh_cong','that_bai','hoan_tien'))
)
GO
CREATE TABLE [dbo].[HoaDon](
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
    CONSTRAINT [PK_HoaDon]       PRIMARY KEY([id_hoa_don]),
    CONSTRAINT [UQ_HoaDon_SoHD]  UNIQUE([so_hoa_don]),
    CONSTRAINT [FK_HD_Don]       FOREIGN KEY([id_don_dat_ve]) REFERENCES [DonDatVe]([id_don_dat_ve]),
    CONSTRAINT [FK_HD_ThanhToan] FOREIGN KEY([id_thanh_toan]) REFERENCES [ThanhToan]([id_thanh_toan])
)
GO
CREATE TABLE [dbo].[HoanTien](
    [id_hoan]             INT IDENTITY(1,1) NOT NULL,
    [id_ve]               INT               NOT NULL,
    [id_thanh_toan]       INT               NOT NULL,
    [tien_goc]            DECIMAL(15,2)     NOT NULL,
    [phi_huy]             DECIMAL(15,2)     NOT NULL DEFAULT 0,
    [tien_hoan]           DECIMAL(15,2)     NOT NULL,
    [ly_do]               NVARCHAR(500)     NULL,
    [phuong_thuc_hoan]    VARCHAR(25)       NULL,
    [ten_ngan_hang]       NVARCHAR(50)      NULL,
    [so_tai_khoan_hoan]   VARCHAR(30)       NULL,
    [trang_thai_hoan]     VARCHAR(25)       NOT NULL DEFAULT 'cho_xu_ly',
    [thoi_gian_hoan]      DATETIME          NOT NULL DEFAULT GETDATE(),
    [thoi_gian_hoan_xong] DATETIME          NULL,
    CONSTRAINT [PK_HoanTien]     PRIMARY KEY([id_hoan]),
    CONSTRAINT [FK_HT_Ve]        FOREIGN KEY([id_ve])         REFERENCES [Ve]([id_ve]),
    CONSTRAINT [FK_HT_ThanhToan] FOREIGN KEY([id_thanh_toan]) REFERENCES [ThanhToan]([id_thanh_toan])
)
GO
CREATE TABLE [dbo].[DoiVe](
    [id_doi]         INT IDENTITY(1,1) NOT NULL,
    [id_ve_cu]       INT               NOT NULL,
    [id_ve_moi]      INT               NOT NULL,
    [phi_doi]        DECIMAL(15,2)     NOT NULL DEFAULT 0,
    [chenh_lech_gia] DECIMAL(15,2)     NOT NULL DEFAULT 0,
    [tong_phai_tra]  DECIMAL(15,2)     NOT NULL DEFAULT 0,
    [id_thanh_toan]  INT               NULL,
    [trang_thai]     VARCHAR(20)       NOT NULL DEFAULT 'da_doi',
    [thoi_gian_doi]  DATETIME          NOT NULL DEFAULT GETDATE(),
    [ghi_chu]        NVARCHAR(500)     NULL,
    CONSTRAINT [PK_DoiVe]        PRIMARY KEY([id_doi]),
    CONSTRAINT [UQ_DoiVe_VeCu]   UNIQUE([id_ve_cu]),
    CONSTRAINT [FK_DV_VeCu]      FOREIGN KEY([id_ve_cu])      REFERENCES [Ve]([id_ve]),
    CONSTRAINT [FK_DV_VeMoi]     FOREIGN KEY([id_ve_moi])     REFERENCES [Ve]([id_ve]),
    CONSTRAINT [FK_DV_ThanhToan] FOREIGN KEY([id_thanh_toan]) REFERENCES [ThanhToan]([id_thanh_toan])
)
GO
CREATE TABLE [dbo].[DonKhuHoi](
    [id_don_di] INT NOT NULL,
    [id_don_ve] INT NOT NULL,
    CONSTRAINT [PK_DonKhuHoi] PRIMARY KEY([id_don_di],[id_don_ve]),
    CONSTRAINT [FK_DKH_Di]    FOREIGN KEY([id_don_di]) REFERENCES [DonDatVe]([id_don_dat_ve]),
    CONSTRAINT [FK_DKH_Ve2]   FOREIGN KEY([id_don_ve]) REFERENCES [DonDatVe]([id_don_dat_ve])
)
GO
CREATE TABLE [dbo].[CheckIn](
    [id_checkin]     INT IDENTITY(1,1) NOT NULL,
    [id_ve]          INT               NOT NULL,
    [id_ga]          INT               NOT NULL,
    [thoi_gian]      DATETIME          NOT NULL DEFAULT GETDATE(),
    [phuong_thuc]    VARCHAR(20)       NOT NULL DEFAULT 'qr',
    [ket_qua]        VARCHAR(25)       NOT NULL,
    [nhan_vien_id]   INT               NULL,
    [thiet_bi]       VARCHAR(100)      NULL,
    [ghi_chu]        NVARCHAR(500)     NULL,
    CONSTRAINT [PK_CheckIn]         PRIMARY KEY([id_checkin]),
    CONSTRAINT [FK_CI_Ve]           FOREIGN KEY([id_ve])        REFERENCES [Ve]([id_ve]),
    CONSTRAINT [FK_CI_Ga]           FOREIGN KEY([id_ga])        REFERENCES [GaTau]([id_ga]),
    CONSTRAINT [FK_CI_NhanVien]     FOREIGN KEY([nhan_vien_id]) REFERENCES [TaiKhoan]([id_tai_khoan]),
    CONSTRAINT [CK_CI_PhuongThuc]   CHECK([phuong_thuc] IN ('qr','manual','nfc')),
    CONSTRAINT [CK_CI_KetQua]       CHECK([ket_qua] IN ('hop_le','khong_hop_le','da_checkin','sai_ga','qua_han','da_huy'))
)
GO
CREATE TABLE [dbo].[PhanHoi](
    [id_phan_hoi]   INT IDENTITY(1,1) NOT NULL,
    [id_ve]         INT               NOT NULL,
    [id_tai_khoan]  INT               NULL,
    [so_sao]        TINYINT           NOT NULL,
    [noi_dung]      NVARCHAR(MAX)     NULL,
    [loai_phan_hoi] VARCHAR(30)       NOT NULL DEFAULT 'chung',
    [trang_thai]    VARCHAR(25)       NOT NULL DEFAULT 'cho_duyet',
    [thoi_gian_gui] DATETIME          NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [PK_PhanHoi]       PRIMARY KEY([id_phan_hoi]),
    CONSTRAINT [UQ_PhanHoi_Ve]    UNIQUE([id_ve]),
    CONSTRAINT [FK_PH_Ve]         FOREIGN KEY([id_ve])        REFERENCES [Ve]([id_ve]),
    CONSTRAINT [FK_PH_TaiKhoan]   FOREIGN KEY([id_tai_khoan]) REFERENCES [TaiKhoan]([id_tai_khoan]),
    CONSTRAINT [CK_PH_SoSao]      CHECK([so_sao]>=1 AND [so_sao]<=5)
)
GO
CREATE TABLE [dbo].[ThongBao](
    [id_thong_bao]  INT IDENTITY(1,1) NOT NULL,
    [id_tai_khoan]  INT               NOT NULL,
    [tieu_de]       NVARCHAR(200)     NOT NULL,
    [noi_dung]      NVARCHAR(MAX)     NOT NULL,
    [loai]          VARCHAR(30)       NOT NULL DEFAULT 'he_thong',
    [da_doc]        BIT               NOT NULL DEFAULT 0,
    [lien_ket]      VARCHAR(255)      NULL,
    [thoi_gian_tao] DATETIME          NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [PK_ThongBao]       PRIMARY KEY([id_thong_bao]),
    CONSTRAINT [FK_TB_TaiKhoan]    FOREIGN KEY([id_tai_khoan]) REFERENCES [TaiKhoan]([id_tai_khoan]),
    CONSTRAINT [CK_TB_Loai]        CHECK([loai] IN ('dat_ve','huy_ve','doi_ve','khuyen_mai','he_thong'))
)
GO
CREATE TABLE [dbo].[AuditLog](
    [id_log]       BIGINT IDENTITY(1,1) NOT NULL,
    [bang]         VARCHAR(100)         NOT NULL,
    [ma_ban_ghi]   VARCHAR(100)         NOT NULL,
    [hanh_dong]    VARCHAR(15)          NOT NULL,
    [gia_tri_cu]   NVARCHAR(MAX)        NULL,
    [gia_tri_moi]  NVARCHAR(MAX)        NULL,
    [id_tai_khoan] INT                  NULL,
    [ip_address]   VARCHAR(45)          NULL,
    [user_agent]   NVARCHAR(500)        NULL,
    [thoi_gian]    DATETIME             NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [PK_AuditLog]         PRIMARY KEY([id_log]),
    CONSTRAINT [CK_AuditLog_HanhDong] CHECK([hanh_dong] IN ('INSERT','UPDATE','DELETE'))
)
GO
IF OBJECT_ID('sq_ma_don','SO') IS NULL
    CREATE SEQUENCE [sq_ma_don] AS INT START WITH 1001 INCREMENT BY 1
GO

-- INDEXES
CREATE INDEX [IX_Ve_Don]        ON [Ve]([id_don_dat_ve])
CREATE INDEX [IX_Ve_Chuyen]     ON [Ve]([id_chuyen],[so_toa_thu_tu],[so_ghe_trong_toa])
CREATE INDEX [IX_TGG_Chuyen]    ON [TamGiuGhe]([id_chuyen],[so_toa_thu_tu],[so_ghe_trong_toa])
CREATE INDEX [IX_TGG_HetHan]    ON [TamGiuGhe]([thoi_gian_het_han]) WHERE ([trang_thai]='dang_giu')
CREATE INDEX [IX_CT_NgayChay]   ON [ChuyenTau]([ngay_chay])
CREATE INDEX [IX_DDV_TaiKhoan]  ON [DonDatVe]([id_tai_khoan])
CREATE INDEX [IX_TT_Don]        ON [ThanhToan]([id_don_dat_ve])
CREATE INDEX [IX_LTTT_Chuyen]   ON [LichTrinhThucTe]([id_chuyen])
CREATE INDEX [IX_CI_Ve]         ON [CheckIn]([id_ve])
GO

-- FUNCTIONS
CREATE FUNCTION [dbo].[fn_TinhGiaVe](@id_chuyen INT,@id_ga_len INT,@id_ga_xuong INT,@id_loai_ghe INT)
RETURNS DECIMAL(15,2)
AS
BEGIN
    DECLARE @id_lich INT DECLARE @ngay DATE DECLARE @km DECIMAL(10,2)
    DECLARE @don_gia DECIMAL(12,2) DECLARE @he_so_tang DECIMAL(4,2) DECLARE @he_so_ghe DECIMAL(4,2)
    SELECT @id_lich=ct.id_lich_chay,@ngay=ct.ngay_chay FROM ChuyenTau ct WHERE ct.id_chuyen=@id_chuyen
    SELECT @km=ABS((SELECT khoang_cach_km FROM LichTrinhChuyen WHERE id_lich_chay=@id_lich AND id_ga=@id_ga_xuong)
                  -(SELECT khoang_cach_km FROM LichTrinhChuyen WHERE id_lich_chay=@id_lich AND id_ga=@id_ga_len))
    SELECT TOP 1 @don_gia=bg.don_gia_km_goc,@he_so_tang=bg.he_so_tang FROM BieuGia bg
    WHERE bg.trang_thai='dang_ap_dung' AND @ngay BETWEEN bg.ngay_bat_dau AND bg.ngay_ket_thuc
      AND (bg.id_loai_ghe IS NULL OR bg.id_loai_ghe=@id_loai_ghe) ORDER BY bg.he_so_tang DESC
    SET @don_gia=ISNULL(@don_gia,264.00) SET @he_so_tang=ISNULL(@he_so_tang,1.00)
    SELECT @he_so_ghe=he_so_gia FROM LoaiGhe WHERE id_loai_ghe=@id_loai_ghe
    SET @he_so_ghe=ISNULL(@he_so_ghe,1.00)
    RETURN CEILING(@km*@don_gia*@he_so_tang*@he_so_ghe/1000.0)*1000.0
END
GO
CREATE FUNCTION [dbo].[fn_GheTrongCuaToa](@id_chuyen INT,@so_toa INT)
RETURNS INT
AS
BEGIN
    DECLARE @tong INT DECLARE @da_dat INT DECLARE @dang_giu INT
    DECLARE @id_tau INT DECLARE @id_loai_toa INT
    SELECT @id_tau=lc.id_tau FROM ChuyenTau ct JOIN LichChay lc ON lc.id_lich_chay=ct.id_lich_chay WHERE ct.id_chuyen=@id_chuyen
    SELECT @id_loai_toa=id_loai_toa FROM CauHinhToa WHERE id_tau=@id_tau AND so_toa_thu_tu=@so_toa
    SELECT @tong=so_cho_toi_da FROM LoaiToa WHERE id_loai_toa=@id_loai_toa
    SELECT @da_dat=COUNT(*) FROM Ve WHERE id_chuyen=@id_chuyen AND so_toa_thu_tu=@so_toa AND trang_thai NOT IN ('da_huy','da_doi')
    SELECT @dang_giu=COUNT(*) FROM TamGiuGhe WHERE id_chuyen=@id_chuyen AND so_toa_thu_tu=@so_toa AND trang_thai='dang_giu' AND thoi_gian_het_han>DATEADD(HOUR,7,GETUTCDATE())
    RETURN ISNULL(@tong,0)-ISNULL(@da_dat,0)-ISNULL(@dang_giu,0)
END
GO

-- ============================================================
-- SECTION 2: DỮ LIỆU THAM CHIẾU
-- ============================================================

-- SystemConfig
INSERT INTO [SystemConfig]([config_key],[config_value],[kieu_du_lieu],[nhom],[mo_ta]) VALUES
('HOLD_MINUTES','15','int','booking',N'Số phút giữ chỗ tạm'),
('PAYMENT_TIMEOUT','15','int','payment',N'Thời gian thanh toán tối đa (phút)'),
('MAX_TICKETS_PER_ORDER','4','int','booking',N'Số vé tối đa mỗi đơn'),
('SERVICE_FEE_ONE_WAY','20000','decimal','pricing',N'Phí dịch vụ vé 1 chiều (đ)'),
('SERVICE_FEE_ROUND','40000','decimal','pricing',N'Phí dịch vụ vé khứ hồi (đ)'),
('DEFAULT_GIA_KM','264','decimal','pricing',N'Đơn giá gốc (đ/km)'),
('CHILD_DISCOUNT_PCT','25','decimal','pricing',N'Giảm giá trẻ em (%)'),
('EXCHANGE_FEE_PCT','5','decimal','exchange',N'Phí đổi vé (%)'),
('EXCHANGE_FEE_MIN','20000','decimal','exchange',N'Phí đổi vé tối thiểu (đ)'),
('EXCHANGE_MIN_HOURS','24','int','exchange',N'Tối thiểu giờ trước khi đổi'),
('REFUND_PROCESSING_DAYS','3','int','cancel',N'Ngày xử lý hoàn tiền'),
('QR_BASE_URL','https://img.vietqr.io/image','string','payment',N'Base URL VietQR'),
('BANK_ACCOUNT','9630630005144911','string','payment',N'Số tài khoản'),
('BANK_NAME','BIDV','string','payment',N'Ngân hàng')
GO

-- VaiTro
SET IDENTITY_INSERT [VaiTro] ON
INSERT INTO [VaiTro]([id_vai_tro],[ma_vai_tro],[ten_vai_tro],[mo_ta]) VALUES
(1,'quan_tri',N'Quản trị viên',N'Toàn quyền hệ thống'),
(2,'dieu_phoi',N'Điều phối viên',N'Điều phối lịch tàu, toa, chuyến'),
(3,'kiem_soat_ve',N'Kiểm soát vé',N'Kiểm tra vé tại ga, check-in'),
(4,'ke_toan',N'Kế toán',N'Xem báo cáo tài chính, hoàn tiền'),
(5,'nhan_vien_ban',N'Nhân viên bán vé',N'Bán vé tại quầy'),
(6,'khach_hang',N'Khách hàng',N'Đặt vé, tra cứu, quản lý đơn')
SET IDENTITY_INSERT [VaiTro] OFF
GO

-- Quyen
SET IDENTITY_INSERT [Quyen] ON
INSERT INTO [Quyen]([id_quyen],[ma_quyen],[ten_quyen],[nhom_quyen]) VALUES
(1,'ve.create',N'Tạo vé','ve'),(2,'ve.view',N'Xem vé','ve'),
(3,'ve.cancel',N'Hủy vé','ve'),(4,'ve.exchange',N'Đổi vé','ve'),
(5,'ve.checkin',N'Check-in vé','ve'),(6,'don.view',N'Xem đơn đặt vé','don'),
(7,'don.manage',N'Quản lý đơn','don'),(8,'chuyen.view',N'Xem chuyến tàu','chuyen'),
(9,'chuyen.create',N'Tạo chuyến tàu','chuyen'),(10,'chuyen.manage',N'Quản lý chuyến','chuyen'),
(11,'dieu_phoi.manage',N'Điều phối vận hành','dieu_phoi'),
(12,'thanhtoan.view',N'Xem thanh toán','thanhtoan'),
(13,'thanhtoan.refund',N'Hoàn tiền','thanhtoan'),
(14,'baocao.view',N'Xem báo cáo','baocao'),
(15,'user.manage',N'Quản lý người dùng','user'),
(16,'config.manage',N'Quản lý cấu hình','config')
SET IDENTITY_INSERT [Quyen] OFF
GO

-- VaiTroQuyen (admin all, others selective)
INSERT INTO [VaiTroQuyen] SELECT 1,id_quyen FROM Quyen -- admin: all
INSERT INTO [VaiTroQuyen] SELECT 2,id_quyen FROM Quyen WHERE ma_quyen IN ('chuyen.view','chuyen.create','chuyen.manage','dieu_phoi.manage','baocao.view')
INSERT INTO [VaiTroQuyen] SELECT 3,id_quyen FROM Quyen WHERE ma_quyen IN ('ve.view','ve.checkin','don.view','chuyen.view')
INSERT INTO [VaiTroQuyen] SELECT 4,id_quyen FROM Quyen WHERE ma_quyen IN ('thanhtoan.view','thanhtoan.refund','baocao.view','don.view')
INSERT INTO [VaiTroQuyen] SELECT 5,id_quyen FROM Quyen WHERE ma_quyen IN ('ve.create','ve.view','ve.cancel','don.view','don.manage','chuyen.view','thanhtoan.view')
INSERT INTO [VaiTroQuyen] SELECT 6,id_quyen FROM Quyen WHERE ma_quyen IN ('ve.create','ve.view','ve.cancel','ve.exchange','don.view')
GO

-- GaTau (85 ga tuyến Hà Nội – Sài Gòn thực tế ĐSVN)
SET IDENTITY_INSERT [GaTau] ON
INSERT INTO [GaTau]([id_ga],[ma_ga_viet_tat],[ten_ga],[tinh_thanh],[thu_tu_tuyen],[do_uu_tien]) VALUES
(1,'HNO',N'Ga Hà Nội',N'Hà Nội',1,100),
(2,'GBT',N'Ga Giáp Bát',N'Hà Nội',2,80),
(3,'VDI',N'Ga Văn Điển',N'Hà Nội',3,70),
(4,'DNA',N'Ga Đống Anh',N'Hà Nội',4,60),
(5,'TRO',N'Ga Thường Tín',N'Hà Nội',5,50),
(6,'PLY',N'Ga Phủ Lý',N'Hà Nam',6,80),
(7,'DVA',N'Ga Đồng Văn',N'Hà Nam',7,60),
(8,'BLC',N'Ga Bình Lục',N'Hà Nam',8,50),
(9,'NAD',N'Ga Nam Định',N'Nam Định',9,85),
(10,'NGO',N'Ga Núi Gôi',N'Nam Định',10,65),
(11,'TXU',N'Ga Trình Xuyên',N'Nam Định',11,55),
(12,'NBI',N'Ga Ninh Bình',N'Ninh Bình',12,85),
(13,'CAY',N'Ga Cầu Yên',N'Ninh Bình',13,60),
(14,'DGI',N'Ga Đồng Giao',N'Ninh Bình',14,55),
(15,'THO',N'Ga Thanh Hóa',N'Thanh Hóa',15,90),
(16,'BIM',N'Ga Bỉm Sơn',N'Thanh Hóa',16,70),
(17,'DOL',N'Ga Đò Lèn',N'Thanh Hóa',17,60),
(18,'TLM',N'Ga Trường Lâm',N'Thanh Hóa',18,55),
(19,'MKI',N'Ga Minh Khôi',N'Thanh Hóa',19,50),
(20,'VIN',N'Ga Vinh',N'Nghệ An',20,100),
(21,'HMA',N'Ga Hoàng Mai',N'Nghệ An',21,75),
(22,'QHA',N'Ga Quán Hành',N'Nghệ An',22,65),
(23,'CGT',N'Ga Cầu Giát',N'Nghệ An',23,60),
(24,'CSY',N'Ga Chợ Sy',N'Nghệ An',24,50),
(25,'HTP',N'Ga Hương Phố',N'Hà Tĩnh',25,70),
(26,'PTR',N'Ga Phúc Trạch',N'Hà Tĩnh',26,65),
(27,'LAK',N'Ga La Khê',N'Hà Tĩnh',27,55),
(28,'CLE',N'Ga Chu Lễ',N'Hà Tĩnh',28,50),
(29,'DOH',N'Ga Đồng Hới',N'Quảng Bình',29,85),
(30,'TAP',N'Ga Tân Ấp',N'Quảng Bình',30,70),
(31,'HLA',N'Ga Hoàn Lão',N'Quảng Bình',31,60),
(32,'DLO',N'Ga Đồng Lê',N'Quảng Bình',32,55),
(33,'DHA',N'Ga Đông Hà',N'Quảng Trị',33,80),
(34,'QTR',N'Ga Quảng Trị',N'Quảng Trị',34,70),
(35,'DSH',N'Ga Diên Sanh',N'Quảng Trị',35,60),
(36,'PTC',N'Ga Phò Trạch',N'Thừa Thiên Huế',36,55),
(37,'HUE',N'Ga Huế',N'Thừa Thiên Huế',37,95),
(38,'LCO',N'Ga Lăng Cô',N'Thừa Thiên Huế',38,75),
(39,'HVB',N'Ga Hải Vân Bắc',N'Đà Nẵng',39,70),
(40,'HVN',N'Ga Hải Vân Nam',N'Đà Nẵng',40,70),
(41,'TKH',N'Ga Thanh Khê',N'Đà Nẵng',41,65),
(42,'DNG',N'Ga Đà Nẵng',N'Đà Nẵng',42,100),
(43,'KLI',N'Ga Kim Liên',N'Đà Nẵng',43,80),
(44,'HVB2',N'Ga Hải Vân Bắc',N'Đà Nẵng',44,70),
(45,'TKY',N'Ga Tam Kỳ',N'Quảng Nam',45,80),
(46,'NTH',N'Ga Núi Thành',N'Quảng Nam',46,70),
(47,'PCG',N'Ga Phú Cang',N'Quảng Nam',47,60),
(48,'AMY',N'Ga An Mỹ',N'Quảng Nam',48,55),
(49,'QNG',N'Ga Quảng Ngãi',N'Quảng Ngãi',49,85),
(50,'BSN',N'Ga Bình Sơn',N'Quảng Ngãi',50,70),
(51,'DPH',N'Ga Đức Phổ',N'Quảng Ngãi',51,65),
(52,'MDU',N'Ga Mộ Đức',N'Quảng Ngãi',52,55),
(53,'DTR',N'Ga Diêu Trì',N'Bình Định',53,85),
(54,'QNH',N'Ga Quy Nhơn',N'Bình Định',54,80),
(55,'BDI',N'Ga Bình Định',N'Bình Định',55,70),
(56,'PCA',N'Ga Phù Cát',N'Bình Định',56,65),
(57,'BOS',N'Ga Bồng Sơn',N'Bình Định',57,60),
(58,'TYH',N'Ga Tuy Hòa',N'Phú Yên',58,85),
(59,'CTH',N'Ga Chí Thạnh',N'Phú Yên',59,70),
(60,'LHA',N'Ga La Hai',N'Phú Yên',60,65),
(61,'DTA',N'Ga Đồng Tác',N'Phú Yên',61,55),
(62,'NTR',N'Ga Nha Trang',N'Khánh Hòa',62,100),
(63,'NHO',N'Ga Ninh Hòa',N'Khánh Hòa',63,80),
(64,'DLA',N'Ga Đại Lãnh',N'Khánh Hòa',64,70),
(65,'GIA',N'Ga Giã',N'Khánh Hòa',65,60),
(66,'TBG',N'Ga Tu Bông',N'Khánh Hòa',66,55),
(67,'TCH',N'Ga Tháp Chàm',N'Ninh Thuận',67,80),
(68,'CAN',N'Ga Cà Ná',N'Ninh Thuận',68,65),
(69,'PNH',N'Ga Phước Nhơn',N'Ninh Thuận',69,55),
(70,'PTH',N'Ga Phan Thiết',N'Bình Thuận',70,85),
(71,'BTH',N'Ga Bình Thuận',N'Bình Thuận',71,75),
(72,'MAL',N'Ga Ma Lâm',N'Bình Thuận',72,65),
(73,'VHO',N'Ga Vĩnh Hảo',N'Bình Thuận',73,60),
(74,'SMA',N'Ga Sông Mao',N'Bình Thuận',74,55),
(75,'BHO',N'Ga Biên Hòa',N'Đồng Nai',75,85),
(76,'LKA',N'Ga Long Khánh',N'Đồng Nai',76,75),
(77,'TRB',N'Ga Trảng Bom',N'Đồng Nai',77,70),
(78,'DGY',N'Ga Dầu Giây',N'Đồng Nai',78,70),
(79,'GRY',N'Ga Gia Ray',N'Đồng Nai',79,60),
(80,'DAN',N'Ga Dĩ An',N'Bình Dương',80,80),
(81,'SGO',N'Ga Sài Gòn',N'TP Hồ Chí Minh',81,100),
(82,'DAA',N'Ga Dĩ An',N'Bình Dương',82,80),
(83,'STH',N'Ga Sóng Thần',N'Bình Dương',83,75),
(84,'BTU',N'Ga Bình Triệu',N'TP Hồ Chí Minh',84,70),
(85,'GVP',N'Ga Gò Vấp',N'TP Hồ Chí Minh',85,65)
SET IDENTITY_INSERT [GaTau] OFF
GO

-- LoaiToa
SET IDENTITY_INSERT [LoaiToa] ON
INSERT INTO [LoaiToa]([id_loai_toa],[ma_loai_toa],[ten_loai_toa],[loai_ghe_chinh],[so_cho_toi_da]) VALUES
(1,'GN4_DH',N'Giường nằm khoang 4 điều hòa','GN4D',28),
(2,'GN6_DH',N'Giường nằm khoang 6 điều hòa','GN6D',42),
(3,'NM_DH', N'Ngồi mềm có điều hòa',         'NMH', 64),
(4,'NM',    N'Ngồi mềm không điều hòa',       'NMK', 64),
(5,'NC_DH', N'Ngồi cứng có điều hòa',         'NCH', 80),
(6,'NC',    N'Ngồi cứng không điều hòa',      'NCK', 80)
SET IDENTITY_INSERT [LoaiToa] OFF
GO

-- LoaiGhe
SET IDENTITY_INSERT [LoaiGhe] ON
INSERT INTO [LoaiGhe]([id_loai_ghe],[ma_loai_ghe],[id_loai_toa],[ten_loai_ghe],[he_so_gia]) VALUES
(1,'GN4T',1,N'Giường nằm khoang 4 – tầng trên',1.55),
(2,'GN4G',1,N'Giường nằm khoang 4 – tầng giữa',1.70),
(3,'GN4D',1,N'Giường nằm khoang 4 – tầng dưới',1.85),
(4,'GN6T',2,N'Giường nằm khoang 6 – tầng trên',1.20),
(5,'GN6G',2,N'Giường nằm khoang 6 – tầng giữa',1.35),
(6,'GN6D',2,N'Giường nằm khoang 6 – tầng dưới',1.50),
(7,'NMH', 3,N'Ngồi mềm điều hòa',               1.00),
(8,'NMK', 4,N'Ngồi mềm không điều hòa',          0.85),
(9,'NCH', 5,N'Ngồi cứng điều hòa',               0.75),
(10,'NCK',6,N'Ngồi cứng không điều hòa',         0.65)
SET IDENTITY_INSERT [LoaiGhe] OFF
GO

-- Tau (10 tàu)
SET IDENTITY_INSERT [Tau] ON
INSERT INTO [Tau]([id_tau],[so_hieu],[ten_tau],[so_toa],[trang_thai]) VALUES
(1,'SE1',N'Tàu Thống Nhất SE1',14,'hoat_dong'),
(2,'SE2',N'Tàu Thống Nhất SE2',14,'hoat_dong'),
(3,'SE3',N'Tàu Tốc Hành SE3', 12,'hoat_dong'),
(4,'SE4',N'Tàu Tốc Hành SE4', 12,'hoat_dong'),
(5,'SE5',N'Tàu Tốc Hành SE5', 12,'hoat_dong'),
(6,'SE6',N'Tàu Tốc Hành SE6', 12,'hoat_dong'),
(7,'SE7',N'Tàu Tốc Hành SE7', 12,'hoat_dong'),
(8,'SE8',N'Tàu Tốc Hành SE8', 12,'hoat_dong'),
(9,'TN1',N'Tàu Nhanh TN1',    10,'hoat_dong'),
(10,'TN2',N'Tàu Nhanh TN2',   10,'hoat_dong')
SET IDENTITY_INSERT [Tau] OFF
GO

-- CauHinhToa: SE1/SE2 (14 toa), SE3-SE8 (12 toa), TN1/TN2 (10 toa)
SET IDENTITY_INSERT [CauHinhToa] ON
-- SE1 (id_tau=1): 2 GN4, 4 GN6, 4 NM_DH, 2 NC_DH, 2 NC
INSERT INTO [CauHinhToa]([id_cau_hinh_toa],[id_tau],[so_toa_thu_tu],[id_loai_toa]) VALUES
(1,1,1,1),(2,1,2,1),(3,1,3,2),(4,1,4,2),(5,1,5,2),(6,1,6,2),(7,1,7,3),(8,1,8,3),(9,1,9,3),(10,1,10,3),(11,1,11,5),(12,1,12,5),(13,1,13,6),(14,1,14,6),
-- SE2 (id_tau=2): giống SE1
(25,2,1,1),(26,2,2,1),(27,2,3,2),(28,2,4,2),(29,2,5,2),(30,2,6,2),(31,2,7,3),(32,2,8,3),(33,2,9,3),(34,2,10,3),(35,2,11,5),(36,2,12,5),(37,2,13,6),(38,2,14,6),
-- SE3 (id_tau=3): 12 toa
(49,3,1,1),(50,3,2,1),(51,3,3,2),(52,3,4,2),(53,3,5,2),(54,3,6,2),(55,3,7,3),(56,3,8,3),(57,3,9,3),(58,3,10,3),(59,3,11,4),(60,3,12,6),
-- SE4 (id_tau=4)
(61,4,1,1),(62,4,2,1),(63,4,3,2),(64,4,4,2),(65,4,5,2),(66,4,6,2),(67,4,7,3),(68,4,8,3),(69,4,9,3),(70,4,10,3),(71,4,11,5),(72,4,12,6),
-- SE5 (id_tau=5)
(73,5,1,1),(74,5,2,1),(75,5,3,2),(76,5,4,2),(77,5,5,2),(78,5,6,2),(79,5,7,3),(80,5,8,3),(81,5,9,3),(82,5,10,3),(83,5,11,5),(84,5,12,6),
-- SE6 (id_tau=6)
(85,6,1,1),(86,6,2,1),(87,6,3,2),(88,6,4,2),(89,6,5,2),(90,6,6,2),(91,6,7,3),(92,6,8,3),(93,6,9,3),(94,6,10,3),(95,6,11,5),(96,6,12,6),
-- SE7 (id_tau=7)
(97,7,1,1),(98,7,2,2),(99,7,3,2),(100,7,4,2),(101,7,5,2),(102,7,6,3),(103,7,7,3),(104,7,8,3),(105,7,9,3),(106,7,10,4),(107,7,11,5),(108,7,12,6),
-- SE8 (id_tau=8)
(109,8,1,1),(110,8,2,2),(111,8,3,2),(112,8,4,2),(113,8,5,2),(114,8,6,3),(115,8,7,3),(116,8,8,3),(117,8,9,3),(118,8,10,4),(119,8,11,5),(120,8,12,6),
-- TN1 (id_tau=9): 10 toa
(121,9,1,2),(122,9,2,2),(123,9,3,2),(124,9,4,3),(125,9,5,3),(126,9,6,3),(127,9,7,3),(128,9,8,4),(129,9,9,5),(130,9,10,6),
-- TN2 (id_tau=10)
(131,10,1,2),(132,10,2,2),(133,10,3,2),(134,10,4,3),(135,10,5,3),(136,10,6,3),(137,10,7,3),(138,10,8,4),(139,10,9,5),(140,10,10,6)
SET IDENTITY_INSERT [CauHinhToa] OFF
GO

-- CauHinhGhe: GN4 (28 ghế), GN6 (42 ghế), NM/NC (64/80 ghế)
-- GN4 khoang 4 (id_loai_toa=1): 7 khoang × 4 ghế = 28
SET IDENTITY_INSERT [CauHinhGhe] ON
-- GN4 (toa 1): 7 khoang, mỗi khoang 4 ghế (T/T,G,D)
INSERT INTO [CauHinhGhe]([id_cau_hinh_ghe],[id_loai_toa],[so_ghe_trong_toa],[id_loai_ghe],[vi_tri],[tang],[khoang_so],[ben]) VALUES
(1,1,1,1,'Khoang 1 – A – Trên','Tren',1,'A'),(2,1,2,3,'Khoang 1 – A – Dưới','Duoi',1,'A'),
(3,1,3,1,'Khoang 1 – B – Trên','Tren',1,'B'),(4,1,4,3,'Khoang 1 – B – Dưới','Duoi',1,'B'),
(5,1,5,1,'Khoang 2 – A – Trên','Tren',2,'A'),(6,1,6,3,'Khoang 2 – A – Dưới','Duoi',2,'A'),
(7,1,7,1,'Khoang 2 – B – Trên','Tren',2,'B'),(8,1,8,3,'Khoang 2 – B – Dưới','Duoi',2,'B'),
(9,1,9,1,'Khoang 3 – A – Trên','Tren',3,'A'),(10,1,10,3,'Khoang 3 – A – Dưới','Duoi',3,'A'),
(11,1,11,1,'Khoang 3 – B – Trên','Tren',3,'B'),(12,1,12,3,'Khoang 3 – B – Dưới','Duoi',3,'B'),
(13,1,13,1,'Khoang 4 – A – Trên','Tren',4,'A'),(14,1,14,3,'Khoang 4 – A – Dưới','Duoi',4,'A'),
(15,1,15,1,'Khoang 4 – B – Trên','Tren',4,'B'),(16,1,16,3,'Khoang 4 – B – Dưới','Duoi',4,'B'),
(17,1,17,1,'Khoang 5 – A – Trên','Tren',5,'A'),(18,1,18,3,'Khoang 5 – A – Dưới','Duoi',5,'A'),
(19,1,19,1,'Khoang 5 – B – Trên','Tren',5,'B'),(20,1,20,3,'Khoang 5 – B – Dưới','Duoi',5,'B'),
(21,1,21,1,'Khoang 6 – A – Trên','Tren',6,'A'),(22,1,22,3,'Khoang 6 – A – Dưới','Duoi',6,'A'),
(23,1,23,1,'Khoang 6 – B – Trên','Tren',6,'B'),(24,1,24,3,'Khoang 6 – B – Dưới','Duoi',6,'B'),
(25,1,25,1,'Khoang 7 – A – Trên','Tren',7,'A'),(26,1,26,3,'Khoang 7 – A – Dưới','Duoi',7,'A'),
(27,1,27,1,'Khoang 7 – B – Trên','Tren',7,'B'),(28,1,28,3,'Khoang 7 – B – Dưới','Duoi',7,'B')
GO
-- GN6 (toa 2): 7 khoang × 6 ghế = 42
INSERT INTO [CauHinhGhe]([id_cau_hinh_ghe],[id_loai_toa],[so_ghe_trong_toa],[id_loai_ghe],[vi_tri],[tang],[khoang_so],[ben]) VALUES
(29,2,1,4,'Khoang 1 – A – Trên','Tren',1,'A'),(30,2,2,5,'Khoang 1 – A – Giữa','Giua',1,'A'),
(31,2,3,6,'Khoang 1 – A – Dưới','Duoi',1,'A'),(32,2,4,4,'Khoang 1 – B – Trên','Tren',1,'B'),
(33,2,5,5,'Khoang 1 – B – Giữa','Giua',1,'B'),(34,2,6,6,'Khoang 1 – B – Dưới','Duoi',1,'B'),
(35,2,7,4,'Khoang 2 – A – Trên','Tren',2,'A'),(36,2,8,5,'Khoang 2 – A – Giữa','Giua',2,'A'),
(37,2,9,6,'Khoang 2 – A – Dưới','Duoi',2,'A'),(38,2,10,4,'Khoang 2 – B – Trên','Tren',2,'B'),
(39,2,11,5,'Khoang 2 – B – Giữa','Giua',2,'B'),(40,2,12,6,'Khoang 2 – B – Dưới','Duoi',2,'B'),
(41,2,13,4,'Khoang 3 – A – Trên','Tren',3,'A'),(42,2,14,5,'Khoang 3 – A – Giữa','Giua',3,'A'),
(43,2,15,6,'Khoang 3 – A – Dưới','Duoi',3,'A'),(44,2,16,4,'Khoang 3 – B – Trên','Tren',3,'B'),
(45,2,17,5,'Khoang 3 – B – Giữa','Giua',3,'B'),(46,2,18,6,'Khoang 3 – B – Dưới','Duoi',3,'B'),
(47,2,19,4,'Khoang 4 – A – Trên','Tren',4,'A'),(48,2,20,5,'Khoang 4 – A – Giữa','Giua',4,'A'),
(49,2,21,6,'Khoang 4 – A – Dưới','Duoi',4,'A'),(50,2,22,4,'Khoang 4 – B – Trên','Tren',4,'B'),
(51,2,23,5,'Khoang 4 – B – Giữa','Giua',4,'B'),(52,2,24,6,'Khoang 4 – B – Dưới','Duoi',4,'B'),
(53,2,25,4,'Khoang 5 – A – Trên','Tren',5,'A'),(54,2,26,5,'Khoang 5 – A – Giữa','Giua',5,'A'),
(55,2,27,6,'Khoang 5 – A – Dưới','Duoi',5,'A'),(56,2,28,4,'Khoang 5 – B – Trên','Tren',5,'B'),
(57,2,29,5,'Khoang 5 – B – Giữa','Giua',5,'B'),(58,2,30,6,'Khoang 5 – B – Dưới','Duoi',5,'B'),
(59,2,31,4,'Khoang 6 – A – Trên','Tren',6,'A'),(60,2,32,5,'Khoang 6 – A – Giữa','Giua',6,'A'),
(61,2,33,6,'Khoang 6 – A – Dưới','Duoi',6,'A'),(62,2,34,4,'Khoang 6 – B – Trên','Tren',6,'B'),
(63,2,35,5,'Khoang 6 – B – Giữa','Giua',6,'B'),(64,2,36,6,'Khoang 6 – B – Dưới','Duoi',6,'B'),
(65,2,37,4,'Khoang 7 – A – Trên','Tren',7,'A'),(66,2,38,5,'Khoang 7 – A – Giữa','Giua',7,'A'),
(67,2,39,6,'Khoang 7 – A – Dưới','Duoi',7,'A'),(68,2,40,4,'Khoang 7 – B – Trên','Tren',7,'B'),
(69,2,41,5,'Khoang 7 – B – Giữa','Giua',7,'B'),(70,2,42,6,'Khoang 7 – B – Dưới','Duoi',7,'B')
GO
-- NM_DH (toa 3): 64 ghế (hàng 1-8 x 8 ghế/hàng)
DECLARE @g INT=71, @r INT=1
WHILE @r<=8 BEGIN
    DECLARE @c INT=1
    WHILE @c<=8 BEGIN
        INSERT INTO [CauHinhGhe]([id_cau_hinh_ghe],[id_loai_toa],[so_ghe_trong_toa],[id_loai_ghe],[vi_tri],[khoang_so],[ben])
        VALUES(@g,3,@g-70,7,N'Hàng '+CAST(@r AS NVARCHAR)+N' – Ghế '+CAST(@c AS NVARCHAR),@r,CASE WHEN @c<=4 THEN 'T' ELSE 'P' END)
        SET @g=@g+1 SET @c=@c+1
    END
    SET @r=@r+1
END
GO
-- NC_DH (toa 5): 80 ghế
DECLARE @g2 INT=135, @r2 INT=1
WHILE @r2<=10 BEGIN
    DECLARE @c2 INT=1
    WHILE @c2<=8 BEGIN
        INSERT INTO [CauHinhGhe]([id_cau_hinh_ghe],[id_loai_toa],[so_ghe_trong_toa],[id_loai_ghe],[vi_tri],[khoang_so],[ben])
        VALUES(@g2,5,@g2-134,9,N'Hàng '+CAST(@r2 AS NVARCHAR)+N' – Ghế '+CAST(@c2 AS NVARCHAR),@r2,CASE WHEN @c2<=4 THEN 'T' ELSE 'P' END)
        SET @g2=@g2+1 SET @c2=@c2+1
    END
    SET @r2=@r2+1
END
GO
-- NC (toa 6): 80 ghế
DECLARE @g3 INT=215, @r3 INT=1
WHILE @r3<=10 BEGIN
    DECLARE @c3 INT=1
    WHILE @c3<=8 BEGIN
        INSERT INTO [CauHinhGhe]([id_cau_hinh_ghe],[id_loai_toa],[so_ghe_trong_toa],[id_loai_ghe],[vi_tri],[khoang_so],[ben])
        VALUES(@g3,6,@g3-214,10,N'Hàng '+CAST(@r3 AS NVARCHAR)+N' – Ghế '+CAST(@c3 AS NVARCHAR),@r3,CASE WHEN @c3<=4 THEN 'T' ELSE 'P' END)
        SET @g3=@g3+1 SET @c3=@c3+1
    END
    SET @r3=@r3+1
END
SET IDENTITY_INSERT [CauHinhGhe] OFF
GO

-- LichChay (10 lịch – giờ thực tế ĐSVN)
SET IDENTITY_INSERT [LichChay] ON
INSERT INTO [LichChay]([id_lich_chay],[id_tau],[id_ga_di],[id_ga_den],[gio_khoi_hanh],[gio_du_kien_den],[thu_trong_tuan]) VALUES
(1,7,1,81,'06:00','17:00',N'hang_ngay'), -- SE7: HN→SG 06:00
(2,5,1,81,'08:00','18:20',N'hang_ngay'), -- SE5: HN→SG 08:00
(3,9,1,81,'13:00','03:20',N'hang_ngay'), -- TN1: HN→SG 13:00
(4,3,1,81,'19:20','05:30',N'hang_ngay'), -- SE3: HN→SG 19:20
(5,1,1,81,'21:45','06:30',N'hang_ngay'), -- SE1: HN→SG 21:45
(6,8,81,1,'06:00','16:20',N'hang_ngay'), -- SE8: SG→HN 06:00
(7,6,81,1,'08:45','19:14',N'hang_ngay'), -- SE6: SG→HN 08:45
(8,10,81,1,'13:15','03:40',N'hang_ngay'), -- TN2: SG→HN 13:15
(9,4,81,1,'19:20','04:36',N'hang_ngay'), -- SE4: SG→HN 19:20
(10,2,81,1,'20:35','05:42',N'hang_ngay')  -- SE2: SG→HN 20:35
SET IDENTITY_INSERT [LichChay] OFF
GO

-- LichTrinhChuyen: chi tiết dừng của lịch 1 (SE7: HN→SG)
-- Các điểm dừng chính với khoảng cách km thực tế ĐSVN
SET IDENTITY_INSERT [LichTrinhChuyen] ON
INSERT INTO [LichTrinhChuyen]([id_lich_trinh],[id_lich_chay],[id_ga],[thu_tu_dung],[gio_den],[gio_di],[khoang_cach_km]) VALUES
(1,1,1,1,'06:00','06:00',0),(2,1,6,2,'07:04','07:04',56),(3,1,9,3,'07:40','07:40',87),
(4,1,12,4,'08:16','08:16',115),(5,1,15,5,'09:22','09:22',175),(6,1,19,6,'09:48','09:48',197),
(7,1,24,7,'11:13','11:13',279),(8,1,20,8,'11:59','11:59',319),(9,1,21,9,'12:35','12:35',340),
(10,1,25,10,'13:34','13:34',387),(11,1,32,11,'14:39','14:39',436),(12,1,29,12,'16:27','16:27',522),
(13,1,30,13,'17:02','17:02',551),(14,1,33,14,'18:25','18:25',622),(15,1,37,15,'19:43','19:43',688),
(16,1,42,16,'22:30','22:30',791),(17,1,49,17,'01:16','01:16',928),(18,1,53,18,'04:12','04:12',1096),
(19,1,58,19,'06:34','06:34',1198),(20,1,62,20,'08:03','08:03',1281),(21,1,63,21,'08:47','08:47',1315),
(22,1,67,22,'10:25','10:25',1408),(23,1,70,23,'13:00','13:00',1551),(24,1,74,24,'14:15','14:15',1603),
(25,1,77,25,'15:07','15:07',1649),(26,1,75,26,'16:12','16:12',1697),(27,1,82,27,'16:29','16:29',1707),
(28,1,81,28,'17:00','17:00',1726),
-- LichChay 2 (SE5: HN→SG) - tương tự nhưng giờ khác
(29,2,1,1,'08:00','08:00',0),(30,2,6,2,'09:04','09:04',56),(31,2,9,3,'09:40','09:40',87),
(32,2,12,4,'10:16','10:16',115),(33,2,16,5,'10:50','10:50',141),(34,2,15,6,'11:27','11:27',175),
(35,2,20,7,'13:49','13:49',319),(36,2,21,8,'14:14','14:14',340),(37,2,25,9,'15:12','15:12',387),
(38,2,32,10,'16:16','16:16',436),(39,2,31,11,'17:14','17:14',482),(40,2,29,12,'18:11','18:11',522),
(41,2,33,13,'20:06','20:06',622),(42,2,37,14,'21:40','21:40',688),(43,2,42,15,'00:36','00:36',791),
(44,2,49,16,'03:10','03:10',928),(45,2,53,17,'06:02','06:02',1096),(46,2,61,18,'07:19','07:19',1154),
(47,2,58,19,'08:12','08:12',1198),(48,2,65,20,'09:16','09:16',1254),(49,2,62,21,'10:25','10:25',1315),
(50,2,67,22,'12:08','12:08',1408),(51,2,70,23,'14:28','14:28',1551),(52,2,77,24,'16:15','16:15',1649),
(53,2,76,25,'17:20','17:20',1649),(54,2,82,26,'17:37','17:37',1707),(55,2,81,27,'18:20','18:20',1726),
-- LichChay 6 (SE8: SG→HN)
(126,6,81,1,'06:00','06:00',0),(127,6,82,2,'06:31','06:31',19),(128,6,76,3,'06:47','06:47',29),
(129,6,77,4,'07:49','07:49',77),(130,6,74,5,'08:40','08:40',123),(131,6,70,6,'09:42','09:42',175),
(132,6,67,7,'12:10','12:10',318),(133,6,62,8,'14:03','14:03',411),(134,6,58,9,'16:10','16:10',528),
(135,6,53,10,'18:07','18:07',630),(136,6,49,11,'21:01','21:01',798),(137,6,42,12,'23:41','23:41',935),
(138,6,37,13,'02:17','02:17',1038),(139,6,33,14,'03:31','03:31',1104),(140,6,29,15,'05:34','05:34',1204),
(141,6,32,16,'07:37','07:37',1290),(142,6,25,17,'08:40','08:40',1339),(143,6,21,18,'09:41','09:41',1386),
(144,6,20,19,'10:12','10:12',1407),(145,6,15,20,'12:53','12:53',1551),(146,6,12,21,'13:59','13:59',1611),
(147,6,9,22,'14:39','14:39',1639),(148,6,6,23,'15:17','15:17',1670),(149,6,1,24,'16:20','16:20',1726)
SET IDENTITY_INSERT [LichTrinhChuyen] OFF
GO

-- BieuGia
SET IDENTITY_INSERT [BieuGia] ON
INSERT INTO [BieuGia]([id_bieu_gia],[ten_dip],[ngay_bat_dau],[ngay_ket_thuc],[he_so_tang],[don_gia_km_goc],[id_loai_ghe],[trang_thai]) VALUES
(1,N'Giá thường ngày','2026-01-01','2099-12-31',1.00,264.00,NULL,'dang_ap_dung'),
(2,N'Tết Nguyên Đán 2027','2027-01-15','2027-02-10',1.50,264.00,NULL,'dang_ap_dung'),
(3,N'Lễ 30/4 – 1/5/2026','2026-04-25','2026-05-04',1.30,264.00,NULL,'dang_ap_dung'),
(4,N'Hè 2026 (01/06–31/08)','2026-06-01','2026-08-31',1.20,264.00,NULL,'dang_ap_dung'),
(5,N'Quốc Khánh 2/9/2026','2026-08-30','2026-09-04',1.25,264.00,NULL,'dang_ap_dung'),
(6,N'Ưu đãi ghế ngồi cứng','2026-01-01','2099-12-31',0.90,220.00,10,'dang_ap_dung')
SET IDENTITY_INSERT [BieuGia] OFF
GO

-- ChinhSachGia
SET IDENTITY_INSERT [ChinhSachGia] ON
INSERT INTO [ChinhSachGia]([id_chinh_sach],[ten_chinh_sach],[loai_hanh_khach],[phan_tram_giam],[tu_ngay]) VALUES
(1,N'Người lớn từ 10 tuổi','nguoi_lon',0.00,'2024-01-01'),
(2,N'Trẻ em dưới 6 tuổi – miễn phí','tre_em',100.00,'2024-01-01'),
(3,N'Trẻ em 6-9 tuổi – giảm 25%','tre_em',25.00,'2024-01-01'),
(4,N'Người cao tuổi từ 60 – giảm 15%','nguoi_cao_tuoi',15.00,'2024-01-01'),
(5,N'Học sinh, sinh viên – giảm 10%','sinh_vien',10.00,'2024-01-01'),
(6,N'Người khuyết tật – giảm 30%','nguoi_lon',30.00,'2024-01-01')
SET IDENTITY_INSERT [ChinhSachGia] OFF
GO

-- ChinhSachHuy
SET IDENTITY_INSERT [ChinhSachHuy] ON
INSERT INTO [ChinhSachHuy]([id_cs_huy],[gio_truoc_gio_chay],[phi_huy]) VALUES
(1,72,10.00),(2,24,20.00),(3,4,50.00),(4,0,100.00),(5,48,10.00)
SET IDENTITY_INSERT [ChinhSachHuy] OFF
GO

-- KhuyenMai
SET IDENTITY_INSERT [KhuyenMai] ON
INSERT INTO [KhuyenMai]([id_khuyen_mai],[ma_khuyen_mai],[mo_ta],[loai_giam],[gia_tri],[gia_tri_don_toi_thieu],[giam_toi_da],[so_luong],[da_dung],[ngay_bat_dau],[ngay_het_han],[ap_dung_cho]) VALUES
(1,'KLNWELCOME',N'Ưu đãi đăng ký mới – giảm 10%','phan_tram',10.00,200000,NULL,1000,0,'2026-01-01','2099-12-31','nguoi_moi'),
(2,'HE2026',N'Hè 2026 – giảm 50.000đ','so_tien',50000,300000,NULL,500,0,'2026-06-01','2026-08-31','tat_ca'),
(3,'KLN100K',N'Giảm 100.000đ cho đơn từ 500.000đ','so_tien',100000,500000,NULL,200,0,'2026-05-01','2026-12-31','tat_ca'),
(4,'TETAM30',N'Tết Âm Lịch 2027 – giảm 30%','phan_tram',30.00,500000,300000,300,0,'2027-01-10','2027-02-20','tat_ca'),
(5,'THANKVIP',N'Khách thành viên – giảm 15%','phan_tram',15.00,400000,200000,NULL,0,'2026-01-01','2099-12-31','thanh_vien'),
(6,'3OT4_2026',N'Lễ 30/4 – giảm 20%','phan_tram',20.00,300000,250000,400,0,'2026-04-25','2026-05-04','tat_ca'),
(7,'GN100K',N'Vé giường nằm – giảm 100.000đ','so_tien',100000,600000,NULL,100,0,'2026-05-15','2026-09-30','tat_ca'),
(8,'FIRST50',N'Giảm 5% cho lần đầu tiên','phan_tram',5.00,100000,NULL,2000,0,'2026-01-01','2099-12-31','nguoi_moi')
SET IDENTITY_INSERT [KhuyenMai] OFF
GO

PRINT N'=== Section 2 (Reference Data) DONE ==='
GO

-- ============================================================
-- SECTION 3: TÀI KHOẢN & PHÂN QUYỀN
-- ============================================================

SET IDENTITY_INSERT [TaiKhoan] ON
INSERT INTO [TaiKhoan]([id_tai_khoan],[email],[mat_khau],[ho_ten],[so_dien_thoai],[ngay_sinh],[gioi_tinh],[vai_tro],[trang_thai],[ngay_tao]) VALUES
(1,'admin@klntrain.vn','$2b$12$hashAdmin001',N'Nguyễn Quản Trị','0901234567','1985-03-15','nam','quan_tri','hoat_dong','2026-01-01'),
(2,'nv1@klntrain.vn','$2b$12$hashNV001',N'Trần Thị Nhân Viên','0902345678','1992-07-20','nu','nhan_vien','hoat_dong','2026-01-01'),
(3,'nv2@klntrain.vn','$2b$12$hashNV002',N'Lê Văn Bán Vé','0903456789','1990-11-05','nam','nhan_vien','hoat_dong','2026-01-01'),
(4,'an4@gmail.com','$2b$12$hashKH004',N'Đặng Văn An','0943321819','1983-01-01','nam','khach_hang','hoat_dong','2026-05-01'),
(5,'kien5@gmail.com','$2b$12$hashKH005',N'Phạm Văn Kiên','0989083863','1984-10-09','nam','khach_hang','hoat_dong','2026-05-01'),
(6,'hung6@gmail.com','$2b$12$hashKH006',N'Đặng Văn Hùng','0965423511','1982-02-12','nam','khach_hang','hoat_dong','2026-05-01'),
(7,'lan7@gmail.com','$2b$12$hashKH007',N'Lý Thị Lan','0907816184','1996-11-20','nu','khach_hang','hoat_dong','2026-05-01'),
(8,'h8@gmail.com','$2b$12$hashKH008',N'Đặng Thị Hà','0910341316','1978-08-21','nu','khach_hang','hoat_dong','2026-05-01'),
(9,'giang9@gmail.com','$2b$12$hashKH009',N'Vũ Thị Giang','0953419283','1975-08-13','nu','khach_hang','hoat_dong','2026-05-01'),
(10,'tho10@gmail.com','$2b$12$hashKH010',N'Phạm Thị Thảo','0950305641','1976-10-23','nu','khach_hang','hoat_dong','2026-05-01'),
(11,'h11@gmail.com','$2b$12$hashKH011',N'Ngô Thị Hà','0976724238','1987-05-24','nu','khach_hang','hoat_dong','2026-05-01'),
(12,'thu12@gmail.com','$2b$12$hashKH012',N'Vũ Thị Thư','0932871012','1990-03-26','nu','khach_hang','hoat_dong','2026-05-01'),
(13,'chi13@gmail.com','$2b$12$hashKH013',N'Đặng Thị Chi','0969784801','1991-09-25','nu','khach_hang','hoat_dong','2026-05-01'),
(14,'nga14@gmail.com','$2b$12$hashKH014',N'Trần Thị Nga','0946270482','1986-02-28','nu','khach_hang','hoat_dong','2026-05-01'),
(15,'linh15@gmail.com','$2b$12$hashKH015',N'Hồ Thị Linh','0932528809','1980-08-01','nu','khach_hang','hoat_dong','2026-05-01'),
(16,'quang16@gmail.com','$2b$12$hashKH016',N'Lý Văn Quang','0943039117','1996-02-25','nam','khach_hang','hoat_dong','2026-05-01'),
(17,'phong17@gmail.com','$2b$12$hashKH017',N'Ngô Văn Phong','0978248963','1999-09-25','nam','khach_hang','hoat_dong','2026-05-01'),
(18,'nam18@gmail.com','$2b$12$hashKH018',N'Đặng Văn Nam','0957871331','1980-01-19','nam','khach_hang','hoat_dong','2026-05-01'),
(19,'long19@gmail.com','$2b$12$hashKH019',N'Nguyễn Văn Long','0910310518','1977-05-22','nam','khach_hang','hoat_dong','2026-05-01'),
(20,'h20@gmail.com','$2b$12$hashKH020',N'Đỗ Thị Hà','0929973763','1973-02-22','nu','khach_hang','hoat_dong','2026-05-01'),
(21,'quynh21@gmail.com','$2b$12$hashKH021',N'Đặng Thị Quỳnh','0967010651','1977-04-07','nu','khach_hang','hoat_dong','2026-05-01'),
(22,'phuong22@gmail.com','$2b$12$hashKH022',N'Đặng Thị Phương','0924731781','1971-11-18','nu','khach_hang','hoat_dong','2026-05-01'),
(23,'cuong23@gmail.com','$2b$12$hashKH023',N'Lý Văn Cường','0932677360','1975-07-01','nam','khach_hang','hoat_dong','2026-05-01'),
(24,'lan24@gmail.com','$2b$12$hashKH024',N'Lý Thị Lan','0974687234','1976-01-19','nu','khach_hang','hoat_dong','2026-05-01'),
(25,'phuc25@gmail.com','$2b$12$hashKH025',N'Nguyễn Văn Phúc','0909788208','1972-03-03','nam','khach_hang','hoat_dong','2026-05-01'),
(26,'long26@gmail.com','$2b$12$hashKH026',N'Đặng Văn Long','0919399091','1983-11-19','nam','khach_hang','hoat_dong','2026-05-01'),
(27,'lan27@gmail.com','$2b$12$hashKH027',N'Phạm Thị Lan','0953462475','1999-02-01','nu','khach_hang','hoat_dong','2026-05-01'),
(28,'dung28@gmail.com','$2b$12$hashKH028',N'Trần Thị Dung','0983842513','1981-05-06','nu','khach_hang','hoat_dong','2026-05-01'),
(29,'thao29@gmail.com','$2b$12$hashKH029',N'Đặng Thị Thảo','0949808412','1978-02-04','nu','khach_hang','hoat_dong','2026-05-01'),
(30,'minh30@gmail.com','$2b$12$hashKH030',N'Hoàng Văn Minh','0993534874','1998-01-03','nam','khach_hang','hoat_dong','2026-05-01'),
(31,'lan31@gmail.com','$2b$12$hashKH031',N'Nguyễn Thị Lan','0905242786','1987-01-04','nu','khach_hang','hoat_dong','2026-05-01'),
(32,'phong32@gmail.com','$2b$12$hashKH032',N'Đỗ Văn Phong','0905982620','1979-06-26','nam','khach_hang','hoat_dong','2026-05-01'),
(33,'quang33@gmail.com','$2b$12$hashKH033',N'Phạm Văn Quang','0931586923','1997-03-26','nam','khach_hang','hoat_dong','2026-05-01'),
(34,'tam34@gmail.com','$2b$12$hashKH034',N'Nguyễn Văn Tâm','0925634216','1997-01-28','nam','khach_hang','hoat_dong','2026-05-01'),
(35,'kim35@gmail.com','$2b$12$hashKH035',N'Phạm Thị Kim','0975433036','1980-05-28','nu','khach_hang','hoat_dong','2026-05-01'),
(36,'minh36@gmail.com','$2b$12$hashKH036',N'Vũ Văn Minh','0986850142','1988-05-02','nam','khach_hang','hoat_dong','2026-05-01'),
(37,'tam37@gmail.com','$2b$12$hashKH037',N'Vũ Văn Tâm','0956981693','1978-01-23','nam','khach_hang','hoat_dong','2026-05-01'),
(38,'anh38@gmail.com','$2b$12$hashKH038',N'Đỗ Thị Anh','0983561595','1991-02-24','nu','khach_hang','hoat_dong','2026-05-01'),
(39,'linh39@gmail.com','$2b$12$hashKH039',N'Hoàng Thị Linh','0965648236','1991-07-22','nu','khach_hang','hoat_dong','2026-05-01'),
(40,'nam40@gmail.com','$2b$12$hashKH040',N'Đặng Văn Nam','0980443699','1990-06-15','nam','khach_hang','hoat_dong','2026-05-01'),
(41,'van41@gmail.com','$2b$12$hashKH041',N'Ngô Thị Vân','0938721489','1980-02-27','nu','khach_hang','hoat_dong','2026-05-01'),
(42,'nam42@gmail.com','$2b$12$hashKH042',N'Phạm Văn Nam','0932003791','1984-07-21','nam','khach_hang','hoat_dong','2026-05-01'),
(43,'son43@gmail.com','$2b$12$hashKH043',N'Bùi Văn Sơn','0963201632','1995-12-17','nam','khach_hang','hoat_dong','2026-05-01'),
(44,'binh44@gmail.com','$2b$12$hashKH044',N'Đỗ Thị Bình','0931727889','1980-08-20','nu','khach_hang','hoat_dong','2026-05-01'),
(45,'thao45@gmail.com','$2b$12$hashKH045',N'Bùi Thị Thảo','0927743487','1990-04-09','nu','khach_hang','hoat_dong','2026-05-01'),
(46,'chi46@gmail.com','$2b$12$hashKH046',N'Đặng Thị Chi','0943455812','1974-04-13','nu','khach_hang','hoat_dong','2026-05-01'),
(47,'kien47@gmail.com','$2b$12$hashKH047',N'Trần Văn Kiên','0966587603','1996-07-13','nam','khach_hang','hoat_dong','2026-05-01'),
(48,'son48@gmail.com','$2b$12$hashKH048',N'Bùi Văn Sơn','0905466889','1998-04-16','nam','khach_hang','hoat_dong','2026-05-01'),
(49,'minh49@gmail.com','$2b$12$hashKH049',N'Đặng Văn Minh','0970656272','1989-09-01','nam','khach_hang','hoat_dong','2026-05-01'),
(50,'anh50@gmail.com','$2b$12$hashKH050',N'Trần Thị Anh','0962720465','1976-08-11','nu','khach_hang','hoat_dong','2026-05-01'),
(51,'dp1@klntrain.vn','$2b$12$hashDP001',N'Nguyễn Điều Phối','0911222333','1988-05-10','nam','nhan_vien','hoat_dong','2026-01-01'),
(52,'linh1612@gmail.com','$2a$10$F2bRqYadKJ0hULX9m6eRfOAL0hIbyi3AkVAoKPgnG4vIaCRVddMfy',N'Nguyễn Trọng Linh','0337297690',NULL,NULL,'khach_hang','hoat_dong','2026-06-01')
SET IDENTITY_INSERT [TaiKhoan] OFF
GO

-- TaiKhoanVaiTro
INSERT INTO [TaiKhoanVaiTro]([id_tai_khoan],[id_vai_tro]) VALUES
(1,1),(2,5),(3,5),(51,2),(52,6)
-- khách hàng 4-50: vai trò khách hàng (id=6)
DECLARE @tk INT=4
WHILE @tk<=50 BEGIN
    INSERT INTO [TaiKhoanVaiTro]([id_tai_khoan],[id_vai_tro]) VALUES(@tk,6)
    SET @tk=@tk+1
END
GO

-- HanhKhach
SET IDENTITY_INSERT [HanhKhach] ON
INSERT INTO [HanhKhach]([id_hanh_khach],[id_tai_khoan],[ho_ten],[ngay_sinh],[cccd],[loai_hanh_khach],[so_dien_thoai],[la_chinh]) VALUES
(1,4,N'Đặng Văn An','1983-01-01','300000000001','nguoi_lon','0943321819',1),
(2,5,N'Phạm Văn Kiên','1984-10-09','300000000008','nguoi_lon','0989083863',1),
(3,6,N'Đặng Văn Hùng','1982-02-12','300000000015','nguoi_lon','0965423511',1),
(4,7,N'Lý Thị Lan','1996-11-20','300000000022','nguoi_lon','0907816184',1),
(5,8,N'Đặng Thị Hà','1978-08-21','300000000029','nguoi_lon','0910341316',1),
(6,9,N'Vũ Thị Giang','1975-08-13','300000000036','nguoi_lon','0953419283',1),
(7,10,N'Phạm Thị Thảo','1976-10-23','300000000043','nguoi_lon','0950305641',1),
(8,11,N'Ngô Thị Hà','1987-05-24','300000000050','nguoi_lon','0976724238',1),
(9,12,N'Vũ Thị Thư','1990-03-26','300000000057','nguoi_lon','0932871012',1),
(10,13,N'Đặng Thị Chi','1991-09-25','300000000064','nguoi_lon','0969784801',1),
(11,14,N'Trần Thị Nga','1986-02-28','300000000071','nguoi_lon','0946270482',1),
(12,15,N'Hồ Thị Linh','1980-08-01','300000000078','nguoi_lon','0932528809',1),
(13,16,N'Lý Văn Quang','1996-02-25','300000000085','nguoi_lon','0943039117',1),
(14,17,N'Ngô Văn Phong','1999-09-25','300000000092','nguoi_lon','0978248963',1),
(15,18,N'Đặng Văn Nam','1980-01-19','300000000099','nguoi_lon','0957871331',1),
(16,19,N'Nguyễn Văn Long','1977-05-22','300000000106','nguoi_lon','0910310518',1),
(17,20,N'Đỗ Thị Hà','1973-02-22','300000000113','nguoi_lon','0929973763',1),
(18,21,N'Đặng Thị Quỳnh','1977-04-07','300000000120','nguoi_lon','0967010651',1),
(19,22,N'Đặng Thị Phương','1971-11-18','300000000127','nguoi_lon','0924731781',1),
(20,23,N'Lý Văn Cường','1975-07-01','300000000134','nguoi_lon','0932677360',1),
(21,24,N'Lý Thị Lan','1976-01-19','300000000141','nguoi_lon','0974687234',1),
(22,25,N'Nguyễn Văn Phúc','1972-03-03','300000000148','nguoi_lon','0909788208',1),
(23,26,N'Đặng Văn Long','1983-11-19','300000000155','nguoi_lon','0919399091',1),
(24,27,N'Phạm Thị Lan','1999-02-01','300000000162','nguoi_lon','0953462475',1),
(25,28,N'Trần Thị Dung','1981-05-06','300000000169','nguoi_lon','0983842513',1),
(26,29,N'Đặng Thị Thảo','1978-02-04','300000000176','nguoi_lon','0949808412',1),
(27,30,N'Hoàng Văn Minh','1998-01-03','300000000183','nguoi_lon','0993534874',1),
(28,31,N'Nguyễn Thị Lan','1987-01-04','300000000190','nguoi_lon','0905242786',1),
(29,32,N'Đỗ Văn Phong','1979-06-26','300000000197','nguoi_lon','0905982620',1),
(30,33,N'Phạm Văn Quang','1997-03-26','300000000204','nguoi_lon','0931586923',1),
(31,34,N'Nguyễn Văn Tâm','1997-01-28','300000000211','nguoi_lon','0925634216',1),
(32,35,N'Phạm Thị Kim','1980-05-28','300000000218','nguoi_lon','0975433036',1),
(33,36,N'Vũ Văn Minh','1988-05-02','300000000225','nguoi_lon','0986850142',1),
(34,37,N'Vũ Văn Tâm','1978-01-23','300000000232','nguoi_lon','0956981693',1),
(35,38,N'Đỗ Thị Anh','1991-02-24','300000000239','nguoi_lon','0983561595',1),
(36,39,N'Hoàng Thị Linh','1991-07-22','300000000246','nguoi_lon','0965648236',1),
(37,40,N'Đặng Văn Nam','1990-06-15','300000000253','nguoi_lon','0980443699',1),
(38,41,N'Ngô Thị Vân','1980-02-27','300000000260','nguoi_lon','0938721489',1),
(39,42,N'Phạm Văn Nam','1984-07-21','300000000267','nguoi_lon','0932003791',1),
(40,43,N'Bùi Văn Sơn','1995-12-17','300000000274','nguoi_lon','0963201632',1),
(41,44,N'Đỗ Thị Bình','1980-08-20','300000000281','nguoi_lon','0931727889',1),
(42,45,N'Bùi Thị Thảo','1990-04-09','300000000288','nguoi_lon','0927743487',1),
(43,46,N'Đặng Thị Chi','1974-04-13','300000000295','nguoi_lon','0943455812',1),
(44,47,N'Trần Văn Kiên','1996-07-13','300000000302','nguoi_lon','0966587603',1),
(45,48,N'Bùi Văn Sơn','1998-04-16','300000000309','nguoi_lon','0905466889',1),
(46,49,N'Đặng Văn Minh','1989-09-01','300000000316','nguoi_lon','0970656272',1),
(47,50,N'Trần Thị Anh','1976-08-11','300000000323','nguoi_lon','0962720465',1),
(49,NULL,N'Nguyễn Văn A','1990-01-01','123456789012','nguoi_lon','0901234567',1),
(50,NULL,N'Linh','2005-08-18','123123123123','nguoi_lon','0337237333',1),
(51,NULL,N'Lại','2011-12-03',NULL,'tre_em','0123123123',0),
(52,NULL,N'Linh','2005-08-11','123123123123','nguoi_lon','0123123123',1)
SET IDENTITY_INSERT [HanhKhach] OFF
GO

PRINT N'=== Section 3 (Users) DONE ==='
GO

-- ============================================================
-- SECTION 4: CHUYẾN TÀU + TOA CHUYẾN
-- ============================================================

SET IDENTITY_INSERT [ChuyenTau] ON
-- Các chuyến tháng 5-6/2026
INSERT INTO [ChuyenTau]([id_chuyen],[id_lich_chay],[ngay_chay],[trang_thai]) VALUES
(1,1,'2026-05-23','da_chay'),(2,2,'2026-05-23','da_chay'),(3,3,'2026-05-23','da_chay'),
(4,4,'2026-05-23','da_chay'),(5,5,'2026-05-23','da_chay'),(6,6,'2026-05-23','da_chay'),
(7,1,'2026-05-24','da_chay'),(8,2,'2026-05-24','da_chay'),(9,3,'2026-05-24','da_chay'),
(10,4,'2026-05-24','da_chay'),(11,5,'2026-05-24','da_chay'),(12,6,'2026-05-24','da_chay'),
(13,1,'2026-05-25','da_chay'),(14,2,'2026-05-25','da_chay'),(15,3,'2026-05-25','da_chay'),
(16,4,'2026-05-25','da_chay'),(17,5,'2026-05-25','da_chay'),(18,6,'2026-05-25','da_chay'),
(19,1,'2026-05-26','da_chay'),(20,2,'2026-05-26','da_chay'),(21,3,'2026-05-26','da_chay'),
(22,4,'2026-05-26','da_chay'),(23,5,'2026-05-26','da_chay'),(24,6,'2026-05-26','da_chay'),
(25,1,'2026-05-27','da_chay'),(26,2,'2026-05-27','da_chay'),(27,3,'2026-05-27','da_chay'),
(28,4,'2026-05-27','da_chay'),(29,5,'2026-05-27','da_chay'),(30,6,'2026-05-27','da_chay'),
(31,1,'2026-05-28','da_chay'),(32,2,'2026-05-28','da_chay'),(33,3,'2026-05-28','da_chay'),
(34,4,'2026-05-28','da_chay'),(35,5,'2026-05-28','da_chay'),(36,6,'2026-05-28','da_chay'),
(37,1,'2026-05-29','da_chay'),(38,2,'2026-05-29','da_chay'),(39,3,'2026-05-29','da_chay'),
(40,4,'2026-05-29','da_chay'),(41,5,'2026-05-29','da_chay'),(42,6,'2026-05-29','da_chay'),
(43,6,'2026-05-31','da_chay'),(44,6,'2026-06-01','dung_gio'),
(45,6,'2026-06-05','dung_gio'),(46,1,'2026-06-01','dung_gio'),
(47,2,'2026-06-01','dung_gio'),(48,1,'2026-06-02','dung_gio'),
(49,2,'2026-06-02','dung_gio'),(50,6,'2026-06-02','dung_gio')
SET IDENTITY_INSERT [ChuyenTau] OFF
GO

-- ToaChuyen: sinh từ CauHinhToa cho chuyến 1 (SE7 lịch 1: id_tau=7, 12 toa)
-- SE7 toa: 1=GN4, 2=GN6,3=GN6,4=GN6,5=GN6, 6=NM,7=NM,8=NM,9=NM, 10=NM_k, 11=NC, 12=NC_k
SET IDENTITY_INSERT [ToaChuyen] ON
-- Chuyến 1 (id_chuyen=1, SE7 HN→SG 2026-05-23)
INSERT INTO [ToaChuyen]([id_toa_chuyen],[id_chuyen],[so_toa_thu_tu],[id_loai_toa],[so_ghe_toi_da]) VALUES
(1,1,1,1,28),(2,1,2,2,42),(3,1,3,2,42),(4,1,4,2,42),(5,1,5,2,42),
(6,1,6,3,64),(7,1,7,3,64),(8,1,8,3,64),(9,1,9,3,64),
(10,1,10,4,64),(11,1,11,5,80),(12,1,12,6,80),
-- Chuyến 6 (SE8 SG→HN 2026-05-23)
(61,6,1,1,28),(62,6,2,2,42),(63,6,3,2,42),(64,6,4,2,42),(65,6,5,2,42),
(66,6,6,3,64),(67,6,7,3,64),(68,6,8,3,64),(69,6,9,3,64),
(70,6,10,4,64),(71,6,11,5,80),(72,6,12,6,80),
-- Chuyến 25 (SE7 HN→SG 2026-05-27)
(121,25,1,1,28),(122,25,2,2,42),(123,25,3,2,42),(124,25,4,2,42),(125,25,5,2,42),
(126,25,6,3,64),(127,25,7,3,64),(128,25,8,3,64),(129,25,9,3,64),
(130,25,10,4,64),(131,25,11,5,80),(132,25,12,6,80),
-- Chuyến 30 (SE8 SG→HN 2026-05-27)
(181,30,1,1,28),(182,30,2,2,42),(183,30,3,2,42),(184,30,4,2,42),(185,30,5,2,42),
(186,30,6,3,64),(187,30,7,3,64),(188,30,8,3,64),(189,30,9,3,64),
(190,30,10,4,64),(191,30,11,5,80),(192,30,12,6,80),
-- Chuyến 43 (SE8 SG→HN 2026-05-31)
(241,43,1,1,28),(242,43,2,2,42),(243,43,3,2,42),(244,43,4,2,42),(245,43,5,2,42),
(246,43,6,3,64),(247,43,7,3,64),(248,43,8,3,64),(249,43,9,3,64),
(250,43,10,4,64),(251,43,11,5,80),(252,43,12,6,80),
-- Chuyến 44 (SE8 SG→HN 2026-06-01)
(253,44,1,1,28),(254,44,2,2,42),(255,44,3,2,42),(256,44,4,2,42),(257,44,5,2,42),
(258,44,6,3,64),(259,44,7,3,64),(260,44,8,3,64),(261,44,9,3,64),
(262,44,10,4,64),(263,44,11,5,80),(264,44,12,6,80)
SET IDENTITY_INSERT [ToaChuyen] OFF
GO

PRINT N'=== Section 4 (Trips) DONE ==='
GO

-- ============================================================
-- SECTION 5: ĐƠN ĐẶT VÉ & VÉ (CORE TRANSACTIONAL)
-- ============================================================

SET IDENTITY_INSERT [DonDatVe] ON
INSERT INTO [DonDatVe]([id_don_dat_ve],[ma_don],[ma_dat_cho],[id_tai_khoan],[ho_ten_lien_lac],[email_dat_cho],[sdt_dat_cho],[cccd],[loai_ve],[tong_tien],[tien_giam],[tien_thanh_toan],[id_khuyen_mai],[trang_thai],[thoi_gian_dat],[thoi_gian_het_han]) VALUES
(3,'KLN000003','9B4KFE',7,N'Lý Thị Lan','lan7@gmail.com','0907816184','300000000022','mot_chieu',400000,0,400000,NULL,'da_thanh_toan','2026-05-24 21:28:50','2026-05-24 21:43:50'),
(5,'KLN000005','7NIG2C',41,N'Ngô Thị Vân','van41@gmail.com','0938721489','300000000260','mot_chieu',1400000,50000,1350000,2,'da_thanh_toan','2026-05-23 18:28:50','2026-05-23 18:43:50'),
(6,'KLN000006','K9EP1F',32,N'Đỗ Văn Phong','phong32@gmail.com','0905982620','300000000197','mot_chieu',1500000,0,1500000,NULL,'cho_thanh_toan','2026-05-20 11:28:50','2026-05-20 11:43:50'),
(7,'KLN000007','U5LZVU',39,N'Hoàng Thị Linh','linh39@gmail.com','0965648236','300000000246','mot_chieu',1000000,100000,900000,1,'cho_thanh_toan','2026-05-09 12:28:50','2026-05-09 12:43:50'),
(8,'KLN000008','XCZX93',45,N'Bùi Thị Thảo','son48@gmail.com','0905466889','300000000309','mot_chieu',300000,50000,250000,2,'da_thanh_toan','2026-05-19 21:28:50','2026-05-19 21:43:50'),
(10,'KLN000010','OKEPTZ',32,N'Đỗ Văn Phong','phong32@gmail.com','0905982620','300000000197','mot_chieu',400000,0,400000,NULL,'da_thanh_toan','2026-05-19 14:28:50','2026-05-19 14:43:50'),
(11,'KLN000011','FXA3GK',15,N'Hồ Thị Linh','linh15@gmail.com','0932528809','300000000078','mot_chieu',1200000,50000,1150000,2,'da_thanh_toan','2026-05-20 19:28:50','2026-05-20 19:43:50'),
(13,'KLN000013','DWCCHF',29,N'Đặng Thị Thảo','thao29@gmail.com','0949808412','300000000176','mot_chieu',1200000,0,1200000,NULL,'da_thanh_toan','2026-05-08 12:28:50','2026-05-08 12:43:50'),
(14,'KLN000014','T8WCHN',13,N'Đặng Thị Chi','chi13@gmail.com','0969784801','300000000064','mot_chieu',1000000,50000,950000,2,'da_thanh_toan','2026-05-18 20:28:50','2026-05-18 20:43:50'),
(15,'KLN000015','ER9RLF',11,N'Ngô Thị Hà','h11@gmail.com','0976724238','300000000050','mot_chieu',1100000,0,1100000,NULL,'da_thanh_toan','2026-05-15 18:28:50','2026-05-15 18:43:50'),
(16,'KLN000016','H8NY61',5,N'Phạm Văn Kiên','kien5@gmail.com','0989083863','300000000008','mot_chieu',800000,0,800000,NULL,'da_thanh_toan','2026-05-09 15:28:50','2026-05-09 15:43:50'),
(17,'KLN000017','MITSWW',14,N'Trần Thị Nga','nga14@gmail.com','0946270482','300000000071','mot_chieu',600000,0,600000,NULL,'da_thanh_toan','2026-05-14 17:28:50','2026-05-14 17:43:50'),
(19,'KLN000019','HIHW16',9,N'Vũ Thị Giang','giang9@gmail.com','0953419283','300000000036','mot_chieu',1500000,50000,1450000,2,'da_thanh_toan','2026-05-22 21:28:50','2026-05-22 21:43:50'),
(20,'KLN000020','DX621R',42,N'Bùi Thị Thảo','thao45@gmail.com','0927743487','300000000288','mot_chieu',400000,50000,350000,2,'da_thanh_toan','2026-05-20 21:28:50','2026-05-20 21:43:50'),
(21,'KLN000021','OO80GE',47,N'Trần Thị Anh','anh50@gmail.com','0962720465','300000000323','mot_chieu',1200000,0,1200000,NULL,'da_thanh_toan','2026-05-25 18:28:50','2026-05-25 18:43:50'),
(22,'KLN000022','9XMTEA',42,N'Phạm Văn Nam','nam42@gmail.com','0932003791','300000000267','mot_chieu',600000,100000,500000,3,'da_thanh_toan','2026-05-23 13:28:50','2026-05-23 13:43:50'),
(57,'KLN567727','7HXUTC',NULL,N'Linh','linh@gmail.com','0123123123','123123123123','mot_chieu',727000,0,727000,NULL,'da_thanh_toan','2026-05-27 06:31:31','2026-05-27 06:46:31'),
(58,'KLN979847','75HEPF',NULL,N'Linh','linh@gmail.com','0123123123','123123123123','khu_hoi',2582250,0,2582250,NULL,'da_thanh_toan','2026-05-27 07:05:56','2026-05-27 07:20:56'),
(62,'KLN284303','RG7G3J',NULL,N'Linh','linh@gmail.com','0123123123','123123123123','mot_chieu',727000,0,727000,NULL,'da_thanh_toan','2026-05-29 00:41:31','2026-05-29 00:56:31'),
(63,'KLN585713','DNYGE3',NULL,N'Linh','linh@gmail.com','0123123123','123123123123','mot_chieu',727000,0,727000,NULL,'da_thanh_toan','2026-05-29 07:17:51','2026-05-29 07:32:51'),
(86,'KLN888295','SZCKK8',NULL,N'Linh','linh@gmail.com','0123123123','123123123123','mot_chieu',868000,0,868000,NULL,'da_thanh_toan','2026-05-30 14:57:11','2026-05-30 15:12:11'),
(87,'KLN146413','SHJTRL',NULL,N'Linh','linh@gmail.com','0123123123','123123123123','mot_chieu',1032000,0,1032000,NULL,'da_thanh_toan','2026-05-31 08:58:56','2026-05-31 09:13:56'),
(88,'KLN495263','Y5LLAN',NULL,N'Linh','linh@gmail.com','0123123123','123123123123','mot_chieu',868000,0,868000,NULL,'da_thanh_toan','2026-05-31 09:11:42','2026-05-31 09:26:42'),
-- Đơn mới tháng 6
(89,'KLN600001','ABCDEF',41,N'Ngô Thị Vân','van41@gmail.com','0938721489','300000000260','mot_chieu',843000,0,843000,NULL,'da_thanh_toan','2026-06-01 10:00:00','2026-06-01 10:15:00'),
(90,'KLN600002','BCDEFG',33,N'Vũ Văn Minh','minh36@gmail.com','0986850142','300000000225','mot_chieu',707000,0,707000,NULL,'da_thanh_toan','2026-06-01 11:00:00','2026-06-01 11:15:00'),
(91,'KLN600003','CCRSJL',52,N'Hồng Ngọc','lethihongngoc1612@gmail.com','0337297690','123123123123','khu_hoi',6088500,40000,6128500,NULL,'da_thanh_toan','2026-05-20 17:21:33','2026-05-20 17:36:33'),
(92,'KLN600004','DEFGHI',25,N'Trần Thị Dung','dung28@gmail.com','0983842513','300000000169','mot_chieu',1100000,0,1100000,NULL,'cho_thanh_toan','2026-06-02 09:00:00','2026-06-02 09:15:00')
SET IDENTITY_INSERT [DonDatVe] OFF
GO

SET IDENTITY_INSERT [Ve] ON
INSERT INTO [Ve]([id_ve],[id_don_dat_ve],[id_hanh_khach],[id_chuyen],[so_toa_thu_tu],[so_ghe_trong_toa],[id_ga_len],[id_ga_xuong],[loai_hanh_khach],[gia_ve],[trang_thai],[ngay_xuat_ve]) VALUES
-- Đơn 3: Lý Thị Lan, chuyến 12 (SE5, ngày 24/5)
(3,3,4,12,3,8,1,81,'nguoi_lon',400000,'da_xac_nhan','2026-05-24 21:30:00'),
-- Đơn 5: Ngô Thị Vân (2 vé), chuyến 1
(5,5,38,1,2,1,81,1,'nguoi_lon',1400000,'da_xac_nhan','2026-05-23 18:30:00'),
-- Đơn 8: Bùi Thị Thảo
(8,8,45,7,3,4,81,1,'nguoi_lon',300000,'da_xac_nhan','2026-05-19 21:30:00'),
-- Đơn 10: Đỗ Văn Phong
(10,10,29,6,4,4,81,1,'nguoi_lon',400000,'da_xac_nhan','2026-05-19 14:30:00'),
-- Đơn 11: Hồ Thị Linh
(11,11,12,4,1,24,81,1,'nguoi_lon',1200000,'da_xac_nhan','2026-05-20 19:30:00'),
-- Đơn 13: Đặng Thị Thảo
(13,13,26,2,4,13,81,1,'nguoi_lon',1200000,'da_xac_nhan','2026-05-08 12:30:00'),
-- Đơn 14: Đặng Thị Chi
(14,14,10,10,1,12,81,1,'nguoi_lon',1000000,'da_xac_nhan','2026-05-18 20:30:00'),
-- Đơn 15: Ngô Thị Hà
(15,15,8,7,3,28,81,1,'nguoi_lon',1100000,'da_xac_nhan','2026-05-15 18:30:00'),
-- Đơn 16: Phạm Văn Kiên
(16,16,2,1,3,4,81,1,'nguoi_lon',800000,'da_xac_nhan','2026-05-09 15:30:00'),
-- Đơn 17: Trần Thị Nga
(17,17,11,1,3,21,81,1,'nguoi_lon',600000,'da_xac_nhan','2026-05-14 17:30:00'),
-- Đơn 19: Vũ Thị Giang
(19,19,6,7,3,7,81,1,'nguoi_lon',1500000,'da_xac_nhan','2026-05-22 21:30:00'),
-- Đơn 20: Bùi Thị Thảo
(20,20,42,6,4,1,81,1,'nguoi_lon',400000,'da_xac_nhan','2026-05-20 21:30:00'),
-- Đơn 21: Trần Thị Anh
(21,21,47,11,4,18,81,1,'nguoi_lon',1200000,'da_xac_nhan','2026-05-25 18:30:00'),
-- Đơn 22: Phạm Văn Nam
(22,22,39,9,2,24,81,1,'nguoi_lon',600000,'da_xac_nhan','2026-05-23 13:30:00'),
-- Đơn 57: Linh (SE8, SG→HN, 27/5)
(57,57,50,30,2,1,81,1,'nguoi_lon',707000,'da_xac_nhan','2026-05-27 06:31:31'),
-- Đơn 58: Linh khứ hồi (SE8 SG→HN + SE3 HN→SG)
(58,58,50,30,1,1,81,1,'nguoi_lon',707000,'da_xac_nhan','2026-05-27 07:05:56'),
(59,58,51,30,2,5,81,1,'tre_em',530250,'da_xac_nhan','2026-05-27 07:05:56'),
(60,58,50,40,1,2,1,81,'nguoi_lon',843000,'da_xac_nhan','2026-05-27 07:05:56'),
(61,58,51,40,4,11,1,81,'tre_em',462000,'da_xac_nhan','2026-05-27 07:05:56'),
-- Đơn 62: Linh (SE8, 29/5)
(62,62,50,42,1,1,81,1,'nguoi_lon',707000,'da_xac_nhan','2026-05-29 00:41:31'),
-- Đơn 63: Linh (SE8, 29/5)
(63,63,50,42,1,3,81,1,'nguoi_lon',707000,'da_xac_nhan','2026-05-29 07:17:51'),
-- Đơn 86: Linh (SE8, 30/5)
(89,86,50,44,1,1,81,1,'nguoi_lon',848000,'da_xac_nhan','2026-05-30 14:57:13'),
-- Đơn 87: Linh (SE8, 31/5)
(90,87,50,44,1,2,81,1,'nguoi_lon',1012000,'da_xac_nhan','2026-05-31 08:58:57'),
-- Đơn 88: Linh (SE8, 31/5) – đã đổi
(91,88,50,45,1,1,81,1,'nguoi_lon',848000,'da_doi','2026-05-31 09:11:43'),
(1091,88,50,45,1,2,81,1,'nguoi_lon',1012000,'da_huy','2026-06-01 02:09:08'),
-- Đơn 89,90: tháng 6
(100,89,38,44,1,3,81,1,'nguoi_lon',843000,'da_xac_nhan','2026-06-01 10:05:00'),
(101,90,33,44,2,1,81,1,'nguoi_lon',707000,'da_xac_nhan','2026-06-01 11:05:00'),
-- Đơn 91: CCRSJL – khứ hồi 3 khách (Hồng Ngọc, Ngọc Khuê, Trọng Linh)
(110,91,50,25,1,32,81,1,'nguoi_lon',1107000,'da_xac_nhan','2026-05-20 17:22:00'),
(111,91,50,25,1,33,81,1,'nguoi_lon',1107000,'da_xac_nhan','2026-05-20 17:22:00'),
(112,91,51,25,1,40,81,1,'tre_em',830250,'da_xac_nhan','2026-05-20 17:22:00'),
(113,91,50,30,1,56,1,81,'nguoi_lon',1107000,'da_xac_nhan','2026-05-20 17:22:00'),
(114,91,50,30,1,50,1,81,'nguoi_lon',1107000,'da_xac_nhan','2026-05-20 17:22:00'),
(115,91,51,30,1,55,1,81,'tre_em',830250,'da_xac_nhan','2026-05-20 17:22:00')
SET IDENTITY_INSERT [Ve] OFF
GO

PRINT N'=== Section 5 (Bookings) DONE ==='
GO

-- ============================================================
-- SECTION 6: THANH TOÁN & HÓA ĐƠN
-- ============================================================

SET IDENTITY_INSERT [ThanhToan] ON
INSERT INTO [ThanhToan]([id_thanh_toan],[ma_giao_dich],[id_don_dat_ve],[phuong_thuc],[so_tien],[trang_thai],[payment_gateway],[ma_gd_ngan_hang],[so_lan_thu],[thoi_gian_tao],[thoi_gian_het_han],[thoi_gian_thanh_toan]) VALUES
(1,'TT20260522000001',3,'tien_mat',400000,'thanh_cong',NULL,NULL,1,'2026-05-24 16:41:50',NULL,'2026-05-24 16:41:50'),
(2,'TT20260522000002',5,'zalopay',1350000,'thanh_cong','zalopay',NULL,1,'2026-05-23 18:33:50',NULL,'2026-05-23 18:33:50'),
(3,'TT20260522000003',8,'momo',250000,'thanh_cong','momo',NULL,1,'2026-05-19 21:30:50',NULL,'2026-05-19 21:30:50'),
(4,'TT20260522000004',10,'vnpay',400000,'thanh_cong','vnpay',NULL,1,'2026-05-19 14:35:50',NULL,'2026-05-19 14:35:50'),
(5,'TT20260522000005',11,'the_ngan_hang',1150000,'thanh_cong','vietqr',NULL,1,'2026-05-20 19:42:50',NULL,'2026-05-20 19:42:50'),
(6,'TT20260522000006',13,'tien_mat',1200000,'thanh_cong',NULL,NULL,1,'2026-05-08 12:39:50',NULL,'2026-05-08 12:39:50'),
(7,'TT20260522000007',14,'the_ngan_hang',950000,'thanh_cong','vietqr',NULL,1,'2026-05-18 20:37:50',NULL,'2026-05-18 20:37:50'),
(8,'TT20260522000008',15,'vnpay',1100000,'thanh_cong','vnpay',NULL,1,'2026-05-15 18:42:50',NULL,'2026-05-15 18:42:50'),
(9,'TT20260522000009',16,'momo',800000,'thanh_cong','momo',NULL,1,'2026-05-09 15:40:50',NULL,'2026-05-09 15:40:50'),
(10,'TT20260522000010',17,'tien_mat',600000,'thanh_cong',NULL,NULL,1,'2026-05-14 17:34:50',NULL,'2026-05-14 17:34:50'),
(11,'TT20260522000011',19,'tien_mat',1450000,'thanh_cong',NULL,NULL,1,'2026-05-22 21:40:50',NULL,'2026-05-22 21:40:50'),
(12,'TT20260522000012',20,'vnpay',350000,'thanh_cong','vnpay',NULL,1,'2026-05-20 21:35:50',NULL,'2026-05-20 21:35:50'),
(13,'TT20260522000013',21,'vnpay',1200000,'thanh_cong','vnpay',NULL,1,'2026-05-25 18:39:50',NULL,'2026-05-25 18:39:50'),
(14,'TT20260522000014',22,'tien_mat',500000,'thanh_cong',NULL,NULL,1,'2026-05-23 13:40:50',NULL,'2026-05-23 13:40:50'),
(38,'CC4B9C32971E4D0594',57,'the_ngan_hang',727000,'thanh_cong','vietqr',NULL,1,'2026-05-27 06:34:13','2026-05-27 06:46:31','2026-05-27 06:34:15'),
(39,'71C77CD2BA634B29B6C4',58,'the_ngan_hang',2582250,'thanh_cong','vietqr',NULL,1,'2026-05-27 07:06:14','2026-05-27 07:20:56','2026-05-27 07:06:34'),
(40,'94B94319F7C3474E97800',62,'the_ngan_hang',727000,'thanh_cong','vietqr',NULL,1,'2026-05-29 00:41:44','2026-05-29 00:56:31','2026-05-29 00:42:09'),
(41,'D74B7559F7C3474EA47D',63,'the_ngan_hang',727000,'thanh_cong','vietqr',NULL,1,'2026-05-29 07:20:45','2026-05-29 07:32:51','2026-05-29 07:20:51'),
(42,'9894A140EEDC4495949C',86,'the_ngan_hang',868000,'thanh_cong','vietqr',NULL,1,'2026-05-30 14:58:14','2026-05-30 22:12:11','2026-05-30 14:58:23'),
(43,'2A141E8D233A421AB09E',87,'the_ngan_hang',1032000,'thanh_cong','vietqr',NULL,1,'2026-05-31 08:59:11','2026-05-31 16:13:56','2026-05-31 08:59:56'),
(44,'58DC63243EF94E0F8B74',88,'the_ngan_hang',868000,'thanh_cong','vietqr',NULL,1,'2026-05-31 09:13:20','2026-05-31 16:26:42','2026-05-31 09:13:28'),
(1044,'B643668EFB648B1ABE6',88,'the_ngan_hang',206400,'thanh_cong','vietqr',NULL,1,'2026-06-01 02:09:08',NULL,'2026-06-01 02:09:38'),
(50,'TT20260601000001',89,'the_ngan_hang',843000,'thanh_cong','vietqr',NULL,1,'2026-06-01 10:01:00',NULL,'2026-06-01 10:01:23'),
(51,'TT20260601000002',90,'the_ngan_hang',707000,'thanh_cong','vietqr',NULL,1,'2026-06-01 11:01:00',NULL,'2026-06-01 11:01:23'),
(52,'TT20260520CCRSJL01',91,'the_ngan_hang',6128500,'thanh_cong','vietqr',NULL,1,'2026-05-20 17:23:00',NULL,'2026-05-20 17:23:45')
SET IDENTITY_INSERT [ThanhToan] OFF
GO

SET IDENTITY_INSERT [HoaDon] ON
INSERT INTO [HoaDon]([id_hoa_don],[so_hoa_don],[id_don_dat_ve],[id_thanh_toan],[ho_ten_khach],[email_khach],[tong_tien_truoc_giam],[tien_giam],[tong_tien_thanh_toan],[ngay_xuat],[da_gui_email]) VALUES
(1,'HD20260001',3,1,N'Lý Thị Lan','lan7@gmail.com',400000,0,400000,'2026-05-24 16:41:50',1),
(2,'HD20260002',5,2,N'Ngô Thị Vân','van41@gmail.com',1400000,50000,1350000,'2026-05-23 18:33:50',1),
(3,'HD20260003',8,3,N'Bùi Thị Thảo','son48@gmail.com',300000,50000,250000,'2026-05-19 21:30:50',1),
(4,'HD20260004',10,4,N'Đỗ Văn Phong','phong32@gmail.com',400000,0,400000,'2026-05-19 14:35:50',1),
(5,'HD20260005',11,5,N'Hồ Thị Linh','linh15@gmail.com',1200000,50000,1150000,'2026-05-20 19:42:50',1),
(6,'HD20260006',13,6,N'Đặng Thị Thảo','thao29@gmail.com',1200000,0,1200000,'2026-05-08 12:39:50',1),
(7,'HD20260007',14,7,N'Đặng Thị Chi','chi13@gmail.com',1000000,50000,950000,'2026-05-18 20:37:50',1),
(8,'HD20260008',15,8,N'Ngô Thị Hà','h11@gmail.com',1100000,0,1100000,'2026-05-15 18:42:50',1),
(9,'HD20260009',16,9,N'Phạm Văn Kiên','kien5@gmail.com',800000,0,800000,'2026-05-09 15:40:50',1),
(10,'HD20260010',17,10,N'Trần Thị Nga','nga14@gmail.com',600000,0,600000,'2026-05-14 17:34:50',1),
(11,'HD20260011',19,11,N'Vũ Thị Giang','giang9@gmail.com',1500000,50000,1450000,'2026-05-22 21:40:50',1),
(12,'HD20260012',20,12,N'Bùi Thị Thảo','thao45@gmail.com',400000,50000,350000,'2026-05-20 21:35:50',1),
(13,'HD20260013',21,13,N'Trần Thị Anh','anh50@gmail.com',1200000,0,1200000,'2026-05-25 18:39:50',1),
(14,'HD20260014',22,14,N'Phạm Văn Nam','nam42@gmail.com',600000,100000,500000,'2026-05-23 13:40:50',1),
(33,'HD202605274585',57,38,N'Linh','linh@gmail.com',727000,0,727000,'2026-05-27 06:34:15',0),
(34,'HD202605279342',58,39,N'Linh','linh@gmail.com',2582250,0,2582250,'2026-05-27 07:06:34',0),
(35,'HD202605295580',62,40,N'Linh','linh@gmail.com',727000,0,727000,'2026-05-29 00:42:09',0),
(36,'HD202605298870',63,41,N'Linh','linh@gmail.com',727000,0,727000,'2026-05-29 07:20:51',0),
(37,'HD202605309866',86,42,N'Linh','linh@gmail.com',868000,0,868000,'2026-05-30 14:58:23',0),
(38,'HD202605318744',87,43,N'Linh','linh@gmail.com',1032000,0,1032000,'2026-05-31 08:59:56',0),
(39,'HD202605318803',88,44,N'Linh','linh@gmail.com',868000,0,868000,'2026-05-31 09:13:28',0),
(40,'HD20260601001',89,50,N'Ngô Thị Vân','van41@gmail.com',843000,0,843000,'2026-06-01 10:01:23',0),
(41,'HD20260601002',90,51,N'Vũ Văn Minh','minh36@gmail.com',707000,0,707000,'2026-06-01 11:01:23',0),
(42,'HD20260520CCRSJL',91,52,N'Hồng Ngọc','lethihongngoc1612@gmail.com',6088500,0,6128500,'2026-05-20 17:23:45',0)
SET IDENTITY_INSERT [HoaDon] OFF
GO

-- DoiVe
SET IDENTITY_INSERT [DoiVe] ON
INSERT INTO [DoiVe]([id_doi],[id_ve_cu],[id_ve_moi],[phi_doi],[chenh_lech_gia],[tong_phai_tra],[id_thanh_toan],[trang_thai],[thoi_gian_doi]) VALUES
(1002,91,1091,42400,164000,206400,1044,'da_doi','2026-06-01 02:09:08')
SET IDENTITY_INSERT [DoiVe] OFF
GO

-- HoanTien
SET IDENTITY_INSERT [HoanTien] ON
INSERT INTO [HoanTien]([id_hoan],[id_ve],[id_thanh_toan],[tien_goc],[phi_huy],[tien_hoan],[ly_do],[phuong_thuc_hoan],[trang_thai_hoan],[thoi_gian_hoan]) VALUES
(10,1091,1044,1012000,1012000,0,N'Khách hàng hủy','nguon_goc','dang_xu_ly','2026-06-01 02:32:21')
SET IDENTITY_INSERT [HoanTien] OFF
GO

PRINT N'=== Section 6 (Payments) DONE ==='
GO

-- ============================================================
-- SECTION 7: DỮ LIỆU MỚI (CheckIn, DieuPhoi, PhanHoi, ThongBao)
-- ============================================================

-- CheckIn (30 mẫu)
SET IDENTITY_INSERT [CheckIn] ON
INSERT INTO [CheckIn]([id_checkin],[id_ve],[id_ga],[thoi_gian],[phuong_thuc],[ket_qua],[nhan_vien_id],[thiet_bi],[ghi_chu]) VALUES
(1,3,1,'2026-05-24 21:55:00','qr','hop_le',3,'DEVICE-GA-HNO-01',NULL),
(2,5,81,'2026-05-23 18:50:00','qr','hop_le',3,'DEVICE-GA-SGO-01',NULL),
(3,8,81,'2026-05-19 21:45:00','qr','hop_le',3,'DEVICE-GA-SGO-01',NULL),
(4,10,81,'2026-05-19 14:45:00','qr','hop_le',3,'DEVICE-GA-SGO-01',NULL),
(5,11,1,'2026-05-20 19:45:00','qr','hop_le',3,'DEVICE-GA-HNO-01',NULL),
(6,13,1,'2026-05-08 12:45:00','qr','hop_le',3,'DEVICE-GA-HNO-01',NULL),
(7,14,81,'2026-05-18 20:45:00','qr','hop_le',3,'DEVICE-GA-SGO-01',NULL),
(8,15,1,'2026-05-15 18:45:00','qr','hop_le',3,'DEVICE-GA-HNO-01',NULL),
(9,16,1,'2026-05-09 15:45:00','qr','hop_le',3,'DEVICE-GA-HNO-01',NULL),
(10,17,1,'2026-05-14 17:45:00','qr','hop_le',3,'DEVICE-GA-HNO-01',NULL),
(11,57,81,'2026-05-27 05:55:00','qr','hop_le',3,'DEVICE-GA-SGO-01',NULL),
(12,58,81,'2026-05-27 06:55:00','qr','hop_le',3,'DEVICE-GA-SGO-01',NULL),
(13,62,81,'2026-05-29 05:55:00','qr','hop_le',3,'DEVICE-GA-SGO-01',NULL),
(14,63,81,'2026-05-29 06:55:00','qr','hop_le',3,'DEVICE-GA-SGO-01',NULL),
(15,89,81,'2026-05-30 13:55:00','qr','hop_le',3,'DEVICE-GA-SGO-01',NULL),
(16,90,81,'2026-05-31 07:55:00','qr','hop_le',3,'DEVICE-GA-SGO-01',NULL),
(17,110,81,'2026-05-24 13:55:00','manual','hop_le',2,'QUAY-GA-SGO-01',N'Kiểm tra trực tiếp'),
(18,111,81,'2026-05-24 13:56:00','manual','hop_le',2,'QUAY-GA-SGO-01',NULL),
(19,112,81,'2026-05-24 13:57:00','manual','hop_le',2,'QUAY-GA-SGO-01',N'Trẻ em 6-9 tuổi'),
(20,100,81,'2026-06-01 05:55:00','qr','hop_le',3,'DEVICE-GA-SGO-01',NULL),
(21,101,81,'2026-06-01 05:56:00','qr','hop_le',3,'DEVICE-GA-SGO-01',NULL)
SET IDENTITY_INSERT [CheckIn] OFF
GO

-- DieuPhoi
SET IDENTITY_INSERT [DieuPhoi] ON
INSERT INTO [DieuPhoi]([id_dieu_phoi],[id_chuyen],[loai_su_kien],[mo_ta],[id_ga_anh_huong],[delay_phut],[nguoi_tao],[thoi_gian_tao]) VALUES
(1,43,'delay',N'Tàu SE8 bị chậm 15 phút do sự cố kỹ thuật tại ga Nha Trang',62,15,51,'2026-05-31 08:30:00'),
(2,44,'maintenance',N'Bảo trì định kỳ toa 3 – thay thế giảm chấn',NULL,NULL,51,'2026-05-31 22:00:00'),
(3,30,'delay',N'Tàu SE8 bị chậm 20 phút do thời tiết xấu tại khu vực đèo Hải Vân',39,20,51,'2026-05-27 11:00:00'),
(4,25,'maintenance',N'Kiểm tra hệ thống điều hòa toa 6 trước khi chạy',NULL,NULL,51,'2026-05-26 23:00:00'),
(5,6,'delay',N'Tàu SE8 bị chậm 10 phút do tín hiệu đường sắt',15,10,1,'2026-05-23 09:30:00')
SET IDENTITY_INSERT [DieuPhoi] OFF
GO

-- PhanHoi
SET IDENTITY_INSERT [PhanHoi] ON
INSERT INTO [PhanHoi]([id_phan_hoi],[id_ve],[id_tai_khoan],[so_sao],[noi_dung],[loai_phan_hoi],[trang_thai],[thoi_gian_gui]) VALUES
(1,3,7,5,N'Dịch vụ tốt, tàu đúng giờ, ghế ngồi sạch sẽ.','chung','da_duyet','2026-05-25 10:00:00'),
(2,5,41,4,N'Tàu ổn, giường nằm thoải mái. Điều hòa hơi lạnh.','dich_vu','da_duyet','2026-05-24 08:00:00'),
(3,8,45,5,N'Nhân viên nhiệt tình, tàu sạch sẽ.','ve_sinh','da_duyet','2026-05-20 15:00:00'),
(4,10,32,4,N'Chuyến đi thoải mái, đúng giờ.','dung_gio','da_duyet','2026-05-20 20:00:00'),
(5,11,15,5,N'Rất hài lòng, sẽ đi tiếp.','chung','da_duyet','2026-05-21 10:00:00'),
(6,13,29,3,N'Tàu bị trễ 30 phút, cần cải thiện.','dung_gio','da_duyet','2026-05-09 14:00:00'),
(7,14,13,4,N'Ghế ngồi thoải mái, phục vụ tốt.','dich_vu','cho_duyet','2026-05-19 09:00:00'),
(8,15,11,5,N'Tuyệt vời! Sẽ giới thiệu cho bạn bè.','chung','da_duyet','2026-05-16 12:00:00'),
(9,16,5,4,N'Chuyến đi ổn, ghế sạch.','ve_sinh','cho_duyet','2026-05-10 18:00:00'),
(10,17,14,4,N'Vé giá hợp lý, tàu đúng giờ.','dung_gio','da_duyet','2026-05-15 09:00:00')
SET IDENTITY_INSERT [PhanHoi] OFF
GO

-- ThongBao
SET IDENTITY_INSERT [ThongBao] ON
INSERT INTO [ThongBao]([id_thong_bao],[id_tai_khoan],[tieu_de],[noi_dung],[loai],[da_doc],[thoi_gian_tao]) VALUES
(1,22,N'Đặt vé thành công',N'Đặt vé thành công. Vui lòng kiểm tra email.','dat_ve',0,'2026-05-23 13:43:50'),
(2,41,N'Đặt vé thành công',N'Đặt vé thành công. Vui lòng kiểm tra email.','dat_ve',0,'2026-05-23 18:43:50'),
(3,45,N'Đặt vé thành công',N'Đặt vé thành công. Phí dịch vụ: 20.000đ','dat_ve',1,'2026-05-19 21:43:50'),
(4,12,N'Thông báo hệ thống',N'Hệ thống sẽ bảo trì từ 02:00–04:00 ngày mai.','he_thong',0,'2026-05-23 12:30:05'),
(5,32,N'Đặt vé thành công',N'Đặt vé thành công.','dat_ve',0,'2026-05-20 11:43:50'),
(6,39,N'Ưu đãi mới dành cho bạn',N'Dùng mã KLNWELCOME để nhận ưu đãi!','khuyen_mai',0,'2026-05-23 12:30:05'),
(7,10,N'Đặt vé thành công',N'Đặt vé thành công. Vui lòng kiểm tra email.','dat_ve',1,'2026-05-23 12:30:05'),
(8,35,N'Ưu đãi mới dành cho bạn',N'Dùng mã KLNWELCOME để nhận ưu đãi!','khuyen_mai',0,'2026-05-23 12:30:05'),
(9,36,N'Ưu đãi mới dành cho bạn',N'Dùng mã KLNWELCOME để nhận ưu đãi!','khuyen_mai',0,'2026-05-23 12:30:05'),
(10,7,N'Hủy vé thành công',N'Vé đã hủy. Tiền hoàn sẽ về trong 3-5 ngày.','huy_ve',0,'2026-05-23 12:30:05'),
(11,41,N'Đổi vé thành công',N'Vé mới đã được cấp. Phí đổi: 206.400đ','doi_ve',1,'2026-06-01 02:09:38'),
(12,41,N'Đặt vé thành công',N'Đặt vé thành công.','dat_ve',0,'2026-05-23 12:30:05')
SET IDENTITY_INSERT [ThongBao] OFF
GO

-- AuditLog (mẫu)
SET IDENTITY_INSERT [AuditLog] ON
INSERT INTO [AuditLog]([id_log],[bang],[ma_ban_ghi],[hanh_dong],[gia_tri_cu],[gia_tri_moi],[id_tai_khoan],[ip_address],[user_agent],[thoi_gian]) VALUES
(1,'DonDatVe','57','UPDATE',N'{"trang_thai":"cho_thanh_toan"}',N'{"trang_thai":"da_thanh_toan"}',NULL,NULL,NULL,'2026-05-27 06:34:15'),
(2,'Ve','57','UPDATE',N'{"trang_thai":"cho_xac_nhan"}',N'{"trang_thai":"da_xac_nhan"}',NULL,NULL,NULL,'2026-05-27 06:34:15'),
(3,'DonDatVe','58','UPDATE',N'{"trang_thai":"cho_thanh_toan"}',N'{"trang_thai":"da_thanh_toan"}',NULL,NULL,NULL,'2026-05-27 07:06:34'),
(4,'DonDatVe','88','UPDATE',N'{"trang_thai":"cho_thanh_toan"}',N'{"trang_thai":"da_thanh_toan"}',NULL,NULL,NULL,'2026-05-31 09:13:28'),
(5,'Ve','91','UPDATE',N'{"trang_thai":"da_xac_nhan"}',N'{"trang_thai":"da_doi"}',NULL,NULL,NULL,'2026-06-01 02:09:08'),
(6,'Ve','1091','UPDATE',N'{"trang_thai":"cho_xac_nhan"}',N'{"trang_thai":"da_huy"}',NULL,NULL,NULL,'2026-06-01 02:32:21'),
(7,'TaiKhoan','52','INSERT',NULL,N'{"id":52,"email":"linh1612@gmail.com"}',52,'192.168.1.100','Mozilla/5.0 Chrome/124','2026-06-01 11:33:38'),
(8,'DonDatVe','91','UPDATE',N'{"trang_thai":"cho_thanh_toan"}',N'{"trang_thai":"da_thanh_toan"}',52,'192.168.1.100',NULL,'2026-05-20 17:23:45')
SET IDENTITY_INSERT [AuditLog] OFF
GO

PRINT N'=== Section 7 (Operations) DONE ==='
GO

-- ============================================================
-- SECTION 8: STORED PROCEDURES
-- ============================================================

CREATE PROCEDURE [dbo].[sp_GiuGheTam]
    @id_chuyen INT, @so_toa_thu_tu INT, @so_ghe_trong_toa INT,
    @id_tai_khoan INT=NULL, @session_id VARCHAR(100)=NULL
AS
BEGIN
    SET NOCOUNT ON
    BEGIN TRANSACTION
    BEGIN TRY
        DECLARE @hold_min INT=(SELECT CAST(config_value AS INT) FROM SystemConfig WHERE config_key='HOLD_MINUTES')
        IF @hold_min IS NULL SET @hold_min=15
        DELETE FROM TamGiuGhe WHERE id_chuyen=@id_chuyen AND so_toa_thu_tu=@so_toa_thu_tu AND so_ghe_trong_toa=@so_ghe_trong_toa AND (trang_thai='het_han' OR thoi_gian_het_han<DATEADD(HOUR,7,GETUTCDATE()))
        IF EXISTS(SELECT 1 FROM Ve WHERE id_chuyen=@id_chuyen AND so_toa_thu_tu=@so_toa_thu_tu AND so_ghe_trong_toa=@so_ghe_trong_toa AND trang_thai NOT IN('da_huy','da_doi'))
        BEGIN ROLLBACK;SELECT 0 AS thanh_cong,N'Ghế đã được bán' AS message;RETURN END
        IF EXISTS(SELECT 1 FROM TamGiuGhe WHERE id_chuyen=@id_chuyen AND so_toa_thu_tu=@so_toa_thu_tu AND so_ghe_trong_toa=@so_ghe_trong_toa AND trang_thai='dang_giu' AND thoi_gian_het_han>DATEADD(HOUR,7,GETUTCDATE()) AND((id_tai_khoan<>@id_tai_khoan AND @id_tai_khoan IS NOT NULL)OR(session_id<>@session_id AND @session_id IS NOT NULL)))
        BEGIN ROLLBACK;SELECT 0 AS thanh_cong,N'Ghế đang được giữ' AS message;RETURN END
        IF EXISTS(SELECT 1 FROM TamGiuGhe WHERE id_chuyen=@id_chuyen AND so_toa_thu_tu=@so_toa_thu_tu AND so_ghe_trong_toa=@so_ghe_trong_toa)
            UPDATE TamGiuGhe SET trang_thai='dang_giu',thoi_gian_het_han=DATEADD(MINUTE,@hold_min,GETDATE()) WHERE id_chuyen=@id_chuyen AND so_toa_thu_tu=@so_toa_thu_tu AND so_ghe_trong_toa=@so_ghe_trong_toa
        ELSE
            INSERT INTO TamGiuGhe(id_chuyen,so_toa_thu_tu,so_ghe_trong_toa,id_tai_khoan,session_id,trang_thai,thoi_gian_giu,thoi_gian_het_han)
            VALUES(@id_chuyen,@so_toa_thu_tu,@so_ghe_trong_toa,@id_tai_khoan,@session_id,'dang_giu',GETDATE(),DATEADD(MINUTE,@hold_min,GETDATE()))
        COMMIT
        SELECT 1 AS thanh_cong,DATEADD(MINUTE,@hold_min,GETDATE()) AS het_han,N'Giữ ghế thành công' AS message
    END TRY
    BEGIN CATCH IF @@TRANCOUNT>0 ROLLBACK;THROW; END CATCH
END
GO

CREATE PROCEDURE [dbo].[sp_DonGiuGheHetHan]
AS
BEGIN
    SET NOCOUNT ON
    UPDATE TamGiuGhe SET trang_thai='het_han' WHERE trang_thai='dang_giu' AND thoi_gian_het_han<DATEADD(HOUR,7,GETUTCDATE())
    UPDATE DonDatVe SET trang_thai='het_han' WHERE trang_thai='cho_thanh_toan' AND thoi_gian_het_han<DATEADD(HOUR,7,GETUTCDATE())
    UPDATE Ve SET trang_thai='da_huy' WHERE trang_thai='cho_xac_nhan' AND id_don_dat_ve IN(SELECT id_don_dat_ve FROM DonDatVe WHERE trang_thai='het_han')
    SELECT @@ROWCOUNT AS so_dong_cap_nhat
END
GO

CREATE PROCEDURE [dbo].[sp_XacNhanThanhToan]
    @ma_giao_dich VARCHAR(30), @ma_gd_ngan_hang VARCHAR(50)=NULL, @gateway_response NVARCHAR(MAX)=NULL
AS
BEGIN
    SET NOCOUNT ON
    BEGIN TRANSACTION
    BEGIN TRY
        DECLARE @id_tt INT DECLARE @id_don INT DECLARE @tt VARCHAR(25) DECLARE @het_han DATETIME
        SELECT @id_tt=id_thanh_toan,@id_don=id_don_dat_ve,@tt=trang_thai,@het_han=thoi_gian_het_han FROM ThanhToan WHERE ma_giao_dich=@ma_giao_dich
        IF @id_tt IS NULL BEGIN ROLLBACK;SELECT -1 AS error_code,N'Giao dịch không tồn tại' AS message;RETURN END
        IF @tt='thanh_cong' BEGIN ROLLBACK;SELECT -2 AS error_code,N'Đã xác nhận' AS message;RETURN END
        IF GETDATE()>@het_han BEGIN ROLLBACK;SELECT -3 AS error_code,N'Hết hạn thanh toán' AS message;RETURN END
        UPDATE ThanhToan SET trang_thai='thanh_cong',ma_gd_ngan_hang=@ma_gd_ngan_hang,gateway_response=@gateway_response,thoi_gian_thanh_toan=GETDATE() WHERE id_thanh_toan=@id_tt
        UPDATE DonDatVe SET trang_thai='da_thanh_toan' WHERE id_don_dat_ve=@id_don
        UPDATE Ve SET trang_thai='da_xac_nhan' WHERE id_don_dat_ve=@id_don AND trang_thai='cho_xac_nhan'
        UPDATE TamGiuGhe SET trang_thai='da_dat' WHERE id_don_dat_ve=@id_don AND trang_thai='dang_giu'
        DECLARE @ma_hd VARCHAR(30)='HD'+FORMAT(GETDATE(),'yyyyMMddHHmmss')+RIGHT(CAST(@id_don AS VARCHAR),4)
        DECLARE @ho_ten NVARCHAR(100) DECLARE @email VARCHAR(255) DECLARE @tong DECIMAL(15,2) DECLARE @giam DECIMAL(15,2) DECLARE @tt_pay DECIMAL(15,2)
        SELECT @ho_ten=ho_ten_lien_lac,@email=email_dat_cho,@tong=tong_tien,@giam=tien_giam,@tt_pay=tien_thanh_toan FROM DonDatVe WHERE id_don_dat_ve=@id_don
        INSERT INTO HoaDon(so_hoa_don,id_don_dat_ve,id_thanh_toan,ho_ten_khach,email_khach,tong_tien_truoc_giam,tien_giam,tong_tien_thanh_toan) VALUES(@ma_hd,@id_don,@id_tt,@ho_ten,@email,@tong,@giam,@tt_pay)
        COMMIT
        SELECT @id_tt AS id_thanh_toan,'thanh_cong' AS ket_qua,@ma_hd AS so_hoa_don
    END TRY
    BEGIN CATCH IF @@TRANCOUNT>0 ROLLBACK;THROW; END CATCH
END
GO

CREATE PROCEDURE [dbo].[sp_CheckIn]
    @id_ve INT,@id_ga INT,@nhan_vien_id INT=NULL,@phuong_thuc VARCHAR(20)='qr',@thiet_bi VARCHAR(100)=NULL
AS
BEGIN
    SET NOCOUNT ON
    DECLARE @tt VARCHAR(25) DECLARE @id_ga_len INT DECLARE @id_ga_xuong INT DECLARE @id_chuyen INT
    DECLARE @ket_qua VARCHAR(25) DECLARE @ghi_chu NVARCHAR(500)
    SELECT @tt=v.trang_thai,@id_ga_len=v.id_ga_len,@id_ga_xuong=v.id_ga_xuong,@id_chuyen=v.id_chuyen FROM Ve v WHERE v.id_ve=@id_ve
    IF @tt IS NULL BEGIN SET @ket_qua='khong_hop_le'; SET @ghi_chu=N'Vé không tồn tại' END
    ELSE IF @tt='da_huy' BEGIN SET @ket_qua='da_huy'; SET @ghi_chu=N'Vé đã bị hủy' END
    ELSE IF @tt='da_doi' BEGIN SET @ket_qua='khong_hop_le'; SET @ghi_chu=N'Vé đã đổi' END
    ELSE IF EXISTS(SELECT 1 FROM CheckIn WHERE id_ve=@id_ve AND ket_qua='hop_le') BEGIN SET @ket_qua='da_checkin'; SET @ghi_chu=N'Đã check-in trước đó' END
    ELSE IF @id_ga<>@id_ga_len BEGIN SET @ket_qua='sai_ga'; SET @ghi_chu=N'Ga check-in không khớp' END
    ELSE BEGIN
        DECLARE @gio_chay DATETIME
        SELECT @gio_chay=CAST(ct.ngay_chay AS DATETIME)+CAST(lc.gio_khoi_hanh AS DATETIME)
        FROM ChuyenTau ct JOIN LichChay lc ON lc.id_lich_chay=ct.id_lich_chay WHERE ct.id_chuyen=@id_chuyen
        IF GETDATE()>DATEADD(HOUR,2,@gio_chay) BEGIN SET @ket_qua='qua_han'; SET @ghi_chu=N'Quá 2 giờ kể từ giờ chạy' END
        ELSE BEGIN SET @ket_qua='hop_le'; SET @ghi_chu=N'Check-in thành công'; UPDATE Ve SET trang_thai='da_su_dung' WHERE id_ve=@id_ve END
    END
    INSERT INTO CheckIn(id_ve,id_ga,phuong_thuc,ket_qua,nhan_vien_id,thiet_bi,ghi_chu) VALUES(@id_ve,@id_ga,@phuong_thuc,@ket_qua,@nhan_vien_id,@thiet_bi,@ghi_chu)
    SELECT SCOPE_IDENTITY() AS id_checkin,@ket_qua AS ket_qua,@ghi_chu AS ghi_chu
END
GO

CREATE PROCEDURE [dbo].[sp_TraCuuDatCho]
    @ma_dat_cho VARCHAR(20),@sdt VARCHAR(15),@email VARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON
    IF NOT EXISTS(SELECT 1 FROM DonDatVe WHERE ma_dat_cho=@ma_dat_cho AND REPLACE(sdt_dat_cho,' ','')=REPLACE(@sdt,' ','') AND LOWER(email_dat_cho)=LOWER(@email))
    BEGIN SELECT NULL AS id_don_dat_ve;RETURN END
    SELECT d.id_don_dat_ve,d.ma_don,d.ma_dat_cho,d.ho_ten_lien_lac,d.email_dat_cho,d.sdt_dat_cho,d.loai_ve,d.tong_tien,d.tien_giam,d.tien_thanh_toan,d.trang_thai AS trang_thai_don,d.thoi_gian_dat,d.thoi_gian_het_han,
           tt.phuong_thuc,tt.thoi_gian_thanh_toan,tt.ma_giao_dich,
           v.id_ve,v.trang_thai AS trang_thai_ve,v.gia_ve,v.so_toa_thu_tu,v.so_ghe_trong_toa,v.loai_hanh_khach,v.qr_ve,
           hk.ho_ten,hk.cccd,hk.ngay_sinh,ct.ngay_chay,tau.so_hieu AS ma_tau,
           ltc_len.gio_di AS gio_di,ltc_xuo.gio_den AS gio_den,
           gd.ten_ga AS ga_di,gd.ma_ga_viet_tat AS vt_ga_di,gn.ten_ga AS ga_den,gn.ma_ga_viet_tat AS vt_ga_den,
           ht.tien_hoan,ht.phi_huy,ht.trang_thai_hoan,dv.id_ve_moi
    FROM DonDatVe d
    JOIN Ve v ON v.id_don_dat_ve=d.id_don_dat_ve
    JOIN HanhKhach hk ON hk.id_hanh_khach=v.id_hanh_khach
    JOIN ChuyenTau ct ON ct.id_chuyen=v.id_chuyen
    JOIN LichChay lc ON lc.id_lich_chay=ct.id_lich_chay
    JOIN Tau tau ON tau.id_tau=lc.id_tau
    JOIN GaTau gd ON gd.id_ga=v.id_ga_len
    JOIN GaTau gn ON gn.id_ga=v.id_ga_xuong
    LEFT JOIN LichTrinhChuyen ltc_len ON ltc_len.id_lich_chay=lc.id_lich_chay AND ltc_len.id_ga=v.id_ga_len
    LEFT JOIN LichTrinhChuyen ltc_xuo ON ltc_xuo.id_lich_chay=lc.id_lich_chay AND ltc_xuo.id_ga=v.id_ga_xuong
    LEFT JOIN ThanhToan tt ON tt.id_don_dat_ve=d.id_don_dat_ve AND tt.trang_thai='thanh_cong'
    LEFT JOIN HoanTien ht ON ht.id_ve=v.id_ve
    LEFT JOIN DoiVe dv ON dv.id_ve_cu=v.id_ve
    WHERE d.ma_dat_cho=@ma_dat_cho AND REPLACE(d.sdt_dat_cho,' ','')=REPLACE(@sdt,' ','') AND LOWER(d.email_dat_cho)=LOWER(@email)
    ORDER BY v.id_ve
END
GO

CREATE PROCEDURE [dbo].[sp_GetSoDoGhe]
    @id_chuyen INT,@so_toa_thu_tu INT,@id_ga_len INT,@id_ga_xuong INT
AS
BEGIN
    SET NOCOUNT ON
    DECLARE @id_tau INT DECLARE @id_loai_toa INT
    SELECT @id_tau=lc.id_tau FROM ChuyenTau ct JOIN LichChay lc ON lc.id_lich_chay=ct.id_lich_chay WHERE ct.id_chuyen=@id_chuyen
    SELECT @id_loai_toa=id_loai_toa FROM CauHinhToa WHERE id_tau=@id_tau AND so_toa_thu_tu=@so_toa_thu_tu
    SELECT cg.so_ghe_trong_toa AS so_ghe,cg.vi_tri,cg.tang,cg.khoang_so,cg.ben,lg.ma_loai_ghe,lg.ten_loai_ghe,
           dbo.fn_TinhGiaVe(@id_chuyen,@id_ga_len,@id_ga_xuong,cg.id_loai_ghe) AS gia,
           CASE WHEN EXISTS(SELECT 1 FROM Ve v WHERE v.id_chuyen=@id_chuyen AND v.so_toa_thu_tu=@so_toa_thu_tu AND v.so_ghe_trong_toa=cg.so_ghe_trong_toa AND v.trang_thai NOT IN('da_huy','da_doi')) THEN 'sold'
                WHEN EXISTS(SELECT 1 FROM TamGiuGhe tg WHERE tg.id_chuyen=@id_chuyen AND tg.so_toa_thu_tu=@so_toa_thu_tu AND tg.so_ghe_trong_toa=cg.so_ghe_trong_toa AND tg.trang_thai='dang_giu' AND tg.thoi_gian_het_han>DATEADD(HOUR,7,GETUTCDATE())) THEN 'held'
                ELSE 'empty' END AS trang_thai
    FROM CauHinhGhe cg JOIN LoaiGhe lg ON lg.id_loai_ghe=cg.id_loai_ghe
    WHERE cg.id_loai_toa=@id_loai_toa ORDER BY cg.so_ghe_trong_toa
END
GO

-- ============================================================
-- SECTION 9: CHUYẾN TÀU THÁNG 6/2026 (ngày 03–30)
-- Chạy script này riêng nếu đã restore xong phần trước
-- ============================================================

-- 3 lịch chạy chính mỗi ngày: SE7(1), SE3(2), SE8(6)
DECLARE @d DATE = '2026-06-03'
WHILE @d <= '2026-06-30'
BEGIN
    IF NOT EXISTS(SELECT 1 FROM ChuyenTau WHERE id_lich_chay=1 AND ngay_chay=@d)
        INSERT INTO ChuyenTau(id_lich_chay,ngay_chay,trang_thai) VALUES(1,@d,'dung_gio')
    IF NOT EXISTS(SELECT 1 FROM ChuyenTau WHERE id_lich_chay=2 AND ngay_chay=@d)
        INSERT INTO ChuyenTau(id_lich_chay,ngay_chay,trang_thai) VALUES(2,@d,'dung_gio')
    IF NOT EXISTS(SELECT 1 FROM ChuyenTau WHERE id_lich_chay=6 AND ngay_chay=@d)
        INSERT INTO ChuyenTau(id_lich_chay,ngay_chay,trang_thai) VALUES(6,@d,'dung_gio')
    -- Các lịch phụ (SE1, SE2, SE5, SE6): chạy 3 ngày/tuần (T2, T4, T6)
    IF DATEPART(WEEKDAY,@d) IN (2,4,6) -- Monday=2, Wednesday=4, Friday=6
    BEGIN
        IF NOT EXISTS(SELECT 1 FROM ChuyenTau WHERE id_lich_chay=4 AND ngay_chay=@d)
            INSERT INTO ChuyenTau(id_lich_chay,ngay_chay,trang_thai) VALUES(4,@d,'dung_gio')
        IF NOT EXISTS(SELECT 1 FROM ChuyenTau WHERE id_lich_chay=7 AND ngay_chay=@d)
            INSERT INTO ChuyenTau(id_lich_chay,ngay_chay,trang_thai) VALUES(7,@d,'dung_gio')
    END
    IF DATEPART(WEEKDAY,@d) IN (3,5,7) -- Tuesday=3, Thursday=5, Saturday=7
    BEGIN
        IF NOT EXISTS(SELECT 1 FROM ChuyenTau WHERE id_lich_chay=3 AND ngay_chay=@d)
            INSERT INTO ChuyenTau(id_lich_chay,ngay_chay,trang_thai) VALUES(3,@d,'dung_gio')
        IF NOT EXISTS(SELECT 1 FROM ChuyenTau WHERE id_lich_chay=8 AND ngay_chay=@d)
            INSERT INTO ChuyenTau(id_lich_chay,ngay_chay,trang_thai) VALUES(8,@d,'dung_gio')
    END
    SET @d = DATEADD(DAY,1,@d)
END
GO

-- Tháng 7/2026
DECLARE @d2 DATE = '2026-07-01'
WHILE @d2 <= '2026-07-31'
BEGIN
    IF NOT EXISTS(SELECT 1 FROM ChuyenTau WHERE id_lich_chay=1 AND ngay_chay=@d2)
        INSERT INTO ChuyenTau(id_lich_chay,ngay_chay,trang_thai) VALUES(1,@d2,'dung_gio')
    IF NOT EXISTS(SELECT 1 FROM ChuyenTau WHERE id_lich_chay=2 AND ngay_chay=@d2)
        INSERT INTO ChuyenTau(id_lich_chay,ngay_chay,trang_thai) VALUES(2,@d2,'dung_gio')
    IF NOT EXISTS(SELECT 1 FROM ChuyenTau WHERE id_lich_chay=6 AND ngay_chay=@d2)
        INSERT INTO ChuyenTau(id_lich_chay,ngay_chay,trang_thai) VALUES(6,@d2,'dung_gio')
    IF DATEPART(WEEKDAY,@d2) IN (2,4,6)
    BEGIN
        IF NOT EXISTS(SELECT 1 FROM ChuyenTau WHERE id_lich_chay=4 AND ngay_chay=@d2)
            INSERT INTO ChuyenTau(id_lich_chay,ngay_chay,trang_thai) VALUES(4,@d2,'dung_gio')
    END
    SET @d2 = DATEADD(DAY,1,@d2)
END
GO

PRINT N'=== Section 9 (ChuyenTau tháng 6–7/2026) DONE ==='
GO

PRINT N'=== CSDLHC.SQL COMPLETE – KLN Train v2.0 ==='
PRINT N'Tables: SystemConfig,VaiTro,Quyen,VaiTroQuyen,TaiKhoan,TaiKhoanVaiTro,'
PRINT N'        GaTau(85),Tau(10),LoaiToa(6),LoaiGhe(10),CauHinhToa,CauHinhGhe,'
PRINT N'        LichChay(10),LichTrinhChuyen,BieuGia(6),ChinhSachGia,ChinhSachHuy,'
PRINT N'        KhuyenMai(8),ChuyenTau(50),ToaChuyen,HanhKhach(52),'
PRINT N'        DonDatVe,Ve,TamGiuGhe,ThanhToan,HoaDon,HoanTien,DoiVe,'
PRINT N'        CheckIn(21),DieuPhoi(5),PhanHoi(10),ThongBao(12),AuditLog'
GO
