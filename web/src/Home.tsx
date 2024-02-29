import { Button } from "frog";
import { defaultImageOptions } from "../utils/defaultImageOptions";
import { app } from ".";
import { Wrapper } from "./components/Wrapper";
import { button } from "../images";

export const homeFrame = () => {
  app.frame("/", (c) => {
    return c.res({
      image: (
        <Wrapper>
          <img src={button} tw="mb-10 w-[400px] h-[272px]" />
          <div tw="flex flex-col">
            <p tw="mb-[-40] text-[60px] text-[#839671]">Welcome to...</p>
            <p
              tw="mb-0 text-[96px] text-[#23380F]"
              style={{ fontFamily: "VT323" }}
            >
              The Button Game
            </p>
          </div>
        </Wrapper>
      ),
      intents: [<Button action="/overview">Play</Button>],
      ...defaultImageOptions,
    });
  });
};
