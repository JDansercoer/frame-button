import { DojoProvider } from "@dojoengine/core";
import { getUserDataForFid } from "frames.js";
import { dojoConfig } from "../dojoConfig";
import { secondsToCountdownString } from "./utils";
import { fromUnixTime } from "date-fns";

export const dojoProvider = new DojoProvider(
  dojoConfig.manifest,
  dojoConfig.rpcUrl
);

export const getLeaderboard = async () => {
  const response = await fetch(dojoConfig.toriiUrl + "/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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

export const getButtonStats = async () => {
  const response = await fetch(dojoConfig.toriiUrl + "/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Include other headers as needed, for example, authorization headers
    },
    body: JSON.stringify({
      query: `
          {
            buttonModels(order: { field: SEASON, direction: DESC }, limit: 1) {
              edges {
                node {
                  last_pressed
                  times_pressed
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
      lastPressed: new Date(),
      timesPressed: 0,
    };
  }

  const currentButton = data.data.buttonModels.edges[0].node;

  return {
    lastPressed: fromUnixTime(currentButton.last_pressed),
    timesPressed: currentButton.times_pressed,
  };
};
