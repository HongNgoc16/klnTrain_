const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const KhuyenMai = sequelize.define('KhuyenMai', {
  id_khuyen_mai:       { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  ma_khuyen_mai:       { type: DataTypes.STRING(30), allowNull: false },
  mo_ta:               { type: DataTypes.STRING(255) },
  loai_giam:           { type: DataTypes.STRING(20), allowNull: false }, // phan_tram | so_tien
  gia_tri:             { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  gia_tri_don_toi_thieu: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  giam_toi_da:         { type: DataTypes.DECIMAL(15, 2) },
  so_luong:            { type: DataTypes.INTEGER },
  da_dung:             { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  ngay_bat_dau:        { type: DataTypes.DATEONLY, allowNull: false },
  ngay_het_han:        { type: DataTypes.DATEONLY, allowNull: false },
  ap_dung_cho:         { type: DataTypes.STRING(30) },
}, { tableName: 'KhuyenMai', timestamps: false })

module.exports = KhuyenMai
