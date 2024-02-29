import { Button } from "frog";
import { defaultImageOptions } from "../utils/defaultImageOptions";
import { button, buttonPressed, buttonExploded } from "../images";
import { app } from ".";
import { getButtonStats, getLeaderboard, getPlayerStats } from "../data";
import {
  addSeconds,
  differenceInSeconds,
  intervalToDuration,
  min,
} from "date-fns";
import { durationToString, secondsToCountdownString } from "../utils";
import { getUserDataForFid } from "frames.js";
import { Wrapper } from "./components/Wrapper";

export const overviewFrame = () => {
  app.frame("/overview", async (c) => {
    const playerId = c.frameData?.fid;

    if (!playerId) {
      return c.res({ image: <></> });
    }

    const playerStats = await getPlayerStats(playerId);
    const buttonStats = await getButtonStats();

    if (!buttonStats.lastPressed) {
      return c.res({
        image: (
          <span tw="text-[60px] text-[#23380F]">
            The button isn&apos;t active yet.
          </span>
        ),
      });
    }

    const isGameOver =
      Math.abs(differenceInSeconds(buttonStats.lastPressed, new Date())) >
      buttonStats.secondsToPress;

    const leaderboard = await getLeaderboard();

    const homeDetails = (() => {
      if (isGameOver) {
        return {
          title: "Game Over",
          description:
            "The button has exploded! The fire is largely contained but unfortunately very little of the button remains.",
          buttonLink: buttonExploded,
        };
      }

      if (playerStats) {
        return {
          title: "Pressed...",
          description: `You did your part and pressed the button with ${secondsToCountdownString(
            playerStats.time_remaining
          )} left to spare. You may rest.`,
          buttonLink: buttonPressed,
        };
      }

      return {
        title: "Press the button!!!",
        description:
          "If the countdown reaches zero there will be terrible consequences! You only get one press. Use it wisely.",
        buttonLink: button,
      };
    })();

    const userData = await getUserDataForFid({ fid: playerId });
    const buttonDuration = intervalToDuration({
      start: buttonStats.initialized,
      // If the button is active, the end is the current time
      // If the button is not active, the end is the last time it was pressed
      // plus the maximum allowed countdown
      end: min([
        new Date(),
        addSeconds(buttonStats.lastPressed, buttonStats.secondsToPress),
      ]),
    });

    const pressScreen = isGameOver
      ? "/too-late"
      : playerStats
      ? "/already-pressed"
      : "/press";

    return c.res({
      image: (
        <Wrapper>
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
              <img src={homeDetails.buttonLink} tw="mb-8 w-[200px] h-[136px]" />
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
                  <span tw="w-1/5">{leaderboardPlayer.time_remaining}</span>
                </div>
              );
            })}
            <div tw="flex h-1 w-full bg-[#C7D7B7] my-10" />
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
        </Wrapper>
      ),
      intents: [
        <Button action={pressScreen}>Press</Button>,
        <Button>Refresh</Button>,
      ],
      ...defaultImageOptions,
    });
  });
};
