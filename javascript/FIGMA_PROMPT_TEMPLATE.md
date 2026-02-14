# Prompt Template cho GitHub Copilot Agent Mode

Sử dụng các prompt này trong GitHub Copilot Agent Mode để xây dựng React app từ Figma design.

## Link Figma Design

**File chính:** https://www.figma.com/design/e1tAQ6KFSjM0RXuBZ58my0/Simple-Social-Media-Application--Community-?node-id=1-3&t=2mC7Gup9nWNBykkO-4

## Bước 1: Trích Xuất Design Tokens

```text
Sử dụng MCP Figma để phân tích file Figma này và trích xuất tất cả design tokens:

Link Figma: https://www.figma.com/design/e1tAQ6KFSjM0RXuBZ58my0/Simple-Social-Media-Application--Community-?node-id=1-3&t=2mC7Gup9nWNBykkO-4

Yêu cầu:
- Colors (màu sắc chính, màu phụ, màu nền, màu text)
- Typography (font families, font sizes, font weights, line heights)
- Spacing scale (margins, paddings)
- Border radius
- Shadows/elevations
- Breakpoints (nếu có)

Sau đó tạo file `src/styles/theme.js` với tất cả design tokens này.
```

## Bước 2: Cập Nhật Tailwind Config

```text
Cập nhật file `tailwind.config.js` để sử dụng design tokens từ `src/styles/theme.js`.

Đảm bảo:
- Import theme từ theme.js
- Extend Tailwind theme với các tokens từ Figma
- Cấu hình responsive breakpoints
- Cấu hình content paths đúng
```

## Bước 3: Tạo Home Page Component

```text
Tôi muốn tạo Home Page component cho React web app. Hãy làm theo các hướng dẫn sau.

- Thư mục làm việc của bạn là `javascript`.
- Xác định tất cả các bước trước, những gì bạn sẽ làm.
- Có một backend API app đang chạy trên `http://localhost:8000`.
- Sử dụng `openapi.yaml` mô tả tất cả các endpoints và data schema.
- Sử dụng cổng số `3000`.
- Tạo Home Page component dựa trên Figma design: https://www.figma.com/design/e1tAQ6KFSjM0RXuBZ58my0/Simple-Social-Media-Application--Community-?node-id=1-3&t=2mC7Gup9nWNBykkO-4
- Sử dụng design tokens từ `src/styles/theme.js`.
- Hiển thị danh sách posts từ API endpoint GET /api/posts.
- Mỗi post hiển thị: username, content, likes count, comments count, created time.
- Có button để like/unlike post.
- Có button để xem chi tiết post.
- KHÔNG thêm bất cứ thứ gì không được định nghĩa trong `openapi.yaml`.
- Hiển thị chỉ báo trực quan khi backend API không khả dụng.
- Responsive design cho mobile và desktop.
- Sử dụng Tailwind CSS.
```

## Bước 4: Tạo Search Page Component

```text
Tôi muốn tạo Search Page component cho React web app. Hãy làm theo các hướng dẫn sau.

- Thư mục làm việc của bạn là `javascript`.
- Xác định tất cả các bước trước, những gì bạn sẽ làm.
- Có một backend API app đang chạy trên `http://localhost:8000`.
- Sử dụng `openapi.yaml` mô tả tất cả các endpoints và data schema.
- Tạo Search Page component dựa trên Figma design: https://www.figma.com/design/e1tAQ6KFSjM0RXuBZ58my0/Simple-Social-Media-Application--Community-?node-id=1-3&t=2mC7Gup9nWNBykkO-4
- Có search input để tìm kiếm posts.
- Hiển thị kết quả tìm kiếm (có thể filter posts theo content hoặc username).
- Sử dụng design tokens từ `src/styles/theme.js`.
- Responsive design.
- Sử dụng Tailwind CSS.
```

## Bước 5: Tạo Post Detail Page Component

```text
Tôi muốn tạo Post Detail Page component cho React web app. Hãy làm theo các hướng dẫn sau.

- Thư mục làm việc của bạn là `javascript`.
- Xác định tất cả các bước trước, những gì bạn sẽ làm.
- Có một backend API app đang chạy trên `http://localhost:8000`.
- Sử dụng `openapi.yaml` mô tả tất cả các endpoints và data schema.
- Tạo Post Detail Page component dựa trên Figma design: https://www.figma.com/design/e1tAQ6KFSjM0RXuBZ58my0/Simple-Social-Media-Application--Community-?node-id=1-3&t=2mC7Gup9nWNBykkO-4
- Hiển thị chi tiết post từ API endpoint GET /api/posts/{postId}.
- Hiển thị danh sách comments từ API endpoint GET /api/posts/{postId}/comments.
- Có form để thêm comment mới (POST /api/posts/{postId}/comments).
- Có button để like/unlike post.
- Có button để edit/delete post (nếu là post của user hiện tại).
- Sử dụng design tokens từ `src/styles/theme.js`.
- Responsive design.
- Sử dụng Tailwind CSS.
```

## Bước 6: Tạo Post Modal Component

```text
Tôi muốn tạo Post Modal component cho React web app. Hãy làm theo các hướng dẫn sau.

- Thư mục làm việc của bạn là `javascript`.
- Xác định tất cả các bước trước, những gì bạn sẽ làm.
- Có một backend API app đang chạy trên `http://localhost:8000`.
- Sử dụng `openapi.yaml` mô tả tất cả các endpoints và data schema.
- Tạo Post Modal component dựa trên Figma design: https://www.figma.com/design/e1tAQ6KFSjM0RXuBZ58my0/Simple-Social-Media-Application--Community-?node-id=1-3&t=2mC7Gup9nWNBykkO-4
- Modal có form để tạo post mới (POST /api/posts) hoặc edit post (PATCH /api/posts/{postId}).
- Form có input cho content (required).
- Sử dụng username từ context (AuthContext).
- Có button để submit và cancel.
- Sử dụng design tokens từ `src/styles/theme.js`.
- Responsive design.
- Sử dụng Tailwind CSS.
```

## Bước 7: Tạo Name Input Modal Component

```text
Tôi muốn tạo Name Input Modal component cho React web app. Hãy làm theo các hướng dẫn sau.

- Thư mục làm việc của bạn là `javascript`.
- Xác định tất cả các bước trước, những gì bạn sẽ làm.
- Tạo Name Input Modal component dựa trên Figma design: https://www.figma.com/design/e1tAQ6KFSjM0RXuBZ58my0/Simple-Social-Media-Application--Community-?node-id=1-3&t=2mC7Gup9nWNBykkO-4
- Modal hiển thị khi user chưa có username.
- Có input để nhập username.
- Lưu username vào localStorage và AuthContext.
- Có button để submit.
- Sử dụng design tokens từ `src/styles/theme.js`.
- Responsive design.
- Sử dụng Tailwind CSS.
```

## Bước 8: Tạo API Service

```text
Tạo API service layer cho React app:

- Thư mục làm việc: `javascript`
- Tạo file `src/api/apiClient.js` để setup axios client với base URL `http://localhost:8000/api`
- Tạo file `src/api/apiService.js` với các functions:
  - getPosts() - GET /api/posts
  - getPostById(postId) - GET /api/posts/{postId}
  - createPost(data) - POST /api/posts
  - updatePost(postId, data) - PATCH /api/posts/{postId}
  - deletePost(postId) - DELETE /api/posts/{postId}
  - getComments(postId) - GET /api/posts/{postId}/comments
  - createComment(postId, data) - POST /api/posts/{postId}/comments
  - updateComment(postId, commentId, data) - PATCH /api/posts/{postId}/comments/{commentId}
  - deleteComment(postId, commentId) - DELETE /api/posts/{postId}/comments/{commentId}
  - likePost(postId, data) - POST /api/posts/{postId}/likes
  - unlikePost(postId) - DELETE /api/posts/{postId}/likes

- Tất cả functions phải có error handling
- Sử dụng async/await
- Tuân thủ OpenAPI spec trong `openapi.yaml`
```

## Bước 9: Setup Routing và Layout

```text
Setup React Router và Layout cho app:

- Thư mục làm việc: `javascript`
- Cài đặt react-router-dom (nếu chưa có)
- Tạo Layout component với NavBar
- Setup routes:
  - / - HomePage
  - /search - SearchPage
  - /posts/:postId - PostDetailPage
- Tạo AuthContext để quản lý username
- Tích hợp Name Input Modal vào App để hiển thị khi chưa có username
- Sử dụng design tokens từ theme.js
```

## Bước 10: Hoàn Thiện và Test

```text
Hoàn thiện React app và test:

- Thư mục làm việc: `javascript`
- Đảm bảo tất cả components đã được tạo
- Đảm bảo routing hoạt động đúng
- Đảm bảo API integration hoạt động
- Test tất cả các chức năng:
  - Tạo post
  - Xem posts
  - Like/unlike post
  - Comment trên post
  - Edit/delete post và comment
  - Search posts
- Đảm bảo responsive design
- Đảm bảo error handling khi API không khả dụng
- Fix tất cả lỗi nếu có
```

## Lưu Ý

1. **Luôn bắt đầu mỗi prompt với**: "Xác định tất cả các bước trước, những gì bạn sẽ làm."
2. **Đảm bảo MCP Figma server đang chạy** khi yêu cầu phân tích Figma design
3. **Sử dụng từng prompt một** và chờ hoàn thành trước khi chuyển sang bước tiếp theo
4. **Kiểm tra kết quả** sau mỗi bước
5. **Sử dụng nút [keep]** để chấp nhận các thay đổi từ GitHub Copilot

## Thứ Tự Thực Hiện

1. Bước 1: Trích xuất design tokens
2. Bước 2: Cập nhật Tailwind config
3. Bước 8: Tạo API service (cần thiết cho các components)
4. Bước 9: Setup routing và layout
5. Bước 7: Tạo Name Input Modal (cần thiết cho auth)
6. Bước 3: Tạo Home Page
7. Bước 4: Tạo Search Page
8. Bước 5: Tạo Post Detail Page
9. Bước 6: Tạo Post Modal
10. Bước 10: Hoàn thiện và test

---

**Chúc bạn thành công!** 🚀
