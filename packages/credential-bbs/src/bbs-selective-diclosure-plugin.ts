import { IAgentPlugin, VerifiableCredential} from '@veramo/core-types'
import { OrPromise, RecordLike} from '@veramo/utils'
import { IAgentContext, IPluginMethodMap } from '@veramo/core';

import pkg from 'jsonld-signatures';
const { purposes } = pkg;

import { BbsCredentialModule } from './bbs-credential-module.js';
import { BbsContextLoader } from './bbs-context-loader.js';
import { BbsSuiteLoader } from './bbs-suite-loader.js';
import { RequiredAgentMethods, VeramoBbsSignature } from './bbs-suites.js';
import { ICreateBbsSelectiveDisclosureCredentialArgs, IVerifyBbsDerivedProofCredentialArgs, ContextDoc} from './types.js'

export class BbsSelectiveDisclosureCredentialPlugin implements IAgentPlugin {
  readonly methods: IPluginMethodMap 
  private bbsCredentialModule: BbsCredentialModule

  constructor(options: { contextMaps: RecordLike<OrPromise<ContextDoc>>[]; suites: VeramoBbsSignature[] }) {
    this.bbsCredentialModule = new BbsCredentialModule({
      bbsContextLoader: new BbsContextLoader({ contextsPaths: options.contextMaps }),
      bbsSuiteLoader: new BbsSuiteLoader({ veramoBbsSignatures: options.suites }),
    })
    this.methods = {
      createSelectiveDisclosureCredentialBbs: this.createSelectiveDisclosureCredentialBbs.bind(this),
      verifyDerivedProofBbs: this.verifyDerivedProofBbs.bind(this)
    }
  }

  public async createSelectiveDisclosureCredentialBbs(
    args: ICreateBbsSelectiveDisclosureCredentialArgs,
    context: IAgentContext<RequiredAgentMethods>
  ): Promise<VerifiableCredential> {
    let { now } = args
    if (typeof now === 'number') {
      now = new Date(now * 1000)
    }
    return await this.bbsCredentialModule.signSelectiveDisclosureCredential({ proofDocument: args.proofDocument, revealDocument: args.revealDocument, options: args }, { ...args, now }, context)
  }

  public async verifyDerivedProofBbs(
    args: IVerifyBbsDerivedProofCredentialArgs,
    context: IAgentContext<RequiredAgentMethods>,
  ): Promise<boolean> {
    let { now } = args
    if (typeof now === 'number') {
      now = new Date(now * 1000)
    }
    return await this.bbsCredentialModule.verifyDerivedProofBbs({ credential: args.credential, purpose: new purposes.AssertionProofPurpose() }, { ...args, now }, context)

  }
}

