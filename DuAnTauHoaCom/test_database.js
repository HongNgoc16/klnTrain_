const sql = require('mssql')

const config = {
    user: 'TRONGLINH',
    password: '18082005Linhn',
    server: 'DESKTOP-5DF60PC\\SQLEXPRESS',
    database: 'KLNTrain',
    options: {
        trustServerCertificate: true,
        encrypt: false,
        instanceName: 'SQLEXPRESS'
    }
}

sql.connect(config)
    .then(() => console.log('OK'))
    .catch(err => console.log(err))