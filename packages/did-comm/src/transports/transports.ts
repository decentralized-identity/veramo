import 'cross-fetch/polyfill'
import { v4 as uuidv4 } from 'uuid'

export interface IDIDCommTransportResult {
    result?: string
    error?: string
}

export interface IDIDCommTransport {

    id: string

    isServiceSupported(service: any) : boolean
    send(service: any, message: string) : Promise<IDIDCommTransportResult>
}

export abstract class AbstractDIDCommTransport implements IDIDCommTransport {

    id: string

    constructor(id?: string) {
        this.id = id || uuidv4()
    }

    abstract isServiceSupported(service: any) : boolean
    abstract send(service: any, message: string) : Promise<IDIDCommTransportResult>
}

export class DIDCommHttpTransport extends AbstractDIDCommTransport {
    
    httpMethod: 'post' | 'get'

    constructor(httpMethod?: 'post' | 'get') {
        super()
        this.httpMethod = httpMethod || 'post'
    }

    isServiceSupported(service: any) {        
        // FIXME: TODO: addtionally handle serviceEndpoint objects in did docs
        return (            
            typeof service.serviceEndpoint === 'string' && 
            (service.serviceEndpoint.startsWith('http://') || service.serviceEndpoint.startsWith('https://')))
    }

    async send(service: any, message: string) : Promise<IDIDCommTransportResult> {
        try {
            const response = await fetch(service.serviceEndpoint, {
                method: this.httpMethod,
                body: message
            })

            let result
            if (response.ok) {
                result = {
                    result: 'successfully send message: ' + response.statusText
                }
            } else {
                result = {
                    error: 'failed to send message: ' + response.statusText
                }
            }
            return result
        } catch (e) {
            return {
                error: 'failed to send message: ' + e
            }
        }
    }
}

