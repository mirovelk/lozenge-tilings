use rustc_hash::FxHashMap;

use crate::vector2::Vector2;

// Floor height is -1.
// Value -1 on position (0, 0) is not a box.
// Value 0 on position (0, 0) is a box.
const FLOOR_HEIGHT: i32 = -1;

type BoxHashMap = FxHashMap<Vector2, i32>;

#[derive(Debug)]
pub struct BoxMap {
    data: BoxHashMap,
}

impl BoxMap {
    pub fn new() -> BoxMap {
        BoxMap {
            data: FxHashMap::default(),
        }
    }

    pub fn get(&self, position: &Vector2) -> &i32 {
        self.data.get(position).unwrap_or(&FLOOR_HEIGHT)
    }
    pub fn increment(&mut self, position: &Vector2) {
        *self.data.entry(*position).or_insert(FLOOR_HEIGHT) += 1
    }

    pub fn decrement(&mut self, position: &Vector2) {
        match self.data.get_mut(position) {
            Some(value) => {
                *value -= 1;
                if *value == -1 {
                    self.data.remove(position);
                }
            }
            None => {
                panic!("Tried to decrement non-existent value");
            }
        }
    }

    pub fn box_count(&self) -> i32 {
        self.data.values().map(|v| v + 1).sum()
    }

    pub fn clear(&mut self) {
        self.data.clear();
    }
}

#[cfg(test)]
mod tests {
    use crate::box_map::BoxMap;
    use crate::vector2::Vector2;

    #[test]
    fn get_returns_minus_1_for_new_position() {
        let map = BoxMap::new();
        assert_eq!(map.get(&Vector2(0, 0)), &-1);
    }

    #[test]
    fn can_increment_height_of_new_position() {
        let mut map = BoxMap::new();
        let position = Vector2(0, 0);
        assert_eq!(map.get(&position), &-1);
        map.increment(&position);
        assert_eq!(map.get(&position), &0);
    }

    #[test]
    fn can_increment_height_of_existing_position() {
        let mut map = BoxMap::new();
        let position = Vector2(0, 0);
        map.increment(&position);
        assert_eq!(map.get(&position), &0);
        map.increment(&position);
        assert_eq!(map.get(&position), &1);
    }

    #[test]
    fn height_0_is_counted_as_a_box() {
        let mut map = BoxMap::new();
        let position = Vector2(0, 0);
        map.increment(&position);
        assert_eq!(*map.data.get(&position).unwrap(), 0);
        assert_eq!(map.box_count(), 1);
    }

    #[test]
    fn decremented_boxes_to_height_mins_1_are_counted_as_a_box() {
        let mut map = BoxMap::new();
        map.increment(&Vector2(0, 0));
        map.increment(&Vector2(0, 1));
        assert_eq!(map.box_count(), 2);

        map.decrement(&Vector2(0, 1));
        assert_eq!(map.box_count(), 1);
    }
}
