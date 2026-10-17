import type { TaxonomySystem } from '../types';
import { SHARED_CATALOG } from './sharedCatalog';
import { EDITION_AUDIT } from './editionAudit';

const systems: readonly TaxonomySystem[] = ['nanda', 'noc', 'nic'] as const;
const draft = (value?: string) => value?.includes('unreviewed') ?? false;

export interface TranslationProvenance {
  code: string;
  system: TaxonomySystem;
  method: string;
  status: string;
  unreviewed: boolean;
}

/** Metadata describes translation review status; never implies clinical verification. */
export function termTranslationProvenance(
  system: TaxonomySystem,
  code: string,
): TranslationProvenance | null {
  const row = SHARED_CATALOG.entries.find(item => item.system === system && item.code === code);
  if (!row) return null;
  return {
    code, system,
    method: row.translationMethod ?? 'unknown',
    status: row.translationStatus ?? 'unknown',
    unreviewed: draft(row.translationStatus),
  };
}

export const CATALOG_QUALITY_SUMMARY = systems.map(system => {
  const entries = SHARED_CATALOG.entries.filter(item => item.system === system);
  const edition = EDITION_AUDIT.find(row => row.system === system);
  if (!edition) throw new Error('Thiếu thông tin ấn bản: ' + system);
  return {
    system,
    count: entries.length,
    unreviewed: entries.filter(entry => draft(entry.translationStatus)).length,
    unknown: entries.filter(entry => !entry.translationStatus).length,
    edition: edition.installedEdition,
    editionStatus: edition.status,
    latestPublisherEdition: edition.latestEdition,
  };
});
