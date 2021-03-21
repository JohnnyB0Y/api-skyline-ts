//  base.ts
//
//
//  Created by JohnnyB0Y on 2021/03/04.
//  Copyright © 2021 JohnnyB0Y. All rights reserved.
// https://www.runoob.com/sqlite/sqlite-data-types.html
// https://sqlite.org/doclist.html
// https://www.sqlitetutorial.net/

import { DBCommand } from "./command"
import { DBTable } from "./core"
import { DBStatement } from "./statement"

export enum FieldType {
  // 值是一个带符号的整数，根据值的大小存储在 1、2、3、4、6 或 8 字节中。
  integer = 0,

  // 值是一个浮点值，存储为 8 字节的 IEEE 浮点数字。
  real,
  float,
  double,

  // 值是一个文本字符串，使用数据库编码（UTF-8、UTF-16BE 或 UTF-16LE）存储。
  text,

  // 值是一个 blob 数据，完全根据它的输入存储。
  blob,

  // 当文本数据被插入到亲缘性为NUMERIC的字段中时，
  // 如果转换操作不会导致数据信息丢失以及完全可逆，
  // 那么SQLite就会将该文本数据转换为INTEGER或REAL类型的数据，
  // 如果转换失败，SQLite仍会以TEXT方式存储该数据。
  numeric,
  boolean,
}

export enum DBType {
  sqlite3 = 0,
  mysql,
}

export function stringForFieldType(type: FieldType): string {
  switch (type) {
    case FieldType.integer: return 'INTEGER'
    case FieldType.real: return 'REAL'
    case FieldType.float: return 'FLOAT'
    case FieldType.double: return 'DOUBLE'
    case FieldType.text: return 'TEXT'
    case FieldType.blob: return 'BLOB'
    case FieldType.numeric: return 'NUMERIC'
    case FieldType.boolean: return 'BOOLEAN'
    default: return 'NONE'
  }
}

/**
 * 快速拼接数组内容
 * @param fields 数组
 * @param func 返回待拼接的字符串数组 【第一个待拼接的字符串，第二个待拼接的字符串】
 * @returns 【第一个拼接的字符串，第二个拼接的字符串】
 */
export function valuesFormat<T>(
  values: T[], 
  func: (value: T, idx: number) => [string] | [string, string]
  ): [string, string] {
  let fs = ''
  let vs = ''
  values.forEach((v, i) => {
    const [str1, str2] = func(v, i)
    fs += str1
    if (str2 !== undefined) {
      vs += str2
    }
  })
  return [fs, vs]
}

// ---------------------- 数据库命令调度接口 -----------------------
export interface DBSchedulable {
  /**
   * 当前使用中的数据库版本号，方便Table组装对应版本的 sql 执行命令
   */
  usingVersion(): string;
  /**
   * 当前数据库类型
   */
  databaseType(): DBType;

  /**
   * 执行sql命令
   * @param cmd sql命令
   */
  executeCommand(cmd: DBCommand): Promise<any>;
  /**
   * 以事务方式执行sql命令
   * @param cmds sql命令集合
   */
  executeTransaction(cmds: DBCommand[]): Promise<any>;
  /**
   * 批量执行sql命令
   * @param cmds sql命令集合
   */
  executeBatch(cmds: DBCommand[]): Promise<any>;

  /**
   * 解包原始数据 => 数组数据
   * @param result 查询结果原始数据
   */
  unpackQuery(result: any): any[];
}

// ------------------------ SQL Field -------------------------------------
export class DBField<T> {

  protected _notNull = false // 指定在该列上不允许 NULL 值。
  protected _unique = false // 防止在一个特定的列存在两个记录具有相同的值。
  protected _primaryKey = false // 唯一标识数据库表中的每个记录
  protected _primaryKeyDesc = false // 主键索引是否降序
  protected _autoIncrement = false // 字段自增
  protected _indexed = false // 索引
  public indexedName?: string // 索引名称
  public uniqueIndexed = false // 唯一索引 ？
  protected _value?: T
  public valueChange = false // 记录值改变状态
  public checkFunc?: (value: T | undefined) => boolean
  readonly name: string // 字段名称
  readonly fieldType: FieldType // 字段类型
  readonly addVersion: string // 添加到数据表时的版本，做数据表升级和降级时用到
  protected removeVersion?: string // 从数据表中移除时的版本，做数据表升级和降级时用到

  constructor(
    name: string, // 字段名称
    fieldType: FieldType, // 字段类型
    addVersion: string, // 添加到数据表时的版本，做数据表升级和降级时用到
    public defaultValue?: T, // 默认值
  ) {
    this.name = name
    this.fieldType = fieldType
    this.addVersion = addVersion
  }

  // 设置值
  set value(v: T | undefined) {
    if (this.checkFunc !== undefined && this.checkFunc(v) === false) { // 检查数据
      console.log(`字段检测不通过！field: ${this.name} value: ${v}`)
    }
    else {
      this.valueChange = true
      this._value = v
    }
  }

  // 获取值
  get value(): T | undefined {
    return this._value
  }

  /**
   * 检测值是否合法
   * @param func 检测值的闭包
   */
  addCheckFunc(func: (value: T | undefined) => boolean): DBField<T> {
    this.checkFunc = func
    return this
  }

  /**
   * 在当前版本是否可用 ？
   * @param version 版本号
   */
  isAvailableForVersion(version: string): boolean {
    if (this.removeVersion === undefined) {
      return Number(version) >= Number(this.addVersion)
    }
    return Number(version) < Number(this.removeVersion)
  }

  /**
   * 是否在当前版本新增 ？
   * @param version 版本号
   */
  isAddForVersion(version: string): boolean {
    return version === this.addVersion
  }

  /**
   * 是否在当前版本删除 ？
   * @param version 版本号
   */
  isRemoveForVersion(version: string): boolean {
    return version === this.removeVersion
  }

  /**
   * 移除或废弃此字段
   * @param v 移除或废弃此字段的版本号
   */
  removeAtVersion(v: string): DBField<T> {
    this.removeVersion = v
    return this
  }
  
  /**
   * 设为不为空
   */
  notNull(): DBField<T> {
    this._notNull = true
    return this
  }
  
  /**
   * 设为唯一
   */
  unique(): DBField<T> {
    this._unique = true
    return this
  }

  /**
   * 设为主键（主键会创建索引，默认是升序，可以通过desc 设为降序）
   * @param desc 是否降序
   */
  primaryKey(desc = false): DBField<T> {
    this._primaryKey = true
    this._primaryKeyDesc = desc
    return this
  }

  /**
   * 设为自增
   */
  autoIncrement(): DBField<T> {
    this._autoIncrement = true
    return this
  }

  /**
   * 设为索引
   * @param indexedName 索引名称，默认是字段名
   */
  indexed(indexedName = this.name, unique = false): DBField<T> {
    this._indexed = true
    this.indexedName = indexedName
    this.uniqueIndexed = unique
    return this
  }

  /**
   * 生成sql语句对象
   */
  statement(table: DBTable): DBStatement {
    const statement = new DBStatement(table, this.name)
    statement.appendSql(stringForFieldType(this.fieldType))
    if (this._primaryKey) {
      statement.appendSql('PRIMARY KEY')
      statement.appendSql((this._primaryKeyDesc ? 'DESC' : 'ASC'))
    }
    if (this._autoIncrement) {
      statement.appendSql('AUTOINCREMENT')
    }
    if (this._notNull) {
      statement.appendSql('NOT NULL')
    }
    if (this._unique) {
      statement.appendSql('UNIQUE')
    }
    if (this.defaultValue !== undefined) {
      statement.appendSql(`DEFAULT ${this.defaultValue}`)
    }
    return statement
  }
}
