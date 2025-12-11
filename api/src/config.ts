import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

export const config = {
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
  BDD: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    bdname: process.env.DB_NAME,
  },
};

export default config;
