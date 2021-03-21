//  not-found.middleware.ts
//
//
//  Created by JohnnyB0Y on 2021/03/21.
//  Copyright © 2021 JohnnyB0Y. All rights reserved.

import { Request, Response, NextFunction } from "express";

export const notFoundHandler = (
  request: Request,
  response: Response,
  next: NextFunction
) => {

  const message = "Resource not found";

  response.status(404).send(message);
};
