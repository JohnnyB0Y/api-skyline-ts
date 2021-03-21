//  command.ts
//
//
//  Created by JohnnyB0Y on 2021/03/01.
//  Copyright © 2021 JohnnyB0Y. All rights reserved.

import { DBField, FieldType, stringForFieldType, valuesFormat } from "./base"
import { DBTable } from "./core"
import { DBGroupStatement, DBIndexedStatement, DBOrderStatement, DBStatement, DBWhereStatement } from "./statement"

// ------------------------ SQL Command --------------------------------
export class DBCommand {
  constructor(public table: DBTable, protected _sql = '', public params: any[] = []) {}

  /**
   * 生成sql语句字符串
   */
  get sql(): string {
    return this._sql.trim()
  }

  /**
   * 生成sql语句对象
   */
  get statement(): DBStatement {
    return new DBStatement(this.table, this.sql, this.params)
  }
}

// ------------------------ SQL Select --------------------------------
export class DBSelect extends DBCommand {
  private isFirstField = true
  constructor(public table: DBTable) {
    super(table, 'SELECT')
  }

  /**
   * 对结果去重
   */
  distinct(): DBSelect {
    this._sql += ' DISTINCT'
    return this
  }

  /**
   * 需要取出的字段
   * @param field 字段
   * @param tableName 表名
   * @param asField 字段别名（返回的数据表使用）
   */
  field(field: DBField<any>, tableName?: string, asField?: string): DBSelect {
    this.isFirstField ? (this.isFirstField = false) : (this._sql += ',')
    this._sql += tableName === undefined ? ` ${field.name}` : ` ${tableName}.${field.name}`
    this._sql += asField === undefined ? '' : ` AS ${asField}`
    return this
  }

  /**
   * 需要取出的字段
   * @param field 字段
   * @param tableName 表名
   * @param asField 字段别名（返回的数据表使用）
   */
  andField(field: DBField<any>, fromTable?: string, asField?: string): DBSelect {
    return this.field(field, fromTable, asField)
  }

  /**
   * 查询取出所有字段
   */
  allField(): DBSelect {
    this._sql += ' *'
    return this
  }

  /**
   * 左边的表（A表）
   * @param tableA 表名
   * @returns 
   */
  fromTable(tableA: string): DBSelect {
    this._sql += ` FROM ${tableA}`
    return this
  }

  /**
   * 内连接查询，获得两表的交集，即共有的行。
   * @param tableB 表名
   */
  innerJoin(tableB: string): DBSelect {
    this._sql += ` INNER JOIN ${tableB} ON`
    return this
  }

  /**
   * 左外连接查询，获得A表所有的列，加上匹配到B表的列。
   * @param tableB 表名
   */
  leftJoin(tableB: string): DBSelect {
    this._sql += ` LEFT OUTER JOIN ${tableB} ON`
    return this
  }

  /**
   * 交叉连接查询，表A的每一行与表B的每一行进行组合。
   * A[1, 2] B[a, b] => [(1, a), (1, b), (2, a), (2, b)]
   * @param tableB 表名
   */
  crossJoin(tableB: string): DBSelect {
    this._sql += ` CROSS JOIN ${tableB}`
    return this
  }

  /**
   * innerJoin 和 leftJoin 的条件判断
   * @param tableA 表A
   * @param field1 表A字段
   * @param tableB 表B
   * @param field2 表B字段
   * @param operators 条件操作符（不用传）
   */
  onCondition(tableA: string, field1: DBField<any>, tableB: string, field2: DBField<any>, operators = '='): DBSelect {
    this._sql += ` ${tableA}.${field1.name} ${operators} ${tableB}.${field2.name}`
    return this
  }

  /**
   * 通过指定索引查询
   * @param indexed 索引语句
   */
  indexed(indexed: DBIndexedStatement): DBSelect {
    this._sql += ` ${indexed.sql}`
    return this
  }

  /**
   * 对结果进行筛选
   * @param where where语句
   */
  where(where: DBWhereStatement): DBSelect {
    this._sql += ` ${where.sql}`
    where.params.forEach(v => {
      this.params.push(v)
    })
    return this
  }

  /**
   * 对相同的数据进行分组
   * @param group 分组语句
   */
  group(group: DBGroupStatement): DBSelect {
    this._sql += ' ' + group.sql
    return this
  }

  /**
   * 查询返回数据的排序条件。
   * @param fields 排序语句
   */
  order(order: DBOrderStatement): DBSelect {
    this._sql += ' ' + order.sql
    return this
  }

  /**
   * 查询返回的数量限制
   * @param num 限制量
   */
  limit(num: number): DBSelect {
    this._sql += ` LIMIT ${num}`
    return this
  }

  /**
   * 查询返回数据的偏移值
   * @param num 偏移量
   */
  offset(num: number): DBSelect {
    this._sql += ` OFFSET ${num}`
    return this
  }
}

// ------------------------ SQL Query --------------------------------
export class DBQuery extends DBCommand {

  private selectCmd = new DBSelect(this.table)

  constructor(
    public table: DBTable,
    readonly fields?: DBField<any>[],
    readonly where?: DBWhereStatement,
    readonly indexed?: DBIndexedStatement
  ) {
    super(table)
    if (fields === undefined) {
      this.selectCmd.allField()
    }
    else {
      fields.forEach(v => {
        this.selectCmd.field(v)
      })
    }

    this.selectCmd.fromTable(table.tableName)

    if (indexed !== undefined) {
      this.selectCmd.indexed(indexed)
    }
    if (where !== undefined) {
      this.selectCmd.where(where)
      this.params = where.params
    }
  }

  /**
   * 查询返回数据的排序条件
   * @param field 排序字段
   * @param descending 是否降序排列
   */
  orderBy(field: DBField<any>, descending = false): DBQuery {
    this.selectCmd.order(new DBOrderStatement(this.table).orderByField(field, descending))
    return this
  }

  /**
   * 分页
   * @param page 页码
   * @param size 数量
   * @returns 
   */
  paged(page: number, size: number): DBQuery {
    this.selectCmd.limit(size).offset((page - 1) * size)
    return this
  }

  get sql(): string {
    return this.selectCmd.sql
  }
}

// ------------------------ SQL Unions --------------------------------
// export class DBUnions extends DBCommand {
//   constructor(
//   ) {
//     super()
//   }
// }

// ------------------------ SQL Insert --------------------------------
export class DBInsert extends DBCommand {
  constructor(
    public table: DBTable,
    readonly fields: DBField<any>[]
  ) {
    super(table)
    const [fs, vs] = valuesFormat(fields, (v, i) => {
      this.params.push(v.value === undefined ? v.defaultValue : v.value)
      return [((i === 0) ? v.name : `, ${v.name}`), (i === 0) ? '?' : ', ?']
    })
    this._sql = `INSERT INTO ${table.tableName} (${fs}) VALUES (${vs})`
  }
}

// ------------------------ SQL Create --------------------------------
export class DBCreate extends DBCommand {
  constructor(
    public table: DBTable,
    readonly fields: DBField<any>[]
  ) {
    super(table)
    const [fs] = valuesFormat(fields, (f, i) => [(i === 0) ? (f.statement(this.table).sql) : (`, ${f.statement(this.table).sql}`)])
    this._sql = `CREATE TABLE IF NOT EXISTS ${table.tableName} (${fs})`
  }
}

// ------------------------ SQL Update --------------------------------
export class DBUpdate extends DBCommand {
  constructor(
    public table: DBTable,
    readonly fields: DBField<any>[],
    readonly where: DBWhereStatement,
  ) {
    super(table)
    const [fs] = valuesFormat(fields, (v, i) => {
      v.valueChange ? this.params.push(v.value) : undefined
      return v.valueChange ? [(i === 0) ? `${v.name} = ?` : `, ${v.name} = ?`] : ['']
    })
    this._sql = `UPDATE ${table.tableName} SET ${fs} ${where.sql}`
    this.params = this.params.concat(where.params)
  }
}

// ------------------------ SQL Delete --------------------------------
export class DBDelete extends DBCommand {
  constructor(
    public table: DBTable,
    readonly where: DBWhereStatement,
  ) {
    super(table, `DELETE FROM ${table.tableName} ${where.sql}`, where.params)
  }
}

// ------------------------ SQL Indexed --------------------------------
export class DBIndexed extends DBCommand {
  constructor(
    public table: DBTable
  ) {
    super(table)
  }

  /**
   * 对单个字段创建索引
   * @param field 字段
   */
  createForField(field: DBField<any>): DBCommand {
    return this.createForFields([field], field.indexedName ?? field.name, field.uniqueIndexed)
  }

  /**
   * 创建联合索引
   * @param field 字段数组
   * @param indexedName 索引名
   * @param unique 是否唯一索引
   */
  createForFields(fields: DBField<any>[], indexedName: string, unique = false): DBCommand {
    const [fs] = valuesFormat(fields, (f, i) => [(i === 0) ? (f.name) : (`, ${f.name}`)])
    const indexSql = unique ? 'UNIQUE INDEX' : 'INDEX'
    this._sql = `CREATE ${indexSql} IF NOT EXISTS ${indexedName} ON ${this.table.tableName} (${fs})`
    return this
  }
}

export class DBDrop extends DBCommand {
  /**
   * 删除索引
   */
  dropIndex(indexName: string): DBCommand {
    this._sql = `DROP INDEX IF EXISTS ${indexName}`
    return this
  }

  /**
   * 删除表
   */
  dropTable(tableName: string): DBCommand {
    this._sql = `DROP TABLE IF EXISTS ${tableName}`
    return this
  }

  /**
   * 删除视图（虚表）
   */
  dropView(viewName: string): DBCommand {
    this._sql = `DROP VIEW IF EXISTS ${viewName}`
    return this
  }

}

// ------------------------ SQL Alter --------------------------------
export class DBAlter extends DBCommand {
  constructor(
    public table: DBTable,
  ) {
    super(table)
    this._sql = `ALTER TABLE ${this.table.tableName}`
  }

  /**
   * 重命名表名
   * @param newTableName 新的表名
   */
  renameTable(newTableName: string): DBCommand {
    this._sql += ` RENAME TO ${newTableName}`
    return this
  }

  /**
   * 重命名字段
   * @param oldColumnName 旧的字段名
   * @param newColumnName 新的字段名
   */
  renameColumn(oldColumnName: string, newColumnName: string): DBCommand {
    this._sql += ` RENAME COLUMN ${oldColumnName} TO ${newColumnName}`
    return this
  }

  /**
   * 新增字段
   * @param name 字段名
   * @param fieldType 字段值类型
   */
  addColumn(name: string, fieldType: FieldType): DBCommand {
    const type = stringForFieldType(fieldType)
    this._sql += ` ADD COLUMN ${name} ${type}`
    return this
  }
}
