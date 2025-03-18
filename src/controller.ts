import { NextFunction, Request, Response } from "express";
import { createLnurlResponse, isValidAmount } from "./utils";
import { createInvoiceAndHandlePayment } from "./wallet";
import { parseAndValidateZapRequest, VerifiedZapRequestData } from "./nostr";
import { Event } from "nostr-tools";

export const lud16Controller = async (
  req: Request<
    unknown,
    unknown,
    unknown,
    { amount?: string; comment?: string; nostr?: string }
  >,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { amount, nostr, comment } = req.query;
    let zapRequestData:
      | { data: VerifiedZapRequestData; event: Event }
      | undefined;
    if (!amount) {
      res.json(createLnurlResponse());
      return;
    }
    const parsedAmount = parseInt(amount);
    const isValid = isValidAmount(parsedAmount);
    if (!isValid) {
      throw new Error("Invalid Amount");
    }
    if (nostr) {
      try {
        zapRequestData = parseAndValidateZapRequest(nostr, parsedAmount);
      } catch (e) {
        res.status(400).json({ error: true, message: "Invalid zap request" });
        return;
      }
    }
    const invoice = await createInvoiceAndHandlePayment(
      parsedAmount / 1000,
      comment,
      zapRequestData,
    );
    res.json({
      pr: invoice,
      routes: [],
    });
  } catch (e) {
    next(e);
  }
};
