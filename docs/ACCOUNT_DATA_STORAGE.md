# CNNN — Tài khoản, dữ liệu và lưu trữ an toàn

**Trạng thái: giai đoạn 1 / chỉ bản nháp phục vụ học tập.**
Tính năng sao lưu đám mây **mặc định TẮT**, chưa sử dụng để lưu hồ sơ bệnh án thật.
Không tự động chuyển localStorage lên Supabase, không xóa dữ liệu hiện có.

## 1. Nguồn dữ liệu duy nhất

| Dữ liệu | Nguồn chân lý | Quyền |
|---|---|---|
| Tài khoản, email, mật khẩu, tên hiển thị | Supabase Auth (`auth.users` và user metadata) | Tự người dùng, Supabase |
| Catalog NANDA-I, NOC, NIC | `shared-data/nnn-catalog.json` (chung) | Mọi người đọc; không bản sao theo tài khoản |
| Kế hoạch nháp hiện có | localStorage key `clinicalnnn.plans.v2.user.<uid>` | **Chỉ phân vùng giao diện**, không phải mã hóa / kiểm soát truy cập an toàn |
| Bản sao lưu đám mây (mới) | `public.cnnn_backup_snapshots` | Chỉ chủ tài khoản theo JWT + RLS |
| Sao lưu bằng tệp JSON | Người dùng giữ ở thiết bị | Không tự động mã hóa; giữ tệp ở nơi an toàn |

**Không cần bảng profile thứ hai** cho họ tên/email; Auth đã có thông tin đó.
Không sao chép mật khẩu vào bất kỳ bảng SQL, localStorage hay GitHub nào.

## 2. Cài đặt Supabase (bắt buộc trước khi kích hoạt)

1. Mở Supabase Dashboard → Project **CNNN** → **SQL Editor**.
2. Tạo **New query**. Mở tệp
   `supabase/migrations/20261017000100_cnnn_account_backups.sql` trong repo và
   dán nguyên văn nội dung SQL → **Run** (chỉ chạy một lần trên dự án này).
3. Vào **Table Editor** kiểm tra bảng `public.cnnn_backup_snapshots`
   và trong cấu hình bảng xác nhận **RLS enabled**.
4. Mở **Database → Policies**: phải có 3 policy `select/insert/delete`
   giới hạn theo `auth.uid() = user_id`. Không có quyền UPDATE và không có
   chính sách cho role `anon`. Kiểm tra trong SQL Editor:
   ```sql
   select relname, relrowsecurity, relforcerowsecurity
   from pg_class where oid = 'public.cnnn_backup_snapshots'::regclass;

   select policyname, roles, cmd, qual, with_check
   from pg_policies where schemaname='public' and tablename='cnnn_backup_snapshots';

   select grantee, privilege_type from information_schema.role_table_grants
   where table_schema='public' and table_name='cnnn_backup_snapshots'
   order by grantee, privilege_type;
   ```
5. Trước khi mở cho mọi người, **dùng hai tài khoản thử nghiệm**, xác minh:
   A lưu bản nháp A → A thấy A; B không thấy bản sao A. Dùng B cố gọi API
   lấy/xóa `id` của A đều không được; người chưa đăng nhập không thể tạo
   hoặc xem bản sao. Thử phục hồi trên thiết bị khác bằng A.
6. Chỉ khi các bước trên đạt, trong GitHub repository CNNN →
   **Settings → Secrets and variables → Actions → Variables** thêm
   `VITE_CLOUD_BACKUP_ENABLED` = `true`. Hai biến
   `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` đã cấu hình vẫn giữ nguyên.
   Sau đó vào Actions → **Deploy CNNN to GitHub Pages** → **Run workflow**
   để build lại ứng dụng. Nếu chưa sẵn sàng, không tạo biến mới hoặc đặt `false`.

**Không chia sẻ service_role/secret key hay mật khẩu cơ sở dữ liệu.**
Publishable key được nhúng công khai trong Vite; dữ liệu được bảo vệ bởi JWT và
PostgreSQL RLS, không phải bằng cách giấu publishable key.

## 3. Cách sử dụng sau khi kích hoạt

Ở **Cài đặt → Sao lưu trong tài khoản**:

- **Sao lưu lên tài khoản**: sau xác nhận thủ công, tạo **một bản lưu mới**
  trên Supabase với tối đa 1 MB và 1.000 kế hoạch. Không ghi đè phiên bản cũ.
- **Khôi phục**: lấy một bản lưu từ cùng tài khoản; chỉ nhập kế hoạch có ID chưa
  tồn tại trên thiết bị. Các ID trùng được bỏ qua để tránh mất thay đổi cục bộ.
- **Xóa**: chỉ xóa phiên bản được chọn sau khi xác nhận.
- **Sao lưu/Khôi phục JSON** hiện có vẫn dùng bình thường và không phụ thuộc mạng.

Bảng hiển thị tối đa 10 bản sao gần nhất. Không có tự động đồng bộ khi chỉnh sửa
một kế hoạch; người dùng chủ động chọn lúc gửi/khôi phục. Không tự động tải dữ
liệu cũ trên thiết bị hoặc bản mẫu đi nơi khác. Trình duyệt chưa kết nối mạng
sẽ không xóa các bản nháp cục bộ.

## 4. Quyền riêng tư & lộ trình nâng cấp

**Chỉ dùng dữ liệu giả lập/đào tạo không nhận dạng người bệnh.** Các trường
`patient.name`, `mrn`, `ward`, `bed`, `medicalDiagnoses`,
`allergies`, văn bản ghi chú và lịch sử đánh giá có thể chứa dữ liệu nhạy cảm.
RLS là lớp kiểm soát truy cập, **không đủ** để chứng nhận an toàn dữ liệu lâm sàng
hoặc tuân thủ yêu cầu pháp lý. Cần đánh giá quyền riêng tư, mã hóa và quản lý
khóa, xác thực tăng cường, quyền nhân viên, audit và quy trình xóa/giữ dữ liệu
phù hợp trước khi dùng thông tin bệnh án thật.

### Giai đoạn tiếp theo (chưa kích hoạt)

1. Thiết kế `CarePlanRepository` đồng bộ tự động theo hàng (row) với optimistic
   concurrency / conflict resolution thay cho tải nguyên mảng snapshot.
2. Quy định dữ liệu người bệnh tách khỏi kế hoạch và bổ sung chính sách truy cập
   theo cơ sở/phạm vi được ủy quyền. **Không cho người dùng khác đọc hồ sơ chỉ
   vì cùng bệnh viện hoặc mã kế hoạch**.
3. Lịch sử phiên bản, audit truy cập, backup server định kỳ và khôi phục thảm họa.
4. Mã hóa dữ liệu trên thiết bị hoặc ngừng lưu định danh trong localStorage;
   dọn cache nhạy cảm khi đăng xuất, đánh giá rủi ro XSS và xóa tài khoản.
5. Kiểm thử RLS bằng bộ test tích hợp ở Supabase (mỗi quyền với ít nhất 2 UID,
   role `anon`, role `authenticated`). Tạo môi trường thử nghiệm riêng trước
   khi áp dụng chính sách mới trên dữ liệu sản xuất.

## 5. Kiểm tra mã

Chạy `npm run typecheck`, `npm run build`,
`npm run check:cloud-backup`, `npm run check:account` và
`npm run check:care-plan`. Chúng kiểm tra các bất biến trong repository;
**không thay thế** kiểm tra RLS trực tiếp trong dự án Supabase.
