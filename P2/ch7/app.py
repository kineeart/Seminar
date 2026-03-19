import logging

from flask import Flask, request, jsonify
import pandas as pd
from flasgger import Swagger, swag_from

from src.manhattan import get_manhattan_distance

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)

app = Flask(__name__)
Swagger(app)


@app.route("/manhattan", methods=["POST"])
@swag_from(
    {
        "tags": ["Manhattan Distance"],
        "summary": "Calculate Manhattan distance between two matrices",
        "description": (
            "Accepts two matrices (df1, df2) as JSON arrays and returns the "
            "Manhattan distance (L1 distance) between them. The matrices must "
            "have the same shape."
        ),
        "requestBody": {
            "required": True,
            "content": {
                "application/json": {
                    "schema": {
                        "type": "object",
                        "properties": {
                            "df1": {
                                "type": "array",
                                "items": {
                                    "type": "array",
                                    "items": {"type": "number"},
                                },
                            },
                            "df2": {
                                "type": "array",
                                "items": {
                                    "type": "array",
                                    "items": {"type": "number"},
                                },
                            },
                        },
                        "required": ["df1", "df2"],
                    },
                    "example": {
                        "df1": [[1, 2], [3, 4]],
                        "df2": [[2, 0], [1, 3]],
                    },
                }
            },
        },
        "responses": {
            "200": {
                "description": "Successful response with Manhattan distance",
                "content": {
                    "application/json": {
                        "schema": {
                            "type": "object",
                            "properties": {
                                "distance": {"type": "number"}
                            },
                        },
                        "example": {"distance": 6.0},
                    }
                },
            },
            "400": {
                "description": "Invalid request payload",
                "content": {
                    "application/json": {
                        "schema": {
                            "type": "object",
                            "properties": {"error": {"type": "string"}},
                        },
                        "example": {
                            "error": "JSON payload must include df1 and df2."
                        },
                    }
                },
            },
            "500": {
                "description": "Internal server error",
                "content": {
                    "application/json": {
                        "schema": {
                            "type": "object",
                            "properties": {"error": {"type": "string"}},
                        },
                        "example": {"error": "Internal server error."},
                    }
                },
            },
        },
    }
)
def calculate_distance():
    data = request.get_json()
    logging.info(
        "Incoming request: method=%s path=%s payload=%s",
        request.method,
        request.path,
        data,
    )

    if data is None:
        logging.error("Missing JSON payload.")
        return jsonify({"error": "Request body must be valid JSON."}), 400

    if "df1" not in data or "df2" not in data:
        logging.error("Missing df1 or df2 in JSON payload.")
        return jsonify({"error": "JSON payload must include df1 and df2."}), 400

    try:
        df1 = pd.DataFrame(data["df1"])
        df2 = pd.DataFrame(data["df2"])
    except Exception as exc:
        logging.error("Failed to create DataFrames: %s", exc, exc_info=True)
        return jsonify({"error": "Invalid data format for df1 or df2."}), 400

    if df1.shape != df2.shape:
        logging.error("Shape mismatch: df1=%s df2=%s", df1.shape, df2.shape)
        return jsonify({"error": "df1 and df2 must have the same shape."}), 400

    try:
        dist = get_manhattan_distance(df1, df2)
        logging.info("Calculated Manhattan distance: %s", dist)
        return jsonify({"distance": dist})
    except Exception as exc:
        logging.error("Error while processing request: %s", exc, exc_info=True)
        return jsonify({"error": "Internal server error."}), 500


if __name__ == "__main__":
    app.run(debug=True)
