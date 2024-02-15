#[cfg(test)]
mod tests {
    use starknet::class_hash::Felt252TryIntoClassHash;

    // import world dispatcher
    use dojo::world::{IWorldDispatcher, IWorldDispatcherTrait};

    // import test utils
    use dojo::test_utils::{spawn_test_world, deploy_contract};

    // import test utils
    use dojo_starter::{
        systems::{actions::{actions, IActionsDispatcher, IActionsDispatcherTrait}},
        models::{beast::{Beast, Player, BeastCounter, beast, player, beast_counter}}
    };


    #[test]
    #[available_gas(30000000)]
    fn test_move() {
        // caller
        let caller = starknet::contract_address_const::<0x0>();

        // models
        let mut models = array![
            beast::TEST_CLASS_HASH, player::TEST_CLASS_HASH, beast_counter::TEST_CLASS_HASH
        ];

        // deploy world with models
        let world = spawn_test_world(models);

        // deploy systems contract
        let contract_address = world
            .deploy_contract('salt', actions::TEST_CLASS_HASH.try_into().unwrap());
        let actions_system = IActionsDispatcher { contract_address };

        starknet::testing::set_block_timestamp(6558245);

        let player_id = 1;
        actions_system.spawn(player_id);

        actions_system.enter_the_mist(player_id);

        actions_system.attack(player_id);

        let mut player = get!(world, player_id, (Player));

        println!("total_xp: {:?}", player.total_xp);
    }
}
