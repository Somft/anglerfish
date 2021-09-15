mod api;

use actix_files::Files;
use actix_web::{App, HttpServer, web};
use crate::api::add_services;
use std::sync::Mutex;
use uuid::Uuid;
use linux_embedded_hal::I2cdev;
use pwm_pca9685::{Address, Channel, Pca9685};
use std::{thread, time};
use chrono::prelude::*;

pub struct ChannelState {
    id: Uuid,
    name: String,
    output: i32,
    values: Vec<f32>,
}

pub struct AppState {
    channels: Mutex<Vec<ChannelState>>,
}


const DEFAULT_SAMPLES: usize = 23;
const DEFAULT_SAMPLE_VALUE: f32 = 0_f32;

fn index_to_channel(index: i32) -> Channel {
    return match index {
        0 => Channel::C0,
        1 => Channel::C1,
        2 => Channel::C2,
        3 => Channel::C3,
        4 => Channel::C4,
        5 => Channel::C5,
        6 => Channel::C6,
        7 => Channel::C7,
        8 => Channel::C8,
        9 => Channel::C9,
        10 => Channel::C10,
        11 => Channel::C11,
        12 => Channel::C12,
        13 => Channel::C13,
        14 => Channel::C14,
        15 => Channel::C15,
        _ => Channel::All
    };
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let state = web::Data::new(AppState {
        channels: Mutex::new(Vec::from([
            ChannelState
            {
                id: Uuid::new_v4(),
                name: String::from("White"),
                output: 0,
                values: Vec::from([DEFAULT_SAMPLE_VALUE; DEFAULT_SAMPLES]),
            },
            ChannelState
            {
                id: Uuid::new_v4(),
                name: String::from("Blue"),
                output: 1,
                values: Vec::from([DEFAULT_SAMPLE_VALUE; DEFAULT_SAMPLES]),
            },
            ChannelState
            {
                id: Uuid::new_v4(),
                name: String::from("Ultraviolet "),
                output: 2,
                values: Vec::from([DEFAULT_SAMPLE_VALUE; DEFAULT_SAMPLES]),
            },
            ChannelState
            {
                id: Uuid::new_v4(),
                name: String::from("Infrared"),
                output: 3,
                values: Vec::from([DEFAULT_SAMPLE_VALUE; DEFAULT_SAMPLES]),
            },
        ]))
    });
    let thread_state = state.clone();

    let _handle = thread::spawn(move || {
        let dev = I2cdev::new("/dev/i2c-1").unwrap();
        let address = Address::default();
        let mut pwm = Pca9685::new(dev, address).unwrap();
        pwm.set_prescale(100).unwrap();
        pwm.enable().unwrap();
        for i in 0..15 {
            pwm.set_channel_on(index_to_channel(i), 0).unwrap();
        }

        loop {
            let channels = thread_state.channels.lock().unwrap();

            for i in 0..channels.len() {
                let output = channels[i].output;
                let new_value = calculate_channel_value(&channels[i]) * 4095_f32;
                pwm.set_channel_off(index_to_channel(output), new_value as u16).unwrap();
            }

            thread::sleep(time::Duration::from_millis(1));
        }
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

fn calculate_channel_value(p0: &ChannelState) -> f32 {
    let max = 24 * 60 * 60 * 1000;
    let scale = 6000;
    let now: DateTime<Local> = Local::now();

    let samples_len = p0.values.len() as u64;

    let mut milliseconds = (((now.hour() * 60 + now.minute()) * 60 + now.second()) * 1000) as u64;
    milliseconds += now.nanosecond() as u64 / 1000000_u64;
    milliseconds = (milliseconds * scale) % max;

    let per_part = max / samples_len;

    let start_sample = milliseconds / per_part;

    let a = p0.values[(start_sample % samples_len) as usize];
    let b = p0.values[((start_sample + 1) %  samples_len) as usize];

    let s = (milliseconds % per_part) as f32 / per_part as f32;

    return a * (1_f32 - s) + b * s;
}