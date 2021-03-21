//  http-exception.ts
//
//
//  Created by JohnnyB0Y on 2021/03/21.
//  Copyright © 2021 JohnnyB0Y. All rights reserved.


export default class HttpException extends Error {
  statusCode?: number;
  status?: number;
  message: string;
  error: string | null;

  constructor(statusCode: number, message: string, error?: string) {
    super(message);

    this.statusCode = statusCode;
    this.message = message;
    this.error = error || null;
  }
}

