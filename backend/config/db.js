import sql from "mssql";

const config = {
  user: "sa",
  password: "1234",
  server: "localhost",
  database: "RecruitmentManagement",
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

export async function connect() {
  try {
    let pool = await sql.connect(config);
    console.log("SQL Server Connected!");
    return pool;
  } catch (err) {
    console.error("Database connection failed:", err);
  }
}

export { sql };
