import { Button } from "frog";
import { defaultImageOptions } from "../utils/defaultImageOptions.js";
import { images } from "../utils/images.js";
import { app } from "../api/index.js";

export const homeFrame = () => {
  app.frame("/", (c) => {
    return c.res({
      image: (
        <div tw="flex flex-col justify-center items-center w-full h-full bg-[#E2F3D2]">
          <img src={images.frame} tw="absolute inset-0" />
          <img src={images.button} tw="mb-10 w-[400px] h-[272px]" />
          <div tw="flex flex-col">
            <p tw="mb-[-40] text-[60px] text-[#839671]">Welcome to...</p>
            <p
              tw="mb-0 text-[96px] text-[#23380F]"
              style={{ fontFamily: "VT323" }}
            >
              The Button Game
            </p>
          </div>
        </div>
      ),
      intents: [<Button>Play</Button>],
      ...defaultImageOptions,
    });
  });
};
