const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "cloud_notes",
    port: 3306,
    ssl: process.env.DB_HOST ? { rejectUnauthorized: false } : null // Enforces SSL only when deploying to Azure
});

module.exports = connection.promise();