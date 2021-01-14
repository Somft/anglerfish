mod services;

use actix_files::Files;
use actix_web::{App, HttpServer};
use crate::services::add_services;
use std::sync::Mutex;

pub struct AppState {
    pub cache: Mutex<i32>,
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let app = || {
        App::new()
            .configure(add_services)
            .service(Files::new("/", "./static")
                .index_file("index.html"))
    };

    let server = HttpServer::new(app)
        .bind("0.0.0.0:8080")?;

    server.run().await
}
