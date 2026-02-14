# Hướng Dẫn Tích Hợp Figma Design vào React App

Hướng dẫn này sẽ giúp bạn sử dụng MCP Figma để lấy thông tin từ file Figma design và tích hợp vào React application.

## File Figma Design

Bạn đã có file Figma design tại:
**https://www.figma.com/design/e1tAQ6KFSjM0RXuBZ58my0/Simple-Social-Media-Application--Community-?node-id=1-3&t=2mC7Gup9nWNBykkO-4**

## Bước 1: Chuẩn Bị MCP Figma Server

1. Đảm bảo bạn đã cấu hình MCP Figma server theo hướng dẫn trong [mcp-figma-setup-vi.md](./mcp-figma-setup-vi.md)

2. Mở Command Palette (`F1` hoặc `Ctrl+Shift+P` / `Cmd+Shift+P`)

3. Tìm kiếm `MCP: List Servers`

4. Chọn `Framelink Figma MCP` và nhấp `Start Server`

5. Nhập Personal Access Token (PAT) từ Figma

## Bước 2: Lấy Thông Tin Từ Figma Design

### Cách 1: Sử dụng GitHub Copilot Agent Mode với MCP Figma

Sau khi MCP Figma server đã chạy, bạn có thể yêu cầu GitHub Copilot:

```text
Sử dụng MCP Figma để phân tích file Figma này và trích xuất thông tin về:
- Colors (màu sắc)
- Typography (font chữ, kích thước)
- Spacing (khoảng cách)
- Components structure (cấu trúc components)
- Layout information (thông tin layout)

Link Figma: https://www.figma.com/design/e1tAQ6KFSjM0RXuBZ58my0/Simple-Social-Media-Application--Community-?node-id=1-3&t=2mC7Gup9nWNBykkO-4
```

### Cách 2: Lấy Link Của Từng Section

Theo hướng dẫn trong `02-javascript-codespace-vi.md`, bạn cần lấy link của 5 sections:

1. **Home** - Trang chủ
2. **Search** - Trang tìm kiếm
3. **Post Details** - Chi tiết bài viết
4. **Post Modal** - Modal tạo bài viết
5. **Name Input Modal** - Modal nhập tên

**Cách lấy link:**
1. Mở file Figma design
2. Chọn section bạn muốn (ví dụ: Home)
3. Nhấp chuột phải vào section
4. Chọn `Copy/Paste as` → `Copy link to selection`
5. Lưu lại link này

## Bước 3: Tạo React Components Từ Figma Design

Sau khi đã có thông tin từ Figma, sử dụng prompt sau trong GitHub Copilot Agent Mode:

### Prompt Template cho Từng Section

```text
Tôi muốn xây dựng một React web app. Hãy làm theo các hướng dẫn sau.

- Thư mục làm việc của bạn là `javascript`.
- Xác định tất cả các bước trước, những gì bạn sẽ làm.
- Có một backend API app đang chạy trên `http://localhost:8000`.
- Sử dụng `openapi.yaml` mô tả tất cả các endpoints và data schema.
- Sử dụng cổng số `3000`.
- Tạo tất cả các UI components được định nghĩa trong link này: [FIGMA_SECTION_LINK].
- KHÔNG thêm bất cứ thứ gì không liên quan đến UI components.
- KHÔNG thêm bất cứ thứ gì không được định nghĩa trong `openapi.yaml`.
- KHÔNG sửa đổi bất cứ thứ gì được định nghĩa trong `openapi.yaml`.
- Hiển thị chỉ báo trực quan khi backend API không khả dụng hoặc không thể truy cập vì bất kỳ lý do nào.
- Sử dụng Tailwind CSS cho styling.
- Đảm bảo responsive design cho mobile và desktop.
```

**Thay thế `[FIGMA_SECTION_LINK]` bằng link của từng section:**
- Home section link
- Search section link
- Post Details section link
- Post Modal section link
- Name Input Modal section link

## Bước 4: Trích Xuất Design Tokens

Bạn có thể yêu cầu GitHub Copilot trích xuất design tokens từ Figma:

```text
Sử dụng MCP Figma để trích xuất design tokens từ file Figma này và tạo file theme.js với:
- Colors palette
- Typography (font families, sizes, weights)
- Spacing scale
- Border radius
- Shadows
- Breakpoints

Link Figma: https://www.figma.com/design/e1tAQ6KFSjM0RXuBZ58my0/Simple-Social-Media-Application--Community-?node-id=1-3&t=2mC7Gup9nWNBykkO-4
```

## Bước 5: Tích Hợp Design Tokens vào Tailwind

Sau khi có design tokens, cập nhật `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Thêm colors từ Figma design
        primary: '#YOUR_COLOR',
        secondary: '#YOUR_COLOR',
        // ...
      },
      fontFamily: {
        // Thêm fonts từ Figma design
      },
      spacing: {
        // Thêm spacing scale từ Figma design
      },
    },
  },
  plugins: [],
}
```

## Cấu Trúc Components Đề Xuất

Dựa trên hướng dẫn và OpenAPI spec, bạn sẽ cần các components sau:

```
src/
├── components/
│   ├── common/
│   │   ├── Layout.jsx          # Layout chính
│   │   ├── NavBar.jsx           # Navigation bar
│   │   └── FloatingActionButton.jsx  # FAB button
│   ├── post/
│   │   └── PostCard.jsx         # Card hiển thị post
│   ├── comment/
│   │   ├── CommentItem.jsx      # Item comment
│   │   └── CommentInput.jsx     # Input để thêm comment
│   └── modal/
│       ├── Modal.jsx            # Base modal component
│       ├── PostingModal.jsx     # Modal tạo/chỉnh sửa post
│       └── NameInputModal.jsx   # Modal nhập tên user
├── pages/
│   ├── HomePage.jsx             # Trang chủ
│   ├── SearchPage.jsx           # Trang tìm kiếm
│   ├── PostDetailPage.jsx       # Trang chi tiết post
│   └── ProfilePage.jsx           # Trang profile (optional)
├── api/
│   ├── apiClient.js             # API client setup
│   └── apiService.js            # API service functions
├── context/
│   └── AuthContext.jsx          # Context cho username
└── styles/
    └── theme.js                 # Design tokens từ Figma
```

## Ví Dụ Prompt Hoàn Chỉnh

Đây là một prompt hoàn chỉnh bạn có thể sử dụng với GitHub Copilot Agent Mode:

```text
Tôi muốn xây dựng một React web app cho Simple Social Media Application. Hãy làm theo các hướng dẫn sau.

**Thông tin dự án:**
- Thư mục làm việc: `javascript`
- Backend API: `http://localhost:8000`
- Port: `3000`
- Framework: ViteJS + React
- Styling: Tailwind CSS

**Tài liệu tham khảo:**
- OpenAPI spec: `openapi.yaml`
- Product requirements: `product-requirements.md`
- Figma design: https://www.figma.com/design/e1tAQ6KFSjM0RXuBZ58my0/Simple-Social-Media-Application--Community-?node-id=1-3&t=2mC7Gup9nWNBykkO-4

**Yêu cầu:**
1. Sử dụng MCP Figma để phân tích file Figma và trích xuất:
   - Design tokens (colors, typography, spacing)
   - Component structure
   - Layout information

2. Tạo file `src/styles/theme.js` với design tokens từ Figma

3. Cập nhật `tailwind.config.js` với design tokens

4. Tạo các components theo cấu trúc đã định nghĩa

5. Đảm bảo:
   - Responsive design
   - Error handling khi API không khả dụng
   - Tuân thủ OpenAPI spec
   - Không thêm features không có trong spec

6. Xác định tất cả các bước trước khi bắt đầu
```

## Lưu Ý Quan Trọng

1. **MCP Figma Server phải đang chạy** trước khi yêu cầu AI phân tích Figma
2. **Lưu lại tất cả các link Figma sections** để sử dụng sau
3. **Kiểm tra design tokens** sau khi trích xuất để đảm bảo chính xác
4. **Test từng component** sau khi tạo
5. **Đảm bảo responsive** trên cả mobile và desktop

## Troubleshooting

### MCP Figma không kết nối được
- Kiểm tra PAT token có đúng không
- Đảm bảo server đã được start
- Thử restart Cursor IDE

### Không lấy được thông tin từ Figma
- Kiểm tra link Figma có đúng không
- Đảm bảo bạn có quyền truy cập file Figma
- Thử với link section cụ thể thay vì link file chung

### Design tokens không chính xác
- Kiểm tra lại trong Figma
- Có thể cần điều chỉnh thủ công một số giá trị
- Sử dụng Figma Dev Mode để xem chính xác hơn

---

**Chúc bạn thành công với việc tích hợp Figma design!** 🎨
