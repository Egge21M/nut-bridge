import { getEncodedToken, Proof } from "@cashu/cashu-ts";
import { MINT_URL } from "./config";
import { resolve } from "path";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { MintCommunicator } from "almnd";

const mintComm = new MintCommunicator(MINT_URL, {
  initialPollingTimeout: { mint: 10000, melt: 10000, proof: 10000 },
  backoffFunction: (r) => 5000 * Math.pow(2, r),
});

export async function createInvoiceAndHandlePayment(amount: number) {
  const { quote, request } = await mintComm.getMintQuote(amount);
  const sub = mintComm.pollForMintQuote(quote);
  sub.on("paid", async (r) => {
    const proofs = await mintComm.getProofs(amount, r);
    const token = turnProofsIntoToken(proofs);
    console.log(token);
    sub.cancel();
  });
  return request;
}

function turnProofsIntoToken(proofs: Proof[]) {
  return getEncodedToken({ mint: MINT_URL, proofs });
}

function saveTokenLocally(token: string) {
  const tokenDirPath = resolve(__dirname, "../token");
  if (!existsSync(tokenDirPath)) {
    mkdirSync(tokenDirPath);
  }
  writeFileSync(resolve(tokenDirPath, `${Date.now()}_token.txt`), token);
}
