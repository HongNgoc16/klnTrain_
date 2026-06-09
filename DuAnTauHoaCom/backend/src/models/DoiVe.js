const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const DoiVe = sequelize.define('DoiVe', {
  id_doi:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_ve_cu:        { type: DataTypes.INTEGER, allowNull: false },
  id_ve_moi:       { type: DataTypes.INTEGER, allowNull: false },
  phi_doi:         { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  chenh_lech_gia:  { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  tong_phai_tra:   { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  id_thanh_toan:   { type: DataTypes.INTEGER },
  trang_thai:      { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'da_doi' },
  thoi_gian_doi:   { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  ghi_chu:         { type: DataTypes.STRING(500) },
}, { tableName: 'DoiVe', timestamps: false })

module.exports = DoiVe
