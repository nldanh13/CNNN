# CNNN — triển khai MFA bằng ứng dụng Authenticator (TOTP)

**Trạng thái:** tính năng đã chuẩn bị trong mã nguồn, **TẮT theo mặc định**. Không xóa tài khoản, phiên hay kế hoạch cũ. Không tạo bảng NNN mới.

## Kiểm thử RLS còn thiếu
Ảnh tài khoản B cho thấy UUID bản sao lưu A bị chặn khi GET qua Supabase API. Còn phải thử A với **chính UUID đó** và xác nhận A đọc được. Đây chỉ là SELECT, không chứng minh INSERT/DELETE hoặc dữ liệu thư viện đã được bảo vệ.

## Kiến trúc MFA
- TOTP sử dụng GoTrue: `POST /auth/v1/factors`, `POST /auth/v1/factors/{id}/challenge`, `POST /auth/v1/factors/{id}/verify`.
- Yêu cầu đăng nhập mới được xác thực bằng email+mật khẩu+Turnstile. Sau đó, nếu Supabase `GET /auth/v1/user` trả về yếu tố TOTP `verified` và JWT có AAL1, CNNN hiển thị bước mã 6 chữ số. Khi Supabase xác minh, một cặp token mới AAL2 được lưu thay token AAL1.
- Tại **Cài đặt → Xác thực hai lớp**, người dùng có thể tự chọn bật MFA. Mã QR và secret chỉ nằm trong bộ nhớ React khi cấu hình, không lưu vào localStorage/sessionStorage hoặc gửi GitHub.
- Người dùng chưa đăng ký MFA **không bị ép đăng ký**, giảm nguy cơ tự khóa tài khoản.
- **CẢNH BÁO:** MFA gate trong giao diện không tự bảo vệ Supabase REST table khỏi một token AAL1 bị đánh cắp. Để cưỡng chế AAL2 ở backend, cần thiết kế và kiểm thử RLS phù hợp (chỉ với user có MFA hoặc toàn bộ user theo quyết định) trước khi dùng dữ liệu nhạy cảm. JWT phía frontend chỉ kiểm soát điều hướng, không phải xác thực chữ ký.
- Dữ liệu localStorage của CNNN không mã hóa, không được MFA bảo vệ.
- Nếu mất máy chứa mã TOTP và không còn thiết bị dự phòng, cần quy trình hỗ trợ đặt lại MFA qua quản trị viên sau khi xác minh danh tính. Không triển khai bắt buộc khi chưa có phương án này.

## Bật thử nghiệm an toàn

1. Supabase Dashboard → Authentication → **Multi-Factor**: xác nhận TOTP enrollment và TOTP verification được cho phép. Chưa bật yêu cầu MFA cho tất cả người dùng.
2. Thiết lập phương án xử lý **mất thiết bị Authenticator** và tài khoản quản trị hỗ trợ trước khi mời người dùng đăng ký.
3. GitHub CNNN → Settings → Secrets and variables → Actions → Variables: thêm `VITE_TOTP_MFA_ENABLED=true` **chỉ khi đã sẵn sàng thử nghiệm**; hiện tại chưa tạo biến này hoặc giữ `false`.
4. Chạy lại GitHub Pages Deploy (workflow `workflow_dispatch` hoặc một commit đã kiểm thử). Không cần mật khẩu Supabase hay secret key trong GitHub.
5. Trên **tài khoản thử nghiệm** không có dữ liệu nhạy cảm: Cài đặt → Xác thực hai lớp → Bật. Quét mã QR trong Google/Microsoft Authenticator và nhập 6 chữ số xác nhận. KHÔNG chia sẻ QR, URI, secret hoặc TOTP.
6. Đăng xuất, mở tab ẩn danh, đăng nhập email/mật khẩu+Turnstile. Xác nhận xuất hiện màn hình MFA, mã sai bị từ chối, mã đúng mở CNNN. Thử F5, khôi phục email và tài khoản khác chưa bật MFA (vẫn đăng nhập một lớp).
7. Dùng hai tài khoản thử và xác nhận dữ liệu không bị trộn khi đăng xuất/đăng nhập. Không tải hồ sơ bệnh án thật.
8. Sau đó mới xem xét bắt buộc MFA cho người dùng hoặc kiểm tra JWT AAL2 trong **RLS/API backend** với migration đã kiểm thử ở môi trường thử. Không tự ý sửa RLS đang chạy trên dữ liệu hiện có.

## Không thay đổi
- Không xóa bản sao lưu và kế hoạch cũ; RLS hiện hành vẫn giữ.
- Không sửa catalog NANDA/NOC/NIC, không mở thêm API thư viện.
- Không gửi OTP, mật khẩu, mã QR, khóa TOTP hoặc secret key cho người hỗ trợ.
- Khi gặp sự cố trước khi bật MFA bắt buộc, đổi biến GitHub `VITE_TOTP_MFA_ENABLED=false` và deploy lại. Lưu ý các user đã hoàn tất enrollment vẫn có factor ở Supabase; chỉ ẩn giao diện sẽ **không** vô hiệu hóa factor đó ở backend.
