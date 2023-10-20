import { DataSource } from "typeorm";
import { Product } from "./entity/product";
import { config } from "dotenv";

config();

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [
    Product,
  ],
  logging: false,
  synchronize: true
});