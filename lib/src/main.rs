use std::{env, time::Instant};
extern crate lozenge_tilings;

pub fn main() {
    let args: Vec<String> = env::args().collect();

    let default_iterations = 10000;
    let default_q = 0.9;
    let default_draw_distance = 100;

    let iterations = match args.get(1) {
        Some(iterations) => iterations.parse::<i32>().unwrap_or(default_iterations),
        None => default_iterations,
    };

    let q = match args.get(2) {
        Some(q) => q.parse::<f32>().unwrap_or(default_q),
        None => default_q,
    };

    let draw_distance = match args.get(3) {
        Some(draw_distance) => draw_distance
            .parse::<i32>()
            .unwrap_or(default_draw_distance),
        None => default_draw_distance,
    };

    let mut lozenge_tiling = lozenge_tilings::PeriodicLozengeTiling::new(
        1,
        2,
        3,
        draw_distance,
        draw_distance,
        draw_distance,
    );

    let start = Instant::now();
    lozenge_tiling.generate_with_markov_chain(iterations, q);
    let duration = start.elapsed();
    println!("generate_with_markov_chain: {:?}", duration);

    let start = Instant::now();
    lozenge_tiling.get_wall_voxels();
    let duration = start.elapsed();
    println!("get_box_voxels_js: {:?}", duration);
}
