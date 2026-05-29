const { executeQuery, testConnection } = require('./config/db');

async function test() {
  console.log('Testing database connection...');
  const connected = await testConnection();
  
  if (!connected) {
    console.log('❌ Database connection failed');
    return;
  }
  
  console.log('✅ Database connected');
  
  try {
    const result = await executeQuery('SELECT TOP 5 * FROM TaiKhoan');
    console.log('📊 Users in database:', result.recordset);
  } catch (error) {
    console.error('❌ Query error:', error.message);
  }
}

test();
