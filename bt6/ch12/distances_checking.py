import numpy as np

def get_euclidean_dist(a: np.ndarray, b: np.ndarray) -> float:
    """Return the squared Euclidean (L2) distance between two arrays."""
    return np.sqrt(np.sum((a - b) ** 2))

def get_euclidean_squared_dist(a: np.ndarray, b: np.ndarray) -> float:
    """Return the squared Euclidean (L2) distance between two arrays."""
    return np.sum((a - b) ** 2)