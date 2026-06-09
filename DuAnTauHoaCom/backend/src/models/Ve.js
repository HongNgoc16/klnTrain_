const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const Ve = sequelize.define('Ve', {
  id_ve:            { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_don_dat_ve:    { type: DataTypes.INTEGER, allowNull: false },
  id_hanh_khach:    { type: DataTypes.INTEGER, allowNull: false },
  id_chuyen:        { type: DataTypes.INTEGER, allowNull: false },
  so_toa_thu_tu:    { type: DataTypes.INTEGER, allowNull: false },
  so_ghe_trong_toa: { type: DataTypes.INTEGER, allowNull: false },
  id_ga_len:        { type: DataTypes.INTEGER, allowNull: false },
  id_ga_xuong:      { type: DataTypes.INTEGER, allowNull: false },
  loai_hanh_khach:  { type: DataTypes.STRING(25), allowNull: false }, // nguoi_lon | tre_em
  gia_ve:           { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  qr_ve:            { type: DataTypes.TEXT },
  trang_thai:       { type: DataTypes.STRING(25), allowNull: false, defaultValue: 'cho_xac_nhan' },
  ngay_xuat_ve:     { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  id_cs_huy:        { type: DataTypes.INTEGER },
}, { tableName: 'Ve', timestamps: false, hasTrigger: true })

module.exports = Ve
