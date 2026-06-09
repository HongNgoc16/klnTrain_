const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const HanhKhach = sequelize.define('HanhKhach', {
  id_hanh_khach:   { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_tai_khoan:    { type: DataTypes.INTEGER },
  ho_ten:          { type: DataTypes.STRING(150), allowNull: false },
  ngay_sinh:       { type: DataTypes.DATEONLY, allowNull: false },
  cccd:            { type: DataTypes.STRING(20) },
  loai_hanh_khach: { type: DataTypes.STRING(20), allowNull: false }, // nguoi_lon | tre_em | nguoi_cao_tuoi
  so_dien_thoai:   { type: DataTypes.STRING(15) },
  la_chinh:        { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
}, { tableName: 'HanhKhach', timestamps: false })

module.exports = HanhKhach
