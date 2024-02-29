import * as fs from "fs";
import { join } from "path";

const VT323File = join(process.cwd(), "fonts/VT323-Regular.ttf");
let vt3232Regular = fs.readFileSync(VT323File);
const NeueBitFile = join(process.cwd(), "fonts/PPNeueBit-Bold.otf");
let neueBitBold = fs.readFileSync(NeueBitFile);

export const defaultImageOptions = {
  imageOptions: {
    width: 1140,
    height: 1140,
    fonts: [
      {
        name: "NeueBit",
        data: neueBitBold,
        weight: 700 as const,
        style: "normal" as const,
      },
      {
        name: "VT323",
        data: vt3232Regular,
        weight: 400 as const,
        style: "normal" as const,
      },
    ],
  },
  imageAspectRatio: "1:1" as const,
};
