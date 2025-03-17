import { Proof } from "@cashu/cashu-ts";
import {
  Event,
  EventTemplate,
  finalizeEvent,
  generateSecretKey,
  SimplePool,
} from "nostr-tools";

const defaultRelays = [
  "wss://relay.primal.net",
  "wss://relay.damus.io",
  "wss://relay.f7z.io",
  "wss://nos.lol",
];

const pool = new SimplePool();

class NutWalletManager {
  private nutZapPubkey?: string;

  async init() {
    const walletEvent = await getWalletInfoEvent();
    console.log(walletEvent);
    const pubkeyTag = walletEvent.tags.find((t) => t[0] === "pubkey");
    if (!pubkeyTag || typeof pubkeyTag[1] !== "string") {
      return "02" + walletEvent.pubkey;
    }
    this.nutZapPubkey = pubkeyTag[1];
  }
  get pubkey() {
    return this.nutZapPubkey;
  }
}

export const nutWalletManager = new NutWalletManager();

export async function getWalletInfoEvent() {
  return new Promise<Event>((res, rej) => {
    const allEvents: Event[] = [];
    pool.subscribeMany(
      defaultRelays,
      [
        {
          kinds: [10019],
          authors: [
            "0a2f6049f3f237f71baf0ec90b2cd2b5ce52621adaba03fa9b84b212ed56022d",
          ],
        },
      ],

      {
        onevent: (e) => {
          console.log(e);
          allEvents.push(e);
        },
        oneose: () => {
          if (allEvents.length === 0) {
            rej();
          }
          res(allEvents.sort((a, b) => b.created_at - a.created_at)[0]);
        },
      },
    );
  });
}

export async function publishNutZap(proofs: Proof[]) {
  const proofTags = proofs.map((p) => ["proof", JSON.stringify(p)]);
  const sk = generateSecretKey();
  const eventTemplate: EventTemplate = {
    kind: 9321,
    content: "Forwarded nut-bridge zap!",
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ...proofTags,
      ["p", "0a2f6049f3f237f71baf0ec90b2cd2b5ce52621adaba03fa9b84b212ed56022d"],
      ["u", "https://mint.minibits.cash/Bitcoin"],
    ],
  };
  const event = finalizeEvent(eventTemplate, sk);
  console.log("Publish nutzap event", event);
  const pub = pool.publish(defaultRelays, event);
  return Promise.any(pub);
}
