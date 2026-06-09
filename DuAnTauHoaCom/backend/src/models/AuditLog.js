const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const AuditLog = sequelize.define('AuditLog', {
  id_log:        { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  bang:          { type: DataTypes.STRING(100), allowNull: false },
  ma_ban_ghi:    { type: DataTypes.STRING(100), allowNull: false },
  hanh_dong:     { type: DataTypes.STRING(15), allowNull: false }, // INSERT | UPDATE | DELETE
  gia_tri_cu:    { type: DataTypes.TEXT },
  gia_tri_moi:   { type: DataTypes.TEXT },
  id_tai_khoan:  { type: DataTypes.INTEGER },
  ip_address:    { type: DataTypes.STRING(45) },
  user_agent:    { type: DataTypes.STRING(500) },
  thoi_gian:     { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, { tableName: 'AuditLog', timestamps: false })

module.exports = AuditLog
