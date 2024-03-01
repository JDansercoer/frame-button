/** @jsxImportSource frog/jsx */

import { handle } from "frog/vercel";
import { app } from "./frog";
import { homeFrame } from "./Home";
import { overviewFrame } from "./Overview";
import { pressFrame } from "./Press";
import { alreadyPressedFrame } from "./AlreadyPressed";
import { tooLateFrame } from "./TooLate";

// Uncomment to use Edge Runtime
// export const runtime = 'edge'

homeFrame();
overviewFrame();
pressFrame();
alreadyPressedFrame();
tooLateFrame();

export const GET = handle(app);
export const POST = handle(app);
