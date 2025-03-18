import { generateSecretKey, getPublicKey } from "nostr-tools";

export const USERNAME = process.env.USERNAME;
export const PORT = process.env.PORT || 8080;
export const HOSTNAME = process.env.HOSTNAME;
export const MINT_URL = "https://mint.minibits.cash/Bitcoin";

export const NOSTR_HEX_PUBKEY =
  "0a2f6049f3f237f71baf0ec90b2cd2b5ce52621adaba03fa9b84b212ed56022d";

export const MIN_AMOUNT = process.env.MIN_AMOUNT;
export const MAX_AMOUNT = process.env.MAX_AMOUNT;

export const DEFAULT_RELAYS = [
  "wss://relay.primal.net",
  "wss://relay.damus.io",
  "wss://relay.f7z.io",
  "wss://nos.lol",
];

export const SERVER_SECRET_KEY = generateSecretKey();
export const SERVER_PUBLIC_KEY = getPublicKey(SERVER_SECRET_KEY);
