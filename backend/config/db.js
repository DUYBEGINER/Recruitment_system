import sql from "mssql";
import 'dotenv/config.js'; 

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};


async function connect() {
  try {
    let pool = await sql.connect(config);
    console.log("SQL Server Connected!");
    return pool;
  } catch (err) {
    console.error("Database connection failed:", err);
  }
}

export { sql, connect };
