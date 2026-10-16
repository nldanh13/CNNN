# CNNN — Thiết kế kiến trúc dữ liệu thống nhất (đề xuất v2)

> Trạng thái: **Design proposal / chưa áp dụng cho runtime**. Ngày rà soát: 2026-10-17.  
> Phạm vi: repository `nldanh13/CNNN`, nhánh `main`.  
> Mục tiêu: gom về một bộ catalog có phiên bản; phân biệt dữ liệu xuất bản, dữ liệu nguồn hạn chế, bản dịch, mapping lịch sử và dữ liệu kế hoạch chăm sóc; tái cấu trúc không làm mất dữ liệu hay đổi hành vi đang chạy.

## 1. Hiện trạng và ranh giới dữ liệu

| Lớp hiện tại | Vị trí | Vai trò / vấn đề |
|---|---|---|
| Catalog đang được app sử dụng | `shared-data/nnn-catalog.json` → `src/data/sharedCatalog.ts` → `src/data/taxonomy.ts` | Catalog chung 1.431 bản ghi: NANDA-I 277 (ấn bản 13, 2024–2026), NOC 540 (ấn bản 6), NIC 614 (ấn bản 8). Metadata, nhãn Việt và thông tin kiểm duyệt đang nằm chung một tệp lớn. |
| Nội dung NIC 8 cho Reader | `shared-data/nic8-licensed-es-source.json`, `shared-data/nic8-translations.json`, `src/data/nic8Reader.ts` | Dữ liệu nguyên bản tiếng Tây Ban Nha và bản dịch ghép theo code, có fallback. Cần tách khỏi catalog dùng chung, kiểm soát quyền sử dụng. |
| Kho trích xuất đầu vào | `CNNN_English_First_Source_Package/*` | Gói nguồn/historical/work-in-progress gồm NANDA, NOC, NIC 7, NIC 8 và Ackley. Không được mặc nhiên coi là dữ liệu xuất bản hoặc bản dịch chính thức. |
| Mapping và bản cũ | `src/data/nicMigration.ts`, `src/data/reference.ts`, `legacy/*` | Trộn bảng chuyển mã, thuật ngữ cũ, thang đo NOC và các bảng tham chiếu; khó theo dõi nguồn và phiên bản. |
| Dịch và giải thích | `src/lib/translate.ts`, `src/lib/viDictionary.ts`, `src/data/vi/*`, `src/data/nnnExplanations.ts` | Dịch quy tắc/dịch tạm có thể xen với dịch hiệu đính. Giải thích mang tính biên tập không nên nhầm với nội dung sách. |
| Nghiệp vụ và dữ liệu người bệnh | `src/types.ts`, `src/lib/carePlan.ts`, `src/store/AppContext.tsx`, `src/store/storage.ts` | Kế hoạch và thông tin người bệnh lưu trên localStorage theo key `clinicalnnn.plans.v2`. Cần tách domain model, repository và persistence. |
| Kiểm tra | `scripts/check-*.ts`, `src/data/editionAudit.ts` | Đã có bộ kiểm tra; còn phụ thuộc đường dẫn, tổng bản ghi và trạng thái xuất bản hiện hành. |

**Phân loại nguồn chân lý (source of truth):**
1. *Dữ liệu nguồn có giấy phép* là tư liệu tham chiếu riêng, không phải artifact public.
2. *Authoring catalog* là tập dữ liệu được chuẩn hóa và kiểm duyệt, có provenance/edition theo từng mục.
3. *Compiled catalog* là đầu ra **chỉ đọc**, được build từ authoring; ứng dụng không chỉnh sửa trực tiếp.
4. *Care plans* là dữ liệu nghiệp vụ độc lập, không nằm trong catalog, không commit lên GitHub.

## 2. Đề xuất bố cục thư mục

~~~text
CNNN/
├── data/
│   ├── authoring/                         # Nguồn chân lý cho dữ liệu được phép xuất bản
│   │   ├── manifest.json                  # Phiên bản + revision + số lượng + checksum
│   │   ├── taxonomies/
│   │   │   ├── nanda/13/
│   │   │   │   ├── terms.json             # Mã, nhãn gốc, domainId, classId
│   │   │   │   ├── domains.json
│   │   │   │   └── classes.json
│   │   │   ├── noc/6/
│   │   │   │   ├── terms.json
│   │   │   │   ├── domains.json
│   │   │   │   ├── classes.json
│   │   │   │   └── scales.json
│   │   │   └── nic/8/
│   │   │       ├── terms.json
│   │   │       ├── domains.json
│   │   │       └── classes.json
│   │   ├── locales/
│   │   │   └── vi/
│   │   │       ├── nanda-13.json         # Dịch theo composite key
│   │   │       ├── noc-6.json
│   │   │       └── nic-8.json
│   │   ├── crosswalks/
│   │   │   ├── nanda-renames.json
│   │   │   ├── nanda-retired.json
│   │   │   └── nic7-to-nic8.json         # Alias lịch sử; không cho phép chọn mới
│   │   ├── editorial/
│   │   │   └── explanations.json         # Bài giải thích do nhóm CNNN biên soạn
│   │   └── references/
│   │       ├── sources.json              # Edition, ISBN, URL, quyền sử dụng
│   │       ├── reviewed-links.json       # Liên kết NANDA–NOC–NIC đã duyệt
│   │       └── edition-audit.json
│   ├── restricted/                        # KHÔNG COMMIT, gitignore; kho riêng có kiểm soát
│   │   ├── textbook-extracts/
│   │   └── nic8-source/                  # Nội dung đầy đủ chỉ theo quyền được cấp
│   └── generated/
│       ├── nnn-catalog.json              # Dữ liệu an toàn để cấp cho web
│       ├── search-index.json             # Tuỳ chọn: index sinh trong bước build
│       └── generation-report.json        # Diff/count/status/error
├── src/
│   ├── domain/
│   │   ├── catalog/
│   │   │   ├── types.ts                  # Taxonomy, Term, Translation, Provenance
│   │   │   ├── validators.ts
│   │   │   └── selectors.ts
│   │   └── care-plan/
│   │       ├── types.ts                  # Patient/CarePlan/CareEntry
│   │       ├── validation.ts
│   │       └── migrations.ts
│   ├── repositories/
│   │   ├── CatalogRepository.ts          # API đọc catalog thống nhất
│   │   ├── NicReaderRepository.ts        # Nội dung Reader tách khỏi catalog
│   │   └── CarePlanRepository.ts         # API lưu/đọc kế hoạch
│   ├── services/
│   │   ├── search.ts
│   │   ├── localization.ts
│   │   ├── carePlan.ts
│   │   └── evidence.ts
│   ├── data/
│   │   ├── dataHub.ts                    # Facade tương thích trong giai đoạn chuyển đổi
│   │   └── taxonomy.ts                   # Adapter tương thích, sẽ thu gọn dần
│   ├── pages/
│   └── components/
├── scripts/
│   ├── build-catalog.ts                   # Authoring -> generated/compiled
│   ├── validate-catalog.ts               # Rules + referential integrity
│   ├── audit-translation.ts
│   ├── compare-catalog.ts                # Diff mã, edition, nhãn
│   └── migrate-legacy.ts
├── shared-data/
│   └── nnn-catalog.json                  # FILE BUILD OUTPUT TƯƠNG THÍCH TẠM THỜI
└── docs/
    └── DATA_ARCHITECTURE.md
~~~

**Không cần di chuyển toàn bộ mã cùng lúc.** `shared-data/nnn-catalog.json` tiếp tục được tạo ra dưới đúng đường dẫn cũ trong giai đoạn chuyển tiếp để mọi import hiện tại còn hoạt động. Sau khi đổi hết import, mới xóa adapter và output cũ.

## 3. Mô hình dữ liệu chuẩn

Dùng khóa thuật ngữ `system:edition:code` (ví dụ `nanda:13:00097`, `noc:6:2102`, `nic:8:0140`). **Code luôn là string** để giữ số 0 đầu; không được join chỉ theo code, vì code/nhãn có thể trùng giữa hệ hoặc thay đổi qua ấn bản.

### 3.1 Term: một record mỗi mã trong mỗi ấn bản

~~~json
{
  "id": "nanda:13:00097",
  "system": "nanda",
  "edition": "13",
  "code": "00097",
  "labelOriginal": "Decreased diversional activity engagement",
  "originalLanguage": "en",
  "domainId": "Domain_1_Health_promotion",
  "classId": "Class_1_Health_awareness",
  "sourceId": "nanda-i-13",
  "status": "active"
}
~~~

`status`: `active | retired | historical`. Một `Term` không chứa dịch máy, các hoạt động đầy đủ, hay dữ liệu người bệnh.

### 3.2 Translation: tách theo ngôn ngữ và trạng thái

~~~json
{
  "termId": "nanda:13:00097",
  "field": "label",
  "locale": "vi",
  "text": "Giảm tham gia hoạt động giải trí",
  "method": "rule-draft",
  "reviewStatus": "draft-unreviewed",
  "reviewer": null,
  "reviewedAt": null
}
~~~

Trạng thái đề xuất: `draft-unreviewed | clinician-reviewed | publisher-verified`. Không tự chuyển `draft-unreviewed` thành `clinician-reviewed` khi build; luôn giữ nguồn gốc `method` và ghi `reviewer/reviewedAt` nếu được duyệt.

### 3.3 Source / Provenance

~~~json
{
  "id": "nic-8",
  "system": "nic",
  "edition": "8",
  "year": 2024,
  "citation": "NIC, 8th edition",
  "licenseStatus": "review-required",
  "distribution": "metadata-only",
  "verifiedAt": null
}
~~~

Phân biệt `official-label`, `provisional-label`, `editorial-summary`, `licensed-source-text` ở mức dữ liệu, không chỉ trên giao diện.

### 3.4 NOC indicator và NIC activity

- `NocIndicator`: `id = noc:6:<outcomeCode>:indicator:<sourceStableId>`, `outcomeTermId`, `code?`, `order`, `sourceId`, `translationStatus`. Không suy luận ngẫu nhiên một indicator hoặc scale thuộc một outcome nếu chưa đối chiếu nguồn.
- `NicActivity`: `id = nic:8:<interventionCode>:activity:<ordinal>`, `interventionTermId`, `order`, `sourceLanguage`, `sourceId`, `reviewStatus`. Trong quá trình xuất bản, xác nhận số activity và sự căn chỉnh bản dịch; mã thứ tự do pipeline cấp, không dùng nội dung câu làm ID. Giữ bảng mapping nếu source có thay đổi thứ tự giữa các edition.
- **Nội dung toàn văn** chỉ đưa vào Reader nếu giấy phép cho phép. Không đưa vào public catalog.

### 3.5 Clinical link và care plan

~~~text
CatalogTerm (NANDA) ──┐
CatalogTerm (NOC) ────┼──> ReviewedClinicalLink (cần reviewer + evidence + scope)
CatalogTerm (NIC) ────┘

CarePlan ──> CareEntry
CareEntry ──> NandaTermRef
          ├─> NocTermRef ──> NocAssessment[]
          └─> NicTermRef[]
~~~

`ReviewedClinicalLink` phải có `nandaTermId`, `nocTermId`, `nicTermIds`, `sourceId`, `sourceLocation`, `reviewer`, `reviewedAt`, `clinicalScope`, `status`. Repo hiện có mảng liên kết đã duyệt rỗng: **không sinh liên kết lâm sàng tự động từ mã hoặc từ việc xuất hiện cùng một kế hoạch**.

Kế hoạch chăm sóc tham chiếu đến `termId` nhưng vẫn có `labelSnapshot` và `catalogRevision` để hồ sơ cũ có thể đọc đúng sau nâng cấp edition. Khi import sao lưu cũ, adapter chuyển từ `{code,label}` sang `{termId,labelSnapshot}` theo phiên bản tương ứng; nếu không xác định được mã, giữ nội dung cũ và đánh dấu `needs-review`, không âm thầm sửa.

## 4. Luồng dữ liệu chuẩn

~~~mermaid
flowchart TD
  A[Restricted source / tài liệu được cấp phép] --> B[Import + đối chiếu thủ công]
  B --> C[Authoring catalog theo edition]
  D[Bản dịch + trạng thái kiểm duyệt] --> C
  E[Migration + provenance] --> C
  C --> F[Validate / diff / quyền phân phối]
  F --> G[Generated public catalog]
  G --> H[CatalogRepository]
  H --> I[Tìm kiếm / Thư viện / NANDA-NOC-NIC picker]
  H --> J[Care-plan validation]
  K[Licensed NIC Reader bundle riêng] --> L[NicReaderRepository]
  M[CarePlanRepository: lưu an toàn] --> N[Care-plan UI]
  H --> N
~~~

**Chỉ có một cửa đọc catalog là `CatalogRepository` (hoặc `dataHub` làm facade trong giai đoạn đầu).** Các trang không tự import JSON nguồn, không tái dựng bản dịch ở mỗi nơi, không truy vấn NIC 7 như catalog NIC 8 hiện hành.

Giao diện nhận mô hình đã chuẩn hóa: `getTerm(termId)`, `getTerms(system,edition)`, `searchTerms(query,filters)`, `getTermTranslation(termId,locale)`, `getEdition(system)`, `getReviewedLinks(termId)`. Reader riêng: `getNicDetail(termId,lang)`, hiển thị đúng `fallbackLanguage` và `reviewStatus`.

## 5. Ánh xạ từ tệp cũ sang tệp mới

| Hiện tại | Đích đề xuất | Quy tắc |
|---|---|---|
| `shared-data/nnn-catalog.json` | `data/authoring/taxonomies/**/terms.json` + `locales/vi/**` | Tách theo hệ/edition, giữ nguyên code và source label; compiled JSON sinh tự động ở đường dẫn cũ. |
| `shared-data/nic8-translations.json` | `data/authoring/locales/{en,vi}/nic-8-detail.json` hoặc restricted translation store | Join `nic:8:code` + activity id, validate length, giữ trạng thái draft. |
| `shared-data/nic8-licensed-es-source.json` | `data/restricted/nic8-source/` (ngoài public repo) | Kiểm tra quyền, không publish tự động; Reader bundle chỉ khi được phép. |
| `CNNN_English_First_Source_Package/*` | Kho nguồn có quyền truy cập + manifest riêng | Chỉ làm input/audit; **không** là runtime dependencies. |
| `src/data/nicMigration.ts` | `crosswalks/nic7-to-nic8.json` + typed adapter | Giữ alias để đọc plan lịch sử; không dùng tạo can thiệp mới. |
| `src/data/reference.ts` | `scales.json`, `crosswalks/nanda-*.json`, `references/*` | Phân rã dữ liệu theo nghĩa; giữ exports tương thích tạm thời. |
| `src/data/vi/*`, `src/lib/viDictionary.ts` | `locales/vi/*` + translation rules riêng | Dịch đã duyệt ưu tiên trước, rule chỉ là fallback và có cờ. |
| `src/data/nnnExplanations.ts` | `editorial/explanations.json` | Đánh dấu rõ tóm tắt do nhóm biên soạn, không giả là nội dung chuẩn của sách. |
| `src/data/evidence.ts` | `references/sources.json` + `reviewed-links.json` | Không coi clinical linking chưa duyệt là được xác nhận. |
| `src/store/AppContext.tsx` / `src/lib/carePlan.ts` | `domain/care-plan` + `CarePlanRepository` | Tách state UI, nghiệp vụ và lưu trữ; bảo toàn backup v1 + kế hoạch v2. |

## 6. Lộ trình chuyển đổi không phá vỡ ứng dụng

**P0 — Snapshot / kiểm tra an toàn**
- Chốt mã, nhãn, ấn bản và số lượng `277 + 540 + 614 = 1431` trước refactor; snapshot bộ mã/composite keys và backup thử nghiệm (dùng hồ sơ giả, không dùng dữ liệu người bệnh thật).
- Giữ key `clinicalnnn.plans.v2` và định dạng `clinicalnnn-backup`. Đảm bảo data source không lẫn patient data.
- Rà soát quyền phân phối của các gói trích xuất có bản quyền **trước** khi build/deploy/public lại; di chuyển tệp không xóa khỏi lịch sử Git.

**P1 — Schema và compiler**
- Thêm `CatalogTerm`, `TermTranslation`, `SourceProvenance`, schema validator và `build-catalog.ts`.
- Tách authoring data theo hệ + edition. Compiler xuất lại **chính xác** `shared-data/nnn-catalog.json` để ứng dụng chạy như cũ.
- Checksum/snapshot diff trước–sau: code, nhãn gốc, nhãn Việt, edition, domain/class, review status không bị mất.

**P2 — Repository + ứng dụng**
- Chuyển `src/data/dataHub.ts`, `taxonomy.ts`, `src/lib/search.ts`, `src/lib/translate.ts` sang API chung.
- Đổi Library, Home, Term Picker và Plan Editor theo từng phân hệ; không sửa đồng loạt.
- NIC 8 Reader nạp dữ liệu riêng theo nhu cầu; không import raw licensed bundle vào trang chủ.

**P3 — Domain care plan + persistence**
- Tách `CarePlanRepository`, model, backup parser, migration; giữ hỗ trợ nhập backup cũ.
- Version `catalogRevision` trong plan và rõ `labelSnapshot`.
- Với dữ liệu người bệnh thật: cần thiết kế xác thực, phân quyền, mã hóa, kiểm toán truy cập và chính sách lưu trữ phù hợp trước khi triển khai nhiều người dùng; localStorage hiện tại không đủ làm kho hồ sơ bệnh án chính thức.

**P4 — Dọn và kiểm thử hồi quy**
- Sau khi tất cả consumers đã đổi sang API chung và pass tests, mới xóa import/tệp cũ không dùng.
- Thêm regression test cho search NANDA/NOC/NIC, từng edition, dịch/fallback, scale NOC, NIC 7 legacy, Reader, validation kế hoạch và round-trip backup.

## 7. Tiêu chí nghiệm thu

- Giữ nguyên **277 NANDA, 540 NOC, 614 NIC** và edition tương ứng; mọi code string giữ nguyên số 0 đầu.
- Không có ID lặp `system:edition:code`; mọi `domainId/classId/sourceId` trỏ đến record hợp lệ hoặc được ghi chú là `unclassified`.
- Bản dịch không tự đổi trạng thái kiểm duyệt; NIC8 English provisional vẫn rõ ràng.
- Không mất nội dung khi import/export các kế hoạch và file backup cũ.
- NOC indicator/scale không tự suy đoán khi thiếu bằng chứng. NIC7 alias không được xuất hiện như NIC8 active.
- Không đưa văn bản sách có giấy phép hoặc thông tin bệnh nhân vào public build nếu chưa được phép; CI có kiểm tra phân phối.
- Chạy các lệnh sẵn có: `npm run typecheck`, `npm run build`, `npm run check:shared-data`, `npm run check:editions`, `npm run check:care-plan`, `npm run check:nic8-reader`, `npm run check:search`; sau refactor phải thêm test cho schema/compiler.
- Trước khi merge: chụp snapshot đầu ra catalog và so sánh với `main`. Chỉ thay đổi có chủ đích mới được chấp nhận.

## 8. Quyết định cần tuân thủ

1. **Không tạo danh mục NANDA/NOC/NIC thứ hai trong UI**: compiled catalog chỉ đọc, tất cả phân hệ truy cập chung.
2. **Không trộn nguồn hiện hành với nguồn lịch sử**: `nic:7` chỉ migration; `nic:8` là catalog active; NOC 6 không tự thay bằng NOC 7.
3. **Không coi dịch tự động là bản dịch xác nhận**: mọi nhãn có provenance/review status.
4. **Không đưa nội dung sách nguyên văn vào tệp phân phối công khai khi chưa có quyền**.
5. **Không trộn dữ liệu patient/plan vào taxonomy**; một lớp repository riêng chịu trách nhiệm persistence và migration.

---

### Phạm vi bản thay đổi thiết kế này

Tài liệu này là bản thiết kế triển khai trên nhánh riêng, **không di chuyển tệp, không sửa dữ liệu, không đổi hành vi ứng dụng trên `main`**. Việc refactor nên được triển khai thành các PR nhỏ theo P0–P4, có test/snapshot cho từng bước.
