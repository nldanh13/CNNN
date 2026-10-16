import { NANDA_ITEMS, NIC_ITEMS, NOC_ITEMS } from '../data/taxonomy';
import type { NandaItem, NicItem, NocItem, TaxonomySystem } from '../types';
import { normalize } from './utils';
import { translateVi } from './translate';

export type AnyItem = NandaItem | NocItem | NicItem;

interface Indexed<T> {
  item: T;
  code: string;
  vi: string;
  original: string;
  domain: string;
  words: Set<string>;
  haystack: string;
}

function index<T extends { code: string; label: string }>(items: T[]): Indexed<T>[] {
  return items.map((item) => {
    const vi = normalize(translateVi(item.code, item.label).text);
    const original = normalize(item.label);
    const domain = normalize('className' in item ? String(item.className) : '');
    const haystack = [item.code, vi, original, domain].join(' ');
    return {
      item, code: item.code, vi, original, domain, haystack,
      words: new Set(haystack.split(/[^a-z0-9]+/).filter(Boolean)),
    };
  });
}

const INDEX = {
  nanda: index(NANDA_ITEMS),
  noc: index(NOC_ITEMS),
  nic: index(NIC_ITEMS),
};

/** Không phân biệt dấu; ưu tiên đúng mã rồi đến tên tiếng Việt. */
function rank<T>(entry: Indexed<T>, phrase: string, tokens: string[]): number {
  if (entry.code === phrase) return 0;
  if (entry.code.startsWith(phrase)) return 1;
  if (entry.vi === phrase) return 2;
  if (entry.vi.startsWith(phrase)) return 3;
  if (entry.words.has(phrase)) return 4;
  if (entry.vi.includes(phrase)) return 5;
  if (tokens.every((word) => entry.words.has(word))) return 6;
  if (entry.original.startsWith(phrase)) return 7;
  if (entry.original.includes(phrase)) return 8;
  return 9;
}

export function searchSystem<S extends TaxonomySystem>(
  system: S,
  query: string,
  filter?: (item: S extends 'nanda' ? NandaItem : S extends 'noc' ? NocItem : NicItem) => boolean,
) {
  type Item = S extends 'nanda' ? NandaItem : S extends 'noc' ? NocItem : NicItem;
  const list = INDEX[system] as unknown as Indexed<Item>[];
  const phrase = normalize(query).replace(/\s+/g, ' ');
  if (!phrase) return list.filter(({ item }) => !filter || filter(item)).map(({ item }) => item);
  const tokens = phrase.split(' ').filter(Boolean);
  return list
    .filter(({ item, haystack }) => (!filter || filter(item))
      && tokens.every((token) => haystack.includes(token)))
    .map((entry) => ({ entry, position: rank(entry, phrase, tokens) }))
    .sort((a, b) => a.position - b.position || a.entry.vi.localeCompare(b.entry.vi, 'vi'))
    .map(({ entry }) => entry.item);
}
