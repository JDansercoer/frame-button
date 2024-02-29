import { Button } from "frog";
import { defaultImageOptions } from "../utils/defaultImageOptions";
import { buttonExploded } from "../images";
import { app } from "../api";
import { Wrapper } from "../Wrapper";

export const tooLateFrame = () => {
  app.frame("/too-late", async (c) => {
    return c.res({
      image: (
        <Wrapper>
          <div tw="flex flex-col justify-center items-center w-4/5">
            <span
              tw="mb-16 text-[96px] text-[#23380F]"
              style={{ fontFamily: "VT323" }}
            >
              DISASTER STRUCK!
            </span>
            <img src={buttonExploded} tw="mb-16 w-[400px] h-[272px]" />
            <span tw="mb-6 text-[60px] text-[#839671] leading-[2] text-center">
              The button has exploded, it can no longer be pressed...
            </span>
          </div>
        </Wrapper>
      ),
      intents: [<Button action="/overview">Home</Button>],
      ...defaultImageOptions,
    });
  });
};
