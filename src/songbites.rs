// Songbite structure and methods.

use log::info;
use log::debug;

use hound::WavReader;
use std::time::{Instant, Duration};

use crate::settings::Settings;
use crate::SETTINGS;

// Struct of parameters for sound bite manipulation.
pub struct Songbite {
    pub settings: Settings,
    pub image_file: String,
    pub load_duration: Duration,
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
            image_file: String::from(""),
            load_duration: Duration::new(0, 0),
        }
    }
}

// Method to load a brand new sound file for analysis.
impl Songbite {
    pub fn load_new_file(&mut self, in_file:String) {

        debug!("Initialising new sound file: {:?}", in_file);
    
        // Initialise timer for load file function.
        let load_start = Instant::now();

        // Store filename so it can be served later.
        self.image_file = in_file.clone();

        let _ = read_wav_samples(&in_file);

        // Determine delta time for load function.
        self.load_duration = load_start.elapsed();
        info!("Time for upload: {:?}", self.load_duration)
    }
}

// Function to load sound files for processing.
fn read_wav_samples(path: &str) -> Result<Vec<i16>, Box<dyn std::error::Error>> {
    let reader = WavReader::open(path)?;
    let samples = reader.into_samples::<i16>().collect::<Result<Vec<_>, _>>()?;
    Ok(samples)
}
