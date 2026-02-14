# Hướng Dẫn Nhanh: Thiết Kế React App từ Figma

File này hướng dẫn bạn cách sử dụng file Figma design để tạo React application.

## 📋 Tài Liệu Tham Khảo

- **Hướng dẫn chi tiết**: [../docs/figma-integration-guide-vi.md](../docs/figma-integration-guide-vi.md)
- **Prompt templates**: [FIGMA_PROMPT_TEMPLATE.md](./FIGMA_PROMPT_TEMPLATE.md)
- **Hướng dẫn MCP Figma setup**: [../docs/mcp-figma-setup-vi.md](../docs/mcp-figma-setup-vi.md)

## 🎨 File Figma Design

**Link Figma:** https://www.figma.com/design/e1tAQ6KFSjM0RXuBZ58my0/Simple-Social-Media-Application--Community-?node-id=1-3&t=2mC7Gup9nWNBykkO-4

## ⚡ Bắt Đầu Nhanh

### Bước 1: Chuẩn Bị MCP Figma

1. Đảm bảo đã cấu hình MCP Figma server (xem [mcp-figma-setup-vi.md](../docs/mcp-figma-setup-vi.md))
2. Mở Command Palette (`F1` hoặc `Ctrl+Shift+P`)
3. Tìm `MCP: List Servers`
4. Chọn `Framelink Figma MCP` → `Start Server`
5. Nhập Figma Personal Access Token

### Bước 2: Sử Dụng Prompt Templates

Mở **GitHub Copilot Agent Mode** và sử dụng các prompt trong file [FIGMA_PROMPT_TEMPLATE.md](./FIGMA_PROMPT_TEMPLATE.md).

**Thứ tự thực hiện:**
1. ✅ Trích xuất design tokens từ Figma
2. ✅ Cập nhật Tailwind config
3. ✅ Tạo API service layer
4. ✅ Setup routing và layout
5. ✅ Tạo Name Input Modal
6. ✅ Tạo Home Page
7. ✅ Tạo Search Page
8. ✅ Tạo Post Detail Page
9. ✅ Tạo Post Modal
10. ✅ Hoàn thiện và test

### Bước 3: Chạy Ứng Dụng

```bash
# Cài đặt dependencies (nếu chưa có)
npm install

# Chạy development server
npm run dev
```

Ứng dụng sẽ chạy tại: `http://localhost:3000`

## 📁 Cấu Trúc Dự Án

```
javascript/
├── src/
│   ├── api/              # API service layer
│   ├── components/       # React components
│   │   ├── common/       # Common components (Layout, NavBar, etc.)
│   │   ├── post/         # Post-related components
│   │   ├── comment/      # Comment components
│   │   └── modal/        # Modal components
│   ├── pages/            # Page components
│   ├── context/          # React Context (AuthContext)
│   └── styles/           # Design tokens từ Figma
├── FIGMA_PROMPT_TEMPLATE.md  # Prompt templates
└── README_FIGMA_SETUP.md     # File này
```

## 🔑 Các Components Cần Tạo

### Common Components
- `Layout.jsx` - Layout chính với NavBar
- `NavBar.jsx` - Navigation bar
- `FloatingActionButton.jsx` - FAB button

### Post Components
- `PostCard.jsx` - Card hiển thị post

### Comment Components
- `CommentItem.jsx` - Item comment
- `CommentInput.jsx` - Input để thêm comment

### Modal Components
- `Modal.jsx` - Base modal component
- `PostingModal.jsx` - Modal tạo/chỉnh sửa post
- `NameInputModal.jsx` - Modal nhập tên user

### Pages
- `HomePage.jsx` - Trang chủ
- `SearchPage.jsx` - Trang tìm kiếm
- `PostDetailPage.jsx` - Trang chi tiết post

## 🎯 API Endpoints

Backend API chạy tại: `http://localhost:8000/api`

Xem chi tiết trong file [../complete/openapi.yaml](../complete/openapi.yaml)

### Posts
- `GET /api/posts` - Lấy danh sách posts
- `GET /api/posts/{postId}` - Lấy chi tiết post
- `POST /api/posts` - Tạo post mới
- `PATCH /api/posts/{postId}` - Cập nhật post
- `DELETE /api/posts/{postId}` - Xóa post

### Comments
- `GET /api/posts/{postId}/comments` - Lấy comments của post
- `POST /api/posts/{postId}/comments` - Tạo comment mới
- `PATCH /api/posts/{postId}/comments/{commentId}` - Cập nhật comment
- `DELETE /api/posts/{postId}/comments/{commentId}` - Xóa comment

### Likes
- `POST /api/posts/{postId}/likes` - Like post
- `DELETE /api/posts/{postId}/likes` - Unlike post

## 🛠️ Tech Stack

- **React 18** - UI library
- **Vite** - Build tool
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Axios** - HTTP client

## 📝 Lưu Ý Quan Trọng

1. **MCP Figma Server phải đang chạy** khi sử dụng prompts liên quan đến Figma
2. **Backend API phải đang chạy** tại `http://localhost:8000` trước khi test frontend
3. **Tuân thủ OpenAPI spec** - không thêm features không có trong spec
4. **Responsive design** - đảm bảo hoạt động tốt trên mobile và desktop
5. **Error handling** - hiển thị thông báo khi API không khả dụng

## 🐛 Troubleshooting

### MCP Figma không kết nối
- Kiểm tra PAT token
- Đảm bảo server đã start
- Thử restart Cursor IDE

### API không kết nối được
- Kiểm tra backend có đang chạy không
- Kiểm tra port 8000 có đúng không
- Kiểm tra CORS settings

### Design không khớp với Figma
- Kiểm tra lại design tokens đã trích xuất đúng chưa
- So sánh với Figma Dev Mode
- Điều chỉnh thủ công nếu cần

## 📚 Tài Liệu Tham Khảo

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [React Router Documentation](https://reactrouter.com/)
- [Figma API Documentation](https://www.figma.com/developers/api)

---

**Chúc bạn coding vui vẻ!** 🚀
