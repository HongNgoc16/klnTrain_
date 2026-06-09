const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const HoanTien = sequelize.define('HoanTien', {
  id_hoan:              { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_ve:                { type: DataTypes.INTEGER, allowNull: false },
  id_thanh_toan:        { type: DataTypes.INTEGER, allowNull: false },
  tien_goc:             { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  phi_huy:              { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  tien_hoan:            { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  ly_do:                { type: DataTypes.STRING(500) },
  phuong_thuc_hoan:     { type: DataTypes.STRING(25) },
  ten_ngan_hang:        { type: DataTypes.STRING(50) },
  so_tai_khoan_hoan:    { type: DataTypes.STRING(30) },
  trang_thai_hoan:      { type: DataTypes.STRING(25), allowNull: false, defaultValue: 'dang_xu_ly' },
  thoi_gian_hoan:       { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  thoi_gian_hoan_xong:  { type: DataTypes.DATE },
}, { tableName: 'HoanTien', timestamps: false })

module.exports = HoanTien
