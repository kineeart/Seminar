import numpy as np

# Sample input pairs for get_euclidean_dist(a, b)
# Each case contains two arrays with the same shape.
SAMPLE_INPUTS = [
    {
        "name": "2d_simple",
        "a": np.array([0, 0]),
        "b": np.array([3, 4]),
    },
    {
        "name": "2d_negative_values",
        "a": np.array([-1, -2]),
        "b": np.array([2, 2]),
    },
    {
        "name": "3d_float_values",
        "a": np.array([1.5, 2.0, -3.0]),
        "b": np.array([0.5, -1.0, 1.0]),
    },
    {
        "name": "5d_vectors",
        "a": np.array([1, 2, 3, 4, 5]),
        "b": np.array([5, 4, 3, 2, 1]),
    },
    {
        "name": "identical_vectors",
        "a": np.array([7, 7, 7]),
        "b": np.array([7, 7, 7]),
    },
]
