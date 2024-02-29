import { Frog } from "frog";
import { handle } from "frog/vercel";
import { homeFrame } from "./Home";
import { overviewFrame } from "./Overview";
import { pressFrame } from "./Press";
import { alreadyPressedFrame } from "./AlreadyPressed";
import { tooLateFrame } from "./TooLate";

// Uncomment to use Edge Runtime.
// export const config = {
//   runtime: 'edge',
// }

export const app = new Frog({
  basePath: "/",
  // Supply a Hub API URL to enable frame verification.
  // hubApiUrl: 'https://api.hub.wevm.dev',
});

homeFrame();
overviewFrame();
pressFrame();
alreadyPressedFrame();
tooLateFrame();

export const GET = handle(app);
export const POST = handle(app);
