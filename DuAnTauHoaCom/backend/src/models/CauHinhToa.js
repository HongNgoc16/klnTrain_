const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const CauHinhToa = sequelize.define('CauHinhToa', {
  id_cau_hinh_toa: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_tau:          { type: DataTypes.INTEGER, allowNull: false },
  so_toa_thu_tu:   { type: DataTypes.INTEGER, allowNull: false },
  id_loai_toa:     { type: DataTypes.INTEGER, allowNull: false },
}, { tableName: 'CauHinhToa', timestamps: false })

module.exports = CauHinhToa
