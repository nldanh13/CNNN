# Cấu hình tài khoản CNNN

CNNN hỗ trợ người dùng tạo tài khoản bằng **email + mật khẩu**, xác nhận email,
đăng nhập, quên mật khẩu, đổi mật khẩu, đổi họ tên hiển thị và đăng xuất.
Ba danh mục thuật ngữ NANDA-I/NOC/NIC vẫn dùng chung một `dataHub`.

## 1. Kích hoạt dịch vụ tài khoản

1. Tạo dự án trên [Supabase](https://supabase.com/).
2. Trong **Authentication → Providers → Email**, bật Email và tùy chọn cho phép đăng ký mới
   (**Allow new users to sign up**). Nên bật **Confirm email**.
3. Trong **Authentication → URL Configuration**, đặt **Site URL** bằng địa chỉ HTTPS
   thực tế của CNNN và thêm địa chỉ đó vào **Redirect URLs**. Dùng cả URL local
   `http://localhost:3000/**` để thử nghiệm. Liên kết xác nhận và khôi phục phải
   trở về origin và pathname của ứng dụng; ứng dụng đọc token callback rồi xóa
   chúng khỏi URL ngay sau khi nhận.
4. Thiết lập SMTP riêng trước khi mời đông người dùng để email xác nhận và
   khôi phục gửi ổn định. Bật xác thực đa yếu tố / giới hạn đăng ký nếu tổ chức yêu cầu.
5. Trong môi trường Vite/deploy, khai báo hai biến:
   ```ini
   VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_OR_PUBLISHABLE_KEY
   ```
6. Build lại và deploy ứng dụng. Nếu không có cả hai biến, CNNN giữ chế độ
   thiết bị cá nhân cũ và hiển thị hướng dẫn cấu hình ở Cài đặt.

**Quan trọng:** Chỉ dùng `anon`/publishable key dành cho frontend. Tuyệt đối
không đặt service role, secret API key, database password hoặc SMTP password
trong biến `VITE_` hay GitHub public. Quản trị người dùng bằng Supabase Dashboard.

## 2. Trải nghiệm người dùng

- Chưa đăng nhập: hiện trang Đăng nhập, Đăng ký, Quên mật khẩu.
- Đăng ký: điền họ tên, email, mật khẩu từ 12 ký tự; nếu Confirm email bật thì
  phải nhấn link xác nhận mới vào được.
- Đăng nhập thành công: xem thư viện, trợ lý chẩn đoán và kế hoạch chăm sóc.
- Cài đặt & tài khoản: xem email, đổi họ tên, đổi mật khẩu và đăng xuất.
- Quên mật khẩu: email khôi phục đưa về ứng dụng để đặt mật khẩu mới.
- Phiên tài khoản giữ trong **sessionStorage từng tab**, không lưu mật khẩu.

## 3. Quy tắc về kế hoạch chăm sóc

**Tính năng này mới là xác thực tài khoản, chưa triển khai cơ sở dữ liệu hồ sơ bệnh án.**
Các kế hoạch hiện lưu cục bộ trên thiết bị/trình duyệt:
`clinicalnnn.plans.v2.user.<user-id>` trong chế độ đăng nhập.

- Mỗi tài khoản dùng một không gian kế hoạch riêng trong giao diện trên cùng thiết bị,
  không tự động lấy dữ liệu từ tài khoản khác.
- Tài khoản vừa tạo **không tự nhận** dữ liệu theo khóa cũ
  `clinicalnnn.plans.v2`. Muốn chuyển dữ liệu thử nghiệm cũ, người sở hữu phải
  tải bản sao lưu rồi tự nhập vào đúng tài khoản trong trang Cài đặt.
- Dữ liệu **không đồng bộ nhiều thiết bị**. Đây cũng **không phải bảo vệ an toàn**
  trước người có quyền truy cập trình duyệt hoặc Developer Tools (localStorage
  không mã hóa). Người khác dùng cùng một trình duyệt vẫn có thể đọc storage.
- **Không nhập thông tin nhận dạng người bệnh thật** cho đến khi đã xây dựng
  backend riêng, phân quyền, mã hóa, kiểm toán, sao lưu và chính sách tuân thủ
  phù hợp. Supabase Auth không tự bảo vệ các bản ghi bệnh nhân trong localStorage.

## 4. Cấu trúc ứng dụng

```
src/auth/supabaseAuth.ts     Auth API, phiên đăng nhập, refresh, callback email
src/auth/AuthContext.tsx     Trạng thái tài khoản toàn ứng dụng
src/pages/AccountPage.tsx   Đăng nhập, đăng ký, khôi phục, cài đặt tài khoản
src/store/planScope.ts      Khóa lưu kế hoạch riêng cho mỗi tài khoản
src/App.tsx                 Chặn các màn hình ứng dụng trước khi đăng nhập
src/pages/SettingsPage.tsx  Cài đặt tài khoản và tùy chọn khác
```

Tài khoản không tạo bản sao của NANDA-I, NOC hoặc NIC. Tất cả dùng dữ liệu
chung. Đây là lớp đăng nhập trên frontend — nếu cần hạn chế truy cập **nội dung
danh mục bí mật**, phải chuyển tài nguyên đó ra khỏi bundle web công khai và bảo
vệ bằng API backend có kiểm tra quyền.

## 5. Kiểm tra

```sh
npm ci
npm run typecheck
npm run build
npm run check:account
npm run check:care-plan
npm run check:unified-catalog
```

Sau deploy thử ít nhất 2 tài khoản với trình duyệt khác nhau và cùng thiết bị:
đăng ký/xác nhận email, đăng nhập, quên/đổi mật khẩu, đăng xuất, trở lại đúng
tài khoản, kiểm tra không tự hiển thị kế hoạch của tài khoản khác.

Chưa có Supabase project và khóa frontend thì không thể xác minh luồng email
hay phiên xác thực **trên hệ thống thật**. Chỉ có thể kiểm thử code và build.
