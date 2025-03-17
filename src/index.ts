import express from "express";
import { USERNAME } from "./config";
import { lud16Controller } from "./controller";

const app = express();

app.get("/.well-known/lnurlp/" + USERNAME, lud16Controller);

app.listen(8080, () => {
  console.log("Server running on port 8080");
});
