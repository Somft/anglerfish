use serde::Serialize;
use actix_web::{get, web};
use actix_web::Responder;
use actix_web::HttpResponse;
use crate::{AppState, ChannelState};
use uuid::Uuid;

#[derive(Serialize)]
struct ChannelResponse {
    id: Uuid,
    name: String,
    values: Vec<f32>,
}

#[derive(Serialize)]
struct LightingResponse {
    channels: Vec<ChannelResponse>
}

fn channel_map(c: &ChannelState) -> ChannelResponse {
    return ChannelResponse {
        id: c.id,
        name: c.name.clone(),
        values: c.values.clone(),
    };
}

#[get("/v1/api/rest/lighting")]
pub async fn get_lighting(state: web::Data<AppState>) -> impl Responder {
    let channels = state.channels.lock().unwrap();

    HttpResponse::Ok().json(LightingResponse {
        channels: channels.iter().map(channel_map).collect()
    })
}