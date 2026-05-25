# Repo Nhóm - Seminar Chuyên Đề - DCT122C3

## 1. Thông tin tổng quan

| Mục | Nội dung |
| --- | --- |
| Nội dung chuyên đề | Vibe Coding/Low-Code/No-Code trong tương lai của ngành Kỹ nghệ Phần mềm |
| Học phần | Seminar Chuyên Đề |
| GVHD | TS. Đỗ Như Tài |
| Lớp | DCT122C3 - CNTT CLC |

### Thành viên nhóm

- Nguyễn Minh Kiên - 3122411103
- Phạm Nhật Phương - 3122411162
- Lê Nhựt Huy - 3122411063
- Phạm Nguyễn Thế Hào - 3122411048

## 2. Cấu trúc dự án

Repository được tổ chức theo từng nhánh để bám sát tiến độ học tập và các bài thực hành trong suốt học phần:

- Các nhánh dạng `week-bai` là các bài tập theo từng tuần, từng bài trong chương trình học.
- Ngoài các nhánh theo tuần, repository còn có các nhánh theo chủ đề/bài làm riêng của từng thành viên như `Hao-ch4`, `huy-ch11`, `Phuong-ch5`, `kien-ch10`, `kien-java`, ...
- Nhánh `Final_Project` là dự án cuối kỳ, tổng hợp toàn bộ nội dung nghiên cứu, thiết kế, triển khai và tài liệu của nhóm.

### Giới thiệu ngắn về `Final_Project`

`Final_Project` là phiên bản hoàn chỉnh của hệ thống AI Tutor học tiếng Anh, gồm frontend, backend microservices và toàn bộ tài liệu thiết kế/triển khai cho báo cáo cuối kỳ.

## 3. Sơ đồ cây Repository của `Final_Project`

```text
Final_Project/
├── .github/
│   └── workflows/
├── .kiro/
│   └── specs/
├── Flow/
├── Prompt/
├── Progress/
├── TemplateUI/
│   ├── js/
│   └── styles/
├── app/
│   ├── backend/
│   │   ├── ai-chat-service/
│   │   ├── analysis-service/
│   │   ├── analytics-service/
│   │   ├── auth-service/
│   │   ├── flashcard-service/
│   │   ├── gateway/
│   │   ├── quiz-service/
│   │   ├── shared/
│   │   └── README.md
│   ├── frontend/
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── contexts/
│   │   │   ├── hooks/
│   │   │   ├── pages/
│   │   │   ├── services/
│   │   │   ├── styles/
│   │   │   └── utils/
│   │   └── ai/
│   └── shared/
├── doc/
│   ├── ARCHITECTURE.md
│   ├── DB_SCHEMA.md
│   ├── FRONTEND_COMPONENTS.md
│   ├── FRONTEND_MIGRATION_PLAN.md
│   ├── IMPLEMENTATION_ROADMAP.md
│   ├── PRD.md
│   ├── PROJECT_STRUCTURE.md
│   ├── SEMINAR_*.md
│   └── ...
├── ARCHITECTURE.md
├── DB_SCHEMA.md
├── DEVELOPMENT_LOG.md
├── IMPLEMENTATION_ROADMAP.md
├── MVP_SCOPE.md
├── PRD.md
├── PROJECT_STRUCTURE.md
├── Rules.md
├── SYSTEM_ARCHITECTURE_DIAGRAM.drawio
├── USERSTORIES.md
└── WORKFLOWS.md
```

## 4. Hướng dẫn sử dụng (`Final_Project`)

### Yêu cầu trước khi chạy

- Node.js 18+.
- npm.
- Mở 2 cửa sổ terminal: một cho backend, một cho frontend.

### Chạy backend

```bash
cd app/backend
npm install
npm run dev
```

Backend sẽ khởi động các service chính:

- `gateway` tại `http://localhost:5000`
- `auth-service` tại `http://localhost:5001`
- `ai-chat-service` tại `http://localhost:5002`
- `flashcard-service` tại `http://localhost:3003`
- `quiz-service` tại `http://localhost:5004`
- `analytics-service` theo cấu hình riêng của dự án

### Chạy frontend

```bash
cd app/frontend
npm install
npm run dev
```

Frontend Vite thường chạy tại `http://localhost:5173`.

### Kiểm tra chất lượng

```bash
# Backend
cd app/backend
npm run lint
npm test

# Frontend
cd app/frontend
npm run lint
npm run test
```

### Build frontend

```bash
cd app/frontend
npm run build
```

## Ghi chú

- Đây là repository theo mô hình học tập và báo cáo Seminar, nên phần tài liệu chiếm vai trò rất lớn bên cạnh mã nguồn.
- Các nhánh theo tuần giúp lưu vết quá trình học và làm bài theo từng chặng, còn `Final_Project` là sản phẩm tổng hợp cuối kỳ của nhóm.