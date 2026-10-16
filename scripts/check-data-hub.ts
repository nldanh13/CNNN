import {dataHub} from '../src/data/dataHub';
import {NANDA_ITEMS,NOC_ITEMS,NIC_ITEMS} from '../src/data/taxonomy';
import {makeDataReportIssueUrl,makeDataReportText} from '../src/lib/dataReports';
import {strict as assert} from 'node:assert';
assert.equal(dataHub.searchLibrary('nanda','').length,NANDA_ITEMS.length);
assert.equal(dataHub.searchLibrary('noc','').length,NOC_ITEMS.length);
assert.equal(dataHub.searchLibrary('nic','').length,NIC_ITEMS.length);
assert.equal(dataHub.listLibrary('nic').length,614);
assert.equal(dataHub.editionFor('nic'),'8th Edition (2024)');
assert.equal(dataHub.searchClinical('nanda','00132')[0]?.code,'00132');
assert.equal(dataHub.searchLibrary('nanda','00132')[0]?.code,'00132');
assert.equal(dataHub.searchClinical('nic','9999').length,0,'Không thay NIC 7 bằng NIC 8 chưa thẩm định');
const example={
  system:'noc' as const,code:'2102',label:'Mức độ đau',edition:'Ấn bản 6',
  category:'wrong-translation' as const,description:'Tên thuật ngữ chưa phù hợp',
  suggestion:'Tên đề xuất',evidence:'Nguồn có trích dẫn',
};
const url=new URL(makeDataReportIssueUrl(example));
assert.equal(url.pathname,'/nldanh13/ClinicalNNN/issues/new');
assert.equal(url.searchParams.get('body'),makeDataReportText(example));
assert.ok(!makeDataReportText(example).includes('patient_info'));
console.log('OK: kho dữ liệu dùng chung cho thư viện và kế hoạch; góp ý bản dịch tiếng Việt.');
