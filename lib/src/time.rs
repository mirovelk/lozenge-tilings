// A macro that generates a label based on the function name
macro_rules! time {
    ($label:expr, $e:expr) => {{
        console::time_with_label($label);
        let result = $e;
        console::time_end_with_label($label);
        result
    }};
}
