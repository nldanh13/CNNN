import { SHARED_CATALOG, TRANSLATION_REVIEW } from '../src/data/sharedCatalog';

const suspicious = /\b(?:risk for|readiness for|management|assessment|patient care|wound healing|self-management|family functioning|community health|blood pressure|nursing|therapy|status|abilities|cardiac|medication)\b/i;
const mixed = SHARED_CATALOG.entries.filter(entry => suspicious.test(entry.labelVi));
const unchanged = SHARED_CATALOG.entries.filter(entry =>
  entry.label.toLowerCase() === entry.labelVi.toLowerCase() && /[A-Za-z]{4}/.test(entry.label));
const missingClass = SHARED_CATALOG.entries.filter(entry =>
  entry.system !== 'nic' && (entry.domainId?.includes('Unclassified') || entry.classKey?.includes('Unclassified')));
console.log('Số thuật ngữ:', TRANSLATION_REVIEW.total);
console.log('Trạng thái chưa duyệt lưu trong dữ liệu nguồn:', TRANSLATION_REVIEW.draft);
console.log('Nguồn dịch theo quy tắc:', TRANSLATION_REVIEW.automatic);
console.log('Cụm tiếng Anh cần rà soát:', mixed.length);
console.log('Giống nhãn nguồn:', unchanged.length);
console.log('Chưa gán phân lớp trong dữ liệu hiện có:', missingClass.length);
for (const row of mixed.slice(0, 30))
  console.log(row.system.toUpperCase(), row.code, row.labelVi);
if (process.argv.includes('--strict') && (mixed.length || unchanged.length || missingClass.length || TRANSLATION_REVIEW.draft))
  process.exitCode = 1;
