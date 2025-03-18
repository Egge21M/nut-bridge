import { Proof } from "@cashu/cashu-ts";
import {
  Event,
  EventTemplate,
  finalizeEvent,
  SimplePool,
  validateEvent,
} from "nostr-tools";
import { DEFAULT_RELAYS, NOSTR_HEX_PUBKEY, SERVER_SECRET_KEY } from "./config";
import { createTimeoutPromise } from "./utils";

export type VerifiedZapRequestData = {
  pTag: string;
  eTag?: string;
  relays: string[];
  amount?: number;
  content?: string;
};

const pool = new SimplePool();

class NutWalletManager {
  private nutZapPubkey?: string;

  async init() {
    const walletEvent = await getWalletInfoEvent();
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

export async function publishNutZap(proofs: Proof[], comment?: string) {
  const proofTags = proofs.map((p) => ["proof", JSON.stringify(p)]);
  const eventTemplate: EventTemplate = {
    kind: 9321,
    content: comment || "Forwarded nut-bridge zap!",
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

export async function publishZapReceipt(
  receiptEvent: Event,
  requestRelays?: string[],
) {
  const pubPromises = pool.publish(
    requestRelays || DEFAULT_RELAYS,
    receiptEvent,
  );
  const wrappedPromises = pubPromises.map((promise) =>
    Promise.race([promise, createTimeoutPromise(3000)]),
  );
  return Promise.allSettled(wrappedPromises);
}

export function createZapReceipt(
  { pTag, eTag }: VerifiedZapRequestData,
  invoice: string,
  zapRequest: Event,
) {
  const serialisedZapRequest = JSON.stringify(zapRequest);
  const event: EventTemplate = {
    content: "",
    kind: 9735,
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ["p", pTag],
      ["P", zapRequest.pubkey],
      ["bolt11", invoice],
      ["description", serialisedZapRequest],
    ],
  };
  if (eTag) {
    event.tags.push(["e", eTag]);
  }
  return finalizeEvent(event, SERVER_SECRET_KEY);
}

export function parseAndValidateZapRequest(
  nostrParam: string,
  lnurlAmount: number,
): { data: VerifiedZapRequestData; event: Event } {
  const parsedEvent = JSON.parse(nostrParam) as Event;
  validateEvent(parsedEvent);
  let eTag: string | undefined;
  let pTag: string | undefined;
  let relays: string[] = [];
  let amount: number | undefined;

  for (const tag of parsedEvent.tags) {
    if (tag[0] === "amount") {
      amount = Number(tag[1]);
      if (amount !== lnurlAmount) {
        throw new Error(
          "Zap Request amount does not match requested lnurl amount",
        );
      }
    }
    if (tag[0] === "relays") {
      relays = tag.slice(1);
    }
    if (tag[0] === "e") {
      if (eTag) {
        throw new Error("Zap Request can only have one eTag");
      }
      eTag = tag[1];
    }
    if (tag[0] === "p") {
      if (pTag) {
        throw new Error("Zap Request can only have one pTag");
      }
      pTag = tag[1];
    }
  }
  if (!pTag) {
    throw new Error("Zap Request must have a pTag");
  }
  return {
    data: {
      eTag,
      pTag,
      amount,
      relays,
      content: parsedEvent.content || undefined,
    },
    event: parsedEvent,
  };
}
