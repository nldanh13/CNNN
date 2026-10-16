# CNNN — Một hệ thống NNN duy nhất

> Trạng thái: **đã bắt đầu triển khai trên nhánh thiết kế**, không đổi dữ liệu gốc trên `main`.  
> Nguyên tắc: **3 danh mục duy nhất — NANDA-I, NOC, NIC — và 1 quy trình hướng dẫn chẩn đoán**.  
> Ngày: 2026-10-17.

## 1. Quy tắc bất biến

1. **Một danh mục NANDA-I, một danh mục NOC, một danh mục NIC.** Không tạo `NANDA for library`, `NIC for Reader`, `NIC for care plan` hay kho thuật ngữ độc lập theo màn hình.
2. **Mọi mã và nhãn dùng chung nguồn `shared-data/nnn-catalog.json`.** Tệp đã có 1.431 bản ghi: 277 NANDA-I, 540 NOC, 614 NIC. Chỉ quản lý đúng một ấn bản đang hoạt động cho mỗi hệ: NANDA-I 13 (2024–2026), NOC 6 (2018), NIC 8 (2024). Không nâng phiên bản tự động.
3. **Mỗi thuật ngữ định danh bằng `system:code` trong danh mục đang hoạt động; khi lưu lịch sử thêm edition/revision**. Code là chuỗi để giữ các số 0 đầu. Không liên kết bằng code đơn lẻ giữa các hệ.
4. **Có duy nhất một cửa truy cập: `src/data/dataHub.ts`.** Thư viện, tìm kiếm, ô chọn chẩn đoán, kiểm tra kế hoạch, và trình đọc chi tiết đều hỏi cùng dataHub. Các module cũ chỉ là adapter tạm.
5. **Chi tiết là thuộc tính mở rộng của mã, không phải một danh mục mới.** Định nghĩa/hoạt động NIC Reader, thang đo NOC, phân lớp NANDA, dịch Việt, chú giải, và bằng chứng đều được nối về đúng `system:code`.
6. **Một hướng dẫn thống nhất**: Nhận định → NANDA-I → NOC → NIC → Lượng giá lại. Dùng cùng `NnnReasoningWorkflow` trong trang Hướng dẫn và khi lập kế hoạch; không tự suy đoán liên kết lâm sàng NANDA–NOC–NIC.
7. **Kế hoạch người bệnh không phải bộ thuật ngữ**. Chỉ tham chiếu 3 catalog, lưu dữ liệu bệnh nhân riêng. Không ghi dữ liệu người bệnh vào catalog hoặc GitHub.

## 2. Sơ đồ kiến trúc thực tế

~~~mermaid
flowchart TD
  A["shared-data/nnn-catalog.json — 1431 thuật ngữ"] --> B["sharedCatalog.ts → taxonomy.ts"]
  B --> C["dataHub.ts — một API, ba nhóm NANDA / NOC / NIC"]
  C --> D["Thư viện và tìm kiếm"]
  C --> E["Chọn mã và kiểm tra kế hoạch"]
  C --> F["NIC 8 chi tiết (tra cứu theo cùng mã)"]
  G["NIC định nghĩa / hoạt động có phép sử dụng"] --> F
  C --> H["Hướng dẫn chẩn đoán duy nhất"]
  H --> E
  I["Dịch / phân lớp / thang đo / tham chiếu"] -. "metadata theo mã" .-> C
  E --> J["Kế hoạch người bệnh (localStorage / sao lưu)"]
~~~

`NIC 8 chi tiết` **không còn là một mục thư viện riêng trên menu**. Nó vẫn có thể mở theo link từ đúng can thiệp NIC trong ba hệ. Metadata nguồn có thể nằm ở tệp khác vì quyền truy cập/kích thước, nhưng tập hợp mã và tên luôn lấy từ **một catalog NIC duy nhất**.

## 3. Dữ liệu được thống nhất như thế nào?

| Dữ liệu | Nguồn chuẩn / cách dùng | Có phải catalog độc lập? |
|---|---|---|
| Mã + nhãn NANDA, NOC, NIC | `shared-data/nnn-catalog.json` → `dataHub` | **Không**; đây chính là 3 nhóm của 1 kho NNN |
| Nhãn Việt, cờ dịch dự thảo | Thuộc tính theo `system:code` từ `nnn-catalog.json` | Không |
| Lĩnh vực / phân lớp | Thuộc tính theo mã, `taxonomy.ts` là adapter | Không |
| Định nghĩa và hoạt động NIC 8 | Nội dung mở rộng theo **mã NIC đã tồn tại**, Reader join với `dataHub` | Không |
| Thang đo / chỉ số NOC | Chi tiết của kết quả NOC; phải đối chiếu nguồn | Không |
| Mapping NANDA/NIC lịch sử | Chỉ dùng đọc/chuyển hồ sơ cũ, không thêm mã vào bộ chọn mới | Không |
| Diễn giải mã, tài liệu nguồn | Metadata/giải thích có gắn mã và trạng thái kiểm duyệt | Không |
| Kế hoạch, đánh giá người bệnh | Kho nghiệp vụ riêng, luôn tham chiếu mã chuẩn | Không |

**Không cần chia `nnn-catalog.json` thành 3 tệp hoặc nhân bản thành nhiều `catalog`.** Bản thân trường `system` đã phân phối chính xác 3 bộ dữ liệu. Tách thành các tệp con chỉ hợp lý nếu đó là phân vùng vật lý của **cùng một nguồn chân lý**, không phải các bản được sửa độc lập.

## 4. API thống nhất

~~~ts
dataHub.systems;                             // ['nanda', 'noc', 'nic']
dataHub.listLibrary('nanda');                 // 277 mục
dataHub.listLibrary('noc');                   // 540 mục
dataHub.listLibrary('nic');                   // 614 mục
dataHub.getTerm('nanda', '00132');            // Thuật ngữ chung cho mọi trang
dataHub.getTranslation('nic', '0140');        // Nhãn Việt cùng nguồn
dataHub.getTranslationStatus('nic', '0140');  // Trạng thái thẩm định
dataHub.search('nanda', 'đau');
dataHub.searchClinical('nic', '0140');        // Cùng search, tên cũ tương thích
dataHub.searchLibrary('noc', '', 'ALL');      // Cùng search + lọc domain
dataHub.editionFor('noc');                    // Metadata phiên bản đang dùng
~~~

`src/lib/search.ts` chỉ chuyển tiếp đến `dataHub.search` vì vẫn có code cũ import `searchSystem`. Không xây thêm chỉ mục độc lập ở đó.

NIC Reader lấy danh sách mã từ `dataHub.listLibrary('nic')`; tệp nguồn chỉ cung cấp chi tiết. Reader kiểm tra đủ số lượng và từng code, không lấy tên riêng hoặc tự sinh can thiệp mới. Nếu dữ liệu không khớp, phải báo lỗi và kiểm tra nguồn thay vì hiển thị hai tập NIC khác nhau.

## 5. Một hướng dẫn chẩn đoán

| Bước | Việc điều dưỡng thực hiện | Nguồn CNNN |
|---|---|---|
| 1. Nhận định | Thu thập dấu hiệu, yếu tố nguy cơ, bối cảnh người bệnh | Dữ liệu người bệnh trong kế hoạch |
| 2. NANDA-I | Xác định chẩn đoán phù hợp bằng bằng chứng nhận định | Chỉ `dataHub.nanda` |
| 3. NOC | Chọn kết quả, thang đo và mục tiêu cần đánh giá | Chỉ `dataHub.noc` |
| 4. NIC | Chọn can thiệp theo tình trạng thực tế và phạm vi hành nghề | Chỉ `dataHub.nic` |
| 5. Lượng giá | Ghi điểm NOC theo thời gian, điều chỉnh kế hoạch | Kế hoạch người bệnh |

Ứng dụng hiện chưa có kho mapping NANDA–NOC–NIC được thẩm định cho tất cả trường hợp. Do đó **hướng dẫn là quy trình tư duy**, không phải công cụ tự chẩn đoán, không tự sinh hoạt động can thiệp từ mã.

## 6. Những tệp thay đổi trên nhánh này

- `src/data/dataHub.ts`: giữ toàn bộ tra cứu/lookup/nhãn/edition từ một catalog.
- `src/lib/search.ts`: adapter trỏ vào dataHub, không index riêng.
- `src/data/nic8Reader.ts`: danh sách NIC Reader sinh từ 614 mã canonical, nội dung chi tiết join bằng code, nhãn hiển thị lấy từ dataHub.
- `src/lib/carePlanSafety.ts`: kiểm tra NANDA, NOC, NIC qua dataHub.
- `src/components/Layout.tsx`: thay mục menu NIC Reader riêng bằng một mục `Hướng dẫn chẩn đoán`, NIC Reader còn là chi tiết của NIC.
- `src/pages/PlanEditorPage.tsx`: sử dụng lại cùng component `NnnReasoningWorkflow` với trang hướng dẫn.
- `scripts/check-unified-catalog.ts`, `npm run check:unified-catalog`: regression check đảm bảo ba danh mục duy nhất và NIC Reader khớp 614 mã.

**Không có mã thuật ngữ nào bị xóa hoặc tự đổi; không thay đổi dữ liệu patient/backup; không có việc nhập bản NIC 7 hay NOC 7 như bộ thuật ngữ thứ tư.**

## 7. Kiểm tra trước khi merge

~~~sh
npm ci
npm run typecheck
npm run build
npm run check:unified-catalog
npm run check:shared-data
npm run check:data-hub
npm run check:search
npm run check:nic8-reader
npm run check:care-plan
~~~

Kiểm tra nhãn, code, phiên bản, bản dịch, legacy migration, backup và liên kết trong giao diện. Bởi vì repo này có tệp nguồn sách và dữ liệu điều dưỡng, phải rà soát **quyền sử dụng nội dung** trước khi deploy bản public. Kiến trúc thống nhất không tự giải quyết quyền phân phối hoặc yêu cầu bảo vệ dữ liệu người bệnh.

> Tài liệu này diễn tả nguyên tắc một nguồn chung và thay đổi đã commit trên nhánh. Chưa khẳng định build/test chạy thành công cho đến khi có kết quả CI hoặc chạy tại máy phát triển.


## 8. Xác nhận kiểm duyệt của chủ dự án (17/10/2026)

Chủ dự án đã xác nhận rằng dữ liệu danh mục hiện có đã được kiểm duyệt. Ghi nhận xác nhận này ở **chính tệp** `shared-data/nnn-catalog.json`, thuộc tính `ownerReview`, không tạo kho thuật ngữ thứ tư, không tạo lớp JSON phiên bản song song và không sửa mã.

- `ownerReview.status = confirmed-by-project-owner`: xác nhận của chủ dự án, **không** đồng nghĩa thẩm định/xác thực chính thức bởi nhà xuất bản.
- `ownerReview.recordedAt`: ngày ghi nhận xác nhận, không suy luận ngày từng thuật ngữ được hiệu đính.
- `translationMethod`, `translationStatus`, `englishLabelStatus`: giữ nguyên **dấu vết lịch sử của quá trình tạo dữ liệu**. Trên giao diện, những cờ lịch sử không còn bị diễn giải thành việc toàn bộ danh mục đang chờ kiểm duyệt.
- `translateVi` đánh dấu nhãn hiện có trong ba bộ danh mục đã được chủ dự án xác nhận, không hiện badge `dịch máy` cho chính những nhãn này. Kết quả dịch ngoài danh mục vẫn là fallback, còn mang cờ cảnh báo.
- Tất cả 1.431 mục giữ nguyên mã và nhãn; 210 mục chưa có phân lớp rõ ràng trong dữ liệu vẫn là vấn đề **độ đầy đủ** chứ không tự biến thành phân lớp cụ thể.
- NIC 8 có 614 can thiệp và nội dung nguồn tiếng Tây Ban Nha cho 614 mã; chỉ những mã thực sự có đầy đủ định nghĩa và hoạt động đã dịch mới hiển thị bản dịch. Hiện bảng dịch chi tiết có 1 mã. Ghi nhận kiểm duyệt không tự dịch 613 mã khác, không thay thế việc kiểm chứng nhãn tiếng Anh chính thức.
- NANDA-I 13 và NOC 6 còn bộ dữ liệu chi tiết nguồn để tham khảo, nhưng muốn hiển thị nguyên văn ở ứng dụng public phải xác nhận quyền phân phối. Không nhập nội dung sách vào catalog công khai chỉ vì bản dịch hoặc danh mục đã được người dùng rà soát.

### Bố cục dữ liệu cho ba nhóm (không có phiên bản bản sao)

| Nhóm | Chi tiết cùng mã | Giao diện |
|---|---|---|
| NANDA-I | Mã, tên Việt/gốc, lĩnh vực, phân lớp; phần giải thích/nhận định gắn mã | 1 tab NANDA-I trong Thư viện |
| NOC | Mã, tên Việt/gốc, lĩnh vực, phân lớp, thang đo và chỉ số khi được đối chiếu | 1 tab NOC trong Thư viện |
| NIC | Mã, tên Việt/gốc, định nghĩa và hoạt động theo mã (kèm trạng thái ngôn ngữ) | 1 tab NIC; Reader chỉ là trang chi tiết của mã đó |
| Hướng dẫn | Nhận định → NANDA → NOC → NIC → Lượng giá | Dùng **cùng một** `NnnReasoningWorkflow` ở hướng dẫn và khi lập kế hoạch |

**Bài kiểm tra:** `npm run check:owner-review` kiểm tra xác nhận của chủ dự án, 3 tập thuật ngữ nhất quán, dịch Việt có sẵn, dấu vết provenance không mất và NIC Reader không nhận trạng thái dịch đầy đủ nếu nội dung chưa có.
