//  async_await.js
//
//
//  Created by JohnnyB0Y on 2021/03/24.
//  Copyright © 2021 JohnnyB0Y. All rights reserved.

{
  async function async1() {
    console.log('async 1 start')
    await async2()
    // 切割 1
    console.log('async 1 middle')
    await async3()
    // 切割 2
    console.log('async 1 end')
  }

  async function async2() {
    console.log('async 2')
  }

  async function async3() {
    console.log('async 3')
  }

  console.log('script start ！')

  setTimeout(() => {
    console.log('setTimeout')
  }, 0)

  async1()

  new Promise(function(resolve) {
    console.log('promise 1')
    resolve()
  }).then(function() {
    console.log('promise 2')
  });

  Promise.resolve().then(res => {
    console.log('promise 3')
  })

  console.log('script end ！')

  process.nextTick(() => {
    console.log('next tick')
  })

  /**
   * 宏任务：settimeout
   * 微任务：切割1、promise 2、promise 3、切割2
   * 
   * script start ！
   * async 1 start
   * async 2
   * promise 1
   * script end ！
   * next tick
   * async 1 middle
   * async 3
   * promise 2
   * promise 3
   * async 1 end
   * setTimeout
   */

}

{
  /**
   * async 做了什么？
   */

  async function f(x) {
    /* 函数体 */
  }
  // 可以把上面函数想象成是一个返回期约的包装函数
  function f(x) {
    return new Promise(function(resolve, reject) {
      try {
        resolve( (function(x) { /* 函数体 */ })(x) );
      } catch (e) {
        reject(e);
      }
    })
  }

  /**
   * await 做了什么？
   */

  // 可以把 await 关键字想象成分割代码的记号，它们把函数体分割成相对独立的同步代码块。
  // ES2017 解析器可以把函数体分割成一系列独立的子函数，每个子函数都将被传给位于它前面的以 await 标记的那个期约的 then() 方法。
  
  // 以上是 JavaScript 权威指南的解释
  // 

}
