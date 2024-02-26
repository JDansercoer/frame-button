import { Duration } from "date-fns";
import * as fs from "fs";
import { join } from "path";

export const secondsToCountdownString = (seconds: number) => {
  const minutes = Math.trunc(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes < 10 ? `0${minutes}` : minutes}m ${
    remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds
  }s`;
};

export const durationToString = (duration: Duration) => {
  const firstNonZeroValueIndex = Object.values(duration).findIndex(
    (value) => value > 0
  );
  const durationKeys = [
    Object.keys(duration)[firstNonZeroValueIndex],
    Object.keys(duration)[firstNonZeroValueIndex + 1],
  ];

  return durationKeys.reduce((acc, key) => {
    if (key) {
      return `${acc ? `${acc} ` : ""}${duration[key]}${key[0]}`;
    }

    return acc;
  }, "");
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
