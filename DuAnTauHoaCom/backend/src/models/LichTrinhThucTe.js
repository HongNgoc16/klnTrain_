const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const LichTrinhThucTe = sequelize.define('LichTrinhThucTe', {
  id_lt_thuc_te:   { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_chuyen:       { type: DataTypes.INTEGER, allowNull: false },
  id_ga:           { type: DataTypes.INTEGER, allowNull: false },
  thu_tu_dung:     { type: DataTypes.INTEGER, allowNull: false },
  gio_den_du_kien: { type: DataTypes.TIME },
  gio_di_du_kien:  { type: DataTypes.TIME },
  gio_den_thuc_te: { type: DataTypes.DATE },
  gio_di_thuc_te:  { type: DataTypes.DATE },
  delay_den_phut:  { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  delay_di_phut:   { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  trang_thai:      { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'chua_toi' },
  ghi_chu:         { type: DataTypes.STRING(500) },
}, { tableName: 'LichTrinhThucTe', timestamps: false })

module.exports = LichTrinhThucTe
