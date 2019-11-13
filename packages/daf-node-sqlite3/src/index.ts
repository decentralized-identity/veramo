import sqlite3 from 'sqlite3'
import { Types } from 'daf-data-store'

export class NodeSqlite3 implements Types.DbDriver {
  private db: any

  constructor(filename: string) {
    this.db = new sqlite3.Database(filename)
  }

  run(sql: string, params: any): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params || [], function(err: any, result: any) {
        if (err) reject(err)
        // resolve(this.changes ? true : false)
        resolve(true) // TODO: Fix this
      })
    })
  }

  rows(sql: string, params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params || [], (err: any, result: any) => {
        if (err) reject(err)
        resolve(result)
      })
    })
  }
}
