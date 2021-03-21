//  safe-access.ts
//
//
//  Created by JohnnyB0Y on 2021/03/21.
//  Copyright © 2021 JohnnyB0Y. All rights reserved.


function safeNumber(num: number, placeholder: any): any {
  return safeValue(num, placeholder, val => {
    return typeof val == 'number';
  });
}

function safeString(str: string, placeholder: any): any {
  return safeValue(str, placeholder, val => {
    return typeof val == 'string';
  });
}

function safeBoolean(bool: boolean, placeholder: any): any {
  return safeValue(bool, placeholder, val => {
    return typeof val == 'boolean';
  });
}

function safeValue(val: any, placeholder: any, condition: (val: any) => boolean) {
  return condition(val) ? val : placeholder;
}

export const Safe = {
  number: safeNumber,
  string: safeString,
  boolean: safeBoolean,
  condition: safeValue,
}
