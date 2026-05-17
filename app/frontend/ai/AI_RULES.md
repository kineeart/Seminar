# AI_RULES.md

## 1) Scope
- Ch? tri?n khai frontend theo `PRD.md`, `MVP_SCOPE.md`, `FRONTEND_COMPONENTS.md`, `FRONTEND_MIGRATION_PLAN.md`.
- Khong them feature m?i ngoai MVP.

## 2) UI/UX
- Gi? UI 1:1 v?i TemplateUI.
- Khong ??i flow, khong ??i copy chinh, khong them screen m?i.

## 3) Architecture
- ?u tien component nh?, tai s? d?ng.
- Khong hardcode business logic trong UI component.
- Tach `page` / `feature component` / `ui primitive` / `service`.

## 4) State
- ?u tien local state.
- Server state tach rieng b?ng hook.
- Khong them Redux khi ch?a c?n.

## 5) API
- Khong g?i tr?c ti?p URL r?i rac trong component.
- M?i API call ?i qua `services/`.

## 6) Quality gate
- Khong merge code khi con l?i console nghiem tr?ng.
- M?i page co loading/error/empty state c? b?n.

## 7) Naming
- Component: PascalCase.
- Hook: useXxx.
- File ro ngh?a, khong vi?t t?t kho hi?u.

## 8) Forbidden
- Khong copy nguyen kh?i HTML l?n vao 1 component duy nh?t.
- Khong t?o file > 300 dong n?u tach ???c.
- Khong commit TODO m? h? ki?u "fix later".
