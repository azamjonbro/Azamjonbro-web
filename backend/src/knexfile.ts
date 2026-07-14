import type { Knex } from "knex";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const config: { [key: string]: Knex.Config } = {
  development: {
    client: process.env.DATABASE_URL?.startsWith("postgres") ? "pg" : "sqlite3",
    connection: process.env.DATABASE_URL?.startsWith("postgres")
      ? process.env.DATABASE_URL
      : { filename: process.env.SQLITE_DB_PATH || "./src/database/dev.sqlite3" },
    useNullAsDefault: true,
    migrations: {
      directory: "./src/database/migrations",
      tableName: "knex_migrations",
    },
    seeds: {
      directory: "./src/database/seeds",
    },
  },
  production: {
    client: "pg",
    connection: process.env.DATABASE_URL,
    pool: { min: 2, max: 10 },
    migrations: {
      directory: "./src/database/migrations",
      tableName: "knex_migrations",
    },
  }
};

export default config;
