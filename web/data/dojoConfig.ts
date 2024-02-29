import manifest from "../../contracts/target/dev/manifest.json";
import { createDojoConfig } from "@dojoengine/core";

export const dojoConfig = createDojoConfig({
  rpcUrl: process.env.NODE_URL,
  toriiUrl: process.env.TORII,
  masterAddress: process.env.MASTER_ADDRESS,
  masterPrivateKey: process.env.MASTER_PRIVATE_KEY,
  manifest,
});
