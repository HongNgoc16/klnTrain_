const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const GheChang = sequelize.define('GheChang', {
  id_ghe_chang:      { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_ghe_chuyen:     { type: DataTypes.INTEGER, allowNull: false },
  thu_tu_tu:         { type: DataTypes.INTEGER, allowNull: false },
  thu_tu_den:        { type: DataTypes.INTEGER, allowNull: false },
  trang_thai:        { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'dang_giu' },
  id_ve:             { type: DataTypes.INTEGER },
  session_id:        { type: DataTypes.STRING(100) },
  thoi_gian_het_han: { type: DataTypes.DATE },
}, { tableName: 'GheChang', timestamps: false })

module.exports = GheChang
