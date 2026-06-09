const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const LoaiGhe = sequelize.define('LoaiGhe', {
  id_loai_ghe:  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  ma_loai_ghe:  { type: DataTypes.STRING(15), allowNull: false },
  id_loai_toa:  { type: DataTypes.INTEGER, allowNull: false },
  ten_loai_ghe: { type: DataTypes.STRING(150), allowNull: false },
  he_so_gia:    { type: DataTypes.DECIMAL(4, 2), allowNull: false },
  trang_thai:   { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'hoat_dong' },
}, { tableName: 'LoaiGhe', timestamps: false })

module.exports = LoaiGhe
