import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Copy, Languages, ListOrdered } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { copyText, cx } from '../lib/utils';
import { Alert, Badge, Button, Card, CodeBadge, EmptyState, Eyebrow, PageHeader, SearchInput, Select, Stat, TextLink } from '../ui';
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
        <Eyebrow>{language === 'en' ? 'Definition' : language === 'vi' ? 'Định nghĩa' : 'Definición'}</Eyebrow>
        <p lang={text.fallback ? 'es' : language} className="whitespace-pre-wrap text-[15px] leading-relaxed text-fg">
          {text.definition}
        </p>
      </div>
      <div>
        <Eyebrow className="mb-3 flex items-center gap-2">
          <ListOrdered className="h-4 w-4" />
          {language === 'en' ? 'Nursing activities' : language === 'vi' ? 'Hoạt động điều dưỡng' : 'Actividades'}
          <Badge className="tabular-nums">{text.activities.length}</Badge>
        </Eyebrow>
        {text.activities.length === 0 ? (
          <p className="text-sm text-fg-muted">Không có hoạt động nào trong tệp nguồn.</p>
        ) : (
          <ol lang={text.fallback ? 'es' : language} className="space-y-2.5">
            {text.activities.map((activity, i) => (
              <li key={i} className="flex items-start gap-3 border-b border-line-soft pb-2.5 text-sm leading-relaxed last:border-0">
                <span className="mt-0.5 w-7 shrink-0 text-right text-xs tabular-nums text-fg-subtle">{i + 1}.</span>
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
      <PageHeader title="NIC 8 · Chi tiết can thiệp"
        subtitle="Đọc toàn bộ 614 định nghĩa và 16.051 hoạt động đã trích xuất từ NIC 8, có liên kết đến mã can thiệp và nguồn EPUB."
        breadcrumb={<a href="#/library" className="text-xs font-medium text-fg-muted hover:text-fg">← Thư viện</a>} />
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <Stat label="Mã can thiệp" value={NIC8_SOURCE.length} />
        <Stat label="Hoạt động nguồn" value={NIC8_TOTAL_ACTIVITIES.toLocaleString('vi-VN')} />
        <Stat label="Đã dịch đầy đủ (định nghĩa + hoạt động)" value={`VI ${COVERAGE.vi} · EN ${COVERAGE.en}`} hint={`trên ${NIC8_SOURCE.length} can thiệp`} />
      </div>
      <Alert tone="warning" className="mb-5">
        Văn bản tiếng Tây Ban Nha là nguồn gốc đã trích xuất. Nhãn tiếng Anh hiện là bản dự thảo;
        những định nghĩa/hoạt động chưa dịch sẽ hiển thị tiếng Tây Ban Nha cùng cảnh báo rõ ràng.
        Nội dung hỗ trợ tra cứu, không thay thế thẩm định lâm sàng.
      </Alert>
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(15rem,0.8fr)_minmax(0,1.8fr)]">
        <Card className="overflow-hidden lg:sticky lg:top-20">
          <div className="border-b border-line-soft p-4">
            <label htmlFor="nic8-search" className="mb-2 block text-sm font-medium text-fg">Tìm can thiệp và hoạt động</label>
            <SearchInput id="nic8-search" value={textQuery} onChange={v => { setTextQuery(v); setLimit(80); }}
              placeholder="Mã, Anh, Việt hoặc nội dung Tây Ban Nha" />
            <p className="mt-2 text-xs text-fg-muted">Hiển thị tối đa {results.length} kết quả; tìm trong cả nội dung hoạt động.</p>
          </div>
          <nav aria-label="Danh mục can thiệp NIC 8" className="max-h-[65vh] overflow-y-auto">
            {results.length ? results.map(item => {
              const active = selectedCode === item.code;
              const title = nic8Titles(item);
              return (
                <button key={item.code} type="button" onClick={() => open(item.code)}
                  aria-current={active ? 'true' : undefined}
                  className={cx('flex w-full gap-3 border-b border-l-2 border-b-line-soft p-3 text-left transition',
                    active ? 'border-l-primary-600 bg-primary-50 dark:bg-primary-500/10' : 'border-l-transparent hover:bg-surface-muted')}>
                  <CodeBadge system="nic" code={item.code} className="mt-0.5 h-fit" />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-fg">{title.vi}</span>
                    <span className="mt-0.5 block text-xs text-fg-muted">{title.en}</span>
                  </span>
                </button>
              );
            }) : <p className="p-5 text-sm text-fg-muted">Không tìm thấy mã hoặc nội dung phù hợp.</p>}
            {results.length === limit && limit < NIC8_SOURCE.length && (
              <div className="p-3 text-center">
                <TextLink onClick={() => setLimit(n => Math.min(n + 80, NIC8_SOURCE.length))}>Xem thêm kết quả</TextLink>
              </div>
            )}
          </nav>
        </Card>
        <Card className="min-w-0 p-4 sm:p-6">
          {selected && titles ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CodeBadge system="nic" code={`NIC ${selected.code}`} className="px-2.5 py-1 text-sm" />
                <Button size="sm" icon={<Copy className="h-4 w-4" />} onClick={copyLink}>Sao chép liên kết</Button>
              </div>
              <h2 className="mt-3 text-xl font-semibold text-fg">{titles.vi}</h2>
              <p className="mt-1 text-sm text-fg-muted">{titles.en}</p>
              <p lang="es" className="mt-1 text-xs italic text-fg-muted">{titles.es}</p>
              <div className="mt-5 flex items-center gap-2 border-b border-line pb-4">
                <Languages className="h-5 w-5 shrink-0 text-fg-subtle" />
                <label htmlFor="nic8-lang" className="sr-only">Ngôn ngữ đọc</label>
                <Select id="nic8-lang" value={language} onChange={e => setLanguage(e.target.value as ReaderLanguage)} className="min-w-0 flex-1">
                  {LANGUAGES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </Select>
              </div>
              <div className={cx('mt-5 gap-7', language === 'both' ? 'grid xl:grid-cols-2' : 'block')}>
                {language === 'both'
                  ? <><TextSection item={selected} language="en" /><TextSection item={selected} language="vi" /></>
                  : <TextSection item={selected} language={language} />}
              </div>
              <div className="mt-6 border-t border-line pt-4 text-xs text-fg-muted">
                <TextLink onClick={() => setShowSource(s => !s)} className="inline-flex items-center gap-2 text-xs">
                  <BookOpen className="h-4 w-4" /> {showSource ? 'Ẩn thông tin nguồn' : 'Xem thông tin nguồn'}
                </TextLink>
                {showSource && <dl className="mt-2 space-y-1 break-all">
                  <div><dt className="inline font-semibold">Ấn bản: </dt><dd className="inline">NIC {selected.source.edition}</dd></div>
                  <div><dt className="inline font-semibold">Tệp: </dt><dd className="inline">{selected.source.file}</dd></div>
                  <div><dt className="inline font-semibold">Vị trí EPUB: </dt><dd className="inline">{selected.source.epubPath}</dd></div>
                  <div><dt className="inline font-semibold">Trạng thái dịch: </dt><dd className="inline">{selected.translationStatus}</dd></div>
                </dl>}
              </div>
            </>
          ) : <EmptyState icon={<BookOpen className="h-5 w-5" />} title="Chọn một can thiệp trong danh mục." />}
        </Card>
      </div>
    </>
  );
}
