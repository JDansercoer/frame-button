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
import {
  frameImageProps,
  frameboyWrapperClasses,
  secondsToCountdownString,
} from "./utils";
import {
  getButtonStats,
  getLeaderboard,
  getPlayerStats,
  pressButton,
} from "./data";
import { addSeconds, differenceInSeconds } from "date-fns";

type State = {
  screen: "home" | "overview" | "button";
};

const initialState: State = { screen: "home" };

const reducer: FrameReducer<State> = (state) => {
  if (state.screen === "home") {
    return { screen: "overview" };
  }

  if (state.screen === "overview") {
    return { screen: "button" };
  }

  if (state.screen === "button") {
    return { screen: "overview" };
  }

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

  return (
    <FrameContainer
      postUrl="/frames"
      pathname="/"
      state={state}
      previousFrame={previousFrame}
    >
      <FrameImage {...frameImageProps}>
        <img src="http://localhost:3000/Frame.png" tw="absolute inset-0" />
        <div tw={frameboyWrapperClasses}>
          {await (async () => {
            if (!frameMessage) {
              return (
                <div tw="flex flex-col justify-center items-center">
                  <img
                    src="http://localhost:3000/Button-Graphic.png"
                    tw="mb-10 w-[400px] h-[272px]"
                  />
                  <div tw="flex flex-col">
                    <p tw="mb-[-40] text-[60px] text-[#839671]">
                      Welcome to...
                    </p>
                    <p
                      tw="mb-0 text-[96px] text-[#23380F]"
                      style={{ fontFamily: "VT323" }}
                    >
                      The Button Game
                    </p>
                  </div>
                </div>
              );
            }

            const playerId = frameMessage.requesterFid;

            const playerStats = await getPlayerStats(playerId);

            if (state.screen === "overview") {
              const buttonStats = await getButtonStats();
              const leaderboard = await getLeaderboard();

              return (
                <div tw="flex flex-col justify-center items-stretch w-full h-full">
                  <div tw="flex flex-row justify-between mb-10">
                    <div tw="flex flex-col w-[70%]">
                      <span
                        tw="mb-12 text-[72px] text-[#23380F]"
                        style={{ fontFamily: "VT323" }}
                      >
                        {playerStats ? "PRESSED..." : "PRESS THE BUTTON!!!"}
                      </span>
                      <span tw="mb-10 text-[56px] text-[#839671]">
                        If the countdown reaches zero there will be terrible
                        consequences! You only get one press. Use it wisely.
                      </span>
                      <span tw="text-[60px] text-[#23380F]">
                        Total Pressed: {buttonStats.timesPressed} times
                      </span>
                    </div>
                    <div tw="flex flex-col items-center">
                      <img
                        src={`http://localhost:3000/Button-Graphic${
                          playerStats ? "-Pressed" : ""
                        }.png`}
                        tw="mb-8 w-[200px] h-[136px]"
                      />
                      <div tw="flex flex-col py-2 px-6 bg-[#23380F] rounded-3xl">
                        <span
                          tw="text-[60px] text-[#E2F3D2]"
                          style={{ fontFamily: "VT323" }}
                        >
                          {secondsToCountdownString(
                            differenceInSeconds(
                              addSeconds(
                                buttonStats.lastPressed,
                                buttonStats.secondsToPress
                              ),
                              new Date()
                            )
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div tw="flex flex-col border-[#23380F] border-4 w-full px-12 py-8 self-stretch rounded-xl mt-auto">
                    {leaderboard.map((leaderboardPlayer, index) => {
                      return (
                        <div
                          tw={`flex flex-row text-[60px] text-[#23380F] ${
                            index === leaderboard.length - 1 ? "" : "mb-6"
                          }`}
                          key={index}
                        >
                          <span tw="w-1/5">{index + 1}.</span>
                          <span tw="mr-auto">{leaderboardPlayer.player}</span>
                          <span tw="w-1/5">
                            {leaderboardPlayer.time_remaining}
                          </span>
                        </div>
                      );
                    })}
                    <div tw="h-1 w-full bg-[#C7D7B7] my-10" />
                    <div tw="flex flex-row text-[60px] text-[#839671]">
                      <span tw="w-1/5">-</span>
                      <span tw="mr-auto">RareSecond (you)</span>
                      <span tw="w-1/5">???</span>
                    </div>
                  </div>
                </div>
              );
            }

            if (state.screen === "button") {
              if (!playerStats) {
                await pressButton(playerId);
                const updatedPlayerStats = await getPlayerStats(playerId);

                return (
                  <div tw="flex flex-col justify-center items-center">
                    <span
                      tw="mb-24 text-[96px] text-[#23380F]"
                      style={{ fontFamily: "VT323" }}
                    >
                      DISASTER AVERTED!
                    </span>
                    <img
                      src="http://localhost:3000/Button-Graphic.png"
                      tw="mb-16 w-[400px] h-[272px]"
                    />
                    <span tw="mb-6 text-[60px] text-[#23380F]">
                      You pressed the button at...
                    </span>
                    <div tw="flex flex-col py-1 px-3 rounded-xl border-[#23380F] border-4">
                      <span
                        tw="text-[60px] text-[#23380F]"
                        style={{ fontFamily: "VT323" }}
                      >
                        14m 50s
                      </span>
                    </div>
                  </div>
                );
              }

              return (
                <div tw="flex flex-col justify-center items-center w-4/5">
                  <span
                    tw="mb-16 text-[96px] text-[#23380F]"
                    style={{ fontFamily: "VT323" }}
                  >
                    YOU ARE DONE.
                  </span>
                  <img
                    src="http://localhost:3000/Button-Graphic-Pressed.png"
                    tw="mb-16 w-[400px] h-[272px]"
                  />
                  <span tw="mb-6 text-[60px] text-[#839671] leading-[2] text-center">
                    You have already pressed the button and it cannot be
                    unpressed...
                  </span>
                </div>
              );
            }
          })()}
        </div>
      </FrameImage>
      {(() => {
        if (state.screen === "home") {
          return <FrameButton onClick={dispatch}>PLAY</FrameButton>;
        }
        if (state.screen === "overview") {
          return <FrameButton onClick={dispatch}>PRESS</FrameButton>;
        }
        if (state.screen === "button") {
          return <FrameButton onClick={dispatch}>HOME</FrameButton>;
        }

        return null;
      })()}
    </FrameContainer>
  );
}
