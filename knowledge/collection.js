//  collection.js
//
//
//  Created by JohnnyB0Y on 2021/03/27.
//  Copyright © 2021 JohnnyB0Y. All rights reserved.

const printer = require('./tools').printer

{
  // Array

  // 初始化数组
  const ninjas = ['Kuma', 'Soda', 'Hattori', 'Yagyu']

  // 数组长度
  console.log('数组长度：', ninjas.length)

  // 索引访问
  // tips: 第一个元素的索引是0，最后一个元素索引是数组长度-1，访问越界的索引，不会抛异常，而是返回 undefined；
  printer.true(ninjas[0] === 'Kuma', 'Huma is the first ninja of ninjas array.')
  printer.true(ninjas[ninjas.length - 1] === 'Yagyu', 'Yagyu is the last ninja of ninjas array.')
  printer.true(ninjas[4] === undefined, 'We get undefined if we try to access an out of bounds index.')

  // 添加、删除元素 ----------------------------------------
  // tips: push 是在后面追加元素，unshift 是在开头插入元素；pop 是在末尾删除元素，shift 是在开头删除元素；
  // 1，下标方式添加元素，如果下标对应的元素存会替换，如果下标元素如果越界多个，中间会填充 undefined 元素。
  // 2，手动设置 length 属性，会扩展属性或裁剪属性，扩展表现为数组长度增加，后面填充 undefined 元素，裁剪表现为数组长度减少，后面的元素被移除。

  printer.true( ninjas.push('Kobe') === 5, 'Kobe is join the ninjas, there are 5 ninja now!')
  printer.true( ninjas[ninjas.length - 1] === 'Kobe', 'And kobe is the last ninjia.')

  printer.true( ninjas.unshift('Aj') === 6, 'Aj is join the ninjas, there are 6 ninja now!')
  printer.true( ninjas[0] === 'Aj', 'And Aj is the first ninjia.')

  printer.true( ninjas.pop() === 'Kobe', 'Kobe is leave, there are 5 ninja now!')
  printer.true( ninjas.shift() === 'Aj', 'Aj is leave, there are 4 ninja now!')


  // 在任意位置添加、删除元素 ---------------------------------------

  // 从 下标1 开始，删除 1个元素
  console.log(ninjas.splice(1, 1))

  // 从 下标1 开始，删除一个元素，后面在当前下标插入若干元素；tips：删除的个数不能为 0，不然后面的插入无效果；
  console.log(ninjas.splice(1, 1, 'Kobe', 'Aj', 'Jack'))

  // 数组切片，返回 0 <= index < 2 的元素数组
  console.log(ninjas.slice(0, 2))


  // 遍历数组 -----------------------------------------
  ninjas.forEach((val, idx) => {
    console.log(val, idx)
  })

  // 映射数组 .map() ---------------------------------------
  console.log(
    ninjas.map((val, idx) => {
      return val + idx
    })
  )

  // 检测数组元素 -----------------------------------

  // .every() 所有元素都为 true，最终返回 true
  printer.true(ninjas.every(ninja => ninja.length > 1), 'All ninja"s name length > 1')
  printer.true(ninjas.every(ninja => ninja.length > 2) === false, 'All ninja"s name length > 2 ? No, because Aj is not.')

  // .some() 存在元素返回 true，最终就返回 true
  printer.true(ninjas.some(ninja => ninja.length === 2), 'Has some ninja"s name length is 2 ? Yes, Aj is.')


  // 元素查找 -----------------------------------
  // 使用 find() 在数组中查找元素，返回第一个回调函数中返回true 的元素；
  // 使用 filter() 在数组中查找多个匹配的元素；
  // 使用 indexOf() 查找特定元素在数组中的索引，顺序查找，返回第一个找到的元素；
  // 使用 lastIndexOf() 查找特定元素在数组中的索引，反序查找，返回第一个找到的元素；
  // 使用 findIndex() 在数组中查找元素的索引，返回第一个在回调函数中返回true 的元素索引；

  console.log(
    'Who"s name length is 2 ?',
    ninjas.find(ninja => ninja.length === 2)
  )

  console.log(
    'Who"s name length > 2 ?',
    ninjas.filter(ninja => ninja.length > 2)
  )

  // 数组排序 ----------------------------------------
  // 返回 -1 表示 [a, b]；返回 0 表示 a、b 相等；返回 1 表示 [b, a]；
  console.log(
    ninjas.sort((a, b) => {
      return (a < b) 
      ? -1
      : ( (a > b) ? 1 : 0 )
    })
  )
  
  // 合计数组元素 ---------------------------------------
  console.log(
    ninjas.reduce((pre, cur, idx) => {
      if (idx === 1) {
        pre = 'ninjas: ' + pre
      }
      return pre + ' + ' + cur
    })
  )

  console.log(
    ninjas.reduce((pre, cur, idx) => {
      return pre = (idx === 1) ? pre.length + cur.length : pre + cur.length
    })
  )

  printer.divider()
}

{
  // Map

  // 初始化 Map
  const ninjaIslandMap = new Map()
  const huma = {name: 'Huma', weapon: 'buibuibui'}
  const aj = {name: 'aj', weapon: 'sososo'}

  // 添加元素键值对
  ninjaIslandMap.set(huma.name, huma)
  ninjaIslandMap.set(aj.name, aj)
  ninjaIslandMap.set(aj, aj.weapon)

  // 取出元素
  console.log( ninjaIslandMap.get(aj.name).weapon )
  console.log( ninjaIslandMap.get(huma.name) )
  console.log( ninjaIslandMap.get(aj) )

  // 删除元素
  console.log( ninjaIslandMap.delete(aj) )

  // 遍历 map
  ninjaIslandMap.forEach((val, key) => {
    console.log(`val: ${val} and key: ${key}`)
  })

  for (const val of ninjaIslandMap) {
    console.log(val)
  }

  printer.divider()
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

  // 遍历集合
  set.forEach(val => {
    console.log(val)
  })

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

  printer.divider()
}
