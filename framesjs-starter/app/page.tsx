import * as fs from "fs";
import { join } from "path";
import { Account } from "starknet";
import { addSeconds, differenceInSeconds, fromUnixTime } from "date-fns";
import {
  FrameButton,
  FrameContainer,
  FrameImage,
  FrameReducer,
  NextServerPageProps,
  getFrameMessage,
  getPreviousFrame,
  useFramesReducer,
  validateActionSignature,
} from "frames.js/next/server";
import { DEBUG_HUB_OPTIONS } from "./debug/constants";
import { DojoProvider } from "@dojoengine/core";
import { getUserDataForFid } from "frames.js";
import { dojoConfig } from "../dojoConfig";

const dojoProvider = new DojoProvider(dojoConfig.manifest, dojoConfig.rpcUrl);

const VT323 = join(process.cwd(), "public/VT323-Regular.ttf");
let interReg = fs.readFileSync(VT323);

type State = {
  sup: boolean;
};

const initialState = { sup: false };

const fakeAccount = new Account(
  dojoProvider.provider,
  process.env.NEXT_PUBLIC_MASTER_ADDRESS,
  process.env.NEXT_PUBLIC_MASTER_PRIVATE_KEY
);

const secondsToCountdownString = (seconds: number) => {
  const minutes = Math.trunc(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

const reducer: FrameReducer<State> = (state, action) => {
  return state;
};

// This is a react server component only
export default async function Home({ searchParams }: NextServerPageProps) {
  const previousFrame = getPreviousFrame<State>(searchParams);

  const frameMessage = await getFrameMessage(previousFrame.postBody, {
    ...DEBUG_HUB_OPTIONS,
  });

  await validateActionSignature(previousFrame.postBody, DEBUG_HUB_OPTIONS);

  const [state, dispatch] = useFramesReducer<State>(
    reducer,
    initialState,
    previousFrame
  );

  if (frameMessage) {
    const { result: playerPress } = await dojoProvider.call(
      "button",
      "get_button_press",
      [frameMessage.requesterFid]
    );

    if (Number(playerPress[1])) {
      return (
        <FrameContainer
          postUrl="/frames"
          pathname="/"
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
              <div tw="flex text-6xl flex-col py-0 px-12 text-[#49f627] w-full">
                <h1 tw="mb-0 text-center self-center">🙏</h1>
                <p tw="mb-0">You have already done your part.</p>
                <p tw="mt-auto">You may rest</p>
              </div>
            </div>
          </FrameImage>
        </FrameContainer>
      );
    }

    const pressTransaction = await dojoProvider.execute(
      fakeAccount,
      "button",
      "press",
      [frameMessage.requesterFid]
    );

    await fakeAccount.waitForTransaction(pressTransaction.transaction_hash, {
      retryInterval: 100,
    });

    const { result: pressResult } = await dojoProvider.call(
      "button",
      "get_button_press",
      [frameMessage.requesterFid]
    );

    return (
      <FrameContainer
        postUrl="/frames"
        pathname="/"
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
            <div tw="flex text-6xl flex-col py-0 px-12 text-[#49f627]">
              <h1 tw="mb-0 text-center self-center">🙏</h1>
              <p tw="mb-0">The world thanks you.</p>
              <p tw="mb-0">
                You pressed the button with{" "}
                {secondsToCountdownString(Number(pressResult[2]))} remaining.
              </p>
              <p tw="mt-auto">You rock</p>
            </div>
          </div>
        </FrameImage>
      </FrameContainer>
    );
  }

  const { result: buttonDetails } = await dojoProvider.call(
    "button",
    "get_details"
  );

  const secondsLeft = differenceInSeconds(
    addSeconds(
      fromUnixTime(Number(buttonDetails[1])),
      Number(buttonDetails[2])
    ),
    new Date()
  );

  const leaderboardCall = async () => {
    const response = await fetch(dojoConfig.toriiUrl + "/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Include other headers as needed, for example, authorization headers
      },
      body: JSON.stringify({
        query: `
        {
            buttonPressModels(order: {field: TIME_REMAINING, direction:ASC}, limit: 5) {
            edges {
                node {
                player
                time_remaining
                }
            }
            }
        }
      `,
      }),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();

    const resolvedDataPromises = data.data.buttonPressModels.edges.map(
      async (edge) => {
        const userData = await getUserDataForFid(edge.node.player);

        if (!userData) {
          return {
            player: "Unknown",
            time_remaining: secondsToCountdownString(edge.node.time_remaining),
          };
        }

        const name = userData.username;
        return {
          player: name,
          time_remaining: secondsToCountdownString(edge.node.time_remaining),
        };
      }
    );

    return Promise.all(resolvedDataPromises);
  };
  const leaderboardData = await leaderboardCall();

  return (
    <FrameContainer
      postUrl="/frames"
      pathname="/"
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
          <div tw="flex text-6xl flex-col py-0 px-12 text-[#49f627]">
            <h1 tw="mb-0">Press the button</h1>
            <p tw="mb-0">
              If this button isn&apos;t pressed for 15 minutes, it will be the
              end of the world. Help us save the world by pressing the button.
              You only get one press. Use it wisely.
            </p>
            <p tw="mb-0">Times pressed: {Number(buttonDetails[0])}</p>
            <p tw="mb-0">Countdown - {secondsToCountdownString(secondsLeft)}</p>
            {leaderboardData.length > 0 && (
              <div tw="mt-auto flex flex-col mb-6">
                <h3 tw="mb-0">Greatest heroes</h3>
                {leaderboardData.map((leaderboard: any, index: number) => {
                  return (
                    <span key={index}>
                      {index + 1}. {leaderboard.player} -{" "}
                      {leaderboard.time_remaining}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </FrameImage>
      {Number(buttonDetails[1]) > 0 && (
        <FrameButton onClick={dispatch}>💾 SAVE THE WORLD 💾</FrameButton>
      )}
    </FrameContainer>
  );
}
