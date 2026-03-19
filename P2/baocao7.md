# Báo cáo: Manhattan Distance API (Flask)

## 1. Mục tiêu
Xây dựng một microservice bằng Flask để tính **Manhattan distance** giữa hai DataFrame nhận vào dưới dạng JSON. API cung cấp endpoint `POST /manhattan`, xử lý dữ liệu đầu vào, tính khoảng cách và trả về kết quả dạng JSON.

## 2. Dữ liệu
- **Đầu vào:** JSON chứa hai mảng 2 chiều `df1` và `df2`.
- **Ví dụ:**
  ```json
  {
    "df1": [[1, 2], [3, 4]],
    "df2": [[2, 0], [1, 3]]
  }
  ```
- **Ý nghĩa:** mỗi mảng 2 chiều được chuyển thành `pandas.DataFrame` để tính toán.

## 3. Phương pháp luận
### 3.1. Mức ý tưởng
Mục tiêu của hệ thống là đo “độ khác nhau” giữa hai bảng số liệu cùng kích thước. Khoảng cách Manhattan (còn gọi là khoảng cách L1) tính bằng tổng độ lệch tuyệt đối giữa các phần tử tương ứng. Công thức tổng quát:

\[ D = \sum_{i,j} |A_{ij} - B_{ij}| \]

Ưu điểm của Manhattan distance là **đơn giản, dễ tính**, phù hợp để minh họa cách triển khai một API tính toán trên dữ liệu dạng bảng. Khi đưa vào môi trường dịch vụ (microservice), bài toán trở thành: *nhận dữ liệu thô dạng JSON → chuyển thành cấu trúc bảng → tính toán → trả kết quả chuẩn hóa JSON*.

### 3.2. Mức luận lý
Quy trình xử lý được mô hình hóa theo các bước rõ ràng:
1. **Nhận request**: client gửi `POST /manhattan` với body JSON chứa hai mảng `df1` và `df2`.
2. **Parse JSON**: Flask đọc dữ liệu bằng `request.get_json()` để lấy dictionary Python.
3. **Chuyển đổi dữ liệu**: tạo hai `pandas.DataFrame` từ `df1`, `df2` để thao tác ma trận thuận tiện.
4. **Tính toán phần tử**: tính hiệu giữa hai DataFrame, lấy trị tuyệt đối (`abs()`), thu được ma trận khoảng cách theo từng ô.
5. **Tổng hợp kết quả**: cộng toàn bộ phần tử để ra giá trị Manhattan distance cuối cùng.
6. **Trả về JSON**: đóng gói kết quả theo chuẩn `{ "distance": value }` bằng `jsonify`.

Luồng trên đảm bảo dữ liệu đầu vào/đầu ra **có cấu trúc rõ ràng**, phù hợp tích hợp với các hệ thống khác hoặc giao diện web.

### 3.3. Mức vật lý
Triển khai cụ thể trên hệ thống bao gồm các thành phần:
- **Flask app**: file `ch7/app.py` định nghĩa server và route `POST /manhattan`.
- **Hàm tính toán**: file `ch7/src/manhattan.py` chứa hàm `get_manhattan_distance(df1, df2)` sử dụng `pandas`/`numpy` để tính nhanh.
- **Môi trường chạy**: khai báo trong `ch7/requirements.txt` (Flask, pandas, numpy).
- **Kết nối giao tiếp**: client gửi JSON qua HTTP, server trả JSON, bảo đảm tính độc lập nền tảng.

#### Gợi ý hình minh họa
Để báo cáo rõ ràng hơn, có thể chèn hình theo các hướng sau:
- **Sơ đồ luồng xử lý**: JSON input → DataFrame → Manhattan distance → JSON output.
- **Hình minh họa ma trận**: biểu diễn trực quan hai bảng dữ liệu và ma trận chênh lệch tuyệt đối.
- **Hình minh họa kết quả**: ảnh chụp response từ PowerShell/cURL để chứng minh endpoint hoạt động.

## 4. Cài đặt và chạy chương trình
### 4.1. Phụ thuộc
Các thư viện sử dụng trong bài (khai báo trong `ch7/requirements.txt`):
- `pandas==2.2.3`
- `flask==3.1.0`
- `pytest`
- `pytest-cov`
- `flasgger`

### 4.2. Chạy bằng Python
1. Vào thư mục `ch7`.
2. Chạy:
   ```bash
   python app.py
   ```
3. Server chạy tại `http://localhost:5000`.

### 4.3. Chạy bằng Docker (tùy chọn)
```bash
docker build -t manhattan-distance-api .
docker run -p 5000:5000 manhattan-distance-api
```

## 5. Kết quả
### 5.1. Request mẫu
```bash
curl -X POST http://127.0.0.1:5000/manhattan \
  -H "Content-Type: application/json" \
  -d '{"df1": [[1, 2], [3, 4]], "df2": [[2, 0], [1, 3]]}'
```

### 5.2. Response mẫu
```json
{
  "distance": 6.0
}
```

### 5.3. Kết quả kiểm thử (pytest)
```bash
pytest tests/test_manhattan.py -v
```

```
collected 6 items

tests/test_manhattan.py::test_normal_case_distance PASSED
tests/test_manhattan.py::test_different_shapes_raise_value_error PASSED
tests/test_manhattan.py::test_empty_dataframes_raise_value_error PASSED
tests/test_manhattan.py::test_one_by_one_matrices PASSED
tests/test_manhattan.py::test_large_dataframes PASSED
tests/test_manhattan.py::test_missing_keys_in_json_raises_key_error PASSED

6 passed in 0.98s
```

## 6. Nhận xét
- API đơn giản, dễ mở rộng và tích hợp với các hệ thống khác.
- Việc dùng `pandas.DataFrame` giúp thao tác ma trận gọn và rõ ràng.
- Có thể bổ sung kiểm tra lỗi đầu vào để tránh trường hợp thiếu khóa `df1/df2` hoặc kích thước không khớp.
- Bộ kiểm thử pytest giúp xác thực cả trường hợp đúng và sai (shape khác nhau, empty, thiếu khóa JSON).

## 7. Ghi nhận logging và kiểm thử
### 7.1. Logging khi chạy server
Khi chạy `python app.py`, hệ thống ghi lại log có cấu trúc (timestamp, level, message). Ví dụ log từ phiên chạy thực tế:

```
2026-03-19 07:27:44,002 - INFO - Incoming request: method=POST path=/manhattan payload={'df1': [[1, 2], [3, 4]], 'df2': [[2, 0], [1, 3]]}
2026-03-19 07:27:44,003 - INFO - Calculated Manhattan distance: 6.0
2026-03-19 07:27:44,004 - INFO - 127.0.0.1 - - [19/Mar/2026 07:27:44] "POST /manhattan HTTP/1.1" 200 -
```

Logging giúp dễ theo dõi request, dữ liệu đầu vào và kết quả đầu ra, đồng thời hỗ trợ gỡ lỗi nếu xảy ra ngoại lệ.

### 7.2. Ghi nhận test suite
- Đã tạo `tests/test_manhattan.py` với 6 test case theo yêu cầu.
- Toàn bộ test **pass** (6/6), xác nhận hàm tính toán và endpoint hoạt động ổn định.

## 8. Các phần đã thêm theo từng Todo
### 8.1. Todo 1 – Add test cases (Pytest)
**File đã thêm:** `tests/test_manhattan.py` với 6 test case.

**Ví dụ test case tiêu biểu:**
```python
def test_normal_case_distance():
    df1 = pd.DataFrame([[1, 2], [3, 4]])
    df2 = pd.DataFrame([[2, 0], [1, 3]])
    assert get_manhattan_distance(df1, df2) == 6.0
```

**Giải thích:**
- Kiểm tra trường hợp chuẩn với dữ liệu mẫu trong README.
- Các test khác kiểm tra shape khác nhau, DataFrame rỗng, ma trận 1x1, DataFrame lớn, và thiếu khóa JSON trong API.

### 8.2. Todo 2 – Add logging (Flask app)
**Phần code đã thêm (rút gọn):**
```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)
```

**Giải thích:**
- `logging.basicConfig(...)` cấu hình log với mức `INFO` và định dạng có timestamp, level, message.
- Điều này giúp theo dõi request và kết quả trong terminal khi chạy server.

**Phần code đã thêm ở route:**
```python
logging.info(
    "Incoming request: method=%s path=%s payload=%s",
    request.method,
    request.path,
    data,
)
...
logging.info("Calculated Manhattan distance: %s", dist)
```

**Giải thích:**
- Log request giúp ghi lại phương thức, đường dẫn và payload JSON.
- Log kết quả giúp xác nhận giá trị Manhattan distance được tính.

**Phần code xử lý lỗi:**
```python
except Exception as exc:
    logging.error("Error while processing request: %s", exc, exc_info=True)
    return jsonify({"error": str(exc)}), 400
```

**Giải thích:**
- Bắt mọi lỗi phát sinh và ghi log mức `ERROR`.
- Trả về JSON lỗi với HTTP status 400 để client biết request thất bại.

### 8.3. Todo 3 – Add error handling (API)
**Phần xử lý lỗi đã thêm (rút gọn):**
```python
if data is None:
    return jsonify({"error": "Request body must be valid JSON."}), 400
if "df1" not in data or "df2" not in data:
    return jsonify({"error": "JSON payload must include df1 and df2."}), 400
```

```python
try:
    df1 = pd.DataFrame(data["df1"])
    df2 = pd.DataFrame(data["df2"])
except Exception:
    return jsonify({"error": "Invalid data format for df1 or df2."}), 400

if df1.shape != df2.shape:
    return jsonify({"error": "df1 and df2 must have the same shape."}), 400
```

```python
except Exception:
    return jsonify({"error": "Internal server error."}), 500
```

**Giải thích:**
- Trả lỗi 400 khi JSON rỗng/thiếu khóa, dữ liệu không hợp lệ, hoặc shape không khớp.
- Trả lỗi 500 cho các lỗi không lường trước.
- Tất cả lỗi đều trả JSON rõ ràng để client dễ xử lý.

**Kết quả test lỗi (thiếu `df1`):**
```
{ "error": "JSON payload must include df1 and df2." }
```

### 8.4. Todo 4 – Add documentation (Swagger UI)
**Phần code đã thêm (rút gọn):**
```python
from flasgger import Swagger, swag_from

app = Flask(__name__)
Swagger(app)
```

**Giải thích:**
- `Swagger(app)` khởi tạo giao diện Swagger UI tại `/apidocs`.
- `@swag_from(...)` mô tả chi tiết endpoint, schema request/response và ví dụ minh họa.

**Mô tả schema chính:**
```python
"requestBody": {
    "required": True,
    "content": {
        "application/json": {
            "schema": {
                "type": "object",
                "properties": {
                    "df1": {"type": "array", "items": {"type": "array", "items": {"type": "number"}}},
                    "df2": {"type": "array", "items": {"type": "array", "items": {"type": "number"}}},
                },
                "required": ["df1", "df2"],
            },
            "example": {"df1": [[1, 2], [3, 4]], "df2": [[2, 0], [1, 3]]},
        }
    },
}
```

**Kết quả:** truy cập `http://127.0.0.1:5000/apidocs` sẽ thấy Swagger UI với nút **Try it out**.

### 8.5. Bổ sung validation trong `get_manhattan_distance`
**Phần code đã thêm (rút gọn):**
```python
if df1.empty or df2.empty:
    raise ValueError("Input DataFrames must not be empty.")
if df1.shape != df2.shape:
    raise ValueError("Input DataFrames must have the same shape.")
```

**Giải thích:**
- Đảm bảo dữ liệu đầu vào hợp lệ trước khi tính toán.
- Tránh lỗi ngầm khi kích thước không khớp hoặc dữ liệu rỗng.

## 9. Kết luận
Bài thực hành đã xây dựng thành công một **Manhattan Distance API** với Flask, xử lý JSON đầu vào, tính toán khoảng cách Manhattan chính xác và trả về kết quả dạng JSON. Đây là nền tảng tốt để phát triển các dịch vụ tính toán dữ liệu khác.
