import type { TaxonomySystem } from '../types';
import { NANDA_EDITION, NOC_EDITION, NIC_EDITION, NANDA_ITEMS, NOC_ITEMS, NIC_ITEMS } from './taxonomy';

/**
 * Verified against official publisher pages on 2026-10-15.
 * IMPORTANT: latest published editions are NOT included automatically.
 * License-approved source files and independent code/label verification are
 * required before updating any clinical catalog.
 */
export interface EditionAuditRow {
  system: TaxonomySystem;
  name: string;
  installedEdition: string;
  installedCount: number;
  latestEdition: number;
  latestCount: number;
  publisherUrl: string;
  status: 'current' | 'older';
}

const publisher = {
  nanda: { edition: 13, count: 277, url: 'https://nanda.org/nanda-book/' },
  noc: { edition: 7, count: 612, url: 'https://shop.elsevier.com/books/nursing-outcomes-classification-noc/moorhead/978-0-323-88252-1' },
  nic: { edition: 8, count: 614, url: 'https://shop.elsevier.com/books/nursing-interventions-classification-nic/wagner/978-0-323-88251-4' },
} as const;

function editionNumber(text: string): number {
  const edition = Number.parseInt(text, 10);
  if (!Number.isInteger(edition) || edition < 1) throw Error('Invalid source edition metadata');
  return edition;
}

export const EDITION_AUDIT: EditionAuditRow[] = [
  {system: 'nanda', name: 'NANDA-I', installedEdition: NANDA_EDITION, installedCount: NANDA_ITEMS.length,
    latestEdition: publisher.nanda.edition, latestCount: publisher.nanda.count, publisherUrl: publisher.nanda.url,
    status: editionNumber(NANDA_EDITION) >= publisher.nanda.edition ? 'current' : 'older'},
  {system: 'noc', name: 'NOC', installedEdition: NOC_EDITION, installedCount: NOC_ITEMS.length,
    latestEdition: publisher.noc.edition, latestCount: publisher.noc.count, publisherUrl: publisher.noc.url,
    status: editionNumber(NOC_EDITION) >= publisher.noc.edition ? 'current' : 'older'},
  {system: 'nic', name: 'NIC', installedEdition: NIC_EDITION, installedCount: NIC_ITEMS.length,
    latestEdition: publisher.nic.edition, latestCount: publisher.nic.count, publisherUrl: publisher.nic.url,
    status: editionNumber(NIC_EDITION) >= publisher.nic.edition ? 'current' : 'older'},
];
export const OLDER_EDITION_ROWS = EDITION_AUDIT.filter((row) => row.status === 'older');
