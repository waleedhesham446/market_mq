"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var cors = require("cors");
var amqp = require("amqplib/callback_api");
var axios_1 = require("axios");
var db_config_1 = require("./db_config");
var product_1 = require("./entity/product");
db_config_1.AppDataSource.initialize().then(function (db) {
    console.log("Data Source has been initialized!");
    var productRepository = db.getRepository(product_1.Product);
    amqp.connect('amqps://lnsencye:TVsyNt9AHUfZckP1US-Brz14f_IGa9mI@jackal.rmq.cloudamqp.com/lnsencye', function (error0, connection) {
        if (error0)
            throw error0;
        connection.createChannel(function (error1, channel) {
            if (error1)
                throw error1;
            channel.assertQueue('product_created', { durable: false });
            channel.assertQueue('product_updated', { durable: false });
            channel.assertQueue('product_deleted', { durable: false });
            var app = express();
            app.use(cors({
                origin: ["http://localhost:300", "http://localhost:8080", "http://localhost:4200"]
            }));
            app.use(express.json());
            channel.consume('product_created', function (message) { return __awaiter(void 0, void 0, void 0, function () {
                var eventProduct, product;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            eventProduct = JSON.parse(message.content.toString());
                            product = new product_1.Product();
                            product.admin_id = eventProduct.id;
                            product.title = eventProduct.title;
                            product.image = eventProduct.image;
                            product.likes = eventProduct.likes;
                            return [4 /*yield*/, productRepository.save(product)];
                        case 1:
                            _a.sent();
                            console.log("".concat(product.id, " product created"));
                            return [2 /*return*/];
                    }
                });
            }); }, { noAck: true });
            channel.consume('product_updated', function (message) { return __awaiter(void 0, void 0, void 0, function () {
                var eventProduct, product;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            eventProduct = JSON.parse(message.content.toString());
                            return [4 /*yield*/, productRepository.findOneBy({ admin_id: eventProduct.id })];
                        case 1:
                            product = _a.sent();
                            productRepository.merge(product, {
                                title: eventProduct.title,
                                image: eventProduct.image,
                                likes: eventProduct.likes,
                            });
                            return [4 /*yield*/, productRepository.save(product)];
                        case 2:
                            _a.sent();
                            console.log("".concat(product.id, " product updated"));
                            return [2 /*return*/];
                    }
                });
            }); }, { noAck: true });
            channel.consume('product_deleted', function (message) { return __awaiter(void 0, void 0, void 0, function () {
                var admin_id;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            admin_id = Number(message.content.toString());
                            return [4 /*yield*/, productRepository.delete({ admin_id: admin_id })];
                        case 1:
                            _a.sent();
                            console.log("".concat(admin_id, " product deleted"));
                            return [2 /*return*/];
                    }
                });
            }); }, { noAck: true });
            app.get("/api/products", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                var products;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, productRepository.find()];
                        case 1:
                            products = _a.sent();
                            res.json(products);
                            return [2 /*return*/];
                    }
                });
            }); });
            app.post("/api/products/:admin_id/like", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                var product, result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, productRepository.findOneBy({ admin_id: Number(req.params.admin_id) })];
                        case 1:
                            product = _a.sent();
                            axios_1.default.post("http://localhost:8000/api/products/".concat(product.admin_id, "/like"), {});
                            product.likes++;
                            return [4 /*yield*/, productRepository.save(product)];
                        case 2:
                            result = _a.sent();
                            res.send(result);
                            return [2 /*return*/];
                    }
                });
            }); });
            var PORT = 8001;
            app.listen(PORT, function () { return console.log("Listening on port ".concat(PORT)); });
            process.on('beforeExit', function () {
                console.log("Connection closed");
                connection.close();
            });
        });
    });
}).catch(function (err) {
    console.error("Error during Data Source initialization", err);
});
