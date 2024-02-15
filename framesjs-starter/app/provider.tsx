import { DojoProvider } from "@dojoengine/core";
import { Account } from "starknet";
import { dojoConfig } from "../dojoConfig";

export const dojoProvider = new DojoProvider(
  dojoConfig.manifest,
  dojoConfig.rpcUrl
);

const spawn = async ({
  account,
  player_id,
}: {
  account: Account;
  player_id: number;
}) => {
  try {
    return await dojoProvider.execute(account, "actions", "spawn", [player_id]);
  } catch (error) {
    console.error("Error executing spawn:", error);
    throw error;
  }
};

const enter_the_mist = async ({
  account,
  player_id,
}: {
  account: Account;
  player_id: number;
}) => {
  try {
    return await dojoProvider.execute(account, "actions", "enter_the_mist", [
      player_id,
    ]);
  } catch (error) {
    console.error("Error executing spawn:", error);
    throw error;
  }
};

const attack = async ({
  account,
  player_id,
}: {
  account: Account;
  player_id: number;
}) => {
  try {
    return await dojoProvider.execute(account, "actions", "attack", [
      player_id,
    ]);
  } catch (error) {
    console.error("Error executing spawn:", error);
    throw error;
  }
};

const check_player = async ({ player_id }: { player_id: number }) => {
  try {
    const isActive = await dojoProvider.call("actions", "check_player", [
      player_id,
    ]);

    return isActive.result;
  } catch (error) {
    console.error("Error executing spawn:", error);
    throw error;
  }
};

const check_beast = async () => {
  try {
    const beast = await dojoProvider.call("actions", "current_beast", []);

    return beast.result;
  } catch (error) {
    console.error("Error executing spawn:", error);
    throw error;
  }
};

const graphqlQuery = {
  query: `
    {
      beastModels {
        edges {
          node {
            beast_id
          }
        }
      }
      playerModels(order: {direction: DESC, field: TOTAL_XP}, limit:5) {
        edges {
          node {
            total_xp
            player_id
          }
        }
      }
    }
  `,
};

const fetchLeaderAndBeasts = async () => {
  const response = await fetch(dojoConfig.toriiUrl + "/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Include other headers as needed, for example, authorization headers
    },
    body: JSON.stringify(graphqlQuery),
  });

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  const data = await response.json();
  return data;
};

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

export {
  spawn,
  check_player,
  check_beast,
  enter_the_mist,
  attack,
  fetchLeaderAndBeasts,
  account,
  spawnAccount,
  exploreAccount,
};
