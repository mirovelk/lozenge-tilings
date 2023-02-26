#[derive(Debug, Hash, Eq, PartialEq, Clone, Copy)]
pub struct Vector2(pub i32, pub i32);

#[cfg(test)]
mod tests {
    use std::collections::HashMap;

    use crate::vector2::Vector2;

    #[test]
    fn vectors3_with_same_cooridnates_are_equal() {
        assert_eq!(Vector2(1, 2), Vector2(1, 2));
    }

    #[test]
    fn vectors3_with_different_cooridnates_are_not_equal() {
        assert_ne!(Vector2(1, 2), Vector2(1, 3));
    }

    #[test]
    fn can_be_used_as_hashmap_keys() {
        let mut map = HashMap::new();
        map.insert(Vector2(1, 2), 1);
        map.insert(Vector2(1, 3), 2);

        assert_eq!(map.get(&Vector2(1, 2)), Some(&1));

        assert_eq!(map.get(&Vector2(1, 3)), Some(&2));
    }
}
