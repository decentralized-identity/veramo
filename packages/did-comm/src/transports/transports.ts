import 'cross-fetch/polyfill'
import Debug from 'debug'
import { v4 as uuidv4 } from 'uuid'
import { IPackedDIDCommMessage } from '../action-handler'

const debug = Debug('veramo:did-comm:transports')

export interface IDIDCommTransportResult {
    result?: string
    error?: string
}

export interface IDIDCommTransport {

    id: string
    type: string

    isServiceSupported(service: any) : boolean    
    send(invocation: IDIDCommTransportInvocation, message: string) : Promise<IDIDCommTransportResult>
    generateInvocation(service: any) : IDIDCommTransportInvocation
}

export abstract class AbstractDIDCommTransport implements IDIDCommTransport {

    id: string
    type: string

    constructor(type: string, id?: string) {
        this.id = id || uuidv4()
        this.type = type
    }

    abstract isServiceSupported(service: any) : boolean
    abstract send(invocation: IDIDCommTransportInvocation, message: string) : Promise<IDIDCommTransportResult>
    abstract generateInvocation(service: any) : IDIDCommTransportInvocation
}

export interface IDIDCommTransportInvocation {
    id: string
    transport: IDIDCommTransport

    invoke(message: IPackedDIDCommMessage) : Promise<IDIDCommTransportResult>
}

export abstract class AbstractDIDCommTransportInvocation {
    id: string
    transport: IDIDCommTransport

    constructor(transport: IDIDCommTransport, id?: string) {
        this.id = id || uuidv4()
        this.transport = transport
    }

    async invoke(message: IPackedDIDCommMessage) : Promise<IDIDCommTransportResult> {
        return this.transport.send(this, message.message)
    }
}

export class DIDCommHttpTransportInvocation extends AbstractDIDCommTransportInvocation {

    httpMethod: string
    endpoint: string
    // headers
    // mode
    // ...

    constructor(transport: DIDCommHttpTransport, endpoint: string, httpMethod?: 'post' | 'get') {
        super(transport)
        this.httpMethod = httpMethod || 'post'
        this.endpoint = endpoint
    }
}

export class DIDCommHttpTransport extends AbstractDIDCommTransport {
    
    constructor() {
        super('DIDCOMM_HTTP_TRANSPORT_TYPE')
    }

    isServiceSupported(service: any) {        
        return (            
            typeof service.serviceEndpoint === 'string' && 
            (service.serviceEndpoint.startsWith('http://') || service.serviceEndpoint.startsWith('https://')))
    }
    
    generateInvocation(service: any) : IDIDCommTransportInvocation {
        let invocation = new DIDCommHttpTransportInvocation(this, service.serviceEndpoint)
        return invocation
    }

    async send(invocation: DIDCommHttpTransportInvocation, message: string) : Promise<IDIDCommTransportResult> {        
        try {
            const response = await fetch(invocation.endpoint, {
                method: invocation.httpMethod,
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

