from flask import request, jsonify, Flask
import numpy as np

app = Flask(__name__)


def parse_request_parameters(req):
    data = req.get_json()
    
    a = np.array(data.get("df1"))
    b = np.array(data.get("df2"))
    dist_type = data.get("distance")

    # validate shape (giữ logic từ code cũ)
    if a.shape != b.shape:
        raise ValueError("Matrices must have the same shape")

    return a, b, dist_type


def get_manhattan_dist(a, b):
    # L1 distance (vectorized)
    return float(np.sum(np.abs(a - b)))


def get_euclidean_dist(a, b):
    # L2 distance (vectorized thay cho loop)
    return float(np.sqrt(np.sum((a - b) ** 2)))


@app.route("/distances", methods=["POST"])
def calculate_distance():
    try:
        a, b, dist_type = parse_request_parameters(request)
        
        if dist_type == "L1":
            dist = get_manhattan_dist(a, b)
        elif dist_type == "L2":
            dist = get_euclidean_dist(a, b)
        else:
            return jsonify({"error": "Invalid distance type"}), 400
            
        return jsonify({"distance": dist})
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


if __name__ == "__main__":
    app.run(debug=True)
