import * as fs from "fs";
import { join } from "path";

export const secondsToCountdownString = (seconds: number) => {
  const minutes = Math.trunc(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

const VT323File = join(process.cwd(), "public/VT323-Regular.ttf");
let vt3232Regular = fs.readFileSync(VT323File);
const NeueBitFile = join(process.cwd(), "public/PPNeueBit-Bold.otf");
let neueBitBold = fs.readFileSync(NeueBitFile);

const aspectRatio = "1:1" as const;

export const frameImageProps = {
  aspectRatio,
  options: {
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
};

export const frameboyWrapperClasses =
  "absolute inset-16 flex flex-col justify-center items-center p-10 bg-[#E2F3D2]";
