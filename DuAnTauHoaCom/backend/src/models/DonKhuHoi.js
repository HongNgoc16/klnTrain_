const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const DonKhuHoi = sequelize.define('DonKhuHoi', {
  id_don_di: { type: DataTypes.INTEGER, primaryKey: true },
  id_don_ve: { type: DataTypes.INTEGER, primaryKey: true },
}, { tableName: 'DonKhuHoi', timestamps: false })

module.exports = DonKhuHoi
