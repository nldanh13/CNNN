# Kho giao diện CNNN

Mọi trang của ứng dụng dựng giao diện từ thư mục này. Muốn đổi màu, bo góc hay kiểu nút cho toàn ứng dụng thì sửa ở đây, không sửa từng trang. Xem trực tiếp tại trang **Cài đặt → Kho giao diện** (`#/ui`).

## Màu

Màu khai báo một lần trong `tokens.css` (biến CSS) và `tailwind.config.js` chỉ cho phép các bảng màu này. Các màu Tailwind rời như `slate-500`, `red-600` không còn tồn tại, nên trang mới không thể lệch bảng màu.

| Bảng | Dùng cho |
| --- | --- |
| `primary` | Nút chính, mục đang chọn, liên kết |
| `ink` | Chữ, viền, nền phụ (trung tính) |
| `info` · `success` · `warning` · `danger` | Thông tin · đạt · cần lưu ý · lỗi/xóa |
| `nanda` · `noc` · `nic` | Màu riêng của từng hệ phân loại |

Vai trò tự đổi theo chế độ sáng/tối, ưu tiên dùng thay cho cặp `x dark:y`:

- Nền: `bg-canvas` (nền trang), `bg-surface` (thẻ), `bg-surface-muted` (vùng phụ)
- Viền: `border-line`, `border-line-soft`
- Chữ: `text-fg` (chính), `text-fg-muted` (phụ), `text-fg-subtle` (mờ)
- Bo góc: `rounded-control` (nút, ô nhập), `rounded-card` (thẻ)

## Thành phần

Nhập từ `../ui`:

- Nút: `Button`, `LinkButton`, `IconButton`, `buttonClass()`
- Khung: `PageHeader`, `SectionTitle`, `Card`, `CardHeader`, `CardBody`, `Steps`, `Disclosure`, `EmptyState`
- Thông báo: `Alert` (info/success/warning/danger), `Badge`, `ProgressBar`, `Kbd`
- Biểu mẫu: `Field`, `Input`, `Textarea`, `Select`, `SearchInput`, `Segmented`, `TagInput`
- Lớp phủ: `Modal`, `Drawer`
- Phân loại: `CodeBadge`, `SYSTEM_DOT`, `SYSTEM_TEXT`, `Term`

## Quy tắc

1. Mỗi trang mở đầu bằng `PageHeader`: một tiêu đề, một câu mô tả.
2. Mỗi vùng chỉ có một nút `primary`.
3. Hộp lưu ý luôn là `Alert`, không tự tô khung màu.
4. Ô tìm kiếm luôn là `SearchInput`.
5. Mã NANDA-I/NOC/NIC luôn hiển thị bằng `CodeBadge`.
