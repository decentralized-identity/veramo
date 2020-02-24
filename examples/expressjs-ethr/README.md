# DAF expressjs ethr-did example

## Install

```
yarn
yarn build
```

Install [ngrok](https://dashboard.ngrok.com/get-started)

## Start

Run ngrok

```
ngrok http 8099
```

Copy https url (ex `https://d99de57b.ngrok.io`)

```
HOST=https://d99de57b.ngrok.io PORT=8099 DEBUG=daf:* yarn start
```

This should fail with this message:

```
Error: Service endpoint not published. You probably need to send some ETH to did:ethr:rinkeby:0xc.....
```

To make it work, you need to send some ETH to that address
