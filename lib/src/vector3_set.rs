use rand::{prelude::IteratorRandom, rngs::ThreadRng};
use std::collections::HashSet;

use crate::vector3::Vector3;

type HasSetVector3 = HashSet<Vector3>;

#[derive(Debug)]
pub struct Vector3Set {
    initial_data: HasSetVector3,
    data: HasSetVector3,
    rng: ThreadRng,
}

impl Vector3Set {
    pub fn new(data: Option<Vec<Vector3>>) -> Vector3Set {
        let data = data.unwrap_or_default();
        let initial_data = HashSet::from_iter(data.clone());
        Vector3Set {
            initial_data,
            data: HashSet::from_iter(data.clone()),
            rng: rand::thread_rng(),
        }
    }

    pub fn insert(&mut self, vector: Vector3) {
        self.data.insert(vector);
    }

    pub fn remove(&mut self, vector: &Vector3) {
        self.data.remove(vector);
    }

    pub fn len(&self) -> usize {
        self.data.len()
    }

    pub fn reset(&mut self) {
        self.data = self.initial_data.clone();
    }

    pub fn get_random(&mut self) -> Option<Vector3> {
        self.data.iter().choose(&mut self.rng).map(|v| *v)
    }
}

#[cfg(test)]
mod tests {
    use crate::vector3::Vector3;
    use crate::vector3_set::Vector3Set;

    #[test]
    fn can_insert() {
        let mut set = Vector3Set::new(None);
        set.insert(Vector3(1, 2, 3));
        assert_eq!(set.len(), 1);
    }

    #[test]
    fn can_remove() {
        let mut set = Vector3Set::new(None);
        set.insert(Vector3(1, 2, 3));
        assert_eq!(set.len(), 1);
        set.remove(&Vector3(1, 2, 3));
        assert_eq!(set.len(), 0);
    }

    #[test]
    fn can_check_if_contains() {
        let mut set = Vector3Set::new(None);
        set.insert(Vector3(1, 2, 3));
        assert!(set.data.contains(&Vector3(1, 2, 3)));
        assert!(!set.data.contains(&Vector3(1, 2, 4)));
    }

    // TODO replace with test for reset
    // #[test]
    // fn can_clear() {
    //     let mut set = Vector3Set::new(None);
    //     set.insert(Vector3(1, 2, 3));
    //     assert_eq!(set.len(), 1);
    //     set.data.clear();
    //     assert_eq!(set.len(), 0);
    // }

    #[test]
    fn does_not_contain_duplicates() {
        let mut set = Vector3Set::new(None);
        set.insert(Vector3(1, 2, 3));
        set.insert(Vector3(1, 2, 3));
        assert_eq!(set.len(), 1);
    }

    #[test]
    fn can_get_random() {
        let mut set = Vector3Set::new(None);
        set.insert(Vector3(1, 2, 3));
        set.insert(Vector3(1, 2, 4));
        assert!(matches!(
            set.get_random(),
            Some(v) if v == Vector3  (1, 2, 3) || v == Vector3  (1, 2, 4)
        ));
    }

    #[test]
    fn get_random_returns_none_when_empty() {
        let mut set = Vector3Set::new(None);
        assert_eq!(set.get_random(), None);
    }
}
