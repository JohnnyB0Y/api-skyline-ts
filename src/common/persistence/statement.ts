//  statement.ts
//
//
//  Created by JohnnyB0Y on 2021/03/01.
//  Copyright © 2021 JohnnyB0Y. All rights reserved.

import { DBField, valuesFormat } from "./base"
import { DBTable } from "./core"

// ------------------------ SQL Statement ------------------------------
export class DBStatement {
  constructor(public table: DBTable, public sql = '', public params: any[] = []) {}

  /**
   * 在sql语句后拼接字符串
   * @param str 拼接的字符串
   * @param betweenStr 拼接之间的间隔字符串，默认空格字符串 ' '
   */
  appendSql(str: string, betweenStr = ' '): DBStatement {
    this.sql += betweenStr + str
    return this
  }

  /**
   * 拼接参数
   * @param param 参数
   */
  appendParam(param: any): DBStatement {
    this.params.push(param)
    return this
  }

  /**
   * 合并参数
   * @param params 待合并的参数数组
   */
  mergeParams(params: any[]): DBStatement {
    params.forEach(p => {
      this.params.push(p)
    })
    return this
  }
}

// ------------------------ SQL IndexedStatement ----------------------------
export class DBIndexedStatement extends DBStatement { // 指定操作使用的索引
  indexedBy(indexName: string): DBIndexedStatement {
    this.sql = `INDEXED BY ${indexName}`
    return this
  }
  notIndexed(): DBIndexedStatement {
    this.sql = 'NOT INDEXED'
    return this
  }
}

// ------------------------ SQL OrderStatement ----------------------------
export class DBOrderStatement extends DBStatement {

  private isFirstField = true

  constructor(public table: DBTable) {
    super(table, 'ORDER BY')
  }

  /**
   * 查询返回数据的排序条件。
   * 降序排列 [4, 3, 2, 1]
   * 升序排列 [1, 2, 3, 4]
   * @param field 排序字段
   * @param descending 是否降序排列（默认升序排列）
   */
  orderByField(field: DBField<any>, descending = false): DBOrderStatement {
    this.isFirstField ? (this.isFirstField = false) : (this.sql += ',')
    const order = descending ? 'DESC' : 'ASC'
    return this.orderByFieldSql(`${field.name} ${order}`)
  }

  orderByFieldSql(fieldSql: string): DBOrderStatement {
    return this.appendSql(fieldSql) as DBOrderStatement
  }

  /**
   * 查询返回数据的排序条件。
   * @param column 排序的列位（字段的列的位置）
   * @param descending 是否降序排列（默认升序排列）
   */
  orderByColumn(column: number, descending = false): DBOrderStatement {
    this.isFirstField ? (this.isFirstField = false) : (this.sql += ',')
    const order = descending ? 'DESC' : 'ASC'
    return this.appendSql(`${column} ${order}`) as DBOrderStatement
  }
}

// ------------------------ SQL GroupStatement ----------------------------
export class DBGroupStatement extends DBStatement {

  private isFirstField = true

  constructor(public table: DBTable) {
    super(table, 'GROUP BY')
  }

  /**
   * 对相同的数据进行分组
   * @param field 分组字段
   * @param tableName 表名
   */
  groupByField(field: DBField<any>, tableName?: string): DBGroupStatement {
    this.isFirstField ? (this.isFirstField = false) : (this.sql += ',')
    return this.groupByFieldSql(tableName === undefined ? field.name : `${tableName}.${field.name}`)
  }

  groupByFieldSql(fieldSql: string): DBGroupStatement {
    return this.appendSql(fieldSql) as DBGroupStatement
  }
}

// ------------------------ SQL WhereStatement --------------------------------
export class DBWhereStatement extends DBStatement {

  constructor(public table: DBTable) {
    super(table, 'WHERE')
  }

  /**
   * 直接连接下一个字段条件
   * @param f 字段
   */
  field(f: DBField<any>): DBWhereStatement {
    return this.appendSql(f.name) as DBWhereStatement
  }

  /**
   * 用 AND 连接下一个字段条件
   * @param f 字段
   */
  andField(f: DBField<any>): DBWhereStatement {
    return this.appendSql(`AND ${f.name}`) as DBWhereStatement
  }

  /**
   * 用 OR 连接下一个字段条件
   * @param f 字段
   */
  orField(f: DBField<any>): DBWhereStatement {
    return this.appendSql(`OR ${f.name}`) as DBWhereStatement
  }

  /**
   * 条件：等于
   * @param value 数值
   */
  equalTo(value: number | string): DBWhereStatement {
    return this.condition('=', value)
  }

  /**
   * 条件：不等于
   * @param value 数值
   */
  notEqualTo(value: number | string): DBWhereStatement {
    return this.condition('!=', value)
  }

  /**
   * 条件：大于
   * @param value 数值
   */
  greaterThan(value: number): DBWhereStatement {
    return this.condition('>', value)
  }

  /**
   * 条件：大于等于
   * @param value 数值
   */
  greaterEqual(value: number): DBWhereStatement {
    return this.condition('>=', value)
  }

  /**
   * 条件：小于
   * @param value 数值
   */
  lessThan(value: number): DBWhereStatement {
    return this.condition('<', value)
  }

  /**
   * 条件：小于等于
   * @param value 数值
   */
  lessEqual(value: number): DBWhereStatement {
    return this.condition('<=', value)
  }

  /**
   * 条件：匹配通配符；https://www.runoob.com/sqlite/sqlite-like-clause.html
   * @param value 匹配字符串（%）
   */
  like(value: string): DBWhereStatement {
    return this.condition('LIKE', value)
  }

  /**
   * 条件：匹配通配符；https://www.runoob.com/sqlite/sqlite-glob-clause.html
   * @param value 匹配字符串
   */
  glob(value: string): DBWhereStatement {
    return this.condition('GLOB', value)
  }

  /**
   * 条件：在values里面
   * @param values 数值数组
   */
  in(values: number[]): DBWhereStatement {
    const [sql] = valuesFormat(values, (v, i) => {
      this.params.push(v)
      return [((i === 0) ? '?' : ', ?')]
    })
    return this.appendSql(`IN (${sql})`) as DBWhereStatement
  }

  /**
   * 条件：不在values里面
   * @param values 数值数组
   */
  notIn(values: number[]): DBWhereStatement {
    const [sql] = valuesFormat(values, (v, i) => {
      this.params.push(v)
      return [((i === 0) ? '?' : ', ?')]
    })
    return this.appendSql(`NOT IN (${sql})`) as DBWhereStatement
  }

  /**
   * 条件：在 start 与 end 之间
   * @param start 开始值
   * @param end 结束值
   */
  between(start: number, end: number): DBWhereStatement {
    this.params.push(start)
    this.params.push(end)
    return this.appendSql('BETWEEN ? AND ?') as DBWhereStatement
  }

  /**
   * 条件判断
   * @param operators 操作类型的字符串
   * @param value 条件值
   */
  condition(operators: string, value: any): DBWhereStatement {
    this.params.push(value)
    return this.appendSql(`${operators} ?`) as DBWhereStatement
  }
}
