/** @jsxImportSource frog/jsx */

import { handle } from "frog/vercel";
import { app } from "./frog";
import { homeFrame } from "./Home";

// Uncomment to use Edge Runtime
// export const runtime = 'edge'

homeFrame();

export const GET = handle(app);
export const POST = handle(app);
