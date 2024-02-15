use dojo_starter::models::{
    beast::{Beast, Player, BeastCounter, BEAST_COUNTER_CONFIG, BEAST_CONFIG}
};

#[starknet::interface]
trait IActions<TContractState> {
    fn spawn(self: @TContractState, player_id: u32);
    fn enter_the_mist(self: @TContractState, player_id: u32);
    fn attack(self: @TContractState, player_id: u32);
    fn check_player(self: @TContractState, player_id: u32) -> Player;
    fn current_beast(self: @TContractState) -> (u64, u64);
}

// dojo decorator
#[dojo::contract]
mod actions {
    use super::IActions;

    use starknet::{ContractAddress, get_caller_address, get_block_timestamp};
    use dojo_starter::models::{
        beast::{Beast, Player, BeastCounter, BEAST_COUNTER_CONFIG, BEAST_CONFIG}
    };

    #[abi(embed_v0)]
    impl ActionsImpl of IActions<ContractState> {
        fn spawn(self: @ContractState, player_id: u32) {
            let world = self.world_dispatcher.read();

            let mut player = get!(world, player_id, (Player));

            if (player.player_id != 0) {
                return;
            }

            set!(world, (Player { player_id, last_action: 0, total_xp: 0, deaths: 0, weapon: 0 }));
        }

        fn enter_the_mist(self: @ContractState, player_id: u32) {
            let world = self.world_dispatcher.read();

            let player = get!(world, player_id, (Player));

            assert(player.player_id != 0, 'Player does not exist');

            let mut beast_counter = get!(world, BEAST_COUNTER_CONFIG, (BeastCounter));

            let beast = get!(world, (beast_counter.count, BEAST_CONFIG), (Beast));

            let beast_type_id: u64 = (get_block_timestamp() % 75) + 1;

            let health = get_block_timestamp() % 3000 + 20;

            if (beast.health == 0 || beast_counter.count == 0) {
                beast_counter.count += 1;

                set!(
                    world,
                    (
                        Beast {
                            beast_id: beast_counter.count,
                            beast_config: BEAST_CONFIG,
                            beast_type_id,
                            health
                        },
                        beast_counter
                    )
                );
            }
        }


        fn attack(self: @ContractState, player_id: u32) {
            let world = self.world_dispatcher.read();

            let player = get!(world, player_id, (Player));

            let beast_counter = get!(world, BEAST_COUNTER_CONFIG, (BeastCounter)).count;

            let mut beast = get!(world, (beast_counter, BEAST_CONFIG), (Beast));

            let mut player = get!(world, player_id, (Player));

            // assert(
            //     player.last_action + (360 * 15) < get_block_timestamp(), 'You need to wait 15 mins'
            // );

            player.last_action = get_block_timestamp();

            if (beast.health > 0) {
                let damage = get_block_timestamp() % 10;

                if (damage > beast.health) {
                    player.total_xp += 50;

                    beast.health = 0;
                } else {
                    beast.health -= damage;
                    player.total_xp += 15;
                }

                set!(world, (player, beast));
            }
        }

        fn check_player(self: @ContractState, player_id: u32) -> Player {
            let world = self.world_dispatcher.read();

            get!(world, player_id, (Player))
        }

        fn current_beast(self: @ContractState) -> (u64, u64) {
            let world = self.world_dispatcher.read();

            let beast_counter = get!(world, BEAST_COUNTER_CONFIG, (BeastCounter)).count;

            let beast = get!(world, (beast_counter, BEAST_CONFIG), (Beast));

            (beast.beast_type_id, beast.health)
        }
    }
}
