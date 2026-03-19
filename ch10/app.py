import numpy as np
from flask import Flask, jsonify, request

app = Flask(__name__)


def parse_request_parameters(req):
    data = req.get_json(silent=True)
    if not data:
        raise ValueError("Body JSON is required")

    a = np.asarray(data.get("df1"), dtype=float)
    b = np.asarray(data.get("df2"), dtype=float)
    dist_type = data.get("distance")

    if a.size == 0 or b.size == 0:
        raise ValueError("df1 and df2 are required and must be non-empty matrices")
    if a.shape != b.shape:
        raise ValueError("Matrices must have the same shape")
    if dist_type not in {"L1", "L2"}:
        raise ValueError("Invalid distance type. Use 'L1' or 'L2'")

    return a, b, dist_type


def get_manhattan_dist(a, b):
    print("Info: computing L1 distance...")
    return float(np.sum(np.abs(a - b)))


def get_euclidean_dist_loop(a, b):
    """Loop-based version kept for benchmark comparison in Lab C."""
    dist_2 = 0.0
    for i in range(len(a)):
        for j in range(len(a[i])):
            dist_2 += (a[i][j] - b[i][j]) ** 2
    return float(np.sqrt(dist_2))


def get_euclidean_dist(a, b):
    print("Info: computing L2 distance...")
    return float(np.linalg.norm(a - b))


@app.route("/distances", methods=["POST"])
def calculate_distance():
    try:
        a, b, dist_type = parse_request_parameters(request)
        dist_func = {"L1": get_manhattan_dist, "L2": get_euclidean_dist}[dist_type]
        dist = dist_func(a, b)
        return jsonify({"distance": dist})
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400


if __name__ == "__main__":
    app.run(debug=True)
