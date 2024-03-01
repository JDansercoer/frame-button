/** @jsxImportSource frog/jsx */

import { Button } from "frog";
import { defaultImageOptions } from "../../../utils/defaultImageOptions";
import { buttonPressed } from "../../../images";
import { app } from "./frog";
import { Wrapper } from "./Wrapper";

export const alreadyPressedFrame = () => {
  app.frame("/already-pressed", async (c) => {
    return c.res({
      image: (
        <Wrapper>
          <div tw="flex flex-col justify-center items-center w-4/5">
            <span
              tw="mb-16 text-[96px] text-[#23380F]"
              style={{ fontFamily: "VT323" }}
            >
              YOU ARE DONE.
            </span>
            <img src={buttonPressed} tw="mb-16 w-[400px] h-[272px]" />
            <span tw="mb-6 text-[60px] text-[#839671] leading-[2] text-center">
              You have already pressed the button and it cannot be unpressed...
            </span>
          </div>
        </Wrapper>
      ),
      intents: [<Button action="/overview">Home</Button>],
      ...defaultImageOptions,
    });
  });
};
