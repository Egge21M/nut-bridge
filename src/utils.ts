import {
  HOSTNAME,
  MAX_AMOUNT,
  MIN_AMOUNT,
  SERVER_PUBLIC_KEY,
  USERNAME,
} from "./config";

export function createLnurlResponse() {
  return {
    callback: `${HOSTNAME}/.well-known/lnurlp/${USERNAME}`,
    maxSendable: MAX_AMOUNT,
    minSendable: MIN_AMOUNT,
    commentAllowed: 256,
    metadata: JSON.stringify([
      ["text/plain", "A cashu lightning address... Neat!"],
    ]),
    tag: "payRequest",
    nostrPubkey: SERVER_PUBLIC_KEY,
    allowsNostr: true,
  };
}

export function isValidAmount(amount: number) {
  return (
    amount >= MIN_AMOUNT && amount <= MAX_AMOUNT && Number.isInteger(amount)
  );
}

export function createTimeoutPromise(ms: number) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error("Timeout exceeded")), ms);
  });
}
