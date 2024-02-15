const BEAST_COUNTER_CONFIG: felt252 = 'beast_counter_config';
const BEAST_CONFIG: felt252 = 'beast_config';

#[derive(Model, Drop, Serde, Copy)]
struct Beast {
    #[key]
    beast_id: u32,
    #[key]
    beast_config: felt252,
    beast_type_id: u64,
    health: u64
}

#[derive(Model, Drop, Serde, Copy)]
struct BeastCounter {
    #[key]
    beast_counter_config: felt252,
    count: u32
}


#[derive(Model, Drop, Serde, Copy)]
struct Player {
    #[key]
    player_id: u32,
    last_action: u64,
    total_xp: u32,
    deaths: u32,
    weapon: u32
}
