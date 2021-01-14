use serde::Serialize;
use actix_web::get;
use actix_web::Responder;
use actix_web::HttpResponse;

#[derive(Serialize)]
struct InfoResponse {
    version: String,
}

#[get("/v1/api/rest/info")]
pub async fn get() -> impl Responder {
    HttpResponse::Ok().json(InfoResponse {
        version: String::from(env!("CARGO_PKG_VERSION")),
    })
}