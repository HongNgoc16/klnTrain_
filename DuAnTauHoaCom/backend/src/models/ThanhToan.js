const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const ThanhToan = sequelize.define('ThanhToan', {
  id_thanh_toan:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  ma_giao_dich:         { type: DataTypes.STRING(30), allowNull: false },
  id_don_dat_ve:        { type: DataTypes.INTEGER, allowNull: false },
  phuong_thuc:          { type: DataTypes.STRING(30), allowNull: false },
  so_tien:              { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  trang_thai:           { type: DataTypes.STRING(25), allowNull: false, defaultValue: 'dang_xu_ly' },
  payment_gateway:      { type: DataTypes.STRING(30) },
  ma_gd_ngan_hang:      { type: DataTypes.STRING(50) },
  so_lan_thu:           { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  thoi_gian_tao:        { type: DataTypes.DATE, allowNull: false },
  thoi_gian_het_han:    { type: DataTypes.DATE },
  thoi_gian_thanh_toan: { type: DataTypes.DATE },
  gateway_response:     { type: DataTypes.TEXT },
}, { tableName: 'ThanhToan', timestamps: false })

module.exports = ThanhToan
