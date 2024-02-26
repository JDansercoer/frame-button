#[derive(Model, Drop, Serde, Copy)]
struct ButtonPress {
    #[key]
    player: u32,
    pressed: bool,
    time_remaining: u64,
}

#[derive(Model, Drop, Serde, Copy)]
struct Button {
    #[key]
    season: u8,
    last_pressed: u64,
    times_pressed: u64,
    seconds_to_press: u32,
    initialized: u64,
}
