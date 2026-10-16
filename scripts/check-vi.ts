/** Kiểm tra độ phủ nhãn Việt. Tỷ lệ có nhãn KHÔNG phải tỷ lệ được thẩm định. */
import { strict as assert } from 'node:assert';
import { NANDA_ITEMS, NOC_ITEMS, NIC_ITEMS } from '../src/data/taxonomy';
import { SHARED_CATALOG, TRANSLATION_REVIEW } from '../src/data/sharedCatalog';
import { translateVi } from '../src/lib/translate';

for (const item of SHARED_CATALOG.entries) {
  assert.ok(item.labelVi.trim(), 'Missing Vietnamese label: ' + item.system + ':' + item.code);
  assert.equal(translateVi(item.code, item.label).text, item.labelVi, 'Translation mismatch: ' + item.code);
}
assert.equal(NANDA_ITEMS.length, 277);
assert.equal(NOC_ITEMS.length, 540);
assert.equal(NIC_ITEMS.length, 614);
console.log('Đủ nhãn Việt cho 1431 mã; trạng thái chưa duyệt ghi trong dữ liệu trích xuất ban đầu:', TRANSLATION_REVIEW.draft);
console.log('Số nhãn có nguồn dịch theo quy tắc:', TRANSLATION_REVIEW.automatic,
  '· Phân lớp chưa đối chiếu:', TRANSLATION_REVIEW.missingClass);
