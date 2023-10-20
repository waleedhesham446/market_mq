import * as express from "express";
import { Request, Response } from "express";
import * as cors from "cors";
import { DataSource } from "typeorm";
import * as amqp from "amqplib/callback_api";
import axios from "axios";

import { AppDataSource } from "./db_config";
import { Product } from "./entity/product";

AppDataSource.initialize().then((db: DataSource) => {
  console.log("Data Source has been initialized!");
  const productRepository = db.getRepository(Product);
  
  amqp.connect('amqps://lnsencye:TVsyNt9AHUfZckP1US-Brz14f_IGa9mI@jackal.rmq.cloudamqp.com/lnsencye', (error0: any, connection: amqp.Connection) => {
    if (error0) throw error0;
    
    connection.createChannel((error1, channel) => {
      if (error1) throw error1;

      channel.assertQueue('product_created', { durable: false });
      channel.assertQueue('product_updated', { durable: false });
      channel.assertQueue('product_deleted', { durable: false });

      const app = express();
      
      app.use(cors({
        origin: ["http://localhost:300", "http://localhost:8080", "http://localhost:4200"]
      }));
      
      app.use(express.json());

      channel.consume('product_created', async (message: amqp.Message) => {
        const eventProduct = JSON.parse(message.content.toString());
        const product = new Product();
        product.admin_id = eventProduct.id;
        product.title = eventProduct.title;
        product.image = eventProduct.image;
        product.likes = eventProduct.likes;
        await productRepository.save(product);
        console.log(`${product.id} product created`);
      }, { noAck: true });

      channel.consume('product_updated', async (message: amqp.Message) => {
        const eventProduct = JSON.parse(message.content.toString());
        const product = await productRepository.findOneBy({ admin_id: eventProduct.id });
        productRepository.merge(product, {
          title: eventProduct.title,
          image: eventProduct.image,
          likes: eventProduct.likes,
        })
        await productRepository.save(product);
        console.log(`${product.id} product updated`);
      }, { noAck: true });

      channel.consume('product_deleted', async (message: amqp.Message) => {
        const admin_id = Number(message.content.toString());
        await productRepository.delete({ admin_id });
        console.log(`${admin_id} product deleted`);
      }, { noAck: true });

      app.get("/api/products", async (req: Request, res: Response) => {
        const products = await productRepository.find();
        res.json(products);
      });

      app.post("/api/products/:admin_id/like", async (req: Request, res: Response) => {
        const product = await productRepository.findOneBy({ admin_id: Number(req.params.admin_id) });
        axios.post(`http://localhost:8000/api/products/${product.admin_id}/like`, {});
        product.likes++;
        const result = await productRepository.save(product);
        res.send(result);
      });
    
      const PORT = 8001;
      app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

      process.on('beforeExit', () => {
        console.log("Connection closed");
        connection.close();
      });
    });
  });
}).catch((err) => {
  console.error("Error during Data Source initialization", err);
});
