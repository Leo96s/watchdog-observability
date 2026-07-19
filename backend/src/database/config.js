require("dotenv").config();

const isProduction = process.env.NODE_ENV === "production";

const base = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: "postgres",
  dialectOptions: isProduction
    ? { ssl: { require: true, rejectUnauthorized: false } }
    : {},
};

// Used by sequelize-cli only; the app's runtime connection lives in
// src/database/index.js.
module.exports = {
  development: base,
  test: base,
  production: base,
};
