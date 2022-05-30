[![Discord](https://img.shields.io/discord/878293684620234752?logo=discord&logoColor=white&style=flat-square)](https://discord.gg/huwyNfVkhe)
![Twitter Follow](https://img.shields.io/twitter/follow/veramojs?logo=twitter&style=flat-square)
[![Build, Test and Publish](https://github.com/uport-project/veramo/workflows/Build,%20Test%20and%20Publish/badge.svg?branch=next)](https://github.com/uport-project/veramo/actions?query=workflow%3A%22Build%2C+Test+and+Publish%22)
[![codecov](https://codecov.io/gh/uport-project/veramo/branch/next/graph/badge.svg)](https://codecov.io/gh/uport-project/veramo)

# Veramo

Veramo is a JavaScript Framework for Verifiable Data that was designed to be flexible and modular which makes it an easy
fit for a lot of complex workflows.

Create an agent, add plugins, run on a server or a frontend or mobile, or all of them combined. Veramo runs on Node,
Browsers, and React Native straight out of the box. Save time by using the same API across all platforms.

Veramo is a core + some plugins. The core provides an entry point into the API, glues the plugins together and allows
them to interoperate. Depending on which plugins you use, your instance of Veramo (your agent) can perform a variety of
roles:

* Create and manage keys for signing and encryption
* Create and manage Decentralized Identifiers (DID)
* Issue Verifiable Credentials (VCs) and Presentations (VPs)
* Verify such VCs and VPs
* Present credentials using Selective Diclosure
* Communicate with other agents using DIDComm (or other protocols)
* Receive, filter, store and serve data
* Control other agents remotely, or act as a proxy for them
* ...whatever else you can think of

## Documentation

See the full docs on [veramo.io](https://veramo.io)

- Agent
    - [Intro](https://veramo.io/docs/veramo_agent/introduction)
    - [Plugins](https://veramo.io/docs/veramo_agent/plugins)
- Guides
    - [CLI](https://veramo.io/docs/veramo_agent/cli_tool)
    - [Node](https://veramo.io/docs/node_tutorials/node_setup_identifiers)
    - [React](https://veramo.io/docs/react_tutorials/react_setup_resolver)
    - [React Native](https://veramo.io/docs/react_native_tutorials/react_native_setup_identifers)
    - [Custom Plugin](https://github.com/uport-project/veramo-plugin) (template repository)
- Advanced
    - [Event System](https://veramo.io/docs/veramo_agent/event_system)

Also, there are a few examples and code samples that you can get from
the [integration test suite](https://github.com/uport-project/veramo/tree/next/__tests__/shared).

## Contributing

This repository contains the [Veramo core package](https://github.com/uport-project/veramo/tree/next/packages/core),
which only becomes relevant when you add plugins to it. These plugins can be developed by anyone and Veramo provides is
the glue that can make them interoperate.

We maintain some "core" plugins in this monorepo to provide some functionality "out of the box", but a lot more can be
done than is present in this codebase. We encourage you to contribute feedback and fixes for everything that you see
here, as well as posting about your own plugins or projects on
our [Discussions page](https://github.com/uport-project/veramo/discussions/categories/show-and-tell) or on
our [Discord server](https://discord.gg/AEtRtyntEC).

Our [documentation site](https://veramo.io/) is also open-source, and we invite you to contribute feedback and
fixes [there](https://github.com/uport-project/veramo-website) as well.

### Build Veramo locally

This monorepo uses [yarn](https://yarnpkg.com/) [workspaces](https://classic.yarnpkg.com/en/docs/workspaces/)
and [lerna](https://lerna.js.org/)

Install dependencies

```bash
yarn install
yarn bootstrap
```

Build

```bash
yarn build
```

Run the tests

```bash
yarn test
```

```bash
yarn test:watch
```

If you are running Visual Studio Code, there are some launch configurations available that can be used as template for
step by step debugging.

### Building a plugin

If you intend to write a plugin, we have made
a [plugin template repository](https://github.com/uport-project/veramo-plugin) that can be used to get you started. It
is preconfigured with GitHub Actions for checks and automatic updates using renovate-bot so that your plugin can keep in
sync with the cutting edge versions of Veramo and notify you if upcoming API changes are breaking anything. Of course,
this automation will depend on the tests you write for your new plugin.

Depending on what functionality you intend to develop, some code from the template can be safely removed. The embedded
comments should guide you, but if something does not make sense, please reach out.

## Let's make it better

This framework can be used to build permissionless collaboration tools for the world. This is not an easy task, and we
have a much greater chance of improving the world if we work together.

Share your feedback, your fixes, your plugins and your tools so that others may build better and better stuff based on
them.
