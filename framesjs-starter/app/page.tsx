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
  durationToString,
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
import { addSeconds, differenceInSeconds, intervalToDuration } from "date-fns";
import { getUserDataForFid } from "frames.js";

type State = {
  screen: "home" | "overview" | "button";
};

const initialState: State = { screen: "home" };

const reducer: FrameReducer<State> = (state, action) => {
  if (state.screen === "home") {
    return { screen: "overview" };
  }

  if (state.screen === "overview") {
    if (action.postBody?.untrustedData.buttonIndex === 1) {
      return { screen: "button" };
    }

    return { screen: "overview" };
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
        <img
          src={`${process.env.NEXT_PUBLIC_BASE_URL}/Frame.png`}
          tw="absolute inset-0"
        />
        <div tw={frameboyWrapperClasses}>
          {await (async () => {
            if (!frameMessage) {
              return (
                <div tw="flex flex-col justify-center items-center">
                  <img
                    src={`${process.env.NEXT_PUBLIC_BASE_URL}/Button-Graphic.png`}
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
            const buttonStats = await getButtonStats();

            if (!buttonStats.lastPressed) {
              return (
                <span tw="text-[60px] text-[#23380F]">
                  The button isn&apos;t active yet.
                </span>
              );
            }

            const isGameOver =
              Math.abs(
                differenceInSeconds(buttonStats.lastPressed, new Date())
              ) > buttonStats.secondsToPress;

            if (state.screen === "overview") {
              const leaderboard = await getLeaderboard();

              const homeDetails = (() => {
                if (isGameOver) {
                  return {
                    title: "Game Over",
                    description:
                      "The button has exploded! The fire is largely contained but unfortunately very little of the button remains.",
                    buttonLink: `${process.env.NEXT_PUBLIC_BASE_URL}/Button-Graphic-Exploded.png`,
                  };
                }

                if (playerStats) {
                  return {
                    title: "Pressed...",
                    description: `You did your part and pressed the button with ${secondsToCountdownString(
                      playerStats.time_remaining
                    )} left to spare. You may rest.`,
                    buttonLink: `${process.env.NEXT_PUBLIC_BASE_URL}/Button-Graphic-Pressed.png`,
                  };
                }

                return {
                  title: "Press the button!!!",
                  description:
                    "If the countdown reaches zero there will be terrible consequences! You only get one press. Use it wisely.",
                  buttonLink: `${process.env.NEXT_PUBLIC_BASE_URL}/Button-Graphic.png`,
                };
              })();

              const userData = await getUserDataForFid({ fid: playerId });
              const buttonDuration = intervalToDuration({
                start: buttonStats.initialized,
                end: new Date(),
              });

              return (
                <div tw="flex flex-col justify-center items-stretch w-full h-full">
                  <div tw="flex flex-row justify-between mb-10">
                    <div tw="flex flex-col w-[70%]">
                      <span
                        tw="mb-12 text-[72px] text-[#23380F] uppercase"
                        style={{ fontFamily: "VT323" }}
                      >
                        {homeDetails.title}
                      </span>
                      <span tw="mb-12 text-[56px] text-[#839671]">
                        {homeDetails.description}
                      </span>
                      <span tw="text-[60px] mb-6 text-[#23380F]">
                        Total Pressed: {buttonStats.timesPressed} times
                      </span>
                      <span tw="text-[60px] text-[#23380F]">
                        Time Survived: {durationToString(buttonDuration)}
                      </span>
                    </div>
                    <div tw="flex flex-col items-center">
                      <img
                        src={homeDetails.buttonLink}
                        tw="mb-8 w-[200px] h-[136px]"
                      />
                      <div tw="flex flex-col py-2 px-6 bg-[#23380F] rounded-3xl">
                        <span
                          tw="text-[60px] text-[#E2F3D2]"
                          style={{ fontFamily: "VT323" }}
                        >
                          {secondsToCountdownString(
                            Math.max(
                              differenceInSeconds(
                                addSeconds(
                                  buttonStats.lastPressed,
                                  buttonStats.secondsToPress
                                ),
                                new Date()
                              ),
                              0
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
                      <span tw="w-1/5"></span>
                      <span tw="mr-auto">{userData?.username} (you)</span>
                      <span tw="w-1/5">
                        {playerStats
                          ? secondsToCountdownString(playerStats.time_remaining)
                          : "???"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }

            if (state.screen === "button") {
              if (isGameOver) {
                return (
                  <div tw="flex flex-col justify-center items-center w-4/5">
                    <span
                      tw="mb-16 text-[96px] text-[#23380F]"
                      style={{ fontFamily: "VT323" }}
                    >
                      DISASTER STRUCK!
                    </span>
                    <img
                      src={`${process.env.NEXT_PUBLIC_BASE_URL}/Button-Graphic-Exploded.png`}
                      tw="mb-16 w-[400px] h-[272px]"
                    />
                    <span tw="mb-6 text-[60px] text-[#839671] leading-[2] text-center">
                      The button has exploded, it can no longer be pressed...
                    </span>
                  </div>
                );
              }

              if (!playerStats) {
                const timeRemaining = await pressButton(playerId);

                return (
                  <div tw="flex flex-col justify-center items-center">
                    <span
                      tw="mb-24 text-[96px] text-[#23380F]"
                      style={{ fontFamily: "VT323" }}
                    >
                      DISASTER AVERTED!
                    </span>
                    <img
                      src={`${process.env.NEXT_PUBLIC_BASE_URL}/Button-Graphic.png`}
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
                        {secondsToCountdownString(timeRemaining)}
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
                    src={`${process.env.NEXT_PUBLIC_BASE_URL}/Button-Graphic-Pressed.png`}
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
      {/* I can't include it in the statement above, because frames.js currently doesn't 
      like fragments */}
      {state.screen === "overview" ? (
        <FrameButton onClick={dispatch}>REFRESH</FrameButton>
      ) : null}
    </FrameContainer>
  );
}
