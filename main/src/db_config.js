"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
var typeorm_1 = require("typeorm");
var product_1 = require("./entity/product");
var dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
exports.AppDataSource = new typeorm_1.DataSource({
    type: "mongodb",
    url: process.env.DB_URL,
    useNewUrlParser: true,
    entities: [
        product_1.Product,
    ],
    logging: false,
    synchronize: true
});
