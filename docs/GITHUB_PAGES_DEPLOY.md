# Xuất bản CNNN lên GitHub Pages và bật Supabase Auth

CNNN là React/Vite SPA với định tuyến bằng hash (`#/library`, `#/plans`). Vite hiện dùng `base: './'`, phù hợp để ứng dụng chạy tại đường dẫn dự án GitHub Pages. **Không chọn template Jekyll hay Static HTML**: quy trình riêng được định nghĩa trong `.github/workflows/deploy-pages.yml`.

## 1. Cấu hình GitHub Pages

Vào `https://github.com/nldanh13/CNNN/settings/pages`:

- **Build and deployment → Source → GitHub Actions**
- **Custom domain → để trống**, trừ khi bạn sở hữu tên miền hợp lệ và đã trỏ DNS.
- **Enforce HTTPS → bật**.
- Địa chỉ mặc định dự kiến: `https://nldanh13.github.io/CNNN/`.

Workflow Pages dùng `actions/checkout`, `setup-node`, `npm ci`, `npm run build`, `configure-pages`, `upload-pages-artifact` từ `dist`, rồi `deploy-pages`. Mỗi lần push `main` hoặc chọn **Actions → Deploy CNNN to GitHub Pages → Run workflow**, website được build lại và cập nhật.

## 2. Thêm biến cấu hình Supabase vào GitHub

Trong `https://github.com/nldanh13/CNNN/settings`:
**Secrets and variables → Actions → Variables → New repository variable**.

Tạo hai biến, tên phải đúng (chữ hoa):

| Name | Value |
| --- | --- |
| `VITE_SUPABASE_URL` | Project URL, dạng `https://YOUR_PROJECT.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | **Publishable key** bắt đầu `sb_publishable_`, ví dụ khóa đặt tên `cnnn` trong Supabase |

Lưu từng biến với **Add variable**. Không đặt database password, Supabase **secret key**, hoặc `service_role` trong biến `VITE_` hay mã GitHub. Hai giá trị trên là cấu hình công khai dành cho client; build Vite sẽ nhúng chúng vào JavaScript của website.

**An toàn khi thiếu cấu hình:** workflow từ chối publish khi một trong hai biến chưa được đặt, ngăn vô tình xuất bản một phiên bản công khai không có đăng nhập. Nếu thay đổi biến về sau, phải chạy lại workflow (hoặc push `main`) để cấu hình mới được nhúng vào bản build.

## 3. Cấu hình Supabase Authentication

Trong Supabase Dashboard, chọn project CNNN:

1. **Authentication → Providers / Sign In → Email**: bật Email và cho phép đăng ký tài khoản. Bật **Confirm email**.
2. **Authentication → URL Configuration → Site URL**:

   `https://nldanh13.github.io/CNNN/`

3. Trong **Redirect URLs**, thêm cùng địa chỉ chính xác:

   `https://nldanh13.github.io/CNNN/`

   Chỉ thêm `http://localhost:3000/**` nếu cần thử tại máy phát triển.

4. Thiết lập dịch vụ SMTP riêng khi nhiều người dùng cần nhận email xác nhận/khôi phục. Supabase email mặc định có hạn chế gửi.

Email xác nhận không dùng route `/account` của server. Supabase trả token qua URL hash, ứng dụng đọc token và xóa URL fragment trước khi hiển thị nội dung.

## 4. Kích hoạt workflow

Sau khi thêm hai biến và cấu hình Supabase URL:

- Merge PR chứa `.github/workflows/deploy-pages.yml` vào `main` (nếu chưa merge).
- Vào **GitHub → Actions → Deploy CNNN to GitHub Pages**.
- Workflow tự chạy khi merge. Có thể chọn **Run workflow → main → Run workflow** nếu muốn kích hoạt lại.
- Xem job **Build CNNN** và **Publish GitHub Pages** phải thành công.
- Mở `https://nldanh13.github.io/CNNN/` rồi thử đăng ký bằng email thử nghiệm, xác nhận email, đăng nhập, quên mật khẩu, đổi mật khẩu, đăng xuất.

### Nếu workflow báo lỗi

| Tình huống | Cách xử lý |
| --- | --- |
| `Missing GitHub Actions repository variables...` | Vào Actions Variables, thêm đủ hai biến rồi **Run workflow**. |
| `Resource not accessible by integration` | Xác nhận Pages Source = GitHub Actions, Actions workflow permissions phù hợp, environment `github-pages` cho phép deploy nhánh `main`. |
| Trang trắng / file JavaScript 404 | Xác nhận URL có `/CNNN/`, GitHub Pages dùng đúng artifact `dist`, Vite `base: './'`. |
| Không gửi được email | Kiểm tra Supabase Email provider, Site URL/Redirect URLs và SMTP/rate limits. |
| Đăng nhập xong vẫn trở về đăng nhập | Kiểm tra URL/key đúng **cùng một project**, cookie/security settings và DevTools console. |

**Quan trọng:** Supabase Auth chỉ kiểm soát **đăng nhập giao diện**, không bảo vệ bí mật các tài nguyên đã đóng gói trong website tĩnh GitHub Pages. Nội dung đi kèm `dist` là công khai đối với người biết URL. Việc lưu kế hoạch chăm sóc theo tài khoản vẫn dùng localStorage trên thiết bị, không mã hóa và không đồng bộ; **không lưu hồ sơ bệnh nhân thật** khi chưa xây dựng backend phân quyền, mã hóa, audit và chính sách dữ liệu phù hợp.
