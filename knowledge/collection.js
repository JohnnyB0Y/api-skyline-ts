//  collection.js
//
//
//  Created by JohnnyB0Y on 2021/03/27.
//  Copyright © 2021 JohnnyB0Y. All rights reserved.

{
  // Array
}

{
  // Map
}

{
  // Set

  // 初始化集合
  const set = new Set(['Huma'])

  // 添加元素
  set.add('Hattori')
  console.log( set )

  // 判断集合中是否存在某元素
  console.log( set.has('Hattori') )

  // 集合大小
  console.log(set.size)

  // 并集、交集、差集
  const ninjas = ['Kuma', 'Hattori', 'Yagyu']
  const samurai = ['Hattori', 'Oda', 'Tomoe']

  function SetOperation() {

    // 并集
    this.union = function (arr1, arr2) {
      return new Set([...arr1, ...arr2])
    }

    // 交集
    this.intersect = function (arr1, arr2) {
      const set2 = new Set(arr2)
      return new Set(arr1.filter( e => set2.has(e) ))
    }

    // 差集
    this.difference = function (arr1, arr2) {
      const set2 = new Set(arr2)
      return new Set(arr1.filter( e => !set2.has(e) ))
    }
  }

  const setOpt = new SetOperation()

  console.log(setOpt.union(ninjas, samurai))
  console.log(setOpt.intersect(ninjas, samurai))
  console.log(setOpt.difference(ninjas, samurai))


}