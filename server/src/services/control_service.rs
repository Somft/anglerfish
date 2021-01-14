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

type WsContext = <ControlWebsocket as Actor>::Context;

struct ControlWebsocket {
    id: Uuid,
    hb: Instant,
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
    fn new() -> Self {
        Self {
            hb: Instant::now(),
            id: Uuid::new_v4(),
        }
    }

    fn handle_start(&mut self, ctx: &mut WsContext) {
        println!("Websocket ({0}) connected.", self.id);
    }

    fn handle_stop(&mut self, ctx: &mut WsContext) {
        println!("Websocket ({0}) disconnected.", self.id);
    }

    fn handle_pong(&mut self) {
        self.hb = Instant::now();
    }

    fn handle_ping(&mut self, ctx: &mut WsContext, msg: &[u8]) {
        self.hb = Instant::now();
        ctx.pong(&msg);
    }

    fn handle_text(&mut self, text: String) {
        println!("Received message: {0}", text);
    }
}


#[get("/v1/api/ws/info")]
pub async fn get(r: HttpRequest, stream: web::Payload) -> Result<HttpResponse, Error> {
    let res = ws::start(ControlWebsocket::new(), &r, stream);
    res
}