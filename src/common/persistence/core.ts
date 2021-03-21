//  center.ts
//
//
//  Created by JohnnyB0Y on 2021/03/01.
//  Copyright © 2021 JohnnyB0Y. All rights reserved.

import { DBField, DBSchedulable } from "./base";
import { DBCommand, DBCreate, DBDelete, DBIndexed, DBInsert, DBQuery, DBUpdate } from "./command";
import { DBWhereStatement } from "./statement";

export abstract class DBService {
  /**
   * 当前数据库版本，在打开数据库后记录
   */
  protected currentVersion?: string;

  /**
   * 构造函数
   * @param dbname 数据库名称（需要外界决定打开哪个数据库时可用）
   */
  constructor(public dbname?: string, public flag?: string){}

  /**
   * 创建或打开数据库（已创建就直接打开，没创建就先创建再打开)
   */
  abstract createOrOpenDB(): Promise<DBSchedulable>;
  /**
   * 关闭数据库
   */
  abstract closeDB(): Promise<any>;
  /**
   * 删除数据库
   */
  abstract deleteDB(): Promise<any>;

  /**
   * 数据库变迁版本号记录 📝
   */
  abstract get migrationVersionList(): string[];

  abstract get databaseName(): string;
}

// 抽象数据表
export abstract class DBTable {

  /**
   * 数据表构造函数
   * @param scheduler SQL 执行者
   * @param flag 数据库标识（用来对同一个表结构做区分创建，在返回tableName的时候用上）
   */
  constructor(public scheduler: DBSchedulable, public flag?: string) {}

  /**
   * 数据表名称
   */
  abstract get tableName(): string;
  /**
   * 使用中的主键，例如用于默认查询、更新或删除等
   */
  abstract get usingPrimaryKey(): DBField<any>;

  /**
   * 返回对应升级的版本操作
   * @param version 对应升级版本
   * @return sql 命令数组
   */
  abstract tableUpgradeMigrationSteps(version: string): DBCommand[] | undefined;

  /**
   * 返回对应降级的版本操作
   * @param version 对应降级版本
   * @return sql 命令数组
   */
  abstract tableDowngradeMigrationSteps(version: string): DBCommand[] | undefined;

  /**
   * 输出字典格式
   * @param fields 待输出的字段数组
   * @returns 字典格式数据
   */
  toMap(fields = this.dequeueAvailableFieldsForVersion()): Map<string, any> {
    const map: Map<string, any> = new Map()
    fields.forEach((field) => {
      map.set(field.name, field.value)
    })
    return map
  }

  // ----------------------------------- Generate sql command ---------------------------------------
  /**
   * 创建数据表
   * @param fields 表字段数组
   * @returns sql命令
   */
  createCommand(fields: DBField<any>[]): DBCreate {
    return new DBCreate(this, fields)
  }

  /**
   * 创建索引
   * @param field 字段
   * @returns sql命令
   */
  indexedCommand(field: DBField<any>): DBCommand {
    return new DBIndexed(this).createForField(field)
  }

  /**
   * 插入一行数据
   * @param fields 表字段数组
   * @returns sql命令
   */
  insertCommand(fields = this.dequeueAvailableFieldsForVersion()): DBInsert {
    return new DBInsert(this, fields)
  }

  /**
   * 更新一行数据
   * @param fields 表字段数组
   * @param where where 语句
   * @returns sql命令
   */
  updateCommand(fields = this.dequeueAvailableFieldsForVersion(), where = this.primaryKeyWhereStatement()): DBUpdate {
    return new DBUpdate(this, fields, where)
  }

  /**
   * 删除一行数据
   * @param where where 语句
   * @returns sql命令
   */
  deleteCommand(where: DBWhereStatement = this.primaryKeyWhereStatement()): DBDelete {
    return new DBDelete(this, where)
  }

  /**
   * 查询数据表
   * @param page 页数
   * @param size 每页数据条数
   * @param orderByFields 指定排序的字段
   * @param descending 是否按降序排序
   * @returns sql命令
   */
  queryCommand(page = 1, size = 20, orderField = this.usingPrimaryKey, descending = false): DBQuery {
    return new DBQuery(this).orderBy(orderField, descending).paged(page, size)
  }

  // ----------------------------------- Execute sql command ---------------------------------------
  /**
   * 执行插入命令
   * @param cmd sql 命令
   * @returns 执行结果
   */
  async executeInsert(cmd = this.insertCommand()): Promise<any> {
    return this.scheduler.executeCommand(cmd)
  }

  /**
   * 执行删除命令
   * @param cmd sql 命令
   * @returns 执行结果
   */
  async executeDelete(cmd = this.deleteCommand()): Promise<any> {
    return this.scheduler.executeCommand(cmd)
  }

  /**
   * 执行更新操作
   * @param cmd sql 命令
   * @returns 执行结果
   */
  async executeUpdate(cmd = this.updateCommand()): Promise<any> {
    return this.scheduler.executeCommand(cmd)
  }

  /**
   * 执行查询操作
   * @param cmd sql 命令
   * @returns 执行结果（这里用到了 scheduler 的 unpackQuery 方法解包查询结果）
   */
  async executeQuery(cmd = this.queryCommand()): Promise<any[]> {
    const result = await this.scheduler.executeCommand(cmd)
    return this.scheduler.unpackQuery(result)
  }

  /**
   * 取出该版本号将要添加的字段
   * @param version 版本号
   * @returns 字段数组
   */
  dequeueWillAddFieldsForVersion(version: string): DBField<any>[] {
    return this.dequeueFieldsForCondition( field => field.isAddForVersion(version) )
  }

  /**
   * 取出该版本号将要移除的字段
   * @param version 版本号
   * @returns 字段数组
   */
  dequeueWillRemoveFieldsForVersion(version: string): DBField<any>[] {
    return this.dequeueFieldsForCondition( field => field.isRemoveForVersion(version) )
  }

  /**
   * 取出该版本号可用的所有字段
   * @param version 版本号
   * @returns 字段数组
   */
  dequeueAvailableFieldsForVersion(version = this.scheduler.usingVersion()): DBField<any>[] {
    return this.dequeueFieldsForCondition( field => field.isAvailableForVersion(version) )
  }

  dequeueFieldsForCondition(condition: (condition: DBField<any>) => boolean): DBField<any>[] {
    const fields = []
    for (const key in this) {
      const field = this[key]
      if (field instanceof DBField) {
        if ( condition(field) ) {
          fields.push(field)
        }
      }
    }
    return fields
  }

  /**
   * 拼装主键的where sql语句
   * @param pk 主键
   * @returns 主键的sql语句
   */
  primaryKeyWhereStatement(pk = this.usingPrimaryKey): DBWhereStatement {
    return new DBWhereStatement(this).field(pk).equalTo(pk.value ?? 1)
  }
}
