const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const ChinhSachGia = sequelize.define('ChinhSachGia', {
  id_chinh_sach:    { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  ten_chinh_sach:   { type: DataTypes.STRING(150), allowNull: false },
  loai_hanh_khach:  { type: DataTypes.STRING(25), allowNull: false },
  phan_tram_giam:   { type: DataTypes.DECIMAL(5, 2), allowNull: false },
  tu_ngay:          { type: DataTypes.DATEONLY },
  den_ngay:         { type: DataTypes.DATEONLY },
}, { tableName: 'ChinhSachGia', timestamps: false })

module.exports = ChinhSachGia
