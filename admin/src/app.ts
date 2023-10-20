import * as express from "express";
import { Request, Response } from "express";
import * as cors from "cors";
import { DataSource } from "typeorm";
import * as amqp from "amqplib/callback_api";

import { AppDataSource } from "./db_config";
import { Product } from "./entity/product";


AppDataSource.initialize().then((db: DataSource) => {
  console.log("Data Source has been initialized!");
  const productRepository = db.getRepository(Product);

  amqp.connect('amqps://lnsencye:TVsyNt9AHUfZckP1US-Brz14f_IGa9mI@jackal.rmq.cloudamqp.com/lnsencye', (error0: any, connection: amqp.Connection) => {
    if (error0) throw error0;
    
    connection.createChannel((error1, channel) => {
      if (error1) throw error1;

      const app = express();
  
      app.use(cors({
        origin: ["http://localhost:300", "http://localhost:8080", "http://localhost:4200"]
      }));
      
      app.use(express.json());

      app.get("/api/products", async (req: Request, res: Response) => {
        const products = await productRepository.find();
        res.json(products);
      });

      app.post("/api/products", async (req: Request, res: Response) => {
        const product = productRepository.create(req.body);
        const result = await productRepository.save(product);
        channel.sendToQueue('product_created', Buffer.from(JSON.stringify(result)));
        res.send(result);
      });

      app.get("/api/products/:id", async (req: Request, res: Response) => {
        const product = await productRepository.findOneBy({ id: Number(req.params.id) });
        res.send(product);
      });
      
      app.put("/api/products/:id", async (req: Request, res: Response) => {
        const product = await productRepository.findOneBy({ id: Number(req.params.id) });
        productRepository.merge(product, req.body);
        const result = await productRepository.save(product);
        channel.sendToQueue('product_updated', Buffer.from(JSON.stringify(result)));
        res.send(result);
      });

      app.delete("/api/products/:id", async (req: Request, res: Response) => {
        const result = await productRepository.delete({ id: Number(req.params.id) });
        channel.sendToQueue('product_deleted', Buffer.from(req.params.id));
        res.send(result);
      });

      app.post("/api/products/:id/like", async (req: Request, res: Response) => {
        const product = await productRepository.findOneBy({ id: Number(req.params.id) });
        product.likes++;
        const result = await productRepository.save(product);
        res.send(result);
      });

      const PORT = 8000;
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
