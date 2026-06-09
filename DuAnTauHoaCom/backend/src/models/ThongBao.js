const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const ThongBao = sequelize.define('ThongBao', {
  id_thong_bao: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_tai_khoan: { type: DataTypes.INTEGER, allowNull: false },
  tieu_de:      { type: DataTypes.STRING(200), allowNull: false },
  noi_dung:     { type: DataTypes.TEXT, allowNull: false },
  loai:         { type: DataTypes.STRING(30), allowNull: false },
  da_doc:       { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  lien_ket:     { type: DataTypes.STRING(255) },
  thoi_gian_tao:{ type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, { tableName: 'ThongBao', timestamps: false })

module.exports = ThongBao
