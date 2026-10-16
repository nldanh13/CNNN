import type { TaxonomySystem } from '../types';

export type ReportCategory =
  | 'wrong-code' | 'wrong-label' | 'wrong-translation' | 'wrong-definition'
  | 'wrong-indicator' | 'wrong-activity' | 'outdated-edition' | 'other';

export interface DataReport {
  system:TaxonomySystem;
  code:string;
  label:string;
  edition:string;
  category:ReportCategory;
  description:string;
  suggestion:string;
  evidence:string;
}
const URL_ISSUE='https://github.com/nldanh13/ClinicalNNN/issues/new';
const labels:Record<ReportCategory,string>={
  'wrong-code':'Sai mã','wrong-label':'Sai nhãn','wrong-translation':'Góp ý bản dịch',
  'wrong-definition':'Giải thích','wrong-indicator':'Chỉ số NOC',
  'wrong-activity':'Can thiệp NIC','outdated-edition':'Ấn bản','other':'Khác',
};
export function makeDataReportText(r:DataReport):string {
  return [
    '## Thông tin bản ghi',
    '- Hệ thống: '+r.system.toUpperCase(),
    '- Mã: '+r.code,
    '- Thuật ngữ tiếng Việt: '+r.label,
    '- Ấn bản: '+r.edition,
    '- Loại vấn đề: '+labels[r.category],
    '',
    '## Mô tả',r.description.trim(),
    '',
    '## Đề xuất chỉnh sửa',r.suggestion.trim()||'(Chưa có)',
    '',
    '## Nguồn đối chiếu',r.evidence.trim()||'(Chưa có)',
    '',
    '## Dành cho người kiểm duyệt',
    '- [ ] Xác minh mã, ấn bản và nguồn gốc',
    '- [ ] Thẩm định tính chính xác của bản dịch và nội dung',
    '- [ ] Tăng phiên bản kho dữ liệu chung',
    '- [ ] Chạy kiểm thử và ghi nhận thay đổi',
    '',
    '> Vui lòng không đăng thông tin người bệnh hoặc nội dung sách nguyên văn.',
  ].join('\n');
}
export function makeDataReportIssueUrl(r:DataReport):string {
  const url=new URL(URL_ISSUE);
  url.searchParams.set('title','[Dữ liệu] ['+r.system.toUpperCase()+' '+r.code+'] '+labels[r.category]);
  url.searchParams.set('body',makeDataReportText(r));
  return url.toString();
}
