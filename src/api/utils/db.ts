import sql from "mssql";

export const getDb = async () => {
  const connectionString = process.env.DB_CONNECTION ?? "";

  const config: sql.config = {
    user: process.env.DB_USER ?? "",
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_NAME ?? "",
    server: process.env.DB_SERVER ?? "",
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
    connectionTimeout: 30000,
    options: {
      encrypt: true,
      connectTimeout: 30000,
      trustServerCertificate: true,
      //(process.env.NODE_ENV ?? "").toLowerCase() != "production",
    },
  };

  return await sql.connect(config);
};
