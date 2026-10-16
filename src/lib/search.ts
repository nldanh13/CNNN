/**
 * Compatibility facade. All search goes through the ONE dataHub catalog.
 * New code should import dataHub directly; kept for existing components/tests.
 */
import type { TaxonomySystem } from '../types';
import { dataHub, type CatalogItem, type CatalogItemFor } from '../data/dataHub';

export type AnyItem = CatalogItem;

export function searchSystem<S extends TaxonomySystem>(
  system: S,
  query: string,
  filter?: (item: CatalogItemFor<S>) => boolean,
): CatalogItemFor<S>[] {
  return dataHub.search(system, query, filter);
}
