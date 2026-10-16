/** Xuất các mã NIC8 chưa có bản dịch Anh–Việt để dịch theo từng đợt nhỏ. */
import { readFileSync, writeFileSync } from 'node:fs';

interface OriginRow { code: string; titleEs: string; definitionEs: string; activitiesEs: string[] }
interface CatalogRow { system: string; code: string; label: string; labelVi: string }
const source = JSON.parse(readFileSync('shared-data/nic8-licensed-es-source.json', 'utf8')) as {entries: OriginRow[]};
const existing = JSON.parse(readFileSync('shared-data/nic8-translations.json', 'utf8')) as { entries: {code: string}[] };
const catalog = JSON.parse(readFileSync('shared-data/nnn-catalog.json', 'utf8')) as { entries: CatalogRow[] };
const completed = new Set(existing.entries.map(row => row.code));
const labels = new Map(catalog.entries.filter(row => row.system === 'nic').map(row => [row.code, row]));
const get = (name: string, fallback: number) => {
  const option = process.argv.find(a => a.startsWith('--' + name + '='));
  return option ? Number(option.split('=')[1]) : fallback;
};
const offset = get('offset',0);
const size = get('size',5);
if (!Number.isInteger(offset) || offset < 0 || !Number.isInteger(size) || size < 1 || size > 20) {
  throw new Error('Sử dụng --offset=0 --size=5 (1–20 mục/đợt).');
}
const pending = source.entries.filter(row => !completed.has(row.code));
const selected = pending.slice(offset, offset + size).map(row => ({
  code: row.code,
  titleEs: row.titleEs,
  provisionalTitleEn: labels.get(row.code)?.label ?? '',
  provisionalTitleVi: labels.get(row.code)?.labelVi ?? '',
  definitionEs: row.definitionEs,
  activitiesEs: row.activitiesEs,
  expectedActivities: row.activitiesEs.length,
}));
const batch = {
  schema: 'clinicalnnn.nic8-translation-worklist/v1',
  instructions: 'Translate Spanish source to English first; translate the English into Vietnamese. Preserve codes, array length and activity ordering. Flag unreviewed clinical translations.',
  pendingTotal: pending.length, offset, size: selected.length, entries: selected,
};
const output = process.argv.find(a => a.startsWith('--output='))?.slice('--output='.length);
if (output) { writeFileSync(output, JSON.stringify(batch,null,2) + '\n'); console.log('Đã xuất '+selected.length+' mã chưa dịch ra '+output); }
else console.log(JSON.stringify(batch, null, 2));
