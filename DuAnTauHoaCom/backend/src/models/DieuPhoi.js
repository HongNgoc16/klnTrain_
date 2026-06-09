const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const DieuPhoi = sequelize.define('DieuPhoi', {
  id_dieu_phoi:    { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_chuyen:       { type: DataTypes.INTEGER, allowNull: false },
  loai_su_kien:    { type: DataTypes.STRING(30), allowNull: false },
  mo_ta:           { type: DataTypes.TEXT },
  id_ga_anh_huong: { type: DataTypes.INTEGER },
  delay_phut:      { type: DataTypes.INTEGER },
  nguoi_tao:       { type: DataTypes.INTEGER, allowNull: false },
  // Không set defaultValue: DataTypes.NOW → để DB tự xử lý DEFAULT GETDATE()
  // Tránh lỗi "Conversion failed when converting date and/or time from character string" MSSQL
  thoi_gian_tao:   { type: DataTypes.DATE },
  trang_thai:      { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'hieu_luc' },
}, { tableName: 'DieuPhoi', timestamps: false })

module.exports = DieuPhoi
