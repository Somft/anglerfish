mod api;

use actix_files::Files;
use actix_web::{App, HttpServer, web};
use crate::api::add_services;
use std::sync::Mutex;
use uuid::Uuid;

pub struct ChannelState {
    id: Uuid,
    name: String,
    values: Vec<f32>,
}

pub struct AppState {
    channels: Mutex<Vec<ChannelState>>
}


const DEFAULT_SAMPLES: usize = 23;
const DEFAULT_SAMPLE_VALUE: f32 = 0_f32;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let state = web::Data::new(AppState {
        channels: Mutex::new(Vec::from([
            ChannelState
            {
                id: Uuid::new_v4(),
                name: String::from("White"),
                values: Vec::from([DEFAULT_SAMPLE_VALUE; DEFAULT_SAMPLES]),
            },
            ChannelState
            {
                id: Uuid::new_v4(),
                name: String::from("Blue"),
                values: Vec::from([DEFAULT_SAMPLE_VALUE; DEFAULT_SAMPLES]),
            },
            ChannelState
            {
                id: Uuid::new_v4(),
                name: String::from("Ultraviolet "),
                values: Vec::from([DEFAULT_SAMPLE_VALUE; DEFAULT_SAMPLES]),
            },
            ChannelState
            {
                id: Uuid::new_v4(),
                name: String::from("Infrared"),
                values: Vec::from([DEFAULT_SAMPLE_VALUE; DEFAULT_SAMPLES]),
            },
        ]))
    });

    let app = move || {
        App::new()
            .app_data(state.clone())
            .configure(add_services)
            .service(Files::new("/", "./static")
                .index_file("index.html"))
    };

    let server = HttpServer::new(app)
        .bind("0.0.0.0:8080")?;

    server.run().await
}
