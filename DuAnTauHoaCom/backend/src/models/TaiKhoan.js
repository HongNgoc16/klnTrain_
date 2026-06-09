const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const TaiKhoan = sequelize.define('TaiKhoan', {
  id_tai_khoan: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email:        { type: DataTypes.STRING(100), allowNull: false, unique: true },
  mat_khau:     { type: DataTypes.STRING(255), allowNull: false },
  ho_ten:       { type: DataTypes.STRING(100), allowNull: false },
  so_dien_thoai:{ type: DataTypes.STRING(15) },
  ngay_sinh:    { type: DataTypes.DATEONLY },
  gioi_tinh:    { type: DataTypes.STRING(10) },
  vai_tro:      { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'khach_hang' },
  trang_thai:   { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'hoat_dong' },
  ngay_tao:     { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('GETDATE()') },
}, { tableName: 'TaiKhoan', timestamps: false })

module.exports = TaiKhoan
