//  generator_promise.js
//
//
//  Created by JohnnyB0Y on 2021/03/25.
//  Copyright © 2021 JohnnyB0Y. All rights reserved.

/**
 * 全局上下文环境（全局词法环境）
 * outer ----> NULL
 * --------------------------------------------------------
 * getJSON => function
 * async => function
 */

// 调用
// async(getJSONGenerator);


function getJSON(url, timeout = 500) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const obj = {
        url: url,
        missionsUrl: "data/missionsUrl.json",
        detailsUrl: "detailsUrl.json",
      }
      console.log(`Get ${url} finished.`);
      resolve([obj]);
    }, timeout);
  });
}

function * getJSONGenerator() {
  try {
    // 用生成器执行异步操作
    // 先执行 getJSON 函数，遇到 yield 会被挂起等待下次执行。
    const ninjas = yield getJSON("data/ninjas.json");
    const missions = yield getJSON(ninjas[0].missionsUrl);
    const missionDescription = yield getJSON(missions[0].detailsUrl);
    console.log(ninjas, missions, missionDescription);
    // Study the mission details
  } catch (e) {
    console.log("Oh no, we weren\'t able to get the mission details.")
  }
}

function async(generator) {

  /**
   * async 执行上下文环境
   * outer ----> 指向 全局上下文环境
   * -------------------------------------------------------------
   * generator = 生成器函数
   * iterator = 函数迭代器
   * handle => function
   */

  // 从生成器函数，创建迭代器
  var iterator = generator();

  // 定义一个执行迭代器的方法
  function handle(iteratorResult) {

    /**
     * handle 执行上下文
     * outer ----> 指向 async 执行上下文环境
     * ------------------------------------------------------------------
     * iteratorResult = 迭代器返回的值对象 {value: Promise, done: boolean}
     * iteratorValue = Promise对象，执行 getJSON("data/ninjas.json") 返回的。
     */

    console.log(iteratorResult);
    // done 为 true，任务全部完成，返回执行权；
    if (iteratorResult.done) {
      console.log('Handle end.')
      return;
    }

    const iteratorValue = iteratorResult.value;
    if (iteratorValue instanceof Promise) {
      // 取出的对象是 Promise 对象，调用then后，开始执行。
      iteratorValue.then(res => handle(iterator.next(res))).catch(err => iterator.throw(err));

      // 补充 1
      // 这里，Promise对象的回调闭包捕获了 iterator迭代器 和 handle 函数；因此如果异步执行，那么在下一个事件循环取出执行时，上下文还在。
      // 执行 Promise执行体时:
      // 如果遇到网络IO或文件IO，就把任务包装并提交到事件多路分解器（Event Demultiplexer）（或叫事件通知接口）处理；
      // IO操作完成后，分解器会把结果包装成事件对象，提交到宏任务队列中，等待未来某一个事件循环取出处理。
      // 如果遇到 timer（定时器）之类的，就把任务包装并提交到timer 线程中处理；
      // timer 处理完成，把结果包装成事件对象，提交到宏任务队列中，等待未来某一个事件循环取出处理。
      // 如果是同步代码，那就直接执行就好了。
      //
      // 最后当事件循环处理完结果的时候，会执行 Promise的回调函数。
      // 执行回调函数，就是执行 handle(iterator.next(res))，也就是开始下一个周期。

      // 补充 2
      // 事件循环队列有两个队列，一个微任务队列，另一个是宏任务队列。其中 微任务 执行优先级 高于 宏任务。
      // 微任务：process.nextTick 和 Promise 会被提交到微任务队列。其中 process.nextTick 执行优先级 高于 Promise.
      // 宏任务：setTimeout、setInterval、setImmediate 和 I/O 任务。
    }

    // handle 执行完成，返回执行权。
  }

  // 这里第一次执行迭代器，运行环境还是在当前事件循环中
  try {
    console.log('Handle start.');
    handle(iterator.next());
  } catch (e) {
    iterator.throw(e);
  }

  // async 执行完成，并返回执行权。
}


/**
 * 模仿官方 Promise效果
 */

function MyPromise(executor) {
  const self = this

  self.executor = executor
  self.state = 'pending'
  self.value = null 
  self.reason = null

  self.onfulfilled = null
  self.onrejected = null
  self.nextPromise = null

  // ----------- then --------------
  self.then = function (onfulfilled = val => {}, onrejected = reason => {
    throw new Error(reason)
  }) {
    self.onfulfilled = onfulfilled
    self.onrejected = onrejected

    const nextPromise = new MyPromise((resolve, reject) => {

    })
    self.nextPromise = nextPromise
    return nextPromise
  }

  self.catchErr = function (onrejected) {
    self.onrejected = onrejected
  }

  self.executePromise = function() {
    try {
      if (self.executor) {
        self.executor(_resolve, _reject)
      }
    } catch (err) {
      _reject(err.reason)
    }
  }

  self.executeOnfulfilled = function (nextPromise) {

    // 模拟添加到微任务队列
    process.nextTick(() => {
      try {
        if (self.onfulfilled) {
          const promise = self.onfulfilled(self.value)
          if (promise) { // 有值，是用户自定义的
            // console.log(promise)
            // promise.executeOnfulfilled()
          }
        }
        
      } catch (err) {
        _reject(err.message)
      }
    })
  }

  function _resolve(val) {
    // 成功
    self.state = _nameForState(1)
    self.value = val
    self.executeOnfulfilled()

    let next = self.nextPromise
    while(next) {
      next.executeOnfulfilled()
      next = next.nextPromise
    }

  }

  function _reject(reason) {
    // 失败
    self.state = _nameForState(2)
    self.reason = reason
    if (self.onrejected) {
      self.onrejected(reason)
    }
  }

  function _nameForState(state) {
    switch (state) {
      case 0:
        return 'pending'
      case 1: 
        return 'fulfilled'
      case 2: 
        return 'rejected'
    }
  }

  // 如果有执行体，先执行
  self.executePromise()
}

// customPromise()
originPromise()

/**
  promise 1
  promise 6 - 1
  promise 6 - 2
  promise 1 timeout
  promise 2 haha
  promise 4 - 1
  promise 4 - 3
  promise 4 - 2
  promise 4 - 4
  promise 5 - 1
  promise 5 - 2
  promise 2 timeout haha
  promise 3 timeout undefined
 */

function customPromise() {
  const p = new MyPromise((resolve, reject) => {
    console.log('promise 1')
    setTimeout(() => {
      console.log('promise 1 timeout')
      resolve('haha')
    }, 0);
  })
  
  p.then(val => {
    console.log(`promise 2 ${val}`)
    setTimeout(() => {
      console.log(`promise 2 timeout ${val}`)
    }, 0);
  })
  .then(val => {
  
    setTimeout(() => {
      console.log(`promise 3 timeout ${val}`)
    }, 0);
  
    const promise = new MyPromise((resolve, reject) => {
      console.log('promise 4 - 1')
      resolve()
    })
  
    promise.then(val => {
      console.log('promise 4 - 2')
    })
  
    const promise2 = new MyPromise((resolve, reject) => {
      console.log('promise 4 - 3')
      resolve()
    })
    .then(val => {
      console.log('promise 4 - 4')
    })
  
    return promise
  })
  .then(val => {
    console.log('promise 5 - 1')
  })
  .then(val => {
    console.log('promise 5 - 2')
  })
  
  new MyPromise((resolve, reject) => {
    console.log('promise 6 - 1')
    resolve()
  })
  .then(val => {
    console.log('promise 6 - 2')
  })
}

function originPromise() {
  const p = new Promise((resolve, reject) => {
    console.log('promise 1')
    setTimeout(() => {
      console.log('promise 1 timeout')
      resolve('haha')
    }, 0);
  })
  
  p.then(val => {
    console.log(`promise 2 ${val}`)
    setTimeout(() => {
      console.log(`promise 2 timeout ${val}`)
    }, 0);
  })
  .then(val => {
  
    setTimeout(() => {
      console.log(`promise 3 timeout ${val}`)
    }, 0);
  
    const promise = new Promise((resolve, reject) => {
      console.log('promise 4 - 1')
      resolve()
    })
  
    promise.then(val => {
      console.log('promise 4 - 2')
    })
  
    const promise2 = new Promise((resolve, reject) => {
      console.log('promise 4 - 3')
      resolve()
    })
    .then(val => {
      console.log('promise 4 - 4')
    })
  
    return promise
  })
  .then(val => {
    console.log('promise 5 - 1')
  })
  .then(val => {
    console.log('promise 5 - 2')
  })
  
  new Promise((resolve, reject) => {
    console.log('promise 6 - 1')
    resolve()
  })
  .then(val => {
    console.log('promise 6 - 2')
  })
}
