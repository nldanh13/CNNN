# CNNN — kiểm tra độ tin cậy của tính năng tự lưu

Tài liệu kiểm thử thủ công cho `src/store/usePatientPlans.ts`. Dùng **hai tài khoản thử nghiệm và người bệnh giả lập**; không thử bằng hồ sơ thực tế. Việc chạy bài kiểm tra có thao tác xóa dữ liệu thử.

## Luồng bình thường

1. Trong tài khoản A, tạo một kế hoạch giả lập; nhập một số thông tin và đợi trạng thái **Đã lưu vào tài khoản**.
2. Mở A trong tab ẩn danh khác: toàn bộ nội dung đã lưu phải xuất hiện.
3. Mở B trong tab ẩn danh: không được thấy bất kỳ kế hoạch của A.
4. Tạo đủ 3 kế hoạch thử: không thể tạo kế hoạch thứ tư. Không xóa bảng trong Supabase SQL Editor.

## Khi mất mạng

1. Giữ A đăng nhập, ngắt mạng trong trình duyệt (DevTools → Offline), chỉnh sửa một kế hoạch thử.
2. Thanh trạng thái phải hiển thị **Đang lưu** rồi báo chưa đồng bộ; bản nháp mới được ghi vào bộ nhớ trình duyệt gắn UID.
3. Tải lại tab khi còn offline: phần kế hoạch cloud không thể tải; **không xóa dữ liệu trình duyệt**.
4. Bật mạng và tải lại: CNNN phải nhận ra bản nháp chưa đồng bộ, mở màn hình đối chiếu.
5. Chọn **Thử lưu bản chỉnh sửa trên máy** khi phía Supabase chưa đổi revision. A vào lại bằng trình duyệt khác phải thấy thay đổi.
6. Lặp lại với tài khoản thử có 1 kế hoạch: xóa kế hoạch khi offline. Bản nháp danh sách **0 kế hoạch** vẫn phải được nhận diện; không được tự xem như “không có bản nháp”.

## Khi hai thiết bị cùng sửa

1. Đăng nhập A trên hai trình duyệt X và Y; cả hai cùng mở kế hoạch thử ở revision ban đầu.
2. X sửa và đợi **Đã lưu vào tài khoản**; Y sửa nội dung khác.
3. Supabase phải từ chối lần ghi của Y nếu revision đã thay đổi. CNNN **không tự ghi đè X**, và phải yêu cầu đối chiếu.
4. Nếu không thể hợp nhất tự động, chọn **Dùng dữ liệu Supabase, giữ bản nháp trên máy**. Bản nháp Y phải được giữ trong một vị trí riêng trên đúng thiết bị Y. Khi cần xem lại, vào **Kế hoạch → Xem bản nháp đã giữ**.
5. Khi xuất hiện một bản nháp đã giữ, đừng tạo và bỏ qua bản nháp thứ hai trên cùng thiết bị trước khi xử lý bản thứ nhất. Hệ thống phải chặn việc ghi đè bản đã giữ.
6. Nếu revision của bản nháp khác Supabase, ứng dụng không tự phát lại bản nháp lên server. Đối chiếu thủ công trước khi sử dụng, tuyệt đối không coi đó là bản đã được đồng bộ.

## Kết quả / giới hạn

- Kiểm tra hiển thị “Đã lưu” **chỉ sau khi Supabase trả về phiên bản revision mới**.
- Nếu ổ đĩa/bộ nhớ trình duyệt đầy, hiển thị lỗi lưu bộ nhớ, không khẳng định đã lưu an toàn cục bộ.
- Bản nháp đang chờ và bản nháp đã giữ trên thiết bị được lưu trong **localStorage không mã hóa**. Chỉ dùng dữ liệu giả lập. Không dùng máy công cộng để tạo hồ sơ nhận dạng người bệnh.
- RLS và giới hạn 3 người bệnh được áp dụng tại máy chủ, nhưng vẫn cần kiểm thử thủ công bằng JWT của hai tài khoản thường. SQL Editor với vai trò quản trị **không chứng minh RLS**.
- Không bật MFA bắt buộc. Không sửa và không xóa các bảng snapshot cũ trong đợt kiểm thử này.
