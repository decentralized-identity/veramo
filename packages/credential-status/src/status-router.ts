import {
    CredentialStatus,
    CredentialStatusGenerateArgs,
    CredentialStatusReference,
    CredentialStatusRequestArgs,
    CredentialStatusUpdateArgs,
    IAgentContext,
    IAgentPlugin,
    IAgentPluginSchema,
    ICheckCredentialStatusArgs,
    ICredentialStatusRouter,
    IResolver,
    VerifiableCredential,
} from "@veramo/core";
import { ICredentialIssuer } from "@veramo/credential-w3c";
import { AbstractStatusMethod } from "./abstract-status-method";
import { AbstractStatusStorage } from "./abstract-status-storage";

/**
 * Agent plugin that implements {@link @veramo/core#ICredentialStatusRouter} interface
 * @public
 */
export class CredentialStatusRouter implements IAgentPlugin {
    /**
     * Plugin methods
     * @public
     */
    readonly methods: ICredentialStatusRouter
    readonly schema?: IAgentPluginSchema | undefined

    private statusMethods: Record<string, AbstractStatusMethod>
    // Beta: Default status method that bypasses the router
    private defaultStatusMethod: string
    // Beta: Instantiate a default storage method
    private storage?: AbstractStatusStorage

    constructor(options: {
        statusMethods: Record<string, AbstractStatusMethod>
        defaultStatusMethod: string
        storage?: AbstractStatusStorage
    }) {
        this.statusMethods = options.statusMethods
        this.defaultStatusMethod = options.defaultStatusMethod
        this.storage = options.storage
        this.methods = {
            statusRouterGetStatusMethods: this.statusRouterGetStatusMethods.bind(this),
            statusRouterCheckStatus: this.statusRouterCheckCredentialStatus.bind(this),
            statusRouterGenerateStatus: this.statusRouterGenerateStatus.bind(this),
            statusRouterParseStatus: this.statusRouterParseStatus.bind(this),
            statusRouterUpdateStatus: this.statusRouterUpdateStatus.bind(this),
        }
    }

    private getStatusMethod(statusReference: CredentialStatusReference): AbstractStatusMethod {
        let statusMethod: AbstractStatusMethod | undefined = this.statusMethods[statusReference.type]
        if (!statusMethod) {
            throw new Error(`invalid_argument: unrecognized method ${statusReference.type}`)
        }
        return statusMethod
    }

    /** {@inheritDoc @veramo/core#ICredentialStatusRouter.statusRouterGetStatusMethods} */
    async statusRouterGetStatusMethods(): Promise<string[]> {
        return Object.keys(this.statusMethods)
    }

    /** {@inheritDoc @veramo/core#ICredentialStatusRouter.statusRouterCheckCredentialStatus} */
    async statusRouterCheckCredentialStatus(args: ICheckCredentialStatusArgs, context: IAgentContext<IResolver>): Promise<CredentialStatus> {
        const statusMethod = this.getStatusMethod(args.credential?.credentialStatus!)
        return statusMethod.checkCredentialStatus(args, context)
    }

    /** {@inheritDoc @veramo/core#ICredentialStatusRouter.statusRouterGenerateStatus} */
    async statusRouterGenerateStatus(args: CredentialStatusGenerateArgs): Promise<CredentialStatusReference> {
        const statusMethod = this.getStatusMethod({ id: '', type: args.type } as CredentialStatusReference)
        return statusMethod.credentialStatusGenerate(args)
    }

    /** {@inheritDoc @veramo/core#ICredentialStatusRouter.statusRouterParseStatus} */
    async statusRouterParseStatus(args: CredentialStatusRequestArgs, context: IAgentContext<ICredentialIssuer>): Promise<VerifiableCredential> {
        const statusMethod = this.getStatusMethod(args.credential.credentialStatus)
        return statusMethod.credentialStatusRead(args, context)
    }

    /** {@inheritDoc @veramo/core#ICredentialStatusRouter.statusRouterUpdateStatus} */
    async statusRouterUpdateStatus(args: CredentialStatusUpdateArgs): Promise<any> {
        const statusMethod = this.getStatusMethod(args.vc.credentialStatus!)
        return statusMethod.credentialStatusUpdate(args)
    }
}