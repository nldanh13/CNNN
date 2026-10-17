import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Copy, Languages, ListOrdered } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { copyText, cx } from '../lib/utils';
import { Alert, Card, PageHeader, SearchInput } from '../ui';
import { NIC8_SOURCE, NIC8_TOTAL_ACTIVITIES, findNic8, nic8Text, nic8Titles, translationCoverage, type Nic8SourceEntry, type ReaderLanguage } from '../data/nic8Reader';

const LANGUAGES: { value: ReaderLanguage; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'vi', label: 'Tiếng Việt' },
  { value: 'both', label: 'Song ngữ Anh – Việt' },
  { value: 'es', label: 'Español (gốc)' },
];
const COVERAGE = translationCoverage();

function TextSection({ item, language }: { item: Nic8SourceEntry; language: 'en' | 'vi' | 'es' }) {
  const text = nic8Text(item, language);
  const name = language === 'en' ? 'English' : language === 'vi' ? 'Tiếng Việt' : 'Español';
  return (
    <section aria-label={'Nội dung ' + name} className="min-w-0 space-y-5">
      {text.fallback && (
        <Alert role="status" tone="warning">
          Chưa có bản dịch {name} đầy đủ đã căn chỉnh. Đang hiển thị nguyên văn tiếng Tây Ban Nha,
          không phải bản dịch {name}. Vui lòng đối chiếu tài liệu gốc khi sử dụng.
        </Alert>
      )}
      <div>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-fg-muted">
          {language === 'en' ? 'Definition' : language === 'vi' ? 'Định nghĩa' : 'Definición'}
        </h3>
        <p lang={text.fallback ? 'es' : language} className="whitespace-pre-wrap text-[15px] leading-relaxed text-ink-800 dark:text-ink-100">
          {text.definition}
        </p>
      </div>
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-fg-muted">
          <ListOrdered className="h-4 w-4" />
          {language === 'en' ? 'Nursing activities' : language === 'vi' ? 'Hoạt động điều dưỡng' : 'Actividades'}
          <span className="rounded-full bg-ink-100 px-2 py-0.5 text-xs tabular-nums dark:bg-ink-800">{text.activities.length}</span>
        </h3>
        {text.activities.length === 0 ? (
          <p className="text-sm text-ink-500">Không có hoạt động nào trong tệp nguồn.</p>
        ) : (
          <ol lang={text.fallback ? 'es' : language} className="space-y-2.5">
            {text.activities.map((activity, i) => (
              <li key={i} className="flex items-start gap-3 border-b border-ink-100 pb-2.5 text-sm leading-relaxed last:border-0 dark:border-ink-800">
                <span className="mt-0.5 w-7 shrink-0 text-right text-xs tabular-nums text-ink-400">{i + 1}.</span>
                <span className="whitespace-pre-wrap">{activity}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}

export function NicReaderPage({ query }: { query: URLSearchParams }) {
  const { toast } = useApp();
  const [textQuery, setTextQuery] = useState(query.get('q') ?? '');
  const [selectedCode, setSelectedCode] = useState(query.get('code') ?? NIC8_SOURCE[0]?.code ?? '');
  const [language, setLanguage] = useState<ReaderLanguage>('both');
  const [showSource, setShowSource] = useState(false);
  const [limit, setLimit] = useState(80);

  useEffect(() => {
    if (query.get('code')) setSelectedCode(query.get('code')!);
    if (query.get('q') !== null) setTextQuery(query.get('q')!);
  }, [query]);
  const results = useMemo(() => findNic8(textQuery, limit), [textQuery, limit]);
  const selected = useMemo(
    () => NIC8_SOURCE.find(item => item.code === selectedCode) ?? null,
    [selectedCode],
  );
  const titles = selected ? nic8Titles(selected) : null;
  const open = (code: string) => {
    setSelectedCode(code);
    window.history.replaceState(null, '', '#/nic-reader?code=' + encodeURIComponent(code));
  };
  const copyLink = async () => {
    if (!selected) return;
    const url = window.location.href.split('#')[0] + '#/nic-reader?code=' + encodeURIComponent(selected.code);
    toast(await copyText(url) ? 'Đã sao chép liên kết đến can thiệp.' : 'Không sao chép được liên kết.', 'info');
  };

  return (
    <>
      <PageHeader title="NIC 8 · Chi tiết can thiệp trong danh mục chung"
        subtitle="Đọc toàn bộ 614 định nghĩa và 16.051 hoạt động đã trích xuất từ NIC 8, có liên kết đến mã can thiệp và nguồn EPUB." />
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <Card className="px-4 py-3"><p className="text-xs text-ink-500">Mã can thiệp</p>
          <p className="text-2xl font-semibold tabular-nums">{NIC8_SOURCE.length}</p></Card>
        <Card className="px-4 py-3"><p className="text-xs text-ink-500">Hoạt động nguồn</p>
          <p className="text-2xl font-semibold tabular-nums">{NIC8_TOTAL_ACTIVITIES.toLocaleString('vi-VN')}</p></Card>
        <Card className="px-4 py-3"><p className="text-xs text-ink-500">Định nghĩa + hoạt động đã có bản dịch đầy đủ</p>
          <p className="text-sm font-semibold">EN {COVERAGE.en}/{NIC8_SOURCE.length} · VI {COVERAGE.vi}/{NIC8_SOURCE.length}</p></Card>
      </div>
      <Alert tone="warning" className="mb-5">
        Văn bản tiếng Tây Ban Nha là nguồn gốc đã trích xuất. Nhãn tiếng Anh hiện là bản dự thảo;
        những định nghĩa/hoạt động chưa dịch sẽ hiển thị tiếng Tây Ban Nha cùng cảnh báo rõ ràng.
        Nội dung hỗ trợ tra cứu, không thay thế thẩm định lâm sàng.
      </Alert>
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(15rem,0.8fr)_minmax(0,1.8fr)]">
        <Card className="overflow-hidden lg:sticky lg:top-20">
          <div className="border-b border-ink-100 p-4 dark:border-ink-800">
            <label htmlFor="nic8-search" className="mb-2 block text-sm font-medium">Tìm can thiệp và hoạt động</label>
            <SearchInput id="nic8-search" value={textQuery} onChange={v => { setTextQuery(v); setLimit(80); }}
              placeholder="Mã, Anh, Việt hoặc nội dung Tây Ban Nha" />
            <p className="mt-2 text-xs text-ink-500">Hiển thị tối đa {results.length} kết quả; tìm trong cả nội dung hoạt động.</p>
          </div>
          <nav aria-label="Danh mục can thiệp NIC 8" className="max-h-[65vh] overflow-y-auto">
            {results.length ? results.map(item => {
              const active = selectedCode === item.code;
              const title = nic8Titles(item);
              return (
                <button key={item.code} type="button" onClick={() => open(item.code)}
                  aria-current={active ? 'true' : undefined}
                  className={cx('flex w-full gap-3 border-b border-ink-100 p-3 text-left transition dark:border-ink-800',
                    active ? 'bg-primary-50 dark:bg-primary-900/20' : 'hover:bg-ink-50 dark:hover:bg-ink-800/50')}>
                  <span className="mt-0.5 rounded bg-success-50 px-2 py-1 font-mono text-xs font-semibold text-success-700 dark:bg-success-950 dark:text-success-300">{item.code}</span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-fg">{title.vi}</span>
                    <span className="mt-0.5 block text-xs text-ink-500">{title.en}</span>
                  </span>
                </button>
              );
            }) : <p className="p-5 text-sm text-ink-500">Không tìm thấy mã hoặc nội dung phù hợp.</p>}
            {results.length === limit && limit < NIC8_SOURCE.length && (
              <button type="button" onClick={() => setLimit(n => Math.min(n + 80, NIC8_SOURCE.length))}
                className="w-full p-3 text-sm font-medium text-primary-700 hover:bg-ink-50 dark:text-primary-300 dark:hover:bg-ink-800">
                Xem thêm kết quả
              </button>
            )}
          </nav>
        </Card>
        <Card className="min-w-0 p-4 sm:p-6">
          {selected && titles ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="rounded bg-success-100 px-2.5 py-1 font-mono text-sm font-semibold text-success-800 dark:bg-success-950 dark:text-success-300">NIC {selected.code}</span>
                <button type="button" onClick={copyLink} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium hover:bg-ink-50 dark:border-ink-700 dark:hover:bg-ink-800">
                  <Copy className="h-4 w-4" /> Sao chép liên kết
                </button>
              </div>
              <h2 className="mt-3 text-xl font-semibold text-fg">{titles.vi}</h2>
              <p className="mt-1 text-sm text-ink-600 dark:text-ink-400">{titles.en}</p>
              <p lang="es" className="mt-1 text-xs italic text-ink-500">{titles.es}</p>
              <div className="mt-5 flex items-center gap-2 border-b border-ink-200 pb-4 dark:border-ink-700">
                <Languages className="h-5 w-5 shrink-0 text-ink-400" />
                <label htmlFor="nic8-lang" className="sr-only">Ngôn ngữ đọc</label>
                <select id="nic8-lang" value={language} onChange={e => setLanguage(e.target.value as ReaderLanguage)}
                  className="min-w-0 flex-1 rounded-lg border border-ink-300 bg-surface px-3 py-2 text-sm dark:border-ink-700">
                  {LANGUAGES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div className={cx('mt-5 gap-7', language === 'both' ? 'grid xl:grid-cols-2' : 'block')}>
                {language === 'both'
                  ? <><TextSection item={selected} language="en" /><TextSection item={selected} language="vi" /></>
                  : <TextSection item={selected} language={language} />}
              </div>
              <div className="mt-6 border-t border-line pt-4 text-xs text-ink-500">
                <button type="button" onClick={() => setShowSource(s => !s)}
                  className="inline-flex items-center gap-2 font-medium text-primary-700 dark:text-primary-300">
                  <BookOpen className="h-4 w-4" /> {showSource ? 'Ẩn thông tin nguồn' : 'Xem thông tin nguồn'}
                </button>
                {showSource && <dl className="mt-2 space-y-1 break-all">
                  <div><dt className="inline font-semibold">Ấn bản: </dt><dd className="inline">NIC {selected.source.edition}</dd></div>
                  <div><dt className="inline font-semibold">Tệp: </dt><dd className="inline">{selected.source.file}</dd></div>
                  <div><dt className="inline font-semibold">Vị trí EPUB: </dt><dd className="inline">{selected.source.epubPath}</dd></div>
                  <div><dt className="inline font-semibold">Trạng thái dịch: </dt><dd className="inline">{selected.translationStatus}</dd></div>
                </dl>}
              </div>
            </>
          ) : <div className="py-16 text-center text-ink-500">Chọn một can thiệp trong danh mục.</div>}
        </Card>
      </div>
    </>
  );
}
