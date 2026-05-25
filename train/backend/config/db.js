const sql = require('mssql');

const dbConfig = {
   user: 'sa',
   password: '12345678',
   server: 'NGOCKHUE_10',
   database: 'Dat_ve_tau',
   options: {
     encrypt: false,
     trustServerCertificate: true
   }
 };

const pool = new sql.ConnectionPool(dbConfig);
const poolConnect = pool.connect();

pool.on('error', err => {
  console.error('Lỗi database:', err.message);
});

async function testConnection() {
  try {
    await poolConnect;
    console.log('Kết nối SQL Server thành công!');
    console.log(`Database: ${dbConfig.database}`);
    console.log(`Server: ${dbConfig.server}`);
    return true;
  } catch (err) {
    console.error('Kết nối SQL Server thất bại:', err.message);
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
      } else {
        request.input(key, sql.NVarChar, value);
      }
    });
    
    const result = await request.query(query);
    return result;
  } catch (err) {
    console.error('Lỗi query:', err.message);
    throw err;
  }
}

module.exports = {
  sql,
  executeQuery,
  testConnection,
  pool
};