"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../.env") });
const config = {
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
exports.default = config;
