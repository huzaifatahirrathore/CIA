import "dotenv/config";
import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { Inventory } from "./entity/Inventory";
import { RefreshToken } from "./entity/RefreshToken";
import { CreateAdminUser1572547308077 } from "./migration/1572547308077-CreateAdminUser";

const isProduction = process.env.NODE_ENV === "production";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "dev_db",
  synchronize: !isProduction,
  logging: false,
  migrationsRun: true,
  entities: [User, Inventory, RefreshToken],
  migrations: [CreateAdminUser1572547308077],
  subscribers: [],
});
