export abstract class AbstractStatusStorage {
    abstract get(key: string): Promise<string | undefined>
    abstract set(key: string, value: string): Promise<void>
    abstract keys(): Promise<string[]>
}