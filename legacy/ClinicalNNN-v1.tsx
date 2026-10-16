import React, { useState, useMemo } from 'react';
import {
  Activity,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Code2,
  Copy,
  Download,
  Edit3,
  FileJson,
  Filter,
  HeartPulse,
  Info,
  Layers,
  Plus,
  RefreshCw,
  Scale,
  Search,
  ShieldAlert,
  Sliders,
  Sparkles,
  Stethoscope,
  Trash2,
  User,
  ArrowRight,
  AlertTriangle,
  Check,
  Database,
  Hash,
  FileText,
  X,
  Globe,
  TrendingUp,
  Award,
  CheckSquare,
  BarChart3,
  Eye,
  LayoutGrid
} from 'lucide-react';

// ============================================================================
// 0. TỪ ĐIỂN SONG NGỮ (VIETNAMESE & ENGLISH UI DICTIONARY)
// ============================================================================

const UI_TEXT = {
  vi: {
    appTitle: "Hệ thống Dữ liệu Số Điều dưỡng NNN & KHCS Điện tử",
    appSubtitle: "Chuẩn hóa Bệnh án Điện tử (EHR) • NANDA-I (2024–2026) • NOC (6th Ed) • NIC (7th Ed)",
    ehrBadge: "Chuẩn EHR Quốc tế",
    langLabel: "Ngôn ngữ",
    statsNanda: "Chẩn đoán NANDA-I",
    statsNoc: "Kết quả NOC",
    statsNic: "Can thiệp NIC",
    statsUpdates: "Cập nhật 2024–2026",
    tabs: {
      careplan: "Kế hoạch Chăm sóc (KHCS)",
      taxonomy: "Thư viện Danh mục NNN",
      migration: "Chuyển đổi NANDA-I 2024–2026",
      standards: "Quy chuẩn Mã hóa & Thang đo"
    },
    careplan: {
      patientProfile: "Hồ sơ Lâm sàng Người bệnh",
      patientSubtitle: "Dữ liệu ca lâm sàng chuẩn hóa liên kết bộ ba NANDA-I, NOC, NIC",
      visualMode: "Bố cục Lâm sàng",
      splitMode: "Song song (Visual + JSON)",
      jsonMode: "Mã nguồn JSON EHR",
      addEntryBtn: "Thêm Liên kết NNN",
      copyJsonBtn: "Sao chép JSON",
      exportJsonBtn: "Tải tệp .JSON",
      patientName: "Họ và tên bệnh nhân",
      ageGender: "Tuổi & Giới tính",
      male: "Nam",
      female: "Nữ",
      height: "Chiều cao (cm)",
      weight: "Cân nặng (kg)",
      bmiAuto: "Chỉ số BMI (Tự động)",
      underweight: "Thiếu cân",
      normalWeight: "Bình thường",
      overweight: "Thừa cân",
      medicalDiag: "Chẩn đoán Y khoa (Bệnh lý kèm theo)",
      summaryProgress: "Tổng quan Tiến triển Kết quả Chăm sóc (NOC)",
      priority: "ƯU TIÊN",
      linkageHeader: "Chuỗi Liên kết Chẩn đoán – Kết quả – Can thiệp",
      deleteEntry: "Xóa mục chăm sóc này",
      nandaBadge: "1. Chẩn đoán NANDA-I (2024–2026)",
      nocBadge: "2. Kết quả Đầu ra NOC (6th Ed)",
      nicBadge: "3. Can thiệp Điều dưỡng NIC (7th Ed)",
      domainLabel: "Lĩnh vực (Domain)",
      classLabel: "Phân lớp (Class)",
      definingChar: "Đặc điểm xác định (Triệu chứng)",
      relatedFactors: "Yếu tố liên quan / Nguy cơ",
      likertTitle: "Đánh giá Thang điểm Định lượng Likert (1–5)",
      baseline: "Điểm ban đầu (Baseline)",
      target: "Điểm mục tiêu (Target)",
      postIntervention: "Sau can thiệp (Actual)",
      changeScore: "Mức cải thiện",
      indicatorsTitle: "Chỉ số Đo lường Cụ thể (Indicators)",
      scoreLabel: "Điểm",
      nicCountLabel: "Danh mục Can thiệp đã chọn",
      nicActivityTag: "Hoạt động điều dưỡng cụ thể",
      noActivities: "Áp dụng quy trình can thiệp tiêu chuẩn theo mã NIC",
      jsonHeader: "Cấu trúc Dữ liệu Số JSON Chuẩn Tích hợp Bệnh án Điện tử (EHR)"
    },
    taxonomy: {
      title: "Thư viện Tra cứu Danh mục Phân loại Điều dưỡng NNN",
      subtitle: "Tra cứu nhanh mã định danh, phân lớp và chuyển trực tiếp vào Kế hoạch chăm sóc",
      nandaTab: "NANDA-I 2024–2026",
      nocTab: "NOC 6th Edition",
      nicTab: "NIC 7th Edition",
      diagnosesUnit: "Chẩn đoán",
      outcomesUnit: "Kết quả",
      interventionsUnit: "Can thiệp",
      copySystemJson: "Sao chép JSON Phân hệ",
      searchPlaceholderNanda: "Tìm theo mã NANDA 5 số (VD: 00312, 00132) hoặc tên chẩn đoán (Anh/Việt)...",
      searchPlaceholderNoc: "Tìm theo mã NOC 4 số (VD: 1101, 2102) hoặc tên kết quả đầu ra...",
      searchPlaceholderNic: "Tìm theo mã NIC 4 số (VD: 3520, 1410, 6490) hoặc tên can thiệp...",
      allNandaDomains: "Tất cả 13 Lĩnh vực NANDA-I",
      allNocDomains: "Tất cả 7 Lĩnh vực NOC",
      showingResults: "Hiển thị",
      resultsUnit: "danh mục chuẩn hóa",
      nandaFormatNote: "Mã 5 chữ số • Cấu trúc đa trục (8 Axes)",
      nocFormatNote: "Mã 4 chữ số • Đánh giá Likert 1–5",
      nicFormatNote: "Mã 4 chữ số + Hoạt động (.01–.99)",
      selectForCarePlan: "Đưa vào KHCS",
      copyCode: "Sao chép mã"
    },
    migration: {
      bannerTitle: "Công cụ Ánh xạ & Kiểm toán Dữ liệu NANDA-I 13th Edition (2024–2026)",
      bannerDesc: "Hỗ trợ nâng cấp cơ sở dữ liệu bệnh viện từ phiên bản cũ lên bản 2024–2026: Tra cứu 98 nhãn chẩn đoán đổi tên (Bảng 6.3), 46 chẩn đoán ngừng sử dụng (Bảng 6.4) và kiểm tra mã tự động.",
      copy98Btn: "Copy JSON 98 Đổi tên",
      copy46Btn: "Copy JSON 46 Loại bỏ",
      tabRenamed: "98 Nhãn Chẩn đoán Đổi tên",
      tabRetired: "46 Chẩn đoán Ngừng sử dụng (Retired)",
      tabChecker: "Kiểm tra Nhanh Mã / Nhãn Cũ",
      allDomains: "Tất cả Lĩnh vực (Domains 1–13)",
      searchRenamedPlaceholder: "Nhập tên chẩn đoán cũ (VD: Anxiety, Nausea, Deficient knowledge) hoặc mã mới...",
      searchRetiredPlaceholder: "Nhập mã cũ hoặc tên chẩn đoán đã loại bỏ (VD: 00011, Constipation, Diarrhea, Insomnia)...",
      colDomain: "Lĩnh vực (Domain)",
      colOldLabel: "Nhãn Chẩn đoán Cũ (Trước 2024)",
      colArrow: "Ánh xạ",
      colNewLabel: "Nhãn Chuẩn Mới NANDA-I (2024–2026)",
      colNewCode: "Mã Mới",
      colRetiredCode: "Mã Đã Loại bỏ",
      colRetiredLabel: "Nhãn Chẩn đoán Cũ",
      colOldLocation: "Vị trí Cũ (Domain / Class)",
      colStatus: "Trạng thái 2024–2026",
      fromDomain: "Chuyển từ Domain",
      retiredStatusBadge: "Ngừng sử dụng (Retired)",
      checkerTitle: "Trình Kiểm tra & Chẩn đoán Tính Hợp lệ NANDA-I 2024–2026",
      checkerSubtitle: "Nhập bất kỳ mã số (VD: 00011, 00312) hoặc thuật ngữ tiếng Anh (VD: Anxiety, Constipation, Acute pain) để kiểm tra trạng thái hiệu lực.",
      checkerPlaceholder: "Nhập mã 5 chữ số hoặc tên chẩn đoán cần kiểm tra...",
      statusActive: "ĐANG HIỆU LỰC (Active 2024–2026)",
      statusRenamed: "ĐÃ ĐỔI TÊN NHÃN (Label Updated 2024–2026)",
      statusRetired: "ĐÃ LOẠI BỎ (Retired trong bản 2024–2026)"
    },
    standards: {
      schemaTitle: "Quy chuẩn Mã hóa Dữ liệu Số (Coding Schema) của Hệ thống NNN",
      scaleTitle: "Bộ 13 Thang đo Định lượng Chuẩn của NOC (Likert 1–5 Measurement Scales)",
      scaleSubtitle: "Quy tắc chuẩn NOC: Điểm 1 luôn biểu thị trạng thái lâm sàng suy giảm/kém nhất và Điểm 5 luôn là trạng thái mong muốn tốt nhất.",
      simulatorTitle: "Bộ Mô phỏng Quy đổi Điểm Likert (Interactive Scale Simulator)",
      colScaleCode: "Mã Thang đo",
      colMeaning: "Ý nghĩa Đo lường (Definition)",
      pt1: "Điểm 1 (Kém nhất)",
      pt2: "Điểm 2",
      pt3: "Điểm 3 (Trung bình)",
      pt4: "Điểm 4",
      pt5: "Điểm 5 (Tối ưu)",
      domainMapTitle: "Bảng Đối chiếu Cấu trúc 7 Lĩnh vực (Domains) giữa NOC và NIC",
      colCode: "Mã Lĩnh vực",
      colNocDomain: "Lĩnh vực Kết quả Đầu ra NOC (7 Domains • 34 Classes)",
      colNicDomain: "Lĩnh vực Can thiệp Điều dưỡng NIC (7 Domains • 30 Classes)"
    },
    modal: {
      title: "Thêm Liên kết Chẩn đoán NANDA-I – NOC – NIC vào Kế hoạch Chăm sóc",
      step1: "1. Chọn Chẩn đoán Điều dưỡng NANDA-I (2024–2026)",
      defCharLabel: "Đặc điểm xác định (Defining Characteristic)",
      defCharPlaceholder: "Nhập triệu chứng / dấu hiệu lâm sàng...",
      relFactorLabel: "Yếu tố liên quan / Nguy cơ (Related Factor)",
      relFactorPlaceholder: "Nhập nguyên nhân / yếu tố nguy cơ...",
      step2: "2. Chọn Kết quả Đầu ra NOC (6th Edition)",
      scaleLabel: "Mã Thang đo Định lượng NOC",
      step3: "3. Chọn Can thiệp Điều dưỡng NIC (Nhấn để chọn nhiều mã)",
      cancel: "Hủy bỏ",
      submit: "Lưu vào Kế hoạch Chăm sóc"
    }
  },
  en: {
    appTitle: "Digital NNN Nursing Taxonomy & Electronic Care Plan (EHR)",
    appSubtitle: "Standardized Clinical Database • NANDA-I (2024–2026) • NOC (6th Ed) • NIC (7th Ed)",
    ehrBadge: "EHR Interoperable",
    langLabel: "Language",
    statsNanda: "NANDA-I Diagnoses",
    statsNoc: "NOC Outcomes",
    statsNic: "NIC Interventions",
    statsUpdates: "2024–2026 Updates",
    tabs: {
      careplan: "Electronic Care Plan (EHR)",
      taxonomy: "NNN Taxonomy Explorer",
      migration: "NANDA-I 2024–2026 Migration",
      standards: "Coding Schema & NOC Scales"
    },
    careplan: {
      patientProfile: "Patient Clinical Profile",
      patientSubtitle: "Standardized clinical case study linking NANDA-I, NOC, and NIC taxonomies",
      visualMode: "Clinical View",
      splitMode: "Split View (Visual + JSON)",
      jsonMode: "EHR JSON Schema",
      addEntryBtn: "Add NNN Linkage",
      copyJsonBtn: "Copy JSON",
      exportJsonBtn: "Export .JSON",
      patientName: "Patient Full Name",
      ageGender: "Age & Gender",
      male: "Male",
      female: "Female",
      height: "Height (cm)",
      weight: "Weight (kg)",
      bmiAuto: "BMI Index (Auto)",
      underweight: "Underweight",
      normalWeight: "Normal",
      overweight: "Overweight",
      medicalDiag: "Medical Diagnoses (Comorbidities)",
      summaryProgress: "NOC Outcome Progression Overview",
      priority: "PRIORITY",
      linkageHeader: "Standardized NANDA-I → NOC → NIC Clinical Linkage",
      deleteEntry: "Remove this care plan entry",
      nandaBadge: "1. NANDA-I Diagnosis (2024–2026)",
      nocBadge: "2. NOC Outcome (6th Ed)",
      nicBadge: "3. NIC Interventions (7th Ed)",
      domainLabel: "Domain",
      classLabel: "Class",
      definingChar: "Defining Characteristics (Signs/Symptoms)",
      relatedFactors: "Related / Risk Factors",
      likertTitle: "Quantitative Likert Scale Rating (1–5)",
      baseline: "Baseline Rating",
      target: "Target Rating",
      postIntervention: "Post-Intervention",
      changeScore: "Change Score",
      indicatorsTitle: "Specific Outcome Indicators",
      scoreLabel: "Score",
      nicCountLabel: "Selected Nursing Interventions",
      nicActivityTag: "Nursing Activities",
      noActivities: "Standard NIC intervention protocol applied",
      jsonHeader: "Standardized Electronic Health Record (EHR) NNN Care Plan JSON Schema"
    },
    taxonomy: {
      title: "Standardized NNN Nursing Taxonomy Library",
      subtitle: "Search standardized codes, domains, classes, and add directly to the Electronic Care Plan",
      nandaTab: "NANDA-I 2024–2026",
      nocTab: "NOC 6th Edition",
      nicTab: "NIC 7th Edition",
      diagnosesUnit: "Diagnoses",
      outcomesUnit: "Outcomes",
      interventionsUnit: "Interventions",
      copySystemJson: "Copy System JSON",
      searchPlaceholderNanda: "Search 5-digit NANDA code (e.g., 00312, 00132) or diagnosis label...",
      searchPlaceholderNoc: "Search 4-digit NOC code (e.g., 1101, 2102) or outcome label...",
      searchPlaceholderNic: "Search 4-digit NIC code (e.g., 3520, 1410, 6490) or intervention label...",
      allNandaDomains: "All 13 NANDA-I Domains",
      allNocDomains: "All 7 NOC Domains",
      showingResults: "Showing",
      resultsUnit: "standardized items",
      nandaFormatNote: "5-Digit Code • 8-Axis Multiaxial Structure",
      nocFormatNote: "4-Digit Code • 1–5 Likert Scale",
      nicFormatNote: "4-Digit Code + Activities (.01–.99)",
      selectForCarePlan: "Add to Care Plan",
      copyCode: "Copy Code"
    },
    migration: {
      bannerTitle: "NANDA-I 13th Edition (2024–2026) Database Migration & Audit Tool",
      bannerDesc: "Upgrade hospital EHR systems from legacy editions to NANDA-I 2024–2026: Crosswalk 98 renamed diagnosis labels (Table 6.3), 46 retired diagnoses (Table 6.4), and run live code validation.",
      copy98Btn: "Copy 98 Renamed JSON",
      copy46Btn: "Copy 46 Retired JSON",
      tabRenamed: "98 Renamed Diagnosis Labels",
      tabRetired: "46 Retired Diagnoses",
      tabChecker: "Live Code / Label Validator",
      allDomains: "All Domains (1–13)",
      searchRenamedPlaceholder: "Search legacy label (e.g., Anxiety, Nausea, Deficient knowledge) or new code...",
      searchRetiredPlaceholder: "Search retired code or legacy label (e.g., 00011, Constipation, Diarrhea, Insomnia)...",
      colDomain: "Domain",
      colOldLabel: "Previous Label (Pre-2024)",
      colArrow: "Crosswalk",
      colNewLabel: "New NANDA-I Label (2024–2026)",
      colNewCode: "New Code",
      colRetiredCode: "Retired Code",
      colRetiredLabel: "Retired Diagnosis Label",
      colOldLocation: "Previous Location (Domain / Class)",
      colStatus: "2024–2026 Status",
      fromDomain: "Moved from Domain",
      retiredStatusBadge: "Retired / Discontinued",
      checkerTitle: "Interactive NANDA-I 2024–2026 Code & Term Validator",
      checkerSubtitle: "Type any 5-digit code (e.g., 00011, 00312) or clinical term (e.g., Anxiety, Constipation, Acute pain) to verify its 2024–2026 status.",
      checkerPlaceholder: "Enter 5-digit code or diagnosis term to audit...",
      statusActive: "ACTIVE (Valid in 2024–2026)",
      statusRenamed: "RENAMED (Label Updated in 2024–2026)",
      statusRetired: "RETIRED (Discontinued in 2024–2026)"
    },
    standards: {
      schemaTitle: "NNN Taxonomy Digital Coding Schema & Structure",
      scaleTitle: "13 Standardized NOC Quantitative Measurement Scales (Likert 1–5)",
      scaleSubtitle: "NOC Rule: Rating '1' always represents the most compromised/least desirable state, and '5' represents the most desirable clinical state.",
      simulatorTitle: "Interactive Likert Scale Point Previewer",
      colScaleCode: "Scale Code",
      colMeaning: "Measurement Meaning (Definition)",
      pt1: "Score 1 (Worst)",
      pt2: "Score 2",
      pt3: "Score 3 (Moderate)",
      pt4: "Score 4",
      pt5: "Score 5 (Optimal)",
      domainMapTitle: "Structural Alignment of 7 Domains Between NOC and NIC",
      colCode: "Domain #",
      colNocDomain: "NOC Outcome Domains (7 Domains • 34 Classes)",
      colNicDomain: "NIC Intervention Domains (7 Domains • 30 Classes)"
    },
    modal: {
      title: "Add NANDA-I – NOC – NIC Linkage to Care Plan",
      step1: "1. Select NANDA-I Nursing Diagnosis (2024–2026)",
      defCharLabel: "Defining Characteristic (Signs/Symptoms)",
      defCharPlaceholder: "Enter clinical signs or symptoms...",
      relFactorLabel: "Related / Risk Factor (Etiology)",
      relFactorPlaceholder: "Enter related cause or risk factor...",
      step2: "2. Select NOC Nursing Outcome (6th Edition)",
      scaleLabel: "NOC Measurement Scale Code",
      step3: "3. Select NIC Nursing Interventions (Click to toggle multiple)",
      cancel: "Cancel",
      submit: "Save to Care Plan"
    }
  }
};

// ============================================================================
// 0.1 HỆ THỐNG DỊCH THUẬT Y KHOA TOÀN DIỆN SANG TIẾNG VIỆT (100% VIETNAMESE)
// ============================================================================

const VI_TERM_TRANSLATIONS = {
  // NANDA-I Common & Key Codes
  "00312": "Tổn thương do tỳ đè ở người lớn",
  "00304": "Nguy cơ tổn thương do tỳ đè ở người lớn",
  "00287": "Tổn thương do tỳ đè ở trẻ sơ sinh",
  "00288": "Nguy cơ tổn thương do tỳ đè ở trẻ sơ sinh",
  "00313": "Tổn thương do tỳ đè ở trẻ em",
  "00286": "Nguy cơ tổn thương do tỳ đè ở trẻ em",
  "00132": "Đau cấp tính",
  "00133": "Đau mạn tính",
  "00255": "Hội chứng đau mạn tính",
  "00256": "Đau trong chuyển dạ",
  "00343": "Lượng dinh dưỡng nạp vào không đầy đủ",
  "00409": "Nguy cơ lượng dinh dưỡng nạp vào không đầy đủ",
  "00163": "Sẵn sàng tăng cường lượng dinh dưỡng nạp vào",
  "00359": "Lượng dinh dưỡng protein-năng lượng nạp vào không đầy đủ",
  "00360": "Nguy cơ lượng dinh dưỡng protein-năng lượng nạp vào không đầy đủ",
  "00103": "Suy giảm khả năng nuốt",
  "00030": "Suy giảm trao đổi khí",
  "00031": "Làm sạch đường thở không hiệu quả",
  "00032": "Kiểu thở không hiệu quả",
  "00033": "Suy giảm thông khí tự nhiên",
  "00085": "Suy giảm vận động thể chất",
  "00324": "Nguy cơ suy giảm vận động thể chất",
  "00091": "Suy giảm vận động trên giường",
  "00089": "Suy giảm vận động bằng xe lăn",
  "00363": "Suy giảm khả năng ngồi",
  "00364": "Suy giảm khả năng đứng",
  "00367": "Suy giảm khả năng di chuyển/chuyển tư thế",
  "00365": "Suy giảm khả năng đi lại",
  "00303": "Nguy cơ té ngã ở người lớn",
  "00306": "Nguy cơ té ngã ở trẻ em",
  "00004": "Nguy cơ nhiễm trùng",
  "00500": "Nguy cơ nhiễm trùng vết mổ",
  "00361": "Suy giảm đáp ứng miễn dịch",
  "00400": "Lo âu quá mức",
  "00399": "Lo âu về cái chết quá mức",
  "00390": "Sợ hãi quá mức",
  "00384": "Tự quản lý buồn nôn không hiệu quả",
  "00418": "Tự quản lý cơn đau không hiệu quả",
  "00489": "Nguy cơ tự quản lý đường huyết không hiệu quả",
  "00421": "Thể tích dịch không đầy đủ (Thiếu dịch)",
  "00420": "Nguy cơ thể tích dịch không đầy đủ",
  "00026": "Thể tích dịch quá mức (Thừa dịch)",
  "00370": "Nguy cơ thể tích dịch quá mức",
  "00355": "Hành vi tĩnh tại quá mức",
  "00353": "Hội chứng suy yếu ở người cao tuổi",
  "00357": "Nguy cơ hội chứng suy yếu ở người cao tuổi",
  "00477": "Gánh nặng mệt mỏi quá mức",
  "00435": "Kiến thức sức khỏe không đầy đủ",
  "00044": "Suy giảm tính toàn vẹn của mô",
  "00248": "Nguy cơ suy giảm tính toàn vẹn của mô",
  "00046": "Suy giảm tính toàn vẹn của da",
  "00047": "Nguy cơ suy giảm tính toàn vẹn của da",
  "00007": "Tăng thân nhiệt",
  "00471": "Nguy cơ tăng thân nhiệt",
  "00472": "Giảm thân nhiệt",
  "00473": "Nguy cơ giảm thân nhiệt",
  "00008": "Điều hòa thân nhiệt không hiệu quả",
  "00337": "Kiểu ngủ không hiệu quả",
  "00128": "Lú lẫn cấp tính",
  "00129": "Lú lẫn mạn tính",
  "00051": "Suy giảm giao tiếp bằng lời nói",
  "00235": "Táo bón chức năng mạn tính",
  "00424": "Suy giảm tự chủ đại tiện",
  "00016": "Suy giảm bài tiết nước tiểu",
  "00322": "Nguy cơ bí tiểu",
  // NOC Common
  "1101": "Toàn vẹn mô: Da & Niêm mạc",
  "1102": "Lành vết thương: Kỳ đầu",
  "1103": "Lành vết thương: Kỳ hai",
  "2102": "Mức độ Đau",
  "1605": "Kiểm soát Cơn đau",
  "1004": "Tình trạng Dinh dưỡng",
  "1005": "Tình trạng Dinh dưỡng: Chỉ số Sinh hóa",
  "1007": "Tình trạng Dinh dưỡng: Năng lượng",
  "1008": "Tình trạng Dinh dưỡng: Lượng Thức ăn & Dịch nạp vào",
  "1009": "Tình trạng Dinh dưỡng: Lượng Chất dinh dưỡng nạp vào",
  "1010": "Tình trạng Nuốt",
  "1014": "Cảm giác Ngon miệng",
  "0415": "Tình trạng Hô hấp",
  "0410": "Tình trạng Hô hấp: Thông thoáng Đường thở",
  "0402": "Tình trạng Hô hấp: Trao đổi Khí",
  "0403": "Tình trạng Hô hấp: Thông khí",
  "0802": "Dấu hiệu Sinh tồn",
  "0800": "Điều hòa Thân nhiệt",
  "0208": "Khả năng Vận động",
  "0200": "Đi lại (Ambulation)",
  "0202": "Thăng bằng",
  "0210": "Thực hiện Di chuyển Tư thế",
  "1909": "Hành vi Phòng ngừa Té ngã",
  "1912": "Tần suất Té ngã",
  "1942": "Kiểm soát Nguy cơ: Tổn thương do Tỳ đè",
  "1924": "Kiểm soát Nguy cơ: Quá trình Nhiễm trùng",
  "0601": "Cân bằng Dịch",
  "0602": "Tình trạng Hydrat hóa (Đủ nước)",
  "1211": "Mức độ Lo âu",
  "1210": "Mức độ Sợ hãi",
  "0004": "Giấc ngủ",
  "0007": "Mức độ Mệt mỏi",
  "0300": "Tự chăm sóc: Sinh hoạt Hàng ngày (ADL)",
  // NIC Common
  "3520": "Chăm sóc loét do tỳ đè",
  "3540": "Phòng ngừa loét do tỳ đè",
  "3590": "Giám sát da",
  "3660": "Chăm sóc vết thương",
  "3440": "Chăm sóc vị trí vết mổ",
  "0840": "Tư thế trị liệu (Xoay trở bệnh nhân)",
  "1410": "Quản lý đau: Cấp tính",
  "1415": "Quản lý đau: Mạn tính",
  "2210": "Thực hiện thuốc giảm đau",
  "2300": "Thực hiện thuốc",
  "2304": "Thực hiện thuốc: Đường uống",
  "2314": "Thực hiện thuốc: Đường tĩnh mạch (IV)",
  "2380": "Quản lý thuốc",
  "2400": "Hỗ trợ giảm đau tự kiểm soát (PCA)",
  "1380": "Chườm nóng / Chườm lạnh",
  "1100": "Quản lý dinh dưỡng",
  "1120": "Liệu pháp dinh dưỡng",
  "1160": "Theo dõi dinh dưỡng",
  "1050": "Cho ăn",
  "1056": "Cho ăn qua ống thông tiêu hóa",
  "1860": "Trị liệu nuốt",
  "6490": "Phòng ngừa té ngã",
  "6540": "Kiểm soát nhiễm khuẩn",
  "6550": "Bảo vệ khỏi nhiễm khuẩn",
  "6680": "Theo dõi dấu hiệu sinh tồn",
  "3140": "Quản lý đường thở",
  "3160": "Hút đờm đường thở",
  "3200": "Phòng ngừa hít sặc",
  "3320": "Liệu pháp oxy",
  "3350": "Theo dõi hô hấp",
  "4120": "Quản lý dịch",
  "4130": "Theo dõi dịch",
  "4200": "Liệu pháp truyền tĩnh mạch (IV)",
  "5820": "Giảm lo âu",
  "5270": "Hỗ trợ tâm lý / cảm xúc",
  "1800": "Hỗ trợ tự chăm sóc",
  "1850": "Tăng cường giấc ngủ"
};

// Bản dịch chuẩn cho toàn bộ câu chữ lâm sàng trong KHCS mẫu & Modal
const CLINICAL_PHRASE_VI = {
  // Bệnh lý y khoa
  "Stage IV Esophageal Cancer": "Ung thư thực quản giai đoạn IV",
  "Hypertension": "Tăng huyết áp",
  "Type 2 Diabetes Mellitus": "Đái tháo đường típ 2",
  "Pneumonia": "Viêm phổi",
  "Chronic Kidney Disease": "Bệnh thận mạn tính",
  // Domains & Classes trong KHCS
  "11 - Safety / protection": "11 - An toàn / bảo vệ",
  "2 - Physical injury": "2 - Tổn thương vật lý",
  "12 - Comfort": "12 - Sự thoải mái",
  "1 - Physical comfort": "1 - Sự thoải mái thể chất",
  "II - Physiologic Health": "II - Sức khỏe Sinh lý",
  "L - Tissue Integrity": "L - Toàn vẹn Mô",
  "V - Perceived Health": "V - Sức khỏe Cảm nhận",
  "V - Symptom Status": "V - Tình trạng Triệu chứng",
  // Đặc điểm xác định & Yếu tố liên quan
  "Non-blanchable erythema in sacral region (3 sq cm)": "Ban đỏ ấn không mất màu tại vùng cùng cụt (diện tích 3 cm²)",
  "Pressure over bony prominence": "Áp lực tỳ đè lên vùng lồi xương",
  "Spending more time lying on the couch (mostly sedentary)": "Nằm nhiều trên ghế dài (lối sống tĩnh tại, ít vận động)",
  "Underweight (BMI 18.4)": "Thiếu cân (Chỉ số BMI 18.4)",
  "Verbal report of severe pain in lower back and hips (NRS 6/10)": "Bệnh nhân than đau nhiều vùng thắt lưng và hai bên hông (Thang điểm đau NRS 6/10)",
  "Inadequate appetite": "Ăn uống kém, chán ăn",
  "Physical injury agent": "Tác nhân gây tổn thương thực thể",
  "Food intake less than recommended daily allowance": "Lượng thức ăn nạp vào thấp hơn nhu cầu khuyến nghị hàng ngày",
  "Difficulty swallowing and decreased appetite": "Khó nuốt và giảm cảm giác thèm ăn",
  // Chỉ số NOC (Indicators)
  "1103 - Wound Healing: Secondary Intention": "1103 - Lành vết thương: Kỳ hai",
  "2102 - Pain Level": "2102 - Mức độ Đau",
  "Granulation": "Mô hạt phát triển",
  "Surrounding skin erythema": "Ban đỏ vùng da xung quanh",
  "Reported pain": "Mức độ đau do người bệnh báo cáo",
  // Hoạt động điều dưỡng NIC (Activities)
  "Monitor tissue for skin integrity and erythema": "Theo dõi mô để đánh giá độ toàn vẹn của da và tình trạng ban đỏ",
  "Facilitate use of a pressure-relieving mattress": "Hỗ trợ sử dụng đệm giảm áp lực chống loét",
  "Inspect skin over bony prominences daily": "Kiểm tra da tại các vùng lồi xương hàng ngày",
  "Turn and reposition patient at least every 2 hours": "Xoay trở và thay đổi tư thế cho người bệnh ít nhất mỗi 2 giờ/lần",
  "Perform a comprehensive assessment of pain (location, onset, duration, intensity)": "Thực hiện đánh giá đau toàn diện (vị trí, khởi phát, thời gian kéo dài, cường độ)",
  "Determine analgesic selections based on type and severity of pain": "Xác định lựa chọn thuốc giảm đau dựa trên loại đau và mức độ nghiêm trọng của cơn đau"
};

// Bản dịch cho các Class của NANDA và NOC
const CLASS_NAME_VI = {
  "Class 1 Health awareness": "Phân lớp 1: Nhận thức sức khỏe",
  "Class 2 Health management": "Phân lớp 2: Quản lý sức khỏe",
  "Class 1 Ingestion": "Phân lớp 1: Thu nhận thức ăn",
  "Class 2 Digestion": "Phân lớp 2: Tiêu hóa",
  "Class 3 Absorption": "Phân lớp 3: Hấp thu",
  "Class 4 Metabolism": "Phân lớp 4: Chuyển hóa",
  "Class 5 Hydration": "Phân lớp 5: Hydrat hóa (Cân bằng dịch)",
  "Class 1 Urinary function": "Phân lớp 1: Chức năng tiết niệu",
  "Class 2 Gastrointestinal function": "Phân lớp 2: Chức năng tiêu hóa",
  "Class 3 Integumentary function": "Phân lớp 3: Chức năng hệ da",
  "Class 4 Respiratory function": "Phân lớp 4: Chức năng hô hấp",
  "Class 1 Sleep rest": "Phân lớp 1: Giấc ngủ / Nghỉ ngơi",
  "Class 2 Activity exercise": "Phân lớp 2: Hoạt động / Tập luyện",
  "Class 3 Energy balance": "Phân lớp 3: Cân bằng năng lượng",
  "Class 4 Cardiovascular pulmonary responses": "Phân lớp 4: Đáp ứng tim mạch / hô hấp",
  "Class 5 Self care": "Phân lớp 5: Tự chăm sóc",
  "Class 1 Attention": "Phân lớp 1: Sự chú ý",
  "Class 2 Orientation": "Phân lớp 2: Định hướng",
  "Class 3 Sensation perception": "Phân lớp 3: Cảm giác / Tri giác",
  "Class 4 Cognition": "Phân lớp 4: Nhận thức",
  "Class 5 Communication": "Phân lớp 5: Giao tiếp",
  "Class 1 Self concept": "Phân lớp 1: Tự quan niệm",
  "Class 2 Self esteem": "Phân lớp 2: Lòng tự trọng",
  "Class 3 Body image": "Phân lớp 3: Hình ảnh cơ thể",
  "Class 1 Caregiving roles": "Phân lớp 1: Vai trò chăm sóc",
  "Class 2 Family relationships": "Phân lớp 2: Mối quan hệ gia đình",
  "Class 3 Role performance": "Phân lớp 3: Thực hiện vai trò",
  "Class 1 Sexual identity": "Phân lớp 1: Bản dạng tính dục",
  "Class 2 Sexual function": "Phân lớp 2: Chức năng tình dục",
  "Class 3 Reproduction": "Phân lớp 3: Sinh sản",
  "Class 1 Post trauma responses": "Phân lớp 1: Đáp ứng sau sang chấn",
  "Class 2 Coping responses": "Phân lớp 2: Đáp ứng đối phó",
  "Class 3 Neurobehavioral responses": "Phân lớp 3: Đáp ứng thần kinh - hành vi",
  "Class 1 Values": "Phân lớp 1: Giá trị",
  "Class 2 Beliefs": "Phân lớp 2: Niềm tin",
  "Class 3 Value belief action congruence": "Phân lớp 3: Sự tương hợp giá trị / niềm tin / hành động",
  "Class 1 Infection": "Phân lớp 1: Nhiễm trùng",
  "Class 2 Physical injury": "Phân lớp 2: Tổn thương vật lý",
  "Class 3 Violence": "Phân lớp 3: Bạo lực",
  "Class 4 Environmental hazards": "Phân lớp 4: Nguy cơ môi trường",
  "Class 5 Defensive processes": "Phân lớp 5: Quá trình phòng vệ",
  "Class 6 Thermoregulation": "Phân lớp 6: Điều hòa thân nhiệt",
  "Class 1 Physical comfort": "Phân lớp 1: Thoải mái thể chất",
  "Class 2 Environmental comfort": "Phân lớp 2: Thoải mái môi trường",
  "Class 3 Social comfort": "Phân lớp 3: Thoải mái xã hội",
  "Class 4 Psychological comfort": "Phân lớp 4: Thoải mái tâm lý",
  "Class 1 Growth": "Phân lớp 1: Tăng trưởng",
  "Class 2 Development": "Phân lớp 2: Phát triển",
  // NOC Classes
  "A Energy Maintenance": "Lớp A: Duy trì Năng lượng",
  "B Growth and Development": "Lớp B: Tăng trưởng và Phát triển",
  "C Mobility": "Lớp C: Vận động",
  "D Self Care": "Lớp D: Tự chăm sóc",
  "E Cardiopulmonary": "Lớp E: Tim phổi",
  "K Digestion and Nutrition": "Lớp K: Tiêu hóa và Dinh dưỡng",
  "F Elimination": "Lớp F: Bài tiết",
  "G Fluid and Electrolytes": "Lớp G: Dịch và Điện giải",
  "H Immune Response": "Lớp H: Đáp ứng Miễn dịch",
  "I Metabolic Regulation": "Lớp I: Điều hòa Chuyển hóa",
  "J Neurocognitive": "Lớp J: Thần kinh - Nhận thức",
  "Y Sensory Function": "Lớp Y: Chức năng Giác quan",
  "AA Therapeutic Response": "Lớp AA: Đáp ứng Điều trị",
  "L Tissue Integrity": "Lớp L: Toàn vẹn Mô",
  "M Psychological Well Being": "Lớp M: An lạc Tâm lý",
  "N Psychosocial Adaptation": "Lớp N: Thích nghi Tâm lý - Xã hội",
  "O Self Control": "Lớp O: Tự kiểm soát",
  "P Social Interaction": "Lớp P: Tương tác Xã hội",
  "Q Health Behavior": "Lớp Q: Hành vi Sức khỏe",
  "R Health Beliefs": "Lớp R: Niềm tin Sức khỏe",
  "FF Health Management": "Lớp FF: Quản lý Sức khỏe",
  "GG Knowledge Health Condition": "Lớp GG: Kiến thức về Tình trạng Bệnh",
  "S Knowledge Health Promotion": "Lớp S: Kiến thức Nâng cao Sức khỏe",
  "T Risk Control": "Lớp T: Kiểm soát Nguy cơ",
  "HH Safety": "Lớp HH: An toàn",
  "U Health and Life Quality": "Lớp U: Chất lượng Sức khỏe và Cuộc sống",
  "EE Satisfaction with Care": "Lớp EE: Sự Hài lòng với Chăm sóc",
  "V Symptom Status": "Lớp V: Tình trạng Triệu chứng",
  "W Family Caregiver Performance": "Lớp W: Thực hiện Chăm sóc của Gia đình",
  "Z Family Member Health Status": "Lớp Z: Tình trạng Sức khỏe Thành viên Gia đình",
  "X Family Well Being": "Lớp X: An lạc Gia đình",
  "DD Parenting": "Lớp DD: Nuôi dạy con cái",
  "CC Community Health Protection": "Lớp CC: Bảo vệ Sức khỏe Cộng đồng",
  "BB Community Well Being": "Lớp BB: An lạc Cộng đồng"
};

// Hàm dịch thông minh mọi thuật ngữ y khoa NANDA-I, NOC, NIC sang Tiếng Việt 100%
function translateMedicalTermToVi(code, enText) {
  if (!enText) return "";
  if (code && VI_TERM_TRANSLATIONS[code]) return VI_TERM_TRANSLATIONS[code];
  if (CLINICAL_PHRASE_VI[enText]) return CLINICAL_PHRASE_VI[enText];
  if (CLASS_NAME_VI[enText]) return CLASS_NAME_VI[enText];

  let s = enText;

  // Cấu trúc câu chuẩn NANDA-I, NOC, NIC
  const prefixRules = [
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
  const wordReplacements = [
    [/diversional activity engagement/gi, "tham gia hoạt động giải trí"],
    [/sedentary behaviors/gi, "hành vi tĩnh tại"],
    [/energy field/gi, "trường năng lượng"],
    [/Imbalanced/gi, "Mất cân bằng"],
    [/family health self-management/gi, "tự quản lý sức khỏe gia đình"],
    [/health self-management/gi, "tự quản lý sức khỏe"],
    [/family health management/gi, "quản lý sức khỏe gia đình"],
    [/community health management/gi, "quản lý sức khỏe cộng đồng"],
    [/blood glucose pattern self-management/gi, "tự quản lý biểu đồ đường huyết"],
    [/dry eye self-management/gi, "tự quản lý khô mắt"],
    [/dry mouth self-management/gi, "tự quản lý khô miệng"],
    [/fatigue self-management/gi, "tự quản lý mệt mỏi"],
    [/lymphedema self-management/gi, "tự quản lý phù bạch mạch"],
    [/nausea self-management/gi, "tự quản lý buồn nôn"],
    [/pain self-management/gi, "tự quản lý cơn đau"],
    [/weight self-management/gi, "tự quản lý cân nặng"],
    [/overweight self-management/gi, "tự quản lý thừa cân"],
    [/underweight self-management/gi, "tự quản lý thiếu cân"],
    [/health maintenance behaviors/gi, "hành vi duy trì sức khỏe"],
    [/home maintenance behaviors/gi, "hành vi duy trì sinh hoạt tại nhà"],
    [/exercise engagement/gi, "tham gia tập luyện"],
    [/health literacy/gi, "hiểu biết thông tin y tế"],
    [/healthy aging/gi, "lão hóa khỏe mạnh"],
    [/elder frailty syndrome/gi, "hội chứng suy yếu ở người cao tuổi"],
    [/frail elderly syndrome/gi, "hội chứng người cao tuổi suy yếu"],
    [/nutritional intake/gi, "lượng dinh dưỡng nạp vào"],
    [/protein energy/gi, "protein-năng lượng"],
    [/exclusive chestfeeding/gi, "nuôi con hoàn toàn bằng sữa mẹ"],
    [/chestfeeding/gi, "cho con bú"],
    [/breastfeeding/gi, "nuôi con bằng sữa mẹ"],
    [/human milk production/gi, "sản xuất sữa mẹ"],
    [/infant feeding dynamics/gi, "động lực ăn uống của trẻ nhũ nhi"],
    [/child eating dynamics/gi, "động lực ăn uống của trẻ em"],
    [/adolescent eating dynamics/gi, "động lực ăn uống của vị thành niên"],
    [/swallowing/gi, "khả năng nuốt"],
    [/neonatal hyperbilirubinemia/gi, "tăng bilirubin máu sơ sinh"],
    [/water-electrolyte balance/gi, "cân bằng nước - điện giải"],
    [/fluid volume balance/gi, "cân bằng thể tích dịch"],
    [/fluid volume/gi, "thể tích dịch"],
    [/urinary elimination/gi, "bài tiết nước tiểu"],
    [/urinary retention/gi, "bí tiểu"],
    [/disability-associated urinary incontinence/gi, "tiểu không tự chủ liên quan khuyết tật"],
    [/mixed urinary incontinence/gi, "tiểu không tự chủ hỗn hợp"],
    [/stress urinary incontinence/gi, "tiểu không tự chủ khi gắng sức"],
    [/urge urinary incontinence/gi, "tiểu không tự chủ gấp"],
    [/urinary incontinence/gi, "tiểu không tự chủ"],
    [/gastrointestinal motility/gi, "nhu động tiêu hóa"],
    [/intestinal elimination/gi, "bài tiết đường ruột"],
    [/chronic functional constipation/gi, "táo bón chức năng mạn tính"],
    [/fecal continence/gi, "tự chủ đại tiện"],
    [/bowel incontinence/gi, "đại tiện không tự chủ"],
    [/gas exchange/gi, "trao đổi khí"],
    [/sleep pattern/gi, "kiểu ngủ"],
    [/sleep hygiene behaviors/gi, "hành vi vệ sinh giấc ngủ"],
    [/physical mobility/gi, "vận động thể chất"],
    [/bed mobility/gi, "vận động trên giường"],
    [/wheelchair mobility/gi, "vận động bằng xe lăn"],
    [/sitting ability/gi, "khả năng ngồi"],
    [/standing ability/gi, "khả năng đứng"],
    [/transferring ability/gi, "khả năng chuyển tư thế"],
    [/walking ability/gi, "khả năng đi lại"],
    [/activity tolerance/gi, "sức chịu đựng hoạt động"],
    [/fatigue burden/gi, "gánh nặng mệt mỏi"],
    [/surgical recovery/gi, "hồi phục sau phẫu thuật"],
    [/cardiovascular function/gi, "chức năng tim mạch"],
    [/imbalanced blood pressure/gi, "mất cân bằng huyết áp"],
    [/cardiac output/gi, "cung lượng tim"],
    [/cerebral tissue perfusion/gi, "tưới máu mô não"],
    [/peripheral tissue perfusion/gi, "tưới máu mô ngoại vi"],
    [/breathing pattern/gi, "kiểu thở"],
    [/spontaneous ventilation/gi, "thông khí tự nhiên"],
    [/child ventilatory weaning response/gi, "đáp ứng cai máy thở ở trẻ em"],
    [/adult ventilatory weaning response/gi, "đáp ứng cai máy thở ở người lớn"],
    [/self-care ability syndrome/gi, "hội chứng khả năng tự chăm sóc"],
    [/self-care abilities/gi, "khả năng tự chăm sóc"],
    [/bathing abilities/gi, "khả năng tự tắm rửa"],
    [/dressing abilities/gi, "khả năng tự mặc quần áo"],
    [/feeding abilities/gi, "khả năng tự ăn uống"],
    [/grooming abilities/gi, "khả năng tự chăm sóc ngoại hình"],
    [/toileting abilities/gi, "khả năng tự đi vệ sinh"],
    [/oral hygiene behaviors/gi, "hành vi vệ sinh răng miệng"],
    [/acute confusion/gi, "lú lẫn cấp tính"],
    [/chronic confusion/gi, "lú lẫn mạn tính"],
    [/impulse control/gi, "kiểm soát xung động"],
    [/thought processes/gi, "quá trình tư duy"],
    [/health knowledge/gi, "kiến thức sức khỏe"],
    [/memory/gi, "trí nhớ"],
    [/emancipated decision-making/gi, "ra quyết định tự chủ"],
    [/decision-making/gi, "ra quyết định"],
    [/verbal communication/gi, "giao tiếp bằng lời nói"],
    [/self-concept/gi, "tự quan niệm bản thân"],
    [/personal identity/gi, "bản sắc cá nhân"],
    [/family identity syndrome/gi, "hội chứng bản sắc gia đình"],
    [/human dignity/gi, "nhân phẩm"],
    [/transgender social identity/gi, "bản dạng xã hội người chuyển giới"],
    [/self-esteem/gi, "lòng tự trọng"],
    [/health self-efficacy/gi, "năng lực tự chủ sức khỏe"],
    [/body image/gi, "hình ảnh cơ thể"],
    [/parenting behaviors/gi, "hành vi làm cha mẹ"],
    [/parental role conflict/gi, "xung đột vai trò làm cha mẹ"],
    [/family interaction patterns/gi, "khuôn mẫu tương tác gia đình"],
    [/family processes/gi, "quá trình gia đình"],
    [/attachment behaviors/gi, "hành vi gắn kết"],
    [/role performance/gi, "thực hiện vai trò"],
    [/intimate partner relationship/gi, "mối quan hệ bạn đời/đối tác"],
    [/social interaction/gi, "tương tác xã hội"],
    [/childbearing process/gi, "quá trình sinh nở"],
    [/sexual function/gi, "chức năng tình dục"],
    [/maternal-fetal dyad/gi, "cặp mẹ - thai nhi"],
    [/post-trauma syndrome/gi, "hội chứng sau sang chấn"],
    [/immigration transition/gi, "chuyển tiếp nhập cư"],
    [/family coping/gi, "đối phó của gia đình"],
    [/community coping/gi, "đối phó của cộng đồng"],
    [/coping/gi, "đối phó"],
    [/caregiving burden/gi, "gánh nặng chăm sóc"],
    [/grieving/gi, "đau buồn / tang chế"],
    [/resilience/gi, "khả năng phục hồi tâm lý"],
    [/hope/gi, "hy vọng"],
    [/self-compassion/gi, "lòng trắc ẩn với bản thân"],
    [/death anxiety/gi, "lo âu về cái chết"],
    [/anxiety/gi, "lo âu"],
    [/fear/gi, "sợ hãi"],
    [/autonomic dysreflexia/gi, "phản xạ tự chủ bất thường"],
    [/emotion regulation/gi, "điều hòa cảm xúc"],
    [/mood regulation/gi, "điều hòa khí sắc"],
    [/acute substance withdrawal syndrome/gi, "hội chứng cai chất cấp tính"],
    [/moral distress/gi, "khổ tâm đạo đức"],
    [/spiritual well-being/gi, "an lạc tâm linh"],
    [/religiosity/gi, "tín ngưỡng tôn giáo"],
    [/immune response/gi, "đáp ứng miễn dịch"],
    [/surgical wound infection/gi, "nhiễm trùng vết mổ"],
    [/infection/gi, "nhiễm trùng"],
    [/physical injury/gi, "tổn thương vật lý"],
    [/burn injury/gi, "tổn thương bỏng"],
    [/cold injury/gi, "tổn thương do lạnh"],
    [/corneal injury/gi, "tổn thương giác mạc"],
    [/dry eye/gi, "khô mắt"],
    [/perioperative positioning injury/gi, "tổn thương do tư thế chu phẫu"],
    [/neonatal pressure injury/gi, "tổn thương do tỳ đè ở trẻ sơ sinh"],
    [/child pressure injury/gi, "tổn thương do tỳ đè ở trẻ em"],
    [/adult pressure injury/gi, "tổn thương do tỳ đè ở người lớn"],
    [/pressure injury/gi, "tổn thương do tỳ đè"],
    [/urinary tract injury/gi, "tổn thương đường tiết niệu"],
    [/tissue integrity/gi, "tính toàn vẹn của mô"],
    [/skin integrity/gi, "tính toàn vẹn của da"],
    [/nipple-areolar complex integrity/gi, "tính toàn vẹn phức hợp núm vú - quầng vú"],
    [/oral mucous membrane integrity/gi, "tính toàn vẹn niêm mạc miệng"],
    [/child falls/gi, "té ngã ở trẻ em"],
    [/adult falls/gi, "té ngã ở người lớn"],
    [/aspiration/gi, "hít sặc"],
    [/airway clearance/gi, "làm sạch đường thở"],
    [/accidental suffocation/gi, "ngạt thở do tai nạn"],
    [/bleeding/gi, "chảy máu"],
    [/shock/gi, "sốc"],
    [/thrombosis/gi, "huyết khối"],
    [/peripheral neurovascular function/gi, "chức năng thần kinh - mạch máu ngoại vi"],
    [/sudden infant death/gi, "đột tử ở trẻ nhũ nhi"],
    [/elopement attempt/gi, "hành vi trốn viện"],
    [/other-directed violence/gi, "bạo lực hướng tới người khác"],
    [/female genital mutilation/gi, "cắt bỏ bộ phận sinh dục nữ"],
    [/suicidal self-injurious behavior/gi, "hành vi tự gây thương tích có ý định tự sát"],
    [/non-suicidal self-injurious behavior/gi, "hành vi tự gây thương tích không nhằm tự sát"],
    [/contamination/gi, "nhiễm độc / ô nhiễm"],
    [/accidental poisoning/gi, "ngộ độc do tai nạn"],
    [/occupational illness/gi, "bệnh nghề nghiệp"],
    [/occupational physical injury/gi, "chấn thương nghề nghiệp"],
    [/allergic reaction/gi, "phản ứng dị ứng"],
    [/latex allergy reaction/gi, "phản ứng dị ứng nhựa latex"],
    [/thermoregulation/gi, "điều hòa thân nhiệt"],
    [/neonatal body temperature/gi, "thân nhiệt trẻ sơ sinh"],
    [/perioperative body temperature/gi, "thân nhiệt chu phẫu"],
    [/body temperature/gi, "thân nhiệt"],
    [/hyperthermia/gi, "tăng thân nhiệt"],
    [/physical comfort/gi, "sự thoải mái thể chất"],
    [/end-of-life comfort syndrome/gi, "hội chứng thoải mái giai đoạn cuối đời"],
    [/acute pain/gi, "đau cấp tính"],
    [/chronic pain syndrome/gi, "hội chứng đau mạn tính"],
    [/chronic pain/gi, "đau mạn tính"],
    [/labor pain/gi, "đau chuyển dạ"],
    [/social comfort/gi, "sự thoải mái xã hội"],
    [/social connectedness/gi, "kết nối xã hội"],
    [/social support network/gi, "mạng lưới hỗ trợ xã hội"],
    [/loneliness/gi, "sự cô đơn"],
    [/psychological comfort/gi, "sự thoải mái tâm lý"],
    [/child growth/gi, "tăng trưởng ở trẻ em"],
    [/child development/gi, "phát triển ở trẻ em"],
    [/infant motor development/gi, "phát triển vận động trẻ nhũ nhi"],
    [/infant neurodevelopmental organization/gi, "tổ chức phát triển thần kinh trẻ nhũ nhi"],
    [/infant suck-swallow response/gi, "phản xạ mút - nuốt ở trẻ nhũ nhi"],
    // Các từ vựng NOC & NIC bổ sung
    [/management/gi, "quản lý"],
    [/monitoring/gi, "theo dõi"],
    [/care/gi, "chăm sóc"],
    [/therapy/gi, "liệu pháp"],
    [/promotion/gi, "thúc đẩy"],
    [/prevention/gi, "phòng ngừa"],
    [/support/gi, "hỗ trợ"],
    [/assistance/gi, "trợ giúp"],
    [/enhancement/gi, "tăng cường"],
    [/administration/gi, "thực hiện"],
    [/precautions/gi, "biện pháp phòng ngừa"],
    [/severity/gi, "mức độ nặng"],
    [/status/gi, "tình trạng"],
    [/level/gi, "mức độ"],
    [/control/gi, "kiểm soát"],
    [/behavior/gi, "hành vi"],
    [/function/gi, "chức năng"],
    [/recovery/gi, "hồi phục"],
    [/balance/gi, "cân bằng"],
    [/pain/gi, "đau"],
    [/nutrition/gi, "dinh dưỡng"],
    [/wound/gi, "vết thương"],
    [/skin/gi, "da"],
    [/airway/gi, "đường thở"],
    [/fluid/gi, "dịch"],
    [/electrolyte/gi, "điện giải"],
    [/cardiac/gi, "tim mạch"],
    [/respiratory/gi, "hô hấp"],
    [/urinary/gi, "tiết niệu"],
    [/bowel/gi, "đại tiện / ruột"],
    [/sleep/gi, "giấc ngủ"],
    [/fall/gi, "té ngã"],
    [/family/gi, "gia đình"],
    [/community/gi, "cộng đồng"],
    [/patient/gi, "người bệnh"],
    [/medication/gi, "thuốc"],
    [/education/gi, "giáo dục"],
    [/counseling/gi, "tư vấn"]
  ];

  for (const [regex, replacement] of wordReplacements) {
    s = s.replace(regex, replacement);
  }

  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ============================================================================
// 1. DỮ LIỆU CHUẨN HÓA NNN (NANDA-I 2024-2026, NOC 6th, NIC 7th)
// ============================================================================

const NANDA_DOMAINS_META = [
  { id: 'Domain_1_Health_promotion', number: 1, nameEn: 'Health promotion', nameVi: 'Nâng cao sức khỏe', classesCount: 2 },
  { id: 'Domain_2_Nutrition', number: 2, nameEn: 'Nutrition', nameVi: 'Dinh dưỡng', classesCount: 5 },
  { id: 'Domain_3_Elimination_and_exchange', number: 3, nameEn: 'Elimination and exchange', nameVi: 'Bài tiết và trao đổi', classesCount: 4 },
  { id: 'Domain_4_Activity_rest', number: 4, nameEn: 'Activity / rest', nameVi: 'Hoạt động / nghỉ ngơi', classesCount: 5 },
  { id: 'Domain_5_Perception_cognition', number: 5, nameEn: 'Perception / cognition', nameVi: 'Nhận thức / tri giác', classesCount: 5 },
  { id: 'Domain_6_Self_perception', number: 6, nameEn: 'Self-perception', nameVi: 'Tự nhận thức', classesCount: 3 },
  { id: 'Domain_7_Role_relationship', number: 7, nameEn: 'Role relationship', nameVi: 'Vai trò mối quan hệ', classesCount: 3 },
  { id: 'Domain_8_Sexuality', number: 8, nameEn: 'Sexuality', nameVi: 'Tình dục', classesCount: 3 },
  { id: 'Domain_9_Coping_stress_tolerance', number: 9, nameEn: 'Coping / stress tolerance', nameVi: 'Đối phó / chịu đựng căng thẳng', classesCount: 3 },
  { id: 'Domain_10_Life_principles', number: 10, nameEn: 'Life principles', nameVi: 'Nguyên tắc sống', classesCount: 3 },
  { id: 'Domain_11_Safety_protection', number: 11, nameEn: 'Safety / protection', nameVi: 'An toàn / bảo vệ', classesCount: 6 },
  { id: 'Domain_12_Comfort', number: 12, nameEn: 'Comfort', nameVi: 'Sự thoải mái', classesCount: 4 },
  { id: 'Domain_13_Growth_development', number: 13, nameEn: 'Growth / development', nameVi: 'Tăng trưởng / phát triển', classesCount: 2 }
];

const NANDA_DATA = {
  Domain_1_Health_promotion: {
    Class_1_Health_awareness: [
      { code: "00097", label: "Decreased diversional activity engagement" },
      { code: "00404", label: "Risk for decreased diversional activity engagement" },
      { code: "00355", label: "Excessive sedentary behaviors" },
      { code: "00394", label: "Risk for excessive sedentary behaviors" },
      { code: "00273", label: "Imbalanced energy field" }
    ],
    Class_2_Health_management: [
      { code: "00276", label: "Ineffective health self-management" },
      { code: "00369", label: "Risk for ineffective health self-management" },
      { code: "00293", label: "Readiness for enhanced health self-management" },
      { code: "00080", label: "Ineffective family health management" },
      { code: "00410", label: "Risk for ineffective family health management" },
      { code: "00356", label: "Ineffective community health management" },
      { code: "00413", label: "Risk for ineffective community health management" },
      { code: "00489", label: "Risk for ineffective blood glucose pattern self-management" },
      { code: "00277", label: "Ineffective dry eye self-management" },
      { code: "00352", label: "Ineffective dry mouth self-management" },
      { code: "00412", label: "Risk for ineffective dry mouth self-management" },
      { code: "00397", label: "Ineffective fatigue self-management" },
      { code: "00278", label: "Ineffective lymphedema self-management" },
      { code: "00281", label: "Risk for ineffective lymphedema self-management" },
      { code: "00384", label: "Ineffective nausea self-management" },
      { code: "00418", label: "Ineffective pain self-management" },
      { code: "00447", label: "Readiness for enhanced weight self-management" },
      { code: "00398", label: "Ineffective overweight self-management" },
      { code: "00487", label: "Risk for ineffective overweight self-management" },
      { code: "00485", label: "Ineffective underweight self-management" },
      { code: "00486", label: "Risk for ineffective underweight self-management" },
      { code: "00292", label: "Ineffective health maintenance behaviors" },
      { code: "00395", label: "Risk for ineffective health maintenance behaviors" },
      { code: "00300", label: "Ineffective home maintenance behaviors" },
      { code: "00308", label: "Risk for ineffective home maintenance behaviors" },
      { code: "00309", label: "Readiness for enhanced home maintenance behaviors" },
      { code: "00307", label: "Readiness for enhanced exercise engagement" },
      { code: "00339", label: "Inadequate health literacy" },
      { code: "00411", label: "Risk for inadequate health literacy" },
      { code: "00262", label: "Readiness for enhanced health literacy" },
      { code: "00340", label: "Readiness for enhanced healthy aging" },
      { code: "00353", label: "Elder frailty syndrome" },
      { code: "00357", label: "Risk for elder frailty syndrome" }
    ]
  },
  Domain_2_Nutrition: {
    Class_1_Ingestion: [
      { code: "00343", label: "Inadequate nutritional intake" },
      { code: "00409", label: "Risk for inadequate nutritional intake" },
      { code: "00163", label: "Readiness for enhanced nutritional intake" },
      { code: "00359", label: "Inadequate protein energy nutritional intake" },
      { code: "00360", label: "Risk for inadequate protein energy nutritional intake" },
      { code: "00371", label: "Ineffective chestfeeding" },
      { code: "00408", label: "Risk for ineffective chestfeeding" },
      { code: "00347", label: "Disrupted exclusive chestfeeding" },
      { code: "00382", label: "Risk for disrupted exclusive chestfeeding" },
      { code: "00479", label: "Readiness for enhanced chestfeeding" },
      { code: "00333", label: "Inadequate human milk production" },
      { code: "00334", label: "Risk for inadequate human milk production" },
      { code: "00271", label: "Ineffective infant feeding dynamics" },
      { code: "00270", label: "Ineffective child eating dynamics" },
      { code: "00269", label: "Ineffective adolescent eating dynamics" },
      { code: "00103", label: "Impaired swallowing" }
    ],
    Class_2_Digestion: [],
    Class_3_Absorption: [],
    Class_4_Metabolism: [
      { code: "00194", label: "Neonatal hyperbilirubinemia" },
      { code: "00230", label: "Risk for neonatal hyperbilirubinemia" }
    ],
    Class_5_Hydration: [
      { code: "00491", label: "Risk for impaired water-electrolyte balance" },
      { code: "00492", label: "Risk for impaired fluid volume balance" },
      { code: "00026", label: "Excessive fluid volume" },
      { code: "00370", label: "Risk for excessive fluid volume" },
      { code: "00421", label: "Inadequate fluid volume" },
      { code: "00420", label: "Risk for inadequate fluid volume" }
    ]
  },
  Domain_3_Elimination_and_exchange: {
    Class_1_Urinary_function: [
      { code: "00016", label: "Impaired urinary elimination" },
      { code: "00322", label: "Risk for urinary retention" },
      { code: "00297", label: "Disability-associated urinary incontinence" },
      { code: "00310", label: "Mixed urinary incontinence" },
      { code: "00017", label: "Stress urinary incontinence" },
      { code: "00019", label: "Urge urinary incontinence" },
      { code: "00022", label: "Risk for urge urinary incontinence" }
    ],
    Class_2_Gastrointestinal_function: [
      { code: "00423", label: "Impaired gastrointestinal motility" },
      { code: "00422", label: "Risk for impaired gastrointestinal motility" },
      { code: "00344", label: "Impaired intestinal elimination" },
      { code: "00346", label: "Risk for impaired intestinal elimination" },
      { code: "00235", label: "Chronic functional constipation" },
      { code: "00236", label: "Risk for chronic functional constipation" },
      { code: "00424", label: "Impaired fecal continence" },
      { code: "00345", label: "Risk for impaired fecal continence" }
    ],
    Class_3_Integumentary_function: [],
    Class_4_Respiratory_function: [
      { code: "00030", label: "Impaired gas exchange" }
    ]
  },
  Domain_4_Activity_rest: {
    Class_1_Sleep_rest: [
      { code: "00337", label: "Ineffective sleep pattern" },
      { code: "00402", label: "Risk for ineffective sleep pattern" },
      { code: "00417", label: "Readiness for enhanced sleep pattern" },
      { code: "00323", label: "Ineffective sleep hygiene behaviors" },
      { code: "00403", label: "Risk for ineffective sleep hygiene behaviors" }
    ],
    Class_2_Activity_exercise: [
      { code: "00085", label: "Impaired physical mobility" },
      { code: "00324", label: "Risk for impaired physical mobility" },
      { code: "00091", label: "Impaired bed mobility" },
      { code: "00089", label: "Impaired wheelchair mobility" },
      { code: "00363", label: "Impaired sitting ability" },
      { code: "00364", label: "Impaired standing ability" },
      { code: "00367", label: "Impaired transferring ability" },
      { code: "00365", label: "Impaired walking ability" }
    ],
    Class_3_Energy_balance: [
      { code: "00298", label: "Decreased activity tolerance" },
      { code: "00299", label: "Risk for decreased activity tolerance" },
      { code: "00477", label: "Excessive fatigue burden" },
      { code: "00463", label: "Impaired surgical recovery" },
      { code: "00464", label: "Risk for impaired surgical recovery" }
    ],
    Class_4_Cardiovascular_pulmonary_responses: [
      { code: "00311", label: "Risk for impaired cardiovascular function" },
      { code: "00362", label: "Risk for imbalanced blood pressure" },
      { code: "00240", label: "Risk for decreased cardiac output" },
      { code: "00201", label: "Risk for ineffective cerebral tissue perfusion" },
      { code: "00204", label: "Ineffective peripheral tissue perfusion" },
      { code: "00228", label: "Risk for ineffective peripheral tissue perfusion" },
      { code: "00032", label: "Ineffective breathing pattern" },
      { code: "00033", label: "Impaired spontaneous ventilation" },
      { code: "00431", label: "Impaired child ventilatory weaning response" },
      { code: "00430", label: "Impaired adult ventilatory weaning response" }
    ],
    Class_5_Self_care: [
      { code: "00331", label: "Decreased self-care ability syndrome" },
      { code: "00332", label: "Risk for decreased self-care ability syndrome" },
      { code: "00442", label: "Readiness for enhanced self-care abilities" },
      { code: "00326", label: "Decreased bathing abilities" },
      { code: "00327", label: "Decreased dressing abilities" },
      { code: "00328", label: "Decreased feeding abilities" },
      { code: "00330", label: "Decreased grooming abilities" },
      { code: "00329", label: "Decreased toileting abilities" },
      { code: "00375", label: "Ineffective oral hygiene behaviors" },
      { code: "00414", label: "Risk for ineffective oral hygiene behaviors" }
    ]
  },
  Domain_5_Perception_cognition: {
    Class_1_Attention: [],
    Class_2_Orientation: [],
    Class_3_Sensation_perception: [],
    Class_4_Cognition: [
      { code: "00128", label: "Acute confusion" },
      { code: "00173", label: "Risk for acute confusion" },
      { code: "00129", label: "Chronic confusion" },
      { code: "00222", label: "Ineffective impulse control" },
      { code: "00493", label: "Disrupted thought processes" },
      { code: "00435", label: "Inadequate health knowledge" },
      { code: "00499", label: "Readiness for enhanced health knowledge" },
      { code: "00131", label: "Impaired memory" },
      { code: "00429", label: "Impaired decision-making" },
      { code: "00184", label: "Readiness for enhanced decision-making" },
      { code: "00242", label: "Impaired emancipated decision-making" },
      { code: "00244", label: "Risk for impaired emancipated decision-making" },
      { code: "00243", label: "Readiness for enhanced emancipated decision-making" }
    ],
    Class_5_Communication: [
      { code: "00051", label: "Impaired verbal communication" },
      { code: "00434", label: "Risk for impaired verbal communication" },
      { code: "00468", label: "Readiness for enhanced verbal communication" }
    ]
  },
  Domain_6_Self_perception: {
    Class_1_Self_concept: [
      { code: "00167", label: "Readiness for enhanced self-concept" },
      { code: "00494", label: "Disrupted personal identity" },
      { code: "00495", label: "Disrupted family identity syndrome" },
      { code: "00496", label: "Risk for disrupted family identity syndrome" },
      { code: "00488", label: "Risk for impaired human dignity" },
      { code: "00341", label: "Readiness for enhanced transgender social identity" }
    ],
    Class_2_Self_esteem: [
      { code: "00483", label: "Chronic inadequate self-esteem" },
      { code: "00480", label: "Risk for chronic inadequate self-esteem" },
      { code: "00481", label: "Situational inadequate self-esteem" },
      { code: "00482", label: "Risk for situational inadequate self-esteem" },
      { code: "00338", label: "Inadequate health self-efficacy" }
    ],
    Class_3_Body_image: [
      { code: "00497", label: "Disrupted body image" }
    ]
  },
  Domain_7_Role_relationship: {
    Class_1_Caregiving_roles: [
      { code: "00436", label: "Impaired parenting behaviors" },
      { code: "00437", label: "Risk for impaired parenting behaviors" },
      { code: "00438", label: "Readiness for enhanced parenting behaviors" },
      { code: "00387", label: "Excessive parental role conflict" }
    ],
    Class_2_Family_relationships: [
      { code: "00389", label: "Disrupted family interaction patterns" },
      { code: "00440", label: "Risk for disrupted family interaction patterns" },
      { code: "00388", label: "Impaired family processes" },
      { code: "00159", label: "Readiness for enhanced family processes" },
      { code: "00480", label: "Risk for disrupted attachment behaviors" }
    ],
    Class_3_Role_performance: [
      { code: "00055", label: "Ineffective role performance" },
      { code: "00448", label: "Ineffective intimate partner relationship" },
      { code: "00445", label: "Risk for ineffective intimate partner relationship" },
      { code: "00446", label: "Readiness for enhanced intimate partner relationship" },
      { code: "00052", label: "Impaired social interaction" },
      { code: "00221", label: "Ineffective childbearing process" },
      { code: "00227", label: "Risk for ineffective childbearing process" },
      { code: "00208", label: "Readiness for enhanced childbearing process" }
    ]
  },
  Domain_8_Sexuality: {
    Class_1_Sexual_identity: [],
    Class_2_Sexual_function: [
      { code: "00386", label: "Impaired sexual function" }
    ],
    Class_3_Reproduction: [
      { code: "00349", label: "Risk for impaired maternal-fetal dyad" }
    ]
  },
  Domain_9_Coping_stress_tolerance: {
    Class_1_Post_trauma_responses: [
      { code: "00141", label: "Post-trauma syndrome" },
      { code: "00145", label: "Risk for post-trauma syndrome" },
      { code: "00484", label: "Risk for disrupted immigration transition" }
    ],
    Class_2_Coping_responses: [
      { code: "00405", label: "Maladaptive coping" },
      { code: "00158", label: "Readiness for enhanced coping" },
      { code: "00455", label: "Maladaptive family coping" },
      { code: "00075", label: "Readiness for enhanced family coping" },
      { code: "00456", label: "Maladaptive community coping" },
      { code: "00076", label: "Readiness for enhanced community coping" },
      { code: "00366", label: "Excessive caregiving burden" },
      { code: "00401", label: "Risk for excessive caregiving burden" },
      { code: "00301", label: "Maladaptive grieving" },
      { code: "00302", label: "Risk for maladaptive grieving" },
      { code: "00285", label: "Readiness for enhanced grieving" },
      { code: "00210", label: "Impaired resilience" },
      { code: "00211", label: "Risk for impaired resilience" },
      { code: "00212", label: "Readiness for enhanced resilience" },
      { code: "00185", label: "Readiness for enhanced hope" },
      { code: "00325", label: "Inadequate self-compassion" },
      { code: "00400", label: "Excessive anxiety" },
      { code: "00399", label: "Excessive death anxiety" },
      { code: "00390", label: "Excessive fear" }
    ],
    Class_3_Neurobehavioral_responses: [
      { code: "00010", label: "Risk for autonomic dysreflexia" },
      { code: "00372", label: "Ineffective emotion regulation" },
      { code: "00241", label: "Impaired mood regulation" },
      { code: "00258", label: "Acute substance withdrawal syndrome" },
      { code: "00259", label: "Risk for acute substance withdrawal syndrome" }
    ]
  },
  Domain_10_Life_principles: {
    Class_1_Values: [],
    Class_2_Beliefs: [],
    Class_3_Value_belief_action_congruence: [
      { code: "00175", label: "Moral distress" },
      { code: "00454", label: "Impaired spiritual well-being" },
      { code: "00460", label: "Risk for impaired spiritual well-being" },
      { code: "00068", label: "Readiness for enhanced spiritual well-being" },
      { code: "00169", label: "Impaired religiosity" },
      { code: "00170", label: "Risk for impaired religiosity" },
      { code: "00171", label: "Readiness for enhanced religiosity" }
    ]
  },
  Domain_11_Safety_protection: {
    Class_1_Infection: [
      { code: "00361", label: "Impaired immune response" },
      { code: "00004", label: "Risk for infection" },
      { code: "00500", label: "Risk for surgical wound infection" }
    ],
    Class_2_Physical_injury: [
      { code: "00336", label: "Risk for physical injury" },
      { code: "00350", label: "Risk for burn injury" },
      { code: "00351", label: "Risk for cold injury" },
      { code: "00245", label: "Risk for corneal injury" },
      { code: "00219", label: "Risk for dry eye" },
      { code: "00087", label: "Risk for perioperative positioning injury" },
      { code: "00287", label: "Neonatal pressure injury" },
      { code: "00288", label: "Risk for neonatal pressure injury" },
      { code: "00313", label: "Child pressure injury" },
      { code: "00286", label: "Risk for child pressure injury" },
      { code: "00312", label: "Adult pressure injury" },
      { code: "00304", label: "Risk for adult pressure injury" },
      { code: "00250", label: "Risk for urinary tract injury" },
      { code: "00044", label: "Impaired tissue integrity" },
      { code: "00248", label: "Risk for impaired tissue integrity" },
      { code: "00046", label: "Impaired skin integrity" },
      { code: "00047", label: "Risk for impaired skin integrity" },
      { code: "00461", label: "Impaired nipple-areolar complex integrity" },
      { code: "00462", label: "Risk for impaired nipple-areolar complex integrity" },
      { code: "00045", label: "Impaired oral mucous membrane integrity" },
      { code: "00247", label: "Risk for impaired oral mucous membrane integrity" },
      { code: "00306", label: "Risk for child falls" },
      { code: "00303", label: "Risk for adult falls" },
      { code: "00039", label: "Risk for aspiration" },
      { code: "00031", label: "Ineffective airway clearance" },
      { code: "00465", label: "Risk for accidental suffocation" },
      { code: "00374", label: "Risk for excessive bleeding" },
      { code: "00205", label: "Risk for shock" },
      { code: "00291", label: "Risk for thrombosis" },
      { code: "00425", label: "Risk for impaired peripheral neurovascular function" },
      { code: "00156", label: "Risk for sudden infant death" },
      { code: "00290", label: "Risk for elopement attempt" }
    ],
    Class_3_Violence: [
      { code: "00138", label: "Risk for other-directed violence" },
      { code: "00272", label: "Risk for female genital mutilation" },
      { code: "00466", label: "Risk for suicidal self-injurious behavior" },
      { code: "00467", label: "Non-suicidal self-injurious behavior" },
      { code: "00468", label: "Risk for non-suicidal self-injurious behavior" }
    ],
    Class_4_Environmental_hazards: [
      { code: "00181", label: "Contamination" },
      { code: "00180", label: "Risk for contamination" },
      { code: "00469", label: "Risk for accidental poisoning" },
      { code: "00404", label: "Risk for occupational illness" },
      { code: "00470", label: "Risk for occupational physical injury" }
    ],
    Class_5_Defensive_processes: [
      { code: "00217", label: "Risk for allergic reaction" },
      { code: "00042", label: "Risk for latex allergy reaction" }
    ],
    Class_6_Thermoregulation: [
      { code: "00008", label: "Ineffective thermoregulation" },
      { code: "00274", label: "Risk for ineffective thermoregulation" },
      { code: "00474", label: "Decreased neonatal body temperature" },
      { code: "00476", label: "Risk for decreased neonatal body temperature" },
      { code: "00472", label: "Decreased body temperature" },
      { code: "00473", label: "Risk for decreased body temperature" },
      { code: "00490", label: "Risk for decreased perioperative body temperature" },
      { code: "00007", label: "Hyperthermia" },
      { code: "00471", label: "Risk for hyperthermia" }
    ]
  },
  Domain_12_Comfort: {
    Class_1_Physical_comfort: [
      { code: "00380", label: "Impaired physical comfort" },
      { code: "00378", label: "Readiness for enhanced physical comfort" },
      { code: "00342", label: "Impaired end-of-life comfort syndrome" },
      { code: "00132", label: "Acute pain" },
      { code: "00255", label: "Chronic pain syndrome" },
      { code: "00133", label: "Chronic pain" },
      { code: "00256", label: "Labor pain" }
    ],
    Class_2_Environmental_comfort: [],
    Class_3_Social_comfort: [
      { code: "00376", label: "Readiness for enhanced social comfort" },
      { code: "00383", label: "Inadequate social connectedness" },
      { code: "00358", label: "Inadequate social support network" },
      { code: "00475", label: "Excessive loneliness" },
      { code: "00335", label: "Risk for excessive loneliness" }
    ],
    Class_4_Psychological_comfort: [
      { code: "00379", label: "Impaired psychological comfort" },
      { code: "00377", label: "Readiness for enhanced psychological comfort" }
    ]
  },
  Domain_13_Growth_development: {
    Class_1_Growth: [
      { code: "00368", label: "Delayed child growth" },
      { code: "00373", label: "Risk for delayed child growth" }
    ],
    Class_2_Development: [
      { code: "00314", label: "Delayed child development" },
      { code: "00305", label: "Risk for delayed child development" },
      { code: "00315", label: "Delayed infant motor development" },
      { code: "00316", label: "Risk for delayed infant motor development" },
      { code: "00451", label: "Impaired infant neurodevelopmental organization" },
      { code: "00452", label: "Risk for impaired infant neurodevelopmental organization" },
      { code: "00453", label: "Readiness for enhanced infant neurodevelopmental organization" },
      { code: "00295", label: "Ineffective infant suck-swallow response" }
    ]
  }
};

// NOC 6th Edition Data (7 Domains, 34 Classes)
const NOC_DATA = {
  "1_Functional_Health": {
    nameVi: "I - Sức khỏe Chức năng (Functional Health)",
    nameEn: "I - Functional Health",
    classes: {
      "A_Energy_Maintenance": { "0005": "Activity Tolerance", "0001": "Endurance", "0002": "Energy Conservation", "0008": "Fatigue: Disruptive Effects", "0007": "Fatigue Level", "0006": "Psychomotor Energy", "0003": "Rest", "0004": "Sleep" },
      "B_Growth_and_Development": { "0120": "Child Development: 1 Month", "0100": "Child Development: 2 Months", "0101": "Child Development: 4 Months", "0102": "Child Development: 6 Months", "0103": "Child Development: 12 Months", "0104": "Child Development: 2 Years", "0108": "Child Development: Middle Childhood", "0109": "Child Development: Adolescence", "0121": "Development: Late Adulthood", "0110": "Growth", "0118": "Newborn Adaptation", "0113": "Physical Aging", "0119": "Sexual Functioning" },
      "C_Mobility": { "0200": "Ambulation", "0201": "Ambulation: Wheelchair", "0202": "Balance", "0203": "Body Positioning: Self-Initiated", "0212": "Coordinated Movement", "0222": "Gait", "0204": "Immobility Consequences: Physiological", "0205": "Immobility Consequences: Psycho-Cognitive", "0206": "Joint Movement", "0208": "Mobility", "0211": "Skeletal Function", "0210": "Transfer Performance" },
      "D_Self_Care": { "0311": "Discharge Readiness: Independent Living", "0312": "Discharge Readiness: Supported Living", "0313": "Self-Care Status", "0300": "Self-Care: Activities of Daily Living (ADL)", "0301": "Self-Care: Bathing", "0302": "Self-Care: Dressing", "0303": "Self-Care: Eating", "0305": "Self-Care: Hygiene", "0306": "Self-Care: Instrumental Activities of Daily Living (IADL)", "0307": "Self-Care: Non-Parenteral Medication", "0308": "Self-Care: Oral Hygiene", "0309": "Self-Care: Parenteral Medication", "0310": "Self-Care: Toileting" }
    }
  },
  "2_Physiologic_Health": {
    nameVi: "II - Sức khỏe Sinh lý (Physiologic Health)",
    nameEn: "II - Physiologic Health",
    classes: {
      "E_Cardiopulmonary": { "0409": "Blood Coagulation", "0413": "Blood Loss Severity", "0400": "Cardiac Pump Effectiveness", "0414": "Cardiopulmonary Status", "0401": "Circulation Status", "0411": "Mechanical Ventilation Response: Adult", "0412": "Mechanical Ventilation Weaning Response: Adult", "0415": "Respiratory Status", "0410": "Respiratory Status: Airway Patency", "0402": "Respiratory Status: Gas Exchange", "0403": "Respiratory Status: Ventilation", "0422": "Tissue Perfusion", "0405": "Tissue Perfusion: Cardiac", "0406": "Tissue Perfusion: Cerebral", "0407": "Tissue Perfusion: Peripheral", "0408": "Tissue Perfusion: Pulmonary" },
      "K_Digestion_and_Nutrition": { "1014": "Appetite", "1000": "Breastfeeding Establishment: Infant", "1001": "Breastfeeding Establishment: Maternal", "1015": "Gastrointestinal Function", "1020": "Infant Nutritional Status", "1004": "Nutritional Status", "1005": "Nutritional Status: Biochemical Measures", "1007": "Nutritional Status: Energy", "1008": "Nutritional Status: Food & Fluid Intake", "1009": "Nutritional Status: Nutrient Intake", "1010": "Swallowing Status" },
      "F_Elimination": { "0500": "Bowel Continence", "0501": "Bowel Elimination", "0504": "Kidney Function", "0502": "Urinary Continence", "0503": "Urinary Elimination" },
      "G_Fluid_and_Electrolytes": { "0604": "Acute Respiratory Acidosis Severity", "0600": "Electrolyte & Acid/Base Balance", "0606": "Electrolyte Balance", "0601": "Fluid Balance", "0603": "Fluid Overload Severity", "0602": "Hydration", "0609": "Hyperkalemia Severity", "0615": "Hypokalemia Severity", "0617": "Hyponatremia Severity", "0619": "Metabolic Acidosis Severity" },
      "H_Immune_Response": { "0705": "Allergic Response: Localized", "0706": "Allergic Response: Systemic", "0700": "Blood Transfusion Reaction", "0702": "Immune Status", "0703": "Infection Severity", "0708": "Infection Severity: Newborn" },
      "I_Metabolic_Regulation": { "0803": "Liver Function", "0804": "Metabolic Function", "0800": "Thermoregulation", "0801": "Thermoregulation: Newborn", "0802": "Vital Signs", "1006": "Weight: Body Mass" },
      "J_Neurocognitive": { "0919": "Abstract Thinking", "0900": "Cognition", "0901": "Cognitive Orientation", "0902": "Communication", "0905": "Concentration", "0906": "Decision-Making", "0916": "Delirium Level", "0920": "Dementia Level", "0908": "Memory", "0909": "Neurological Status", "0912": "Neurological Status: Consciousness" },
      "Y_Sensory_Function": { "2405": "Sensory Function", "2401": "Sensory Function: Hearing", "2402": "Sensory Function: Proprioception", "2400": "Sensory Function: Tactile", "2403": "Sensory Function: Taste & Smell", "2404": "Sensory Function: Vision" },
      "AA_Therapeutic_Response": { "2300": "Blood Glucose Level", "2301": "Medication Response", "2303": "Post-Procedure Recovery", "2304": "Surgical Recovery: Convalescence", "2305": "Surgical Recovery: Immediate Post-Operative", "2302": "Systemic Toxin Clearance: Dialysis" },
      "L_Tissue_Integrity": { "1104": "Bone Healing", "1106": "Burn Healing", "1107": "Burn Recovery", "1105": "Hemodialysis Access", "1100": "Oral Health", "1913": "Physical Injury Severity", "1101": "Tissue Integrity: Skin & Mucous Membranes", "1102": "Wound Healing: Primary Intention", "1103": "Wound Healing: Secondary Intention" }
    }
  },
  "3_Psychosocial_Health": {
    nameVi: "III - Sức khỏe Tâm lý Xã hội (Psychosocial Health)",
    nameEn: "III - Psychosocial Health",
    classes: {
      "M_Psychological_Well_Being": { "1214": "Agitation Level", "1211": "Anxiety Level", "1200": "Body Image", "1208": "Depression Level", "1210": "Fear Level", "1201": "Hope", "1203": "Loneliness Severity", "1204": "Mood Equilibrium", "1209": "Motivation", "1217": "Panic Level", "1202": "Personal Identity", "1215": "Self-Awareness", "1205": "Self-Esteem", "1212": "Stress Level", "1206": "Will to Live" },
      "N_Psychosocial_Adaptation": { "1300": "Acceptance: Health Status", "1308": "Adaptation to Physical Disability", "1302": "Coping", "1307": "Dignified Life Closure", "1304": "Grief Resolution", "1310": "Guilt Resolution", "1309": "Personal Resiliency", "1305": "Psychosocial Adjustment: Life Change", "1311": "Relocation Adaptation" },
      "O_Self_Control": { "1400": "Abusive Behavior Self-Restraint", "1401": "Aggression Self-Restraint", "1410": "Anger Self-Restraint", "1402": "Anxiety Self-Control", "1409": "Depression Self-Control", "1403": "Distorted Thought Self-Control", "1404": "Fear Self-Control", "1405": "Impulse Self-Control", "1408": "Suicide Self-Restraint" },
      "P_Social_Interaction": { "1500": "Parent-Infant Attachment", "1501": "Role Performance", "1502": "Social Interaction Skills", "1503": "Social Involvement", "1504": "Social Support" }
    }
  },
  "4_Health_Knowledge_and_Behavior": {
    nameVi: "IV - Kiến thức & Hành vi Sức khỏe (Health Knowledge & Behavior)",
    nameEn: "IV - Health Knowledge & Behavior",
    classes: {
      "Q_Health_Behavior": { "1600": "Adherence Behavior", "1621": "Adherence Behavior: Healthy Diet", "1601": "Compliance Behavior", "1623": "Compliance Behavior: Prescribed Medication", "1633": "Exercise Participation", "1602": "Health Promoting Behavior", "1618": "Nausea & Vomiting Control", "1605": "Pain Control", "1606": "Participation in Health Care Decisions", "1638": "Patient Engagement Behavior", "1608": "Symptom Control", "1626": "Weight Gain Behavior", "1627": "Weight Loss Behavior" },
      "R_Health_Beliefs": { "1700": "Health Beliefs", "1701": "Health Beliefs: Perceived Ability to Perform", "1702": "Health Beliefs: Perceived Control", "1703": "Health Beliefs: Perceived Resources", "1704": "Health Beliefs: Perceived Threat", "1705": "Health Orientation" },
      "FF_Health_Management": { "3100": "Self-Management: Acute Illness", "3101": "Self-Management: Anticoagulation Therapy", "3114": "Self-Management: Cancer", "1617": "Self-Management: Cardiac Disease", "3102": "Self-Management: Chronic Disease", "3103": "Self-Management: Chronic Obstructive Pulmonary Disease", "1619": "Self-Management: Diabetes", "3106": "Self-Management: Heart Failure", "3107": "Self-Management: Hypertension", "3118": "Self-Management: Infection", "3108": "Self-Management: Kidney Disease", "3122": "Self-Management: Pneumonia", "3123": "Self-Management: Stroke", "3124": "Self-Management: Wound" },
      "GG_Knowledge_Health_Condition": { "1844": "Knowledge: Acute Illness Management", "1833": "Knowledge: Cancer Management", "1830": "Knowledge: Cardiac Disease Management", "1847": "Knowledge: Chronic Disease Management", "1820": "Knowledge: Diabetes Management", "1803": "Knowledge: Disease Process", "1835": "Knowledge: Heart Failure Management", "1837": "Knowledge: Hypertension Management", "1842": "Knowledge: Infection Management", "1802": "Knowledge: Prescribed Diet", "1814": "Knowledge: Treatment Procedure", "1813": "Knowledge: Treatment Regimen", "3209": "Knowledge: Wound Management" },
      "S_Knowledge_Health_Promotion": { "1827": "Knowledge: Body Mechanics", "1804": "Knowledge: Energy Conservation", "1828": "Knowledge: Fall Prevention", "1805": "Knowledge: Health Behavior", "1854": "Knowledge: Healthy Diet", "1855": "Knowledge: Healthy Lifestyle", "1808": "Knowledge: Medication", "1843": "Knowledge: Pain Management", "1809": "Knowledge: Personal Safety", "1862": "Knowledge: Stress Management", "1841": "Knowledge: Weight Management" },
      "T_Risk_Control": { "1902": "Risk Control", "1935": "Risk Control: Aspiration", "1917": "Risk Control: Cancer", "1914": "Risk Control: Cardiovascular Disease", "1937": "Risk Control: Dehydration", "1939": "Risk Control: Falls", "1928": "Risk Control: Hypertension", "1922": "Risk Control: Hyperthermia", "1923": "Risk Control: Hypothermia", "1924": "Risk Control: Infectious Process", "1942": "Risk Control: Pressure Injury", "1931": "Risk Control: Stroke", "1932": "Risk Control: Thrombus", "1908": "Risk Detection" },
      "HH_Safety": { "1919": "Elopement Occurrence", "1909": "Fall Prevention Behavior", "1912": "Falls Occurrence", "1900": "Immunization Behavior", "1911": "Personal Safety Behavior", "1921": "Pre-Procedure Readiness", "1934": "Safe Health Care Environment", "1910": "Safe Home Environment" }
    }
  },
  "5_Perceived_Health": {
    nameVi: "V - Sức khỏe Cảm nhận (Perceived Health)",
    nameEn: "V - Perceived Health",
    classes: {
      "U_Health_and_Life_Quality": { "2008": "Comfort Status", "2009": "Comfort Status: Environment", "2010": "Comfort Status: Physical", "2011": "Comfort Status: Psychospiritual", "2012": "Comfort Status: Sociocultural", "2007": "Comfortable Death", "2015": "Health Literacy Behavior", "2006": "Personal Health Status", "2002": "Personal Well-Being", "2000": "Quality of Life", "2001": "Spiritual Health" },
      "EE_Satisfaction_with_Care": { "3014": "Client Satisfaction", "3001": "Client Satisfaction: Caring", "3002": "Client Satisfaction: Communication", "3003": "Client Satisfaction: Continuity of Care", "3016": "Client Satisfaction: Pain Management", "3006": "Client Satisfaction: Physical Care", "3010": "Client Satisfaction: Safety", "3011": "Client Satisfaction: Symptom Control", "3012": "Client Satisfaction: Teaching" },
      "V_Symptom_Status": { "2116": "Chemotherapy: Disruptive Physical Effects", "2109": "Discomfort Level", "2110": "Dry Eye Severity", "2111": "Hyperglycemia Severity", "2112": "Hypertension Severity", "2113": "Hypoglycemia Severity", "2114": "Hypotension Severity", "2117": "Lymphedema Severity", "2106": "Nausea & Vomiting: Disruptive Effects", "2107": "Nausea & Vomiting Severity", "1306": "Pain: Adverse Psychological Response", "2101": "Pain: Disruptive Effects", "2102": "Pain Level", "2118": "Seizure Severity", "2003": "Suffering Severity", "2103": "Symptom Severity" }
    }
  },
  "6_Family_Health": {
    nameVi: "VI - Sức khỏe Gia đình (Family Health)",
    nameEn: "VI - Family Health",
    classes: {
      "W_Family_Caregiver_Performance": { "2200": "Caregiver Adaptation to Patient Institutionalization", "2202": "Caregiver Home Care Readiness", "2203": "Caregiver Lifestyle Disruption", "2204": "Caregiver-Patient Relationship", "2205": "Caregiver Performance: Direct Care", "2206": "Caregiver Performance: Indirect Care", "2210": "Caregiver Role Endurance", "2208": "Caregiver Stressors" },
      "Z_Family_Member_Health_Status": { "2500": "Abuse Cessation", "2501": "Abuse Protection", "2506": "Caregiver Emotional Health", "2507": "Caregiver Physical Health", "2508": "Caregiver Well-Being", "2509": "Maternal Status: Antepartum", "2510": "Maternal Status: Intrapartum", "2511": "Maternal Status: Postpartum" },
      "X_Family_Well_Being": { "2600": "Family Coping", "2602": "Family Functioning", "2606": "Family Health Status", "2603": "Family Integrity", "2604": "Family Normalization", "2605": "Family Participation in Professional Care", "2608": "Family Resiliency", "2601": "Family Social Climate", "2609": "Family Support During Treatment" },
      "DD_Parenting": { "2211": "Parenting Performance", "2904": "Parenting Performance: Infant", "2907": "Parenting Performance: Toddler", "2906": "Parenting Performance: Preschooler", "1901": "Parenting Performance: Psychosocial Safety" }
    }
  },
  "7_Community_Health": {
    nameVi: "VII - Sức khỏe Cộng đồng (Community Health)",
    nameEn: "VII - Community Health",
    classes: {
      "CC_Community_Health_Protection": { "2804": "Community Disaster Readiness", "2806": "Community Disaster Response", "2807": "Community Health Screening Effectiveness", "2808": "Community Program Effectiveness", "2801": "Community Risk Control: Chronic Disease", "2802": "Community Risk Control: Communicable Disease", "2812": "Community Risk Control: Environmental Hazards", "2813": "Community Risk Control: Suicide", "2805": "Community Risk Control: Violence" },
      "BB_Community_Well_Being": { "2700": "Community Competence", "2703": "Community Grief Response", "2701": "Community Health Status", "2800": "Community Immune Status", "2704": "Community Resiliency", "2702": "Community Violence Level" }
    }
  }
};

// NIC 7th Edition Interventions Data
const NIC_INTERVENTIONS = {
  "0140": "Body mechanics promotion", "0180": "Energy management", "0200": "Exercise promotion", "0221": "Exercise therapy: Ambulation", "0222": "Exercise therapy: Balance", "0224": "Exercise therapy: Joint mobility",
  "0410": "Bowel incontinence care", "0430": "Bowel management", "0440": "Bowel training", "0450": "Constipation/impaction management", "0460": "Diarrhea management", "0480": "Ostomy care",
  "0550": "Bladder irrigation", "0560": "Pelvic muscle exercise", "0570": "Urinary bladder training", "0580": "Urinary catheterization", "0590": "Urinary elimination management", "0610": "Urinary incontinence care", "0620": "Urinary retention care",
  "0740": "Bed rest care", "0840": "Positioning", "0844": "Positioning: Neurologic", "0846": "Positioning: Wheelchair", "0910": "Splinting", "0940": "Traction/immobilization care", "0970": "Transfer",
  "1020": "Diet staging", "1030": "Eating disorders management", "1050": "Feeding", "1056": "Enteral tube feeding", "1080": "Nasogastric intubation", "1100": "Nutrition management", "1120": "Nutrition therapy", "1160": "Nutritional monitoring", "1200": "Total parenteral nutrition (TPN) administration", "1240": "Weight gain assistance", "1260": "Weight management", "1280": "Weight reduction assistance",
  "1320": "Acupressure", "1330": "Aromatherapy", "1340": "Cutaneous stimulation", "1380": "Heat/cold application", "1390": "Healing touch", "1410": "Pain management: Acute", "1415": "Pain management: Chronic", "1450": "Nausea management", "1460": "Progressive muscle relaxation", "1480": "Massage", "1540": "Transcutaneous electrical nerve stimulation (TENS)", "1570": "Vomiting management",
  "1610": "Bathing", "1630": "Dressing", "1650": "Eye care", "1660": "Foot care", "1665": "Functional ability enhancement", "1710": "Oral health maintenance", "1730": "Oral health restoration", "1750": "Perineal care", "1800": "Self-care assistance", "1801": "Self-care assistance: Bathing/hygiene", "1802": "Self-care assistance: Dressing/grooming", "1803": "Self-care assistance: Feeding", "1804": "Self-care assistance: Toileting", "1805": "Self-care assistance: IADL", "1806": "Self-care assistance: Transfer", "1850": "Sleep enhancement", "1860": "Swallowing therapy", "1870": "Tube care", "1872": "Tube care: Chest", "1874": "Tube care: Gastrointestinal", "1876": "Tube care: Urinary",
  "1910": "Acid-base management", "1920": "Acid-base monitoring", "2000": "Electrolyte management", "2020": "Electrolyte monitoring", "2080": "Fluid/electrolyte management", "2100": "Hemodialysis therapy", "2120": "Hyperglycemia management", "2130": "Hypoglycemia management", "2210": "Analgesic administration", "2240": "Chemotherapy management", "2260": "Sedation management", "2300": "Medication administration", "2304": "Medication administration: Oral", "2314": "Medication administration: Intravenous (IV)", "2380": "Medication management", "2395": "Medication reconciliation", "2400": "Patient-controlled analgesia (PCA) assistance",
  "2540": "Cerebral edema management", "2550": "Cerebral perfusion promotion", "2590": "Intracranial pressure (ICP) monitoring", "2620": "Neurologic monitoring", "2660": "Peripheral sensation management", "2680": "Seizure management", "2690": "Seizure precautions",
  "2840": "Anesthesia administration", "2870": "Postanesthesia care", "2880": "Preoperative coordination", "2900": "Surgical assistance", "2920": "Surgical precautions", "2930": "Surgical preparation",
  "3120": "Airway insertion and stabilization", "3140": "Airway management", "3160": "Airway suctioning", "3180": "Artificial airway management", "3200": "Aspiration precautions", "3210": "Asthma management", "3230": "Chest physiotherapy", "3250": "Cough enhancement", "3270": "Endotracheal extubation", "3300": "Mechanical ventilation management: Invasive", "3302": "Mechanical ventilation management: Noninvasive", "3310": "Mechanical ventilatory weaning", "3320": "Oxygen therapy", "3350": "Respiratory monitoring", "3390": "Ventilation assistance",
  "3420": "Amputation care", "3440": "Incision site care", "3480": "Lower extremity monitoring", "3520": "Pressure ulcer care", "3540": "Pressure ulcer prevention", "3550": "Pruritus management", "3584": "Skin care: Topical treatment", "3590": "Skin surveillance", "3620": "Suturing", "3660": "Wound care", "3661": "Wound care: Burns", "3662": "Wound care: Closed drainage", "3664": "Wound care: Nonhealing", "3680": "Wound irrigation",
  "3740": "Fever treatment", "3786": "Hyperthermia treatment", "3800": "Hypothermia treatment", "3900": "Temperature regulation", "4010": "Bleeding precautions", "4020": "Bleeding reduction", "4030": "Blood products administration", "4040": "Cardiac care", "4044": "Cardiac care: Acute", "4046": "Cardiac care: Rehabilitative", "4050": "Cardiac risk management", "4054": "Central venous access device management", "4062": "Circulatory care: Arterial insufficiency", "4066": "Circulatory care: Venous insufficiency", "4070": "Circulatory precautions", "4090": "Dysrhythmia management", "4104": "Embolus care: Peripheral", "4106": "Embolus care: Pulmonary", "4110": "Embolus precautions", "4120": "Fluid management", "4130": "Fluid monitoring", "4140": "Fluid resuscitation", "4150": "Hemodynamic regulation", "4162": "Hypertension management", "4170": "Hypervolemia management", "4175": "Hypotension management", "4180": "Hypovolemia management", "4190": "Intravenous (IV) insertion", "4200": "Intravenous (IV) therapy", "4250": "Shock management", "4260": "Shock prevention",
  "4310": "Activity therapy", "4350": "Behavior management", "4354": "Behavior management: Self-harm", "4360": "Behavior modification", "4400": "Music therapy", "4410": "Mutual goal setting", "4420": "Patient contracting", "4470": "Self-modification assistance", "4480": "Self-responsibility facilitation", "4490": "Smoking cessation assistance", "4500": "Substance use prevention", "4510": "Substance use treatment", "4640": "Anger control assistance", "4700": "Cognitive restructuring", "4720": "Cognitive stimulation", "4760": "Memory training", "4820": "Reality orientation", "4860": "Reminiscence therapy", "4920": "Active listening", "4974": "Communication enhancement: Hearing deficit", "4976": "Communication enhancement: Speech deficit", "4978": "Communication enhancement: Visual deficit",
  "5000": "Complex relationship building", "5020": "Conflict mediation", "5100": "Socialization enhancement", "5210": "Anticipatory guidance", "5220": "Body image enhancement", "5230": "Coping enhancement", "5240": "Counseling", "5246": "Nutritional counseling", "5250": "Decision-making support", "5260": "Dying care", "5270": "Emotional support", "5290": "Grief work facilitation", "5305": "Health coaching", "5310": "Hope inspiration", "5330": "Mood management", "5340": "Presence", "5350": "Relocation stress reduction", "5370": "Role enhancement", "5390": "Self-awareness enhancement", "5395": "Self-efficacy enhancement", "5400": "Self-esteem enhancement", "5420": "Spiritual support", "5430": "Support group", "5440": "Support system enhancement",
  "5510": "Health education", "5515": "Health literacy enhancement", "5520": "Learning facilitation", "5540": "Learning readiness enhancement", "5602": "Teaching: Disease process", "5603": "Teaching: Foot care", "5606": "Teaching: Individual", "5610": "Teaching: Preoperative", "5612": "Teaching: Prescribed exercise", "5614": "Teaching: Prescribed diet", "5616": "Teaching: Prescribed medication", "5618": "Teaching: Procedure/treatment", "5820": "Anxiety reduction", "5880": "Calming technique", "5900": "Distraction", "6000": "Guided imagery", "6040": "Relaxation therapy",
  "6140": "Code management", "6160": "Crisis intervention", "6200": "Emergency care", "6240": "First aid", "6320": "Resuscitation", "6340": "Suicide prevention", "6364": "Triage: Emergency center", "6400": "Abuse protection support", "6410": "Allergy management", "6412": "Anaphylaxis management", "6440": "Delirium management", "6460": "Dementia management", "6480": "Environmental management", "6482": "Environmental management: Comfort", "6486": "Environmental management: Safety", "6490": "Fall prevention", "6530": "Immunization/vaccination management", "6540": "Infection control", "6550": "Infection protection", "6574": "Patient identification", "6580": "Physical restraint", "6600": "Radiation therapy management", "6610": "Risk identification", "6650": "Surveillance", "6680": "Vital signs monitoring",
  "7040": "Caregiver support", "7100": "Family integrity promotion", "7110": "Family involvement promotion", "7120": "Family mobilization", "7140": "Family support", "7260": "Respite care", "7310": "Admission care", "7320": "Case management", "7370": "Discharge planning", "7400": "Health system guidance", "7460": "Patient rights protection", "7690": "Laboratory data interpretation", "7800": "Quality monitoring", "7910": "Consultation", "7920": "Documentation", "7960": "Health care information exchange", "7980": "Incident reporting", "8020": "Multidisciplinary care conference", "8100": "Referral", "8140": "Handoff report", "8190": "Telephone follow-up"
};

// 98 Nhãn chẩn đoán đổi tên NANDA-I (2024-2026)
const NANDA_LABEL_MAPPINGS = [
  { domain: 1, previous_label: "Sedentary lifestyle", new_label_2024_2026: "Excessive sedentary behaviors", new_code: "00355" },
  { domain: 1, previous_label: "Ineffective family health self-management", new_label_2024_2026: "Ineffective family health management", new_code: "00080" },
  { domain: 1, previous_label: "Deficient community health", new_label_2024_2026: "Ineffective community health management", new_code: "00356" },
  { domain: 1, previous_domain: 2, previous_label: "Risk for unstable blood glucose level", new_label_2024_2026: "Risk for ineffective blood glucose pattern self-management", new_code: "00489" },
  { domain: 1, previous_domain: 11, previous_label: "Risk for dry mouth", new_label_2024_2026: "Risk for ineffective dry mouth self-management", new_code: "00412" },
  { domain: 1, previous_domain: 12, previous_label: "Nausea", new_label_2024_2026: "Ineffective nausea self-management", new_code: "00384" },
  { domain: 1, previous_label: "Frail elderly syndrome", new_label_2024_2026: "Elder frailty syndrome", new_code: "00353" },
  { domain: 1, previous_label: "Risk for frail elderly syndrome", new_label_2024_2026: "Risk for elder frailty syndrome", new_code: "00357" },
  { domain: 2, previous_label: "Imbalanced nutrition: less than body requirements", new_label_2024_2026: "Inadequate nutritional intake", new_code: "00343" },
  { domain: 2, previous_label: "Readiness for enhanced nutrition", new_label_2024_2026: "Readiness for enhanced nutritional intake", new_code: "00163" },
  { domain: 2, previous_label: "Ineffective breastfeeding", new_label_2024_2026: "Ineffective chestfeeding", new_code: "00371" },
  { domain: 2, previous_label: "Interrupted breastfeeding", new_label_2024_2026: "Disrupted exclusive chestfeeding", new_code: "00347" },
  { domain: 2, previous_label: "Readiness for enhanced breastfeeding", new_label_2024_2026: "Readiness for enhanced chestfeeding", new_code: "00479" },
  { domain: 2, previous_label: "Insufficient breast milk production", new_label_2024_2026: "Inadequate human milk production", new_code: "00333" },
  { domain: 2, previous_label: "Risk for electrolyte imbalance", new_label_2024_2026: "Risk for impaired water-electrolyte balance", new_code: "00491" },
  { domain: 2, previous_label: "Risk for imbalanced fluid volume", new_label_2024_2026: "Risk for impaired fluid volume balance", new_code: "00492" },
  { domain: 2, previous_label: "Deficient fluid volume", new_label_2024_2026: "Inadequate fluid volume", new_code: "00421" },
  { domain: 2, previous_label: "Risk for deficient fluid volume", new_label_2024_2026: "Risk for inadequate fluid volume", new_code: "00420" },
  { domain: 3, previous_label: "Dysfunctional gastrointestinal motility", new_label_2024_2026: "Impaired gastrointestinal motility", new_code: "00423" },
  { domain: 3, previous_label: "Risk for dysfunctional gastrointestinal motility", new_label_2024_2026: "Risk for impaired gastrointestinal motility", new_code: "00422" },
  { domain: 3, previous_label: "Bowel incontinence", new_label_2024_2026: "Impaired fecal continence", new_code: "00424" },
  { domain: 4, previous_label: "Readiness for enhanced sleep", new_label_2024_2026: "Readiness for enhanced sleep pattern", new_code: "00417" },
  { domain: 4, previous_label: "Impaired sitting", new_label_2024_2026: "Impaired sitting ability", new_code: "00363" },
  { domain: 4, previous_label: "Impaired standing", new_label_2024_2026: "Impaired standing ability", new_code: "00364" },
  { domain: 4, previous_label: "Impaired transfer ability", new_label_2024_2026: "Impaired transferring ability", new_code: "00367" },
  { domain: 4, previous_label: "Impaired walking", new_label_2024_2026: "Impaired walking ability", new_code: "00365" },
  { domain: 4, previous_label: "Fatigue", new_label_2024_2026: "Excessive fatigue burden", new_code: "00477" },
  { domain: 4, previous_domain: 11, previous_label: "Delayed surgical recovery", new_label_2024_2026: "Impaired surgical recovery", new_code: "00463" },
  { domain: 4, previous_domain: 11, previous_label: "Risk for delayed surgical recovery", new_label_2024_2026: "Risk for impaired surgical recovery", new_code: "00464" },
  { domain: 4, previous_label: "Risk for unstable blood pressure", new_label_2024_2026: "Risk for imbalanced blood pressure", new_code: "00362" },
  { domain: 4, previous_label: "Dysfunctional ventilatory weaning response", new_label_2024_2026: "Impaired child ventilatory weaning response", new_code: "00431" },
  { domain: 4, previous_label: "Dysfunctional adult ventilatory weaning response", new_label_2024_2026: "Impaired adult ventilatory weaning response", new_code: "00430" },
  { domain: 4, previous_label: "Readiness for enhanced self-care", new_label_2024_2026: "Readiness for enhanced self-care abilities", new_code: "00442" },
  { domain: 4, previous_label: "Bathing self-care deficit", new_label_2024_2026: "Decreased bathing abilities", new_code: "00326" },
  { domain: 4, previous_label: "Dressing self-care deficit", new_label_2024_2026: "Decreased dressing abilities", new_code: "00327" },
  { domain: 4, previous_label: "Feeding self-care deficit", new_label_2024_2026: "Decreased feeding abilities", new_code: "00328" },
  { domain: 4, previous_label: "Toileting self-care deficit", new_label_2024_2026: "Decreased toileting abilities", new_code: "00329" },
  { domain: 5, previous_label: "Disturbed thought processes", new_label_2024_2026: "Disrupted thought processes", new_code: "00493" },
  { domain: 5, previous_label: "Deficient knowledge", new_label_2024_2026: "Inadequate health knowledge", new_code: "00435" },
  { domain: 5, previous_label: "Readiness for enhanced knowledge", new_label_2024_2026: "Readiness for enhanced health knowledge", new_code: "00499" },
  { domain: 5, previous_domain: 10, previous_label: "Decisional conflict", new_label_2024_2026: "Impaired decision-making", new_code: "00429" },
  { domain: 5, previous_label: "Readiness for enhanced communication", new_label_2024_2026: "Readiness for enhanced verbal communication", new_code: "00468" },
  { domain: 6, previous_label: "Disturbed personal identity", new_label_2024_2026: "Disrupted personal identity", new_code: "00494" },
  { domain: 6, previous_domain: 7, previous_label: "Disturbed family identity syndrome", new_label_2024_2026: "Disrupted family identity syndrome", new_code: "00495" },
  { domain: 6, previous_domain: 7, previous_label: "Risk for disturbed family identity syndrome", new_label_2024_2026: "Risk for disrupted family identity syndrome", new_code: "00496" },
  { domain: 6, previous_label: "Risk for compromised human dignity", new_label_2024_2026: "Risk for impaired human dignity", new_code: "00488" },
  { domain: 6, previous_label: "Chronic low self-esteem", new_label_2024_2026: "Chronic inadequate self-esteem", new_code: "00483" },
  { domain: 6, previous_label: "Risk for chronic low self-esteem", new_label_2024_2026: "Risk for chronic inadequate self-esteem", new_code: "00480" },
  { domain: 6, previous_label: "Situational low self-esteem", new_label_2024_2026: "Situational inadequate self-esteem", new_code: "00481" },
  { domain: 6, previous_label: "Risk for situational low self-esteem", new_label_2024_2026: "Risk for situational inadequate self-esteem", new_code: "00482" },
  { domain: 6, previous_label: "Disturbed body image", new_label_2024_2026: "Disrupted body image", new_code: "00497" },
  { domain: 7, previous_label: "Impaired parenting", new_label_2024_2026: "Impaired parenting behaviors", new_code: "00436" },
  { domain: 7, previous_label: "Risk for impaired parenting", new_label_2024_2026: "Risk for impaired parenting behaviors", new_code: "00437" },
  { domain: 7, previous_label: "Readiness for enhanced parenting", new_label_2024_2026: "Readiness for enhanced parenting behaviors", new_code: "00438" },
  { domain: 7, previous_label: "Parental role conflict", new_label_2024_2026: "Excessive parental role conflict", new_code: "00387" },
  { domain: 7, previous_label: "Interrupted family processes", new_label_2024_2026: "Disrupted family interaction patterns", new_code: "00389" },
  { domain: 7, previous_label: "Dysfunctional family processes", new_label_2024_2026: "Impaired family processes", new_code: "00388" },
  { domain: 7, previous_label: "Risk for impaired attachment", new_label_2024_2026: "Risk for disrupted attachment behaviors", new_code: "00480" },
  { domain: 7, previous_label: "Ineffective relationship", new_label_2024_2026: "Ineffective intimate partner relationship", new_code: "00448" },
  { domain: 7, previous_label: "Risk for ineffective relationship", new_label_2024_2026: "Risk for ineffective intimate partner relationship", new_code: "00445" },
  { domain: 7, previous_label: "Readiness for enhanced relationship", new_label_2024_2026: "Readiness for enhanced intimate partner relationship", new_code: "00446" },
  { domain: 8, previous_label: "Sexual dysfunction", new_label_2024_2026: "Impaired sexual function", new_code: "00386" },
  { domain: 8, previous_label: "Risk for disturbed maternal-fetal dyad", new_label_2024_2026: "Risk for impaired maternal-fetal dyad", new_code: "00349" },
  { domain: 9, previous_label: "Risk for complicated immigration transition", new_label_2024_2026: "Risk for disrupted immigration transition", new_code: "00484" },
  { domain: 9, previous_label: "Ineffective coping", new_label_2024_2026: "Maladaptive coping", new_code: "00405" },
  { domain: 9, previous_label: "Compromised family coping", new_label_2024_2026: "Maladaptive family coping", new_code: "00455" },
  { domain: 9, previous_label: "Ineffective community coping", new_label_2024_2026: "Maladaptive community coping", new_code: "00456" },
  { domain: 9, previous_domain: 7, previous_label: "Caregiver role strain", new_label_2024_2026: "Excessive caregiving burden", new_code: "00366" },
  { domain: 9, previous_domain: 7, previous_label: "Risk for caregiver role strain", new_label_2024_2026: "Risk for excessive caregiving burden", new_code: "00401" },
  { domain: 9, previous_label: "Anxiety", new_label_2024_2026: "Excessive anxiety", new_code: "00400" },
  { domain: 9, previous_label: "Death anxiety", new_label_2024_2026: "Excessive death anxiety", new_code: "00399" },
  { domain: 9, previous_label: "Fear", new_label_2024_2026: "Excessive fear", new_code: "00390" },
  { domain: 9, previous_domain: 5, previous_label: "Labile emotional control", new_label_2024_2026: "Ineffective emotion regulation", new_code: "00372" },
  { domain: 10, previous_label: "Spiritual distress", new_label_2024_2026: "Impaired spiritual well-being", new_code: "00454" },
  { domain: 10, previous_label: "Risk for spiritual distress", new_label_2024_2026: "Risk for impaired spiritual well-being", new_code: "00460" },
  { domain: 11, previous_domain: 1, previous_label: "Ineffective protection", new_label_2024_2026: "Impaired immune response", new_code: "00361" },
  { domain: 11, previous_label: "Risk for surgical site infection", new_label_2024_2026: "Risk for surgical wound infection", new_code: "00500" },
  { domain: 11, previous_label: "Risk for injury", new_label_2024_2026: "Risk for physical injury", new_code: "00336" },
  { domain: 11, previous_label: "Nipple-areolar complex injury", new_label_2024_2026: "Impaired nipple-areolar complex integrity", new_code: "00461" },
  { domain: 11, previous_label: "Risk for nipple-areolar complex injury", new_label_2024_2026: "Risk for impaired nipple-areolar complex integrity", new_code: "00462" },
  { domain: 11, previous_label: "Risk for suffocation", new_label_2024_2026: "Risk for accidental suffocation", new_code: "00465" },
  { domain: 11, previous_label: "Risk for bleeding", new_label_2024_2026: "Risk for excessive bleeding", new_code: "00374" },
  { domain: 11, previous_label: "Risk for peripheral neurovascular dysfunction", new_label_2024_2026: "Risk for impaired peripheral neurovascular function", new_code: "00425" },
  { domain: 11, previous_label: "Risk for suicidal behavior", new_label_2024_2026: "Risk for suicidal self-injurious behavior", new_code: "00466" },
  { domain: 11, previous_label: "Self-mutilation", new_label_2024_2026: "Non-suicidal self-injurious behavior", new_code: "00467" },
  { domain: 11, previous_label: "Risk for self-mutilation", new_label_2024_2026: "Risk for non-suicidal self-injurious behavior", new_code: "00468" },
  { domain: 11, previous_label: "Risk for poisoning", new_label_2024_2026: "Risk for accidental poisoning", new_code: "00469" },
  { domain: 11, previous_label: "Risk for occupational injury", new_label_2024_2026: "Risk for occupational physical injury", new_code: "00470" },
  { domain: 11, previous_label: "Neonatal hypothermia", new_label_2024_2026: "Decreased neonatal body temperature", new_code: "00474" },
  { domain: 11, previous_label: "Risk for neonatal hypothermia", new_label_2024_2026: "Risk for decreased neonatal body temperature", new_code: "00476" },
  { domain: 11, previous_label: "Hypothermia", new_label_2024_2026: "Decreased body temperature", new_code: "00472" },
  { domain: 11, previous_label: "Risk for hypothermia", new_label_2024_2026: "Risk for decreased body temperature", new_code: "00473" },
  { domain: 11, previous_label: "Risk for perioperative hypothermia", new_label_2024_2026: "Risk for decreased perioperative body temperature", new_code: "00490" },
  { domain: 12, previous_label: "Social isolation", new_label_2024_2026: "Inadequate social connectedness", new_code: "00383" },
  { domain: 12, previous_label: "Risk for loneliness", new_label_2024_2026: "Risk for excessive loneliness", new_code: "00335" },
  { domain: 13, previous_domain: 9, previous_label: "Disorganized infant behavior", new_label_2024_2026: "Impaired infant neurodevelopmental organization", new_code: "00451" },
  { domain: 13, previous_domain: 9, previous_label: "Risk for disorganized infant behavior", new_label_2024_2026: "Risk for impaired infant neurodevelopmental organization", new_code: "00452" },
  { domain: 13, previous_domain: 9, previous_label: "Readiness for enhanced organized infant behavior", new_label_2024_2026: "Readiness for enhanced infant neurodevelopmental organization", new_code: "00453" }
];

// 46 Chẩn đoán đã bị loại bỏ (Retired) trong NANDA-I 2024-2026
const NANDA_RETIRED_DIAGNOSES = [
  { domain: 1, class: 2, retired_code: "00188", retired_label: "Risk-prone health behavior" },
  { domain: 2, class: 1, retired_code: "00232", retired_label: "Obesity" },
  { domain: 2, class: 1, retired_code: "00233", retired_label: "Overweight" },
  { domain: 2, class: 1, retired_code: "00234", retired_label: "Risk for overweight" },
  { domain: 2, class: 4, retired_code: "00178", retired_label: "Risk for impaired liver function" },
  { domain: 2, class: 4, retired_code: "00296", retired_label: "Risk for metabolic syndrome" },
  { domain: 3, class: 1, retired_code: "00023", retired_label: "Urinary retention" },
  { domain: 3, class: 2, retired_code: "00011", retired_label: "Constipation" },
  { domain: 3, class: 2, retired_code: "00015", retired_label: "Risk for constipation" },
  { domain: 3, class: 2, retired_code: "00012", retired_label: "Perceived constipation" },
  { domain: 3, class: 2, retired_code: "00013", retired_label: "Diarrhea" },
  { domain: 4, class: 1, retired_code: "00095", retired_label: "Insomnia" },
  { domain: 4, class: 1, retired_code: "00096", retired_label: "Sleep deprivation" },
  { domain: 4, class: 1, retired_code: "00198", retired_label: "Disturbed sleep pattern" },
  { domain: 4, class: 2, retired_code: "00040", retired_label: "Risk for disuse syndrome" },
  { domain: 4, class: 3, retired_code: "00154", retired_label: "Wandering" },
  { domain: 4, class: 4, retired_code: "00029", retired_label: "Decreased cardiac output" },
  { domain: 4, class: 4, retired_code: "00200", retired_label: "Risk for decreased cardiac tissue perfusion" },
  { domain: 4, class: 5, retired_code: "00193", retired_label: "Self-neglect" },
  { domain: 5, class: 1, retired_code: "00123", retired_label: "Unilateral neglect" },
  { domain: 6, class: 1, retired_code: "00124", retired_label: "Hopelessness" },
  { domain: 6, class: 1, retired_code: "00225", retired_label: "Risk for disturbed personal identity" },
  { domain: 8, class: 2, retired_code: "00065", retired_label: "Ineffective sexuality pattern" },
  { domain: 9, class: 1, retired_code: "00142", retired_label: "Rape-trauma syndrome" },
  { domain: 9, class: 1, retired_code: "00114", retired_label: "Relocation stress syndrome" },
  { domain: 9, class: 1, retired_code: "00149", retired_label: "Risk for relocation stress syndrome" },
  { domain: 9, class: 2, retired_code: "00199", retired_label: "Ineffective activity planning" },
  { domain: 9, class: 2, retired_code: "00226", retired_label: "Risk for ineffective activity planning" },
  { domain: 9, class: 2, retired_code: "00071", retired_label: "Defensive coping" },
  { domain: 9, class: 2, retired_code: "00073", retired_label: "Disabled family coping" },
  { domain: 9, class: 2, retired_code: "00072", retired_label: "Ineffective denial" },
  { domain: 9, class: 2, retired_code: "00125", retired_label: "Powerlessness" },
  { domain: 9, class: 2, retired_code: "00152", retired_label: "Risk for powerlessness" },
  { domain: 9, class: 2, retired_code: "00187", retired_label: "Readiness for enhanced power" },
  { domain: 9, class: 2, retired_code: "00137", retired_label: "Chronic sorrow" },
  { domain: 9, class: 2, retired_code: "00177", retired_label: "Stress overload" },
  { domain: 9, class: 3, retired_code: "00009", retired_label: "Autonomic dysreflexia" },
  { domain: 9, class: 3, retired_code: "00264", retired_label: "Neonatal abstinence syndrome" },
  { domain: 11, class: 2, retired_code: "00048", retired_label: "Impaired dentition" },
  { domain: 11, class: 2, retired_code: "00220", retired_label: "Risk for thermal injury" },
  { domain: 11, class: 2, retired_code: "00038", retired_label: "Risk for physical trauma" },
  { domain: 11, class: 2, retired_code: "00213", retired_label: "Risk for vascular trauma" },
  { domain: 11, class: 3, retired_code: "00140", retired_label: "Risk for self-directed violence" },
  { domain: 11, class: 5, retired_code: "00218", retired_label: "Risk for adverse reaction to iodinated contrast media" },
  { domain: 12, class: "1, 2, 3", retired_code: "00214", retired_label: "Impaired comfort" },
  { domain: 12, class: "1, 2, 3", retired_code: "00183", retired_label: "Readiness for enhanced comfort" }
];

// Bộ 13 Thang đo Định lượng Chuẩn của NOC (Likert 1-5)
const NOC_SCALES = [
  {
    code: "01",
    meaningVi: "Mức độ suy giảm sức khỏe",
    meaningEn: "Degree of physiological/functional impairment",
    points: ["Severely compromised", "Substantially compromised", "Moderately compromised", "Mildly compromised", "Not compromised"],
    pointsVi: ["Suy giảm nghiêm trọng", "Suy giảm đáng kể", "Suy giảm trung bình", "Suy giảm nhẹ", "Không suy giảm"]
  },
  {
    code: "02",
    meaningVi: "Độ lệch so với chuẩn bình thường",
    meaningEn: "Deviation from expected normal range",
    points: ["Severe deviation", "Substantial deviation", "Moderate deviation", "Mild deviation", "No deviation"],
    pointsVi: ["Lệch chuẩn nghiêm trọng", "Lệch chuẩn đáng kể", "Lệch chuẩn vừa", "Lệch chuẩn nhẹ", "Không lệch chuẩn"]
  },
  {
    code: "06",
    meaningVi: "Mức độ đầy đủ về lượng/chất",
    meaningEn: "Degree of quantitative/qualitative adequacy",
    points: ["Not adequate", "Slightly adequate", "Moderately adequate", "Substantially adequate", "Totally adequate"],
    pointsVi: ["Không đầy đủ", "Đầy đủ ít", "Đầy đủ vừa phải", "Đầy đủ đáng kể", "Hoàn toàn đầy đủ"]
  },
  {
    code: "07",
    meaningVi: "Số lần xuất hiện biến cố",
    meaningEn: "Frequency of adverse event occurrence",
    points: ["10 and over", "7–9", "4–6", "1–3", "None"],
    pointsVi: ["Từ 10 lần trở lên", "7–9 lần", "4–6 lần", "1–3 lần", "Không xảy ra (0)"]
  },
  {
    code: "09",
    meaningVi: "Phạm vi đạt được mục tiêu",
    meaningEn: "Extent of goal/outcome achievement",
    points: ["None", "Limited", "Moderate", "Substantial", "Extensive"],
    pointsVi: ["Không đạt", "Hạn chế", "Trung bình", "Đáng kể", "Sâu rộng / Toàn diện"]
  },
  {
    code: "11",
    meaningVi: "Tần suất nhận thức tích cực",
    meaningEn: "Frequency of positive perception",
    points: ["Never positive", "Rarely positive", "Sometimes positive", "Often positive", "Consistently positive"],
    pointsVi: ["Không bao giờ tích cực", "Hiếm khi tích cực", "Thỉnh thoảng tích cực", "Thường xuyên tích cực", "Luôn luôn tích cực"]
  },
  {
    code: "12",
    meaningVi: "Cường độ hoạt động",
    meaningEn: "Intensity of response/strength",
    points: ["Very weak", "Weak", "Moderate", "Strong", "Very strong"],
    pointsVi: ["Rất yếu", "Yếu", "Trung bình", "Mạnh", "Rất mạnh"]
  },
  {
    code: "13",
    meaningVi: "Tần suất biểu hiện hành vi tích cực",
    meaningEn: "Frequency of positive health behavior",
    points: ["Never demonstrated", "Rarely demonstrated", "Sometimes demonstrated", "Often demonstrated", "Consistently demonstrated"],
    pointsVi: ["Không bao giờ biểu hiện", "Hiếm khi biểu hiện", "Thỉnh thoảng biểu hiện", "Thường xuyên biểu hiện", "Luôn biểu hiện nhất quán"]
  },
  {
    code: "14",
    meaningVi: "Mức độ nghiêm trọng của triệu chứng âm tính",
    meaningEn: "Severity of negative clinical symptom",
    points: ["Severe", "Substantial", "Moderate", "Mild", "None"],
    pointsVi: ["Nghiêm trọng (Nặng)", "Đáng kể", "Trung bình", "Nhẹ", "Không có triệu chứng"]
  },
  {
    code: "17",
    meaningVi: "Mức độ tiệm cận trạng thái chất lượng",
    meaningEn: "Overall quality status",
    points: ["Poor", "Fair", "Good", "Very good", "Excellent"],
    pointsVi: ["Kém", "Tạm được", "Tốt", "Rất tốt", "Xuất sắc"]
  },
  {
    code: "18",
    meaningVi: "Mức độ hài lòng của người bệnh",
    meaningEn: "Degree of client satisfaction",
    points: ["Not at all satisfied", "Somewhat satisfied", "Moderately satisfied", "Very satisfied", "Completely satisfied"],
    pointsVi: ["Hoàn toàn không hài lòng", "Hơi hài lòng", "Hài lòng vừa phải", "Rất hài lòng", "Hoàn toàn hài lòng"]
  },
  {
    code: "19",
    meaningVi: "Tần suất biểu hiện hành vi nguy cơ (Ngược mã 13)",
    meaningEn: "Frequency of high-risk behavior (Reverse of 13)",
    points: ["Consistently demonstrated", "Often demonstrated", "Sometimes demonstrated", "Rarely demonstrated", "Never demonstrated"],
    pointsVi: ["Luôn biểu hiện nguy cơ", "Thường xuyên biểu hiện", "Thỉnh thoảng biểu hiện", "Hiếm khi biểu hiện", "Không bao giờ biểu hiện"]
  },
  {
    code: "20",
    meaningVi: "Mức độ hiểu biết kiến thức y khoa",
    meaningEn: "Degree of health knowledge",
    points: ["No knowledge", "Limited knowledge", "Moderate knowledge", "Substantial knowledge", "Extensive knowledge"],
    pointsVi: ["Không có kiến thức", "Kiến thức hạn chế", "Kiến thức trung bình", "Kiến thức đáng kể", "Kiến thức sâu rộng"]
  }
];

const NOC_NIC_DOMAIN_MAP = [
  {
    num: "1 (I)",
    nocDomain: "Functional Health",
    nocDomainVi: "Sức khỏe Chức năng",
    nocClasses: "Classes A, B, C, D (Energy Maintenance, Growth & Development, Mobility, Self-Care)",
    nicDomain: "Physiological: Basic",
    nicDescVi: "Hỗ trợ chức năng thể chất cơ bản",
    nicDescEn: "Care that supports physical functioning"
  },
  {
    num: "2 (II)",
    nocDomain: "Physiologic Health",
    nocDomainVi: "Sức khỏe Sinh lý",
    nocClasses: "Classes E, F, G, H, I, J, K, L, Y, AA (Cardiopulmonary, Elimination, Fluid & Electrolytes, Immune, Metabolic, Neurocognitive, Nutrition, Tissue Integrity...)",
    nicDomain: "Physiological: Complex",
    nicDescVi: "Hỗ trợ điều hòa cân bằng nội môi",
    nicDescEn: "Care that supports homeostatic regulation"
  },
  {
    num: "3 (III)",
    nocDomain: "Psychosocial Health",
    nocDomainVi: "Sức khỏe Tâm lý Xã hội",
    nocClasses: "Classes M, N, O, P (Psychological Well-Being, Adaptation, Self-Control, Social Interaction)",
    nicDomain: "Behavioral",
    nicDescVi: "Hỗ trợ chức năng tâm lý xã hội và thay đổi lối sống",
    nicDescEn: "Care that supports psychosocial functioning and facilitates lifestyle changes"
  },
  {
    num: "4 (IV)",
    nocDomain: "Health Knowledge & Behavior",
    nocDomainVi: "Kiến thức & Hành vi Sức khỏe",
    nocClasses: "Classes Q, R, S, T, FF, GG, HH (Health Behavior, Beliefs, Knowledge, Risk Control, Safety)",
    nicDomain: "Safety",
    nicDescVi: "Hỗ trợ bảo vệ chống lại các tổn hại",
    nicDescEn: "Care that supports protection against harm"
  },
  {
    num: "5 (V)",
    nocDomain: "Perceived Health",
    nocDomainVi: "Sức khỏe Cảm nhận",
    nocClasses: "Classes U, V, EE (Health & Life Quality, Symptom Status, Satisfaction with Care)",
    nicDomain: "Family",
    nicDescVi: "Hỗ trợ chăm sóc đơn vị gia đình",
    nicDescEn: "Care that supports the family unit"
  },
  {
    num: "6 (VI)",
    nocDomain: "Family Health",
    nocDomainVi: "Sức khỏe Gia đình",
    nocClasses: "Classes W, X, Z, DD (Family Caregiver Performance, Family Well-Being, Parenting)",
    nicDomain: "Health System",
    nicDescVi: "Hỗ trợ sử dụng hiệu quả hệ thống dịch vụ y tế (lớp a và b)",
    nicDescEn: "Care that supports effective use of the health care delivery system"
  },
  {
    num: "7 (VII)",
    nocDomain: "Community Health",
    nocDomainVi: "Sức khỏe Cộng đồng",
    nocClasses: "Classes BB, CC (Community Well-Being, Community Health Protection)",
    nicDomain: "Community",
    nicDescVi: "Hỗ trợ và nâng cao sức khỏe cộng đồng (lớp c và d)",
    nicDescEn: "Care that supports the health of the community"
  }
];

const INITIAL_CARE_PLAN = {
  care_plan_id: "KHCS-2026-001",
  patient_info: {
    patient_name: "Mr. Tanaka",
    age: 76,
    gender: "Male",
    height_cm: 168,
    weight_kg: 52,
    bmi: 18.4,
    medical_diagnoses: ["Stage IV Esophageal Cancer", "Hypertension"]
  },
  nursing_care_entries: [
    {
      id: "entry-1",
      priority: 1,
      nanda_diagnosis: {
        code: "00312",
        label: "Adult pressure injury",
        domain: "11 - Safety / protection",
        class: "2 - Physical injury",
        defining_characteristics: [
          "Non-blanchable erythema in sacral region (3 sq cm)"
        ],
        related_factors: [
          "Pressure over bony prominence",
          "Spending more time lying on the couch (mostly sedentary)",
          "Underweight (BMI 18.4)"
        ]
      },
      noc_outcome: {
        code: "1101",
        label: "Tissue Integrity: Skin & Mucous Membranes",
        domain: "II - Physiologic Health",
        class: "L - Tissue Integrity",
        scale_code: "21",
        baseline_rating: 2,
        target_rating: 4,
        post_intervention_rating: 4,
        change_score: "+2",
        indicators: [
          {
            indicator_code: "110301",
            outcome_ref: "1103 - Wound Healing: Secondary Intention",
            name: "Granulation",
            score: 4
          },
          {
            indicator_code: "110307",
            outcome_ref: "1103 - Wound Healing: Secondary Intention",
            name: "Surrounding skin erythema",
            score: 2
          }
        ]
      },
      nic_interventions: [
        {
          code: "3520",
          label: "Pressure ulcer care",
          activities_selected: [
            "Monitor tissue for skin integrity and erythema",
            "Facilitate use of a pressure-relieving mattress"
          ]
        },
        {
          code: "3540",
          label: "Pressure ulcer prevention",
          activities_selected: [
            "Inspect skin over bony prominences daily"
          ]
        },
        {
          code: "0840",
          label: "Positioning",
          activities_selected: [
            "Turn and reposition patient at least every 2 hours"
          ]
        }
      ]
    },
    {
      id: "entry-2",
      priority: 2,
      nanda_diagnosis: {
        code: "00132",
        label: "Acute pain",
        domain: "12 - Comfort",
        class: "1 - Physical comfort",
        defining_characteristics: [
          "Verbal report of severe pain in lower back and hips (NRS 6/10)",
          "Inadequate appetite"
        ],
        related_factors: [
          "Physical injury agent"
        ]
      },
      noc_outcome: {
        code: "2102",
        label: "Pain Level",
        domain: "V - Perceived Health",
        class: "V - Symptom Status",
        scale_code: "26",
        baseline_rating: 2,
        target_rating: 4,
        post_intervention_rating: 4,
        change_score: "+2",
        indicators: [
          {
            indicator_code: "210201",
            outcome_ref: "2102 - Pain Level",
            name: "Reported pain",
            score: 4
          }
        ]
      },
      nic_interventions: [
        {
          code: "1410",
          label: "Pain management: Acute",
          activities_selected: [
            "Perform a comprehensive assessment of pain (location, onset, duration, intensity)"
          ]
        },
        {
          code: "2210",
          label: "Analgesic administration",
          activities_selected: [
            "Determine analgesic selections based on type and severity of pain"
          ]
        },
        {
          code: "1380",
          label: "Heat/cold application",
          activities_selected: []
        }
      ]
    }
  ]
};

export default function App() {
  const [lang, setLang] = useState('vi'); // 'vi' | 'en'
  const t = UI_TEXT[lang];

  const [activeTab, setActiveTab] = useState('careplan'); // 'careplan' | 'taxonomy' | 'migration' | 'standards'
  const [carePlan, setCarePlan] = useState(INITIAL_CARE_PLAN);
  const [carePlanViewMode, setCarePlanViewMode] = useState('visual'); // 'visual' | 'split' | 'json'
  const [toastMsg, setToastMsg] = useState(null);

  // Taxonomy Explorer State
  const [taxonomySystem, setTaxonomySystem] = useState('nanda'); // 'nanda' | 'noc' | 'nic'
  const [taxonomySearch, setTaxonomySearch] = useState('');
  const [selectedNandaDomain, setSelectedNandaDomain] = useState('ALL');
  const [selectedNocDomain, setSelectedNocDomain] = useState('ALL');

  // Migration & Audit State
  const [migrationSubTab, setMigrationSubTab] = useState('renamed'); // 'renamed' | 'retired' | 'checker'
  const [migrationSearch, setMigrationSearch] = useState('');
  const [migrationDomainFilter, setMigrationDomainFilter] = useState('ALL');
  const [checkerQuery, setCheckerQuery] = useState('Anxiety');

  // Standards & Scales State
  const [selectedScaleCode, setSelectedScaleCode] = useState('01');
  const [simulatedScore, setSimulatedScore] = useState(4);

  // Modal State for adding new Care Plan Entry
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEntryForm, setNewEntryForm] = useState({
    nandaCode: '00343',
    definingChar: 'Food intake less than recommended daily allowance',
    relatedFactor: 'Difficulty swallowing and decreased appetite',
    nocCode: '1004',
    scaleCode: '01',
    baseline: 2,
    target: 4,
    post: 3,
    nicCodes: ['1100', '1160', '1860']
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
  };

  // Helper hiển thị 100% Tiếng Việt khi chọn ngôn ngữ 'vi', hoặc 100% Tiếng Anh khi chọn 'en'
  const formatTermLabel = (code, enLabel) => {
    if (lang === 'vi') {
      return translateMedicalTermToVi(code, enLabel);
    }
    return enLabel;
  };

  const formatClinicalText = (text) => {
    if (!text) return '';
    if (lang === 'vi') {
      return CLINICAL_PHRASE_VI[text] || translateMedicalTermToVi(null, text);
    }
    return text;
  };

  const formatClassText = (classStr) => {
    if (!classStr) return '';
    if (lang === 'vi') {
      return CLASS_NAME_VI[classStr] || CLINICAL_PHRASE_VI[classStr] || translateMedicalTermToVi(null, classStr);
    }
    return classStr;
  };

  // Tạo đối tượng JSON KHCS được dịch sang Tiếng Việt khi ở chế độ 'vi'
  const localizedCarePlanJson = useMemo(() => {
    if (lang === 'en') return carePlan;
    return {
      ma_ke_hoach_cham_soc: carePlan.care_plan_id,
      thong_tin_nguoi_benh: {
        ho_va_ten: carePlan.patient_info.patient_name,
        tuoi: carePlan.patient_info.age,
        gioi_tinh: carePlan.patient_info.gender === 'Male' ? 'Nam' : 'Nữ',
        chieu_cao_cm: carePlan.patient_info.height_cm,
        can_nang_kg: carePlan.patient_info.weight_kg,
        chi_so_bmi: carePlan.patient_info.bmi,
        chan_doan_y_khoa: carePlan.patient_info.medical_diagnoses.map(d => formatClinicalText(d))
      },
      danh_muc_cham_soc_dieu_duong: carePlan.nursing_care_entries.map(entry => ({
        muc_do_uu_tien: entry.priority,
        chan_doan_nanda_i: {
          ma_so: entry.nanda_diagnosis.code,
          ten_chan_doan: formatTermLabel(entry.nanda_diagnosis.code, entry.nanda_diagnosis.label),
          linh_vuc: formatClinicalText(entry.nanda_diagnosis.domain),
          phan_lop: formatClassText(entry.nanda_diagnosis.class),
          dac_diem_xac_dinh: entry.nanda_diagnosis.defining_characteristics.map(dc => formatClinicalText(dc)),
          yeu_to_lien_quan: entry.nanda_diagnosis.related_factors.map(rf => formatClinicalText(rf))
        },
        ket_qua_dau_ra_noc: {
          ma_so: entry.noc_outcome.code,
          ten_ket_qua: formatTermLabel(entry.noc_outcome.code, entry.noc_outcome.label),
          linh_vuc: formatClinicalText(entry.noc_outcome.domain),
          phan_lop: formatClassText(entry.noc_outcome.class),
          ma_thang_do: entry.noc_outcome.scale_code,
          diem_ban_dau: entry.noc_outcome.baseline_rating,
          diem_muc_tieu: entry.noc_outcome.target_rating,
          diem_sau_can_thiep: entry.noc_outcome.post_intervention_rating,
          muc_do_cai_thien: entry.noc_outcome.change_score,
          chi_so_do_luong: (entry.noc_outcome.indicators || []).map(ind => ({
            ma_chi_so: ind.indicator_code,
            tham_chieu_noc: formatClinicalText(ind.outcome_ref),
            ten_chi_so: formatClinicalText(ind.name),
            diem_so: ind.score
          }))
        },
        can_thiep_dieu_duong_nic: entry.nic_interventions.map(nic => ({
          ma_so: nic.code,
          ten_can_thiep: formatTermLabel(nic.code, nic.label),
          hoat_dong_dieu_duong: (nic.activities_selected || []).map(act => formatClinicalText(act))
        }))
      }))
    };
  }, [carePlan, lang]);

  // Flatten NANDA list for search and dropdowns
  const flatNandaList = useMemo(() => {
    const list = [];
    Object.entries(NANDA_DATA).forEach(([domainKey, classesObj]) => {
      const domainMeta = NANDA_DOMAINS_META.find(d => d.id === domainKey);
      Object.entries(classesObj).forEach(([classKey, items]) => {
        const classFormatted = classKey.replace(/_/g, ' ');
        items.forEach(item => {
          list.push({
            ...item,
            viSub: translateMedicalTermToVi(item.code, item.label),
            domainId: domainKey,
            domainNum: domainMeta ? domainMeta.number : 0,
            domainNameEn: domainMeta ? domainMeta.nameEn : domainKey,
            domainNameVi: domainMeta ? domainMeta.nameVi : '',
            className: classFormatted,
            classNameVi: CLASS_NAME_VI[classFormatted] || classFormatted
          });
        });
      });
    });
    return list;
  }, []);

  // Flatten NOC list for search and dropdowns
  const flatNocList = useMemo(() => {
    const list = [];
    Object.entries(NOC_DATA).forEach(([domainKey, domainVal]) => {
      Object.entries(domainVal.classes).forEach(([classKey, outcomesObj]) => {
        const classFormatted = classKey.replace(/_/g, ' ');
        Object.entries(outcomesObj).forEach(([code, label]) => {
          list.push({
            code,
            label,
            viSub: translateMedicalTermToVi(code, label),
            domainKey,
            domainNameVi: domainVal.nameVi.replace(/\s*\([^)]*\)/g, ''),
            domainNameEn: domainVal.nameEn,
            className: classFormatted,
            classNameVi: CLASS_NAME_VI[classFormatted] || classFormatted
          });
        });
      });
    });
    return list;
  }, []);

  // Flatten NIC list
  const flatNicList = useMemo(() => {
    return Object.entries(NIC_INTERVENTIONS).map(([code, label]) => ({
      code,
      label,
      viSub: translateMedicalTermToVi(code, label)
    })).sort((a, b) => a.label.localeCompare(b.label));
  }, []);

  const filteredNanda = useMemo(() => {
    const q = taxonomySearch.trim().toLowerCase();
    return flatNandaList.filter(item => {
      const matchDomain = selectedNandaDomain === 'ALL' || item.domainId === selectedNandaDomain;
      const matchQuery = !q ||
        item.code.toLowerCase().includes(q) ||
        item.label.toLowerCase().includes(q) ||
        item.viSub.toLowerCase().includes(q) ||
        item.className.toLowerCase().includes(q);
      return matchDomain && matchQuery;
    });
  }, [flatNandaList, taxonomySearch, selectedNandaDomain]);

  const filteredNoc = useMemo(() => {
    const q = taxonomySearch.trim().toLowerCase();
    return flatNocList.filter(item => {
      const matchDomain = selectedNocDomain === 'ALL' || item.domainKey === selectedNocDomain;
      const matchQuery = !q ||
        item.code.toLowerCase().includes(q) ||
        item.label.toLowerCase().includes(q) ||
        item.viSub.toLowerCase().includes(q) ||
        item.className.toLowerCase().includes(q);
      return matchDomain && matchQuery;
    });
  }, [flatNocList, taxonomySearch, selectedNocDomain]);

  const filteredNic = useMemo(() => {
    const q = taxonomySearch.trim().toLowerCase();
    return flatNicList.filter(item => {
      return !q ||
        item.code.toLowerCase().includes(q) ||
        item.label.toLowerCase().includes(q) ||
        item.viSub.toLowerCase().includes(q);
    });
  }, [flatNicList, taxonomySearch]);

  const filteredMappings = useMemo(() => {
    const q = migrationSearch.trim().toLowerCase();
    return NANDA_LABEL_MAPPINGS.filter(item => {
      const matchDomain = migrationDomainFilter === 'ALL' || String(item.domain) === String(migrationDomainFilter);
      const matchQ = !q ||
        item.previous_label.toLowerCase().includes(q) ||
        item.new_label_2024_2026.toLowerCase().includes(q) ||
        item.new_code.toLowerCase().includes(q);
      return matchDomain && matchQ;
    });
  }, [migrationSearch, migrationDomainFilter]);

  const filteredRetired = useMemo(() => {
    const q = migrationSearch.trim().toLowerCase();
    return NANDA_RETIRED_DIAGNOSES.filter(item => {
      const matchDomain = migrationDomainFilter === 'ALL' || String(item.domain) === String(migrationDomainFilter);
      const matchQ = !q ||
        item.retired_label.toLowerCase().includes(q) ||
        item.retired_code.toLowerCase().includes(q);
      return matchDomain && matchQ;
    });
  }, [migrationSearch, migrationDomainFilter]);

  // Live Validator Results
  const checkerResults = useMemo(() => {
    const q = checkerQuery.trim().toLowerCase();
    if (!q) return { active: [], renamed: [], retired: [] };
    return {
      active: flatNandaList.filter(i => i.code.toLowerCase().includes(q) || i.label.toLowerCase().includes(q) || i.viSub.toLowerCase().includes(q)).slice(0, 6),
      renamed: NANDA_LABEL_MAPPINGS.filter(i => i.previous_label.toLowerCase().includes(q) || i.new_label_2024_2026.toLowerCase().includes(q) || i.new_code.toLowerCase().includes(q)).slice(0, 6),
      retired: NANDA_RETIRED_DIAGNOSES.filter(i => i.retired_code.toLowerCase().includes(q) || i.retired_label.toLowerCase().includes(q)).slice(0, 6)
    };
  }, [checkerQuery, flatNandaList]);

  const handlePatientInfoChange = (field, value) => {
    setCarePlan(prev => {
      const updated = { ...prev.patient_info, [field]: value };
      if (field === 'height_cm' || field === 'weight_kg') {
        const h = Number(field === 'height_cm' ? value : updated.height_cm) / 100;
        const w = Number(field === 'weight_kg' ? value : updated.weight_kg);
        if (h > 0 && w > 0) {
          updated.bmi = Number((w / (h * h)).toFixed(1));
        }
      }
      return { ...prev, patient_info: updated };
    });
  };

  const handleRatingChange = (entryId, field, newVal) => {
    const numericVal = Number(newVal);
    setCarePlan(prev => ({
      ...prev,
      nursing_care_entries: prev.nursing_care_entries.map(entry => {
        if (entry.id !== entryId) return entry;
        const updatedNoc = { ...entry.noc_outcome, [field]: numericVal };
        const base = field === 'baseline_rating' ? numericVal : updatedNoc.baseline_rating;
        const post = field === 'post_intervention_rating' ? numericVal : (updatedNoc.post_intervention_rating || base);
        const diff = post - base;
        updatedNoc.change_score = diff >= 0 ? `+${diff}` : `${diff}`;
        return { ...entry, noc_outcome: updatedNoc };
      })
    }));
  };

  const handleDeleteEntry = (entryId) => {
    setCarePlan(prev => ({
      ...prev,
      nursing_care_entries: prev.nursing_care_entries
        .filter(e => e.id !== entryId)
        .map((e, idx) => ({ ...e, priority: idx + 1 }))
    }));
    showToast(lang === 'vi' ? "Đã xóa mục chẩn đoán khỏi Kế hoạch chăm sóc." : "Removed diagnosis entry from Care Plan.");
  };

  const handleAddEntrySubmit = (e) => {
    e.preventDefault();
    const nandaObj = flatNandaList.find(n => n.code === newEntryForm.nandaCode) || flatNandaList[0];
    const nocObj = flatNocList.find(n => n.code === newEntryForm.nocCode) || flatNocList[0];
    const diff = Number(newEntryForm.post) - Number(newEntryForm.baseline);

    const newEntry = {
      id: `entry-${Date.now()}`,
      priority: carePlan.nursing_care_entries.length + 1,
      nanda_diagnosis: {
        code: nandaObj.code,
        label: nandaObj.label,
        domain: `${nandaObj.domainNum} - ${nandaObj.domainNameEn}`,
        class: nandaObj.className,
        defining_characteristics: newEntryForm.definingChar ? [newEntryForm.definingChar] : [],
        related_factors: newEntryForm.relatedFactor ? [newEntryForm.relatedFactor] : []
      },
      noc_outcome: {
        code: nocObj.code,
        label: nocObj.label,
        domain: lang === 'vi' ? nocObj.domainNameVi : nocObj.domainNameEn,
        class: nocObj.className,
        scale_code: newEntryForm.scaleCode,
        baseline_rating: Number(newEntryForm.baseline),
        target_rating: Number(newEntryForm.target),
        post_intervention_rating: Number(newEntryForm.post),
        change_score: diff >= 0 ? `+${diff}` : `${diff}`,
        indicators: []
      },
      nic_interventions: newEntryForm.nicCodes.map(code => ({
        code,
        label: NIC_INTERVENTIONS[code] || "Nursing Intervention",
        activities_selected: []
      }))
    };

    setCarePlan(prev => ({
      ...prev,
      nursing_care_entries: [...prev.nursing_care_entries, newEntry]
    }));
    setIsAddModalOpen(false);
    showToast(
      lang === 'vi'
        ? `Đã thêm NANDA ${nandaObj.code} (${nandaObj.label}) vào KHCS!`
        : `Added NANDA ${nandaObj.code} (${nandaObj.label}) to Care Plan!`
    );
  };

  const handleCopyJson = (dataObj, label = "JSON") => {
    const cleanCopy = JSON.parse(JSON.stringify(dataObj));
    if (cleanCopy.nursing_care_entries) {
      cleanCopy.nursing_care_entries.forEach(e => delete e.id);
    }
    navigator.clipboard.writeText(JSON.stringify(cleanCopy, null, 2));
    showToast(lang === 'vi' ? `Đã sao chép ${label} vào bộ nhớ tạm!` : `Copied ${label} to clipboard!`);
  };

  const handleDownloadJson = (dataObj, filename) => {
    const cleanCopy = JSON.parse(JSON.stringify(dataObj));
    if (cleanCopy.nursing_care_entries) {
      cleanCopy.nursing_care_entries.forEach(e => delete e.id);
    }
    const blob = new Blob([JSON.stringify(cleanCopy, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    showToast(lang === 'vi' ? `Đã tải xuống tệp ${filename}` : `Downloaded file ${filename}`);
  };

  const activeScaleObj = useMemo(() => {
    return NOC_SCALES.find(s => s.code === selectedScaleCode) || NOC_SCALES[0];
  }, [selectedScaleCode]);

  return (
    <div className="min-h-screen bg-slate-100/80 text-slate-800 flex flex-col font-sans selection:bg-teal-600 selection:text-white">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 bg-slate-900 text-white px-4 py-3.5 rounded-2xl shadow-2xl border border-teal-500/40 animate-bounce">
          <div className="bg-teal-500/20 p-1.5 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
          </div>
          <span className="text-sm font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Top Clinical Header */}
      <header className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white shadow-lg sticky top-0 z-30 border-b border-teal-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Brand Logo & Title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="bg-gradient-to-br from-teal-400 to-cyan-600 p-2.5 rounded-2xl shadow-md shadow-teal-950/50 flex items-center justify-center">
                <HeartPulse className="w-7 h-7 text-slate-950 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-base sm:text-xl font-extrabold tracking-tight text-white">
                    {t.appTitle}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-400/15 text-teal-300 border border-teal-400/30">
                    <Sparkles className="w-3 h-3" />
                    {t.ehrBadge}
                  </span>
                </div>
                <p className="text-xs text-slate-300/90 mt-0.5">
                  {t.appSubtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Right Controls: KPI Badges & Language Toggle */}
          <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3">
            {/* Compact KPI Pills */}
            <div className="hidden xl:flex items-center gap-2 text-xs">
              <div className="bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span className="text-slate-300">{t.statsNanda}:</span>
                <strong className="text-white font-mono">277</strong>
              </div>
              <div className="bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span className="text-slate-300">{t.statsNoc}:</span>
                <strong className="text-white font-mono">540</strong>
              </div>
              <div className="bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-slate-300">{t.statsNic}:</span>
                <strong className="text-white font-mono">565</strong>
              </div>
            </div>

            {/* Bilingual Switcher (VI / EN) */}
            <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700 shadow-inner">
              <div className="flex items-center gap-1.5 px-2.5 text-xs text-slate-400 font-medium">
                <Globe className="w-3.5 h-3.5 text-teal-400" />
                <span className="hidden sm:inline">{t.langLabel}:</span>
              </div>
              <button
                onClick={() => setLang('vi')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  lang === 'vi'
                    ? 'bg-teal-500 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <span>🇻🇳</span>
                <span>Tiếng Việt</span>
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  lang === 'en'
                    ? 'bg-teal-500 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <span>🇬🇧</span>
                <span>English</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Bar */}
        <div className="bg-slate-950/60 border-t border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex overflow-x-auto no-scrollbar gap-1 py-1.5">
            {[
              { id: 'careplan', label: t.tabs.careplan, icon: ClipboardList, badge: carePlan.nursing_care_entries.length },
              { id: 'taxonomy', label: t.tabs.taxonomy, icon: Database, badge: "1,382" },
              { id: 'migration', label: t.tabs.migration, icon: RefreshCw, badge: "98 / 46" },
              { id: 'standards', label: t.tabs.standards, icon: Sliders, badge: "13 Scales" }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-teal-400 text-slate-950 font-extrabold' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {tab.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {}
        {/* ===================================================================
            TAB 1: LẬP KẾ HOẠCH CHĂM SÓC ĐIỆN TỬ (KHCS - CARE PLAN BUILDER)
           =================================================================== */}
        {activeTab === 'careplan' && (
          <div className="space-y-6">
            {/* Patient Banner & Control Bar */}
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200/90 overflow-hidden">
              {/* Top Action Header */}
              <div className="bg-gradient-to-r from-slate-50 via-teal-50/30 to-slate-50 px-5 py-4 border-b border-slate-200/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="bg-teal-600 text-white p-3 rounded-2xl shadow-xs">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-extrabold uppercase tracking-wider text-teal-800 bg-teal-100/80 px-2.5 py-0.5 rounded-lg border border-teal-300">
                        {carePlan.care_plan_id}
                      </span>
                      <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                        {t.careplan.patientProfile}
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {t.careplan.patientSubtitle}
                    </p>
                  </div>
                </div>

                {/* View Mode Switcher & Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex rounded-xl bg-slate-200/70 p-1 border border-slate-300/60">
                    <button
                      onClick={() => setCarePlanViewMode('visual')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                        carePlanViewMode === 'visual'
                          ? 'bg-white text-teal-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>{t.careplan.visualMode}</span>
                    </button>
                    <button
                      onClick={() => setCarePlanViewMode('split')}
                      className={`hidden md:flex px-3 py-1.5 rounded-lg text-xs font-bold items-center gap-1.5 transition ${
                        carePlanViewMode === 'split'
                          ? 'bg-white text-teal-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>{t.careplan.splitMode}</span>
                    </button>
                    <button
                      onClick={() => setCarePlanViewMode('json')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                        carePlanViewMode === 'json'
                          ? 'bg-white text-teal-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      <span>{t.careplan.jsonMode}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t.careplan.addEntryBtn}</span>
                  </button>

                  <button
                    onClick={() => handleCopyJson(carePlan, "Care Plan JSON")}
                    className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 border border-slate-300 transition cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>{t.careplan.copyJsonBtn}</span>
                  </button>

                  <button
                    onClick={() => handleDownloadJson(carePlan, `${carePlan.care_plan_id}.json`)}
                    className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 border border-slate-300 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>{t.careplan.exportJsonBtn}</span>
                  </button>
                </div>
              </div>

              {/* Patient Demographics & NOC Progression Summary Grid */}
              <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80">
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{t.careplan.patientName}</label>
                    <input
                      type="text"
                      value={carePlan.patient_info.patient_name}
                      onChange={(e) => handlePatientInfoChange('patient_name', e.target.value)}
                      className="mt-1.5 w-full bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 text-sm font-extrabold text-slate-900 focus:outline-none focus:border-teal-600"
                    />
                  </div>

                  <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80">
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{t.careplan.ageGender}</label>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <input
                        type="number"
                        value={carePlan.patient_info.age}
                        onChange={(e) => handlePatientInfoChange('age', Number(e.target.value))}
                        className="w-16 bg-white px-2 py-1.5 rounded-lg border border-slate-200 text-sm font-extrabold text-slate-900"
                      />
                      <select
                        value={carePlan.patient_info.gender}
                        onChange={(e) => handlePatientInfoChange('gender', e.target.value)}
                        className="flex-1 bg-white px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700"
                      >
                        <option value="Male">{t.careplan.male}</option>
                        <option value="Female">{t.careplan.female}</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80">
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{t.careplan.bmiAuto}</label>
                    <div className="mt-2 flex items-center justify-between">
                      <span className={`text-lg font-black font-mono ${carePlan.patient_info.bmi < 18.5 ? 'text-amber-600' : 'text-teal-700'}`}>
                        {carePlan.patient_info.bmi}
                      </span>
                      <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold ${
                        carePlan.patient_info.bmi < 18.5
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-teal-100 text-teal-800 border border-teal-300'
                      }`}>
                        {carePlan.patient_info.bmi < 18.5 ? t.careplan.underweight : carePlan.patient_info.bmi < 25 ? t.careplan.normalWeight : t.careplan.overweight}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80">
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{t.careplan.height}</label>
                    <input
                      type="number"
                      value={carePlan.patient_info.height_cm}
                      onChange={(e) => handlePatientInfoChange('height_cm', Number(e.target.value))}
                      className="mt-1.5 w-full bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 text-sm font-bold text-slate-800"
                    />
                  </div>

                  <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80">
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{t.careplan.weight}</label>
                    <input
                      type="number"
                      value={carePlan.patient_info.weight_kg}
                      onChange={(e) => handlePatientInfoChange('weight_kg', Number(e.target.value))}
                      className="mt-1.5 w-full bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 text-sm font-bold text-slate-800"
                    />
                  </div>

                  <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80">
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{t.careplan.medicalDiag}</label>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {carePlan.patient_info.medical_diagnoses.map((diag, i) => (
                        <span key={i} className="text-[11px] bg-rose-50 text-rose-800 border border-rose-200 px-2 py-0.5 rounded-md font-bold">
                          {formatClinicalText(diag)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Mini Summary of NOC Outcomes */}
                <div className="lg:col-span-4 bg-gradient-to-br from-teal-900 to-slate-900 text-white p-4 rounded-2xl border border-teal-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4" />
                      {t.careplan.summaryProgress}
                    </span>
                    <span className="text-[11px] font-mono bg-white/10 px-2 py-0.5 rounded text-teal-200">
                      Likert 1–5
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {carePlan.nursing_care_entries.map((entry) => {
                      const post = entry.noc_outcome.post_intervention_rating || entry.noc_outcome.baseline_rating;
                      const pct = Math.min(100, Math.round((post / 5) * 100));
                      return (
                        <div key={entry.id} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-semibold truncate max-w-[200px]">
                              #{entry.priority} [{entry.noc_outcome.code}] {formatTermLabel(entry.noc_outcome.code, entry.noc_outcome.label)}
                            </span>
                            <span className="font-mono font-bold text-emerald-300">
                              {entry.noc_outcome.baseline_rating} → {post}/5 ({entry.noc_outcome.change_score})
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full transition-all duration-300"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Care Plan Content: Visual / Split / JSON */}
            <div className={carePlanViewMode === 'split' ? 'grid grid-cols-1 xl:grid-cols-12 gap-6 items-start' : 'space-y-6'}>
              {/* Visual Clinical Cards */}
              {(carePlanViewMode === 'visual' || carePlanViewMode === 'split') && (
                <div className={`${carePlanViewMode === 'split' ? 'xl:col-span-7' : ''} space-y-5`}>
                  {carePlan.nursing_care_entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="bg-white rounded-2xl shadow-xs border border-slate-200/90 overflow-hidden transition hover:shadow-md"
                    >
                      {/* Entry Priority Header */}
                      <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 text-xs font-black px-3 py-1 rounded-lg tracking-wide">
                            {t.careplan.priority} #{entry.priority}
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-slate-200">
                            {t.careplan.linkageHeader}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                          title={t.careplan.deleteEntry}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* 3-Column Clinical Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
                        {/* Column 1: NANDA-I Diagnosis */}
                        <div className="p-5 space-y-4 bg-gradient-to-b from-rose-50/40 to-transparent">
                          <div>
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-rose-800 bg-rose-100/90 px-2.5 py-1 rounded-lg border border-rose-200">
                              <Stethoscope className="w-3.5 h-3.5" />
                              {t.careplan.nandaBadge}
                            </span>
                            <div className="mt-2.5 flex items-baseline gap-2">
                              <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-rose-600 text-white">
                                {entry.nanda_diagnosis.code}
                              </span>
                              <h3 className="text-base font-extrabold text-slate-900">
                                {formatTermLabel(entry.nanda_diagnosis.code, entry.nanda_diagnosis.label)}
                              </h3>
                            </div>
                          </div>

                          <div className="text-xs text-slate-600 space-y-1 bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                            <div><span className="font-bold text-slate-800">{t.careplan.domainLabel}:</span> {formatClinicalText(entry.nanda_diagnosis.domain)}</div>
                            <div><span className="font-bold text-slate-800">{t.careplan.classLabel}:</span> {formatClassText(entry.nanda_diagnosis.class)}</div>
                          </div>

                          <div>
                            <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                              {t.careplan.definingChar}
                            </h4>
                            <ul className="space-y-1.5">
                              {entry.nanda_diagnosis.defining_characteristics.map((dc, i) => (
                                <li key={i} className="text-xs text-slate-700 flex items-start gap-2 bg-white p-2.5 rounded-xl border border-slate-200/80">
                                  <span className="w-2 h-2 rounded-full bg-rose-500 mt-1 shrink-0" />
                                  <span className="font-medium">{formatClinicalText(dc)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                              {t.careplan.relatedFactors}
                            </h4>
                            <ul className="space-y-1.5">
                              {entry.nanda_diagnosis.related_factors.map((rf, i) => (
                                <li key={i} className="text-xs text-slate-700 flex items-start gap-2 bg-white p-2.5 rounded-xl border border-slate-200/80">
                                  <span className="w-2 h-2 rounded-full bg-amber-500 mt-1 shrink-0" />
                                  <span className="font-medium">{formatClinicalText(rf)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Column 2: NOC Outcome & Likert Rating */}
                        <div className="p-5 space-y-4 bg-gradient-to-b from-cyan-50/40 to-transparent">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-cyan-900 bg-cyan-100/90 px-2.5 py-1 rounded-lg border border-cyan-200">
                                <Scale className="w-3.5 h-3.5" />
                                {t.careplan.nocBadge}
                              </span>
                              <div className="mt-2.5 flex items-baseline gap-2">
                                <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-cyan-700 text-white">
                                  {entry.noc_outcome.code}
                                </span>
                                <h3 className="text-base font-extrabold text-slate-900">
                                  {formatTermLabel(entry.noc_outcome.code, entry.noc_outcome.label)}
                                </h3>
                              </div>
                            </div>
                            <span className="text-[11px] font-mono font-bold bg-slate-800 text-cyan-300 px-2.5 py-1 rounded-lg shrink-0">
                              {lang === 'vi' ? `Thang #${entry.noc_outcome.scale_code}` : `Scale #${entry.noc_outcome.scale_code}`}
                            </span>
                          </div>

                          <div className="text-xs text-slate-600 space-y-1 bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                            <div><span className="font-bold text-slate-800">{t.careplan.domainLabel}:</span> {formatClinicalText(entry.noc_outcome.domain)}</div>
                            <div><span className="font-bold text-slate-800">{t.careplan.classLabel}:</span> {formatClassText(entry.noc_outcome.class)}</div>
                          </div>

                          {/* Interactive Likert 1-5 Evaluation */}
                          <div className="bg-white p-4 rounded-xl border border-cyan-200/90 shadow-2xs space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-extrabold text-slate-800">{t.careplan.likertTitle}</span>
                              <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300">
                                {t.careplan.changeScore}: {entry.noc_outcome.change_score || "+0"}
                              </span>
                            </div>

                            <div className="space-y-2.5 text-xs">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-slate-600 font-medium w-32">{t.careplan.baseline}:</span>
                                <input
                                  type="range"
                                  min="1"
                                  max="5"
                                  value={entry.noc_outcome.baseline_rating}
                                  onChange={(e) => handleRatingChange(entry.id, 'baseline_rating', e.target.value)}
                                  className="flex-1 accent-cyan-700 cursor-pointer"
                                />
                                <span className="w-7 text-center font-mono font-black text-cyan-900 bg-cyan-100 rounded-md py-0.5">
                                  {entry.noc_outcome.baseline_rating}
                                </span>
                              </div>

                              <div className="flex items-center justify-between gap-2">
                                <span className="text-slate-600 font-medium w-32">{t.careplan.target}:</span>
                                <input
                                  type="range"
                                  min="1"
                                  max="5"
                                  value={entry.noc_outcome.target_rating}
                                  onChange={(e) => handleRatingChange(entry.id, 'target_rating', e.target.value)}
                                  className="flex-1 accent-teal-600 cursor-pointer"
                                />
                                <span className="w-7 text-center font-mono font-black text-teal-900 bg-teal-100 rounded-md py-0.5">
                                  {entry.noc_outcome.target_rating}
                                </span>
                              </div>

                              <div className="flex items-center justify-between gap-2">
                                <span className="text-slate-600 font-medium w-32">{t.careplan.postIntervention}:</span>
                                <input
                                  type="range"
                                  min="1"
                                  max="5"
                                  value={entry.noc_outcome.post_intervention_rating || entry.noc_outcome.baseline_rating}
                                  onChange={(e) => handleRatingChange(entry.id, 'post_intervention_rating', e.target.value)}
                                  className="flex-1 accent-emerald-600 cursor-pointer"
                                />
                                <span className="w-7 text-center font-mono font-black text-emerald-900 bg-emerald-100 rounded-md py-0.5">
                                  {entry.noc_outcome.post_intervention_rating || entry.noc_outcome.baseline_rating}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Indicators */}
                          {entry.noc_outcome.indicators && entry.noc_outcome.indicators.length > 0 && (
                            <div>
                              <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                                {t.careplan.indicatorsTitle}
                              </h4>
                              <div className="space-y-1.5">
                                {entry.noc_outcome.indicators.map((ind, idx) => (
                                  <div key={idx} className="bg-white p-2.5 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                                    <div>
                                      <span className="font-mono font-black text-cyan-800 mr-1.5">#{ind.indicator_code}</span>
                                      <span className="font-bold text-slate-800">{formatClinicalText(ind.name)}</span>
                                      <div className="text-[10px] text-slate-400">{formatClinicalText(ind.outcome_ref)}</div>
                                    </div>
                                    <span className="px-2.5 py-1 rounded-lg bg-cyan-50 text-cyan-900 font-mono font-extrabold border border-cyan-200">
                                      {t.careplan.scoreLabel}: {ind.score}/5
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Column 3: NIC Interventions */}
                        <div className="p-5 space-y-4 bg-gradient-to-b from-emerald-50/40 to-transparent">
                          <div>
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-emerald-900 bg-emerald-100/90 px-2.5 py-1 rounded-lg border border-emerald-200">
                              <Activity className="w-3.5 h-3.5" />
                              {t.careplan.nicBadge}
                            </span>
                            <h3 className="text-sm font-extrabold text-slate-800 mt-2.5">
                              {t.careplan.nicCountLabel} ({entry.nic_interventions.length} NIC)
                            </h3>
                          </div>

                          <div className="space-y-2.5">
                            {entry.nic_interventions.map((nic, idx) => (
                              <div key={idx} className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-mono text-xs font-black text-white bg-emerald-700 px-2 py-0.5 rounded">
                                    NIC {nic.code}
                                  </span>
                                  <span className="text-[11px] font-semibold text-slate-400">{t.careplan.nicActivityTag}</span>
                                </div>
                                <div>
                                  <div className="text-sm font-extrabold text-slate-900">
                                    {formatTermLabel(nic.code, nic.label)}
                                  </div>
                                </div>
                                {nic.activities_selected && nic.activities_selected.length > 0 ? (
                                  <ul className="space-y-1.5 pt-2 border-t border-slate-100">
                                    {nic.activities_selected.map((act, i) => (
                                      <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                        <span className="font-medium">{formatClinicalText(act)}</span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-[11px] italic text-slate-400 pt-1 border-t border-slate-100">
                                    {t.careplan.noActivities}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* JSON EHR Schema Viewer (Full or Split) */}
              {(carePlanViewMode === 'json' || carePlanViewMode === 'split') && (
                <div className={`${carePlanViewMode === 'split' ? 'xl:col-span-5 sticky top-28' : ''} bg-slate-900 rounded-2xl p-5 text-slate-100 shadow-xl border border-slate-800`}>
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <FileJson className="w-5 h-5 text-teal-400 shrink-0" />
                      <span className="text-xs sm:text-sm font-bold text-white">
                        {t.careplan.jsonHeader}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopyJson(localizedCarePlanJson, "JSON KHCS")}
                      className="px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 transition shrink-0 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{t.careplan.copyJsonBtn}</span>
                    </button>
                  </div>
                  <pre className="text-xs font-mono text-teal-300 overflow-x-auto leading-relaxed max-h-[680px]">
                    {JSON.stringify(localizedCarePlanJson, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 2: THƯ VIỆN TRA CỨU DANH MỤC NNN (TAXONOMY EXPLORER)
           =================================================================== */}
        {activeTab === 'taxonomy' && (
          <div className="space-y-5">
            {/* System Selector & Search Header */}
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">{t.taxonomy.title}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{t.taxonomy.subtitle}</p>
                </div>
                <button
                  onClick={() => {
                    if (taxonomySystem === 'nanda') handleCopyJson(NANDA_DATA, "NANDA-I 2024-2026 JSON");
                    if (taxonomySystem === 'noc') handleCopyJson(NOC_DATA, "NOC 6th Ed JSON");
                    if (taxonomySystem === 'nic') handleCopyJson(NIC_INTERVENTIONS, "NIC 7th Ed JSON");
                  }}
                  className="self-start md:self-auto px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 border border-slate-200 transition cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{t.taxonomy.copySystemJson}</span>
                </button>
              </div>

              {/* 3 Taxonomy Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => { setTaxonomySystem('nanda'); setTaxonomySearch(''); }}
                  className={`p-3.5 rounded-xl text-left border transition flex items-center justify-between cursor-pointer ${
                    taxonomySystem === 'nanda'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Stethoscope className="w-5 h-5 shrink-0" />
                    <div>
                      <div className="text-xs sm:text-sm font-extrabold">{t.taxonomy.nandaTab}</div>
                      <div className={`text-[11px] ${taxonomySystem === 'nanda' ? 'text-rose-100' : 'text-slate-500'}`}>
                        {lang === 'vi' ? '13 Lĩnh vực • 48 Phân lớp' : '13 Domains • 48 Classes'}
                      </div>
                    </div>
                  </div>
                  <span className={`font-mono text-xs font-black px-2.5 py-1 rounded-lg ${
                    taxonomySystem === 'nanda' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {flatNandaList.length}
                  </span>
                </button>

                <button
                  onClick={() => { setTaxonomySystem('noc'); setTaxonomySearch(''); }}
                  className={`p-3.5 rounded-xl text-left border transition flex items-center justify-between cursor-pointer ${
                    taxonomySystem === 'noc'
                      ? 'bg-cyan-700 text-white border-cyan-700 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Scale className="w-5 h-5 shrink-0" />
                    <div>
                      <div className="text-xs sm:text-sm font-extrabold">{t.taxonomy.nocTab}</div>
                      <div className={`text-[11px] ${taxonomySystem === 'noc' ? 'text-cyan-100' : 'text-slate-500'}`}>
                        {lang === 'vi' ? '7 Lĩnh vực • 34 Phân lớp' : '7 Domains • 34 Classes'}
                      </div>
                    </div>
                  </div>
                  <span className={`font-mono text-xs font-black px-2.5 py-1 rounded-lg ${
                    taxonomySystem === 'noc' ? 'bg-white/20 text-white' : 'bg-cyan-100 text-cyan-800'
                  }`}>
                    {flatNocList.length}
                  </span>
                </button>

                <button
                  onClick={() => { setTaxonomySystem('nic'); setTaxonomySearch(''); }}
                  className={`p-3.5 rounded-xl text-left border transition flex items-center justify-between cursor-pointer ${
                    taxonomySystem === 'nic'
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 shrink-0" />
                    <div>
                      <div className="text-xs sm:text-sm font-extrabold">{t.taxonomy.nicTab}</div>
                      <div className={`text-[11px] ${taxonomySystem === 'nic' ? 'text-emerald-100' : 'text-slate-500'}`}>
                        {lang === 'vi' ? '7 Lĩnh vực • 30 Phân lớp' : '7 Domains • 30 Classes'}
                      </div>
                    </div>
                  </div>
                  <span className={`font-mono text-xs font-black px-2.5 py-1 rounded-lg ${
                    taxonomySystem === 'nic' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {flatNicList.length}
                  </span>
                </button>
              </div>

              {/* Search & Domain Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={taxonomySearch}
                    onChange={(e) => setTaxonomySearch(e.target.value)}
                    placeholder={
                      taxonomySystem === 'nanda'
                        ? t.taxonomy.searchPlaceholderNanda
                        : taxonomySystem === 'noc'
                        ? t.taxonomy.searchPlaceholderNoc
                        : t.taxonomy.searchPlaceholderNic
                    }
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-600 focus:bg-white"
                  />
                </div>

                {taxonomySystem === 'nanda' && (
                  <select
                    value={selectedNandaDomain}
                    onChange={(e) => setSelectedNandaDomain(e.target.value)}
                    className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-teal-600"
                  >
                    <option value="ALL">{t.taxonomy.allNandaDomains}</option>
                    {NANDA_DOMAINS_META.map(d => (
                      <option key={d.id} value={d.id}>
                        {lang === 'vi' ? `Lĩnh vực ${d.number}: ${d.nameVi}` : `Domain ${d.number}: ${d.nameEn}`}
                      </option>
                    ))}
                  </select>
                )}

                {taxonomySystem === 'noc' && (
                  <select
                    value={selectedNocDomain}
                    onChange={(e) => setSelectedNocDomain(e.target.value)}
                    className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-teal-600"
                  >
                    <option value="ALL">{t.taxonomy.allNocDomains}</option>
                    {Object.entries(NOC_DATA).map(([key, val]) => (
                      <option key={key} value={key}>{lang === 'vi' ? val.nameVi.replace(/\s*\([^)]*\)/g, '') : val.nameEn}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Taxonomy Results List */}
            {taxonomySystem === 'nanda' && (
              <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
                <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                    {t.taxonomy.nandaTab} — {t.taxonomy.showingResults} {filteredNanda.length} {t.taxonomy.resultsUnit}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">{t.taxonomy.nandaFormatNote}</span>
                </div>
                <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                  {filteredNanda.map((item, idx) => (
                    <div key={`${item.code}-${idx}`} className="p-4 hover:bg-slate-50/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                            {item.code}
                          </span>
                          <span className="text-sm font-extrabold text-slate-900">
                            {lang === 'vi' ? item.viSub : item.label}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-slate-700">
                            {lang === 'vi'
                              ? `Lĩnh vực ${item.domainNum}: ${item.domainNameVi}`
                              : `Domain ${item.domainNum}: ${item.domainNameEn}`}
                          </span>
                          <span>•</span>
                          <span>{lang === 'vi' ? item.classNameVi : item.className}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setNewEntryForm(prev => ({ ...prev, nandaCode: item.code }));
                          setIsAddModalOpen(true);
                        }}
                        className="self-start sm:self-center px-3.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-600 hover:text-white text-teal-800 text-xs font-bold border border-teal-200 shrink-0 transition cursor-pointer"
                      >
                        + {t.taxonomy.selectForCarePlan}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {taxonomySystem === 'noc' && (
              <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
                <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                    {t.taxonomy.nocTab} — {t.taxonomy.showingResults} {filteredNoc.length} {t.taxonomy.resultsUnit}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">{t.taxonomy.nocFormatNote}</span>
                </div>
                <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                  {filteredNoc.map((item, idx) => (
                    <div key={`${item.code}-${idx}`} className="p-4 hover:bg-slate-50/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-md bg-cyan-50 text-cyan-800 border border-cyan-200">
                            NOC {item.code}
                          </span>
                          <span className="text-sm font-extrabold text-slate-900">
                            {lang === 'vi' ? item.viSub : item.label}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500">
                          <span className="font-semibold text-slate-700">{lang === 'vi' ? item.domainNameVi : item.domainNameEn}</span> • {lang === 'vi' ? item.classNameVi : `Class: ${item.className}`}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setNewEntryForm(prev => ({ ...prev, nocCode: item.code }));
                          setIsAddModalOpen(true);
                        }}
                        className="self-start sm:self-center px-3.5 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-700 hover:text-white text-cyan-800 text-xs font-bold border border-cyan-200 shrink-0 transition cursor-pointer"
                      >
                        + {t.taxonomy.selectForCarePlan}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {taxonomySystem === 'nic' && (
              <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
                <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                    {t.taxonomy.nicTab} — {t.taxonomy.showingResults} {filteredNic.length} {t.taxonomy.resultsUnit}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">{t.taxonomy.nicFormatNote}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-100 max-h-[600px] overflow-y-auto">
                  {filteredNic.map((item) => (
                    <div key={item.code} className="bg-white p-4 hover:bg-slate-50 flex items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {item.code}
                          </span>
                          <span className="text-sm font-bold text-slate-900">
                            {lang === 'vi' ? item.viSub : item.label}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const textToCopy = lang === 'vi' ? `${item.code} - ${item.viSub}` : `${item.code} - ${item.label}`;
                          navigator.clipboard.writeText(textToCopy);
                          showToast(`NIC ${textToCopy}`);
                        }}
                        className="text-xs text-slate-400 hover:text-teal-700 p-2 rounded-lg hover:bg-slate-100 cursor-pointer"
                        title={t.taxonomy.copyCode}
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {}
        {/* ===================================================================
            TAB 3: CÔNG CỤ CHUYỂN ĐỔI & KIỂM TOÁN NANDA-I 2024-2026
           =================================================================== */}
        {activeTab === 'migration' && (
          <div className="space-y-5">
            {/* Migration Banner */}
            <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50 rounded-2xl p-5 border border-amber-200/90 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                    {t.migration.bannerTitle}
                  </h2>
                </div>
                <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
                  {t.migration.bannerDesc}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <button
                  onClick={() => handleCopyJson(NANDA_LABEL_MAPPINGS, "98 Renamed Labels JSON")}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-amber-100/60 text-amber-900 text-xs font-bold border border-amber-300 flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{t.migration.copy98Btn}</span>
                </button>
                <button
                  onClick={() => handleCopyJson(NANDA_RETIRED_DIAGNOSES, "46 Retired Diagnoses JSON")}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-rose-100/60 text-rose-900 text-xs font-bold border border-rose-300 flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{t.migration.copy46Btn}</span>
                </button>
              </div>
            </div>

            {/* Sub-navigation & Filters */}
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setMigrationSubTab('renamed')}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer ${
                      migrationSubTab === 'renamed'
                        ? 'bg-teal-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{t.migration.tabRenamed}</span>
                  </button>
                  <button
                    onClick={() => setMigrationSubTab('retired')}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer ${
                      migrationSubTab === 'retired'
                        ? 'bg-rose-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>{t.migration.tabRetired}</span>
                  </button>
                  <button
                    onClick={() => setMigrationSubTab('checker')}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer ${
                      migrationSubTab === 'checker'
                        ? 'bg-indigo-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>{t.migration.tabChecker}</span>
                  </button>
                </div>

                {migrationSubTab !== 'checker' && (
                  <div className="flex items-center gap-2">
                    <select
                      value={migrationDomainFilter}
                      onChange={(e) => setMigrationDomainFilter(e.target.value)}
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                    >
                      <option value="ALL">{t.migration.allDomains}</option>
                      {NANDA_DOMAINS_META.map(d => (
                        <option key={d.number} value={d.number}>
                          {lang === 'vi' ? `Lĩnh vực ${d.number}: ${d.nameVi}` : `Domain ${d.number}: ${d.nameEn}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {migrationSubTab !== 'checker' && (
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={migrationSearch}
                    onChange={(e) => setMigrationSearch(e.target.value)}
                    placeholder={
                      migrationSubTab === 'renamed'
                        ? t.migration.searchRenamedPlaceholder
                        : t.migration.searchRetiredPlaceholder
                    }
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-600 focus:bg-white"
                  />
                </div>
              )}
            </div>

            {/* Sub-tab 1: 98 Renamed Labels */}
            {migrationSubTab === 'renamed' && (
              <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                        <th className="py-3.5 px-4">{t.migration.colDomain}</th>
                        <th className="py-3.5 px-4">{t.migration.colOldLabel}</th>
                        <th className="py-3.5 px-4 text-center">{t.migration.colArrow}</th>
                        <th className="py-3.5 px-4">{t.migration.colNewLabel}</th>
                        <th className="py-3.5 px-4">{t.migration.colNewCode}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                      {filteredMappings.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/90 transition">
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="font-bold text-slate-700">
                              {lang === 'vi' ? `Lĩnh vực ${item.domain}` : `Domain ${item.domain}`}
                            </span>
                            {item.previous_domain && (
                              <span className="ml-1.5 text-[11px] px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold">
                                {t.migration.fromDomain} {item.previous_domain}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-500 line-through decoration-rose-400/80 font-medium">
                            {lang === 'vi' ? translateMedicalTermToVi(null, item.previous_label) : item.previous_label}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <ArrowRight className="w-4 h-4 text-teal-600 mx-auto" />
                          </td>
                          <td className="py-3 px-4 font-extrabold text-teal-950">
                            {lang === 'vi' ? translateMedicalTermToVi(item.new_code, item.new_label_2024_2026) : item.new_label_2024_2026}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="font-mono font-black text-xs px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200">
                              {item.new_code}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Sub-tab 2: 46 Retired Diagnoses */}
            {migrationSubTab === 'retired' && (
              <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-rose-50/60 border-b border-rose-200 text-[11px] font-extrabold uppercase tracking-wider text-rose-900">
                        <th className="py-3.5 px-4">{t.migration.colRetiredCode}</th>
                        <th className="py-3.5 px-4">{t.migration.colRetiredLabel}</th>
                        <th className="py-3.5 px-4">{t.migration.colOldLocation}</th>
                        <th className="py-3.5 px-4">{t.migration.colStatus}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                      {filteredRetired.map((item, idx) => (
                        <tr key={idx} className="hover:bg-rose-50/30 transition">
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="font-mono font-black text-xs px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 border border-rose-200">
                              {item.retired_code}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-extrabold text-slate-800">
                            {lang === 'vi' ? translateMedicalTermToVi(item.retired_code, item.retired_label) : item.retired_label}
                          </td>
                          <td className="py-3 px-4 text-slate-600 font-medium">
                            {lang === 'vi' ? `Lĩnh vực ${item.domain} • Phân lớp ${item.class}` : `Domain ${item.domain} • Class ${item.class}`}
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              {t.migration.retiredStatusBadge}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Sub-tab 3: Live Code / Term Validator */}
            {migrationSubTab === 'checker' && (
              <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5 space-y-5">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{t.migration.checkerTitle}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{t.migration.checkerSubtitle}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {["Anxiety", "Constipation", "00312", "Nausea", "00011", "Deficient knowledge"].map(sample => (
                    <button
                      key={sample}
                      onClick={() => setCheckerQuery(sample)}
                      className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200 transition cursor-pointer"
                    >
                      {sample}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-indigo-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={checkerQuery}
                    onChange={(e) => setCheckerQuery(e.target.value)}
                    placeholder={t.migration.checkerPlaceholder}
                    className="w-full pl-10 pr-4 py-3 bg-indigo-50/30 border-2 border-indigo-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Active Column */}
                  <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-2.5">
                    <div className="text-xs font-extrabold text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      {t.migration.statusActive} ({checkerResults.active.length})
                    </div>
                    {checkerResults.active.map((item, i) => (
                      <div key={i} className="bg-white p-3 rounded-lg border border-emerald-200/80 text-xs space-y-1">
                        <span className="font-mono font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                          {item.code}
                        </span>
                        <div className="font-bold text-slate-900">
                          {lang === 'vi' ? item.viSub : item.label}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {lang === 'vi' ? `Lĩnh vực ${item.domainNum}: ${item.domainNameVi}` : `Domain ${item.domainNum}: ${item.domainNameEn}`}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Renamed Column */}
                  <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 space-y-2.5">
                    <div className="text-xs font-extrabold text-amber-900 flex items-center gap-1.5">
                      <RefreshCw className="w-4 h-4 text-amber-600" />
                      {t.migration.statusRenamed} ({checkerResults.renamed.length})
                    </div>
                    {checkerResults.renamed.map((item, i) => (
                      <div key={i} className="bg-white p-3 rounded-lg border border-amber-200/80 text-xs space-y-1">
                        <div className="text-slate-400 line-through">
                          {lang === 'vi' ? translateMedicalTermToVi(null, item.previous_label) : item.previous_label}
                        </div>
                        <div className="font-extrabold text-teal-900 flex items-center gap-1.5">
                          <ArrowRight className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>
                            [{item.new_code}] {lang === 'vi' ? translateMedicalTermToVi(item.new_code, item.new_label_2024_2026) : item.new_label_2024_2026}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Retired Column */}
                  <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200 space-y-2.5">
                    <div className="text-xs font-extrabold text-rose-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      {t.migration.statusRetired} ({checkerResults.retired.length})
                    </div>
                    {checkerResults.retired.map((item, i) => (
                      <div key={i} className="bg-white p-3 rounded-lg border border-rose-200/80 text-xs space-y-1">
                        <span className="font-mono font-black text-rose-800 bg-rose-100 px-2 py-0.5 rounded">
                          {item.retired_code}
                        </span>
                        <div className="font-bold text-slate-800">
                          {lang === 'vi' ? translateMedicalTermToVi(item.retired_code, item.retired_label) : item.retired_label}
                        </div>
                        <div className="text-[11px] text-rose-600 font-semibold">{t.migration.retiredStatusBadge}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {}
        {/* ===================================================================
            TAB 4: QUY CHUẨN MÃ HÓA & BỘ 13 THANG ĐO ĐỊNH LƯỢNG NOC
           =================================================================== */}
        {activeTab === 'standards' && (
          <div className="space-y-6">
            {/* Section 1: Coding Schema Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-rose-800 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                    NANDA-I (13th Ed)
                  </span>
                  <span className="text-xs font-bold text-slate-400">2024–2026</span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {lang === 'vi' ? '13 Lĩnh vực • 48 Phân lớp • 277 Chẩn đoán' : '13 Domains • 48 Classes • 277 Diagnoses'}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {lang === 'vi'
                    ? "Mã 5 chữ số (hoặc số nguyên 32-bit) cho nhãn chẩn đoán và các chỉ số chẩn đoán; xây dựng theo cấu trúc đa trục (8 Trục)."
                    : "5-digit code (or 32-bit integer) for diagnosis labels and diagnostic indicators; built on an 8-Axis multiaxial structure."}
                </p>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono text-xs text-slate-800">
                  <strong>00312</strong> → {lang === 'vi' ? 'Tổn thương do tỳ đè ở người lớn' : 'Adult pressure injury'}<br />
                  <strong>00132</strong> → {lang === 'vi' ? 'Đau cấp tính' : 'Acute pain'}
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-800 bg-cyan-50 px-2.5 py-1 rounded-lg border border-cyan-200">
                    NOC (6th Ed)
                  </span>
                  <span className="text-xs font-bold text-slate-400">{lang === 'vi' ? '540 Kết quả' : '540 Outcomes'}</span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {lang === 'vi' ? '7 Lĩnh vực • 34 Phân lớp • 540 Kết quả' : '7 Domains • 34 Classes • 540 Outcomes'}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {lang === 'vi'
                    ? "Lĩnh vực (1–7) + Phân lớp (A–Z / AA–ZZ) + Kết quả (4 chữ số) + Chỉ số (01–99) + Thang đo (01–99) + Điểm Likert (1–5)."
                    : "Domain (1–7) + Class (A–Z / AA–ZZ) + Outcome (4-digit) + Indicator (01–99) + Scale (01–99) + Likert Rating (1–5)."}
                </p>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono text-xs text-slate-800">
                  <strong>0919</strong> → {lang === 'vi' ? 'Tư duy trừu tượng' : 'Abstract Thinking'}<br />
                  <strong>091901</strong> → {lang === 'vi' ? 'Chỉ số .01 của mã 0919' : 'Indicator .01 of 0919'}
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    NIC (7th Ed)
                  </span>
                  <span className="text-xs font-bold text-slate-400">{lang === 'vi' ? '565 Can thiệp' : '565 Interventions'}</span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {lang === 'vi' ? '7 Lĩnh vực • 30 Phân lớp • ~13.000 Hoạt động' : '7 Domains • 30 Classes • ~13,000 Activities'}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {lang === 'vi'
                    ? "Lĩnh vực (1–7) + Phân lớp (A–Z, a–d) + Can thiệp (4 chữ số) + Hoạt động (.01–.99 sau dấu chấm thập phân)."
                    : "Domain (1–7) + Class (A–Z, a–d) + Intervention (4-digit) + Activity (.01–.99 after decimal point)."}
                </p>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono text-xs text-slate-800">
                  <strong>4V-6490.02</strong> → {lang === 'vi' ? 'Lĩnh vực 4, Lớp V, 6490 Phòng ngừa té ngã, Hoạt động .02' : 'Domain 4, Class V, 6490 Fall Prevention, Activity .02'}
                </div>
              </div>
            </div>

            {/* Section 2: Interactive Scale Simulator + 13 NOC Measurement Scales */}
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5 space-y-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {t.standards.scaleTitle}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t.standards.scaleSubtitle}
                  </p>
                </div>

                {/* Interactive Simulator Widget */}
                <div className="bg-teal-50/80 border border-teal-200 rounded-xl p-3 flex flex-wrap items-center gap-3">
                  <span className="text-xs font-extrabold text-teal-900">
                    {lang === 'vi' ? `Thang đo #${activeScaleObj.code}:` : `Scale #${activeScaleObj.code}:`}
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(pt => (
                      <button
                        key={pt}
                        onClick={() => setSimulatedScore(pt)}
                        className={`w-7 h-7 rounded-lg font-mono text-xs font-black transition cursor-pointer ${
                          simulatedScore === pt
                            ? 'bg-teal-700 text-white shadow-xs'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {pt}
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-teal-950 bg-white px-2.5 py-1 rounded-lg border border-teal-200">
                    {lang === 'vi'
                      ? activeScaleObj.pointsVi[simulatedScore - 1]
                      : activeScaleObj.points[simulatedScore - 1]}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900 text-white">
                      <th className="py-3 px-3 rounded-tl-xl">{t.standards.colScaleCode}</th>
                      <th className="py-3 px-3">{t.standards.colMeaning}</th>
                      <th className="py-3 px-3 bg-rose-900/80">{t.standards.pt1}</th>
                      <th className="py-3 px-3 bg-amber-900/80">{t.standards.pt2}</th>
                      <th className="py-3 px-3 bg-yellow-800/80">{t.standards.pt3}</th>
                      <th className="py-3 px-3 bg-teal-800/80">{t.standards.pt4}</th>
                      <th className="py-3 px-3 bg-emerald-800 rounded-tr-xl">{t.standards.pt5}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {NOC_SCALES.map((s) => (
                      <tr
                        key={s.code}
                        onClick={() => setSelectedScaleCode(s.code)}
                        className={`cursor-pointer transition ${
                          selectedScaleCode === s.code ? 'bg-teal-50/90 font-semibold' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-3 px-3 font-mono font-black text-teal-800 whitespace-nowrap">
                          {lang === 'vi' ? `Thang ${s.code}` : `Scale ${s.code}`}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900">
                          {lang === 'vi' ? s.meaningVi : s.meaningEn}
                        </td>
                        <td className="py-3 px-3 text-rose-700 font-medium">
                          {lang === 'vi' ? s.pointsVi[0] : s.points[0]}
                        </td>
                        <td className="py-3 px-3 text-amber-700 font-medium">
                          {lang === 'vi' ? s.pointsVi[1] : s.points[1]}
                        </td>
                        <td className="py-3 px-3 text-slate-700 font-medium">
                          {lang === 'vi' ? s.pointsVi[2] : s.points[2]}
                        </td>
                        <td className="py-3 px-3 text-teal-700 font-medium">
                          {lang === 'vi' ? s.pointsVi[3] : s.points[3]}
                        </td>
                        <td className="py-3 px-3 font-bold text-emerald-700">
                          {lang === 'vi' ? s.pointsVi[4] : s.points[4]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 3: Comparison Table of 7 Domains of NOC and NIC */}
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5 space-y-4">
              <h3 className="text-base font-extrabold text-slate-900">
                {t.standards.domainMapTitle}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-extrabold uppercase text-slate-500">
                      <th className="py-3 px-4">{t.standards.colCode}</th>
                      <th className="py-3 px-4">{t.standards.colNocDomain}</th>
                      <th className="py-3 px-4">{t.standards.colNicDomain}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {NOC_NIC_DOMAIN_MAP.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4 font-mono font-black text-teal-800 whitespace-nowrap">
                          {row.num}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-extrabold text-cyan-950">
                            {lang === 'vi' ? row.nocDomainVi : row.nocDomain}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">{row.nocClasses}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-extrabold text-emerald-950">
                            {lang === 'vi' ? row.nicDescVi : row.nicDomain}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {lang === 'vi' ? `Mã lĩnh vực NIC: ${row.nicDomain}` : row.nicDescEn}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {}
      {/* ===================================================================
          MODAL THÊM MỚI MỤC KẾ HOẠCH CHĂM SÓC (ADD NNN ENTRY MODAL)
         =================================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="bg-teal-500/20 p-1.5 rounded-lg">
                  <Plus className="w-5 h-5 text-teal-300" />
                </div>
                <h3 className="text-sm sm:text-base font-extrabold">{t.modal.title}</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEntrySubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto text-xs sm:text-sm">
              <div>
                <label className="block font-extrabold text-slate-800 mb-1.5">
                  {t.modal.step1}
                </label>
                <select
                  value={newEntryForm.nandaCode}
                  onChange={(e) => setNewEntryForm(prev => ({ ...prev, nandaCode: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
                >
                  {flatNandaList.map((n, i) => (
                    <option key={`${n.code}-${i}`} value={n.code}>
                      [{n.code}] {formatTermLabel(n.code, n.label)} (Domain {n.domainNum})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {t.modal.defCharLabel}
                  </label>
                  <input
                    type="text"
                    value={newEntryForm.definingChar}
                    onChange={(e) => setNewEntryForm(prev => ({ ...prev, definingChar: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                    placeholder={t.modal.defCharPlaceholder}
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {t.modal.relFactorLabel}
                  </label>
                  <input
                    type="text"
                    value={newEntryForm.relatedFactor}
                    onChange={(e) => setNewEntryForm(prev => ({ ...prev, relatedFactor: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                    placeholder={t.modal.relFactorPlaceholder}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                <div>
                  <label className="block font-extrabold text-slate-800 mb-1.5">
                    {t.modal.step2}
                  </label>
                  <select
                    value={newEntryForm.nocCode}
                    onChange={(e) => setNewEntryForm(prev => ({ ...prev, nocCode: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
                  >
                    {flatNocList.map((noc, i) => (
                      <option key={`${noc.code}-${i}`} value={noc.code}>
                        [{noc.code}] {formatTermLabel(noc.code, noc.label)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-extrabold text-slate-800 mb-1.5">
                    {t.modal.scaleLabel}
                  </label>
                  <select
                    value={newEntryForm.scaleCode}
                    onChange={(e) => setNewEntryForm(prev => ({ ...prev, scaleCode: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
                  >
                    {NOC_SCALES.map(s => (
                      <option key={s.code} value={s.code}>
                        Scale {s.code} - {lang === 'vi' ? s.meaningVi : s.meaningEn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">{t.careplan.baseline} (1–5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={newEntryForm.baseline}
                    onChange={(e) => setNewEntryForm(prev => ({ ...prev, baseline: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-black"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">{t.careplan.target} (1–5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={newEntryForm.target}
                    onChange={(e) => setNewEntryForm(prev => ({ ...prev, target: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-black"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">{t.careplan.postIntervention} (1–5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={newEntryForm.post}
                    onChange={(e) => setNewEntryForm(prev => ({ ...prev, post: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-black"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <label className="block font-extrabold text-slate-800 mb-1.5">
                  {t.modal.step3}
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  {flatNicList.slice(0, 50).map(nic => {
                    const selected = newEntryForm.nicCodes.includes(nic.code);
                    return (
                      <button
                        type="button"
                        key={nic.code}
                        onClick={() => {
                          setNewEntryForm(prev => ({
                            ...prev,
                            nicCodes: selected
                              ? prev.nicCodes.filter(c => c !== nic.code)
                              : [...prev.nicCodes, nic.code]
                          }));
                        }}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                          selected
                            ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        [{nic.code}] {formatTermLabel(nic.code, nic.label)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  {t.modal.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-extrabold shadow-sm cursor-pointer"
                >
                  {t.modal.submit}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}