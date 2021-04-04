//  custom_promise.js
//
//
//  Created by JohnnyB0Y on 2021/04/04.
//  Copyright © 2021 JohnnyB0Y. All rights reserved.

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
