pub mod info_service;
pub mod control_service;

use actix_web::web;


pub fn add_services(cfg: &mut web::ServiceConfig) {
    cfg.service(info_service::get);
    cfg.service(control_service::get);
}