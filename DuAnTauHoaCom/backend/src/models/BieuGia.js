const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const BieuGia = sequelize.define('BieuGia', {
  id_bieu_gia:     { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  ten_dip:         { type: DataTypes.STRING(150), allowNull: false },
  ngay_bat_dau:    { type: DataTypes.DATEONLY, allowNull: false },
  ngay_ket_thuc:   { type: DataTypes.DATEONLY, allowNull: false },
  he_so_tang:      { type: DataTypes.DECIMAL(4, 2), allowNull: false },
  don_gia_km_goc:  { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  id_loai_ghe:     { type: DataTypes.INTEGER },
  trang_thai:      { type: DataTypes.STRING(25), allowNull: false, defaultValue: 'dang_ap_dung' },
}, { tableName: 'BieuGia', timestamps: false })

module.exports = BieuGia
