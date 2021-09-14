use serde::Deserialize;
use actix_web::get;
use actix_web::web;
use actix_web::Error;
use actix_web::HttpRequest;
use actix_web::HttpResponse;
use actix_web_actors::ws;
use actix::{Actor, ActorContext, Running};
use actix::StreamHandler;
use std::time::Instant;
use uuid::Uuid;
use crate::AppState;

type WsContext = <ControlWebsocket as Actor>::Context;

#[derive(Deserialize)]
struct ChannelRequest {
    channel_id: Uuid,
    values: Vec<f32>,
}

struct ControlWebsocket {
    id: Uuid,
    hb: Instant,
    state: web::Data<AppState>
}

impl Actor for ControlWebsocket {
    type Context = ws::WebsocketContext<Self>;

    fn started(&mut self, ctx: &mut Self::Context) {
        self.handle_start(ctx);
    }

    fn stopping(&mut self, ctx: &mut Self::Context) -> Running {
        self.handle_stop(ctx);
        Running::Stop
    }
}

impl StreamHandler<Result<ws::Message, ws::ProtocolError>> for ControlWebsocket {
    fn handle(&mut self, msg: Result<ws::Message, ws::ProtocolError>, ctx: &mut Self::Context) {
        match msg {
            Ok(ws::Message::Ping(msg)) => self.handle_ping(ctx, &msg),
            Ok(ws::Message::Pong(_)) => self.handle_pong(),
            Ok(ws::Message::Text(text)) => self.handle_text(text),
            Ok(ws::Message::Close(reason)) => {
                ctx.close(reason);
                ctx.stop();
            }
            _ => ctx.stop(),
        }
    }
}

impl ControlWebsocket {
    fn new(state: web::Data<AppState>) -> Self {
        Self {
            hb: Instant::now(),
            id: Uuid::new_v4(),
            state,
        }
    }

    fn handle_start(&mut self, _ctx: &mut WsContext) {
        // println!("Websocket ({0}) connected.", self.id);
    }

    fn handle_stop(&mut self, _ctx: &mut WsContext) {
        // println!("Websocket ({0}) disconnected.", self.id);
    }

    fn handle_pong(&mut self) {
        self.hb = Instant::now();
    }

    fn handle_ping(&mut self, ctx: &mut WsContext, msg: &[u8]) {
        self.hb = Instant::now();
        ctx.pong(&msg);
    }

    fn handle_text(&mut self, text: String) {
        let mut channels = self.state.channels.lock().unwrap();
        let message: ChannelRequest = serde_json::from_str(&text).unwrap();
        for i in 0..channels.len() {
            if channels[i].id == message.channel_id {
                channels[i].values = message.values.clone();
            }
        }
    }
}


#[get("/v1/api/ws/control")]
pub async fn get(r: HttpRequest, stream: web::Payload, state: web::Data<AppState>) -> Result<HttpResponse, Error> {
    let res = ws::start(ControlWebsocket::new(state), &r, stream);
    res
}

