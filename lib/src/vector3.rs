use wasm_bindgen::JsValue;

#[derive(Debug, Hash, Eq, PartialEq, Clone, Copy)]
pub struct Vector3(pub i32, pub i32, pub i32);

// imlement JsObject trait for Vector3 to return a js array
impl Vector3 {
    pub fn to_js_array(self) -> js_sys::Array {
        let js_array = js_sys::Array::new();
        js_array.push(&JsValue::from(self.0));
        js_array.push(&JsValue::from(self.1));
        js_array.push(&JsValue::from(self.2));
        js_array
    }
}

#[cfg(test)]
mod tests {
    use std::collections::HashMap;

    use crate::vector3::Vector3;

    #[test]
    fn vectors3_with_same_cooridnates_are_equal() {
        assert_eq!(Vector3(1, 2, 3), Vector3(1, 2, 3));
    }

    #[test]
    fn vectors3_with_different_cooridnates_are_not_equal() {
        assert_ne!(Vector3(1, 2, 3), Vector3(1, 2, 4));
    }

    #[test]
    fn can_be_used_as_hashmap_keys() {
        let mut map = HashMap::new();
        map.insert(Vector3(1, 2, 3), 1);
        map.insert(Vector3(1, 2, 4), 2);

        assert_eq!(map.get(&Vector3(1, 2, 3)), Some(&1));

        assert_eq!(map.get(&Vector3(1, 2, 4)), Some(&2));

        assert_eq!(map.get(&Vector3(1, 2, 5)), None);
    }

    #[test]
    fn can_be_used_in_hashset() {
        use std::collections::HashSet;

        let mut set = HashSet::new();
        set.insert(Vector3(1, 2, 3));
        set.insert(Vector3(1, 2, 4));
        set.insert(Vector3(1, 2, 3));

        assert_eq!(set.len(), 2);

        assert!(set.contains(&Vector3(1, 2, 3)));
        assert!(set.contains(&Vector3(1, 2, 4)));
        assert!(!set.contains(&Vector3(1, 2, 5)));
    }
}
