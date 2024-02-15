use dojo_starter::models::{
    beast::{Beast, Player, BeastCounter, BEAST_COUNTER_CONFIG, BEAST_CONFIG},
    controls::{FrameBoy, FrameBoyTrait, Button, View}
};
use dojo_starter::systems::{farsniper::{farsniper, Sniper}};

#[derive(Drop, Serde, Copy)]
struct FrameInput {
    button: Button,
    input: felt252
}


#[starknet::interface]
trait IFrameBoy<TContractState> {
    fn state(self: @TContractState, player_id: u32, game_id: u32) -> FrameBoy;
    fn onload(self: @TContractState, player_id: u32, game_id: u32);
    fn input(self: @TContractState, player_id: u32, game_id: u32, frame_input: FrameInput);
}


#[starknet::interface]
trait ISniper<TContractState> {
    fn get_sniper_state(self: @TContractState, player_id: u32) -> Sniper;
}

// dojo decorator
#[dojo::contract]
mod frame_boy {
    use super::{ISniper, IFrameBoy, FrameInput};

    use starknet::{ContractAddress, get_caller_address, get_block_timestamp};
    use dojo_starter::models::{
        beast::{Beast, Player, BeastCounter, BEAST_COUNTER_CONFIG, BEAST_CONFIG},
        controls::{FrameBoy, FrameBoyTrait, Button, View}
    };

    use dojo_starter::systems::{farsniper::{farsniper, Sniper}};

    #[abi(embed_v0)]
    impl SniperImpl of ISniper<ContractState> {
        fn get_sniper_state(self: @ContractState, player_id: u32) -> Sniper {
            let world = self.world_dispatcher.read();

            get!(world, (player_id), (Sniper))
        }
    }


    #[abi(embed_v0)]
    impl FrameBoyImpl of IFrameBoy<ContractState> {
        fn state(self: @ContractState, player_id: u32, game_id: u32) -> FrameBoy {
            let world = self.world_dispatcher.read();

            get!(world, (player_id, game_id), (FrameBoy))
        }
        fn onload(self: @ContractState, player_id: u32, game_id: u32) {
            let world = self.world_dispatcher.read();

            let mut player = get_frame_state(self, player_id, game_id);

            if (player.player != player_id) {
                let new_player = FrameBoyTrait::new(player_id, game_id);

                let sniper = farsniper::spawn(world, player_id);

                set!(world, (new_player));
            }
        }
        fn input(self: @ContractState, player_id: u32, game_id: u32, frame_input: FrameInput) {
            let world = self.world_dispatcher.read();

            let mut state = get_frame_state(self, player_id, game_id);

            match state.view {
                View::Home => { home_view(self, state, frame_input) },
                View::Snipe => { snipe_view(self, state, frame_input) },
                View::Leaderboard => { leader_board_view(self, state, frame_input) },
            }
        }
    }

    fn home_view(self: @ContractState, mut state: FrameBoy, frame_input: FrameInput) {
        let world = self.world_dispatcher.read();

        match frame_input.button {
            Button::None => {},
            Button::One => { state.view = View::Home },
            Button::Two => { state.view = View::Snipe },
            Button::Three => { state.view = View::Leaderboard },
            Button::Four => { return; },
        }

        set_frame_state(self, state, frame_input);
    }

    fn snipe_view(self: @ContractState, mut state: FrameBoy, frame_input: FrameInput) {
        let world = self.world_dispatcher.read();

        match frame_input.button {
            Button::None => {},
            Button::One => { state.view = View::Home },
            Button::Two => { farsniper::snipe(world, state.player, frame_input.input) },
            Button::Three => { farsniper::cover(world, state.player) },
            Button::Four => { state.view = View::Leaderboard },
        }

        set_frame_state(self, state, frame_input);
    }


    fn leader_board_view(self: @ContractState, mut state: FrameBoy, frame_input: FrameInput) {
        let world = self.world_dispatcher.read();

        match frame_input.button {
            Button::None => {},
            Button::One => { state.view = View::Home },
            Button::Two => { state.view = View::Snipe },
            Button::Three => { return; },
            Button::Four => { return; },
        }

        set_frame_state(self, state, frame_input);
    }


    fn get_frame_state(self: @ContractState, player_id: u32, game_id: u32) -> FrameBoy {
        let world = self.world_dispatcher.read();

        get!(world, (player_id, game_id), (FrameBoy))
    }


    fn set_frame_state(self: @ContractState, mut state: FrameBoy, frame_input: FrameInput) {
        let world = self.world_dispatcher.read();

        state.last_button = state.button;

        state.button = frame_input.button;

        set!(world, (state));
    }
}
