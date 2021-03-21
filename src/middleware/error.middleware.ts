//  error.middleware.ts
//
//
//  Created by JohnnyB0Y on 2021/03/21.
//  Copyright © 2021 JohnnyB0Y. All rights reserved.

import HttpException from "../common/exception/http";
import { Request, Response, NextFunction, response } from "express";

export const errorHandler = (
  error: HttpException,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = error.statusCode || error.status || 500;

  response.status(status).send(error);
}
