mod box_map;
mod vector2;
mod vector3;
mod vector3_set;

#[macro_use]
mod time;

use crate::{vector2::Vector2, vector3_set::Vector3Set};

use box_map::BoxMap;
use rand::Rng;
use vector3::Vector3;
use wasm_bindgen::prelude::*;
use web_sys::console;

#[derive(Debug)]
pub struct DrawDistance {
    pub x: i32,
    pub y: i32,
    pub z: i32,
}

#[derive(Debug)]
pub struct LozengeTilingPeriods {
    pub x_shift: i32,
    pub y_shift: i32,
    pub z_height: i32,
}

struct VoxelBoundaries {
    x_min: i32,
    x_max: i32,
    y_min: i32,
    y_max: i32,
    z_min: i32,
    z_max: i32,
}

#[derive(Debug)]
#[wasm_bindgen]
pub struct PeriodicLozengeTiling {
    data: BoxMap,
    draw_distance: DrawDistance,
    periods: LozengeTilingPeriods,
    addable_boxes: Vector3Set,
    removable_boxes: Vector3Set,
}

impl PeriodicLozengeTiling {
    pub fn new(
        periods_x_shift: i32,
        periods_y_shift: i32,
        periods_z_height: i32,
        draw_distance_x: i32,
        draw_distance_y: i32,
        draw_distance_z: i32,
    ) -> PeriodicLozengeTiling {
        PeriodicLozengeTiling {
            data: BoxMap::new(),
            draw_distance: DrawDistance {
                x: draw_distance_x,
                y: draw_distance_y,
                z: draw_distance_z,
            },
            periods: LozengeTilingPeriods {
                x_shift: periods_x_shift,
                y_shift: periods_y_shift,
                z_height: periods_z_height,
            },
            addable_boxes: Vector3Set::new(Some(vec![Vector3(0, 0, 0)])),
            removable_boxes: Vector3Set::new(None),
        }
    }

    pub fn reset(&mut self) {
        self.data.clear();
        self.addable_boxes.reset();
        self.removable_boxes.reset();
    }

    pub fn set_periods(&mut self, x_shift: i32, y_shift: i32, z_height: i32) {
        self.periods.x_shift = x_shift;
        self.periods.y_shift = y_shift;
        self.periods.z_height = z_height;
        self.reset();
    }

    pub fn set_draw_distance(&mut self, x: i32, y: i32, z: i32) {
        self.draw_distance.x = x;
        self.draw_distance.y = y;
        self.draw_distance.z = z;
    }

    //normalize(x,y,z): (x,y,z) - (y div yShift)(xShift,yShift,-zHeight)
    fn normalize3(&self, vector: &Vector3) -> Vector3 {
        let LozengeTilingPeriods {
            x_shift,
            y_shift,
            z_height,
        } = self.periods;

        if x_shift == 0 && y_shift == 0 {
            return *vector;
        }

        let Vector3(x, y, z) = vector;

        // xShift != 0 || yShift != 0
        let shift = if y_shift >= x_shift {
            y.div_euclid(y_shift)
        } else {
            x.div_euclid(x_shift)
        };

        Vector3(
            x - shift * x_shift,
            y - shift * y_shift,
            z + shift * z_height,
        )
    }

    fn normalize2(&self, vector: &Vector2) -> Vector2 {
        let Vector2(x, y) = vector;
        let Vector3(x, y, _) = self.normalize3(&Vector3(*x, *y, 0));
        Vector2(x, y)
    }

    fn add_addable_box(&mut self, vector: Vector3) {
        self.addable_boxes.insert(self.normalize3(&vector));
    }

    fn remove_addable_box(&mut self, vector: &Vector3) {
        self.addable_boxes.remove(&self.normalize3(vector));
    }

    fn add_removable_box(&mut self, vector: Vector3) {
        self.removable_boxes.insert(self.normalize3(&vector));
    }

    fn remove_removable_box(&mut self, vector: &Vector3) {
        self.removable_boxes.remove(&self.normalize3(vector));
    }

    fn get_height(&self, normalized_vector: &Vector2) -> i32 {
        let saved_height = self.data.get(normalized_vector);

        let Vector2(nx, ny) = normalized_vector;

        let LozengeTilingPeriods {
            x_shift,
            y_shift,
            z_height,
        } = self.periods;

        match y_shift >= x_shift {
            true => match *nx >= 0 {
                true => *saved_height,
                false => saved_height + z_height * ((-nx - 1) / x_shift + 1),
            },
            false => match *ny >= 0 {
                true => *saved_height,
                false => saved_height + z_height * ((-ny - 1) / y_shift + 1),
            },
        }
    }

    fn increment_height(&mut self, vector: &Vector2) {
        self.data.increment(&self.normalize2(vector));
    }

    fn decrement_height(&mut self, vector: &Vector2) {
        self.data.decrement(&self.normalize2(vector));
    }

    fn is_wall(&self, vector: &Vector3) -> bool {
        let LozengeTilingPeriods {
            x_shift,
            y_shift,
            z_height,
        } = self.periods;

        let Vector3(x, y, z) = vector;

        if x_shift == 0 && y_shift == 0 {
            return x < &0 || y < &0 || z < &0;
        }

        let Vector3(nx, ny, nz) = self.normalize3(vector);

        if nz < 0 || z_height == 0 {
            return true;
        }

        if y_shift >= x_shift {
            nx < -(nz / z_height) * x_shift
        } else {
            ny < -(nz / z_height) * y_shift
        }
    }

    fn is_box(&self, vector: &Vector3) -> bool {
        let Vector3(nx, ny, nz) = self.normalize3(vector);
        !self.is_wall(vector) && self.get_height(&Vector2(nx, ny)) >= nz
    }

    // TODO could be optimized but division by 0 causes issues
    fn is_wall_or_box(&self, vector: &Vector3) -> bool {
        self.is_wall(vector) || self.is_box(vector)
    }

    fn can_add_box(&self, vector: &Vector3) -> bool {
        let LozengeTilingPeriods {
            x_shift,
            y_shift,
            z_height,
        } = self.periods;

        let Vector3(x, y, z) = vector;

        if x_shift == 0 && y_shift == 0 && z_height > 0 && *z > z_height - 1 {
            // special case, only height is restricted
            return false;
        }

        !self.is_wall_or_box(vector) && // no box in tested position
        // looking from +y
        self.is_wall_or_box(&Vector3(x - 1, *y, *z)) && // box or wall to left
        self.is_wall_or_box(&Vector3(*x, y - 1, *z)) && // box or wall behind
        self.is_wall_or_box(&Vector3(*x, *y, z - 1)) // box or wall below
    }

    fn can_remove_box(&self, vector: &Vector3) -> bool {
        let Vector3(x, y, z) = vector;

        self.is_box(vector) && // box in tested position
        // TODO fn for plus and minus 1 vectors
        // looking from +y
        !self.is_box(&Vector3(x + 1, *y, *z)) && // no box to right
        !self.is_box(&Vector3(*x, y + 1, *z)) && // no box in front
        !self.is_box(&Vector3(*x, *y, z + 1)) // no box above
    }

    fn add_box(&mut self, vector: Vector3) {
        if self.can_add_box(&vector) {
            let Vector3(x, y, z) = vector;
            let Vector3(nx, ny, nz) = self.normalize3(&vector);

            // add box
            self.increment_height(&Vector2(nx, ny));
            // just added box
            self.remove_addable_box(&Vector3(nx, ny, nz)); // can't be added again
            self.add_removable_box(Vector3(nx, ny, nz)); // can be removed

            // TODO fn for plus and minus 1 vectors
            // update addable boxes
            let addable_boxes = [
                Vector3(x + 1, y, z),
                Vector3(x, y + 1, z),
                Vector3(x, y, z + 1),
            ];
            for addable_box in addable_boxes.iter() {
                if self.can_add_box(addable_box) {
                    self.add_addable_box(*addable_box);
                }
            }

            // update removable boxes
            let removable_boxes = [
                Vector3(x - 1, y, z),
                Vector3(x, y - 1, z),
                Vector3(x, y, z - 1),
            ];
            for removable_box in removable_boxes.iter() {
                if !self.can_remove_box(removable_box) {
                    self.remove_removable_box(removable_box);
                }
            }
        }
    }

    fn remove_box(&mut self, vector: Vector3) {
        if self.can_remove_box(&vector) {
            let Vector3(x, y, z) = vector;
            let Vector3(nx, ny, nz) = self.normalize3(&vector);

            // remove box
            self.decrement_height(&Vector2(nx, ny));
            // just removed box
            self.remove_removable_box(&Vector3(nx, ny, nz)); // can't be removed again
            self.add_addable_box(Vector3(nx, ny, nz)); // can be added

            // update addable boxes
            let addable_boxes = [
                Vector3(x + 1, y, z),
                Vector3(x, y + 1, z),
                Vector3(x, y, z + 1),
            ];
            for addable_box in addable_boxes.iter() {
                if !self.can_add_box(addable_box) {
                    self.remove_addable_box(addable_box);
                }
            }

            // update removable boxes
            let removable_boxes = [
                Vector3(x - 1, y, z),
                Vector3(x, y - 1, z),
                Vector3(x, y, z - 1),
            ];
            for removable_box in removable_boxes.iter() {
                if self.can_remove_box(removable_box) {
                    self.add_removable_box(*removable_box);
                }
            }
        }
    }

    fn get_random_addable_box(&mut self) -> Option<Vector3> {
        self.addable_boxes.get_random()
    }

    fn get_random_removable_box(&mut self) -> Option<Vector3> {
        self.removable_boxes.get_random()
    }

    pub fn add_random_box(&mut self) {
        if let Some(box_position) = self.get_random_addable_box() {
            self.add_box(box_position);
        } else {
            panic!("No addable boxes");
        }
    }

    fn addable_boxes_count(&self) -> usize {
        self.addable_boxes.len()
    }

    fn removable_boxes_count(&self) -> usize {
        self.removable_boxes.len()
    }

    pub fn remove_random_box(&mut self) {
        if let Some(box_position) = self.get_random_removable_box() {
            self.remove_box(box_position);
        }
        // TODO should this panic?
        // else {
        //     panic!("No removable boxes");
        // }
    }

    fn get_voxel_boundaries(&self) -> VoxelBoundaries {
        let draw_distance = &self.draw_distance;
        let LozengeTilingPeriods {
            x_shift,
            y_shift,
            z_height,
        } = self.periods;

        VoxelBoundaries {
            x_min: if x_shift == 0 { -1 } else { -draw_distance.x },
            x_max: draw_distance.x,
            y_min: if y_shift == 0 { -1 } else { -draw_distance.y },
            y_max: draw_distance.y,
            z_min: if z_height == 0 { -1 } else { -draw_distance.z },
            z_max: draw_distance.z,
        }
    }

    fn get_voxels(
        &self,
        match_fn: fn(&PeriodicLozengeTiling, &Vector3) -> bool,
        include_edges: bool,
    ) -> Vec<Vector3> {
        let mut voxels = Vec::new();
        let VoxelBoundaries {
            x_min,
            x_max,
            y_min,
            y_max,
            z_min,
            z_max,
        } = self.get_voxel_boundaries();

        for x in x_min..x_max {
            for y in y_min..y_max {
                for z in z_min..z_max {
                    if match_fn(self, &Vector3(x, y, z)) {
                        let box_to_left = match_fn(self, &Vector3(x + 1, y, z));
                        let box_to_right = match_fn(self, &Vector3(x, y + 1, z));
                        let box_above = match_fn(self, &Vector3(x, y, z + 1));
                        if include_edges
                            && (x == x_min
                                || y == y_min
                                || z == z_min
                                || x == x_max - 1
                                || y == y_max - 1
                                || z == z_max - 1)
                            || !box_to_left
                            || !box_to_right
                            || !box_above
                        {
                            voxels.push(Vector3(x, y, z));
                            if !box_above {
                                break;
                            }
                        }
                    }
                }
            }
        }

        voxels
    }

    pub fn get_wall_voxels(&self) -> Vec<Vector3> {
        self.get_voxels(PeriodicLozengeTiling::is_wall, false)
    }

    pub fn get_box_voxels(&self) -> Vec<Vector3> {
        self.get_voxels(PeriodicLozengeTiling::is_box, true)
    }

    pub fn get_period_box_count(&self) -> i32 {
        self.data.box_count()
    }

    pub fn generate_by_adding_only(&mut self, iterations: i32) {
        for _ in 0..iterations {
            self.add_random_box();
        }
    }

    pub fn generate_with_markov_chain(&mut self, iterations: i32, q: f32) {
        let mut rng = rand::thread_rng();

        for _ in 0..iterations {
            let rn1 = rng.gen::<f32>();
            let rn2 = rng.gen::<f32>();

            let num1 = (-1.0 * (1.0 - rn1).ln()) / self.addable_boxes_count() as f32 / q;
            let num2 = (-1.0 * (1.0 - rn2).ln()) / self.removable_boxes_count() as f32;

            if num1 < num2 {
                self.add_random_box();
            } else {
                self.remove_random_box();
            }
        }
    }
}

#[wasm_bindgen]
impl PeriodicLozengeTiling {
    #[wasm_bindgen(constructor)]
    pub fn new_js(
        periods_x_shift: i32,
        periods_y_shift: i32,
        periods_z_height: i32,
        draw_distance_x: i32,
        draw_distance_y: i32,
        draw_distance_z: i32,
    ) -> PeriodicLozengeTiling {
        PeriodicLozengeTiling::new(
            periods_x_shift,
            periods_y_shift,
            periods_z_height,
            draw_distance_x,
            draw_distance_y,
            draw_distance_z,
        )
    }

    #[wasm_bindgen]
    pub fn debug(&self) {
        console::log_1(&JsValue::from(format!("{:?}", &self)));
    }

    #[wasm_bindgen(js_name = reset)]
    pub fn reset_js(&mut self) {
        self.reset();
    }

    #[wasm_bindgen(js_name = setPeriods)]
    pub fn set_periods_js(&mut self, x_shift: i32, y_shift: i32, z_height: i32) {
        self.set_periods(x_shift, y_shift, z_height);
    }

    #[wasm_bindgen(js_name = setDrawDistance)]
    pub fn set_draw_distance_js(&mut self, x: i32, y: i32, z: i32) {
        self.set_draw_distance(x, y, z);
    }

    #[wasm_bindgen(js_name = addRandomBox)]
    pub fn add_random_box_js(&mut self) {
        self.add_random_box();
    }

    #[wasm_bindgen(js_name = removeRandomBox)]
    pub fn remove_random_box_js(&mut self) {
        self.remove_random_box();
    }

    // TODO consider separate impl/trait for conversion to js
    fn vector3_vec_to_js_array(&self, vec: &Vec<Vector3>) -> js_sys::Array {
        let js_array = js_sys::Array::new();
        for vector in vec {
            js_array.push(&vector.to_js_array().into());
        }

        js_array
    }

    // TODO consider Int32Array
    #[wasm_bindgen(js_name = getBoxVoxels)]
    pub fn get_box_voxels_js(&self) -> js_sys::Array {
        time!("get_box_voxels_js", {
            let voxels = self.get_box_voxels();
            self.vector3_vec_to_js_array(&voxels)
        })
    }

    #[wasm_bindgen(js_name = getWallVoxels)]
    pub fn get_wall_voxels_js(&self) -> js_sys::Array {
        time!("get_wall_voxels_js", {
            let voxels = self.get_wall_voxels();
            self.vector3_vec_to_js_array(&voxels)
        })
    }

    #[wasm_bindgen(js_name = getPeriodBoxCount)]
    pub fn get_period_box_count_js(&self) -> i32 {
        self.get_period_box_count()
    }

    #[wasm_bindgen(js_name = generateByAddingOnly)]
    pub fn generate_by_adding_only_js(&mut self, iterations: i32) {
        time!("generate_by_adding_only_js", {
            self.generate_by_adding_only(iterations);
        })
    }

    #[wasm_bindgen(js_name = generateWithMarkovChain)]
    pub fn generate_with_markov_chain_js(&mut self, iterations: i32, q: f32) {
        time!("generate_with_markov_chain_js", {
            self.generate_with_markov_chain(iterations, q)
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn can_determine_initial_boxes_and_walls() {
        let lozenge_tiling = PeriodicLozengeTiling::new(3, 3, 3, 1, 1, 1);
        // no box initilally
        debug_assert!(!lozenge_tiling.is_box(&Vector3(0, 0, 0)));
        // no box on negative sides
        debug_assert!(!lozenge_tiling.is_box(&Vector3(-1, 0, 0)));
        debug_assert!(!lozenge_tiling.is_box(&Vector3(0, -1, 0)));
        debug_assert!(!lozenge_tiling.is_box(&Vector3(0, 0, -1)));
        // all walls on negative sides`
        debug_assert!(lozenge_tiling.is_wall(&Vector3(-1, 0, 0)));
        debug_assert!(lozenge_tiling.is_wall(&Vector3(0, -1, 0)));
        debug_assert!(lozenge_tiling.is_wall(&Vector3(0, 0, -1)));
    }

    #[test]
    fn can_get_wall_voxels() {
        let lozenge_tiling = PeriodicLozengeTiling::new(1, 2, 3, 10, 10, 10);
        lozenge_tiling.get_wall_voxels();
    }

    #[test]
    fn can_generate_with_0_periods() {
        let mut lozenge_tiling = PeriodicLozengeTiling::new(0, 0, 0, 10, 10, 10);
        lozenge_tiling.get_wall_voxels();
        lozenge_tiling.generate_with_markov_chain(5, 0.9);
        debug_assert!(!lozenge_tiling.get_box_voxels().is_empty());
    }
}
