import { Button } from "frog";
import { defaultImageOptions } from "../utils/defaultImageOptions";
import { images } from "../utils/images";
import { app } from "../api";
import { Wrapper } from "../Wrapper";
import { pressButton } from "../data";
import { secondsToCountdownString } from "../utils";

export const pressFrame = () => {
  app.frame("/press", async (c) => {
    const playerId = c.frameData?.fid;

    if (!playerId) {
      return c.res({ image: <></> });
    }

    const timeRemaining = await pressButton(playerId);

    return c.res({
      image: (
        <Wrapper>
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
        </Wrapper>
      ),
      intents: [<Button action="/overview">Home</Button>],
      ...defaultImageOptions,
    });
  });
};
