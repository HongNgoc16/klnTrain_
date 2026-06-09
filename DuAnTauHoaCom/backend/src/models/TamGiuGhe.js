const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const TamGiuGhe = sequelize.define('TamGiuGhe', {
  id_giu:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_chuyen:        { type: DataTypes.INTEGER, allowNull: false },
  so_toa_thu_tu:    { type: DataTypes.INTEGER, allowNull: false },
  so_ghe_trong_toa: { type: DataTypes.INTEGER, allowNull: false },
  id_don_dat_ve:    { type: DataTypes.INTEGER },
  id_tai_khoan:     { type: DataTypes.INTEGER },
  session_id:       { type: DataTypes.STRING(100) },
  id_ga_len:        { type: DataTypes.INTEGER },
  id_ga_xuong:      { type: DataTypes.INTEGER },
  trang_thai:       { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'dang_giu' },
  thoi_gian_giu:    { type: DataTypes.DATE, allowNull: false },
  thoi_gian_het_han:{ type: DataTypes.DATE, allowNull: false },
}, { tableName: 'TamGiuGhe', timestamps: false })

module.exports = TamGiuGhe
