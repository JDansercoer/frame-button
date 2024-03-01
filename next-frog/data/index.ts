import { DojoProvider } from "@dojoengine/core";
import { getUserDataForFid } from "frames.js";
import { dojoConfig } from "./dojoConfig";
import { fromUnixTime } from "date-fns";
import { Account } from "starknet";
import { secondsToCountdownString } from "../utils";

export const dojoProvider = new DojoProvider(
  dojoConfig.manifest,
  dojoConfig.rpcUrl
);

export const getLeaderboard = async (): Promise<
  Array<{ player: string; time_remaining: string }>
> => {
  const response = await fetch(dojoConfig.toriiUrl + "/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
            {
                buttonPressModels(order: {field: TIME_REMAINING, direction:ASC}, limit: 4) {
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
    async (edge: any) => {
      const userData = await getUserDataForFid({ fid: edge.node.player });

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

export const getButtonStats = async () => {
  const response = await fetch(dojoConfig.toriiUrl + "/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
          {
            buttonModels(order: { field: SEASON, direction: DESC }, limit: 1) {
              edges {
                node {
                  last_pressed
                  times_pressed
                  seconds_to_press
                  initialized
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

  if (!data.data.buttonModels.edges.length) {
    return {
      lastPressed: undefined,
      timesPressed: 0,
      secondsToPress: 0,
    };
  }

  const currentButton = data.data.buttonModels.edges[0].node;

  return {
    lastPressed: fromUnixTime(currentButton.last_pressed),
    timesPressed: currentButton.times_pressed,
    secondsToPress: currentButton.seconds_to_press,
    initialized: fromUnixTime(currentButton.initialized),
  };
};

export const getPlayerStats = async (
  player: number
): Promise<null | { time_remaining: number }> => {
  const response = await fetch(dojoConfig.toriiUrl + "/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
      query GetPlayerStats($player: Int) {
        buttonPressModels(where: {player: $player}) {
          edges {
            node {
              time_remaining
            }
          }
        }
      }
            `,
      variables: {
        player,
      },
    }),
  });

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  const data = await response.json();

  return data.data.buttonPressModels.edges[0]
    ? (data.data.buttonPressModels.edges[0].node as { time_remaining: number })
    : null;
};

export const pressButton = async (player: number) => {
  const fakeAccount = new Account(
    dojoProvider.provider,
    process.env.MASTER_ADDRESS || "",
    process.env.MASTER_PRIVATE_KEY || ""
  );

  const pressTransaction = await dojoProvider.execute(
    fakeAccount,
    "button",
    "press",
    [player]
  );

  await fakeAccount.waitForTransaction(pressTransaction.transaction_hash, {
    retryInterval: 100,
  });

  const updatedPlayer = await dojoProvider.call("button", "get_button_press", [
    player,
  ]);

  return Number(updatedPlayer.result[2]);
};
