/**
 * Checks if a variable is defined and not null
 * @param arg
 *
 * @beta
 */
export function isDefined<T>(arg: T): arg is Exclude<T, null | undefined> {
  return arg !== null && typeof arg !== 'undefined'
}

/**
 * Transforms an item or an array of items into an array of items
 * @param arg
 *
 * @beta
 */
export function asArray<T>(arg?: T | T[] | null): T[] {
  return isDefined(arg) ? (Array.isArray(arg) ? arg : [arg]) : []
}

/**
 * Checks if an object is iterable (can be used for `for..of`)
 * @param obj
 *
 * @beta
 */
export function isIterable<T>(obj: any): obj is Iterable<T> {
  return obj != null && typeof obj[Symbol.iterator] === 'function'
}
