/**
 * CNNN canonical runtime catalog.
 *
 * There are exactly THREE active terminologies: NANDA-I, NOC and NIC.
 * Every screen (search, library, care-plan picker, NIC reader) resolves
 * codes from the same compiled shared-data/nnn-catalog.json via taxonomy.ts.
 * Historical mappings and textbook extracts are NOT independent catalogs.
 */
import type { NandaItem, NicItem, NocItem, TaxonomySystem } from '../types';
import { SHARED_CATALOG, TRANSLATION_REVIEW } from './sharedCatalog';
import { NANDA_ITEMS, NOC_ITEMS, NIC_ITEMS, NANDA_EDITION, NOC_EDITION, NIC_EDITION } from './taxonomy';
import { normalize } from '../lib/utils';

export type CatalogItem = NandaItem | NocItem | NicItem;
export type CatalogItemFor<S extends TaxonomySystem> =
  S extends 'nanda' ? NandaItem : S extends 'noc' ? NocItem : NicItem;

type Indexed<T> = { item: T; code: string; vi: string; original: string;
  domain: string; words: Set<string>; haystack: string };

const definitions = {
  nanda: { edition: NANDA_EDITION, items: NANDA_ITEMS },
  noc: { edition: NOC_EDITION, items: NOC_ITEMS },
  nic: { edition: NIC_EDITION, items: NIC_ITEMS },
} as const;

export const NNN_SYSTEMS = ['nanda', 'noc', 'nic'] as const satisfies readonly TaxonomySystem[];

const translations = new Map(SHARED_CATALOG.entries.map(
  entry => [entry.system + ':' + entry.code, entry] as const,
));

// System is always passed explicitly. Do not identify terminology by code alone:
// NOC and NIC both use 4-digit codes and must never share a translation.
function buildIndex<S extends TaxonomySystem>(system: S, items: readonly CatalogItemFor<S>[]) {
  return items.map(item => {
    const vi = normalize(translations.get(system + ':' + item.code)?.labelVi ?? item.label);
    const original = normalize(item.label);
    const domain = normalize('className' in item ? String(item.className) : '');
    const haystack = [item.code, vi, original, domain].join(' ');
    return { item, code: item.code, vi, original, domain, haystack,
      words: new Set(haystack.split(/[^a-z0-9]+/).filter(Boolean)) };
  });
}
const indexes = {
  nanda: buildIndex('nanda', NANDA_ITEMS),
  noc: buildIndex('noc', NOC_ITEMS),
  nic: buildIndex('nic', NIC_ITEMS),
};
const byCode = {
  nanda: new Map<string, NandaItem[]>(),
  noc: new Map<string, NocItem[]>(),
  nic: new Map<string, NicItem[]>(),
};
for (const system of NNN_SYSTEMS) {
  for (const item of definitions[system].items) {
    if (system === 'nanda') {
      const row = item as NandaItem;
      byCode.nanda.set(row.code, [...(byCode.nanda.get(row.code) ?? []), row]);
    } else if (system === 'noc') {
      const row = item as NocItem;
      byCode.noc.set(row.code, [...(byCode.noc.get(row.code) ?? []), row]);
    } else {
      const row = item as NicItem;
      byCode.nic.set(row.code, [...(byCode.nic.get(row.code) ?? []), row]);
    }
  }
}
function rank<T>(entry: Indexed<T>, phrase: string, tokens: string[]): number {
  if (entry.code === phrase) return 0;
  if (entry.code.startsWith(phrase)) return 1;
  if (entry.vi === phrase) return 2;
  if (entry.vi.startsWith(phrase)) return 3;
  if (entry.words.has(phrase)) return 4;
  if (entry.vi.includes(phrase)) return 5;
  if (tokens.every(word => entry.words.has(word))) return 6;
  if (entry.original.startsWith(phrase)) return 7;
  if (entry.original.includes(phrase)) return 8;
  return 9;
}
function search<S extends TaxonomySystem>(
  system: S, query: string, filter?: (item: CatalogItemFor<S>) => boolean,
): CatalogItemFor<S>[] {
  const rows = indexes[system] as unknown as Indexed<CatalogItemFor<S>>[];
  const phrase = normalize(query).replace(/\s+/g, ' ');
  if (!phrase) return rows.filter(({ item }) => !filter || filter(item)).map(({ item }) => item);
  const tokens = phrase.split(' ').filter(Boolean);
  return rows.filter(({ item, haystack }) =>
    (!filter || filter(item)) && tokens.every(token => haystack.includes(token)))
    .map(entry => ({ entry, position: rank(entry, phrase, tokens) }))
    .sort((a, b) => a.position - b.position || a.entry.vi.localeCompare(b.entry.vi, 'vi'))
    .map(({ entry }) => entry.item);
}

export const dataHub = {
  revision: SHARED_CATALOG.revision,
  systems: NNN_SYSTEMS,
  translationReview: TRANSLATION_REVIEW,
  /** The only active catalog for each system; never a Reader/clinical copy. */
  listLibrary<S extends TaxonomySystem>(system: S): CatalogItemFor<S>[] {
    return definitions[system].items as unknown as CatalogItemFor<S>[];
  },
  getTerm<S extends TaxonomySystem>(system: S, code: string, label?: string): CatalogItemFor<S> | undefined {
    const candidates = byCode[system].get(code) as CatalogItemFor<S>[] | undefined;
    return candidates?.find(item => label === undefined || item.label === label) ?? candidates?.[0];
  },
  getTranslation(system: TaxonomySystem, code: string): string | undefined {
    return translations.get(system + ':' + code)?.labelVi;
  },
  getTranslationMethod(system: TaxonomySystem, code: string): string | undefined {
    return translations.get(system + ':' + code)?.translationMethod;
  },
  getTranslationStatus(system: TaxonomySystem, code: string): string | undefined {
    return translations.get(system + ':' + code)?.translationStatus;
  },
  search,
  searchClinical: search,
  searchLibrary<S extends TaxonomySystem>(system: S, query: string, domain = 'ALL'): CatalogItemFor<S>[] {
    return search(system, query, item => domain === 'ALL'
      || ('domainId' in item && item.domainId === domain));
  },
  editionFor(system: TaxonomySystem): string { return definitions[system].edition; },
};
