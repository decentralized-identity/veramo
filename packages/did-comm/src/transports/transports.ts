import 'cross-fetch/polyfill'
import Debug from 'debug'

const debug = Debug('veramo:did-comm:transports')

export abstract class AbstractDIDCommTransport {
    id: string

    constructor(id: string) {
        this.id = id
    }

    getId() : string {
        return this.id
    }

    abstract sendRawMessage(message: string, options?: any) : Promise<boolean>
}

export class DIDCommHttpTransport extends AbstractDIDCommTransport {
    
    async sendRawMessage(message: string,
        options: { endpoint: string, headers?: string, method?: 'post' | 'get' }) : Promise<boolean> {

        const res = await fetch(options.endpoint, {
            method: options.method,
            body: message
        })

        if (res.status !== 200) {
            throw new Error(`Error while sending raw message:${res.status}`)
        }
        debug('Status', res.status, res.statusText)

        return (res.status == 200)
    }
}
  