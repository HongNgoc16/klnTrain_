const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const LoaiToa = sequelize.define('LoaiToa', {
  id_loai_toa:    { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  ma_loai_toa:    { type: DataTypes.STRING(20), allowNull: false },
  ten_loai_toa:   { type: DataTypes.STRING(100), allowNull: false },
  loai_ghe_chinh: { type: DataTypes.STRING(20), allowNull: false },
  so_cho_toi_da:  { type: DataTypes.INTEGER, allowNull: false },
}, { tableName: 'LoaiToa', timestamps: false })

module.exports = LoaiToa
