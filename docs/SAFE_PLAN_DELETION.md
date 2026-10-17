# CNNN — Xác nhận trước khi xóa toàn bộ kế hoạch

## Mục đích
Tránh mất dữ liệu do bấm nhầm nút **Xóa** ở danh sách kế hoạch hoặc trang chỉnh sửa người bệnh.

## Luồng đã triển khai
- Cả hai nút Xóa đều mở cùng hộp thoại `DeletePlanDialog`; không xóa ngay khi bấm biểu tượng thùng rác.
- Hộp thoại hiển thị **tên người bệnh, mã kế hoạch, số vấn đề chăm sóc** và nêu rõ phạm vi bị xóa: chẩn đoán, NOC, NIC, lịch sử lượng giá, ghi chú.
- **Giữ lại**, nút đóng, Escape và nhấn nền đều hủy thao tác. **Xác nhận xóa** mới gọi `deletePlan(id)`.
- Sau khi xóa, vẫn giữ thông báo có nút **Hoàn tác** (chỉ hiển thị trong thời gian ngắn).
- Không thêm bản sao/sao lưu riêng, không thêm SQL và không thay đổi giới hạn tối đa 3 người bệnh mỗi tài khoản.
- Tính năng chỉ là xác nhận giao diện; cơ chế ghi và xử lý xung đột Supabase vẫn do `usePatientPlans` phụ trách. Khi xóa mất kết nối, dữ liệu xóa chờ đồng bộ theo cơ chế bản nháp đang có.

## Kiểm thử
```sh
npm ci
npm run typecheck
npm run check:autosave-reliability
npm run build
```
Kiểm thử thủ công bằng **tài khoản và người bệnh giả lập**:
1. Ở danh sách kế hoạch, nhấn Xóa, kiểm tra tên và mã đúng; chọn Giữ lại, kế hoạch phải còn nguyên.
2. Mở lại, chọn Xác nhận xóa; kế hoạch biến mất. Nhấn Hoàn tác, kế hoạch và nội dung phải trở lại.
3. Trong trang chỉnh sửa, lặp lại bằng Esc, nhấn nền, sau đó xác nhận và hoàn tác.
4. Thử khi offline rồi online để kiểm tra bản nháp chờ đồng bộ; trên hai thiết bị, xung đột phải yêu cầu đối chiếu chứ không được âm thầm ghi đè.
5. Kiểm tra tài khoản B không thấy hoặc xóa được kế hoạch tài khoản A.

**Lưu ý:** Hộp thoại không thay thế bản sao lưu được quản lý nếu có yêu cầu lưu giữ hồ sơ theo quy định. CNNN hiện dùng dữ liệu giả lập, không phải hệ thống hồ sơ lâm sàng đã được phê duyệt.
