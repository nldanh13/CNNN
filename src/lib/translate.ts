import { CLASS_NAME_VI, CLINICAL_PHRASE_VI, VI_TERM_TRANSLATIONS } from './viDictionary';
import { SHARED_CATALOG, OWNER_REVIEW } from '../data/sharedCatalog';
import { NIC7_LEGACY_LABELS, RETIRED_NIC7 } from '../data/nicMigration';
import classesVi from '../data/vi/classes.vi.json';
import nandaLegacyVi from '../data/vi/nanda-legacy.vi.json';

// Dùng đồng thời mã và tên gốc để không lấy nhầm nhãn giữa NANDA-I / NOC / NIC.
const CATALOG_EXACT = new Map(
  SHARED_CATALOG.entries.map((entry) => [entry.code + '\u0000' + entry.label, entry]),
);
const labelCandidates = new Map<string, Set<string>>();
for (const entry of SHARED_CATALOG.entries) {
  const candidates = labelCandidates.get(entry.label) ?? new Set<string>();
  candidates.add(entry.labelVi);
  labelCandidates.set(entry.label, candidates);
}
const LABEL_VI: Record<string, string> = {
  ...classesVi,
  ...nandaLegacyVi,
  ...Object.fromEntries([...labelCandidates].filter(([, values]) => values.size === 1)
    .map(([label, values]) => [label, [...values][0]])),
};

/**
 * Dịch tự động theo luật (prefix + cụm từ). Chỉ dùng khi thuật ngữ chưa có bản dịch chuẩn
 * trong từ điển; kết quả được đánh dấu là "dịch máy" trên giao diện.
 */
export function autoTranslateVi(code: string | null, enText: string): string {
  if (!enText) return "";
  if (code && VI_TERM_TRANSLATIONS[code]) return VI_TERM_TRANSLATIONS[code];
  if (CLINICAL_PHRASE_VI[enText]) return CLINICAL_PHRASE_VI[enText];
  if (CLASS_NAME_VI[enText]) return CLASS_NAME_VI[enText];

  let s = enText;

  // Cấu trúc câu chuẩn NANDA-I, NOC, NIC
  const prefixRules: [RegExp, string][] = [
    [/^Risk for ineffective /i, "Nguy cơ không hiệu quả trong "],
    [/^Risk for impaired /i, "Nguy cơ suy giảm "],
    [/^Risk for decreased /i, "Nguy cơ giảm "],
    [/^Risk for excessive /i, "Nguy cơ quá mức "],
    [/^Risk for inadequate /i, "Nguy cơ không đầy đủ "],
    [/^Risk for disrupted /i, "Nguy cơ gián đoạn "],
    [/^Risk for delayed /i, "Nguy cơ chậm "],
    [/^Risk for chronic /i, "Nguy cơ mạn tính: "],
    [/^Risk for situational /i, "Nguy cơ theo tình huống: "],
    [/^Risk for acute /i, "Nguy cơ cấp tính: "],
    [/^Risk for /i, "Nguy cơ "],
    [/^Readiness for enhanced /i, "Sẵn sàng tăng cường "],
    [/^Ineffective /i, "Không hiệu quả: "],
    [/^Impaired /i, "Suy giảm "],
    [/^Decreased /i, "Giảm "],
    [/^Excessive /i, "Quá mức: "],
    [/^Inadequate /i, "Không đầy đủ: "],
    [/^Disrupted /i, "Gián đoạn "],
    [/^Delayed /i, "Chậm "],
    [/^Maladaptive /i, "Thích ứng kém: "],
    [/^Self-Management: /i, "Tự quản lý: "],
    [/^Knowledge: /i, "Kiến thức: "],
    [/^Risk Control: /i, "Kiểm soát nguy cơ: "],
    [/^Client Satisfaction: /i, "Sự hài lòng của người bệnh: "],
    [/^Self-Care: /i, "Tự chăm sóc: "],
    [/^Self-care assistance: /i, "Hỗ trợ tự chăm sóc: "],
    [/^Teaching: /i, "Giáo dục sức khỏe: "],
    [/^Exercise therapy: /i, "Liệu pháp vận động: "],
    [/^Medication administration: /i, "Thực hiện thuốc: "],
    [/^Environmental management: /i, "Quản lý môi trường: "],
    [/^Tissue Perfusion: /i, "Tưới máu mô: "],
    [/^Respiratory Status: /i, "Tình trạng hô hấp: "],
    [/^Nutritional Status: /i, "Tình trạng dinh dưỡng: "],
    [/^Child Development: /i, "Phát triển trẻ em: "],
    [/^Sensory Function: /i, "Chức năng giác quan: "],
    [/^Comfort Status: /i, "Tình trạng thoải mái: "],
    [/^Community Risk Control: /i, "Kiểm soát nguy cơ cộng đồng: "],
    [/^Parenting Performance: /i, "Thực hiện nuôi dạy con: "],
    [/^Wound care: /i, "Chăm sóc vết thương: "],
    [/^Tube care: /i, "Chăm sóc ống thông: "]
  ];

  for (const [regex, replacement] of prefixRules) {
    if (regex.test(s)) {
      s = s.replace(regex, replacement);
      break;
    }
  }

  // Từ điển cụm từ chuyên ngành y khoa - điều dưỡng
  const wordReplacements: [RegExp, string][] = [
    [/\bdiversional activity engagement\b/gi, "tham gia hoạt động giải trí"],
    [/\bsedentary behaviors\b/gi, "hành vi tĩnh tại"],
    [/\benergy field\b/gi, "trường năng lượng"],
    [/\bImbalanced\b/gi, "Mất cân bằng"],
    [/\bfamily health self-management\b/gi, "tự quản lý sức khỏe gia đình"],
    [/\bhealth self-management\b/gi, "tự quản lý sức khỏe"],
    [/\bfamily health management\b/gi, "quản lý sức khỏe gia đình"],
    [/\bcommunity health management\b/gi, "quản lý sức khỏe cộng đồng"],
    [/\bblood glucose pattern self-management\b/gi, "tự quản lý biểu đồ đường huyết"],
    [/\bdry eye self-management\b/gi, "tự quản lý khô mắt"],
    [/\bdry mouth self-management\b/gi, "tự quản lý khô miệng"],
    [/\bfatigue self-management\b/gi, "tự quản lý mệt mỏi"],
    [/\blymphedema self-management\b/gi, "tự quản lý phù bạch mạch"],
    [/\bnausea self-management\b/gi, "tự quản lý buồn nôn"],
    [/\bpain self-management\b/gi, "tự quản lý cơn đau"],
    [/\bweight self-management\b/gi, "tự quản lý cân nặng"],
    [/\boverweight self-management\b/gi, "tự quản lý thừa cân"],
    [/\bunderweight self-management\b/gi, "tự quản lý thiếu cân"],
    [/\bhealth maintenance behaviors\b/gi, "hành vi duy trì sức khỏe"],
    [/\bhome maintenance behaviors\b/gi, "hành vi duy trì sinh hoạt tại nhà"],
    [/\bexercise engagement\b/gi, "tham gia tập luyện"],
    [/\bhealth literacy\b/gi, "hiểu biết thông tin y tế"],
    [/\bhealthy aging\b/gi, "lão hóa khỏe mạnh"],
    [/\belder frailty syndrome\b/gi, "hội chứng suy yếu ở người cao tuổi"],
    [/\bfrail elderly syndrome\b/gi, "hội chứng người cao tuổi suy yếu"],
    [/\bnutritional intake\b/gi, "lượng dinh dưỡng nạp vào"],
    [/\bprotein energy\b/gi, "protein-năng lượng"],
    [/\bexclusive chestfeeding\b/gi, "nuôi con hoàn toàn bằng sữa mẹ"],
    [/\bchestfeeding\b/gi, "cho con bú"],
    [/\bbreastfeeding\b/gi, "nuôi con bằng sữa mẹ"],
    [/\bhuman milk production\b/gi, "sản xuất sữa mẹ"],
    [/\binfant feeding dynamics\b/gi, "động lực ăn uống của trẻ nhũ nhi"],
    [/\bchild eating dynamics\b/gi, "động lực ăn uống của trẻ em"],
    [/\badolescent eating dynamics\b/gi, "động lực ăn uống của vị thành niên"],
    [/\bswallowing\b/gi, "khả năng nuốt"],
    [/\bneonatal hyperbilirubinemia\b/gi, "tăng bilirubin máu sơ sinh"],
    [/\bwater-electrolyte balance\b/gi, "cân bằng nước - điện giải"],
    [/\bfluid volume balance\b/gi, "cân bằng thể tích dịch"],
    [/\bfluid volume\b/gi, "thể tích dịch"],
    [/\burinary elimination\b/gi, "bài tiết nước tiểu"],
    [/\burinary retention\b/gi, "bí tiểu"],
    [/\bdisability-associated urinary incontinence\b/gi, "tiểu không tự chủ liên quan khuyết tật"],
    [/\bmixed urinary incontinence\b/gi, "tiểu không tự chủ hỗn hợp"],
    [/\bstress urinary incontinence\b/gi, "tiểu không tự chủ khi gắng sức"],
    [/\burge urinary incontinence\b/gi, "tiểu không tự chủ gấp"],
    [/\burinary incontinence\b/gi, "tiểu không tự chủ"],
    [/\bgastrointestinal motility\b/gi, "nhu động tiêu hóa"],
    [/\bintestinal elimination\b/gi, "bài tiết đường ruột"],
    [/\bchronic functional constipation\b/gi, "táo bón chức năng mạn tính"],
    [/\bfecal continence\b/gi, "tự chủ đại tiện"],
    [/\bbowel incontinence\b/gi, "đại tiện không tự chủ"],
    [/\bgas exchange\b/gi, "trao đổi khí"],
    [/\bsleep pattern\b/gi, "kiểu ngủ"],
    [/\bsleep hygiene behaviors\b/gi, "hành vi vệ sinh giấc ngủ"],
    [/\bphysical mobility\b/gi, "vận động thể chất"],
    [/\bbed mobility\b/gi, "vận động trên giường"],
    [/\bwheelchair mobility\b/gi, "vận động bằng xe lăn"],
    [/\bsitting ability\b/gi, "khả năng ngồi"],
    [/\bstanding ability\b/gi, "khả năng đứng"],
    [/\btransferring ability\b/gi, "khả năng chuyển tư thế"],
    [/\bwalking ability\b/gi, "khả năng đi lại"],
    [/\bactivity tolerance\b/gi, "sức chịu đựng hoạt động"],
    [/\bfatigue burden\b/gi, "gánh nặng mệt mỏi"],
    [/\bsurgical recovery\b/gi, "hồi phục sau phẫu thuật"],
    [/\bcardiovascular function\b/gi, "chức năng tim mạch"],
    [/\bimbalanced blood pressure\b/gi, "mất cân bằng huyết áp"],
    [/\bcardiac output\b/gi, "cung lượng tim"],
    [/\bcerebral tissue perfusion\b/gi, "tưới máu mô não"],
    [/\bperipheral tissue perfusion\b/gi, "tưới máu mô ngoại vi"],
    [/\bbreathing pattern\b/gi, "kiểu thở"],
    [/\bspontaneous ventilation\b/gi, "thông khí tự nhiên"],
    [/\bchild ventilatory weaning response\b/gi, "đáp ứng cai máy thở ở trẻ em"],
    [/\badult ventilatory weaning response\b/gi, "đáp ứng cai máy thở ở người lớn"],
    [/\bself-care ability syndrome\b/gi, "hội chứng khả năng tự chăm sóc"],
    [/\bself-care abilities\b/gi, "khả năng tự chăm sóc"],
    [/\bbathing abilities\b/gi, "khả năng tự tắm rửa"],
    [/\bdressing abilities\b/gi, "khả năng tự mặc quần áo"],
    [/\bfeeding abilities\b/gi, "khả năng tự ăn uống"],
    [/\bgrooming abilities\b/gi, "khả năng tự chăm sóc ngoại hình"],
    [/\btoileting abilities\b/gi, "khả năng tự đi vệ sinh"],
    [/\boral hygiene behaviors\b/gi, "hành vi vệ sinh răng miệng"],
    [/\bacute confusion\b/gi, "lú lẫn cấp tính"],
    [/\bchronic confusion\b/gi, "lú lẫn mạn tính"],
    [/\bimpulse control\b/gi, "kiểm soát xung động"],
    [/\bthought processes\b/gi, "quá trình tư duy"],
    [/\bhealth knowledge\b/gi, "kiến thức sức khỏe"],
    [/\bmemory\b/gi, "trí nhớ"],
    [/\bemancipated decision-making\b/gi, "ra quyết định tự chủ"],
    [/\bdecision-making\b/gi, "ra quyết định"],
    [/\bverbal communication\b/gi, "giao tiếp bằng lời nói"],
    [/\bself-concept\b/gi, "tự quan niệm bản thân"],
    [/\bpersonal identity\b/gi, "bản sắc cá nhân"],
    [/\bfamily identity syndrome\b/gi, "hội chứng bản sắc gia đình"],
    [/\bhuman dignity\b/gi, "nhân phẩm"],
    [/\btransgender social identity\b/gi, "bản dạng xã hội người chuyển giới"],
    [/\bself-esteem\b/gi, "lòng tự trọng"],
    [/\bhealth self-efficacy\b/gi, "năng lực tự chủ sức khỏe"],
    [/\bbody image\b/gi, "hình ảnh cơ thể"],
    [/\bparenting behaviors\b/gi, "hành vi làm cha mẹ"],
    [/\bparental role conflict\b/gi, "xung đột vai trò làm cha mẹ"],
    [/\bfamily interaction patterns\b/gi, "khuôn mẫu tương tác gia đình"],
    [/\bfamily processes\b/gi, "quá trình gia đình"],
    [/\battachment behaviors\b/gi, "hành vi gắn kết"],
    [/\brole performance\b/gi, "thực hiện vai trò"],
    [/\bintimate partner relationship\b/gi, "mối quan hệ bạn đời/đối tác"],
    [/\bsocial interaction\b/gi, "tương tác xã hội"],
    [/\bchildbearing process\b/gi, "quá trình sinh nở"],
    [/\bsexual function\b/gi, "chức năng tình dục"],
    [/\bmaternal-fetal dyad\b/gi, "cặp mẹ - thai nhi"],
    [/\bpost-trauma syndrome\b/gi, "hội chứng sau sang chấn"],
    [/\bimmigration transition\b/gi, "chuyển tiếp nhập cư"],
    [/\bfamily coping\b/gi, "đối phó của gia đình"],
    [/\bcommunity coping\b/gi, "đối phó của cộng đồng"],
    [/\bcoping\b/gi, "đối phó"],
    [/\bcaregiving burden\b/gi, "gánh nặng chăm sóc"],
    [/\bgrieving\b/gi, "đau buồn / tang chế"],
    [/\bresilience\b/gi, "khả năng phục hồi tâm lý"],
    [/\bhope\b/gi, "hy vọng"],
    [/\bself-compassion\b/gi, "lòng trắc ẩn với bản thân"],
    [/\bdeath anxiety\b/gi, "lo âu về cái chết"],
    [/\banxiety\b/gi, "lo âu"],
    [/\bfear\b/gi, "sợ hãi"],
    [/\bautonomic dysreflexia\b/gi, "phản xạ tự chủ bất thường"],
    [/\bemotion regulation\b/gi, "điều hòa cảm xúc"],
    [/\bmood regulation\b/gi, "điều hòa khí sắc"],
    [/\bacute substance withdrawal syndrome\b/gi, "hội chứng cai chất cấp tính"],
    [/\bmoral distress\b/gi, "khổ tâm đạo đức"],
    [/\bspiritual well-being\b/gi, "an lạc tâm linh"],
    [/\breligiosity\b/gi, "tín ngưỡng tôn giáo"],
    [/\bimmune response\b/gi, "đáp ứng miễn dịch"],
    [/\bsurgical wound infection\b/gi, "nhiễm trùng vết mổ"],
    [/\binfection\b/gi, "nhiễm trùng"],
    [/\bphysical injury\b/gi, "tổn thương vật lý"],
    [/\bburn injury\b/gi, "tổn thương bỏng"],
    [/\bcold injury\b/gi, "tổn thương do lạnh"],
    [/\bcorneal injury\b/gi, "tổn thương giác mạc"],
    [/\bdry eye\b/gi, "khô mắt"],
    [/\bperioperative positioning injury\b/gi, "tổn thương do tư thế chu phẫu"],
    [/\bneonatal pressure injury\b/gi, "tổn thương do tỳ đè ở trẻ sơ sinh"],
    [/\bchild pressure injury\b/gi, "tổn thương do tỳ đè ở trẻ em"],
    [/\badult pressure injury\b/gi, "tổn thương do tỳ đè ở người lớn"],
    [/\bpressure injury\b/gi, "tổn thương do tỳ đè"],
    [/\burinary tract injury\b/gi, "tổn thương đường tiết niệu"],
    [/\btissue integrity\b/gi, "tính toàn vẹn của mô"],
    [/\bskin integrity\b/gi, "tính toàn vẹn của da"],
    [/\bnipple-areolar complex integrity\b/gi, "tính toàn vẹn phức hợp núm vú - quầng vú"],
    [/\boral mucous membrane integrity\b/gi, "tính toàn vẹn niêm mạc miệng"],
    [/\bchild falls\b/gi, "té ngã ở trẻ em"],
    [/\badult falls\b/gi, "té ngã ở người lớn"],
    [/\baspiration\b/gi, "hít sặc"],
    [/\bairway clearance\b/gi, "làm sạch đường thở"],
    [/\baccidental suffocation\b/gi, "ngạt thở do tai nạn"],
    [/\bbleeding\b/gi, "chảy máu"],
    [/\bshock\b/gi, "sốc"],
    [/\bthrombosis\b/gi, "huyết khối"],
    [/\bperipheral neurovascular function\b/gi, "chức năng thần kinh - mạch máu ngoại vi"],
    [/\bsudden infant death\b/gi, "đột tử ở trẻ nhũ nhi"],
    [/\belopement attempt\b/gi, "hành vi trốn viện"],
    [/\bother-directed violence\b/gi, "bạo lực hướng tới người khác"],
    [/\bfemale genital mutilation\b/gi, "cắt bỏ bộ phận sinh dục nữ"],
    [/\bsuicidal self-injurious behavior\b/gi, "hành vi tự gây thương tích có ý định tự sát"],
    [/\bnon-suicidal self-injurious behavior\b/gi, "hành vi tự gây thương tích không nhằm tự sát"],
    [/\bcontamination\b/gi, "nhiễm độc / ô nhiễm"],
    [/\baccidental poisoning\b/gi, "ngộ độc do tai nạn"],
    [/\boccupational illness\b/gi, "bệnh nghề nghiệp"],
    [/\boccupational physical injury\b/gi, "chấn thương nghề nghiệp"],
    [/\ballergic reaction\b/gi, "phản ứng dị ứng"],
    [/\blatex allergy reaction\b/gi, "phản ứng dị ứng nhựa latex"],
    [/\bthermoregulation\b/gi, "điều hòa thân nhiệt"],
    [/\bneonatal body temperature\b/gi, "thân nhiệt trẻ sơ sinh"],
    [/\bperioperative body temperature\b/gi, "thân nhiệt chu phẫu"],
    [/\bbody temperature\b/gi, "thân nhiệt"],
    [/\bhyperthermia\b/gi, "tăng thân nhiệt"],
    [/\bphysical comfort\b/gi, "sự thoải mái thể chất"],
    [/\bend-of-life comfort syndrome\b/gi, "hội chứng thoải mái giai đoạn cuối đời"],
    [/\bacute pain\b/gi, "đau cấp tính"],
    [/\bchronic pain syndrome\b/gi, "hội chứng đau mạn tính"],
    [/\bchronic pain\b/gi, "đau mạn tính"],
    [/\blabor pain\b/gi, "đau chuyển dạ"],
    [/\bsocial comfort\b/gi, "sự thoải mái xã hội"],
    [/\bsocial connectedness\b/gi, "kết nối xã hội"],
    [/\bsocial support network\b/gi, "mạng lưới hỗ trợ xã hội"],
    [/\bloneliness\b/gi, "sự cô đơn"],
    [/\bpsychological comfort\b/gi, "sự thoải mái tâm lý"],
    [/\bchild growth\b/gi, "tăng trưởng ở trẻ em"],
    [/\bchild development\b/gi, "phát triển ở trẻ em"],
    [/\binfant motor development\b/gi, "phát triển vận động trẻ nhũ nhi"],
    [/\binfant neurodevelopmental organization\b/gi, "tổ chức phát triển thần kinh trẻ nhũ nhi"],
    [/\binfant suck-swallow response\b/gi, "phản xạ mút - nuốt ở trẻ nhũ nhi"],
    // Các từ vựng NOC & NIC bổ sung
    [/\bmanagement\b/gi, "quản lý"],
    [/\bmonitoring\b/gi, "theo dõi"],
    [/\bcare\b/gi, "chăm sóc"],
    [/\btherapy\b/gi, "liệu pháp"],
    [/\bpromotion\b/gi, "thúc đẩy"],
    [/\bprevention\b/gi, "phòng ngừa"],
    [/\bsupport\b/gi, "hỗ trợ"],
    [/\bassistance\b/gi, "trợ giúp"],
    [/\benhancement\b/gi, "tăng cường"],
    [/\badministration\b/gi, "thực hiện"],
    [/\bprecautions\b/gi, "biện pháp phòng ngừa"],
    [/\bseverity\b/gi, "mức độ nặng"],
    [/\bstatus\b/gi, "tình trạng"],
    [/\blevel\b/gi, "mức độ"],
    [/\bcontrol\b/gi, "kiểm soát"],
    [/\bbehavior\b/gi, "hành vi"],
    [/\bfunction\b/gi, "chức năng"],
    [/\brecovery\b/gi, "hồi phục"],
    [/\bbalance\b/gi, "cân bằng"],
    [/\bpain\b/gi, "đau"],
    [/\bnutrition\b/gi, "dinh dưỡng"],
    [/\bwound\b/gi, "vết thương"],
    [/\bskin\b/gi, "da"],
    [/\bairway\b/gi, "đường thở"],
    [/\bfluid\b/gi, "dịch"],
    [/\belectrolyte\b/gi, "điện giải"],
    [/\bcardiac\b/gi, "tim mạch"],
    [/\brespiratory\b/gi, "hô hấp"],
    [/\burinary\b/gi, "tiết niệu"],
    [/\bbowel\b/gi, "đại tiện / ruột"],
    [/\bsleep\b/gi, "giấc ngủ"],
    [/\bfall\b/gi, "té ngã"],
    [/\bfamily\b/gi, "gia đình"],
    [/\bcommunity\b/gi, "cộng đồng"],
    [/\bpatient\b/gi, "người bệnh"],
    [/\bmedication\b/gi, "thuốc"],
    [/\beducation\b/gi, "giáo dục"],
    [/\bcounseling\b/gi, "tư vấn"]
  ];

  for (const [regex, replacement] of wordReplacements) {
    s = s.replace(regex, replacement);
  }

  return s.charAt(0).toUpperCase() + s.slice(1);
}

export interface ViLabel {
  text: string;
  /** True when a catalog label is owner-reviewed or is curated; false for a rule-based fallback. */
  curated: boolean;
}

export function translateVi(code: string | null, enText: string): ViLabel {
  if (code) {
    const exact = CATALOG_EXACT.get(code + '\u0000' + enText);
    if (exact) return {
      text: exact.labelVi,
      curated: OWNER_REVIEW?.status === 'confirmed-by-project-owner' || exact.translationMethod !== 'rule-draft',
    };
  }
  if (LABEL_VI[enText]) return { text: LABEL_VI[enText], curated: true };
  // Giữ bản dịch cho kế hoạch NIC 7 cũ mà không đưa bản NIC 7 vào danh mục mới.
  if (code && NIC7_LEGACY_LABELS[code] === enText) {
    const current = SHARED_CATALOG.entries.find(x => x.system === 'nic' && x.code === code);
    return { text: current?.labelVi ?? RETIRED_NIC7[code]?.labelVi ?? enText, curated: true };
  }
  if (code && VI_TERM_TRANSLATIONS[code]) return { text: VI_TERM_TRANSLATIONS[code], curated: true };
  if (CLINICAL_PHRASE_VI[enText]) return { text: CLINICAL_PHRASE_VI[enText], curated: true };
  if (CLASS_NAME_VI[enText]) return { text: CLASS_NAME_VI[enText], curated: true };
  return { text: autoTranslateVi(code, enText), curated: false };
}
