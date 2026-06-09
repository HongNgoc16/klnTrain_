const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const CauHinhGhe = sequelize.define('CauHinhGhe', {
  id_cau_hinh_ghe:   { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_loai_toa:       { type: DataTypes.INTEGER, allowNull: false },
  so_ghe_trong_toa:  { type: DataTypes.INTEGER, allowNull: false },
  id_loai_ghe:       { type: DataTypes.INTEGER, allowNull: false },
  vi_tri:            { type: DataTypes.STRING(100) },
  tang:              { type: DataTypes.STRING(10) },
  khoang_so:         { type: DataTypes.INTEGER },
  ben:               { type: DataTypes.STRING(10) },
}, { tableName: 'CauHinhGhe', timestamps: false })

module.exports = CauHinhGhe
