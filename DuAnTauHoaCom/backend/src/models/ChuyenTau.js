const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const ChuyenTau = sequelize.define('ChuyenTau', {
  id_chuyen:    { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_lich_chay: { type: DataTypes.INTEGER, allowNull: false },
  ngay_chay:    { type: DataTypes.DATEONLY, allowNull: false },
  trang_thai:   { type: DataTypes.STRING(25), allowNull: false, defaultValue: 'binh_thuong' },
  ghi_chu:      { type: DataTypes.STRING(500) },
}, { tableName: 'ChuyenTau', timestamps: false })

module.exports = ChuyenTau
