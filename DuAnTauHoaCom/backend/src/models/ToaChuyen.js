const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const ToaChuyen = sequelize.define('ToaChuyen', {
  id_toa_chuyen:  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_chuyen:      { type: DataTypes.INTEGER, allowNull: false },
  so_toa_thu_tu:  { type: DataTypes.INTEGER, allowNull: false },
  id_loai_toa:    { type: DataTypes.INTEGER, allowNull: false },
  so_ghe_toi_da:  { type: DataTypes.INTEGER },
  trang_thai:     { type: DataTypes.STRING(20), defaultValue: 'hoat_dong' },
  ghi_chu:        { type: DataTypes.STRING(500) },
}, { tableName: 'ToaChuyen', timestamps: false })

module.exports = ToaChuyen
