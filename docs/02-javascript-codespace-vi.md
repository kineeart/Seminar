# 02: Phát Triển Frontend JavaScript (GitHub Codespace)

## Kịch Bản

Contoso là một công ty bán các sản phẩm cho các hoạt động ngoài trời. Bộ phận marketing của Contoso muốn ra mắt một trang web mạng xã hội nhỏ để quảng bá sản phẩm cho khách hàng hiện tại và tiềm năng.

Với vai trò là một nhà phát triển JavaScript, bạn sẽ xây dựng một ứng dụng frontend JavaScript sử dụng React để giao tiếp với ứng dụng backend API Python.

## Điều Kiện Tiên Quyết

Tham khảo tài liệu [README](../README.md) để chuẩn bị.

> **LƯU Ý**: Hướng dẫn này dành riêng cho **GitHub Codespace**. Nếu bạn đang sử dụng máy tính local, vui lòng tham khảo tài liệu [02-javascript.md](./02-javascript.md).

## Bắt Đầu

- [Kiểm Tra GitHub Copilot Agent Mode](#kiểm-tra-github-copilot-agent-mode)
- [Chuẩn Bị Custom Instructions](#chuẩn-bị-custom-instructions)
- [Chuẩn Bị Dự Án Ứng Dụng](#chuẩn-bị-dự-án-ứng-dụng)
- [Chuẩn Bị Figma MCP Server](#chuẩn-bị-figma-mcp-server)
- [Tạo UI Components Từ Figma](#tạo-ui-components-từ-figma)
- [Chạy FastAPI Backend App](#chạy-fastapi-backend-app)
- [Xây Dựng React Frontend App](#xây-dựng-react-frontend-app)
- [Xác Minh React Frontend App](#xác-minh-react-frontend-app)

### Kiểm Tra GitHub Copilot Agent Mode

1. Nhấp vào biểu tượng GitHub Copilot ở phía trên của GitHub Codespace và mở cửa sổ GitHub Copilot.

   ![Open GitHub Copilot Chat](./images/setup-02.png)

2. Nếu bạn được yêu cầu đăng nhập hoặc đăng ký, hãy thực hiện. Dịch vụ này miễn phí.

3. Đảm bảo bạn đang sử dụng GitHub Copilot Agent Mode.

   ![GitHub Copilot Agent Mode](./images/setup-03.png)

4. Chọn model là `GPT-4.1` hoặc `Claude Sonnet 4`.

5. Đảm bảo bạn đã cấu hình [MCP Servers](./00-setup.md#set-up-mcp-servers).

### Chuẩn Bị Custom Instructions

1. Mở terminal trong GitHub Codespace và thiết lập biến môi trường `$REPOSITORY_ROOT`.

   ```bash
   REPOSITORY_ROOT=$(git rev-parse --show-toplevel)
   ```

2. Sao chép custom instructions.

   ```bash
   cp -r $REPOSITORY_ROOT/docs/custom-instructions/javascript/. \
         $REPOSITORY_ROOT/.github/
   ```

### Chuẩn Bị Dự Án Ứng Dụng

1. Đảm bảo bạn đang sử dụng GitHub Copilot Agent Mode với model `Claude Sonnet 4` hoặc `GPT-4.1`.

2. Đảm bảo MCP server `context7` đang chạy.

3. Sử dụng prompt như sau để tạo dự án React web app:

   ```text
   Tôi muốn tạo một dự án React web app. Hãy làm theo các hướng dẫn sau.
   
   - Đảm bảo đây là web app, không phải mobile app.
   - Thư mục làm việc của bạn là `javascript`.
   - Xác định tất cả các bước trước, những gì bạn sẽ làm.
   - Sử dụng ViteJS làm framework cho frontend app.
   - Sử dụng cài đặt mặc định khi khởi tạo dự án.
   - Sử dụng `SimpleSocialMediaApplication` làm tên dự án khi khởi tạo.
   - Sử dụng cổng số `3000`.
   - Chỉ khởi tạo dự án. KHÔNG làm thêm gì nữa.
   ```

4. Nhấp vào nút ![the "keep" button image](https://img.shields.io/badge/keep-blue) của GitHub Copilot để chấp nhận các thay đổi.

### Chuẩn Bị Figma MCP Server

1. Đảm bảo bạn đã cấu hình [MCP Servers](./00-setup.md#set-up-mcp-servers).

2. Lấy personal access token (PAT) từ [Figma](https://www.figma.com/).

3. Mở Command Palette bằng cách nhấn `F1` hoặc `Ctrl`+`Shift`+`P` (Windows/Linux) hoặc `Cmd`+`Shift`+`P` (Mac), và tìm kiếm `MCP: List Servers`.

4. Chọn `Framelink Figma MCP` sau đó nhấp `Start Server`.

5. Nhập PAT mà bạn đã lấy từ Figma.

### Tạo UI Components Từ Figma

1. Đảm bảo bạn đang sử dụng GitHub Copilot Agent Mode với model `Claude Sonnet 4` hoặc `GPT-4.1`.

2. Đảm bảo Figma MCP server đang chạy.

3. Sao chép [Figma design template](https://www.figma.com/community/file/1495954632647006209) vào tài khoản của bạn.

   ![Figma design template page](./images/javascript-01.png)

4. Nhấp chuột phải vào từng section - `Home`, `Search`, `Post Details`, `Post Modal` và `Name Input Modal` 👉 Chọn `Copy/Paste as` 👉 Chọn `Copy link to selection` để lấy link đến từng section. Ghi chú lại tất cả năm link.

### Chạy FastAPI Backend App

1. Đảm bảo ứng dụng FastAPI backend đang chạy.

   Trong GitHub Copilot Chat, nhập:

   ```text
   Chạy FastAPI backend API, nằm trong thư mục `python`.
   ```

   > **LƯU Ý**: Bạn có thể sử dụng ứng dụng mẫu [`complete/python`](../complete/python/) thay thế.

2. **QUAN TRỌNG cho GitHub Codespace**: Đảm bảo cổng số `8000` được đặt là `public` thay vì `private`. Nếu không, bạn sẽ gặp lỗi `401` khi truy cập từ frontend app.

   Để thay đổi:
   - Nhấp vào tab "Ports" ở phía dưới của GitHub Codespace
   - Tìm cổng `8000`
   - Nhấp chuột phải vào cổng `8000` và chọn "Port Visibility" → "Public"

### Xây Dựng React Frontend App

1. Đảm bảo bạn đang sử dụng GitHub Copilot Agent Mode với model `Claude Sonnet 4` hoặc `GPT-4.1`.

2. Đảm bảo MCP server `context7` đang chạy.

3. Đảm bảo bạn có tất cả 5 link Figma section đã lấy từ [phần trước](#tạo-ui-components-từ-figma).

4. Thêm [`product-requirements.md`](../product-requirements.md) và [`openapi.yaml`](../openapi.yaml) vào GitHub Copilot.

5. Sử dụng prompt như sau để xây dựng ứng dụng dựa trên yêu cầu và tài liệu OpenAPI:

   ```text
   Tôi muốn xây dựng một React web app. Hãy làm theo các hướng dẫn sau.
   
   - Thư mục làm việc của bạn là `javascript`.
   - Xác định tất cả các bước trước, những gì bạn sẽ làm.
   - Có một backend API app đang chạy trên `http://localhost:8000`.
   - Sử dụng `openapi.yaml` mô tả tất cả các endpoints và data schema.
   - Sử dụng cổng số `3000`.
   - Tạo tất cả các UI components được định nghĩa trong link này: {{FIGMA_SECTION_LINK}}.
   - KHÔNG thêm bất cứ thứ gì không liên quan đến UI components.
   - KHÔNG thêm bất cứ thứ gì không được định nghĩa trong `openapi.yaml`.
   - KHÔNG sửa đổi bất cứ thứ gì được định nghĩa trong `openapi.yaml`.
   - Hiển thị chỉ báo trực quan khi backend API không khả dụng hoặc không thể truy cập vì bất kỳ lý do nào.
   ```

   > **LƯU Ý**: Thay thế `{{FIGMA_SECTION_LINK}}` bằng một trong năm link Figma mà bạn đã lấy.

6. Lặp lại bước 5 thêm bốn lần nữa cho bốn link Figma design còn lại.

7. Nhấp vào nút ![the "keep" button image](https://img.shields.io/badge/keep-blue) của GitHub Copilot để chấp nhận các thay đổi.

### Xác Minh React Frontend App

1. Đảm bảo ứng dụng FastAPI backend đang chạy.

   Trong GitHub Copilot Chat, nhập:

   ```text
   Chạy FastAPI backend API, nằm trong thư mục `python`.
   ```

2. Xác minh xem ứng dụng có được xây dựng đúng cách hay không.

   Trong GitHub Copilot Chat, nhập:

   ```text
   Chạy React app và xác minh xem app có chạy đúng cách không.

   Nếu app chạy thất bại, phân tích các vấn đề và sửa chúng.
   ```

3. **Trong GitHub Codespace**: 
   - Nhấp vào tab "Ports" ở phía dưới
   - Tìm cổng `3000` (React app)
   - Nhấp chuột phải vào cổng `3000` và chọn "Port Visibility" → "Public" nếu chưa
   - Nhấp vào biểu tượng 🌐 (globe) hoặc link để mở ứng dụng trong trình duyệt

4. Xác minh xem cả frontend và backend apps có chạy đúng cách không.

5. Nhấp vào nút `[keep]` của GitHub Copilot để chấp nhận các thay đổi.

---

## Lưu Ý Quan Trọng cho GitHub Codespace

### Quản Lý Ports

- **Cổng 8000** (Backend API): Phải được đặt là **Public** để frontend có thể truy cập
- **Cổng 3000** (Frontend React): Nên được đặt là **Public** để bạn có thể truy cập từ trình duyệt

### Cách Thay Đổi Port Visibility

1. Nhấp vào tab **"Ports"** ở phía dưới cửa sổ GitHub Codespace
2. Tìm cổng bạn muốn thay đổi (8000 hoặc 3000)
3. Nhấp chuột phải vào cổng
4. Chọn **"Port Visibility"** → **"Public"**

### Truy Cập Ứng Dụng

- Sau khi đặt cổng là Public, bạn sẽ thấy một biểu tượng 🌐 (globe) hoặc một link
- Nhấp vào đó để mở ứng dụng trong trình duyệt mới
- URL sẽ có dạng: `https://<your-codespace-name>-3000.app.github.dev`

---

OK. Bạn đã hoàn thành bước "JavaScript". Hãy chuyển sang [BƯỚC 03: Java Migration from Python](./03-java.md).
