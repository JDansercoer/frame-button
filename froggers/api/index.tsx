import { Frog } from "frog";
import { handle } from "frog/vercel";
import { homeFrame } from "../screens/Home";
import { overviewFrame } from "../screens/Overview";
import { pressFrame } from "../screens/Press";
import { alreadyPressedFrame } from "../screens/AlreadyPressed";
import { tooLateFrame } from "../screens/TooLate";

// Uncomment to use Edge Runtime.
// export const config = {
//   runtime: 'edge',
// }

export const app = new Frog({
  basePath: "/api",
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
