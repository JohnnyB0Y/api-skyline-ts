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
import { Safe } from "./common/safe_access/safe";
import { RedisClient } from "redis"

export const heartbeatReq = 'ping';
export const heartbeatRes = 'pong';

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

  const client = new RedisClient({url: 'redis://:@localhost:6379/0'})
  client.on("error", err => {
    console.log('redis error:', err);
  })

  client.set("key", "value", err => {
    console.log(err)
  });
  client.get("key", val => {
    console.log(val)
  });

  /**
   * Server Activation
   */

  app.listen(PORT, () => {
    console.log(`Listening on prot ${PORT}, pid ${process.pid}`);

    // setTimeout(() => {
    //   // 模拟抛异常和阻塞
    //   // 模拟并发 siege -c 200 -t 10s http://localhost:7000/api/menu/items
    //   if (process.pid % 2 === 0) {
    //     throw new Error('Ooops!!!!!!!!');
    //   }
    //   else {
    //     while(true) {
    //     }
    //   }

    // }, Math.ceil(Math.random() * 3) * 3000);

  });

  // 未知异常处理
  process.on('uncaughtException', err => {
    console.log(`Process uncaughtException ${err}.`);
    process.exit(1);
  });

  // 内存泄漏监控
  setInterval(() => {
    if ( process.memoryUsage().rss > 800 * 1024 * 1024 ) {
      // 内存大于 800M，为内存泄漏
      console.log(`Memory leak.`);
      process.exit(1);
    }
  }, 10000);

  process.on('message', (msg) => {
    // 💓 心跳检测
    if (Safe.stringEqual(msg, heartbeatReq)) {
      // console.log(msg, process.pid);
      process.send?.(heartbeatRes);
    }
  });

}
