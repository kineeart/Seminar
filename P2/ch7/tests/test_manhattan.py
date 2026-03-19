import os
import sys

import pytest
import pandas as pd

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.manhattan import get_manhattan_distance
from app import app, calculate_distance


def test_normal_case_distance():
    df1 = pd.DataFrame([[1, 2], [3, 4]])
    df2 = pd.DataFrame([[2, 0], [1, 3]])
    assert get_manhattan_distance(df1, df2) == 6.0


def test_different_shapes_raise_value_error():
    df1 = pd.DataFrame([[1, 2], [3, 4]])
    df2 = pd.DataFrame([[1, 2, 3]])
    with pytest.raises(ValueError):
        get_manhattan_distance(df1, df2)


def test_empty_dataframes_raise_value_error():
    df1 = pd.DataFrame()
    df2 = pd.DataFrame()
    with pytest.raises(ValueError):
        get_manhattan_distance(df1, df2)


def test_one_by_one_matrices():
    df1 = pd.DataFrame([[5]])
    df2 = pd.DataFrame([[2]])
    assert get_manhattan_distance(df1, df2) == 3.0


def test_large_dataframes():
    df1 = pd.DataFrame([[i + j for j in range(10)] for i in range(10)])
    df2 = pd.DataFrame([[i for _ in range(10)] for i in range(10)])
    expected = (df1 - df2).abs().to_numpy().sum()
    assert get_manhattan_distance(df1, df2) == float(expected)


def test_missing_keys_in_json_raises_key_error():
    with app.test_request_context(json={"df1": [[1, 2], [3, 4]]}):
        with pytest.raises(KeyError):
            calculate_distance()


if __name__ == "__main__":
    pytest.main()
