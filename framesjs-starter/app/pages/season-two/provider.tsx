import { DojoProvider } from "@dojoengine/core";
import { Account } from "starknet";
import { dojoConfig } from "../../../dojoConfig";

export const dojoProvider = new DojoProvider(
  dojoConfig.manifest,
  dojoConfig.rpcUrl
);

const onload = async ({
  account,
  player_id,
  game_id,
}: {
  account: Account;
  player_id: number;
  game_id: number;
}) => {
  try {
    return await dojoProvider.execute(account, "frame_boy", "onload", [
      player_id,
      game_id,
    ]);
  } catch (error) {
    console.error("Error executing spawn:", error);
    throw error;
  }
};

const input = async ({
  account,
  player_id,
  game_id,
  button,
  input,
}: {
  account: Account;
  player_id: number;
  game_id: number;
  button: number;
  input: string;
}) => {
  try {
    return await dojoProvider.execute(account, "frame_boy", "input", [
      player_id,
      game_id,
      button,
      input,
    ]);
  } catch (error) {
    console.error("Error executing spawn:", error);
    throw error;
  }
};

const state = async ({
  player_id,
  game_id,
}: {
  player_id: number;
  game_id: number;
}) => {
  try {
    const state = await dojoProvider.call("frame_boy", "state", [
      player_id,
      game_id,
    ]);

    const sniper_state = await dojoProvider.call(
      "frame_boy",
      "get_sniper_state",
      [player_id]
    );

    console.log(state.result, sniper_state.result);

    return [state.result, sniper_state.result];
  } catch (error) {
    console.error("Error executing spawn:", error);
    throw error;
  }
};

export { onload, state, input };
