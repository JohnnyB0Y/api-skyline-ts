//  prototype.js
//
//
//  Created by JohnnyB0Y on 2021/03/24.
//  Copyright © 2021 JohnnyB0Y. All rights reserved.

// https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Inheritance_and_the_prototype_chain

const printer = require('./tools').printer

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
let foo = new Foo()
console.log(foo.fullname())

// 近似于
foo = new Object()
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
 * 
 * 5，instanceof 操作符
 * - 检查操作符右边的函数原型是否存在于操作符左边的对象的原型链上。
 *  （每个对象都有 [[prototype]]原型属性，它指向原型对象，而原型对象上有 constructor属性，指向构造函数本身。）
 * 
 * 6，类的静态方法
 * - 相当于在构造函数上添加方法
 * - function Foo(){} =========> Foo.staticFunc = function(){}
 */


// - JavaScript忍者的测试实验
{
  function Ninja() {}
  
  const ninja = new Ninja();
  printer.true(typeof ninja === 'object', "The type of the instance is object.");
  printer.true(ninja instanceof Ninja, 'Instanceof identifies the constructor.');
  printer.true(ninja.constructor === Ninja, 'The ninja object was created by the Ninja function.');
  // ninja instanceof Ninja 接近于 ninja.constructor === Ninja
  // 
  printer.divider();
}

{
  const ninja2 = new Ninja();
  const ninja3 = new ninja2.constructor();
  printer.true(ninja2 instanceof Ninja, 'It is a Ninja!');
  printer.true(ninja2 !== ninja3, 'But not the same Ninja!');

  printer.divider();
}

{
  //
  function Person() {}
  Person.prototype.dance = function () {}
  function Ninja () {}

  Ninja.prototype = {
    dance: Person.prototype.dance
  }

  const ninja = new Ninja();
  printer.true(ninja instanceof Ninja, 'Ninja receives functionality from the Ninja prototype.');
  printer.true(ninja instanceof Person, 'Ninja receives functionality from the Person prototype.');
  printer.true(ninja instanceof Object, 'Ninja receives functionality from the Object prototype.');

  printer.divider();
}

{
  // 使用原型实现继承
  function Person() {}
  Person.prototype.dance = function () {}
  function Ninja() {}
  Ninja.prototype = new Person()

  const ninja = new Ninja();
  printer.true(ninja instanceof Ninja, 'Ninja receives functionality from the Ninja prototype');
  printer.true(ninja instanceof Person, '... and the Person prototype');
  printer.true(ninja instanceof Object, '... and the Object prototype');
  printer.true(typeof ninja.dance === 'function', '... and can dance!');
  printer.true(ninja.constructor !== Ninja, 'But (ninja.constructor === Ninja) has problem!');

  // 解决 ninja.constructor !== Ninja 问题
  Object.defineProperty(Ninja.prototype, 'constructor', {
    enumerable: false,
    value: Ninja,
    writable: true,
  });

  const ninja2 = new Ninja();
  printer.true(ninja2.constructor === Ninja, 'Connection from ninja instances to Ninja constructor reestablished!');
  for (let prop in Ninja.prototype) {
    printer.true(prop === 'dance', 'The only enumerable property is dance!');
  }

  printer.divider();
}

{
  // 配置属性
  var ninja = {};
  ninja.name = 'Yoshi';
  ninja.weapon = 'kusarigama';

  Object.defineProperty(ninja, 'sneaky', {
    configurable: false, // 是否可修改或删除
    enumerable: false, // 是否可遍历
    value: true, // 指定属性的值
    writable: true, // 是否可赋值
  });

  printer.true('sneaky' in ninja, `We can access the new property: sneaky`);
  for (let prop in ninja) {
    printer.true(prop !== undefined, `An enumerated property: ${prop}`);
  }

  printer.divider();
}

{
  // 在 ES6 中创建类
  class Ninja {
    constructor(name, level) {
      this.name = name;
      this.level = level;
    }
    swingSword() {
      return true;
    }
    static compare(ninja1, ninja2) {
      return ninja1.level - ninja2.level;
    }
  }

  var ninja = new Ninja('Yoshi', 4);
  printer.true(ninja instanceof Ninja, 'Our ninja is a Ninja');
  printer.true(ninja.name === 'Yoshi', 'named Yoshi');
  printer.true(ninja.swingSword(), 'and he can swing a sword.');

  const ninja2 = new Ninja('Hattori', 3);
  printer.true(!('compare' in ninja) && !('compare' in ninja2), 'A ninja instance doesn"t know how to compare');
  printer.true(Ninja.compare(ninja, ninja2) > 0, 'The Ninja class can do the comparison!');
  printer.true(!('swingSword' in Ninja), 'The Ninja class cannot swing a sword.');

  // 继承
  class FatNinja extends Ninja {
    constructor(name, level, weight) {
      super(name, level);
      this.weight = weight;
    }
  }

  const fatNinja = new FatNinja('Big T', 60, 220);
  printer.true(fatNinja.swingSword(), `${fatNinja.name} can swing a sword too.`);

  printer.divider();
}

{
  // getter setter
  const ninjaCollection = {
    ninjas: ['Yoshi', 'Huma', 'Hattori'],
    get firstNinja() {
      return this.ninjas[0];
    },
    set firstNinja(value) {
      this.ninjas[0] = value;
    },
  }

  printer.true(ninjaCollection.firstNinja === 'Yoshi', `The first ninja is ${ninjaCollection.firstNinja}`);
  ninjaCollection.firstNinja = 'Big T';
  printer.true(ninjaCollection.firstNinja === 'Big T', `But now first ninja is ${ninjaCollection.firstNinja}`);

  printer.divider();
}


return;


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
