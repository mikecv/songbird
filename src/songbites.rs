// Songbite structure and methods.

use log::info;
// use log::debug;

use crate::settings::Settings;
use crate::SETTINGS;

// Struct of parameters for sound bite manipulation.
pub struct Songbite {
    pub settings: Settings,
}

// Initialise all struct variables.
// This method called at the start.
impl Songbite {
    pub fn init() -> Self {
        info!("Initialising Songbite struct.");

        // Lock the global SETTINGS to obtain access to the Settings object.
        let settings = SETTINGS.lock().unwrap().clone();

        Songbite {
            settings: settings,
        }
    }
}
