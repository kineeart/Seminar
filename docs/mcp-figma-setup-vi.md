# Hướng Dẫn Kết Nối MCP Figma

Hướng dẫn này sẽ giúp bạn thiết lập và kết nối MCP (Model Context Protocol) Figma server với Cursor IDE để tích hợp Figma vào quy trình phát triển của bạn.

## Điều Kiện Tiên Quyết

- **Node.js** v16.0 trở lên
- **npm** v7.0 trở lên hoặc **pnpm** v8.0 trở lên
- Tài khoản **Figma** (khuyến nghị dùng Professional hoặc Enterprise)
- **Mã thông báo truy cập API Figma** (Personal Access Token)

## Bước 1: Lấy Mã Thông Báo API Figma

1. Đăng nhập vào tài khoản Figma của bạn
2. Truy cập **Settings** (Cài đặt) → **Security** (Bảo mật)
3. Tìm phần **"Personal access tokens"** (Mã thông báo truy cập cá nhân)
4. Nhấp vào **"Create new token"** (Tạo mã thông báo mới)
5. Đặt tên cho token (ví dụ: "Cursor MCP Integration")
6. **Lưu token này ở nơi an toàn** - bạn sẽ không thể xem lại token sau khi đóng cửa sổ

## Bước 2: Cài Đặt MCP Figma Server

Mở terminal và chạy lệnh sau để cài đặt MCP Figma server:

```bash
npm install -g @modelcontextprotocol/server-figma
```

Hoặc nếu bạn dùng pnpm:

```bash
pnpm add -g @modelcontextprotocol/server-figma
```

## Bước 3: Cấu Hình MCP Server trong Cursor

### Cách 1: Cấu hình qua Settings UI

1. Mở Cursor IDE
2. Nhấn `Ctrl + ,` (hoặc `Cmd + ,` trên Mac) để mở Settings
3. Tìm kiếm "MCP" hoặc "Model Context Protocol"
4. Mở phần **"MCP Servers"** hoặc **"Extensions" → "MCP"**
5. Thêm cấu hình mới với nội dung sau:

```json
{
  "mcpServers": {
    "figma": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-figma"
      ],
      "env": {
        "FIGMA_ACCESS_TOKEN": "YOUR_FIGMA_TOKEN_HERE"
      }
    }
  }
}
```

### Cách 2: Cấu hình qua File Settings JSON

1. Mở Command Palette (`Ctrl + Shift + P` hoặc `Cmd + Shift + P`)
2. Gõ "Preferences: Open User Settings (JSON)"
3. Thêm cấu hình sau vào file settings.json:

```json
{
  "mcpServers": {
    "figma": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-figma"
      ],
      "env": {
        "FIGMA_ACCESS_TOKEN": "YOUR_FIGMA_TOKEN_HERE"
      }
    }
  }
}
```

**Lưu ý:** Thay `YOUR_FIGMA_TOKEN_HERE` bằng mã thông báo API Figma bạn đã tạo ở Bước 1.

## Bước 4: Khởi Động Lại Cursor

Sau khi cấu hình xong, bạn cần:

1. **Khởi động lại Cursor IDE** để áp dụng cấu hình mới
2. Sau khi khởi động lại, MCP Figma server sẽ tự động kết nối

## Bước 5: Kiểm Tra Kết Nối

1. Mở **GitHub Copilot Chat** trong Cursor
2. Thử hỏi AI về các file Figma hoặc yêu cầu trích xuất thông tin từ design
3. Nếu kết nối thành công, AI sẽ có thể truy cập và làm việc với dữ liệu Figma

## Các Tính Năng MCP Figma Cung Cấp

Sau khi kết nối thành công, bạn có thể:

- **Trích xuất thông tin thiết kế** từ file Figma
- **Lấy metadata** của components, frames, và nodes
- **Chuyển đổi design specs** thành code
- **Tự động hóa quy trình** từ design đến implementation
- **Truy vấn thông tin** về colors, typography, spacing từ Figma files

## Ví Dụ Sử Dụng

Sau khi kết nối MCP Figma, bạn có thể yêu cầu AI:

```
"Lấy thông tin về màu sắc và typography từ file Figma [FILE_ID]"
```

```
"Trích xuất spacing và sizing từ component [COMPONENT_NAME] trong file Figma [FILE_ID]"
```

```
"Chuyển đổi design từ Figma file [FILE_ID] thành CSS variables"
```

## Xử Lý Lỗi

### Lỗi: "Cannot connect to MCP server"

- Kiểm tra lại mã thông báo API Figma có đúng không
- Đảm bảo Node.js và npm đã được cài đặt đúng
- Thử chạy lại lệnh cài đặt MCP server

### Lỗi: "Invalid token"

- Tạo lại mã thông báo API Figma mới
- Đảm bảo token chưa hết hạn
- Kiểm tra quyền truy cập của token

### Lỗi: "Command not found"

- Kiểm tra PATH environment variable có chứa npm/npx không
- Thử cài đặt lại MCP server với quyền administrator

## Tài Liệu Tham Khảo

- [MCP Documentation](https://modelcontextprotocol.io/)
- [Figma API Documentation](https://www.figma.com/developers/api)
- [GitHub Copilot MCP Guide](https://code.visualstudio.com/blogs/2025/05/12/agent-mode-meets-mcp)
- [Curated MCP Servers](https://github.com/modelcontextprotocol/servers)

## Bảo Mật

⚠️ **Quan trọng về bảo mật:**

- **KHÔNG** commit mã thông báo API vào Git
- Sử dụng environment variables hoặc Cursor's secure storage
- Xem xét sử dụng token với quyền hạn tối thiểu cần thiết
- Thường xuyên rotate (thay đổi) token để tăng cường bảo mật

---

**Chúc bạn thành công với việc tích hợp MCP Figma!** 🎨
