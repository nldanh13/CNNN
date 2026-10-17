# CNNN — Hệ thống báo cáo dữ liệu độc lập nhà cung cấp

**Trạng thái:** Phải chạy migration SQL và cấp quản trị viên trước khi merge/triển khai chức năng mới. Việc đẩy mã lên GitHub **không tự tạo bảng Supabase**.

## Mô hình

```text
NANDA–NOC–NIC -> Báo cáo dữ liệu -> ReportRepository (interface)
                                       ├── Supabase RLS/PostgREST adapter
                                       └── Portable REST API adapter (cho backend khác)
                                  ↓
                              data_reports
                                  ↳ report_admins (phân quyền)
```

Nguồn thuật ngữ vẫn là **một kho NANDA-I, NOC, NIC** trong CNNN; bảng báo cáo chỉ lưu *góp ý*, không tạo danh mục thứ tư. Kế hoạch chăm sóc hiện vẫn chỉ nằm trong browser và **không** được đưa lên Supabase bởi thay đổi này.

## 1. Thiết lập Supabase một lần

1. Mở Dashboard dự án CNNN → **SQL Editor → New query**.
2. Mở nội dung file `supabase/migrations/20261017_create_data_reports.sql` trong GitHub; sao chép vào SQL Editor rồi nhấn **Run**. SQL này tạo `public.data_reports`, `public.report_admins`, chỉ mục và các RLS policies.
3. Mở **Authentication → Users**, lấy **User ID (UUID)** của tài khoản quản trị. Không dùng email thay cho UUID.
4. Quay lại SQL Editor chạy lệnh sau **sau khi thay UUID bằng chính tài khoản quản trị**:
   ```sql
   insert into public.report_admins (user_id)
   values ('THAY_BANG_UUID_QUAN_TRI_DUNG');
   ```
5. Xác nhận hai bảng có mặt trong **Table Editor**. Không bật quyền ghi công khai. Không dùng Supabase **Secret key/service_role** trong website.
6. Test với 2 tài khoản: người dùng thường chỉ thấy báo cáo của mình; quản trị thấy tab **Tất cả báo cáo** và thay đổi trạng thái. Nếu có lỗi, tuyệt đối không tắt RLS để chữa cháy.

Nên bật xác nhận email, giới hạn đăng ký/rate limit để giảm spam. Dữ liệu báo cáo không được chứa tên/mã/hồ sơ người bệnh hoặc nội dung sách có bản quyền.

## 2. Quyền truy cập

| Hành động | Người chưa đăng nhập | Người đăng nhập | Quản trị viên |
|---|---|---|---|
| Gửi báo cáo | Không | Có | Có |
| Xem báo cáo của mình | Không | Có | Có |
| Xem báo cáo của người khác | Không | Không | Có |
| Đổi trạng thái/phản hồi | Không | Không | Có |
| Tự phong quản trị | Không | Không | Không |
| Xóa báo cáo bằng ứng dụng | Không | Không | Không |

Quyền do Postgres RLS quyết định, không phải vì nút bị ẩn trong React. Admin chỉ được cấp qua SQL Editor bởi người sở hữu dự án. Chỉ admin có thể sửa `status` và `admin_note`; phần nội dung góp ý và chủ sở hữu không thể sửa sau gửi.

## 3. Giao diện

- Trang **Thư viện → một mã NANDA/NOC/NIC → Báo cáo dữ liệu**: điền loại lỗi, mô tả, đề xuất, nguồn rồi bấm **Gửi báo cáo**. Dữ liệu ghi thẳng vào kho, không còn yêu cầu tạo GitHub Issue.
- Trang **Cài đặt → Xem các báo cáo**: xem và theo dõi trạng thái của mình.
- Admin sau khi được cấp quyền nhìn thấy **Tất cả báo cáo**, có thể phản hồi, đổi trạng thái và **Xuất JSON**.
- Trường hợp bảng báo cáo chưa được cài hoặc mạng lỗi, người dùng được thông báo thất bại và có thể sao chép nội dung; ứng dụng không báo gửi thành công giả.

## 4. Đổi khỏi Supabase mà không sửa giao diện

Hợp đồng nghiệp vụ (độc lập nhà cung cấp): `src/reports/ReportRepository.ts`. Các trang chỉ sử dụng `getReportRepository()`, không sử dụng trực tiếp Supabase SDK, SQL hay URL Supabase.

Các provider:
- `src/reports/supabaseRepository.ts` (hiện tại): PostgREST + Supabase Auth JWT + RLS.
- `src/reports/apiRepository.ts` (dành cho tương lai): REST JSON qua HTTPS do người quản trị vận hành. Chọn bằng `VITE_REPORTS_PROVIDER=api` và `VITE_REPORTS_API_URL=https://your-api.example`. Không có fallback ngầm sang máy chủ kém an toàn.
- `src/auth/authGateway.ts`: điểm nối Auth. Để bỏ Supabase *hoàn toàn*, thay gateway này bằng dịch vụ đăng nhập mới theo cùng hợp đồng; frontend tài khoản không phải viết lại. **Chưa có adapter Auth khác đang chạy**.

**Hợp đồng REST của backend thay thế** (Bearer token phải được backend xác minh ở mỗi request):
| Method | Path | Response |
|---|---|---|
| POST | `/reports` | 200/201/204; dữ liệu theo `DataReport`; userId lấy từ token, không tin client |
| GET | `/reports/mine?offset=0&limit=50` | `StoredReport[]` của người dùng hiện tại |
| GET | `/reports/me/admin` | `{ "isAdmin": true/false }` |
| GET | `/reports?offset=0&limit=50` | `StoredReport[]` (admin only) |
| PATCH | `/reports/{id}` | chấp nhận `status` và `admin_note` (admin only) |

Backend mới **phải** áp dụng quyền sở hữu và quyền admin tương đương RLS; không thể dựa vào kiểm tra ở giao diện. ID người dùng từ dịch vụ đăng nhập mới phải ánh xạ được với `reporter_id` cũ.

## 5. Chuyển dữ liệu qua nhà cung cấp khác

1. Quản trị viên mở **Tất cả báo cáo → Xuất JSON**. File có `format: cnnn-data-reports`, `version: 1`, `exportedAt`, mảng `reports`; bao gồm mã, lời góp ý, chủ sở hữu UUID, trạng thái, phản hồi và thời gian.
2. Bảo quản bản xuất ở nơi an toàn: nội dung do người dùng viết có thể chứa dữ liệu cá nhân ngoài ý muốn. Không đưa lên GitHub công khai.
3. Chuẩn bị Postgres hoặc database khác, tạo schema tương đương, ánh xạ UUID tài khoản và nhập JSON; kiểm tra số lượng/trạng thái/trùng ID.
4. Tạo API theo hợp đồng trên, thực thi phân quyền và HTTPS; chọn `VITE_REPORTS_PROVIDER=api`, `VITE_REPORTS_API_URL` trong build environment.
5. Để thay cả **Auth Supabase**, triển khai gateway tương ứng và xác thực/di chuyển danh tính người dùng. Nếu chỉ đổi nơi lưu **báo cáo**, Supabase Auth có thể tiếp tục dùng.
6. Đổi biến môi trường và deploy lại Github Pages, kiểm tra 2 tài khoản trước khi cắt dịch vụ cũ. Giữ bản sao lưu Supabase cho tới khi xác minh nhập thành công.

**Giới hạn trung thực:** JSON + API interface bảo đảm *đường chuyển đổi đã thiết kế*; không có nghĩa máy chủ thay thế đã được triển khai. Không bao gồm di chuyển mật khẩu hay phiên đăng nhập Supabase.

## 6. Biến môi trường

```env
# Bản hiện tại
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
VITE_REPORTS_PROVIDER=supabase

# Khi tự vận hành REST API về sau:
VITE_REPORTS_PROVIDER=api
VITE_REPORTS_API_URL=https://api.yourdomain.example
```

Nếu không có `VITE_REPORTS_PROVIDER`, CNNN mặc định dùng Supabase đang có. Những biến `VITE_` là cấu hình phía client; không bao giờ chứa mật khẩu DB hay service-role key.

## 7. Kiểm thử

- `npm run typecheck`, `npm run build`, `npm run check:reports`.
- Kiểm tra **RLS trực tiếp trên Supabase** với các tài khoản khác nhau. CI chỉ kiểm tra cấu trúc/mã, **không tự xác nhận** RLS khi migration chưa chạy.
- Sao lưu JSON của 2–3 báo cáo thử, nhập vào cơ sở dữ liệu thử nghiệm và kiểm tra lại đối chiếu ID trước khi triển khai chính thức.
