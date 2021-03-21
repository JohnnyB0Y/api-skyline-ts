//  migration.ts
//
//
//  Created by JohnnyB0Y on 2021/03/01.
//  Copyright © 2021 JohnnyB0Y. All rights reserved.

import { DBField, FieldType, DBSchedulable } from "./base"
import { DBTable } from "./core"
import { DBCommand, DBQuery } from "./command"

// 版本管理
export class DBVersionTable extends DBTable {
  readonly fid = new DBField<number>('id', FieldType.integer, '1').primaryKey().autoIncrement()
  readonly fversion = new DBField<string>('migration_version', FieldType.text, '1').notNull()
  protected isFirstCreate = false // 第一次创建？

  get tableName(): string { return '_db_version_table' }
  get usingPrimaryKey(): DBField<number> { return this.fid }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  tableUpgradeMigrationSteps(version: string): DBCommand[] | undefined {
    if (this.isFirstCreate) {
      const fields = this.dequeueWillAddFieldsForVersion('1')
      return [this.createCommand(fields)]
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  tableDowngradeMigrationSteps(version: string): DBCommand[] | undefined {
    return undefined
  }

  async fetchMigrationVersion(): Promise<string | undefined> {
    try {
      const cmd = new DBQuery(this, [this.fversion], this.primaryKeyWhereStatement())
      const items = await this.executeQuery(cmd)
      return items[0][this.fversion.name]
    } catch (err) {
      // 获取数据库版本出错，统一记作第一次创建数据库
      this.isFirstCreate = true
      return undefined
    }
  }

  async updateMigrationVersion(version: string): Promise<any> {
    this.fversion.value = version
    return this.executeUpdate(this.updateCommand([this.fversion]))
  }

  async insertMigrationVersion(version: string): Promise<any> {
    this.fversion.value = version
    const result = await this.executeInsert()
    this.isFirstCreate = false
    return result
  }
}


// 数据库版本迁移工具
export class DBMigrator {
  protected currentVersion?: string
  protected versionTable: any

  constructor(public scheduler: DBSchedulable, public tables: DBTable[]) {
    this.versionTable = this.usingVersionTable()
    tables.unshift(this.versionTable)
  }

  /**
   * 当前需要使用的版本表
   * @returns 迁移版本表
   */
  protected usingVersionTable(): any {
    return new DBVersionTable(this.scheduler)
  }

  /**
   * 获取数据库当前旧版本
   */
  protected async fetchMigrationVersion(): Promise<string | undefined> {
    return this.versionTable?.fetchMigrationVersion()
  }

  /**
   * 更新数据库版本
   */
  protected async updateMigrationVersion(version: string): Promise<any> {
     if (this.versionTable?.isFirstCreate) {
      return await this.versionTable?.insertMigrationVersion(version)
     }
     else {
      return await this.versionTable?.updateMigrationVersion(version)
     }
   }

  /**
   * 取出迁移步骤命令
   * @param version 对应版本
   * @param upgrade 是否升级？
   * @returns 命令数组
   */
  protected dequeueMigrationSteps(version: string, isUpgrade: boolean): DBCommand[] {
    let commands: DBCommand[] = []
    this.tables.forEach(t => {
      const cmds = isUpgrade ? t.tableUpgradeMigrationSteps(version) : t.tableDowngradeMigrationSteps(version)
      if (cmds !== undefined) {
        commands = commands.concat(cmds)
      }
    })
    return commands
  }

  /**
   * 执行版本迁移（这里使用事务，如果某个命令执行失败，将全部回滚。可以派生子类进行自定义操作。）
   * @param versionList 需要操作版本号数组
   * @param isUpgrade 是否升级？
   * @returns 最终版本号
   */
  protected async executeMigrationAllSteps(versionList: string[], isUpgrade: boolean): Promise<string> {
    for (let i = 0; i < versionList.length; i++) {
      const version = versionList[i];
      try {
        const cmds = this.dequeueMigrationSteps(version, isUpgrade)
        await this.scheduler.executeTransaction(cmds)
        console.log('Database upgrade success: ', version)
        this.updateMigrationVersion(version)
        this.currentVersion = version // 更新当前版本号
      } catch (err) {
        console.log('Database upgrade failure:', version, err)
        return this.currentVersion ?? ''
      }
    }
    return this.currentVersion ?? ''
  }

  /**
   * 检测是否执行数据库版本迁移
   * @param versionList 历史版本号数组
   * @returns 最终版本号
   */
  async executeMigrationStepsOrNot(versionList: string[]): Promise<string> {
    const oldVersion = await this.fetchMigrationVersion()
    const newVersion = versionList[versionList.length - 1]
    this.currentVersion = oldVersion
    console.log(`ExecuteMigrationStepsOrNot old version: ${oldVersion}, new version: ${newVersion}`)

    if (oldVersion === newVersion) { // 版本相等，什么都不用做
      return oldVersion
    }

    if (oldVersion === undefined) { // 数据库第一次创建，那么从 oldVersion 一步步升级到 newVersion
      return await this.executeMigrationAllSteps(versionList, true)
    }

    const migrationVersions: string[] = []
    let isUpgrade = true
    const start = versionList.indexOf(oldVersion)
    const end = versionList.indexOf(newVersion)
    if (Number(oldVersion) < Number(newVersion)) { // 版本过旧，升级
      versionList.forEach((v, idx) => {
        if (idx > start && idx <= end) {
          migrationVersions.push(v)
        }
      })
    }
    else if (Number(oldVersion) > Number(newVersion)) { // 版本过新，降级
      isUpgrade = false
      for (let idx = versionList.length - 1; idx >= 0; idx--) {
        if (idx < start && idx >= end) {
          migrationVersions.push(versionList[idx])
        }
      }
    }

    return await this.executeMigrationAllSteps(migrationVersions, isUpgrade)
  }
}
