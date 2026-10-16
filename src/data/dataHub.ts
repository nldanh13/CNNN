/** API truy cập chung cho thư viện và kế hoạch chăm sóc. Chỉ chứa danh mục thuật ngữ. */
import type { TaxonomySystem } from '../types';
import type { AnyItem } from '../lib/search';
import { searchSystem } from '../lib/search';
import { NANDA_EDITION, NOC_EDITION, NIC_EDITION } from './taxonomy';
import { SHARED_CATALOG } from './sharedCatalog';

export const dataHub = {
  revision: SHARED_CATALOG.revision,
  searchClinical: (system:TaxonomySystem,query:string):AnyItem[]=>searchSystem(system,query),
  searchLibrary: (system:TaxonomySystem,query:string,domain='ALL'):AnyItem[]=>{
    switch(system){
      case 'nanda':return searchSystem('nanda',query,item=>domain==='ALL'||item.domainId===domain);
      case 'noc':return searchSystem('noc',query,item=>domain==='ALL'||item.domainId===domain);
      case 'nic':return searchSystem('nic',query);
    }
  },
  listLibrary: (system:TaxonomySystem):AnyItem[]=>searchSystem(system,''),
  editionFor: (system:TaxonomySystem)=>system==='nanda'?NANDA_EDITION:system==='noc'?NOC_EDITION:NIC_EDITION,
};
