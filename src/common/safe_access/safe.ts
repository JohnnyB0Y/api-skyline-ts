//  safe-access.ts
//
//
//  Created by JohnnyB0Y on 2021/03/21.
//  Copyright © 2021 JohnnyB0Y. All rights reserved.

/**
 * 获取类型安全number数值
 * @param num 数值
 * @param placeholder 当num不是number类型，返回的占位数值
 * @returns 返回安全的number类型数值
 */
function safeNumber(num: number, placeholder = 0): number {
  return safeValue(num, placeholder, val => {
    return typeof val == 'number';
  });
}

/**
 * 获取类型安全string数值
 * @param str 数值
 * @param placeholder 当str不是string类型，返回的占位数值
 * @returns 返回安全的string类型数值
 */
function safeString(str: string, placeholder = ''): string {
  return safeValue(str, placeholder, val => {
    return typeof val == 'string';
  });
}

/**
 * 获取类型安全boolean数值
 * @param bool 数值
 * @param placeholder 当bool不是boolean类型，返回的占位数值
 * @returns 返回安全的boolean类型数值
 */
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

/**
 * 是函数直接调用，不是就直接返回当前值
 * @param propOrFunc 属性或函数
 * @returns 属性的值或函数的返回值
 */
function safeCall(propOrFunc: any): any {
  try {
    return propOrFunc()
  } catch (err) {
    return propOrFunc
  }
}

/**
 * 可选地调用函数或直接获取值，如果值为undefined或null，则继续遍历数组，直到获取到值为止。
 * @param propOrFuncList 属性或函数的数组
 * @param placeholder 最终未获得值，就会返回占位的值，默认返回 undefined
 * @returns 属性的值或函数的返回值
 */
function safeOptionalCall(propOrFuncList: any[], placeholder?: any): any {
  for (const propOrFunc of propOrFuncList) {
    const result = safeCall(propOrFunc)
    if (result !== undefined && result !== null) {
      return result
    }
  }
  return placeholder
}

/**
 * 获取对象的长度值，兼容字符串、数组、map、和自定义对象属性'__len__'
 * @param obj 对象
 * @returns 对象的长度值
 */
function safeLen(obj: any): number {
  return safeOptionalCall([obj.length, obj.size, obj.__len__], 0)
}

export const Safe = {
  number: safeNumber,
  string: safeString,
  boolean: safeBoolean,
  condition: safeValue,
  numberEqual: safeNumberEqual,
  stringEqual: safeStringEqual,
  len: safeLen,
  call: safeCall,
  optionalCall: safeOptionalCall,
}
