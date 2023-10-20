import { DataSource } from "typeorm";
import { Product } from "./entity/product";
import { config } from "dotenv";

config();

export const AppDataSource = new DataSource({
  type: "mongodb",
  url: process.env.DB_URL,
  useNewUrlParser: true,
  entities: [
    Product,
  ],
  logging: false,
  synchronize: true
});