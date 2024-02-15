use dojo_starter::models::buttonPress::{Button, ButtonPress};

#[derive(Drop, Serde, Copy)]
struct ButtonDetails {
    times_pressed: u64,
    last_pressed: u64,
    seconds_to_press: u32,
}

#[starknet::interface]
trait IButton<TContractState> {
    fn press(self: @TContractState, player_id: u32);
    fn get_details(self: @TContractState) -> ButtonDetails;
    fn get_button_press(self: @TContractState, player_id: u32) -> ButtonPress;
}

const CURRENT_SEASON: u8 = 1;
const SECONDS_TO_PRESS: u32 = 3600;

// dojo decorator
#[dojo::contract]
mod button {
    use super::{IButton, CURRENT_SEASON, SECONDS_TO_PRESS, ButtonDetails};

    use starknet::{get_block_timestamp};
    use dojo_starter::models::buttonPress::{Button, ButtonPress};

    #[abi(embed_v0)]
    impl ButtonImpl of IButton<ContractState> {
        fn press(self: @ContractState, player_id: u32) {
            let world = self.world_dispatcher.read();

            let player = get!(world, player_id, (ButtonPress));

            assert(player.pressed != true, 'Button already pressed');

            let mut button = get!(world, CURRENT_SEASON, (Button));

            if (button.times_pressed > 0) {
                assert(
                    button.last_pressed + (SECONDS_TO_PRESS).into() > get_block_timestamp(),
                    'The world has ended'
                );

                let time_remaining: u64 = button.last_pressed
                    + (SECONDS_TO_PRESS).into()
                    - get_block_timestamp();

                set!(world, (ButtonPress { player: player_id, pressed: true, time_remaining }));
            }

            button.last_pressed = get_block_timestamp();
            button.times_pressed += 1;

            set!(world, (button));
        }

        fn get_details(self: @ContractState) -> ButtonDetails {
            let world = self.world_dispatcher.read();

            let mut button = get!(world, CURRENT_SEASON, (Button));

            if (button.times_pressed == 0) {
                button.last_pressed = get_block_timestamp();
            }

            ButtonDetails {
                times_pressed: button.times_pressed,
                last_pressed: button.last_pressed,
                seconds_to_press: SECONDS_TO_PRESS,
            }
        }

        fn get_button_press(self: @ContractState, player_id: u32) -> ButtonPress {
            let world = self.world_dispatcher.read();

            get!(world, player_id, (ButtonPress))
        }
    }
}
