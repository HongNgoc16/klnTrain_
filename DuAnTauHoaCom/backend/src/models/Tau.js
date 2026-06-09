const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const Tau = sequelize.define('Tau', {
  id_tau:    { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  so_hieu:   { type: DataTypes.STRING(20), allowNull: false },
  ten_tau:   { type: DataTypes.STRING(100) },
  so_toa:    { type: DataTypes.INTEGER, allowNull: false },
  trang_thai:{ type: DataTypes.STRING(20), allowNull: false, defaultValue: 'hoat_dong' },
}, { tableName: 'Tau', timestamps: false })

module.exports = Tau
