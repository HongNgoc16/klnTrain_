const { Sequelize } = require('sequelize')

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_SERVER.split('\\')[0], // Chỉ lấy tên máy
    port: parseInt(process.env.DB_PORT) || 1433,
    dialect: 'mssql',
    dialectOptions: {
      options: {
        encrypt: false,
        trustServerCertificate: true,
        requestTimeout: 60000,
        trustedTimeout: false,
     //   instanceName: process.env.DB_SERVER.split('\\')[1] || 'MSSQLEXPRESS', // Quan trọng: thêm dòng này
      ...(process.env.DB_SERVER.includes('\\') && {
          instanceName: process.env.DB_SERVER.split('\\')[1]
        })      },
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
)

const connectDB = async () => {
  await sequelize.authenticate()
  console.log('Kết nối SQL Server thành công.')
}

module.exports = { sequelize, connectDB }