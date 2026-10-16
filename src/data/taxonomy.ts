import { SHARED_CATALOG } from './sharedCatalog';
import type { NandaDomain, NandaItem, NicItem, NocDomain, NocItem } from '../types';

const { editions, totals, entries } = SHARED_CATALOG;
export const NANDA_EDITION = editions.nanda;
export const NOC_EDITION = editions.noc;
export const NIC_EDITION = editions.nic;
export const DECLARED_TOTALS = totals;

const NANDA_DOMAIN_VI: Record<number,string> = {
  0:'Chưa xác định phân lớp',
  1:'Nâng cao sức khỏe',2:'Dinh dưỡng',3:'Bài tiết và trao đổi',4:'Hoạt động / nghỉ ngơi',
  5:'Tri giác / nhận thức',6:'Tự nhận thức',7:'Vai trò / mối quan hệ',
  8:'Tình dục',9:'Đối phó / chịu đựng căng thẳng',10:'Nguyên tắc sống',
  11:'An toàn / bảo vệ',12:'Sự thoải mái',13:'Tăng trưởng / phát triển',
};
const NANDA_DOMAIN_EN: Record<number,string> = {
  0:'Unclassified',
  1:'Health promotion',2:'Nutrition',3:'Elimination and exchange',4:'Activity / rest',
  5:'Perception / cognition',6:'Self-perception',7:'Role relationship',
  8:'Sexuality',9:'Coping / stress tolerance',10:'Life principles',
  11:'Safety / protection',12:'Comfort',13:'Growth / development',
};
const NOC_DOMAIN_VI: Record<number,string> = {
  0:'Chưa xác định phân lớp',
  1:'Sức khỏe chức năng',2:'Sức khỏe sinh lý',3:'Sức khỏe tâm lý – xã hội',
  4:'Kiến thức & hành vi sức khỏe',5:'Sức khỏe cảm nhận',
  6:'Sức khỏe gia đình',7:'Sức khỏe cộng đồng',
};
const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

export const NANDA_DOMAINS: NandaDomain[] = [];
export const NOC_DOMAINS: NocDomain[] = [];
export const NANDA_ITEMS: NandaItem[] = [];
export const NOC_ITEMS: NocItem[] = [];

for (const item of entries) {
  if (item.system === 'nanda') {
    const domainId = item.domainId!;
    const classKey = item.classKey!;
    const number = Number(domainId.match(/^Domain_(\d+)/)?.[1] ?? 0);
    if (!NANDA_DOMAINS.some(d=>d.id===domainId)) {
      NANDA_DOMAINS.push({id:domainId,number,nameEn:NANDA_DOMAIN_EN[number],nameVi:NANDA_DOMAIN_VI[number]});
    }
    const m=classKey.match(/^Class_(\d+)_(.+)$/);
    NANDA_ITEMS.push({code:item.code,label:item.label,domainId,domainNumber:number,classKey,
      classNumber:Number(m?.[1]??0),className:number===0?'Chưa xác định phân lớp':(m?.[2]??classKey).replace(/_/g,' ')});
  } else if (item.system === 'noc') {
    const domainId = item.domainId!;
    const classKey = item.classKey!;
    const m=domainId.match(/^(\d+)_(.+)$/);
    const number=Number(m?.[1]??0);
    if (!NOC_DOMAINS.some(d=>d.id===domainId)) {
      NOC_DOMAINS.push({id:domainId,number,roman:ROMAN[number]??String(number),
        nameEn:(m?.[2]??domainId).replace(/_/g,' ').replace(' and ',' & '),nameVi:NOC_DOMAIN_VI[number]??''});
    }
    const cm=classKey.match(/^([A-Z]+)_(.+)$/);
    NOC_ITEMS.push({code:item.code,label:item.label,domainId,domainNumber:number,classKey,
      classLetter:cm?.[1]??'',className:number===0?'Chưa xác định phân lớp':(cm?.[2]??classKey).replace(/_/g,' ')});
  }
}
export const NIC_ITEMS: NicItem[] = entries.filter(e=>e.system==='nic')
  .map(e=>({code:e.code,label:e.label})).sort((a,b)=>a.label.localeCompare(b.label));

// --- Tra cứu theo mã ---------------------------------------------------------

function indexByCode<T extends { code: string }>(items: T[]) {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const list = map.get(item.code);
    if (list) list.push(item);
    else map.set(item.code, [item]);
  }
  return map;
}

export const NANDA_BY_CODE = indexByCode(NANDA_ITEMS);
export const NOC_BY_CODE = indexByCode(NOC_ITEMS);
export const NIC_BY_CODE = indexByCode(NIC_ITEMS);

/** Tìm mục NANDA theo mã, ưu tiên mục có nhãn khớp khi mã bị trùng. */
export function findNanda(code: string, label?: string): NandaItem | undefined {
  const list = NANDA_BY_CODE.get(code);
  if (!list) return undefined;
  return (label && list.find((i) => i.label === label)) || list[0];
}

export function findNoc(code: string): NocItem | undefined {
  return NOC_BY_CODE.get(code)?.[0];
}

export function findNic(code: string): NicItem | undefined {
  return NIC_BY_CODE.get(code)?.[0];
}

export function nandaDomain(number: number) {
  return NANDA_DOMAINS.find((d) => d.number === number);
}

export function nocDomain(id: string) {
  return NOC_DOMAINS.find((d) => d.id === id);
}

/** "13th Edition (2024-2026)" -> "Ấn bản 13 (2024–2026)" khi giao diện là tiếng Việt. */
export function editionLabel(edition: string, lang: 'vi' | 'en'): string {
  if (lang !== 'vi') return edition;
  const m = edition.match(/^(\d+)\w*\s+Edition\s*(?:\((.+)\))?$/i);
  if (!m) return edition;
  return `Ấn bản ${m[1]}${m[2] ? ` (${m[2].replace('-', '–')})` : ''}`;
}
