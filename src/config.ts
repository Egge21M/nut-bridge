import { generateSecretKey } from "nostr-tools";

export const USERNAME = "egge";
export const PORT = process.env.PORT || 8080;
export const HOSTNAME = "https://nutzap.cash";
export const MINT_URL = "https://mint.minibits.cash/Bitcoin";

export const NOSTR_HEX_PUBKEY =
  "0a2f6049f3f237f71baf0ec90b2cd2b5ce52621adaba03fa9b84b212ed56022d";

export const MIN_AMOUNT = 1000;
export const MAX_AMOUNT = 10000;

export const DEFAULT_RELAYS = [
  "wss://relay.primal.net",
  "wss://relay.damus.io",
  "wss://relay.f7z.io",
  "wss://nos.lol",
];

export const SERVER_SECRET_KEY = generateSecretKey();
