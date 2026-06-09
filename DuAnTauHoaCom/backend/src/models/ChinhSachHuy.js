const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const ChinhSachHuy = sequelize.define('ChinhSachHuy', {
  id_cs_huy:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  gio_truoc_gio_chay:  { type: DataTypes.INTEGER, allowNull: false },
  phi_huy:             { type: DataTypes.DECIMAL(5, 2), allowNull: false },
}, { tableName: 'ChinhSachHuy', timestamps: false })

module.exports = ChinhSachHuy
