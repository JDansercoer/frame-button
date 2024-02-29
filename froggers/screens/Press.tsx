import { Button } from "frog";
import { defaultImageOptions } from "../utils/defaultImageOptions";
import { images } from "../utils/images";
import { app } from "../api";
import { Wrapper } from "../Wrapper";
import { differenceInSeconds } from "date-fns";
import { getPlayerStats, getButtonStats, pressButton } from "../data";
import { secondsToCountdownString } from "../utils";

export const pressFrame = () => {
  app.frame("/press", async (c) => {
    const playerId = c.frameData?.fid;

    if (!playerId) {
      return c.res({ image: <></> });
    }

    const playerStats = await getPlayerStats(playerId);

    console.log(
      "🚀 ~ file: Press.tsx:20 ~ app.frame ~ playerStats:",
      playerStats
    );

    const buttonStats = await getButtonStats();

    let image = <></>;

    const isGameOver =
      Math.abs(differenceInSeconds(buttonStats.lastPressed || 0, new Date())) >
      buttonStats.secondsToPress;

    if (isGameOver) {
      image = (
        <div tw="flex flex-col justify-center items-center w-4/5">
          <span
            tw="mb-16 text-[96px] text-[#23380F]"
            style={{ fontFamily: "VT323" }}
          >
            DISASTER STRUCK!
          </span>
          <img src={images.buttonExploded} tw="mb-16 w-[400px] h-[272px]" />
          <span tw="mb-6 text-[60px] text-[#839671] leading-[2] text-center">
            The button has exploded, it can no longer be pressed...
          </span>
        </div>
      );
    }

    if (playerStats) {
      image = (
        <div tw="flex flex-col justify-center items-center w-4/5">
          <span
            tw="mb-16 text-[96px] text-[#23380F]"
            style={{ fontFamily: "VT323" }}
          >
            YOU ARE DONE.
          </span>
          <img src={images.buttonPressed} tw="mb-16 w-[400px] h-[272px]" />
          <span tw="mb-6 text-[60px] text-[#839671] leading-[2] text-center">
            You have already pressed the button and it cannot be unpressed...
          </span>
        </div>
      );
    }

    if (!playerStats) {
      const timeRemaining = await pressButton(playerId);

      console.log("🚀 ~ file: Press.tsx:70 ~ app.frame ~ I am pressing");

      image = (
        <div tw="flex flex-col justify-center items-center">
          <span
            tw="mb-24 text-[96px] text-[#23380F]"
            style={{ fontFamily: "VT323" }}
          >
            DISASTER AVERTED!
          </span>
          <img src={images.button} tw="mb-16 w-[400px] h-[272px]" />
          <span tw="mb-6 text-[60px] text-[#23380F]">
            You pressed the button at...
          </span>
          <div tw="flex flex-col py-1 px-3 rounded-xl border-[#23380F] border-4">
            <span
              tw="text-[60px] text-[#23380F]"
              style={{ fontFamily: "VT323" }}
            >
              {secondsToCountdownString(timeRemaining)}
            </span>
          </div>
        </div>
      );
    }

    return c.res({
      image: <Wrapper>{image}</Wrapper>,
      intents: [<Button action="/overview">Home</Button>],
      ...defaultImageOptions,
    });
  });
};
