# CNNN — Rà soát kế hoạch trước khi in/PDF

## Mục tiêu
Bổ sung bước rà soát **không làm thay đổi dữ liệu** trước khi in kế hoạch chăm sóc. Tệp in phản ánh nguyên trạng dữ liệu đang hiển thị, không tự bổ sung nhận định, liên kết chẩn đoán hay điểm lượng giá.

## Khi bấm In
- Nếu kế hoạch đầy đủ về mặt kỹ thuật và dữ liệu đã đồng bộ, mở ngay hộp thoại in như trước.
- Nếu thiếu thông tin hoặc có nguy cơ chưa đồng bộ, hiện danh sách rõ theo từng vấn đề chăm sóc; người dùng có thể quay lại bổ sung hoặc chọn **Vẫn in bản hiện tại**.
- Các nhắc nhở bao gồm tên người bệnh, kế hoạch rỗng, mã/nhãn NANDA-I/NOC/NIC không hợp lệ, can thiệp trùng, thang/điểm NOC không hợp lệ, yếu tố nguy cơ chưa có ở chẩn đoán nguy cơ, và NOC chưa được lượng giá.
- **Chưa lượng giá NOC** chỉ là lời nhắc, không phải lỗi chuyên môn mặc định: kế hoạch mới lập có thể chưa có kết quả theo dõi.
- Khi trạng thái lưu là **đang lưu**, **lỗi** hoặc **xung đột**, thông báo rõ bản in có thể chỉ là dữ liệu hiện tại trên thiết bị. Khi chưa tải/đối chiếu xong dữ liệu cloud cũng hiển thị cảnh báo.
- Không tự gộp, ghi đè, thay đổi hay xóa bản nháp người bệnh; không đụng SQL, cấu trúc tài khoản hoặc catalog.

## Giới hạn
Đây là kiểm tra **tính đầy đủ và hợp lệ kỹ thuật** chứ không phải thẩm định lâm sàng, xác nhận nguồn dịch hay đảm bảo độ chính xác liên kết NANDA–NOC–NIC. Người có chuyên môn vẫn phải đối chiếu với người bệnh, hồ sơ và tài liệu được phép sử dụng. Dự án hiện chỉ nên dùng dữ liệu giả lập, không dành cho lưu trữ hồ sơ y tế thực tế.

## Kiểm thử
```sh
npm ci
npm run typecheck
npm run check:print-layout
npm run build
```
Các ca kiểm tra bảo đảm kế hoạch không bị sửa khi rà soát, phát hiện thiếu dữ liệu, phân biệt đã/chưa đồng bộ và vẫn cho phép người dùng in khi chủ động chấp nhận lưu ý.
