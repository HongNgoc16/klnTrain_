const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const HoaDon = sequelize.define('HoaDon', {
  id_hoa_don:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  so_hoa_don:           { type: DataTypes.STRING(30), allowNull: false },
  id_don_dat_ve:        { type: DataTypes.INTEGER, allowNull: false },
  id_thanh_toan:        { type: DataTypes.INTEGER, allowNull: false },
  ho_ten_khach:         { type: DataTypes.STRING(100), allowNull: false },
  email_khach:          { type: DataTypes.STRING(100), allowNull: false },
  tong_tien_truoc_giam: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  tien_giam:            { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0 },
  tong_tien_thanh_toan: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  ngay_xuat:            { type: DataTypes.DATE, allowNull: false },
  da_gui_email:         { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  trang_thai:           { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'hop_le' },
}, { tableName: 'HoaDon', timestamps: false })

module.exports = HoaDon
