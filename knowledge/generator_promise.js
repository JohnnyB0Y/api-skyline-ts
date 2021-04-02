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

function AGPromise(executor) {
  const self = this

  self.executor = executor
  self.state = 'pending'
  self.value
  self.reason

  self.onfulfilled
  self.onrejected
  self.nextPromise
  self.errorCatch

  // ----------- then --------------
  self.then = function (onfulfilled, onrejected) {
    self.onfulfilled = onfulfilled
    self.onrejected = onrejected

    self.nextPromise = new AGPromise()
    return self.nextPromise
  }

  self.catch = function (onrejected) {
    self.errorCatch = onrejected
  }

  function executePromise(promise) {
    try {
      if (promise.executor) {
        promise.executor(resolve, reject)
      }
    } catch (err) {
      promiseExecuteOnrejected(promise, err.message)
    }
  }

  function promiseExecuteOnfulfilled(promise, value) {
    if (!promise) return
    promise.state = nameForState(1)
    promise.value = value

    // 模拟添加到微任务队列
    process.nextTick(() => {
      try {
        if (promise.onfulfilled) {
          // 先执行自己的then      
          const userResult = promise.onfulfilled(value)
          if (userResult instanceof AGPromise) { // 用户自定义的Promise，拼接到尾巴
            penultimateP = penultimatePromise(userResult)
            penultimateP.errorCatch = penultimateP.errorCatch ? penultimateP.errorCatch : penultimateP.nextPromise.errorCatch
            penultimateP.nextPromise = promise.nextPromise
          }
          else { // 执行下一个then
            promiseExecuteOnfulfilled(promise.nextPromise, userResult)
          }
        }
      } catch (err) {
        promiseExecuteOnrejected(promise, err.message)
      }
    })
  }

  function promiseExecuteOnrejected(promise, reason) {
    if (!promise) return
    promise.state = nameForState(2)
    promise.reason = reason

    // 模拟添加到微任务队列
    process.nextTick(() => {
      if (promise.onrejected) {
        promise.onrejected(reason)
        promiseExecuteOnfulfilled(promise.nextPromise, promise.value) // 继续往下执行
      }
      else { // 捕获总错误，中断执行
        const errorCatch = nearestErrorCatch(promise)
        if (errorCatch) {
          errorCatch(reason)
        }
        else {
          throw new Error('UnhandledPromiseRejectionWarning: Unhandled promise rejection.')
        }
      }
    })
  }

  function resolve(value) {
    if (self.state === nameForState(0)) { // 成功
      promiseExecuteOnfulfilled(self, value)
    }
  }

  function reject(reason) {
    if (self.state === nameForState(0)) { // 失败
      promiseExecuteOnrejected(self, reason)
    }
  }

  function nameForState(state) {
    switch (state) {
      case 0:
        return 'pending'
      case 1: 
        return 'fulfilled'
      case 2: 
        return 'rejected'
    }
  }

  function penultimatePromise(promise) { // 倒数第二的 Promise
    let last = promise.nextPromise
    while (last.nextPromise) {
      if (!last.nextPromise.nextPromise) {
        return last
      }
      last = last.nextPromise
    }
    return promise
  }

  function nearestErrorCatch(promise) { // 最靠近的捕获块
    let nextP = promise
    while (nextP) {
      if (nextP.errorCatch) {
        return nextP.errorCatch
      }
      nextP = nextP.nextPromise
    }
    return null
  }

  // 如果有执行体，先执行
  executePromise(self)
}

customPromise()
// originPromise()

/**
  promise 1
  promise 6 - 1
  promise 6 - 2 undefined
  promise 1 timeout
  promise 2 haha
  promise 3 undefined
  promise 4 - 1
  promise 4 - 3
  promise 4 - 2 undefined
  promise 4 - 4 undefined
  promise 5 - 1 undefined
  promise 5 - 2 undefined
  promise 2 timeout haha
  promise 3 timeout undefined
 */

function customPromise() {
  const p = new AGPromise((resolve, reject) => {
    console.log('promise 1')
    // reject(0)
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
  
    console.log(`promise 3 ${val}`)

    setTimeout(() => {
      console.log(`promise 3 timeout ${val}`)
    }, 0);
  
    const promise = new AGPromise((resolve, reject) => {
      console.log('promise 4 - 1')
      resolve()
      // reject(1)
    })
  
    promise.then(val => {
      console.log('promise 4 - 2', val)
    })
    // .catch(reason => {
    //   console.log('error 4 - 2:', reason)
    // })
  
    const promise2 = new AGPromise((resolve, reject) => {
      console.log('promise 4 - 3')
      resolve()
    })
    .then(val => {
      console.log('promise 4 - 4', val)
    })
  
    return promise
  })
  .then(val => {
    console.log('promise 5 - 1', val)
  })
  .then(val => {
    console.log('promise 5 - 2', val)
  })
  .catch(reason => {
    console.log('error:', reason)
  })
  
  new AGPromise((resolve, reject) => {
    console.log('promise 6 - 1')
    resolve()
  })
  .then(val => {
    console.log('promise 6 - 2', val)
  })
}

function originPromise() {
  const p = new Promise((resolve, reject) => {
    console.log('promise 1')
    // reject(0)
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
  
    console.log(`promise 3 ${val}`)

    setTimeout(() => {
      console.log(`promise 3 timeout ${val}`)
    }, 0);
  
    const promise = new Promise((resolve, reject) => {
      console.log('promise 4 - 1')
      resolve()
    })
  
    promise.then(val => {
      console.log('promise 4 - 2', val)
    })
    // .catch(reason => {
    //   console.log('error 4 - 2:', reason)
    // })
  
    const promise2 = new Promise((resolve, reject) => {
      console.log('promise 4 - 3')
      resolve()
    })
    .then(val => {
      console.log('promise 4 - 4', val)
    })
  
    return promise
  })
  .then(val => {
    console.log('promise 5 - 1', val)
  })
  .then(val => {
    console.log('promise 5 - 2', val)
  })
  .catch(reason => {
    console.log('error:', reason)
  })
  
  new Promise((resolve, reject) => {
    console.log('promise 6 - 1')
    resolve()
  })
  .then(val => {
    console.log('promise 6 - 2', val)
  })
}
