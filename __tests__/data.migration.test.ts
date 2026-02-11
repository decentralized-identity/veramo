// noinspection ES6PreferShortImport

import { KeyManagementSystem, SecretBox } from '../packages/kms-local/src'
import { Entities, KeyStore, migrations, PrivateKeyStore } from '../packages/data-store/src'
import { PrivateKeyStoreJson } from '../packages/data-store-json/src'

import { DataSource } from 'typeorm'
import * as fs from 'fs'

import { jest } from '@jest/globals'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

// @ts-ignore TS1343
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

jest.setTimeout(60000)

const dbEncryptionKey = '29739248cad1bd1a0fc4d9b75cd4d2990de535baf5caadfdf8d8f86664aa830c'

describe('data handling tests', () => {
  describe('can recompute p256 keys from old database', () => {
    const fixture = __dirname + '/fixtures/local-database-before-p256key-migration.sqlite'
    const databaseFile = fixture + '.tmp'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let dbConnection: any // typeorm types don't seem to follow semantic release patterns leading to type errors

    beforeAll(async () => {
      await fs.promises.copyFile(fixture, databaseFile)
      dbConnection = new DataSource({
        name: 'test',
        type: 'sqlite',
        database: databaseFile,
        synchronize: false,
        migrations: migrations,
        migrationsRun: true,
        logging: false,
        entities: Entities,
      })
    })

    afterAll(async () => {
      try {
        await dbConnection?.destroy()
      } catch (e: any) {
        // nop
      }
      try {
        await fs.promises.unlink(databaseFile)
      } catch (e: any) {
        // nop
      }
    })

    it('should recompute p256 keys', async () => {
      const kmsLocal = new KeyManagementSystem(
        new PrivateKeyStore(dbConnection, new SecretBox(dbEncryptionKey)),
      )
      const managedKeyStore = new KeyStore(dbConnection)
      // list known private keys. kms-local will compute the correct public keys
      const allPrivKeys = await kmsLocal.listKeys()
      const keyIds: string[] = []
      for (const privKey of allPrivKeys) {
        if (privKey.type === 'Secp256r1') {
          const managedKey = await managedKeyStore.getKey({ kid: privKey.kid })
          if (managedKey.publicKeyHex.length === 64) {
            keyIds.push(privKey.kid)
            managedKey.publicKeyHex = privKey.publicKeyHex
          }
          await managedKeyStore.importKey(managedKey)
        }
      }
      for (const kid of keyIds) {
        const managedKey = await managedKeyStore.getKey({ kid })
        expect(managedKey.publicKeyHex.length).toEqual(66)
        expect(managedKey.publicKeyHex).toMatch(/^(02|03).*/)
      }
    })
  })
  describe('kms-local maintains public key values for listKeys', () => {
    it('when using data-store-json', async () => {
      const memoryJsonStore = {
        notifyUpdate: () => Promise.resolve(),
      }
      const kmsLocal = new KeyManagementSystem(
        new PrivateKeyStoreJson(memoryJsonStore, new SecretBox(dbEncryptionKey)),
      )
      const key = await kmsLocal.createKey({ type: 'Secp256r1' })
      const allPrivKeys = await kmsLocal.listKeys()
      const foundKey = allPrivKeys.find((k) => k.kid === key.kid)
      expect(foundKey?.publicKeyHex).toEqual(key.publicKeyHex)
    })

    it('when using data-store', async () => {
      // typeorm types don't seem to follow semantic release patterns leading to type errors
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dbConnection: any = new DataSource({
        type: 'sqlite',
        database: ':memory:',
        entities: Entities,
        synchronize: false,
        migrations: migrations,
        migrationsRun: true,
        logging: false,
      })
      const kmsLocal = new KeyManagementSystem(
        new PrivateKeyStore(dbConnection, new SecretBox(dbEncryptionKey)),
      )
      const key = await kmsLocal.createKey({ type: 'Secp256r1' })
      const allPrivKeys = await kmsLocal.listKeys()
      const foundKey = allPrivKeys.find((k) => k.kid === key.kid)
      expect(foundKey?.publicKeyHex).toEqual(key.publicKeyHex)
    })
  })
})
