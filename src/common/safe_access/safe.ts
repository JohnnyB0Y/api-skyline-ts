//  safe-access.ts
//
//
//  Created by JohnnyB0Y on 2021/03/21.
//  Copyright © 2021 JohnnyB0Y. All rights reserved.


function safeNumber(num: number, placeholder = 0): number {
  return safeValue(num, placeholder, val => {
    return typeof val == 'number';
  });
}

function safeString(str: string, placeholder = ''): string {
  return safeValue(str, placeholder, val => {
    return typeof val == 'string';
  });
}

function safeBoolean(bool: boolean, placeholder = false): boolean {
  return safeValue(bool, placeholder, val => {
    return typeof val == 'boolean';
  });
}

function safeValue(val: any, placeholder: any, condition: (val: any) => boolean) {
  return condition(val) ? val : placeholder;
}

function safeStringEqual(val1: string, val2: string): boolean {
  if (typeof val1 != 'string' || typeof val2 != 'string') {
    return false;
  }
  return val1 === val2
}

function safeNumberEqual(val1: number, val2: number): boolean {
  if (typeof val1 != 'number' || typeof val2 != 'number') {
    return false;
  }
  return val1 === val2
}

export const Safe = {
  number: safeNumber,
  string: safeString,
  boolean: safeBoolean,
  condition: safeValue,
  numberEqual: safeNumberEqual,
  stringEqual: safeStringEqual,
}
