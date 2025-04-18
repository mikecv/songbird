// Song key shifting application.

use log::info;
use log4rs;

use actix_files as fsx;
use actix_multipart::Multipart;
use actix_web::{get, web, App, HttpServer, HttpResponse, Responder, post};
use futures_util::StreamExt;
use futures_util::TryStreamExt;
use lazy_static::lazy_static;
use std::fs;
use std::sync::{Arc, Mutex};
use tokio::fs::File;
use tokio::io::AsyncReadExt;
use tokio::io::AsyncWriteExt;

use crate::settings::Settings;
use crate::songbites::Songbite;

pub mod settings;
pub mod songbites;

// Create a global variable for application settings.
// This will be available in other files.
lazy_static! {
    static ref SETTINGS: Mutex<Settings> = {
        // Read YAML settings file.
        let mut file = futures::executor::block_on(File::open("settings.yml")).expect("Unable to open file");
        let mut contents = String::new();
        futures::executor::block_on(file.read_to_string(&mut contents)).expect("Unable to read file");

        // Deserialize YAML into Settings struct.
        let settings: Settings = serde_yaml::from_str(&contents).expect("Unable to parse YAML");
        Mutex::new(settings)
    };
}

#[get("/")]
async fn intro() -> impl Responder {
    HttpResponse::Ok().content_type("text/html").body(include_str!("../static/index.html"))
}

#[post("/upload-audio")]
async fn upload_audio(mut payload: Multipart) -> impl Responder {

    // Get application settings in scope.
    let settings: Settings = SETTINGS.lock().unwrap().clone();

    while let Ok(Some(mut field)) = payload.try_next().await {
        let content_disposition = field.content_disposition().unwrap();
        let filename = content_disposition.get_filename().unwrap_or("upload.mp3");
        info!("Music file selected: {:?}", filename);
        let filepath = format!("{}{}", settings.songbites_folder, sanitize_filename::sanitize(filename));
        info!("Music file uploaded path: {:?}", filepath);

        let mut f = File::create(filepath).await.unwrap();
        while let Some(chunk) = field.next().await {
            let data = chunk.unwrap();
            f.write_all(&data).await.unwrap();
        }
    }
    HttpResponse::Ok().body("File uploaded successfully!")
}

async fn help(settings: web::Data<Settings>) -> impl Responder {
    // Help endpoint function.
    // Read the help file.
    let help_file_content = fs::read_to_string("./static/help.html")
        .expect("Unable to read help file");

    // Replace the version placeholder with the actual version number from settings.
    // Repeat as necessary for other setting information required in help.
    let help_content = help_file_content.replace("{{version}}", &settings.program_ver);

    HttpResponse::Ok().content_type("text/html").body(help_content)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Create folders if they don't already exist.
    fs::create_dir_all("./logs")?;
    fs::create_dir_all("./songbites")?;

    // Logging configuration held in log4rs.yml .
    log4rs::init_file("log4rs.yml", Default::default()).unwrap();

    // Get application settings in scope.
    let settings: Settings = SETTINGS.lock().unwrap().clone();
    // Do initial program version logging, mainly as a test.
    info!("Application started: {} v({})", settings.program_name, settings.program_ver);

    // Instantiate a songbite struct.
    // Call init method to initialise struct.
    let _songbite = Arc::new(Mutex::new(Songbite::init()));

    // Create and start web service.
    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(settings.clone()))
            .service(fsx::Files::new("/songbits", "./songbites").show_files_listing())
            .service(intro)
            .service(upload_audio)
            .service(actix_files::Files::new("/static", "./static").show_files_listing())
            .route("/help", web::get().to(help))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
