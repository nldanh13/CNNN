import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { AlertTriangle, BookOpen, Copy, Search } from 'lucide-react';
import type { NandaItem, NocItem, TaxonomySystem } from '../types';
import { useApp } from '../store/AppContext';
import { editionLabel, NANDA_DOMAINS, NOC_DOMAINS, nandaDomain, nocDomain } from '../data/taxonomy';
import { DUPLICATE_NANDA_CODES } from '../lib/dataQuality';
import { dataHub } from '../data/dataHub';
import type { AnyItem } from '../lib/search';
import { copyText, cx } from '../lib/utils';
import { DataIssueReport } from '../components/DataIssueReport';
import { Alert, DescriptionList, Badge, Button, Card, CodeBadge, Drawer, EmptyState, LinkButton, PageHeader, SearchInput, Segmented, Select, SYSTEM_DOT, Term } from '../ui';
import { CodeExplanationPanel } from '../components/CodeExplanationPanel';

function useIsDesktop() {
  const q='(min-width: 1024px)';
  const [desktop,setDesktop]=useState(()=>window.matchMedia(q).matches);
  useEffect(()=>{
    const m=window.matchMedia(q);
    const onChange=()=>setDesktop(m.matches);
    m.addEventListener('change',onChange);
    return()=>m.removeEventListener('change',onChange);
  },[]);
  return desktop;
}
const itemKey=(i:AnyItem)=>i.code+'|'+i.label;

export function LibraryPage({query}:{query:URLSearchParams}) {
  const {t,lang}=useApp();
  const desktop=useIsDesktop();
  const initialSys=(['nanda','noc','nic'].includes(query.get('sys')??'')?query.get('sys'):'nanda') as TaxonomySystem;
  const [system,setSystem]=useState<TaxonomySystem>(initialSys);
  const [q,setQ]=useState(query.get('q')??'');
  const [domain,setDomain]=useState(query.get('domain')??'ALL');
  const [selected,setSelected]=useState<string|null>(query.get('code')?query.get('code')+'|'+(query.get('label')??''):null);

  useEffect(()=>{
    const sys=query.get('sys') as TaxonomySystem|null;
    if(sys&&['nanda','noc','nic'].includes(sys))setSystem(sys);
    if(query.get('code')){setSelected(query.get('code')+'|'+(query.get('label')??''));setQ('');setDomain('ALL');}
    if(query.get('domain'))setDomain(query.get('domain')!);
    if(query.get('q')!==null)setQ(query.get('q')!);
  },[query]);
  const results=useMemo(()=>dataHub.searchLibrary(system,q,domain),[system,q,domain]);
  const selectedItem=useMemo(()=>{
    if(!selected)return null;
    const [code,label]=selected.split('|');
    const list=dataHub.listLibrary(system);
    return list.find(i=>i.code===code&&(!label||i.label===label))
      ??list.find(i=>i.code===code)??null;
  },[system,selected]);
  const edition=editionLabel(dataHub.editionFor(system),lang);
  const placeholder=system==='nanda'?t.library.searchNanda:system==='noc'?t.library.searchNoc:t.library.searchNic;
  const grouped=system!=='nic'&&!q.trim();
  let lastGroup='';
  const detail=selectedItem?<ItemDetail system={system} item={selectedItem} edition={edition}/>:null;

  return <>
    <PageHeader title={t.library.title} subtitle="Tra cứu NANDA-I, NOC, NIC theo mã hoặc tên, gõ có dấu hay không dấu đều được. Chọn một mục NIC để đọc định nghĩa và hoạt động NIC 8." />
    <Alert tone="warning" size="sm" className="mb-4">
      {dataHub.translationReview.draft} nhãn tiếng Việt là bản dịch dự thảo, phân lớp NOC đã được bổ sung nhưng chưa đối chiếu sách. Cần chuyên gia thẩm định trước khi dùng làm chuẩn lâm sàng.
    </Alert>
    <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
      <Segmented value={system} onChange={sys=>{setSystem(sys);setDomain('ALL');setSelected(null);}}
        options={(['nanda','noc','nic'] as const).map(s=>({
          value:s,label:s==='nanda'?'NANDA-I':s.toUpperCase(),
          icon:<span className={cx('h-2 w-2 rounded-full',SYSTEM_DOT[s])}/>,
        }))}/>
      <SearchInput value={q} onChange={setQ} placeholder={placeholder} className="flex-1"/>
      {system!=='nic'&&<Select value={domain} onChange={e=>setDomain(e.target.value)} className="lg:w-72">
        <option value="ALL">{t.library.allDomains}</option>
        {system==='nanda'
          ?NANDA_DOMAINS.map(d=><option key={d.id} value={d.id}>{d.number}. {d.nameVi}</option>)
          :NOC_DOMAINS.map(d=><option key={d.id} value={d.id}>{d.roman}. {d.nameVi}</option>)}
      </Select>}
    </div>
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_30rem]">
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-line-soft px-5 py-3 text-xs text-fg-muted">
          <span><strong className="font-semibold tabular-nums">{results.length}</strong> {t.app.results}</span>
          <span>{edition}</span>
        </div>
        {results.length===0?<EmptyState icon={<Search className="h-5 w-5"/>} title={t.app.noResults}/>:(
          <ul className="max-h-[calc(100vh-15rem)] overflow-y-auto">
            {results.map(item=>{
              let header=false;
              if(grouped){
                const group=system==='nanda'
                  ?(item as NandaItem).domainNumber+'.'+(item as NandaItem).classNumber
                  :(item as NocItem).domainNumber+'.'+(item as NocItem).classLetter;
                if(group!==lastGroup){header=true;lastGroup=group;}
              }
              const active=!!selectedItem&&itemKey(selectedItem)===itemKey(item);
              return <li key={itemKey(item)}>
                {header&&<GroupHeader system={system} item={item}/>}
                <button type="button" onClick={()=>setSelected(itemKey(item))}
                  className={cx('flex w-full items-center gap-3 border-l-2 px-5 py-2.5 text-left transition',
                    active?'border-primary-600 bg-primary-50 dark:bg-primary-500/10':'border-transparent hover:bg-surface-muted')}>
                  <CodeBadge system={system} code={item.code} className="w-14 justify-center"/>
                  <span className="min-w-0 flex-1"><Term code={item.code} en={item.label}
                    className="block truncate text-sm text-fg-body"/>
                    {dataHub.getTranslationMethod(system,item.code)==='rule-draft'&&(
                      <span className="mt-0.5 block text-[10px] text-warning-600">Bản dịch dự thảo</span>
                    )}</span>
                  {system==='nanda'&&DUPLICATE_NANDA_CODES.has(item.code)&&<AlertTriangle className="h-4 w-4 text-warning-500"/>}
                </button>
              </li>;
            })}
          </ul>
        )}
      </Card>
      {desktop?<div className="lg:sticky lg:top-20 lg:self-start"><Card>
        {detail??<EmptyState icon={<BookOpen className="h-5 w-5"/>} title={t.library.selectPrompt}/>}
      </Card></div>:<Drawer open={!!selectedItem} onClose={()=>setSelected(null)}
        title={selectedItem?.code??''} width="max-w-md">{detail}</Drawer>}
    </div>
  </>;
}

function GroupHeader({system,item}:{system:TaxonomySystem;item:AnyItem}) {
  const {term}=useApp();
  if(system==='nanda'){
    const n=item as NandaItem;
    const d=nandaDomain(n.domainNumber);
    return <div className="sticky top-0 z-[1] border-y border-line-soft bg-surface-muted/95 px-5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-fg-muted">
      {n.domainNumber}.{n.classNumber} · {d?.nameVi} — {term(null,n.className).text}
    </div>;
  }
  const n=item as NocItem;
  const d=nocDomain(n.domainId);
  return <div className="sticky top-0 z-[1] border-y border-line-soft bg-surface-muted/95 px-5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-fg-muted">
    {d?.roman}-{n.classLetter} · {d?.nameVi} — {term(null,n.className).text}
  </div>;
}

function ItemDetail({system,item,edition}:{system:TaxonomySystem;item:AnyItem;edition:string}) {
  const {t,term,toast}=useApp();
  const tr=term(item.code,item.label);
  const rows: [string,ReactNode][]=[];
  if(system==='nanda'){
    const n=item as NandaItem;
    rows.push([t.library.domain,n.domainNumber+' · '+nandaDomain(n.domainNumber)?.nameVi]);
    rows.push([t.library.class,<span key="c">{n.classNumber}. <Term code={null} en={n.className}/></span>]);
  }else if(system==='noc'){
    const n=item as NocItem;
    rows.push([t.library.domain,nocDomain(n.domainId)?.nameVi??'']);
    rows.push([t.library.class,<span key="c">{n.classLetter}. <Term code={null} en={n.className}/></span>]);
  }
  return <div className="p-5">
    <div className="flex items-center gap-2">
      <CodeBadge system={system} code={item.code} className="text-sm"/>
      <Badge>{system==='nanda'?'NANDA-I':system.toUpperCase()}</Badge>
      <span className="text-xs text-fg-muted">{edition}</span>
    </div>
    <h2 className="mt-3 text-lg font-semibold leading-snug text-fg">{tr.text}</h2>
    <p className="mt-2 text-xs text-fg-muted">Tên gốc để đối chiếu: {item.label}</p>
    {tr.machine&&<p className="mt-1 text-xs text-warning-600">{t.app.machineTranslatedHint}</p>}
    {rows.length>0&&<DescriptionList className="mt-5" items={rows}/>}
    <CodeExplanationPanel system={system} code={item.code} label={item.label}/>
    {system==='nic'&&<LinkButton variant="primary" className="mt-3" href={'#/nic-reader?code='+encodeURIComponent(item.code)}>
      Xem định nghĩa và hoạt động NIC 8 →
    </LinkButton>}
    {system==='nanda'&&DUPLICATE_NANDA_CODES.has(item.code)&&<a href="#/quality" className="mt-3 block">
      <Alert tone="warning" size="sm">{t.library.duplicateCode}</Alert>
    </a>}
    <div className="mt-6 flex flex-wrap gap-2">
      <Button size="sm" icon={<Copy className="h-3.5 w-3.5"/>}
        onClick={async()=>{await copyText(item.code+' '+tr.text);toast(t.app.copied);}}>
        {t.app.copy}
      </Button>
      <DataIssueReport system={system} code={item.code} label={item.label} fallbackEdition={edition}/>
    </div>
  </div>;
}
