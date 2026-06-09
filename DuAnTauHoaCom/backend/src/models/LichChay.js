const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const LichChay = sequelize.define('LichChay', {
  id_lich_chay:     { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_tau:           { type: DataTypes.INTEGER, allowNull: false },
  id_ga_di:         { type: DataTypes.INTEGER, allowNull: false },
  id_ga_den:        { type: DataTypes.INTEGER, allowNull: false },
  gio_khoi_hanh:    { type: DataTypes.TIME, allowNull: false },
  gio_du_kien_den:  { type: DataTypes.TIME, allowNull: false },
  thu_trong_tuan:   { type: DataTypes.STRING(50) },
}, { tableName: 'LichChay', timestamps: false })

module.exports = LichChay
