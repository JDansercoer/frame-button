import * as fs from "fs";
import { join } from "path";

import {
  FrameButton,
  FrameContainer,
  FrameImage,
  FrameInput,
  FrameReducer,
  NextServerPageProps,
  getPreviousFrame,
  useFramesReducer,
  validateActionSignature,
} from "frames.js/next/server";
import Link from "next/link";
import { DEBUG_HUB_OPTIONS } from "../../debug/constants";
import { fetchLeaderAndBeasts } from "../../provider";
import { getFrameMessage, getUserDataForFid } from "frames.js";
import { frameBoyViews } from "./frameboy";
import { onload, state as getState } from "./provider";
import { account } from "../../page";

const VT323 = join(process.cwd(), "public/VT323-Regular.ttf");
let interReg = fs.readFileSync(VT323);

type State = {
  active: string;
  total_button_presses: number;
};

const initialState = { active: "1", total_button_presses: 0 };

const reducer: FrameReducer<State> = (state, action) => {
  return {
    total_button_presses: state.total_button_presses + 1,
    active: action.postBody?.untrustedData.buttonIndex
      ? String(action.postBody?.untrustedData.buttonIndex)
      : "1",
  };
};

// This is a react server component only
export default async function Home({
  params,
  searchParams,
}: NextServerPageProps) {
  const previousFrame = getPreviousFrame<State>(searchParams);

  const validMessage = await validateActionSignature(
    previousFrame.postBody,
    DEBUG_HUB_OPTIONS
  );

  console.log("validMessage", validMessage);

  // const frameMessage = await getFrameMessage(previousFrame.postBody, {
  //   ...DEBUG_HUB_OPTIONS,
  // });

  const [state, dispatch] = useFramesReducer<State>(
    reducer,
    initialState,
    previousFrame
  );

  // const player = await getState({
  //   player_id: frameMessage?.requesterFid || 0,
  //   game_id: 1,
  // });

  // console.log("player", player);

  // if (player[0] == "0x0" && frameMessage)
  //   onload({
  //     account: account,
  //     player_id: frameMessage?.requesterFid,
  //     game_id: 1,
  //   });

  return (
    <div>
      Starter kit with custom redirects in the /frames handler.{" "}
      <Link href="/debug">Debug</Link>
      <FrameContainer
        postUrl="/frames"
        pathname="/season-two"
        state={state}
        previousFrame={previousFrame}
      >
        <FrameImage
          aspectRatio="1:1"
          options={{
            width: 1146,
            height: 1146,
            fonts: [
              {
                name: "Inter",
                data: interReg,
                weight: 400,
                style: "normal",
              },
            ],
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "stretch",
              width: "100%",
              height: "100vh",
              backgroundColor: "black",
              color: "white",
            }}
          >
            <div tw="flex text-6xl flex-col p-24 text-[#49f627]">
              <h1>Leaderboard</h1>
            </div>
          </div>
        </FrameImage>

        {frameBoyViews[1].buttons.map((button, index) => (
          <FrameButton key={index} href={`https://survivor.realms.world`}>
            {button}
          </FrameButton>
        ))}
      </FrameContainer>
    </div>
  );
}
