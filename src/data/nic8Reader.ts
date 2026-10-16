import raw from '../../shared-data/nic8-licensed-es-source.json';
import translated from '../../shared-data/nic8-translations.json';
import { SHARED_CATALOG } from './sharedCatalog';
import { normalize } from '../lib/utils';

export type ReaderLanguage = 'en' | 'vi' | 'es' | 'both';
export interface Nic8SourceEntry {
  code: string;
  titleEs: string;
  definitionEs: string;
  activitiesEs: string[];
  titleEn: string | null;
  definitionEn: string | null;
  activitiesEn: string[] | null;
  titleVi: string | null;
  definitionVi: string | null;
  activitiesVi: string[] | null;
  source: { file: string; edition: number; epubPath: string };
  translationStatus: string;
}
interface SourcePack { schema: string; entries: Nic8SourceEntry[] }
const source = raw as SourcePack;
const titles = new Map(
  SHARED_CATALOG.entries.filter(item => item.system === 'nic')
    .map(item => [item.code, { en: item.label, vi: item.labelVi }]),
);

interface TranslationEntry {
  code: string;
  definitionEn: string;
  activitiesEn: string[];
  definitionVi: string;
  activitiesVi: string[];
  translationStatus: string;
}
const translationLookup = new Map(
  (translated.entries as TranslationEntry[]).map(entry => [entry.code, entry]),
);
// Giữ nguyên tệp gốc Tây Ban Nha, ghép bản dịch theo mã tại thời điểm đọc.
export const NIC8_SOURCE: Nic8SourceEntry[] = source.entries.map(item => {
  const localized = translationLookup.get(item.code);
  return localized
    ? { ...item, definitionEn: localized.definitionEn, activitiesEn: localized.activitiesEn,
        definitionVi: localized.definitionVi, activitiesVi: localized.activitiesVi,
        translationStatus: localized.translationStatus }
    : item;
});
export const NIC8_TOTAL_ACTIVITIES = NIC8_SOURCE.reduce((sum, item) => sum + item.activitiesEs.length, 0);
export function nic8Titles(item: Nic8SourceEntry) {
  const title = titles.get(item.code);
  return {
    es: item.titleEs,
    en: item.titleEn || title?.en || item.titleEs,
    vi: item.titleVi || title?.vi || item.titleEs,
  };
}
export function nic8Text(
  item: Nic8SourceEntry, lang: 'en' | 'vi' | 'es',
): { definition: string; activities: string[]; fallback: boolean } {
  if (lang === 'es') return { definition: item.definitionEs, activities: item.activitiesEs, fallback: false };
  const def = lang === 'en' ? item.definitionEn : item.definitionVi;
  const acts = lang === 'en' ? item.activitiesEn : item.activitiesVi;
  const valid = Boolean(def?.trim() && acts?.length === item.activitiesEs.length && acts.every(s => s.trim()));
  return valid
    ? { definition: def!, activities: acts!, fallback: false }
    : { definition: item.definitionEs, activities: item.activitiesEs, fallback: true };
}

export const NIC8_SEARCH_INDEX = NIC8_SOURCE.map(item => ({
  item,
  haystack: normalize([
    item.code,
    ...Object.values(nic8Titles(item)),
    item.definitionEs,
    item.definitionEn || '',
    item.definitionVi || '',
    ...item.activitiesEs,
    ...(item.activitiesEn || []),
    ...(item.activitiesVi || []),
  ].join(' ')),
}));

export function findNic8(query: string, limit = 80): Nic8SourceEntry[] {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (!words.length) return NIC8_SOURCE.slice(0, limit);
  return NIC8_SEARCH_INDEX
    .filter(row => words.every(word => row.haystack.includes(word)))
    .sort((a, b) => {
      const aExact = a.item.code === words.join(' ') ? 0 : a.item.code.startsWith(words[0]) ? 1 : 2;
      const bExact = b.item.code === words.join(' ') ? 0 : b.item.code.startsWith(words[0]) ? 1 : 2;
      return aExact - bExact || a.item.code.localeCompare(b.item.code);
    }).slice(0, limit).map(row => row.item);
}
export function translationCoverage() {
  return {
    en: NIC8_SOURCE.filter(item => !nic8Text(item, 'en').fallback).length,
    vi: NIC8_SOURCE.filter(item => !nic8Text(item, 'vi').fallback).length,
  };
}
