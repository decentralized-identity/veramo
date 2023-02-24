import { set, get } from 'jsonpointer'
import parse from 'url-parse'
import { resolve } from 'path'

/**
 * Creates objects from a configuration object and a set of pointers.
 *
 * Example:
 * ```ts
 * const { url } = createObjects({ "rpcUrl": "http://localhost:8545", }, { url: '/rpcUrl' })
 * ```
 *
 * The config can contain references (`$ref`) to other objects within using JSON pointers.
 * Example:
 * ```json
 * {
 *   "rpcUrl": "http://localhost:8545",
 *   "endpoint": {
 *     "url": {
 *       "$ref": "/rpcUrl"
 *     }
 *   }
 * }
 * ```
 *
 * The config object can also contain references to NPM modules using the `$require` property.
 * Example:
 * ```json
 * {
 *   "agent": {
 *     "$require": "@veramo/core#Agent",
 *     "$args": {
 *       "plugins": [
 *         { "$require": "@veramo/did-comm#DIDComm" },
 *       ]
 *     }
 *   }
 * }
 * ```
 *
 * Environment variables can also be specified using the `$env` property.
 *
 * @see Please see {@link https://veramo.io/docs/veramo_agent/configuration_internals | Configuration Internals} for
 *   more information.
 *
 * @param config - The configuration object
 * @param pointers - A map of JSON pointers to objects within that config that you wish to create
 *
 * @beta - This API may change without a major version bump
 */
export async function createObjects(config: object, pointers: Record<string, string>): Promise<Record<string, any>> {
  const objects = {}

  async function resolveRefs(input: any): Promise<any> {
    if (Array.isArray(input)) {
      const resolved = []
      for (const item of input) {
        resolved.push(await resolveRefs(item))
      }
      return resolved
    }

    if (typeof input === 'object') {
      const resolved: any = {}
      for (const property in input) {
        if (input.hasOwnProperty(property)) {
          if (property === '$ref') {
            const pointer = input[property]
            return await objectFromPointer(pointer)
          } else if (property === '$require') {
            return await objectFromConfig(input)
          } else if (property === '$env') {
            return process.env[input[property]]
          } else {
            resolved[property] = await resolveRefs(input[property])
          }
        }
      }
      return resolved
    }

    return input
  }

  async function objectFromConfig(objectConfig: any): Promise<any> {
    let object
    // console.log('Requiring', objectConfig['$require'])
    const parsed = parse(objectConfig['$require'], {}, true)
    let module = parsed.pathname
    const member = parsed.hash.length > 1 ? parsed.hash.slice(1) : undefined
    const type = parsed.query['t'] || 'class'
    const pointer = parsed.query['p']
    const args = objectConfig['$args']
    // console.log({module, member, type, query: parsed.query})

    if (module.slice(0, 2) === './') {
      module = resolve(module)
    }

    const resolvedArgs = args !== undefined ? await resolveRefs(args) : []
    try {
      let required = member ? (await import(module))[member] : await import(module)
      if (type === 'class') {
        object = new required(...resolvedArgs)
      } else if (type === 'function') {
        object = required(...resolvedArgs)
      } else if (type === 'object') {
        object = required
      }
    } catch (e: any) {
      throw new Error(`Error creating ${module}['${member}']: ${e.message}`)
    }
    if (pointer) {
      return get(object, pointer)
    }
    return object
  }

  async function objectFromPointer(pointer: string) {
    const existingObject = get(objects, pointer)
    if (existingObject) {
      // console.log('Existing', pointer)
      return existingObject
    } else {
      // console.log('New', pointer)
      const objectConfig = get(config, pointer)
      if (!objectConfig) throw Error('Pointer not found: ' + pointer)
      try {
        let object
        if (objectConfig['$require']) {
          object = await objectFromConfig(objectConfig)
        } else if (objectConfig['$env']) {
          object = process.env[objectConfig['$env']]
        } else {
          object = await resolveRefs(objectConfig)
        }
        set(objects, pointer, object)
        return object
      } catch (e: any) {
        throw Error(e.message + '. While creating object from pointer: ' + pointer)
      }
    }
  }

  const result: any = {}
  for (const key of Object.keys(pointers)) {
    if (pointers.hasOwnProperty(key)) {
      result[key] = await objectFromPointer(pointers[key])
    }
  }
  return result
}
