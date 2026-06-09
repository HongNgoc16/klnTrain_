const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const GheChuyen = sequelize.define('GheChuyen', {
  id_ghe_chuyen:    { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_chuyen:        { type: DataTypes.INTEGER, allowNull: false },
  so_toa_thu_tu:    { type: DataTypes.INTEGER, allowNull: false },
  so_ghe_trong_toa: { type: DataTypes.INTEGER, allowNull: false },
  id_loai_ghe:      { type: DataTypes.INTEGER, allowNull: false },
}, { tableName: 'GheChuyen', timestamps: false })

module.exports = GheChuyen
