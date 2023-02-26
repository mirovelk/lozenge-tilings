use std::collections::HashMap;

use crate::vector2::Vector2;

// Floor height is -1.
// Value -1 on position (0, 0) is not a box.
// Value 0 on position (0, 0) is a box.
const FLOOR_HEIGHT: i32 = -1;

type BoxHashMap = HashMap<Vector2, i32>;

#[derive(Debug)]
pub struct BoxMap {
    data: BoxHashMap,
}

impl BoxMap {
    pub fn new() -> BoxMap {
        BoxMap {
            data: HashMap::new(),
        }
    }

    pub fn get(&self, position: Vector2) -> &i32 {
        self.data.get(&position).unwrap_or(&FLOOR_HEIGHT)
    }

    pub fn set(&mut self, position: Vector2, height: i32) {
        if height < FLOOR_HEIGHT {
            panic!("Height must be greater than or equal to -1");
        }
        if height == FLOOR_HEIGHT {
            // this can panic if not found but that should not happen
            self.data.remove(&position);
        } else {
            self.data.insert(position, height);
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
    fn can_set_and_get_height() {
        let mut map = BoxMap::new();
        map.set(Vector2(1, 2), 3);
        assert_eq!(map.get(Vector2(1, 2)), &3);
    }

    #[test]
    fn height_0_is_counted_as_a_box() {
        let mut map = BoxMap::new();
        map.set(Vector2(0, 0), 0);
        map.set(Vector2(0, 1), 0);
        assert_eq!(map.box_count(), 2);
    }

    #[test]
    fn height_minus_1_is_not_counted_as_a_box() {
        let mut map = BoxMap::new();
        map.set(Vector2(0, 0), 0);
        map.set(Vector2(0, 1), 0);
        map.set(Vector2(0, 1), -1);
        assert_eq!(map.box_count(), 1);
    }

    #[test]
    fn removes_items_from_map_when_set_to_minus_1() {
        let mut map = BoxMap::new();
        map.set(Vector2(1, 2), 3);
        assert_eq!(map.get(Vector2(1, 2)), &3);
        assert_eq!(map.data.len(), 1);

        map.set(Vector2(1, 2), -1);
        assert_eq!(map.get(Vector2(1, 2)), &-1);
        assert_eq!(map.data.len(), 0);
    }
}
