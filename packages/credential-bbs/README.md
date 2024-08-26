# BBS Veramo Plugin and Credential Provider

This plugin implements a verifiable credential provider with BBS signature.
This provider enables the issuing of credentials and the generation of presentations from BBS signatures.

It also offers the ability to verify credentials and presentations. 

This type of credential allows the holder to share credentials containing only a selected portion of the original VC data through selective disclosure, giving the holders real control over which data is shared.

The plugin extends the Veramo agent with the functionality of createSelectiveDisclosureCredentialBbs and verifyDerivedProofBbs.

This implementation is built on top of the jsonld-signatures-bbs libraries provided by mattrglobal [https://github.com/mattrglobal/jsonld-signatures-bbs](https://github.com/mattrglobal/jsonld-signatures-bbs)

### Build BBS Veramo Plugin locally


Install dependencies

```bash
npm -g i pnpm
pnpm install
```

Build

```bash
pnpm build
```

Run the tests

```bash
pnpm test
```


If you are running Visual Studio Code, there are some launch configurations available that can be used as template for
step by step debugging.

