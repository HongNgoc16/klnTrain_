const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const DonDatVe = sequelize.define('DonDatVe', {
  id_don_dat_ve:    { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  ma_don:           { type: DataTypes.STRING(20), allowNull: false, unique: true },
  ma_dat_cho:       { type: DataTypes.STRING(20), allowNull: false, unique: true },
  id_tai_khoan:     { type: DataTypes.INTEGER },
  ho_ten_lien_lac:  { type: DataTypes.STRING(100), allowNull: false },
  email_dat_cho:    { type: DataTypes.STRING(255), allowNull: false },
  sdt_dat_cho:      { type: DataTypes.STRING(15), allowNull: false },
  cccd:             { type: DataTypes.STRING(20), allowNull: false },
  loai_ve:          { type: DataTypes.STRING(15), allowNull: false }, // mot_chieu | khu_hoi
  tong_tien:        { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  tien_giam:        { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0 },
  tien_thanh_toan:  { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  id_khuyen_mai:    { type: DataTypes.INTEGER },
  trang_thai:       { type: DataTypes.STRING(25), allowNull: false, defaultValue: 'cho_thanh_toan' },
  thoi_gian_dat:    { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  thoi_gian_het_han:{ type: DataTypes.DATE, allowNull: false },
}, { tableName: 'DonDatVe', timestamps: false, hasTrigger: true })

module.exports = DonDatVe
