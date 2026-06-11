const sql = require('mssql');

// Dùng chung cấu hình kết nối SQL Server với main backend (xem src/config/database.js)
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER.split('\\')[0],
  port: parseInt(process.env.DB_PORT) || 1433,
  database: process.env.DB_NAME,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
    ...(process.env.DB_SERVER.includes('\\') && {
      instanceName: process.env.DB_SERVER.split('\\')[1]
    })
  }
};

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

pool.on('error', err => {
  console.error('❌ [admin] Database error:', err.message);
});

async function testConnection() {
  try {
    await poolConnect;
    console.log('✅ [admin] Kết nối SQL Server thành công!');
    console.log(`📊 [admin] Database: ${config.database}`);
    console.log(`🖥️ [admin] Server: ${config.server}`);
    return true;
  } catch (err) {
    console.error('❌ [admin] Kết nối SQL Server thất bại:', err.message);
    return false;
  }
}

async function executeQuery(query, params = {}) {
  try {
    await poolConnect;
    const request = pool.request();

    Object.keys(params).forEach(key => {
      const value = params[key];
      if (value === undefined || value === null) {
        request.input(key, sql.NVarChar, null);
      } else if (typeof value === 'number') {
        request.input(key, sql.Int, value);
      } else if (value instanceof Date) {
        request.input(key, sql.DateTime, value);
      } else {
        request.input(key, sql.NVarChar, value);
      }
    });

    const result = await request.query(query);
    return result;
  } catch (err) {
    console.error('❌ [admin] Lỗi query:', err.message);
    throw err;
  }
}

module.exports = {
  sql,
  executeQuery,
  testConnection,
  pool
};
