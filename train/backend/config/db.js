const sql = require('mssql');

const config = {
  user: 'sa',  // tên user SQL
  password: '12345678',  // mật khẩu
  server: 'NGOCKHUE_10',
  database: 'Train',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

pool.on('error', err => {
  console.error('❌ Database error:', err.message);
});

async function testConnection() {
  try {
    await poolConnect;
    console.log('✅ Kết nối SQL Server thành công!');
    console.log(`📊 Database: ${config.database}`);
    console.log(`🖥️ Server: ${config.server}`);
    return true;
  } catch (err) {
    console.error('❌ Kết nối SQL Server thất bại:', err.message);
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
    console.error('❌ Lỗi query:', err.message);
    throw err;
  }
}

module.exports = {
  sql,
  executeQuery,
  testConnection,
  pool
};