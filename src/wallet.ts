import {
  CashuMint,
  CashuWallet,
  getEncodedToken,
  MintQuoteState,
  Proof,
} from "@cashu/cashu-ts";
import { MINT_URL } from "./config";
import { resolve } from "path";
import { existsSync, mkdirSync, writeFileSync } from "fs";

const mint = new CashuMint(MINT_URL);
const wallet = new CashuWallet(mint);

export async function createInvoiceAndHandlePayment(amount: number) {
  const { quote, request } = await wallet.createMintQuote(amount);
  const interval = setInterval(async () => {
    const stateRes = await wallet.checkMintQuote(quote);
    if (stateRes.state === "PAID") {
      const proofs = await wallet.mintProofs(amount, quote);
      clearInterval(interval);
      const token = turnProofsIntoToken(proofs);
      saveTokenLocally(token);
    }
  }, 10000);
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
