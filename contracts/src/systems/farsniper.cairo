use dojo_starter::models::{
    beast::{Beast, Player, BeastCounter, BEAST_COUNTER_CONFIG, BEAST_CONFIG}
};

#[starknet::interface]
trait IActions<TContractState> {
    fn spawn(self: @TContractState, player_id: u32);
    fn snipe(self: @TContractState, player_id: u32, target: u32);
    fn cover(self: @TContractState, player_id: u32);
    fn get_sniper(self: @TContractState, player_id: u32) -> Sniper;
}

#[derive(Model, Drop, Serde, Copy)]
struct Sniper {
    #[key]
    player_id: u32,
    last_action: u64,
    hidden_until: u64,
    total_kill_count: u32,
    killed_by: u32,
    health: u32
}

// dojo decorator
#[dojo::contract]
mod farsniper {
    use super::{IActions, Sniper};


    use starknet::{ContractAddress, get_caller_address, get_block_timestamp};


    fn spawn(world: IWorldDispatcher, player_id: u32) {
        let mut sniper = get!(world, player_id, (Sniper));

        sniper.health = 100;

        set!(world, (sniper));
    }
    fn snipe(world: IWorldDispatcher, player_id: u32, target: felt252) {
        let mut player = get!(world, player_id, (Sniper));

        let mut target = get!(world, target, (Sniper));

        if (player.health == 0 || target.health == 0) {
            return;
        }

        if (player.last_action + 360 > get_block_timestamp()) {
            return;
        }

        if (target.player_id == player_id) {
            return;
        }

        if (target.hidden_until < get_block_timestamp()) {
            if (target.health == 25) {
                target.health = 0;
                player.total_kill_count += 1;
                target.killed_by = player_id;
            } else {
                target.health -= 25;
            }
        } else {
            if (player.health == 25) {
                player.health = 0;
                target.total_kill_count += 1;
                player.killed_by = player_id;
            } else {
                player.health -= 25;
            }
        }

        player.last_action = get_block_timestamp();

        set!(world, (player, target));
    }
    fn cover(world: IWorldDispatcher, player_id: u32) {
        let mut player = get!(world, player_id, (Sniper));

        if (player_id == 0 || player.health == 0 || player.last_action
            + 360 > get_block_timestamp()) {
            return;
        }

        player.hidden_until = get_block_timestamp() + 360;

        player.health += 15;

        set!(world, (player));
    }
    fn get_sniper(world: IWorldDispatcher, player_id: u32) -> Sniper {
        get!(world, player_id, (Sniper))
    }
}
