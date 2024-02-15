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
  getFrameMessage,
} from "frames.js/next/server";
import Link from "next/link";
import { DEBUG_HUB_OPTIONS } from "./debug/constants";

import { Account } from "starknet";
import {
  attack,
  check_beast,
  check_player,
  dojoProvider,
  enter_the_mist,
  fetchLeaderAndBeasts,
  spawn,
} from "./provider";
import { dojoConfig } from "../dojoConfig";

import { GameData } from "./GameData";
import { getUserDataForFid } from "frames.js";

import { VT323 as GoogleVT323 } from "next/font/google";
import {
  ViewNames,
  frameBoyViews,
  viewNames,
} from "./pages/season-two/frameboy";
import { onload, state as getState, input } from "./pages/season-two/provider";
import type { InferGetServerSidePropsType, GetServerSideProps } from "next";
const googleVT323 = GoogleVT323({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-VT323",
});

const VT323 = join(process.cwd(), "public/VT323-Regular.ttf");
let interReg = fs.readFileSync(VT323);

function getImageDataUri(imageName: string): string {
  const imagePath = join(process.cwd(), `public/beasts/${imageName}.png`);
  const imageBuffer = fs.readFileSync(imagePath);
  return `data:image/png;base64,${imageBuffer.toString("base64")}`;
}

const accountPairs = [
  {
    address: dojoConfig.masterAddress,
    privateKey: dojoConfig.masterPrivateKey,
  },
  {
    address:
      "0x6ce4e580b19470a78aa70241d33fdee23af73b8791d3c4fbc81c83c4ce9d201",
    privateKey:
      "0x30bed1dcb285ac3a4721d9a7fd292b2ecf8c2169beb70c07f5dba6a1f58eabf",
  },
  {
    address:
      "0x74579abbb057d8a40d0fb1a531ee803557b91754e039bf33373f304fc5648a4",
    privateKey:
      "0x16804d2791074d60c10a49a0d22b1d0b824c64804c4c748e2022f6485a8a0dd",
  },
];

export type State = {
  entered: boolean;
  leaderBoard: boolean;
};

const account = new Account(
  dojoProvider.provider,
  dojoConfig.masterAddress,
  dojoConfig.masterPrivateKey
);

const spawnAccount = new Account(
  dojoProvider.provider,
  accountPairs[1].address,
  accountPairs[1].privateKey
);

const exploreAccount = new Account(
  dojoProvider.provider,
  accountPairs[2].address,
  accountPairs[2].privateKey
);

const initialState = { entered: false, leaderBoard: false };

const reducer: FrameReducer<State> = (state, action) => {
  console.log("action", action);
  return state;
};

export default async function Home({
  params,
  searchParams,
}: NextServerPageProps) {
  const previousFrame = getPreviousFrame<State>(searchParams);

  const frameMessage = await getFrameMessage(previousFrame.postBody, {
    ...DEBUG_HUB_OPTIONS,
  });

  console.log("frameMessage", previousFrame);

  if (frameMessage && !frameMessage?.isValid) {
    throw new Error("Invalid frame payload");
  }

  const [state, dispatch] = useFramesReducer<State>(
    reducer,
    initialState,
    previousFrame
  );

  let player = [
    ["0x0", "0x0", "0x0", "0x0", "0x0", "0x0"],
    ["0x0", "0x0", "0x0", "0x0", "0x0", "0x0"],
  ];

  if (frameMessage) {
    player = await getState({
      player_id: frameMessage.requesterFid || 0,
      game_id: 1,
    });

    if (player[0][0] === "0x0") {
      await onload({
        account,
        player_id: frameMessage.requesterFid,
        game_id: 1,
      });
    }

    console.log(frameMessage.buttonIndex);

    try {
      const tx = await input({
        account,
        player_id: frameMessage.requesterFid,
        game_id: 1,
        button: frameMessage.buttonIndex || 0,
        input: frameMessage.inputText || "0",
      });

      await account.waitForTransaction(tx.transaction_hash, {
        retryInterval: 100,
      });

      player = await getState({
        player_id: frameMessage.requesterFid || 0,
        game_id: 1,
      });
    } catch (e) {
      console.log(e);
    }
  }

  const playerParsed = {
    player: parseInt(player[0][0]),
    game_id: parseInt(player[0][1]),
    power: parseInt(player[0][2]),
    button: parseInt(player[0][3]),
    last_button: parseInt(player[0][4]),
    view: parseInt(player[0][5]),
  };

  const sniperParsed = {
    player_id: parseInt(player[1][0]),
    last_action: parseInt(player[1][1]),
    hidden_until: parseInt(player[1][2]),
    total_kill_count: parseInt(player[1][3]),
    killed_by: parseInt(player[1][4]),
    health: parseInt(player[1][5]),
  };

  console.log("playerParsed", playerParsed, sniperParsed);

  return (
    <div
      className={`${googleVT323.variable} font-sans  p-4 bg-black text-[#49f627] h-screen w-screen`}
    >
      <FrameContainer
        postUrl="/frames"
        state={state}
        pathname="/"
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
          <div tw="flex w-full h-full bg-black text-white text-[72px] p-10">
            {viewNames[playerParsed.view]}
          </div>
        </FrameImage>

        {frameBoyViews[playerParsed.view].input && (
          <FrameInput text={frameBoyViews[playerParsed.view].inputText} />
        )}

        {playerParsed.player != 0 ? (
          frameBoyViews[playerParsed.view].buttons.map((button, index) => (
            <FrameButton onClick={dispatch} key={index}>
              {button}
            </FrameButton>
          ))
        ) : (
          <FrameButton onClick={dispatch}>{"enter"}</FrameButton>
        )}
      </FrameContainer>
    </div>
  );
}
