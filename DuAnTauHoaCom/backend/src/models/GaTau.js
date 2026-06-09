const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const GaTau = sequelize.define('GaTau', {
  id_ga:            { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  ma_ga_viet_tat:   { type: DataTypes.STRING(10), allowNull: false },
  ten_ga:           { type: DataTypes.STRING(50), allowNull: false },
  tinh_thanh:       { type: DataTypes.STRING(50) },
  thu_tu_tuyen:     { type: DataTypes.INTEGER, allowNull: false },
  do_uu_tien:       { type: DataTypes.INTEGER, allowNull: false },
  trang_thai:       { type: DataTypes.STRING(15), allowNull: false, defaultValue: 'hoat_dong' },
}, { tableName: 'GaTau', timestamps: false })

module.exports = GaTau
