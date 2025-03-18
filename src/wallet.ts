import { CashuMint, CashuWallet } from "@cashu/cashu-ts";
import { MINT_URL } from "./config";
import { MintCommunicator } from "almnd";
import {
  createZapReceipt,
  nutWalletManager,
  publishNutZap,
  publishZapReceipt,
  VerifiedZapRequestData,
} from "./nostr";
import { Event } from "nostr-tools";

const mintComm = new MintCommunicator(MINT_URL, {
  initialPollingTimeout: { mint: 10000, melt: 10000, proof: 10000 },
  backoffFunction: (r) => 5000 * Math.pow(2, r),
});

const wallet = new CashuWallet(new CashuMint(MINT_URL));

export async function createInvoiceAndHandlePayment(
  amount: number,
  comment?: string,
  zapRequestObject?: { data: VerifiedZapRequestData; event: Event },
) {
  const { quote, request } = await mintComm.getMintQuote(amount);
  const sub = mintComm.pollForMintQuote(quote);
  sub.on("paid", async () => {
    const proofs = await wallet.mintProofs(amount, quote, {
      p2pk: { pubkey: nutWalletManager.pubkey! },
    });
    await publishNutZap(proofs, zapRequestObject?.data.content || comment);
    if (zapRequestObject) {
      const zapReceipt = createZapReceipt(
        zapRequestObject.data,
        request,
        zapRequestObject.event,
      );
      await publishZapReceipt(zapReceipt);
    }
    sub.cancel();
  });
  sub.on("expired", () => {
    sub.cancel();
  });
  return request;
}
