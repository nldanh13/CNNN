import type { CareEntry } from '../types';

/** Chỉ lưu metadata phiên bản, không phát hành URL chứa tệp sách. */
export const NNN_SOURCES = {
  nanda:{title:'NANDA-I 2024–2026 · ấn bản 13'},
  noc:{title:'NOC · ấn bản 6 (2018)'},
  nic:{title:'NIC · ấn bản 8 (2024), nhãn Việt chờ kiểm duyệt'},
  nic8:{title:'NIC · ấn bản 8 (2024), danh mục đang dùng'},
  ackley:{title:'Tài liệu tham khảo lịch sử'},
} as const;

export interface ReviewedNnnLink {
  nandaCode:string;
  nocCode:string;
  nicCodes:string[];
  sourceId:keyof typeof NNN_SOURCES;
  sourcePage:string;
  reviewer:string;
  reviewedAt:string;
  clinicalScope:string;
}
export const REVIEWED_NNN_LINKS: ReviewedNnnLink[]=[];
export function reviewedLinksFor(entry:CareEntry):ReviewedNnnLink[] {
  return REVIEWED_NNN_LINKS.filter(l=>
    l.nandaCode===entry.nanda.code&&l.nocCode===entry.noc.code&&
    l.nicCodes.every(code=>entry.nic.some(x=>x.code===code))&&
    Boolean(NNN_SOURCES[l.sourceId]&&l.sourcePage.trim()&&l.reviewer.trim()&&l.reviewedAt.trim()));
}
