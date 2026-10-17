# Kiểm tra phân quyền RLS giữa hai tài khoản CNNN

Bài thử này chỉ đọc metadata `id` bằng JWT thật của từng tài khoản, trực tiếp qua Supabase REST API. Nó không truy cập nội dung người bệnh, không xóa dữ liệu, không yêu cầu gửi mật khẩu hoặc access token.

## Thực hiện

1. Dùng **dữ liệu giả lập**. Đăng nhập tài khoản A trên máy/trình duyệt riêng, tạo và sao lưu một kế hoạch thử.
2. Vào **Cài đặt → Sao lưu trong tài khoản**, bấm biểu tượng Sao chép mã cạnh bản sao lưu (UUID). Có thể chép thủ công mã hiển thị nếu trình duyệt chặn clipboard.
3. Đăng nhập tài khoản B khác A trong tab ẩn danh hoặc một trình duyệt khác. Vào **Cài đặt → Sao lưu trong tài khoản**, mở mục thu gọn **Kiểm tra quyền truy cập dữ liệu**.
4. Dán UUID của bản sao lưu A, bấm **Kiểm tra quyền đọc**.
   - **Không đọc được**: Nếu UUID đúng và bản sao A vẫn tồn tại, đây là bằng chứng RLS chặn B xem bản ghi A qua Supabase REST với JWT của B.
   - **Có thể đọc được**: DỪNG thử nghiệm. Không tải thông tin người bệnh. Kiểm tra trực tiếp các policy và token phiên.
   - **Lỗi mạng hoặc UUID sai**: Không kết luận đạt; kiểm tra kết nối và UUID.
5. Đăng nhập lại A, dán UUID tương tự, xác minh A **có thể đọc được**; đảm bảo thao tác trước đó không làm mất dữ liệu.
6. Ghi kết quả mà không chia sẻ JWT, password, Secret Key hoặc bản sao lưu chứa dữ liệu riêng tư.

## Giới hạn của bài thử

Đây là bài thử **SELECT metadata** có điều kiện RLS. Nó không chứng minh rằng INSERT/DELETE cũng được bảo vệ: xem chính sách `cnnn_snapshots_insert_own`/`cnnn_snapshots_delete_own` hoặc bộ kiểm thử API tích hợp riêng, dùng chỉ **bản ghi giả lập** và theo dõi trạng thái sau thao tác. Không sử dụng tài khoản service_role hay SQL Editor admin làm minh chứng RLS của người dùng thường, vì chúng có thể bỏ qua RLS.

RLS cho backup không bảo vệ dữ liệu NNN/NIC đã nhúng trong website tĩnh. Không nhập hồ sơ người bệnh thật vào CNNN.
