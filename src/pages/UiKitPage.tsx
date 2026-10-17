import { useState } from 'react';
import { BookOpen, ClipboardList, Palette, Plus, Printer, Search, Sparkles, Trash2 } from 'lucide-react';
import {
  Alert, Badge, Button, Card, CardBody, CardHeader, Chip, CodeBadge, DescriptionList, Disclosure, EmptyState, Eyebrow, Field, IconButton, Input, Kbd,
  LinkButton, Modal, ModalFooter, ModalHeader, PageHeader, ProgressBar, SearchInput, Segmented, Select, SectionTitle, SettingRow, Stat, Steps, SYSTEM_DOT,
  Table, TagInput, TBody, Td, Textarea, TextLink, Th, THead, Tr, type Tone,
} from '../ui';
import { cx } from '../lib/utils';

const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
const PALETTES = [
  ['primary', 'Chủ đạo', 'Nút chính, mục đang chọn, liên kết'],
  ['accent', 'Điểm nhấn', 'Vàng đồng: biểu trưng, nhãn nhỏ, mục đang chọn'],
  ['ink', 'Trung tính', 'Chữ, viền, nền phụ'],
  ['info', 'Thông tin', 'Ghi chú, gợi ý'],
  ['success', 'Thành công', 'Đạt mục tiêu, hoàn tất'],
  ['warning', 'Lưu ý', 'Cần thẩm định, chưa đầy đủ'],
  ['danger', 'Nguy hiểm', 'Xóa, lỗi, ưu tiên cao'],
  ['nanda', 'NANDA-I', 'Chẩn đoán điều dưỡng'],
  ['noc', 'NOC', 'Kết quả mong đợi'],
  ['nic', 'NIC', 'Can thiệp điều dưỡng'],
] as const;
const TONES: Tone[] = ['neutral', 'primary', 'info', 'success', 'warning', 'danger'];

/** Các ô màu phải là chuỗi đầy đủ để Tailwind sinh ra lớp CSS. */
const SWATCH: Record<string, string[]> = {
  primary: ['bg-primary-50', 'bg-primary-100', 'bg-primary-200', 'bg-primary-300', 'bg-primary-400', 'bg-primary-500', 'bg-primary-600', 'bg-primary-700', 'bg-primary-800', 'bg-primary-900', 'bg-primary-950'],
  accent: ['bg-accent-50', 'bg-accent-100', 'bg-accent-200', 'bg-accent-300', 'bg-accent-400', 'bg-accent-500', 'bg-accent-600', 'bg-accent-700', 'bg-accent-800', 'bg-accent-900', 'bg-accent-950'],
  ink: ['bg-ink-50', 'bg-ink-100', 'bg-ink-200', 'bg-ink-300', 'bg-ink-400', 'bg-ink-500', 'bg-ink-600', 'bg-ink-700', 'bg-ink-800', 'bg-ink-900', 'bg-ink-950'],
  info: ['bg-info-50', 'bg-info-100', 'bg-info-200', 'bg-info-300', 'bg-info-400', 'bg-info-500', 'bg-info-600', 'bg-info-700', 'bg-info-800', 'bg-info-900', 'bg-info-950'],
  success: ['bg-success-50', 'bg-success-100', 'bg-success-200', 'bg-success-300', 'bg-success-400', 'bg-success-500', 'bg-success-600', 'bg-success-700', 'bg-success-800', 'bg-success-900', 'bg-success-950'],
  warning: ['bg-warning-50', 'bg-warning-100', 'bg-warning-200', 'bg-warning-300', 'bg-warning-400', 'bg-warning-500', 'bg-warning-600', 'bg-warning-700', 'bg-warning-800', 'bg-warning-900', 'bg-warning-950'],
  danger: ['bg-danger-50', 'bg-danger-100', 'bg-danger-200', 'bg-danger-300', 'bg-danger-400', 'bg-danger-500', 'bg-danger-600', 'bg-danger-700', 'bg-danger-800', 'bg-danger-900', 'bg-danger-950'],
  nanda: ['bg-nanda-50', 'bg-nanda-100', 'bg-nanda-200', 'bg-nanda-300', 'bg-nanda-400', 'bg-nanda-500', 'bg-nanda-600', 'bg-nanda-700', 'bg-nanda-800', 'bg-nanda-900', 'bg-nanda-950'],
  noc: ['bg-noc-50', 'bg-noc-100', 'bg-noc-200', 'bg-noc-300', 'bg-noc-400', 'bg-noc-500', 'bg-noc-600', 'bg-noc-700', 'bg-noc-800', 'bg-noc-900', 'bg-noc-950'],
  nic: ['bg-nic-50', 'bg-nic-100', 'bg-nic-200', 'bg-nic-300', 'bg-nic-400', 'bg-nic-500', 'bg-nic-600', 'bg-nic-700', 'bg-nic-800', 'bg-nic-900', 'bg-nic-950'],
};

function Demo({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-fg-subtle">{title}</p>
      {children}
    </div>
  );
}

/** Trang xem mẫu kho giao diện: mọi màu và thành phần dùng chung ở một chỗ. */
export function UiKitPage() {
  const [q, setQ] = useState('');
  const [seg, setSeg] = useState<'a' | 'b' | 'c'>('a');
  const [tags, setTags] = useState(['Khó thở', 'SpO₂ 90%']);
  const [chips, setChips] = useState<string[]>(['Ho yếu']);
  const [modal, setModal] = useState(false);
  return (
    <>
      <PageHeader
        icon={<Palette className="h-6 w-6" />}
        title="Kho giao diện"
        subtitle="Bảng màu, kiểu chữ và thành phần dùng chung cho mọi trang. Muốn đổi giao diện toàn ứng dụng thì đổi ở đây (src/ui), không sửa từng trang."
        breadcrumb={<a href="#/settings" className="text-xs font-medium text-fg-muted hover:text-fg">← Cài đặt</a>}
      />

      <div className="space-y-8">
        <section>
          <SectionTitle>Màu sắc</SectionTitle>
          <Card>
            <CardBody className="space-y-3">
              {PALETTES.map(([key, name, use]) => (
                <div key={key} className="grid items-center gap-2 sm:grid-cols-[11rem_1fr]">
                  <div>
                    <p className="text-sm font-semibold text-fg">{name}</p>
                    <p className="text-xs text-fg-muted">{use}</p>
                  </div>
                  <div className="grid grid-cols-11 overflow-hidden rounded-control border border-line">
                    {SWATCH[key].map((c, i) => (
                      <div key={c} title={`${key}-${STEPS[i]}`} className={cx('h-9', c)} />
                    ))}
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        </section>

        <section>
          <SectionTitle>Chữ</SectionTitle>
          <Card>
            <CardBody className="space-y-2">
              <p className="text-[2rem] font-bold leading-tight tracking-[-0.02em] text-fg">Tiêu đề trang · Be Vietnam Pro 32px</p>
              <p className="text-lg font-semibold text-fg">Tiêu đề nhóm · Be Vietnam Pro 18px</p>
              <p className="text-[15px] font-semibold text-fg">Tiêu đề thẻ · 15px</p>
              <p className="text-sm text-fg-body">Nội dung · 14px. Người bệnh 75 tuổi, ho yếu, đờm đặc khó khạc.</p>
              <p className="text-xs text-fg-muted">Chú thích · 12px, màu phụ</p>
              <p className="font-mono text-xs font-semibold text-fg">00031 · 0410 · 3140 (mã, chữ đơn cách)</p>
            </CardBody>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader icon={<Plus className="h-4 w-4" />} title="Nút" subtitle="Một nút chính cho mỗi vùng; các thao tác khác dùng nút phụ." />
            <CardBody className="space-y-4">
              <Demo title="Kiểu">
                <div className="flex flex-wrap gap-2">
                  <Button variant="primary" icon={<Plus className="h-4 w-4" />}>Thêm người bệnh</Button>
                  <Button icon={<Printer className="h-4 w-4" />}>In</Button>
                  <Button variant="ghost">Bỏ qua</Button>
                  <Button variant="danger" icon={<Trash2 className="h-4 w-4" />}>Xóa</Button>
                </div>
              </Demo>
              <Demo title="Cỡ">
                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm">Nhỏ</Button>
                  <Button>Vừa</Button>
                  <Button size="lg" variant="primary">Lớn</Button>
                  <LinkButton href="#/library" variant="secondary" icon={<BookOpen className="h-4 w-4" />}>Liên kết dạng nút</LinkButton>
                  <IconButton label="Xóa" tone="danger"><Trash2 className="h-4 w-4" /></IconButton>
                </div>
              </Demo>
            </CardBody>
          </Card>

          <Card>
            <CardHeader icon={<Search className="h-4 w-4" />} title="Ô nhập" subtitle="Mọi ô nhập cao 40px, viền và tiêu điểm giống nhau." />
            <CardBody className="space-y-3">
              <SearchInput value={q} onChange={setQ} placeholder="Tìm mã hoặc tên chẩn đoán…" />
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Họ và tên"><Input placeholder="Nguyễn Văn A" /></Field>
                <Field label="Khoa"><Select><option>Nội tổng hợp</option><option>Ngoại</option></Select></Field>
              </div>
              <Field label="Ghi chú" hint="Không nhập thông tin định danh người bệnh."><Textarea rows={2} /></Field>
              <Segmented value={seg} onChange={setSeg} options={[{ value: 'a', label: 'NANDA-I' }, { value: 'b', label: 'NOC' }, { value: 'c', label: 'NIC' }]} />
              <TagInput values={tags} onChange={setTags} placeholder="Thêm dấu hiệu rồi nhấn Enter" />
            </CardBody>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader title="Thông báo" subtitle="Dùng Alert cho mọi hộp lưu ý; không tự tô màu khung." />
            <CardBody className="space-y-2">
              <Alert tone="info">Kế hoạch chỉ lưu trên trình duyệt của máy này.</Alert>
              <Alert tone="success">Đã sao lưu 3 kế hoạch.</Alert>
              <Alert tone="warning">Nhãn tiếng Việt cần chuyên gia thẩm định.</Alert>
              <Alert tone="danger" title="Không lưu được">Bộ nhớ trình duyệt đang bị chặn.</Alert>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Nhãn, mã và tiến độ" />
            <CardBody className="space-y-4">
              <Demo title="Nhãn trạng thái">
                <div className="flex flex-wrap gap-1.5">{TONES.map((tone) => <Badge key={tone} tone={tone}>{tone}</Badge>)}</div>
              </Demo>
              <Demo title="Mã phân loại">
                <div className="flex flex-wrap items-center gap-2">
                  <CodeBadge system="nanda" code="00031" />
                  <CodeBadge system="noc" code="0410" />
                  <CodeBadge system="nic" code="3140" />
                  {(['nanda', 'noc', 'nic'] as const).map((s) => <span key={s} className={cx('h-2.5 w-2.5 rounded-full', SYSTEM_DOT[s])} />)}
                </div>
              </Demo>
              <Demo title="Tiến độ">
                <div className="space-y-2">
                  <ProgressBar value={0.75} />
                  <ProgressBar value={0.45} tone="warning" />
                  <ProgressBar value={0.2} tone="danger" />
                </div>
              </Demo>
              <Demo title="Phím tắt"><Kbd>Ctrl</Kbd> <Kbd>K</Kbd></Demo>
            </CardBody>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader title="Bảng dữ liệu" subtitle="Table, THead, Th, TBody, Tr, Td" />
            <Table>
              <THead><Th>Người bệnh</Th><Th>Khoa</Th><Th>Đạt mục tiêu</Th></THead>
              <TBody>
                {[['Nguyễn Văn A', 'Nội', 0.5], ['Trần Thị B', 'Ngoại', 1]].map(([n, k, v]) => (
                  <Tr key={n as string} interactive>
                    <Td className="font-medium text-fg">{n}</Td>
                    <Td className="text-fg-muted">{k}</Td>
                    <Td><div className="w-24"><ProgressBar value={v as number} /></div></Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
          </Card>
          <Card>
            <CardHeader title="Số liệu, chi tiết, cài đặt" />
            <CardBody className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Stat label="Chẩn đoán" value={277} hint="NANDA-I 2024–2026" />
                <Stat label="Đạt mục tiêu" value="3/4" tone="success" />
              </div>
              <DescriptionList items={[['Lĩnh vực', '11 · An toàn / bảo vệ'], ['Phân lớp', '2. Tổn thương thể chất']]} />
            </CardBody>
            <div className="border-t border-line-soft">
              <SettingRow label="Chế độ tối" hint="Hàng cài đặt (SettingRow)"><Button size="sm">Đổi</Button></SettingRow>
            </div>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader title="Thẻ chọn (Chip)" subtitle="Chọn dấu hiệu, bộ lọc, gợi ý thêm." />
            <CardBody className="space-y-3">
              <Eyebrow>Nhãn nhỏ phía trên nhóm (Eyebrow)</Eyebrow>
              <div className="flex flex-wrap gap-1.5">
                {['Ho yếu', 'Đờm đặc', 'Sốt'].map((c) => (
                  <Chip key={c} selected={chips.includes(c)} onClick={() => setChips((x) => (x.includes(c) ? x.filter((y) => y !== c) : [...x, c]))}>{c}</Chip>
                ))}
                <Chip variant="solid">Đã chọn ×</Chip>
                <Chip variant="add"><Plus className="h-3 w-3" />Cần đánh giá thêm</Chip>
              </div>
              <TextLink>Liên kết dạng chữ (TextLink)</TextLink>
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Hộp thoại" subtitle="Modal với ModalHeader và ModalFooter." />
            <CardBody>
              <Button onClick={() => setModal(true)}>Mở hộp thoại mẫu</Button>
            </CardBody>
          </Card>
        </section>

        <Modal open={modal} onClose={() => setModal(false)} className="max-w-md">
          <ModalHeader title="Thêm người bệnh" subtitle="Chỉ cần tên; các thông tin khác bổ sung sau." onClose={() => setModal(false)} />
          <div className="p-5"><Field label="Họ và tên"><Input autoFocus /></Field></div>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setModal(false)}>Hủy</Button>
            <Button variant="primary" onClick={() => setModal(false)}>Tạo kế hoạch</Button>
          </ModalFooter>
        </Modal>

        <section className="space-y-3">
          <SectionTitle>Bố cục</SectionTitle>
          <Steps
            steps={[
              { title: 'Nhận định', text: 'Thu thập dấu hiệu, chỉ số.', icon: <ClipboardList className="h-4 w-4" /> },
              { title: 'Chẩn đoán', text: 'Chọn NANDA-I phù hợp.', icon: <Sparkles className="h-4 w-4" /> },
              { title: 'Kế hoạch', text: 'Đặt NOC, chọn NIC.', icon: <BookOpen className="h-4 w-4" /> },
            ]}
          />
          <Disclosure summary="Khối thu gọn (Disclosure)">
            <p className="text-sm text-fg-muted">Dùng cho hướng dẫn phụ, không chiếm chỗ khi chưa cần.</p>
          </Disclosure>
          <Card>
            <EmptyState icon={<ClipboardList className="h-5 w-5" />} title="Trạng thái trống: giải thích ngắn và một nút để bắt đầu." action={<Button variant="primary" icon={<Plus className="h-4 w-4" />}>Bắt đầu</Button>} />
          </Card>
        </section>
      </div>
    </>
  );
}
