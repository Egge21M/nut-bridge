import { HOSTNAME, MAX_AMOUNT, MIN_AMOUNT, USERNAME } from "./config";

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
  };
}

export function isValidAmount(amount: number) {
  return (
    amount >= MIN_AMOUNT && amount <= MAX_AMOUNT && Number.isInteger(amount)
  );
}
