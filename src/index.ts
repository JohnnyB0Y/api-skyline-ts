//  index.ts
//
//
//  Created by JohnnyB0Y on 2021/03/21.
//  Copyright © 2021 JohnnyB0Y. All rights reserved.


/**
 * Required External Modules
 */

import * as dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { itemsRouter } from "./items/items.router";
import { errorHandler } from "./middleware/error.middleware";
import { notFoundHandler } from "./middleware/not-found.middleware";

export function startHttpServer() {

  dotenv.config();

  /**
   * App Variables
   */

  if (!process.env.PORT) {
    process.exit(1);
  }

  const PORT: number = parseInt(process.env.PORT as string, 10);

  const app = express();

  /**
   *  App Configuration
   */

  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use("/api/menu/items", itemsRouter);

  app.use(errorHandler);
  app.use(notFoundHandler);

  /**
   * Server Activation
   */

   process.on('uncaughtException', err => {
    console.log(`process uncaughtException ${err}`);

    setTimeout(() => {
      // 500毫秒后，退出进程
      process.exit();
    }, 500);
  });

  app.listen(PORT, () => {
    console.log(`Listening on prot ${PORT}, pid ${process.pid}`);

    setTimeout(() => {
      // 模拟抛异常
      // throw new Error('Ooops!!!!!!!!');
    }, Math.ceil(Math.random() * 3) * 1000);
  });
}
