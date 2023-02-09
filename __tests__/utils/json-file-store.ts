// noinspection ES6PreferShortImport

import {
  ClaimTableEntry,
  CredentialTableEntry,
  DiffCallback,
  PresentationTableEntry,
  VeramoJsonCache,
  VeramoJsonStore,
} from '../../packages/data-store-json/src'
import * as fs from 'fs'
import { IIdentifier, IMessage, ManagedKeyInfo } from '../../packages/core-types/src'
import { ManagedPrivateKey } from '../../packages/key-manager/src'

/**
 * A utility class that shows how a File based JSON storage system could work.
 * This is not recommended for large databases since every write operation rewrites the entire database.
 */
export class JsonFileStore implements VeramoJsonStore {
  notifyUpdate: DiffCallback
  dids: Record<string, IIdentifier>
  keys: Record<string, ManagedKeyInfo>
  privateKeys: Record<string, ManagedPrivateKey>
  credentials: Record<string, CredentialTableEntry>
  claims: Record<string, ClaimTableEntry>
  presentations: Record<string, PresentationTableEntry>
  messages: Record<string, IMessage>

  private constructor(private file: fs.PathLike) {
    this.notifyUpdate = async (oldState: VeramoJsonCache, newState: VeramoJsonCache) => {
      await this.save(newState)
    }
    this.dids = {}
    this.keys = {}
    this.privateKeys = {}
    this.credentials = {}
    this.claims = {}
    this.presentations = {}
    this.messages = {}
  }

  public static async fromFile(file: fs.PathLike): Promise<JsonFileStore> {
    const store = new JsonFileStore(file)
    return await store.load()
  }

  private async load(): Promise<JsonFileStore> {
    await this.checkFile()
    const rawCache = await fs.promises.readFile(this.file, { encoding: 'utf8' })
    let cache: VeramoJsonCache
    try {
      cache = JSON.parse(rawCache)
    } catch (e: any) {
      cache = {}
    }
    ;({
      dids: this.dids,
      keys: this.keys,
      credentials: this.credentials,
      claims: this.claims,
      presentations: this.presentations,
      messages: this.messages,
      privateKeys: this.privateKeys,
    } = {
      dids: {},
      keys: {},
      credentials: {},
      claims: {},
      presentations: {},
      messages: {},
      privateKeys: {},
      ...cache,
    })
    return this
  }

  private async save(newState: VeramoJsonCache): Promise<void> {
    await fs.promises.writeFile(this.file, JSON.stringify(newState), {
      encoding: 'utf8',
    })
  }

  private async checkFile() {
    const file = await fs.promises.open(this.file, 'w+')
    await file.close()
  }
}
