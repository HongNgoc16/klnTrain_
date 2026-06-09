const { sequelize } = require('../config/database')

const TaiKhoan     = require('./TaiKhoan')
const GaTau        = require('./GaTau')
const Tau          = require('./Tau')
const LoaiToa      = require('./LoaiToa')
const LoaiGhe      = require('./LoaiGhe')
const CauHinhToa   = require('./CauHinhToa')
const CauHinhGhe   = require('./CauHinhGhe')
const LichChay     = require('./LichChay')
const LichTrinhChuyen = require('./LichTrinhChuyen')
const ChuyenTau    = require('./ChuyenTau')
const ToaChuyen    = require('./ToaChuyen')
const GheChuyen    = require('./GheChuyen')
const GheChang     = require('./GheChang')
const DieuPhoi     = require('./DieuPhoi')
const LichTrinhThucTe = require('./LichTrinhThucTe')
const BieuGia      = require('./BieuGia')
const ChinhSachGia = require('./ChinhSachGia')
const ChinhSachHuy = require('./ChinhSachHuy')
const KhuyenMai    = require('./KhuyenMai')
const HanhKhach    = require('./HanhKhach')
const DonDatVe     = require('./DonDatVe')
const DonKhuHoi    = require('./DonKhuHoi')
const TamGiuGhe    = require('./TamGiuGhe')
const ThanhToan    = require('./ThanhToan')
const Ve           = require('./Ve')
const HoaDon       = require('./HoaDon')
const HoanTien     = require('./HoanTien')
const DoiVe        = require('./DoiVe')
const PhanHoi      = require('./PhanHoi')
const ThongBao     = require('./ThongBao')
const AuditLog     = require('./AuditLog')

// ─── Associations ──────────────────────────────────────────────────

// TaiKhoan
TaiKhoan.hasMany(HanhKhach,  { foreignKey: 'id_tai_khoan' })
TaiKhoan.hasMany(DonDatVe,   { foreignKey: 'id_tai_khoan' })
TaiKhoan.hasMany(ThongBao,   { foreignKey: 'id_tai_khoan' })

HanhKhach.belongsTo(TaiKhoan, { foreignKey: 'id_tai_khoan' })
DonDatVe.belongsTo(TaiKhoan,  { foreignKey: 'id_tai_khoan' })

// Tau → CauHinhToa → LoaiToa
Tau.hasMany(CauHinhToa,    { foreignKey: 'id_tau' })
CauHinhToa.belongsTo(Tau,  { foreignKey: 'id_tau' })
CauHinhToa.belongsTo(LoaiToa, { foreignKey: 'id_loai_toa' })
LoaiToa.hasMany(CauHinhToa,   { foreignKey: 'id_loai_toa' })

// LoaiToa → LoaiGhe → CauHinhGhe
LoaiToa.hasMany(LoaiGhe,    { foreignKey: 'id_loai_toa' })
LoaiGhe.belongsTo(LoaiToa,  { foreignKey: 'id_loai_toa' })
LoaiToa.hasMany(CauHinhGhe, { foreignKey: 'id_loai_toa' })
CauHinhGhe.belongsTo(LoaiToa, { foreignKey: 'id_loai_toa' })
CauHinhGhe.belongsTo(LoaiGhe, { foreignKey: 'id_loai_ghe' })

// LichChay
Tau.hasMany(LichChay,     { foreignKey: 'id_tau' })
LichChay.belongsTo(Tau,   { foreignKey: 'id_tau' })
GaTau.hasMany(LichChay,   { foreignKey: 'id_ga_di', as: 'GaDi' })
GaTau.hasMany(LichChay,   { foreignKey: 'id_ga_den', as: 'GaDen' })
LichChay.belongsTo(GaTau, { foreignKey: 'id_ga_di',  as: 'GaDi'  })
LichChay.belongsTo(GaTau, { foreignKey: 'id_ga_den', as: 'GaDen' })
LichChay.hasMany(LichTrinhChuyen, { foreignKey: 'id_lich_chay' })
LichTrinhChuyen.belongsTo(LichChay, { foreignKey: 'id_lich_chay' })
LichTrinhChuyen.belongsTo(GaTau,    { foreignKey: 'id_ga' })

// ChuyenTau
LichChay.hasMany(ChuyenTau,   { foreignKey: 'id_lich_chay' })
ChuyenTau.belongsTo(LichChay, { foreignKey: 'id_lich_chay' })

// ToaChuyen (runtime coach per trip)
ChuyenTau.hasMany(ToaChuyen,   { foreignKey: 'id_chuyen' })
ToaChuyen.belongsTo(ChuyenTau, { foreignKey: 'id_chuyen' })
ToaChuyen.belongsTo(LoaiToa,   { foreignKey: 'id_loai_toa' })
LoaiToa.hasMany(ToaChuyen,     { foreignKey: 'id_loai_toa' })

// DieuPhoi + LichTrinhThucTe
ChuyenTau.hasMany(DieuPhoi,        { foreignKey: 'id_chuyen' })
DieuPhoi.belongsTo(ChuyenTau,      { foreignKey: 'id_chuyen' })
DieuPhoi.belongsTo(GaTau,          { foreignKey: 'id_ga_anh_huong', as: 'GaAnhHuong' })
ChuyenTau.hasMany(LichTrinhThucTe, { foreignKey: 'id_chuyen' })
LichTrinhThucTe.belongsTo(ChuyenTau, { foreignKey: 'id_chuyen' })
LichTrinhThucTe.belongsTo(GaTau,  { foreignKey: 'id_ga' })

// GheChuyen + GheChang
ChuyenTau.hasMany(GheChuyen,  { foreignKey: 'id_chuyen' })
GheChuyen.belongsTo(ChuyenTau,{ foreignKey: 'id_chuyen' })
GheChuyen.belongsTo(LoaiGhe,  { foreignKey: 'id_loai_ghe' })
GheChuyen.hasMany(GheChang,   { foreignKey: 'id_ghe_chuyen' })
GheChang.belongsTo(GheChuyen, { foreignKey: 'id_ghe_chuyen' })
GheChang.belongsTo(Ve,        { foreignKey: 'id_ve' })

// DonDatVe
DonDatVe.hasMany(Ve,         { foreignKey: 'id_don_dat_ve' })
DonDatVe.hasMany(ThanhToan,  { foreignKey: 'id_don_dat_ve' })
DonDatVe.hasMany(HoaDon,     { foreignKey: 'id_don_dat_ve' })
DonDatVe.belongsTo(KhuyenMai, { foreignKey: 'id_khuyen_mai' })
DonDatVe.hasMany(TamGiuGhe,  { foreignKey: 'id_don_dat_ve' })

// Ve
Ve.belongsTo(DonDatVe,  { foreignKey: 'id_don_dat_ve' })
Ve.belongsTo(HanhKhach, { foreignKey: 'id_hanh_khach' })
Ve.belongsTo(ChuyenTau, { foreignKey: 'id_chuyen' })
Ve.belongsTo(GaTau,     { foreignKey: 'id_ga_len',   as: 'GaLen'   })
Ve.belongsTo(GaTau,     { foreignKey: 'id_ga_xuong', as: 'GaXuong' })

// ThanhToan
ThanhToan.belongsTo(DonDatVe, { foreignKey: 'id_don_dat_ve' })
ThanhToan.hasOne(HoaDon,      { foreignKey: 'id_thanh_toan' })

// HoaDon
HoaDon.belongsTo(DonDatVe,  { foreignKey: 'id_don_dat_ve' })
HoaDon.belongsTo(ThanhToan,  { foreignKey: 'id_thanh_toan' })

// HoanTien
HoanTien.belongsTo(Ve,        { foreignKey: 'id_ve' })
HoanTien.belongsTo(ThanhToan, { foreignKey: 'id_thanh_toan' })

// DoiVe
DoiVe.belongsTo(Ve, { foreignKey: 'id_ve_cu', as: 'VeCu' })
DoiVe.belongsTo(Ve, { foreignKey: 'id_ve_moi', as: 'VeMoi' })

// TamGiuGhe
TamGiuGhe.belongsTo(ChuyenTau, { foreignKey: 'id_chuyen' })
TamGiuGhe.belongsTo(DonDatVe,  { foreignKey: 'id_don_dat_ve' })

// PhanHoi
PhanHoi.belongsTo(Ve,       { foreignKey: 'id_ve' })
PhanHoi.belongsTo(TaiKhoan, { foreignKey: 'id_tai_khoan' })

// DonKhuHoi
DonKhuHoi.belongsTo(DonDatVe, { foreignKey: 'id_don_di',  as: 'DonDi'  })
DonKhuHoi.belongsTo(DonDatVe, { foreignKey: 'id_don_ve',  as: 'DonVe'  })

module.exports = {
  sequelize,
  TaiKhoan, GaTau, Tau, LoaiToa, LoaiGhe, CauHinhToa, CauHinhGhe,
  LichChay, LichTrinhChuyen, ChuyenTau, ToaChuyen,
  GheChuyen, GheChang,
  BieuGia, ChinhSachGia, ChinhSachHuy, KhuyenMai,
  HanhKhach, DonDatVe, DonKhuHoi, TamGiuGhe, ThanhToan,
  Ve, HoaDon, HoanTien, DoiVe, PhanHoi, ThongBao, AuditLog,
  DieuPhoi, LichTrinhThucTe,
}
