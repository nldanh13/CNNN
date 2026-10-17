# CNNN: tự lưu 3 người bệnh theo tài khoản

## Mục tiêu
- Đăng nhập bằng tài khoản Supabase như hiện tại.
- Mỗi tài khoản có một **kho kế hoạch riêng trên Supabase**, tối đa **3 người bệnh** (mỗi kế hoạch tương ứng một người bệnh).
- Bất cứ thay đổi nào ở kế hoạch được **tự động gửi** về Supabase. Không còn thao tác Sao lưu / Khôi phục trong giao diện.
- Dữ liệu ở thiết bị khác sẽ hiện khi đăng nhập lại. Nếu mở nhiều thiết bị cùng lúc, hệ thống sử dụng phiên bản dữ liệu để từ chối ghi đè và hiển thị cảnh báo; hiện chưa có hợp nhất tự động.
- Không bật MFA; vẫn sử dụng email, mật khẩu và Turnstile.
- Không xóa bất kỳ localStorage kế hoạch nào hoặc bảng snapshot cũ.

## Bước 1. Chạy SQL mới (bắt buộc trước khi bật cờ GitHub)
Supabase Dashboard → dự án CNNN → SQL Editor → New query; mở tệp **SQL tổng hợp**:
`supabase/CNNN_DATABASE_ALL_IN_ONE.sql`

Đặt tên Query trong Supabase SQL Editor là **CNNN - Quan ly du lieu va tai khoan** và chạy nguyên văn một lần. File tổng hợp chứa cả 3 migration đã thực hiện trước đây và có thể chạy lại mà không xóa bảng, tài khoản hoặc hồ sơ cũ. Bảng và quyền được cập nhật trong một giao dịch. Bạn có thể xóa những **Query đã lưu trong SQL Editor** sau khi xác nhận Query tổng hợp chạy thành công; không xóa các bảng, chính sách RLS, hàm, trigger hoặc tệp SQL migrations trong GitHub.

Tạo `public.cnnn_patient_workspaces` và hàm `public.cnnn_save_patient_workspace`. Hàm xác định tài khoản qua `auth.uid()`, chặn quá 3 kế hoạch và yêu cầu `revision` phù hợp. Cả dữ liệu và quyền ghi đều ở server, không tin client về user ID hoặc giới hạn 3 người.

Xác minh với **SQL Editor chỉ để kiểm tra cấu hình**:

```sql
select relrowsecurity, relforcerowsecurity
from pg_class
where oid = 'public.cnnn_patient_workspaces'::regclass;

select policyname, cmd, roles, qual from pg_policies
where schemaname = 'public' and tablename = 'cnnn_patient_workspaces';

select grantee, privilege_type from information_schema.role_table_grants
where table_schema = 'public' and table_name = 'cnnn_patient_workspaces';
```

RLS và FORCE RLS phải `true`; có chính sách SELECT owner-only; role `authenticated` chỉ có SELECT trực tiếp (ghi qua RPC đã giới hạn). Không dùng SQL Editor admin để thử phân quyền hai tài khoản.

## Bước 2. Kích hoạt kho tài khoản

Chủ dự án đã xác nhận chạy SQL tổng hợp ngày 17/10/2026. Workflow GitHub Pages trên nhánh `main` mặc định build `VITE_PATIENT_CLOUD_ENABLED=true`. Khi thay đổi này được gộp và triển khai thành công, tính năng tự lưu được bật mà **không cần thêm biến GitHub**.

Để tạm dừng tính năng nếu xảy ra sự cố, vào GitHub CNNN → Settings → Secrets and variables → Actions → Variables và tạo/sửa biến **`VITE_PATIENT_CLOUD_ENABLED` = `false`** (chữ thường). Sau đó deploy lại GitHub Pages bằng workflow hoặc commit. Dữ liệu cloud và dữ liệu cũ trên thiết bị **không bị xóa** khi chuyển trạng thái. Đổi lại `true` để bật sau khi khắc phục lỗi.

**Không áp dụng ngay cho người bệnh thật** cho đến khi hoàn tất kiểm thử tách tài khoản và phê duyệt lưu trữ dữ liệu y tế.

Biến cũ `VITE_CLOUD_BACKUP_ENABLED` có thể xóa khỏi GitHub Variables khi không còn dùng; chương trình mới không đọc biến này. **Không xóa bảng `cnnn_backup_snapshots`** vì có dữ liệu cũ có thể cần chuyển.

## Bước 3. Giữ và chuyển dữ liệu cũ an toàn
Nếu tìm thấy kế hoạch cũ trong localStorage của cùng UID hoặc một bản snapshot cũ (mà người dùng đã chủ động sao lưu), CNNN hiển thị **một lần** màn hình `Chuyển kế hoạch cũ vào tài khoản`. Chỉ khi người dùng chọn chuyển, dữ liệu mới được gửi lên kho chính thức. Bản cũ vẫn giữ nguyên.

Nếu có hơn 3 kế hoạch, hệ thống **không tự xóa** những kế hoạch vượt giới hạn. Cần tự phân loại dữ liệu mô phỏng thành tối đa 3 kế hoạch; không tự xóa hoặc ép chuyển.

Nếu lỗi mạng, thay đổi đang sửa được giữ trong cache gắn UID trên thiết bị, màn hình hiển thị trạng thái chưa lưu. Khi nhấn **Thử lưu lại**, chương trình gửi dữ liệu. Nếu có xung đột phiên bản ở thiết bị khác, không ghi đè bản phía server; khi đăng nhập lại, chương trình hỏi người dùng trước khi chuyển các bản chưa đồng bộ.

## Bước 4. Kiểm tra bằng dữ liệu mô phỏng
1. Tài khoản A: tạo 1 kế hoạch, chỉnh sửa, chờ `Đã lưu vào tài khoản`.
2. Mở trình duyệt khác / tab ẩn danh, đăng nhập A: kế hoạch xuất hiện và nội dung sửa vẫn đúng.
3. Thử tạo đủ 3 kế hoạch: nút tạo thứ tư bị khóa, và RPC tại server cũng từ chối mảng hơn 3 kế hoạch.
4. Đăng nhập tài khoản B: B không thấy kế hoạch của A. Thử API owner-only bằng JWT B qua client thử nghiệm (không dùng admin SQL).
5. Khi mạng bị ngắt, ứng dụng phải báo chưa đồng bộ; không xóa bản cũ khi bật lại mạng.
6. Thử đăng nhập, đổi mật khẩu, Turnstile, Library NNN và Trợ lý chẩn đoán.

**Không nhập hồ sơ bệnh án thật.** Tính năng này chưa có quy trình tuân thủ cho dữ liệu sức khỏe, mã hóa dữ liệu cục bộ, lịch sử thay đổi đa người dùng hay giải quyết xung đột thời gian thực. Local cache và dữ liệu cũ trên trình duyệt không được mã hóa.

## Bước 5. Ngắt nếu có sự cố
Đổi `VITE_PATIENT_CLOUD_ENABLED=false` và deploy lại. Phần dữ liệu cloud không bị xóa, nhưng các máy trở về chế độ dữ liệu cục bộ cho đến khi tính năng cloud hoạt động trở lại. Không xóa bảng, không tự chuyển dữ liệu cloud ngược vào local; cần sửa lỗi trước khi tiếp tục.
