import { NextFunction, Request, Response } from "express";
import { createLnurlResponse, isValidAmount } from "./utils";
import { createInvoiceAndHandlePayment } from "./wallet";

export const lud16Controller = async (
  req: Request<unknown, unknown, unknown, { amount: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.query.amount) {
      res.json(createLnurlResponse());
      return;
    }
    const parsedAmount = parseInt(req.query.amount);
    const isValid = isValidAmount(parsedAmount);
    if (!isValid) {
      throw new Error("Invalid Amount");
    }
    const invoice = await createInvoiceAndHandlePayment(parsedAmount / 1000);
    res.json({
      pr: invoice,
      routes: [],
    });
  } catch (e) {
    next(e);
  }
};
