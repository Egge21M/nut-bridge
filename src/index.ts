import express from "express";
import cors from "cors";
import { USERNAME } from "./config";
import { lud16Controller } from "./controller";
import { nutWalletManager } from "./nostr";

const app = express();

app.use(cors());
app.get("/.well-known/lnurlp/" + USERNAME, lud16Controller);

async function startServer() {
  await nutWalletManager.init();

  app.listen(8080, () => {
    console.log("Server running on port 8080");
  });
}

startServer();
