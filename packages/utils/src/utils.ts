export function isDefined<T>(arg: T): arg is Exclude<T, null | undefined> {
  return arg !== null && typeof arg !== 'undefined'
}

export function asArray<T>(arg: T | T[]): T[] {
  return Array.isArray(arg) ? arg : [arg]
}
