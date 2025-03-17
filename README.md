# nut-bridge

> [!WARNING]
> This is a work in progress

nut-bridge is bridging the gap between NIP-57 Zaps and NIP-61 NutZaps by providing a LNURL server that will receive payments via a Lightning Address and then turn them into a nut zap.

## Running the server

Configure the server as you see fit via the `src/config.ts` file. Then run:

```sh
npm i
npm run build
npm run start
```
