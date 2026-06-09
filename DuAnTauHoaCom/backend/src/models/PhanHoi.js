const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const PhanHoi = sequelize.define('PhanHoi', {
  id_phan_hoi:    { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_ve:          { type: DataTypes.INTEGER, allowNull: false },
  id_tai_khoan:   { type: DataTypes.INTEGER },
  so_sao:         { type: DataTypes.TINYINT, allowNull: false },
  noi_dung:       { type: DataTypes.TEXT },
  loai_phan_hoi:  { type: DataTypes.STRING(30), allowNull: false },
  trang_thai:     { type: DataTypes.STRING(25), allowNull: false, defaultValue: 'cho_duyet' },
  thoi_gian_gui:  { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, { tableName: 'PhanHoi', timestamps: false })

module.exports = PhanHoi
