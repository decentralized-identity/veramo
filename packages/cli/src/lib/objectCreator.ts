import { set, get } from 'jsonpointer'
import parse from 'url-parse'
const { resolve } = require('path')

export function createObjects(config: object, pointers: Record<string, string>): any {
  const objects = {}

  function resolveRefs(input: any): any {
    if (Array.isArray(input)) {
      const resolved = []
      for (const item of input) {
        resolved.push(resolveRefs(item))
      }
      return resolved
    }

    if (typeof input === 'object') {
      const resolved: any = {}
      for (const property in input) {
        if (input.hasOwnProperty(property)) {
          if (property === '$ref') {
            const pointer = input[property]
            return objectFromPointer(pointer)
          } else if (property === '$require') {
            return objectFromConfig(input)
          } else if (property === '$env') {
            return process.env[input[property]]
          } else {
            resolved[property] = resolveRefs(input[property])
          }
        }
      }
      return resolved
    }

    return input
  }

  function objectFromConfig(objectConfig: any) {
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

    const resolvedArgs = args !== undefined ? resolveRefs(args) : []
    try {
      let required = member ? require(module)[member] : require(module)
      if (type === 'class') {
        object = new required(...resolvedArgs)
      } else if (type === 'function') {
        object = required(...resolvedArgs)
      } else if (type === 'object') {
        object = required
      }
    } catch (e) {
      throw new Error(`Error creating ${module}['${member}']: ${e.message}`)
    }
    if (pointer) {
      return get(object, pointer)
    }
    return object
  }

  function objectFromPointer(pointer: string) {
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
          object = objectFromConfig(objectConfig)
        } else if (objectConfig['$env']) {
          object = process.env[objectConfig['$env']]
        } else {
          object = resolveRefs(objectConfig)
        }
        set(objects, pointer, object)
        return object
      } catch (e) {
        throw Error(e.message + '. While creating object from pointer: ' + pointer)
      }
    }
  }

  const result: any = {}
  for (const key of Object.keys(pointers)) {
    if (pointers.hasOwnProperty(key)) {
      result[key] = objectFromPointer(pointers[key])
    }
  }
  return result
}
