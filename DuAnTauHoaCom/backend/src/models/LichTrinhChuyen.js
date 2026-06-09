const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const LichTrinhChuyen = sequelize.define('LichTrinhChuyen', {
  id_lich_trinh:  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_lich_chay:   { type: DataTypes.INTEGER, allowNull: false },
  id_ga:          { type: DataTypes.INTEGER, allowNull: false },
  thu_tu_dung:    { type: DataTypes.INTEGER, allowNull: false },
  gio_den:        { type: DataTypes.TIME, allowNull: false },
  gio_di:         { type: DataTypes.TIME, allowNull: false },
  khoang_cach_km: { type: DataTypes.DECIMAL(8, 2), allowNull: false },
  thoi_gian_dung: { type: DataTypes.INTEGER, allowNull: false },
  offset_phut:    { type: DataTypes.INTEGER },
}, { tableName: 'LichTrinhChuyen', timestamps: false })

module.exports = LichTrinhChuyen
