"""
Flask-based Distance Calculator API.

This module provides a REST API endpoint for calculating distances between two arrays
using different distance metrics (L1 Manhattan distance and L2 Euclidean distance).

The API accepts POST requests with JSON payloads containing two arrays and a distance
type specification, validates the input, and returns the calculated distance value.

Endpoints:
    POST /distances: Calculate distance between two arrays
"""
from flask import Flask, request, jsonify
import numpy as np

app = Flask(__name__)
"""Flask application instance for the distance calculator API."""

@app.route("/distances", methods=["POST"])
def calculate_distance():
    """
    Calculate the distance between two matrices using the specified distance metric.
    
    Expects a JSON request with the following structure:
    {
        "distance": str,  # Distance type: "L1" or "L2"
        "df1": array-like,  # First matrix/array
        "df2": array-like   # Second matrix/array
    }
    
    Returns:
        JSON response containing either:
        - {"distance": float} - The calculated distance value
        - {"error": str} - Error message if validation fails
    
    Raises:
        ValueError: If matrices have different shapes
        ValueError: If distance type is not "L1" or "L2"
    
    Distance Metrics:
        - L1: Manhattan distance (sum of absolute differences)
        - L2: Euclidean distance (square root of sum of squared differences)
    """
    data = request.get_json()
    dist_type = data.get("distance")
    a = np.asarray(data.get("df1"))
    b = np.asarray(data.get("df2"))
    if a.shape != b.shape:
        return jsonify({"error": "Matrices must have the same shape"})
    if dist_type == "L1":
        dist = np.sum(np.abs(a - b))
        return jsonify({"distance": dist})
    elif dist_type == "L2":
        dist = np.sqrt(np.sum((a - b) ** 2))
        return jsonify({"distance": dist})
    else:
        return jsonify({"error": "Invalid distance type"})