// use lozenge_tilings::PeriodicLozengeTiling;

use std::{env, time::Instant};
extern crate lozenge_tilings;

pub fn main() {
    let args: Vec<String> = env::args().collect();

    let default_iterations = 10000;
    let default_q = 0.9;

    let iterations = match args.get(1) {
        Some(iterations) => iterations.parse::<i32>().unwrap_or(default_iterations),
        None => default_iterations,
    };

    let q = match args.get(2) {
        Some(q) => q.parse::<f32>().unwrap_or(default_q),
        None => default_q,
    };

    let mut lozenge_tiling = lozenge_tilings::PeriodicLozengeTiling::new(1, 2, 3, 0, 0, 0);

    let start = Instant::now();
    lozenge_tiling.generate_with_markov_chain(iterations, q);
    let duration = start.elapsed();

    println!("Duration: {:?}", duration);
}
