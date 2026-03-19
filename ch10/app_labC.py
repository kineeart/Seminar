from flask import Flask, request, jsonify
import numpy as np

app = Flask(__name__)


def parse_request_parameters(req):
    data = req.get_json()
    dist_type = data.get("distance")
    a = np.array(data.get("df1"))
    b = np.array(data.get("df2"))
    return a, b, dist_type


def validate_matrices(a, b):
    if a.shape != b.shape:
        return False
    return True


def get_manhattan_dist(a, b):
    return float(np.sum(np.abs(a - b)))


def get_euclidean_dist(a, b):
    return float(np.sqrt(np.sum((a - b) ** 2)))


@app.route("/distances", methods=["POST"])
def calculate_distance():
    a, b, dist_type = parse_request_parameters(request)

    if not validate_matrices(a, b):
        return jsonify({"error": "Matrices must have the same shape"}), 400

    dist_functions = {
        "L1": get_manhattan_dist,
        "L2": get_euclidean_dist
    }

    dist_func = dist_functions.get(dist_type)

    if not dist_func:
        return jsonify({"error": "Invalid distance type"}), 400

    dist = dist_func(a, b)
    return jsonify({"distance": dist})


if __name__ == "__main__":
    app.run(debug=True)
