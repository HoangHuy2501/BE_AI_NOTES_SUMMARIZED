require('dotenv').config(); // nạp biến môi trường
const { Pool } = require('pg');

const Summarized = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // ⚠️ Bắt buộc với Render (nếu không sẽ lỗi SSL)
  }
  // ssl:false
});

module.exports = Summarized;