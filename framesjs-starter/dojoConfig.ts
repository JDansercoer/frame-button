import manifest from "../contracts/target/dev/manifest.json";
import release_manifest from "../contracts/target/release/manifest.json";
import { createDojoConfig } from "@dojoengine/core";

export const dojoConfig = createDojoConfig({
  rpcUrl: process.env.NEXT_PUBLIC_NODE_URL,
  toriiUrl: process.env.NEXT_PUBLIC_TORII,
  masterAddress: process.env.NEXT_PUBLIC_MASTER_ADDRESS,
  masterPrivateKey: process.env.NEXT_PUBLIC_MASTER_PRIVATE_KEY,
  manifest:
    process.env.NEXT_PUBLIC_ENV === "production" ? release_manifest : manifest,
});
