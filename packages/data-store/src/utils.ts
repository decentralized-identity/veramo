import { DataSource } from 'typeorm'
import { OrPromise } from "@veramo/utils";

/**
 *  Ensures that the provided DataSource is connected.
 *
 * @param dbConnection - a TypeORM DataSource or a Promise that resolves to a DataSource
 */
export async function getConnectedDb(dbConnection: OrPromise<DataSource>): Promise<DataSource> {
  if (dbConnection instanceof Promise) {
    return await dbConnection
  } else if (!dbConnection.isInitialized) {
    return await (<DataSource>dbConnection).initialize()
  } else {
    return dbConnection
  }
}
