import { Proof } from "@cashu/cashu-ts";
import {
  Event,
  EventTemplate,
  finalizeEvent,
  generateSecretKey,
  SimplePool,
} from "nostr-tools";
import { DEFAULT_RELAYS, NOSTR_HEX_PUBKEY, SERVER_SECRET_KEY } from "./config";

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
      DEFAULT_RELAYS,
      [
        {
          kinds: [10019],
          authors: [NOSTR_HEX_PUBKEY],
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
  const eventTemplate: EventTemplate = {
    kind: 9321,
    content: "Forwarded nut-bridge zap!",
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ...proofTags,
      ["p", NOSTR_HEX_PUBKEY],
      ["u", "https://mint.minibits.cash/Bitcoin"],
    ],
  };
  const event = finalizeEvent(eventTemplate, SERVER_SECRET_KEY);
  const pub = pool.publish(DEFAULT_RELAYS, event);
  return Promise.any(pub);
}
