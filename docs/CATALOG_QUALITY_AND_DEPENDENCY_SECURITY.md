# CNNN — Minh bạch NNN và bảo trì bảo mật (đợt 2)

## Trạng thái đã triển khai trong mã

- Không thay đổi tập mã NANDA-I, NOC, NIC, bản dịch, định nghĩa hoặc can thiệp. Không sửa kế hoạch đang lưu trên Supabase.
- Thư viện hiện hiển thị số nhãn Việt vẫn ở trạng thái chưa thẩm định, và nhắc khi ấn bản nguồn của một hệ cũ hơn metadata nhà xuất bản trong dự án.
- Chi tiết thuật ngữ hiển thị nhãn tiếng Anh nguyên gốc và tình trạng bản dịch chưa duyệt.
- Trang Tham khảo hiển thị tổng số nhãn cần kiểm duyệt theo hệ từ **một** nguồn `shared-data/nnn-catalog.json`.
- CI không cho bản dịch được đánh dấu đã duyệt một cách vô tình. Mọi trạng thái muốn đổi phải có bước kiểm định độc lập.
- CI chạy `npm audit --omit=dev --audit-level=high` (chặn mức cao trong sản phẩm). Mọi lỗ hổng dev-only được báo qua `npm audit --audit-level=high` mà không tự xóa hay tăng major có thể gây lỗi.
- Dependabot mở PR cập nhật gói npm và GitHub Actions hàng tuần. Mỗi PR phải được kiểm tra build / chức năng trước khi gộp.
- Basic source scanner chặn tệp sách hoặc gói nguồn có dấu hiệu mới được thêm vào repo công khai. Nguồn NIC 8 đã xuất bản trước đó **vẫn đang công khai**; guard không thể thu hồi nội dung đã công bố.

## Số liệu metadata hiện tại

- NANDA-I 13: 277 thuật ngữ; chưa thẩm định các nhãn dịch hiện có.
- NOC 6: 540 thuật ngữ; đánh dấu ấn bản cũ hơn NOC 7 trong metadata ấn bản của dự án.
- NIC 8: 614 thuật ngữ; phần lớn bản dịch nhãn tiếng Việt kế thừa hoặc đang ở dạng dự thảo.
- Tổng 1.431 nhãn hiện có `translationStatus` chứa `unreviewed`. Đây là **metadata trạng thái biên tập**, không phải kết quả đánh giá chuyên môn độc lập.

## Những việc chưa thể tự động giải quyết

1. **Quyền sử dụng / bản quyền:** cần chủ dự án xác minh giấy phép NANDA/NOC/NIC và phân loại nội dung được phép hiển thị công khai. Không nên gộp một PR tự ý xóa sách nguồn trước khi có nguồn lưu trữ được cấp phép, sao lưu thích hợp và phương án thay thế API đã kiểm thử. Repo hiện là công khai; chuyển tệp khỏi Git không thu hồi nội dung đã lộ.
2. **Thẩm định lâm sàng:** chỉ người có chuyên môn và nguồn đối chiếu phù hợp được xác nhận bản dịch, mã và liên kết NANDA–NOC–NIC. Không dịch tự động rồi gắn cờ `reviewed`.
3. **NOC 7:** phải đối chiếu mã và ấn bản từ tài liệu có quyền sử dụng. Không tự thêm/migrate ấn bản mới chỉ vì metadata ghi nhận có NOC 7.
4. **Dependency advisories:** bản cập nhật này thêm giám sát và PR định kỳ, không tuyên bố đã sửa hết cảnh báo `npm audit`. Dev-only high advisories cần được ưu tiên phân loại theo khả năng khai thác, có thể cần nâng major Vite/Tailwind theo từng PR riêng.
5. **Tài liệu kế hoạch và bảo mật dữ liệu thật:** CNNN hiện phục vụ dữ liệu người bệnh giả lập. localStorage hiện không mã hóa, không được coi là hệ thống lưu hồ sơ lâm sàng được phê duyệt.

## Quy trình xử lý PR Dependabot

- Kiểm tra nguồn gói, CVE, ảnh hưởng build-vs-runtime, bản vá có breaking changes hay không.
- Giữ yêu cầu `npm ci`, typecheck, build, tất cả kiểm thử NNN/auth/autosave và kiểm thử giao diện sau cập nhật.
- Không chạy `npm audit fix --force` hoặc nâng React/Vite major hàng loạt mà chưa đánh giá.
- Nếu CI production audit chặn, xem thông báo `npm audit`, vá bản phụ thuộc qua PR có lockfile đồng bộ. Không tắt kiểm tra chỉ để triển khai.
