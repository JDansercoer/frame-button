use starknet::ContractAddress;


#[derive(Drop, Serde, Copy, Introspect)]
enum Button {
    None: (),
    One: (),
    Two: (),
    Three: (),
    Four: ()
}

#[derive(Drop, Serde, Copy, Introspect)]
enum View {
    Home,
    Snipe,
    Leaderboard,
}

#[derive(Model, Drop, Serde, Copy)]
struct FrameBoy {
    #[key]
    player: u32,
    #[key]
    game_id: u32,
    power: bool,
    button: Button,
    last_button: Button,
    view: View
}

#[generate_trait]
impl FrameBoyImpl of FrameBoyTrait {
    fn new(player: u32, game_id: u32) -> FrameBoy {
        FrameBoy {
            player,
            game_id,
            power: false,
            button: Button::None,
            last_button: Button::None,
            view: View::Home
        }
    }
    fn get_direction(self: FrameBoy) -> Button {
        self.button
    }
    fn get_last_button(self: FrameBoy) -> Button {
        self.last_button
    }
    fn get_view(self: FrameBoy) -> View {
        self.view
    }
    fn set_direction(mut self: FrameBoy, button: Button) {
        self.button = button;
    }
    fn set_last_button(mut self: FrameBoy, button: Button) {
        self.last_button = button;
    }
    fn set_view(mut self: FrameBoy, view: View) {
        self.view = view;
    }
}
