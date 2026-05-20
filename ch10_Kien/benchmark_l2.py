import timeit

import numpy as np

from app import get_euclidean_dist, get_euclidean_dist_loop


def benchmark(size=400, repeats=5, number=20):
    rng = np.random.default_rng(seed=42)
    a = rng.random((size, size))
    b = rng.random((size, size))

    loop_time = min(
        timeit.repeat(lambda: get_euclidean_dist_loop(a, b), repeat=repeats, number=number)
    )
    vectorized_time = min(
        timeit.repeat(lambda: get_euclidean_dist(a, b), repeat=repeats, number=number)
    )

    print(f"Matrix size: {size}x{size}")
    print(f"Runs per repeat: {number}, repeats: {repeats}")
    print(f"Loop L2 (best): {loop_time:.6f} seconds")
    print(f"Vectorized L2 (best): {vectorized_time:.6f} seconds")
    print(f"Speedup: {loop_time / vectorized_time:.2f}x")


if __name__ == "__main__":
    benchmark()