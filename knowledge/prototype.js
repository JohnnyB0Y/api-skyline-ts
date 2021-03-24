//  prototype.js
//
//
//  Created by JohnnyB0Y on 2021/03/24.
//  Copyright © 2021 JohnnyB0Y. All rights reserved.

// https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Inheritance_and_the_prototype_chain


/**
 * 继承与原型链
 * 对于使用过基于类的语言 (如 Java 或 C++)，JavaScript 有点令人困惑，因为它是动态的，并且本身不提供一个 class 实现。
 *（在 ES2015/ES6 中引入了 class 关键字，但那只是语法糖，JavaScript 仍然是基于原型的）。
 * 当谈到继承时，JavaScript 只有一种结构：对象。
 * 每个实例对象（ object ）都有一个私有属性（称之为 __proto__ ）指向它的构造函数的原型对象（prototype）。
 * 该原型对象也有一个自己的原型对象( __proto__ ) ，层层向上直到一个对象的原型对象为 null。
 * 根据定义，null 没有原型，并作为这个原型链中的最后一个环节。
 */

// 原型 与 原型链

function Foo() {
  this.firstName = 'Bryand'
  this.lastName = 'Kobe'
  this.age = 24
  this.fullname = function() {
    return this.lastName + ' ' + this.firstName
  }
}

// new 关键字创建对象
const foo = new Foo()
console.log(foo.fullname())

// 近似于
const foo = new Object()
foo.__proto__ = Foo.prototype
Foo.call(foo)

console.log(foo.fullname())

/**
 * 总结：
 * 1, 当对 构造函数执行 new 语句时：
 * - 解析器会先创建一个基于 Object 原型的 对象实例 foo；
 * - 然后把 对象实例 foo 的原型属性（__proto__）指向构造函数 Foo 的 原型属性(prototype)；
 * - 最后调用函数 Foo.call(foo)，我们知道call的第一个参数是this，所以foo被作为Foo函数的this使用；
 * - 也就是说函数体内执行 的this赋值就是 foo 在添加属性并赋值；（相当于复制了Foo的属性和方法）
 * 
 * 2, 当对 foo 的属性赋值时：
 * - 如果属性是复制过来的，就直接赋值数据；
 * - 如果属性是继承过来的（在原型链上），那么先把原型上的属性添加到对象实例，然后赋值数据。
 * - 如果属性在对象中找不到，同时也在原型链上找不到，那么就添加新属性到对象实例，然后赋值数据。
 * 
 * 3, 当对 foo 的属性进行读取时：
 * - 查找对象自身的属性，如果有就返回；
 * - 如果没有就在对象的 __proto__（原型属性）上查找，如果找到就返回；
 * - 如果没有就继续沿着原型属性指向的原型属性查找（沿着原型链查找）；
 * - 如果最终原型属性指向为 null 还没找到，就结束查找，返回 undefined。
 * 
 * 4, 在原型上定义属性
 * - Foo.prototype.middleName = 'middleName'; // 新增了属性
 * - Foo.prototype.firstName = 'firstName'; // 覆盖了旧属性
 */






// ---------------------- ----------------------- ------------------------
// 下面摘抄自文档，备忘
// ---------------------- ----------------------- ------------------------
// 使用语法结构创建的对象 --------------------

var o = {a: 1};

// o 这个对象继承了 Object.prototype 上面的所有属性
// o 自身没有名为 hasOwnProperty 的属性
// hasOwnProperty 是 Object.prototype 的属性
// 因此 o 继承了 Object.prototype 的 hasOwnProperty
// Object.prototype 的原型为 null
// 原型链如下:
// o ---> Object.prototype ---> null

var a = ["yo", "whadup", "?"];

// 数组都继承于 Array.prototype
// (Array.prototype 中包含 indexOf, forEach 等方法)
// 原型链如下:
// a ---> Array.prototype ---> Object.prototype ---> null

function f(){
  return 2;
}

// 函数都继承于 Function.prototype
// (Function.prototype 中包含 call, bind等方法)
// 原型链如下:
// f ---> Function.prototype ---> Object.prototype ---> null


// 使用构造器创建的对象 ------------------------
// 在 JavaScript 中，构造器其实就是一个普通的函数。
// 当使用 new 操作符 来作用这个函数时，它就可以被称为构造方法（构造函数）。
function Graph() {
  this.vertices = [];
  this.edges = [];
}

Graph.prototype = {
  addVertex: function(v){
    this.vertices.push(v);
  }
};

var g = new Graph();
// g 是生成的对象，他的自身属性有 'vertices' 和 'edges'。
// 在 g 被实例化时，g.[[Prototype]] 指向了 Graph.prototype。


// 使用 Object.create 创建的对象 ------------------------
// ECMAScript 5 中引入了一个新方法：Object.create()。
// 可以调用这个方法来创建一个新对象。新对象的原型就是调用 create 方法时传入的第一个参数：

var a = {a: 1};
// a ---> Object.prototype ---> null

var b = Object.create(a);
// b ---> a ---> Object.prototype ---> null
console.log(b.a); // 1 (继承而来)

var c = Object.create(b);
// c ---> b ---> a ---> Object.prototype ---> null

var d = Object.create(null);
// d ---> null
console.log(d.hasOwnProperty); // undefined, 因为d没有继承Object.prototype


// 使用 Object.create 创建的对象 -----------------------------------------
// ECMAScript 5 中引入了一个新方法：Object.create()。
// 可以调用这个方法来创建一个新对象。新对象的原型就是调用 create 方法时传入的第一个参数：

var a = {a: 1};
// a ---> Object.prototype ---> null

var b = Object.create(a);
// b ---> a ---> Object.prototype ---> null
console.log(b.a); // 1 (继承而来)

var c = Object.create(b);
// c ---> b ---> a ---> Object.prototype ---> null

var d = Object.create(null);
// d ---> null
console.log(d.hasOwnProperty); // undefined, 因为d没有继承Object.prototype


// 使用 class 关键字创建的对象 -----------------------------------------------------
// ECMAScript6 引入了一套新的关键字用来实现 class。使用基于类语言的开发人员会对这些结构感到熟悉，但它们是不同的。
// JavaScript 仍然基于原型。这些新的关键字包括 class, constructor，static，extends 和 super。

"use strict";

class Polygon {
  constructor(height, width) {
    this.height = height;
    this.width = width;
  }
}

class Square extends Polygon {
  constructor(sideLength) {
    super(sideLength, sideLength);
  }
  get area() {
    return this.height * this.width;
  }
  set sideLength(newLength) {
    this.height = newLength;
    this.width = newLength;
  }
}

var square = new Square(2);
