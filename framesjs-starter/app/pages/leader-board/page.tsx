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
import { getUserDataForFid } from "frames.js";

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

const indexerData = await fetchLeaderAndBeasts()
  .then(async (data) => {
    // Mark this callback as async to use await inside
    const leaderBoardPromises = data.data.playerModels.edges.map(
      async (edge) => {
        const userData = await getUserDataForFid({ fid: edge.node.player_id });
        return {
          id: userData.displayName,
          xp: edge.node.total_xp,
        };
      }
    );

    const leaderBoard = await Promise.all(leaderBoardPromises); // Wait for all promises to resolve

    return {
      beastId: data.data.beastModels.edges[0].node.beast_id,
      leaderBoard: leaderBoard,
    };
  })
  .catch((error) => {
    console.error(error);
    return { beastId: 0, leaderBoard: [] }; // Provide a default object structure
  });

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

  const [state, dispatch] = useFramesReducer<State>(
    reducer,
    initialState,
    previousFrame
  );

  // then, when done, return next frame
  return (
    <div>
      Starter kit with custom redirects in the /frames handler.{" "}
      <Link href="/debug">Debug</Link>
      <FrameContainer
        postUrl="/frames"
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
              <ul tw="flex flex-col">
                {indexerData.leaderBoard.map((player, index) => {
                  return (
                    <li tw="flex my-2" key={index}>
                      {index + 1}. {player.id}: {player.xp}xp
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </FrameImage>
        <FrameButton
          action="post_redirect"
          href={`https://survivor.realms.world`}
        >
          Loot Survivor
        </FrameButton>
      </FrameContainer>
    </div>
  );
}
