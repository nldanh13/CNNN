/**
 * Bộ tri thức cho Trợ lý chẩn đoán điều dưỡng.
 *
 * Toàn bộ dấu hiệu, trọng số, mục tiêu mẫu và liên kết NANDA-I → NOC → NIC ở đây
 * là nội dung BIÊN SOẠN (editorial) bằng lời văn riêng, chỉ tham chiếu MÃ và NHÃN
 * có trong danh mục shared-data/nnn-catalog.json. Không chép đặc điểm xác định,
 * yếu tố liên quan, chỉ số NOC hay hoạt động NIC từ sách. Liên kết NNN là gợi ý
 * lâm sàng thường dùng, cần điều dưỡng đối chiếu ấn bản chính thức và quy trình
 * của đơn vị trước khi áp dụng.
 */

export type CueGroup =
  | 'context' | 'resp' | 'circ' | 'temp' | 'pain' | 'nutri' | 'elim'
  | 'mobility' | 'skin' | 'neuro' | 'psych' | 'sleep' | 'knowledge';

export const CUE_GROUPS: { id: CueGroup; vi: string }[] = [
  { id: 'resp', vi: 'Hô hấp' },
  { id: 'circ', vi: 'Tuần hoàn & dịch' },
  { id: 'temp', vi: 'Thân nhiệt & nhiễm khuẩn' },
  { id: 'pain', vi: 'Đau & thoải mái' },
  { id: 'nutri', vi: 'Dinh dưỡng & nuốt' },
  { id: 'elim', vi: 'Bài tiết' },
  { id: 'mobility', vi: 'Vận động & tự chăm sóc' },
  { id: 'skin', vi: 'Da & vết thương' },
  { id: 'neuro', vi: 'Tri giác & nhận thức' },
  { id: 'psych', vi: 'Tâm lý & đối phó' },
  { id: 'sleep', vi: 'Giấc ngủ & mệt mỏi' },
  { id: 'knowledge', vi: 'Kiến thức & tự quản lý' },
  { id: 'context', vi: 'Bối cảnh & yếu tố nguy cơ' },
];

export interface Cue {
  id: string;
  group: CueGroup;
  vi: string;
  /** Cụm từ tiếng Việt (có dấu) để nhận diện trong ghi chép tự do. */
  keywords: string[];
}

const cue = (id: string, group: CueGroup, vi: string, keywords: string[] = []): Cue => ({ id, group, vi, keywords });

export const CUES: Cue[] = [
  // Hô hấp
  cue('cough_ineffective', 'resp', 'Ho yếu / ho không hiệu quả', ['ho yếu', 'ho không hiệu quả', 'không ho khạc được', 'không tự khạc đờm', 'phản xạ ho yếu']),
  cue('sputum', 'resp', 'Đờm nhiều, đặc, khó khạc', ['đờm nhiều', 'nhiều đờm', 'khó khạc đờm', 'đờm đặc', 'ứ đọng đờm', 'đàm nhiều', 'nhiều đàm', 'đàm đặc']),
  cue('adventitious', 'resp', 'Ran ẩm, ran ngáy, khò khè', ['ran ẩm', 'ran ngáy', 'ran rít', 'khò khè', 'ran nổ', 'thở rít']),
  cue('dyspnea', 'resp', 'Khó thở', ['khó thở', 'thở dốc', 'hụt hơi', 'thở mệt']),
  cue('tachypnea', 'resp', 'Thở nhanh (> 24 lần/phút ở người lớn)', ['thở nhanh']),
  cue('bradypnea', 'resp', 'Thở chậm (< 12 lần/phút) / cơn ngừng thở', ['thở chậm', 'ngừng thở', 'cơn ngưng thở']),
  cue('accessory_muscles', 'resp', 'Co kéo cơ hô hấp phụ, phập phồng cánh mũi', ['co kéo', 'rút lõm', 'phập phồng cánh mũi', 'cánh mũi phập phồng']),
  cue('shallow_breathing', 'resp', 'Thở nông, biên độ giảm', ['thở nông', 'biên độ thở giảm']),
  cue('diminished_breath', 'resp', 'Rì rào phế nang giảm', ['rì rào phế nang giảm', 'rrpn giảm', 'giảm thông khí']),
  cue('hypoxemia', 'resp', 'SpO₂ < 92% / giảm oxy máu', ['giảm oxy máu', 'spo2 thấp', 'độ bão hòa oxy thấp']),
  cue('cyanosis', 'resp', 'Tím môi, tím đầu chi', ['tím tái', 'môi tím', 'tím môi', 'đầu chi tím', 'tím đầu chi']),
  cue('abnormal_abg', 'resp', 'Khí máu bất thường (PaCO₂ tăng, pH lệch)', ['khí máu bất thường', 'paco2 tăng', 'toan hô hấp', 'tăng co2']),
  cue('oxygen_need', 'resp', 'Đang cần oxy / thông khí hỗ trợ', ['thở oxy', 'oxy gọng', 'oxy kính', 'oxy mask', 'mask oxy', 'thở máy', 'bipap', 'cpap', 'hfnc']),

  // Tuần hoàn & dịch
  cue('tachycardia', 'circ', 'Mạch nhanh (> 100 lần/phút)', ['mạch nhanh', 'nhịp tim nhanh']),
  cue('hypotension', 'circ', 'Huyết áp thấp (tâm thu < 90 mmHg)', ['tụt huyết áp', 'huyết áp thấp', 'ha thấp', 'hạ huyết áp']),
  cue('hypertension', 'circ', 'Huyết áp cao (≥ 140/90 mmHg)', ['tăng huyết áp', 'huyết áp cao', 'ha cao']),
  cue('arrhythmia', 'circ', 'Loạn nhịp tim, hồi hộp, đánh trống ngực', ['loạn nhịp', 'rung nhĩ', 'đánh trống ngực', 'ngoại tâm thu']),
  cue('chest_pain', 'circ', 'Đau ngực', ['đau ngực', 'tức ngực']),
  cue('edema', 'circ', 'Phù (chi, mặt, toàn thân)', ['phù chân', 'phù hai chân', 'phù mặt', 'phù toàn thân', 'phù hai chi', 'phù mềm', 'phù ấn lõm', 'bị phù', 'chân phù']),
  cue('weight_gain_fast', 'circ', 'Tăng cân nhanh (≥ 1 kg/ngày)', ['tăng cân nhanh']),
  cue('jvd', 'circ', 'Tĩnh mạch cổ nổi', ['tĩnh mạch cổ nổi', 'tm cổ nổi']),
  cue('dry_mucosa', 'circ', 'Niêm mạc khô, khát, da kém đàn hồi', ['niêm mạc khô', 'môi khô', 'khát nước', 'da kém đàn hồi', 'dấu véo da', 'mắt trũng']),
  cue('low_urine', 'circ', 'Nước tiểu ít / sẫm màu', ['tiểu ít', 'nước tiểu ít', 'thiểu niệu', 'nước tiểu sẫm', 'vô niệu']),
  cue('fluid_loss', 'circ', 'Mất dịch (nôn, dẫn lưu nhiều, vã mồ hôi…)', ['mất dịch', 'dẫn lưu nhiều', 'ra nhiều dịch']),
  cue('bleeding', 'circ', 'Đang chảy máu / xuất huyết', ['chảy máu', 'xuất huyết', 'nôn ra máu', 'phân đen', 'tụ máu', 'chảy máu chân răng', 'đái máu']),
  cue('low_platelets', 'circ', 'Tiểu cầu thấp / rối loạn đông máu', ['tiểu cầu thấp', 'giảm tiểu cầu', 'rối loạn đông máu', 'inr cao']),
  cue('cold_extremities', 'circ', 'Chi lạnh, mạch ngoại vi yếu, refill > 2 giây', ['chi lạnh', 'đầu chi lạnh', 'mạch mu chân yếu', 'mạch ngoại vi yếu', 'refill chậm']),
  cue('claudication', 'circ', 'Đau cách hồi, da chi nhợt', ['đau cách hồi', 'chi nhợt', 'da chi nhợt']),
  cue('calf_swelling', 'circ', 'Sưng, đau một bên bắp chân', ['sưng bắp chân', 'đau bắp chân', 'bắp chân sưng']),

  // Thân nhiệt & nhiễm khuẩn
  cue('fever', 'temp', 'Sốt (≥ 38 °C)', ['sốt', 'sốt cao', 'nóng sốt']),
  cue('hypothermia_cue', 'temp', 'Thân nhiệt thấp (< 36 °C)', ['hạ thân nhiệt', 'thân nhiệt thấp']),
  cue('chills', 'temp', 'Rét run, vã mồ hôi', ['rét run', 'vã mồ hôi', 'ớn lạnh']),
  cue('flushed_skin', 'temp', 'Da nóng, đỏ', ['da nóng', 'da đỏ bừng', 'mặt đỏ']),
  cue('wound_infection_signs', 'temp', 'Vết mổ/vết thương sưng, nóng, đỏ, chảy dịch đục', ['sưng nóng đỏ', 'chảy dịch đục', 'chảy mủ', 'rỉ dịch', 'vết mổ đỏ', 'có mủ']),
  cue('leukocytosis', 'temp', 'Bạch cầu tăng / CRP tăng', ['bạch cầu tăng', 'crp tăng', 'procalcitonin tăng']),

  // Đau & thoải mái
  cue('pain_report', 'pain', 'Người bệnh than đau', ['than đau', 'kêu đau', 'đau nhiều', 'đau bụng', 'đau vết mổ', 'đau lưng', 'đau đầu', 'đau khớp', 'đau âm ỉ', 'đau dữ dội', 'đau quặn']),
  cue('pain_moderate', 'pain', 'Điểm đau ≥ 4/10', []),
  cue('pain_severe', 'pain', 'Điểm đau ≥ 7/10', []),
  cue('guarding', 'pain', 'Nhăn nhó, rên, tư thế chống đau', ['nhăn nhó', 'chống đau', 'rên rỉ', 'ôm bụng', 'co người', 'nằm co']),
  cue('pain_limits', 'pain', 'Đau làm hạn chế vận động, ho sâu hoặc ngủ', ['đau khi vận động', 'đau khi ho', 'đau không ngủ được', 'đau tăng khi', 'sợ cử động']),
  cue('pain_chronic', 'pain', 'Đau kéo dài trên 3 tháng', ['đau mạn', 'đau kéo dài', 'đau nhiều tháng', 'đau lâu năm', 'đau nhiều năm']),
  cue('discomfort', 'pain', 'Khó chịu, bứt rứt, ngứa', ['khó chịu', 'bứt rứt', 'ngứa ngáy', 'bị ngứa', 'ngứa nhiều', 'ngứa da']),

  // Dinh dưỡng & nuốt
  cue('poor_intake', 'nutri', 'Ăn kém (< 50% khẩu phần), chán ăn', ['ăn kém', 'ăn ít', 'chán ăn', 'bỏ bữa', 'ăn không hết', 'biếng ăn', 'ăn uống kém']),
  cue('weight_loss', 'nutri', 'Sụt cân ngoài ý muốn', ['sụt cân', 'giảm cân', 'gầy sút']),
  cue('low_bmi', 'nutri', 'BMI < 18,5 / suy dinh dưỡng / albumin thấp', ['suy dinh dưỡng', 'albumin thấp', 'bmi thấp', 'thể trạng gầy', 'suy kiệt']),
  cue('nausea', 'nutri', 'Buồn nôn / nôn', ['buồn nôn', 'nôn', 'nôn ói', 'lợm giọng']),
  cue('dysphagia', 'nutri', 'Nuốt khó, nuốt sặc, ho khi ăn uống', ['nuốt khó', 'khó nuốt', 'nuốt sặc', 'bị sặc', 'ho sặc', 'ho khi ăn', 'nuốt nghẹn', 'nuốt vướng']),
  cue('ng_tube', 'nutri', 'Nuôi ăn qua ống thông / nhịn ăn', ['ăn qua sonde', 'sonde dạ dày', 'ăn qua ống', 'nuôi ăn qua ống', 'nhịn ăn', 'nuôi ăn tĩnh mạch']),
  cue('hyperglycemia', 'nutri', 'Đường huyết cao (> 10 mmol/L)', ['tăng đường huyết', 'đường huyết cao']),
  cue('hypoglycemia', 'nutri', 'Hạ đường huyết (< 3,9 mmol/L)', ['hạ đường huyết']),
  cue('mouth_lesion', 'nutri', 'Loét, viêm, nấm niêm mạc miệng', ['loét miệng', 'viêm niêm mạc miệng', 'nấm miệng', 'nhiệt miệng', 'tưa miệng']),

  // Bài tiết
  cue('constipation', 'elim', 'Táo bón / không đại tiện ≥ 3 ngày', ['táo bón', 'không đi cầu', 'chưa đại tiện', 'phân cứng', 'không đại tiện', 'chưa đi cầu']),
  cue('diarrhea', 'elim', 'Tiêu chảy (≥ 3 lần phân lỏng/ngày)', ['tiêu chảy', 'phân lỏng', 'đi lỏng', 'đi ngoài nhiều lần']),
  cue('abd_distension', 'elim', 'Bụng chướng, nhu động ruột giảm', ['bụng chướng', 'chướng bụng', 'chướng hơi', 'nhu động ruột giảm', 'chưa trung tiện']),
  cue('urinary_retention', 'elim', 'Bí tiểu, cầu bàng quang', ['bí tiểu', 'cầu bàng quang', 'tiểu không hết', 'khó tiểu']),
  cue('urinary_incontinence', 'elim', 'Tiểu không tự chủ', ['tiểu không tự chủ', 'són tiểu', 'tiểu dầm', 'đái dầm', 'tiểu không kiểm soát']),
  cue('dysuria', 'elim', 'Tiểu buốt, tiểu rắt', ['tiểu buốt', 'tiểu rắt', 'tiểu gắt']),
  cue('fecal_incontinence', 'elim', 'Đại tiện không tự chủ', ['đại tiện không tự chủ', 'són phân', 'ỉa không tự chủ']),

  // Vận động & tự chăm sóc
  cue('limited_mobility', 'mobility', 'Hạn chế vận động, cần hỗ trợ xoay trở/di chuyển', ['hạn chế vận động', 'không tự xoay trở', 'cần hỗ trợ di chuyển', 'vận động khó khăn', 'đi lại khó khăn', 'không tự đi lại', 'không tự ngồi dậy']),
  cue('weakness', 'mobility', 'Yếu cơ, yếu/liệt chi', ['yếu cơ', 'yếu chi', 'liệt', 'yếu nửa người', 'sức cơ giảm', 'yếu hai chân']),
  cue('unsteady_gait', 'mobility', 'Đi không vững, mất thăng bằng, chóng mặt khi đứng', ['đi không vững', 'mất thăng bằng', 'chóng mặt', 'choáng váng', 'loạng choạng']),
  cue('exertional_dyspnea', 'mobility', 'Mệt, khó thở hoặc mạch nhanh khi gắng sức', ['khó thở khi gắng sức', 'mệt khi gắng sức', 'đi vài bước đã mệt', 'gắng sức']),
  cue('adl_dependent', 'mobility', 'Cần trợ giúp tắm, vệ sinh, ăn uống, mặc quần áo', ['phụ thuộc hoàn toàn', 'cần trợ giúp vệ sinh', 'không tự tắm', 'không tự ăn', 'cần hỗ trợ sinh hoạt', 'chăm sóc cấp 1', 'phụ thuộc người chăm sóc']),
  cue('fracture_cast', 'mobility', 'Gãy xương, bó bột, nẹp, kéo tạ', ['gãy xương', 'bó bột', 'kéo tạ', 'nẹp', 'gãy cổ xương đùi', 'gãy chân', 'gãy tay']),

  // Da & vết thương
  cue('pressure_injury', 'skin', 'Đã có tổn thương do tỳ đè (loét)', ['loét tỳ đè', 'loét tì đè', 'loét cùng cụt', 'tổn thương do tỳ đè', 'loét do nằm', 'loét gót']),
  cue('skin_redness_bony', 'skin', 'Da đỏ không mất khi ấn ở vùng tỳ đè', ['đỏ vùng cùng cụt', 'đỏ gót', 'da đỏ vùng tỳ', 'đỏ không mất khi ấn']),
  cue('wound', 'skin', 'Có vết mổ / vết thương / bỏng', ['vết thương', 'vết mổ', 'vết khâu', 'vết rách', 'vết bỏng', 'bỏng']),
  cue('skin_breakdown', 'skin', 'Da trợt, trầy, viêm da do ẩm, phồng rộp', ['trợt da', 'trầy da', 'viêm da', 'hăm', 'phồng rộp', 'rộp da', 'loét da']),
  cue('moist_skin', 'skin', 'Da thường xuyên ẩm (mồ hôi, nước tiểu, phân)', ['da ẩm', 'ẩm ướt', 'mặc tã', 'mặc bỉm', 'đóng bỉm']),

  // Tri giác & nhận thức
  cue('confusion', 'neuro', 'Lú lẫn, mất định hướng', ['lú lẫn', 'mất định hướng', 'nói lảm nhảm', 'không nhận ra người thân', 'nói sảng', 'mê sảng']),
  cue('agitation', 'neuro', 'Kích động, vật vã, tự rút ống/dây truyền', ['kích động', 'vật vã', 'kéo dây', 'giật ống', 'tự rút', 'la hét']),
  cue('fluctuating_consciousness', 'neuro', 'Ý thức giảm hoặc dao động (GCS < 15)', ['ngủ gà', 'lơ mơ', 'li bì', 'giảm ý thức', 'ý thức dao động', 'hôn mê']),
  cue('dementia', 'neuro', 'Sa sút trí tuệ / suy giảm trí nhớ', ['sa sút trí tuệ', 'alzheimer', 'hay quên', 'suy giảm trí nhớ', 'lẫn tuổi già']),
  cue('speech_difficulty', 'neuro', 'Nói khó, không nói được, rào cản ngôn ngữ', ['nói khó', 'nói ngọng', 'thất ngôn', 'không nói được', 'mở khí quản', 'nội khí quản', 'không nói tiếng việt']),
  cue('vision_hearing', 'neuro', 'Giảm thị lực / thính lực', ['nhìn mờ', 'giảm thị lực', 'nghe kém', 'điếc', 'giảm thính lực']),

  // Tâm lý & đối phó
  cue('anxiety_signs', 'psych', 'Lo lắng, bồn chồn, căng thẳng', ['lo lắng', 'lo âu', 'bồn chồn', 'căng thẳng', 'hỏi đi hỏi lại', 'không yên']),
  cue('fear_specific', 'psych', 'Sợ hãi một điều cụ thể (mổ, thủ thuật, đau, chết)', ['sợ mổ', 'sợ phẫu thuật', 'sợ chết', 'sợ đau', 'sợ thủ thuật', 'sợ hãi', 'sợ tiêm']),
  cue('crying_sad', 'psych', 'Buồn bã, hay khóc, mất hứng thú', ['buồn bã', 'hay khóc', 'khóc nhiều', 'chán nản', 'mất hứng thú', 'trầm cảm', 'không muốn nói chuyện', 'thu mình']),
  cue('hopeless', 'psych', 'Nói muốn chết, ý tưởng tự sát, vô vọng', ['muốn chết', 'tự tử', 'tự sát', 'không muốn sống', 'vô vọng', 'tuyệt vọng']),
  cue('poor_coping', 'psych', 'Không đối phó được: từ chối điều trị, giận dữ, phủ nhận bệnh', ['từ chối điều trị', 'không chấp nhận bệnh', 'giận dữ', 'cáu gắt', 'bỏ điều trị', 'phủ nhận bệnh']),
  cue('caregiver_strain', 'psych', 'Người chăm sóc kiệt sức, quá tải', ['người nhà mệt', 'người chăm sóc kiệt sức', 'người nhà quá tải', 'người nhà than mệt', 'người nhà kiệt sức']),
  cue('low_support', 'psych', 'Sống một mình / ít người thân hỗ trợ', ['sống một mình', 'không có người thân', 'neo đơn', 'không người chăm sóc']),

  // Giấc ngủ & mệt mỏi
  cue('sleep_disturbance', 'sleep', 'Khó ngủ, thức giấc nhiều lần, ngủ < 5 giờ', ['mất ngủ', 'khó ngủ', 'ngủ ít', 'thức giấc', 'ngủ không sâu', 'trằn trọc', 'không ngủ được']),
  cue('noisy_env', 'sleep', 'Môi trường ồn, ánh sáng, bị đánh thức ban đêm', ['ồn ào', 'phòng ồn', 'đèn sáng', 'bị đánh thức']),
  cue('daytime_sleepy', 'sleep', 'Buồn ngủ ban ngày, ngủ gật', ['buồn ngủ ban ngày', 'ngủ gật']),
  cue('fatigue', 'sleep', 'Mệt mỏi, kiệt sức kéo dài', ['mệt mỏi', 'kiệt sức', 'mệt nhiều', 'uể oải', 'mệt lả']),

  // Kiến thức & tự quản lý
  cue('knowledge_gap', 'knowledge', 'Chưa hiểu / hiểu sai về bệnh, thuốc, chế độ điều trị', ['chưa hiểu', 'không hiểu', 'hiểu sai', 'chưa biết', 'thiếu kiến thức', 'không biết cách', 'chưa được hướng dẫn']),
  cue('nonadherence', 'knowledge', 'Không tuân thủ thuốc, chế độ ăn hoặc tái khám', ['bỏ thuốc', 'không uống thuốc đều', 'quên uống thuốc', 'không tuân thủ', 'không tái khám', 'tự ý ngưng thuốc', 'tự ý bỏ thuốc', 'ăn mặn']),
  cue('request_info', 'knowledge', 'Chủ động mong muốn được hướng dẫn tự chăm sóc', ['muốn biết', 'muốn được hướng dẫn', 'hỏi cách chăm sóc', 'mong được hướng dẫn']),
  cue('discharge_soon', 'knowledge', 'Sắp ra viện / chuẩn bị chăm sóc tại nhà', ['sắp ra viện', 'chuẩn bị ra viện', 'dự kiến ra viện', 'xuất viện']),
  cue('low_literacy', 'knowledge', 'Hạn chế đọc viết, khó hiểu tài liệu', ['không biết chữ', 'mù chữ', 'khó đọc']),

  // Bối cảnh & yếu tố nguy cơ
  cue('age_65', 'context', 'Tuổi ≥ 65', ['cao tuổi', 'người già', 'lớn tuổi']),
  cue('post_op', 'context', 'Sau phẫu thuật / thủ thuật', ['sau mổ', 'hậu phẫu', 'sau phẫu thuật', 'sau thủ thuật']),
  cue('bedrest', 'context', 'Nằm tại giường / bất động kéo dài', ['nằm tại giường', 'bất động', 'nằm lâu', 'liệt giường', 'nằm liệt']),
  cue('invasive_device', 'context', 'Có ống thông, catheter, đường truyền, dẫn lưu', ['sonde tiểu', 'ống thông', 'catheter', 'đường truyền', 'dẫn lưu', 'kim luồn', 'cvc', 'sonde']),
  cue('diabetes', 'context', 'Đái tháo đường', ['đái tháo đường', 'tiểu đường', 'đtđ']),
  cue('anticoag', 'context', 'Dùng thuốc chống đông / kháng tiểu cầu', ['chống đông', 'heparin', 'lovenox', 'enoxaparin', 'warfarin', 'sintrom', 'kháng tiểu cầu', 'aspirin', 'clopidogrel']),
  cue('sedatives', 'context', 'Dùng thuốc an thần, gây ngủ, opioid', ['an thần', 'thuốc ngủ', 'morphin', 'opioid', 'seduxen', 'diazepam', 'midazolam']),
  cue('fall_history', 'context', 'Tiền sử té ngã', ['tiền sử té ngã', 'từng té', 'đã té ngã', 'ngã trước đó']),
  cue('high_morse', 'context', 'Thang Morse ≥ 45 (nguy cơ té ngã cao)', []),
  cue('low_braden', 'context', 'Thang Braden ≤ 18 (nguy cơ tỳ đè)', []),
  cue('immunosuppressed', 'context', 'Suy giảm miễn dịch, hóa trị, corticoid kéo dài', ['hóa trị', 'suy giảm miễn dịch', 'corticoid', 'giảm bạch cầu', 'hiv', 'ghép tạng']),
  cue('heart_failure', 'context', 'Suy tim / bệnh thận mạn / xơ gan', ['suy tim', 'suy thận', 'bệnh thận mạn', 'xơ gan']),
  cue('resp_infection', 'context', 'Viêm phổi / nhiễm khuẩn hô hấp', ['viêm phổi', 'viêm phế quản', 'nhiễm khuẩn hô hấp', 'covid']),
  cue('copd', 'context', 'Bệnh phổi mạn (COPD, hen)', ['copd', 'bptnmt', 'phổi tắc nghẽn', 'hen phế quản']),
  cue('smoking', 'context', 'Hút thuốc lá', ['hút thuốc']),
  cue('stroke', 'context', 'Đột quỵ / bệnh thần kinh (Parkinson…)', ['đột quỵ', 'tai biến', 'nhồi máu não', 'xuất huyết não', 'parkinson']),
  cue('alcohol', 'context', 'Uống rượu nhiều / nghiện rượu', ['nghiện rượu', 'uống rượu nhiều', 'uống rượu hằng ngày']),
  cue('first_dx', 'context', 'Bệnh mới chẩn đoán / lần đầu điều trị', ['mới phát hiện', 'mới chẩn đoán', 'lần đầu nhập viện', 'lần đầu điều trị']),
];

export const CUE_BY_ID = new Map(CUES.map((c) => [c.id, c]));

// ---------------------------------------------------------------------------
// Quy tắc chẩn đoán
// ---------------------------------------------------------------------------

export type DiagnosisKind = 'problem' | 'risk' | 'promotion';
/** 1 = đường thở, hô hấp, tuần hoàn hoặc an toàn tính mạng; 2 = sinh lý; 3 = tâm lý – xã hội, kiến thức. */
export type Priority = 1 | 2 | 3;

export interface LinkSuggestion {
  code: string;
  vi: string;
  why: string;
  /** Chỉ ưu tiên khi có một trong các dấu hiệu này. */
  when?: string[];
}

export interface DiagnosisRule {
  code: string;
  vi: string;
  kind: DiagnosisKind;
  priority: Priority;
  /** Dấu hiệu / đặc điểm: 3 = gần như đặc trưng, 2 = gợi ý mạnh, 1 = hỗ trợ. */
  signs: Record<string, 1 | 2 | 3>;
  /** Yếu tố liên quan (chẩn đoán hiện tại) hoặc yếu tố nguy cơ (chẩn đoán nguy cơ). */
  factors: Record<string, 1 | 2 | 3>;
  /** Dấu hiệu làm giảm khả năng phù hợp (hướng sang chẩn đoán khác). */
  against?: Record<string, number>;
  /** Phải có ít nhất một trong các dấu hiệu này mới gợi ý. */
  requires?: string[];
  /** Mã chẩn đoán hiện tại tương ứng của một chẩn đoán nguy cơ. */
  actual?: string[];
  noc: LinkSuggestion[];
  nic: LinkSuggestion[];
  goal: string;
  differential?: string;
  redFlag?: { when: string[]; text: string };
}

const R = (rule: DiagnosisRule) => rule;

export const DIAGNOSIS_RULES: DiagnosisRule[] = [
  // ---------------- Hô hấp ----------------
  R({
    code: '00031', vi: 'Làm sạch đường thở không hiệu quả', kind: 'problem', priority: 1,
    signs: { cough_ineffective: 3, sputum: 3, adventitious: 2, dyspnea: 1, diminished_breath: 1, hypoxemia: 1, tachypnea: 1 },
    factors: { resp_infection: 2, copd: 1, smoking: 1, fluctuating_consciousness: 1, dysphagia: 1, post_op: 1, pain_limits: 1 },
    noc: [
      { code: '0410', vi: 'Tình trạng hô hấp: thông thoáng đường thở', why: 'Đo trực tiếp khả năng ho khạc, lượng đờm và âm thở.' },
      { code: '0415', vi: 'Tình trạng hô hấp', why: 'Theo dõi tổng thể nhịp, kiểu thở và oxy hóa.' },
    ],
    nic: [
      { code: '3140', vi: 'Quản lý đường thở', why: 'Tư thế, làm loãng và dẫn lưu đờm, duy trì thông thoáng.' },
      { code: '3250', vi: 'Tăng cường hiệu quả ho', why: 'Hướng dẫn ho có kiểm soát, thở sâu.', when: ['cough_ineffective'] },
      { code: '3160', vi: 'Hút đờm đường thở', why: 'Khi người bệnh không tự khạc được đờm.', when: ['sputum', 'fluctuating_consciousness'] },
      { code: '3350', vi: 'Theo dõi hô hấp', why: 'Phát hiện sớm diễn tiến xấu.' },
      { code: '3230', vi: 'Vật lý trị liệu hô hấp', why: 'Hỗ trợ dẫn lưu đờm theo chỉ định.', when: ['sputum', 'diminished_breath'] },
    ],
    goal: 'Trong 24–48 giờ: người bệnh ho khạc được đờm, âm thở cải thiện (giảm ran), nhịp thở 12–20 lần/phút, SpO₂ đạt mục tiêu theo y lệnh.',
    differential: 'Vấn đề nằm ở đường dẫn khí (đờm, vật cản). Nếu nổi bật là giảm oxy máu do phế nang – mao mạch, cân nhắc Trao đổi khí suy giảm; nếu nổi bật là nhịp/kiểu thở, cân nhắc Kiểu thở không hiệu quả.',
  }),
  R({
    code: '00030', vi: 'Trao đổi khí suy giảm', kind: 'problem', priority: 1,
    signs: { hypoxemia: 3, cyanosis: 3, abnormal_abg: 3, dyspnea: 2, oxygen_need: 2, tachycardia: 1, confusion: 1, fluctuating_consciousness: 1 },
    factors: { resp_infection: 1, copd: 1, heart_failure: 1, smoking: 1 },
    noc: [
      { code: '0402', vi: 'Tình trạng hô hấp: trao đổi khí', why: 'Theo dõi SpO₂, khí máu, tím và tri giác.' },
      { code: '0415', vi: 'Tình trạng hô hấp', why: 'Đánh giá tổng thể chức năng hô hấp.' },
    ],
    nic: [
      { code: '3320', vi: 'Liệu pháp oxy', why: 'Cung cấp và điều chỉnh oxy theo y lệnh, theo dõi đáp ứng.' },
      { code: '3350', vi: 'Theo dõi hô hấp', why: 'Theo dõi sát dấu hiệu suy hô hấp.' },
      { code: '1920', vi: 'Theo dõi thăng bằng toan – kiềm', why: 'Khi có khí máu bất thường.', when: ['abnormal_abg'] },
      { code: '0840', vi: 'Thay đổi tư thế', why: 'Tư thế Fowler/ngồi giúp tối ưu thông khí.' },
      { code: '3390', vi: 'Hỗ trợ thông khí', why: 'Hỗ trợ thở khi thông khí không đủ.', when: ['oxygen_need', 'abnormal_abg'] },
    ],
    goal: 'Trong ca trực: SpO₂ duy trì ở mức mục tiêu theo y lệnh (thường ≥ 92%, 88–92% ở COPD), không tím, tri giác ổn định.',
    differential: 'Cần phân biệt với Làm sạch đường thở không hiệu quả (đờm, ho) và Kiểu thở không hiệu quả.',
    redFlag: { when: ['cyanosis', 'fluctuating_consciousness'], text: 'Tím tái hoặc giảm ý thức kèm giảm oxy máu là dấu hiệu cấp cứu: báo bác sĩ ngay và xử trí theo quy trình đơn vị.' },
  }),
  R({
    code: '00032', vi: 'Kiểu thở không hiệu quả', kind: 'problem', priority: 1,
    signs: { tachypnea: 3, bradypnea: 3, accessory_muscles: 3, shallow_breathing: 3, dyspnea: 2 },
    factors: { pain_moderate: 1, pain_limits: 1, anxiety_signs: 1, fatigue: 1, sedatives: 1, fluctuating_consciousness: 1, post_op: 1 },
    noc: [
      { code: '0403', vi: 'Tình trạng hô hấp: thông khí', why: 'Theo dõi nhịp, biên độ, co kéo cơ hô hấp phụ.' },
      { code: '0415', vi: 'Tình trạng hô hấp', why: 'Đánh giá chung hiệu quả hô hấp.' },
    ],
    nic: [
      { code: '3390', vi: 'Hỗ trợ thông khí', why: 'Tư thế, hướng dẫn thở chậm sâu, hỗ trợ thông khí.' },
      { code: '3350', vi: 'Theo dõi hô hấp', why: 'Theo dõi nhịp, kiểu thở sau mỗi can thiệp.' },
      { code: '0840', vi: 'Thay đổi tư thế', why: 'Nằm đầu cao để giảm công hô hấp.' },
      { code: '1410', vi: 'Quản lý đau: cấp tính', why: 'Đau làm thở nông, cần kiểm soát đau.', when: ['pain_moderate', 'pain_limits'] },
      { code: '5820', vi: 'Giảm lo âu', why: 'Lo âu làm thở nhanh.', when: ['anxiety_signs'] },
    ],
    goal: 'Trong 24 giờ: nhịp thở 12–20 lần/phút, không co kéo cơ hô hấp phụ, người bệnh tự báo dễ thở hơn.',
    redFlag: { when: ['bradypnea'], text: 'Thở chậm hoặc có cơn ngừng thở (nhất là khi dùng opioid/an thần) cần đánh giá khẩn và báo bác sĩ.' },
  }),

  // ---------------- Tuần hoàn & dịch ----------------
  R({
    code: '00421', vi: 'Thể tích dịch không đầy đủ', kind: 'problem', priority: 1,
    requires: ['dry_mucosa', 'low_urine', 'hypotension', 'fluid_loss'],
    signs: { dry_mucosa: 3, low_urine: 2, hypotension: 2, tachycardia: 2, fluid_loss: 2, weight_loss: 1 },
    factors: { diarrhea: 2, nausea: 1, fever: 1, bleeding: 2, poor_intake: 1, age_65: 1 },
    noc: [
      { code: '0602', vi: 'Tình trạng hydrat hóa', why: 'Theo dõi niêm mạc, đàn hồi da, khát.' },
      { code: '0601', vi: 'Cân bằng dịch', why: 'Theo dõi lượng vào – ra, cân nặng, huyết áp.' },
      { code: '0802', vi: 'Dấu hiệu sinh tồn', why: 'Mạch, huyết áp phản ánh khối lượng tuần hoàn.' },
    ],
    nic: [
      { code: '4180', vi: 'Quản lý giảm thể tích tuần hoàn', why: 'Bù dịch theo y lệnh và theo dõi đáp ứng.' },
      { code: '4120', vi: 'Quản lý dịch', why: 'Khuyến khích uống, ghi lượng vào – ra.' },
      { code: '4130', vi: 'Theo dõi dịch', why: 'Phát hiện sớm thiếu hoặc quá tải dịch.' },
      { code: '6680', vi: 'Theo dõi dấu hiệu sinh tồn', why: 'Theo dõi mạch, huyết áp.' },
    ],
    goal: 'Trong 24 giờ: niêm mạc ẩm, nước tiểu ≥ 0,5 mL/kg/giờ, mạch và huyết áp trong giới hạn bình thường của người bệnh.',
    redFlag: { when: ['hypotension'], text: 'Tụt huyết áp kèm mạch nhanh, tiểu ít có thể là sốc giảm thể tích: báo bác sĩ ngay.' },
  }),
  R({
    code: '00420', vi: 'Nguy cơ thể tích dịch không đầy đủ', kind: 'risk', priority: 2, actual: ['00421'],
    signs: {},
    factors: { diarrhea: 3, nausea: 2, fever: 2, fluid_loss: 2, bleeding: 2, poor_intake: 1, age_65: 1, ng_tube: 1 },
    noc: [
      { code: '0602', vi: 'Tình trạng hydrat hóa', why: 'Theo dõi sớm dấu hiệu mất nước.' },
      { code: '1937', vi: 'Kiểm soát nguy cơ: mất nước', why: 'Đánh giá hành vi phòng mất nước của người bệnh/người nhà.' },
    ],
    nic: [
      { code: '4130', vi: 'Theo dõi dịch', why: 'Ghi lượng vào – ra, cân nặng.' },
      { code: '4120', vi: 'Quản lý dịch', why: 'Bảo đảm đủ dịch theo nhu cầu.' },
    ],
    goal: 'Trong thời gian nằm viện: không xuất hiện dấu hiệu mất nước; lượng vào tương xứng lượng ra.',
  }),
  R({
    code: '00026', vi: 'Thể tích dịch quá mức', kind: 'problem', priority: 1,
    signs: { edema: 3, weight_gain_fast: 3, jvd: 2, adventitious: 1, dyspnea: 1, hypertension: 1, low_urine: 1 },
    factors: { heart_failure: 2 },
    noc: [
      { code: '0601', vi: 'Cân bằng dịch', why: 'Theo dõi phù, cân nặng, lượng vào – ra.' },
      { code: '0603', vi: 'Mức độ quá tải dịch', why: 'Đo mức độ phù, ran phổi, tĩnh mạch cổ.' },
    ],
    nic: [
      { code: '4170', vi: 'Quản lý tăng thể tích tuần hoàn', why: 'Hạn chế dịch/muối, dùng lợi tiểu theo y lệnh, theo dõi.' },
      { code: '4130', vi: 'Theo dõi dịch', why: 'Cân hằng ngày cùng giờ, ghi lượng vào – ra.' },
      { code: '5614', vi: 'Hướng dẫn chế độ ăn theo chỉ định', why: 'Hướng dẫn ăn nhạt, hạn chế nước.', when: ['heart_failure'] },
      { code: '0840', vi: 'Thay đổi tư thế', why: 'Nằm đầu cao, kê chân giảm phù.' },
    ],
    goal: 'Trong 48–72 giờ: giảm phù, cân nặng giảm theo mục tiêu điều trị, phổi giảm ran, dễ thở khi nằm.',
  }),
  R({
    code: '00240', vi: 'Nguy cơ giảm cung lượng tim', kind: 'risk', priority: 1,
    signs: {},
    factors: { arrhythmia: 3, heart_failure: 3, chest_pain: 2, hypotension: 2, tachycardia: 1, edema: 1, jvd: 1, exertional_dyspnea: 1 },
    noc: [
      { code: '0400', vi: 'Hiệu quả bơm của tim', why: 'Theo dõi huyết áp, mạch, nước tiểu, phù.' },
      { code: '0802', vi: 'Dấu hiệu sinh tồn', why: 'Theo dõi diễn tiến huyết động.' },
    ],
    nic: [
      { code: '4040', vi: 'Chăm sóc tim mạch', why: 'Theo dõi đau ngực, nhịp tim, dấu hiệu suy tim.' },
      { code: '4090', vi: 'Quản lý rối loạn nhịp', why: 'Khi có loạn nhịp.', when: ['arrhythmia'] },
      { code: '4044', vi: 'Chăm sóc tim mạch: cấp', why: 'Khi có đau ngực cấp.', when: ['chest_pain'] },
      { code: '6680', vi: 'Theo dõi dấu hiệu sinh tồn', why: 'Theo dõi sát mạch, huyết áp.' },
    ],
    goal: 'Trong thời gian nằm viện: huyết áp, mạch, lượng nước tiểu ổn định; không xuất hiện đau ngực, khó thở mới.',
    redFlag: { when: ['chest_pain'], text: 'Đau ngực mới xuất hiện cần làm điện tim và báo bác sĩ ngay theo quy trình.' },
  }),
  R({
    code: '00204', vi: 'Tưới máu mô ngoại vi không hiệu quả', kind: 'problem', priority: 2,
    signs: { cold_extremities: 3, claudication: 3, edema: 1 },
    factors: { diabetes: 2, smoking: 1, hypertension: 1 },
    noc: [
      { code: '0407', vi: 'Tưới máu mô: ngoại vi', why: 'Theo dõi mạch ngoại vi, màu sắc, nhiệt độ chi.' },
      { code: '0401', vi: 'Tình trạng tuần hoàn', why: 'Đánh giá tuần hoàn toàn thân.' },
    ],
    nic: [
      { code: '4062', vi: 'Chăm sóc tuần hoàn: suy động mạch', why: 'Khi có dấu hiệu thiếu máu chi.', when: ['claudication', 'cold_extremities'] },
      { code: '4066', vi: 'Chăm sóc tuần hoàn: suy tĩnh mạch', why: 'Khi phù, ứ trệ tĩnh mạch.', when: ['edema'] },
      { code: '1660', vi: 'Chăm sóc bàn chân', why: 'Phòng tổn thương bàn chân ở người đái tháo đường.', when: ['diabetes'] },
      { code: '3480', vi: 'Theo dõi chi dưới', why: 'Phát hiện sớm loét, thiếu máu chi.' },
    ],
    goal: 'Trong 72 giờ: chi ấm, mạch ngoại vi bắt được, refill ≤ 2 giây; người bệnh biết cách chăm sóc bàn chân.',
  }),
  R({
    code: '00291', vi: 'Nguy cơ huyết khối', kind: 'risk', priority: 1,
    signs: {},
    factors: { bedrest: 3, post_op: 2, fracture_cast: 2, calf_swelling: 3, age_65: 1, heart_failure: 1, smoking: 1, invasive_device: 1 },
    noc: [
      { code: '1932', vi: 'Kiểm soát nguy cơ: huyết khối', why: 'Đánh giá tuân thủ vận động sớm, dùng thuốc dự phòng.' },
      { code: '0407', vi: 'Tưới máu mô: ngoại vi', why: 'Theo dõi sưng, đau, nhiệt độ chi.' },
    ],
    nic: [
      { code: '4110', vi: 'Phòng ngừa thuyên tắc', why: 'Vận động sớm, tất áp lực, thuốc dự phòng theo y lệnh.' },
      { code: '0221', vi: 'Tập đi lại', why: 'Vận động sớm sau mổ khi được phép.', when: ['post_op', 'bedrest'] },
      { code: '5616', vi: 'Hướng dẫn dùng thuốc theo chỉ định', why: 'Hướng dẫn dùng thuốc chống đông an toàn.', when: ['anticoag'] },
    ],
    goal: 'Trong thời gian nằm viện: không có dấu hiệu huyết khối tĩnh mạch sâu (sưng, đau, nóng một bên chân); vận động theo kế hoạch.',
    redFlag: { when: ['calf_swelling'], text: 'Sưng đau một bên bắp chân cần báo bác sĩ ngay để loại trừ huyết khối tĩnh mạch sâu; tránh xoa bóp chân đó.' },
  }),
  R({
    code: '00374', vi: 'Nguy cơ chảy máu quá mức', kind: 'risk', priority: 1,
    signs: {},
    factors: { anticoag: 3, low_platelets: 3, bleeding: 2, post_op: 1 },
    noc: [
      { code: '0413', vi: 'Mức độ mất máu', why: 'Theo dõi dấu hiệu chảy máu, hemoglobin, sinh hiệu.' },
      { code: '0409', vi: 'Đông máu', why: 'Theo dõi xét nghiệm đông máu.' },
    ],
    nic: [
      { code: '4010', vi: 'Phòng ngừa chảy máu', why: 'Hạn chế tiêm chích, dùng bàn chải mềm, theo dõi xét nghiệm.' },
      { code: '6680', vi: 'Theo dõi dấu hiệu sinh tồn', why: 'Phát hiện sớm mất máu.' },
      { code: '5616', vi: 'Hướng dẫn dùng thuốc theo chỉ định', why: 'Hướng dẫn dấu hiệu chảy máu cần báo.', when: ['anticoag'] },
    ],
    goal: 'Trong thời gian nằm viện: không có chảy máu bất thường; người bệnh nhận biết và báo dấu hiệu chảy máu.',
  }),
  R({
    code: '00205', vi: 'Nguy cơ sốc', kind: 'risk', priority: 1,
    signs: {},
    factors: { hypotension: 3, tachycardia: 2, bleeding: 2, fluid_loss: 2, fever: 1, leukocytosis: 1, low_urine: 1, fluctuating_consciousness: 1 },
    noc: [
      { code: '0401', vi: 'Tình trạng tuần hoàn', why: 'Theo dõi huyết áp, mạch, tưới máu.' },
      { code: '0802', vi: 'Dấu hiệu sinh tồn', why: 'Phát hiện sớm thay đổi huyết động.' },
    ],
    nic: [
      { code: '4260', vi: 'Phòng ngừa sốc', why: 'Theo dõi sát, bảo đảm đường truyền, báo sớm.' },
      { code: '6680', vi: 'Theo dõi dấu hiệu sinh tồn', why: 'Theo dõi mạch, huyết áp, nhịp thở, tri giác.' },
      { code: '4130', vi: 'Theo dõi dịch', why: 'Theo dõi nước tiểu theo giờ.' },
    ],
    goal: 'Trong ca trực: huyết áp tâm thu ≥ 90 mmHg (hoặc mục tiêu theo y lệnh), nước tiểu ≥ 0,5 mL/kg/giờ, tri giác tỉnh.',
    redFlag: { when: ['hypotension'], text: 'Huyết áp thấp kèm mạch nhanh, tiểu ít hoặc thay đổi ý thức: báo bác sĩ ngay, chuẩn bị xử trí theo quy trình.' },
  }),
  R({
    code: '00362', vi: 'Nguy cơ huyết áp mất cân bằng', kind: 'risk', priority: 2,
    signs: {},
    factors: { hypertension: 3, hypotension: 3, nonadherence: 1, arrhythmia: 1, heart_failure: 1 },
    noc: [
      { code: '0802', vi: 'Dấu hiệu sinh tồn', why: 'Theo dõi huyết áp định kỳ.' },
      { code: '2112', vi: 'Mức độ tăng huyết áp', why: 'Khi huyết áp cao.', when: ['hypertension'] },
      { code: '3107', vi: 'Tự quản lý: tăng huyết áp', why: 'Đánh giá khả năng tự theo dõi và dùng thuốc.', when: ['hypertension', 'nonadherence'] },
    ],
    nic: [
      { code: '4162', vi: 'Quản lý tăng huyết áp', why: 'Khi huyết áp cao.', when: ['hypertension'] },
      { code: '4175', vi: 'Quản lý hạ huyết áp', why: 'Khi huyết áp thấp, chóng mặt tư thế.', when: ['hypotension'] },
      { code: '6680', vi: 'Theo dõi dấu hiệu sinh tồn', why: 'Đo huyết áp đúng kỹ thuật, đúng giờ.' },
      { code: '5616', vi: 'Hướng dẫn dùng thuốc theo chỉ định', why: 'Hướng dẫn dùng thuốc huyết áp đều đặn.', when: ['nonadherence'] },
    ],
    goal: 'Trong thời gian nằm viện: huyết áp duy trì trong khoảng mục tiêu theo y lệnh; người bệnh dùng thuốc đúng giờ.',
  }),

  // ---------------- Thân nhiệt & nhiễm khuẩn ----------------
  R({
    code: '00007', vi: 'Tăng thân nhiệt', kind: 'problem', priority: 2,
    signs: { fever: 3, flushed_skin: 2, chills: 1, tachycardia: 1, tachypnea: 1 },
    factors: { leukocytosis: 1, wound_infection_signs: 1, dry_mucosa: 1 },
    noc: [
      { code: '0800', vi: 'Điều hòa thân nhiệt', why: 'Theo dõi nhiệt độ và các dấu hiệu kèm theo.' },
      { code: '0802', vi: 'Dấu hiệu sinh tồn', why: 'Mạch, nhịp thở thay đổi theo nhiệt độ.' },
      { code: '0602', vi: 'Tình trạng hydrat hóa', why: 'Sốt làm tăng mất nước.' },
    ],
    nic: [
      { code: '3786', vi: 'Điều trị tăng thân nhiệt', why: 'Làm mát, hạ sốt theo y lệnh, theo dõi đáp ứng.' },
      { code: '3900', vi: 'Điều hòa thân nhiệt', why: 'Điều chỉnh môi trường, quần áo phù hợp.' },
      { code: '6680', vi: 'Theo dõi dấu hiệu sinh tồn', why: 'Đo nhiệt độ định kỳ.' },
      { code: '4120', vi: 'Quản lý dịch', why: 'Bù đủ nước khi sốt.' },
    ],
    goal: 'Trong 24–48 giờ: nhiệt độ 36,5–37,5 °C, không có dấu hiệu mất nước, người bệnh dễ chịu.',
    differential: 'Sốt thường là biểu hiện của bệnh nền (ví dụ nhiễm khuẩn); can thiệp điều dưỡng hỗ trợ, điều trị nguyên nhân theo y lệnh.',
  }),
  R({
    code: '00472', vi: 'Giảm thân nhiệt', kind: 'problem', priority: 2,
    signs: { hypothermia_cue: 3, cold_extremities: 1 },
    factors: { age_65: 1, post_op: 1, low_bmi: 1 },
    noc: [
      { code: '0800', vi: 'Điều hòa thân nhiệt', why: 'Theo dõi nhiệt độ trung tâm và da.' },
      { code: '0802', vi: 'Dấu hiệu sinh tồn', why: 'Theo dõi mạch, nhịp thở khi hạ thân nhiệt.' },
    ],
    nic: [
      { code: '3800', vi: 'Điều trị hạ thân nhiệt', why: 'Ủ ấm chủ động/thụ động theo quy trình.' },
      { code: '3900', vi: 'Điều hòa thân nhiệt', why: 'Giữ ấm môi trường.' },
      { code: '6680', vi: 'Theo dõi dấu hiệu sinh tồn', why: 'Đo nhiệt độ lặp lại.' },
    ],
    goal: 'Trong 2–4 giờ: nhiệt độ ≥ 36 °C, hết run, chi ấm.',
  }),
  R({
    code: '00004', vi: 'Nguy cơ nhiễm khuẩn', kind: 'risk', priority: 2,
    signs: {},
    factors: { invasive_device: 3, immunosuppressed: 3, resp_infection: 1, post_op: 2, wound: 2, diabetes: 1, low_bmi: 1, age_65: 1, poor_intake: 1, skin_breakdown: 1, pressure_injury: 1 },
    noc: [
      { code: '1924', vi: 'Kiểm soát nguy cơ: quá trình nhiễm khuẩn', why: 'Đánh giá hành vi phòng nhiễm khuẩn.' },
      { code: '0703', vi: 'Mức độ nhiễm khuẩn', why: 'Theo dõi dấu hiệu nhiễm khuẩn mới xuất hiện.' },
    ],
    nic: [
      { code: '6550', vi: 'Bảo vệ chống nhiễm khuẩn', why: 'Theo dõi dấu hiệu nhiễm khuẩn, bảo vệ người bệnh nguy cơ cao.' },
      { code: '6540', vi: 'Kiểm soát nhiễm khuẩn', why: 'Vệ sinh tay, vô khuẩn khi thao tác.' },
      { code: '1876', vi: 'Chăm sóc ống thông: tiết niệu', why: 'Khi có sonde tiểu.', when: ['invasive_device'] },
      { code: '3440', vi: 'Chăm sóc vết mổ', why: 'Khi có vết mổ.', when: ['post_op', 'wound'] },
      { code: '5649', vi: 'Hướng dẫn: kiểm soát nhiễm khuẩn', why: 'Hướng dẫn người bệnh/người nhà vệ sinh tay, bảo vệ vết thương.' },
    ],
    goal: 'Trong thời gian nằm viện: không có dấu hiệu nhiễm khuẩn tại vết mổ, đường truyền, ống thông; thân nhiệt bình thường.',
    differential: 'Nếu đã có sốt và vết thương sưng nóng đỏ/chảy mủ, đó là dấu hiệu nhiễm khuẩn đang xảy ra: báo bác sĩ và lập chẩn đoán phù hợp với biểu hiện.',
  }),
  R({
    code: '00500', vi: 'Nguy cơ nhiễm khuẩn vết mổ', kind: 'risk', priority: 2,
    signs: {},
    factors: { post_op: 3, wound: 2, diabetes: 1, low_bmi: 1, immunosuppressed: 1, smoking: 1, moist_skin: 1 },
    against: { },
    noc: [
      { code: '1102', vi: 'Lành vết thương: kỳ đầu', why: 'Theo dõi mép vết mổ, dịch, dấu hiệu viêm.' },
      { code: '0703', vi: 'Mức độ nhiễm khuẩn', why: 'Phát hiện sớm nhiễm khuẩn.' },
    ],
    nic: [
      { code: '3440', vi: 'Chăm sóc vết mổ', why: 'Thay băng vô khuẩn, quan sát vết mổ.' },
      { code: '6550', vi: 'Bảo vệ chống nhiễm khuẩn', why: 'Theo dõi dấu hiệu nhiễm khuẩn toàn thân.' },
      { code: '2120', vi: 'Quản lý tăng đường huyết', why: 'Kiểm soát đường huyết giúp lành vết mổ.', when: ['diabetes', 'hyperglycemia'] },
    ],
    goal: 'Đến khi cắt chỉ: vết mổ khô, liền tốt, không sưng nóng đỏ, không chảy dịch đục.',
    redFlag: { when: ['wound_infection_signs'], text: 'Vết mổ đã sưng nóng đỏ hoặc chảy dịch đục: báo bác sĩ, lấy bệnh phẩm theo chỉ định.' },
  }),

  // ---------------- Đau & thoải mái ----------------
  R({
    code: '00132', vi: 'Đau cấp tính', kind: 'problem', priority: 2,
    signs: { pain_report: 3, pain_moderate: 3, pain_severe: 2, chest_pain: 2, guarding: 2, pain_limits: 2, tachycardia: 1, sleep_disturbance: 1 },
    factors: { post_op: 2, wound: 1, fracture_cast: 1, invasive_device: 1 },
    against: { pain_chronic: 4 },
    noc: [
      { code: '2102', vi: 'Mức độ đau', why: 'Lượng giá cường độ đau bằng thang điểm thống nhất.' },
      { code: '1605', vi: 'Kiểm soát đau', why: 'Đánh giá khả năng người bệnh tự kiểm soát đau.' },
      { code: '2101', vi: 'Đau: ảnh hưởng gây gián đoạn', why: 'Đau ảnh hưởng ngủ, vận động, ăn uống.', when: ['pain_limits', 'sleep_disturbance'] },
    ],
    nic: [
      { code: '1410', vi: 'Quản lý đau: cấp tính', why: 'Đánh giá đau toàn diện, phối hợp biện pháp dùng thuốc và không dùng thuốc.' },
      { code: '2210', vi: 'Dùng thuốc giảm đau', why: 'Dùng thuốc giảm đau theo y lệnh, đánh giá lại sau dùng.' },
      { code: '0840', vi: 'Thay đổi tư thế', why: 'Tư thế giảm căng vết mổ/vùng đau.' },
      { code: '1380', vi: 'Chườm nóng/lạnh', why: 'Biện pháp không dùng thuốc khi phù hợp.', when: ['fracture_cast', 'post_op'] },
      { code: '5900', vi: 'Đánh lạc hướng', why: 'Giảm cảm nhận đau.' },
    ],
    goal: 'Trong 24 giờ: người bệnh tự báo điểm đau ≤ 3/10 khi nghỉ và chịu được khi vận động/ho sâu; ngủ được.',
    differential: 'Nếu đau kéo dài trên 3 tháng, cân nhắc Đau mạn tính. Đau ngực cần loại trừ nguyên nhân tim mạch.',
  }),
  R({
    code: '00133', vi: 'Đau mạn tính', kind: 'problem', priority: 3,
    requires: ['pain_chronic'],
    signs: { pain_chronic: 3, pain_report: 2, pain_moderate: 1, crying_sad: 1, sleep_disturbance: 1, fatigue: 1 },
    factors: { fracture_cast: 1 },
    noc: [
      { code: '2102', vi: 'Mức độ đau', why: 'Theo dõi cường độ đau qua thời gian.' },
      { code: '1605', vi: 'Kiểm soát đau', why: 'Hành vi tự kiểm soát đau lâu dài.' },
      { code: '2101', vi: 'Đau: ảnh hưởng gây gián đoạn', why: 'Ảnh hưởng của đau đến sinh hoạt.' },
    ],
    nic: [
      { code: '1415', vi: 'Quản lý đau: mạn tính', why: 'Kế hoạch giảm đau lâu dài, cá thể hóa.' },
      { code: '2210', vi: 'Dùng thuốc giảm đau', why: 'Theo y lệnh, đánh giá tác dụng phụ.' },
      { code: '6040', vi: 'Liệu pháp thư giãn', why: 'Hỗ trợ kiểm soát đau không dùng thuốc.' },
      { code: '5230', vi: 'Tăng cường đối phó', why: 'Hỗ trợ tâm lý khi sống chung với đau.', when: ['crying_sad'] },
    ],
    goal: 'Trong 1–2 tuần: người bệnh áp dụng ít nhất 2 biện pháp giảm đau, đau không cản trở sinh hoạt thiết yếu.',
  }),
  R({
    code: '00380', vi: 'Suy giảm sự thoải mái thể chất', kind: 'problem', priority: 3,
    signs: { discomfort: 3, nausea: 1, sleep_disturbance: 1 },
    factors: { noisy_env: 1, invasive_device: 1 },
    noc: [
      { code: '2010', vi: 'Tình trạng thoải mái: thể chất', why: 'Đánh giá cảm giác dễ chịu về thể chất.' },
      { code: '2109', vi: 'Mức độ khó chịu', why: 'Theo dõi mức khó chịu người bệnh báo.' },
    ],
    nic: [
      { code: '6482', vi: 'Quản lý môi trường: tiện nghi', why: 'Điều chỉnh nhiệt độ, ánh sáng, tiếng ồn, tư thế.' },
      { code: '3550', vi: 'Quản lý ngứa', why: 'Khi người bệnh ngứa.', when: ['discomfort'] },
      { code: '0840', vi: 'Thay đổi tư thế', why: 'Tư thế dễ chịu.' },
    ],
    goal: 'Trong 24 giờ: người bệnh tự báo dễ chịu hơn, ngủ nghỉ được.',
  }),

  // ---------------- Dinh dưỡng & nuốt ----------------
  R({
    code: '00343', vi: 'Lượng dinh dưỡng nạp vào không đầy đủ', kind: 'problem', priority: 2,
    signs: { poor_intake: 3, weight_loss: 3, low_bmi: 3, nausea: 1, dysphagia: 1, mouth_lesion: 1 },
    factors: { immunosuppressed: 1, fatigue: 1, crying_sad: 1, ng_tube: 1, pain_moderate: 1 },
    noc: [
      { code: '1004', vi: 'Tình trạng dinh dưỡng', why: 'Theo dõi cân nặng, BMI, albumin, khẩu phần.' },
      { code: '1009', vi: 'Tình trạng dinh dưỡng: chất dinh dưỡng nạp vào', why: 'Đo lượng năng lượng, đạm thực ăn được.' },
      { code: '1014', vi: 'Cảm giác thèm ăn', why: 'Khi chán ăn.', when: ['poor_intake'] },
    ],
    nic: [
      { code: '1100', vi: 'Quản lý dinh dưỡng', why: 'Xác định nhu cầu, phối hợp chuyên gia dinh dưỡng, hỗ trợ ăn.' },
      { code: '1160', vi: 'Theo dõi dinh dưỡng', why: 'Ghi khẩu phần, cân nặng định kỳ.' },
      { code: '1056', vi: 'Nuôi ăn qua ống thông', why: 'Khi nuôi ăn qua sonde.', when: ['ng_tube'] },
      { code: '1450', vi: 'Quản lý buồn nôn', why: 'Khi buồn nôn cản trở ăn uống.', when: ['nausea'] },
      { code: '1050', vi: 'Hỗ trợ ăn uống', why: 'Khi người bệnh không tự ăn.', when: ['adl_dependent', 'weakness'] },
    ],
    goal: 'Trong 1 tuần: người bệnh ăn ≥ 75% khẩu phần, cân nặng không giảm thêm.',
  }),
  R({
    code: '00409', vi: 'Nguy cơ lượng dinh dưỡng nạp vào không đầy đủ', kind: 'risk', priority: 3, actual: ['00343'],
    signs: {},
    factors: { nausea: 2, dysphagia: 2, ng_tube: 2, mouth_lesion: 2, immunosuppressed: 1, crying_sad: 1, age_65: 1, post_op: 1 },
    noc: [
      { code: '1004', vi: 'Tình trạng dinh dưỡng', why: 'Theo dõi sớm suy giảm dinh dưỡng.' },
      { code: '1009', vi: 'Tình trạng dinh dưỡng: chất dinh dưỡng nạp vào', why: 'Theo dõi khẩu phần thực tế.' },
    ],
    nic: [
      { code: '1160', vi: 'Theo dõi dinh dưỡng', why: 'Sàng lọc và ghi khẩu phần.' },
      { code: '1100', vi: 'Quản lý dinh dưỡng', why: 'Điều chỉnh chế độ ăn phù hợp.' },
    ],
    goal: 'Trong thời gian nằm viện: duy trì cân nặng, ăn ≥ 75% khẩu phần.',
  }),
  R({
    code: '00103', vi: 'Suy giảm khả năng nuốt', kind: 'problem', priority: 1,
    signs: { dysphagia: 3, ng_tube: 1 },
    factors: { stroke: 2, fluctuating_consciousness: 1, dementia: 1, age_65: 1 },
    noc: [
      { code: '1010', vi: 'Tình trạng nuốt', why: 'Đánh giá khả năng nuốt an toàn.' },
      { code: '1935', vi: 'Kiểm soát nguy cơ: hít sặc', why: 'Phòng viêm phổi do hít.' },
    ],
    nic: [
      { code: '1860', vi: 'Liệu pháp nuốt', why: 'Tập nuốt, điều chỉnh độ đặc thức ăn phối hợp chuyên viên.' },
      { code: '3200', vi: 'Phòng ngừa hít sặc', why: 'Tư thế ngồi khi ăn, kiểm tra nuốt trước khi cho ăn.' },
      { code: '1050', vi: 'Hỗ trợ ăn uống', why: 'Cho ăn chậm, từng ít một.' },
    ],
    goal: 'Trong thời gian nằm viện: người bệnh ăn uống không ho sặc, không có dấu hiệu viêm phổi hít.',
  }),
  R({
    code: '00039', vi: 'Nguy cơ hít sặc', kind: 'risk', priority: 1,
    signs: {},
    factors: { dysphagia: 3, fluctuating_consciousness: 3, ng_tube: 2, nausea: 2, stroke: 2, cough_ineffective: 1, sedatives: 1, abd_distension: 1, dementia: 1 },
    noc: [
      { code: '1935', vi: 'Kiểm soát nguy cơ: hít sặc', why: 'Theo dõi biện pháp phòng hít sặc.' },
      { code: '1010', vi: 'Tình trạng nuốt', why: 'Theo dõi khả năng nuốt.' },
      { code: '0410', vi: 'Tình trạng hô hấp: thông thoáng đường thở', why: 'Phát hiện sớm dấu hiệu hít sặc.' },
    ],
    nic: [
      { code: '3200', vi: 'Phòng ngừa hít sặc', why: 'Nằm đầu cao 30–45°, kiểm tra dịch tồn dư, cho ăn đúng tư thế.' },
      { code: '1874', vi: 'Chăm sóc ống thông: tiêu hóa', why: 'Kiểm tra vị trí sonde trước khi cho ăn.', when: ['ng_tube'] },
      { code: '3160', vi: 'Hút đờm đường thở', why: 'Khi người bệnh không tự bảo vệ đường thở.', when: ['fluctuating_consciousness', 'cough_ineffective'] },
      { code: '0840', vi: 'Thay đổi tư thế', why: 'Tư thế nghiêng an toàn khi nôn/giảm ý thức.' },
    ],
    goal: 'Trong thời gian nằm viện: không xảy ra hít sặc; phổi trong, không sốt.',
  }),
  R({
    code: '00384', vi: 'Tự quản lý buồn nôn không hiệu quả', kind: 'problem', priority: 2,
    signs: { nausea: 3, poor_intake: 1 },
    factors: { immunosuppressed: 1, post_op: 1, knowledge_gap: 1, anxiety_signs: 1 },
    noc: [
      { code: '1618', vi: 'Kiểm soát buồn nôn và nôn', why: 'Đánh giá khả năng tự kiểm soát triệu chứng.' },
      { code: '2107', vi: 'Mức độ buồn nôn và nôn', why: 'Theo dõi tần suất, mức độ.' },
    ],
    nic: [
      { code: '1450', vi: 'Quản lý buồn nôn', why: 'Xác định yếu tố khởi phát, thuốc chống nôn theo y lệnh.' },
      { code: '1570', vi: 'Quản lý nôn', why: 'Khi người bệnh nôn: tư thế, vệ sinh, bù dịch.' },
      { code: '4120', vi: 'Quản lý dịch', why: 'Phòng mất nước do nôn.' },
    ],
    goal: 'Trong 24–48 giờ: người bệnh giảm buồn nôn, không nôn, uống đủ nước.',
    differential: 'Ấn bản 2024–2026 xếp buồn nôn theo hướng tự quản lý triệu chứng; xem thêm chẩn đoán dinh dưỡng và dịch nếu nôn kéo dài.',
  }),
  R({
    code: '00489', vi: 'Nguy cơ tự quản lý đường huyết không hiệu quả', kind: 'risk', priority: 2,
    signs: {},
    factors: { diabetes: 3, hyperglycemia: 3, hypoglycemia: 3, nonadherence: 2, knowledge_gap: 1, poor_intake: 1, immunosuppressed: 1 },
    noc: [
      { code: '2300', vi: 'Mức đường huyết', why: 'Theo dõi đường huyết mao mạch.' },
      { code: '1619', vi: 'Tự quản lý: đái tháo đường', why: 'Đánh giá kỹ năng tự theo dõi, dùng thuốc, ăn uống.' },
      { code: '1820', vi: 'Kiến thức: quản lý đái tháo đường', why: 'Khi thiếu kiến thức.', when: ['knowledge_gap', 'nonadherence'] },
    ],
    nic: [
      { code: '2120', vi: 'Quản lý tăng đường huyết', why: 'Khi đường huyết cao.', when: ['hyperglycemia', 'diabetes'] },
      { code: '2130', vi: 'Quản lý hạ đường huyết', why: 'Khi có hạ đường huyết.', when: ['hypoglycemia'] },
      { code: '5614', vi: 'Hướng dẫn chế độ ăn theo chỉ định', why: 'Hướng dẫn chế độ ăn đái tháo đường.' },
      { code: '5616', vi: 'Hướng dẫn dùng thuốc theo chỉ định', why: 'Hướng dẫn dùng insulin/thuốc đúng cách.' },
    ],
    goal: 'Trong thời gian nằm viện: đường huyết trong khoảng mục tiêu theo y lệnh, không có cơn hạ đường huyết; người bệnh tự thử đường huyết đúng.',
    redFlag: { when: ['hypoglycemia'], text: 'Hạ đường huyết cần xử trí ngay theo phác đồ (đường uống/tĩnh mạch) và kiểm tra lại sau 15 phút.' },
  }),
  R({
    code: '00045', vi: 'Suy giảm toàn vẹn niêm mạc miệng', kind: 'problem', priority: 3,
    signs: { mouth_lesion: 3, dry_mucosa: 1 },
    factors: { immunosuppressed: 1, ng_tube: 1, oxygen_need: 1 },
    noc: [
      { code: '1100', vi: 'Sức khỏe răng miệng', why: 'Theo dõi niêm mạc, lưỡi, nướu.' },
      { code: '1101', vi: 'Toàn vẹn mô: da và niêm mạc', why: 'Theo dõi mức lành tổn thương.' },
    ],
    nic: [
      { code: '1710', vi: 'Duy trì sức khỏe răng miệng', why: 'Vệ sinh răng miệng định kỳ.' },
      { code: '1730', vi: 'Phục hồi sức khỏe răng miệng', why: 'Chăm sóc tổn thương miệng.' },
    ],
    goal: 'Trong 3–5 ngày: tổn thương miệng giảm, người bệnh ăn uống ít đau hơn.',
  }),

  // ---------------- Bài tiết ----------------
  R({
    code: '00344', vi: 'Suy giảm bài tiết ruột', kind: 'problem', priority: 2,
    signs: { constipation: 3, diarrhea: 3, abd_distension: 2, fecal_incontinence: 1 },
    factors: { bedrest: 1, sedatives: 1, poor_intake: 1, post_op: 1 },
    noc: [
      { code: '0501', vi: 'Bài tiết ruột', why: 'Theo dõi số lần, tính chất phân.' },
      { code: '1015', vi: 'Chức năng tiêu hóa', why: 'Theo dõi nhu động, chướng bụng.' },
    ],
    nic: [
      { code: '0450', vi: 'Quản lý táo bón/phân ứ', why: 'Khi táo bón.', when: ['constipation', 'abd_distension'] },
      { code: '0460', vi: 'Quản lý tiêu chảy', why: 'Khi tiêu chảy.', when: ['diarrhea'] },
      { code: '0430', vi: 'Quản lý đại tiện', why: 'Theo dõi và thiết lập thói quen đại tiện.' },
      { code: '0410', vi: 'Chăm sóc đại tiện không tự chủ', why: 'Khi són phân.', when: ['fecal_incontinence'] },
    ],
    goal: 'Trong 48–72 giờ: người bệnh đại tiện phân mềm, đều; hết chướng bụng (hoặc giảm số lần tiêu chảy).',
  }),
  R({
    code: '00016', vi: 'Suy giảm bài tiết nước tiểu', kind: 'problem', priority: 2,
    signs: { urinary_retention: 3, dysuria: 2, urinary_incontinence: 2 },
    factors: { post_op: 1, invasive_device: 1, sedatives: 1, age_65: 1 },
    noc: [
      { code: '0503', vi: 'Bài tiết nước tiểu', why: 'Theo dõi số lượng, tính chất, khả năng tiểu hết.' },
      { code: '0502', vi: 'Kiểm soát tiểu tiện', why: 'Khi tiểu không tự chủ.', when: ['urinary_incontinence'] },
    ],
    nic: [
      { code: '0590', vi: 'Quản lý bài tiết nước tiểu', why: 'Theo dõi lượng, kiểu tiểu.' },
      { code: '0620', vi: 'Chăm sóc bí tiểu', why: 'Khi bí tiểu: kích thích tiểu, siêu âm bàng quang, đặt sonde theo y lệnh.', when: ['urinary_retention'] },
      { code: '0610', vi: 'Chăm sóc tiểu không tự chủ', why: 'Khi tiểu không tự chủ.', when: ['urinary_incontinence'] },
      { code: '1876', vi: 'Chăm sóc ống thông: tiết niệu', why: 'Khi có sonde tiểu.', when: ['invasive_device'] },
    ],
    goal: 'Trong 24 giờ: người bệnh tiểu được, không có cầu bàng quang (hoặc giảm số lần són tiểu).',
  }),
  R({
    code: '00322', vi: 'Nguy cơ bí tiểu', kind: 'risk', priority: 2, actual: ['00016'],
    signs: {},
    factors: { post_op: 2, sedatives: 2, bedrest: 1, age_65: 1, invasive_device: 1 },
    noc: [{ code: '0503', vi: 'Bài tiết nước tiểu', why: 'Theo dõi lần tiểu đầu sau mổ/thủ thuật.' }],
    nic: [
      { code: '0590', vi: 'Quản lý bài tiết nước tiểu', why: 'Theo dõi thời điểm và lượng nước tiểu.' },
      { code: '0565', vi: 'Siêu âm bàng quang', why: 'Kiểm tra thể tích tồn lưu khi nghi bí tiểu.' },
    ],
    goal: 'Trong 6–8 giờ sau mổ: người bệnh tiểu được tự nhiên, không có cầu bàng quang.',
  }),

  // ---------------- Vận động & tự chăm sóc ----------------
  R({
    code: '00085', vi: 'Suy giảm vận động thể chất', kind: 'problem', priority: 2,
    signs: { limited_mobility: 3, weakness: 2, fracture_cast: 2, unsteady_gait: 1, pain_limits: 1 },
    factors: { bedrest: 1, stroke: 1, pain_moderate: 1, fatigue: 1 },
    noc: [
      { code: '0208', vi: 'Khả năng vận động', why: 'Đánh giá thăng bằng, di chuyển, đổi tư thế.' },
      { code: '0200', vi: 'Đi lại', why: 'Theo dõi khả năng đi lại.' },
      { code: '0204', vi: 'Hậu quả bất động: sinh lý', why: 'Phòng biến chứng do nằm lâu.', when: ['bedrest'] },
    ],
    nic: [
      { code: '0221', vi: 'Tập đi lại', why: 'Hỗ trợ đi lại an toàn, tăng dần.' },
      { code: '0224', vi: 'Tập vận động khớp', why: 'Duy trì tầm vận động khớp.' },
      { code: '0840', vi: 'Thay đổi tư thế', why: 'Xoay trở, đặt tư thế đúng.' },
      { code: '1806', vi: 'Hỗ trợ tự chăm sóc: di chuyển', why: 'Hỗ trợ chuyển giường – ghế.', when: ['weakness', 'limited_mobility'] },
      { code: '0762', vi: 'Chăm sóc bột: duy trì', why: 'Khi bó bột.', when: ['fracture_cast'] },
    ],
    goal: 'Trong 3–5 ngày: người bệnh tự xoay trở, ngồi dậy và đi lại được quãng ngắn với dụng cụ hỗ trợ an toàn.',
  }),
  R({
    code: '00298', vi: 'Giảm khả năng chịu đựng hoạt động', kind: 'problem', priority: 2,
    signs: { exertional_dyspnea: 3, fatigue: 2, tachycardia: 1, dyspnea: 1 },
    factors: { heart_failure: 1, copd: 1, bedrest: 1, hypoxemia: 1, low_bmi: 1 },
    noc: [
      { code: '0005', vi: 'Khả năng chịu đựng hoạt động', why: 'Theo dõi mạch, nhịp thở, SpO₂ khi hoạt động.' },
      { code: '0001', vi: 'Sức bền', why: 'Theo dõi khả năng duy trì hoạt động.' },
    ],
    nic: [
      { code: '0180', vi: 'Quản lý năng lượng', why: 'Xen kẽ hoạt động – nghỉ ngơi, ưu tiên việc cần thiết.' },
      { code: '4310', vi: 'Liệu pháp hoạt động', why: 'Tăng dần mức hoạt động theo đáp ứng.' },
      { code: '6680', vi: 'Theo dõi dấu hiệu sinh tồn', why: 'Đo trước – sau hoạt động.' },
    ],
    goal: 'Trong 1 tuần: người bệnh tự thực hiện vệ sinh cá nhân, mạch tăng < 20 lần/phút so với lúc nghỉ, không khó thở.',
  }),
  R({
    code: '00477', vi: 'Gánh nặng mệt mỏi quá mức', kind: 'problem', priority: 3,
    signs: { fatigue: 3, daytime_sleepy: 1, sleep_disturbance: 1, crying_sad: 1 },
    factors: { immunosuppressed: 1, low_bmi: 1, pain_chronic: 1 },
    against: { exertional_dyspnea: 2 },
    noc: [
      { code: '0007', vi: 'Mức độ mệt mỏi', why: 'Theo dõi mức mệt người bệnh báo.' },
      { code: '0008', vi: 'Mệt mỏi: ảnh hưởng gây gián đoạn', why: 'Ảnh hưởng của mệt lên sinh hoạt.' },
    ],
    nic: [
      { code: '0180', vi: 'Quản lý năng lượng', why: 'Lập lịch nghỉ, ưu tiên hoạt động.' },
      { code: '1850', vi: 'Cải thiện giấc ngủ', why: 'Ngủ đủ giúp giảm mệt.', when: ['sleep_disturbance'] },
      { code: '1100', vi: 'Quản lý dinh dưỡng', why: 'Bảo đảm năng lượng.', when: ['low_bmi', 'poor_intake'] },
    ],
    goal: 'Trong 1–2 tuần: người bệnh báo mức mệt giảm, duy trì được các hoạt động thiết yếu.',
    differential: 'Nếu mệt chủ yếu khi gắng sức kèm mạch nhanh/khó thở, cân nhắc Giảm khả năng chịu đựng hoạt động.',
  }),
  R({
    code: '00326', vi: 'Giảm khả năng tự tắm rửa', kind: 'problem', priority: 3,
    signs: { adl_dependent: 3, weakness: 1, limited_mobility: 1 },
    factors: { bedrest: 1, stroke: 1, fatigue: 1, dementia: 1, fracture_cast: 1 },
    noc: [
      { code: '0301', vi: 'Tự chăm sóc: tắm rửa', why: 'Đánh giá mức độc lập khi tắm.' },
      { code: '0305', vi: 'Tự chăm sóc: vệ sinh cá nhân', why: 'Đánh giá vệ sinh cá nhân.' },
      { code: '0300', vi: 'Tự chăm sóc: hoạt động sinh hoạt hằng ngày', why: 'Đánh giá chung các hoạt động tự chăm sóc.' },
    ],
    nic: [
      { code: '1800', vi: 'Hỗ trợ tự chăm sóc', why: 'Hỗ trợ đúng mức, khuyến khích tự làm.' },
      { code: '1610', vi: 'Tắm', why: 'Tắm/lau người an toàn.' },
      { code: '1750', vi: 'Chăm sóc vùng tầng sinh môn', why: 'Vệ sinh sau đại – tiểu tiện.', when: ['urinary_incontinence', 'fecal_incontinence', 'moist_skin'] },
      { code: '1710', vi: 'Duy trì sức khỏe răng miệng', why: 'Vệ sinh răng miệng hằng ngày.' },
    ],
    goal: 'Trong thời gian nằm viện: người bệnh sạch sẽ, tự thực hiện được phần việc phù hợp khả năng.',
  }),
  R({
    code: '00303', vi: 'Nguy cơ té ngã ở người lớn', kind: 'risk', priority: 1,
    signs: {},
    factors: { fall_history: 3, high_morse: 3, unsteady_gait: 3, age_65: 2, sedatives: 2, confusion: 2, weakness: 2, dementia: 2, vision_hearing: 1, urinary_incontinence: 1, hypotension: 1, stroke: 1, fracture_cast: 1 },
    noc: [
      { code: '1909', vi: 'Hành vi phòng ngừa té ngã', why: 'Đánh giá người bệnh/người nhà thực hiện biện pháp phòng ngã.' },
      { code: '1912', vi: 'Số lần té ngã', why: 'Theo dõi biến cố té ngã.' },
      { code: '1828', vi: 'Kiến thức: phòng ngừa té ngã', why: 'Khi cần giáo dục người bệnh/người nhà.' },
    ],
    nic: [
      { code: '6490', vi: 'Phòng ngừa té ngã', why: 'Giường thấp, khóa bánh, chuông gọi trong tầm tay, hỗ trợ khi đi.' },
      { code: '6486', vi: 'Quản lý môi trường: an toàn', why: 'Sàn khô, đủ sáng, dọn vật cản.' },
      { code: '0222', vi: 'Tập thăng bằng', why: 'Cải thiện thăng bằng khi đi.', when: ['unsteady_gait', 'weakness'] },
      { code: '6650', vi: 'Giám sát', why: 'Tăng giám sát người lú lẫn.', when: ['confusion', 'dementia'] },
    ],
    goal: 'Trong thời gian nằm viện: người bệnh không té ngã; người bệnh/người nhà nêu được và thực hiện ít nhất 3 biện pháp phòng ngã.',
  }),
  R({
    code: '00425', vi: 'Nguy cơ suy giảm chức năng thần kinh – mạch máu ngoại vi', kind: 'risk', priority: 1,
    signs: {},
    factors: { fracture_cast: 3, post_op: 1, edema: 1 },
    noc: [
      { code: '0407', vi: 'Tưới máu mô: ngoại vi', why: 'Theo dõi màu sắc, nhiệt độ, mạch, refill.' },
      { code: '0917', vi: 'Tình trạng thần kinh: ngoại biên', why: 'Theo dõi cảm giác, vận động ngón.' },
    ],
    nic: [
      { code: '3480', vi: 'Theo dõi chi dưới', why: 'Kiểm tra 5P (đau, nhợt, mất mạch, dị cảm, liệt).' },
      { code: '0762', vi: 'Chăm sóc bột: duy trì', why: 'Kiểm tra bột chật, kê cao chi.' },
      { code: '0940', vi: 'Chăm sóc kéo tạ/cố định', why: 'Khi kéo tạ, nẹp.' },
    ],
    goal: 'Trong thời gian cố định: chi ấm, hồng, mạch rõ, cảm giác và vận động ngón bình thường.',
    redFlag: { when: ['fracture_cast'], text: 'Đau tăng dữ dội không đáp ứng thuốc, tê, nhợt, mất mạch dưới bột: nghi chèn ép khoang, báo bác sĩ ngay.' },
  }),

  // ---------------- Da & vết thương ----------------
  R({
    code: '00304', vi: 'Nguy cơ tổn thương do tỳ đè ở người lớn', kind: 'risk', priority: 2, actual: ['00312'],
    signs: {},
    factors: { bedrest: 3, low_braden: 3, limited_mobility: 2, moist_skin: 2, low_bmi: 2, urinary_incontinence: 1, fecal_incontinence: 1, poor_intake: 1, age_65: 1, fluctuating_consciousness: 1, weakness: 1, edema: 1 },
    noc: [
      { code: '1101', vi: 'Toàn vẹn mô: da và niêm mạc', why: 'Theo dõi da vùng tỳ đè hằng ngày.' },
      { code: '1942', vi: 'Kiểm soát nguy cơ: tổn thương do tỳ đè', why: 'Đánh giá việc thực hiện biện pháp phòng ngừa.' },
    ],
    nic: [
      { code: '3540', vi: 'Phòng ngừa loét tỳ đè', why: 'Xoay trở định kỳ, đệm giảm áp, đánh giá Braden.' },
      { code: '3590', vi: 'Theo dõi da', why: 'Kiểm tra vùng xương nhô mỗi ca.' },
      { code: '0840', vi: 'Thay đổi tư thế', why: 'Đổi tư thế mỗi 2 giờ hoặc theo đánh giá.' },
      { code: '3570', vi: 'Chăm sóc da: sản phẩm thấm hút', why: 'Giữ da khô khi có tã/bỉm.', when: ['moist_skin', 'urinary_incontinence', 'fecal_incontinence'] },
      { code: '1100', vi: 'Quản lý dinh dưỡng', why: 'Dinh dưỡng giúp bảo vệ da.', when: ['low_bmi', 'poor_intake'] },
    ],
    goal: 'Trong thời gian nằm viện: da vùng tỳ đè nguyên vẹn, không xuất hiện tổn thương mới; lịch xoay trở được ghi nhận đầy đủ.',
  }),
  R({
    code: '00312', vi: 'Tổn thương do tỳ đè ở người lớn', kind: 'problem', priority: 2,
    signs: { pressure_injury: 3, skin_redness_bony: 3 },
    factors: { bedrest: 1, low_braden: 1, moist_skin: 1, low_bmi: 1, poor_intake: 1, limited_mobility: 1 },
    noc: [
      { code: '1103', vi: 'Lành vết thương: kỳ hai', why: 'Theo dõi kích thước, mô hạt, dịch tiết.' },
      { code: '1101', vi: 'Toàn vẹn mô: da và niêm mạc', why: 'Theo dõi vùng da xung quanh.' },
      { code: '1942', vi: 'Kiểm soát nguy cơ: tổn thương do tỳ đè', why: 'Phòng vị trí loét mới.' },
    ],
    nic: [
      { code: '3520', vi: 'Chăm sóc loét tỳ đè', why: 'Đánh giá giai đoạn, làm sạch, băng phù hợp.' },
      { code: '3540', vi: 'Phòng ngừa loét tỳ đè', why: 'Giảm áp lực, phòng vị trí mới.' },
      { code: '1100', vi: 'Quản lý dinh dưỡng', why: 'Đủ đạm – năng lượng cho lành vết thương.' },
      { code: '0840', vi: 'Thay đổi tư thế', why: 'Không nằm đè lên vị trí loét.' },
    ],
    goal: 'Trong 1–2 tuần: vết loét giảm kích thước, nền mô hạt đỏ, không nhiễm khuẩn; không có vị trí mới.',
  }),
  R({
    code: '00046', vi: 'Suy giảm toàn vẹn da', kind: 'problem', priority: 3,
    signs: { skin_breakdown: 3, wound: 1 },
    factors: { moist_skin: 1, urinary_incontinence: 1, fecal_incontinence: 1, diarrhea: 1, low_bmi: 1 },
    noc: [
      { code: '1101', vi: 'Toàn vẹn mô: da và niêm mạc', why: 'Theo dõi màu sắc, độ ẩm, tổn thương da.' },
      { code: '1103', vi: 'Lành vết thương: kỳ hai', why: 'Khi tổn thương hở.', when: ['wound'] },
    ],
    nic: [
      { code: '3590', vi: 'Theo dõi da', why: 'Đánh giá tổn thương mỗi ca.' },
      { code: '3584', vi: 'Chăm sóc da: điều trị tại chỗ', why: 'Bôi thuốc/kem bảo vệ theo chỉ định.' },
      { code: '1750', vi: 'Chăm sóc vùng tầng sinh môn', why: 'Khi tổn thương do ẩm vùng tã.', when: ['moist_skin', 'urinary_incontinence', 'fecal_incontinence', 'diarrhea'] },
    ],
    goal: 'Trong 3–5 ngày: vùng da tổn thương giảm đỏ, khô, không lan rộng.',
  }),
  R({
    code: '00047', vi: 'Nguy cơ suy giảm toàn vẹn da', kind: 'risk', priority: 3, actual: ['00046', '00312'],
    signs: {},
    factors: { moist_skin: 2, urinary_incontinence: 2, fecal_incontinence: 2, diarrhea: 1, bedrest: 1, age_65: 1, edema: 1, low_bmi: 1 },
    noc: [{ code: '1101', vi: 'Toàn vẹn mô: da và niêm mạc', why: 'Theo dõi da hằng ngày.' }],
    nic: [
      { code: '3590', vi: 'Theo dõi da', why: 'Phát hiện sớm thay đổi da.' },
      { code: '3570', vi: 'Chăm sóc da: sản phẩm thấm hút', why: 'Giữ da khô, thay tã kịp thời.' },
      { code: '1750', vi: 'Chăm sóc vùng tầng sinh môn', why: 'Vệ sinh nhẹ nhàng sau đại – tiểu tiện.' },
    ],
    goal: 'Trong thời gian nằm viện: da khô, nguyên vẹn.',
  }),
  R({
    code: '00044', vi: 'Suy giảm toàn vẹn mô', kind: 'problem', priority: 2,
    signs: { wound: 3, wound_infection_signs: 1 },
    factors: { post_op: 1, diabetes: 1, low_bmi: 1, smoking: 1 },
    noc: [
      { code: '1102', vi: 'Lành vết thương: kỳ đầu', why: 'Vết mổ, vết khâu liền kỳ đầu.', when: ['post_op'] },
      { code: '1103', vi: 'Lành vết thương: kỳ hai', why: 'Vết thương hở, liền kỳ hai.' },
      { code: '1101', vi: 'Toàn vẹn mô: da và niêm mạc', why: 'Theo dõi mô xung quanh.' },
    ],
    nic: [
      { code: '3660', vi: 'Chăm sóc vết thương', why: 'Làm sạch, thay băng, đánh giá vết thương.' },
      { code: '3440', vi: 'Chăm sóc vết mổ', why: 'Khi có vết mổ.', when: ['post_op'] },
      { code: '3662', vi: 'Chăm sóc vết thương: dẫn lưu kín', why: 'Khi có dẫn lưu.', when: ['invasive_device'] },
      { code: '6550', vi: 'Bảo vệ chống nhiễm khuẩn', why: 'Theo dõi dấu hiệu nhiễm khuẩn.' },
    ],
    goal: 'Đến khi ra viện: vết thương sạch, liền tốt, không có dấu hiệu nhiễm khuẩn.',
  }),

  // ---------------- Tri giác & nhận thức ----------------
  R({
    code: '00128', vi: 'Lú lẫn cấp tính', kind: 'problem', priority: 1,
    signs: { confusion: 3, fluctuating_consciousness: 3, agitation: 2, sleep_disturbance: 1 },
    factors: { age_65: 1, sedatives: 1, fever: 1, hypoxemia: 1, alcohol: 1, dementia: 1, urinary_retention: 1, post_op: 1, hypoglycemia: 1 },
    noc: [
      { code: '0916', vi: 'Mức độ mê sảng', why: 'Theo dõi định hướng, chú ý, dao động ý thức.' },
      { code: '0901', vi: 'Định hướng nhận thức', why: 'Đánh giá định hướng thời gian, không gian, người.' },
    ],
    nic: [
      { code: '6440', vi: 'Quản lý mê sảng', why: 'Tìm và xử trí nguyên nhân, môi trường an toàn, định hướng lại.' },
      { code: '4820', vi: 'Định hướng thực tại', why: 'Nhắc thời gian, nơi chốn, người thân bên cạnh.' },
      { code: '6486', vi: 'Quản lý môi trường: an toàn', why: 'Phòng té ngã, tự rút ống.' },
      { code: '1850', vi: 'Cải thiện giấc ngủ', why: 'Bảo vệ chu kỳ ngủ – thức.' },
    ],
    goal: 'Trong 24–72 giờ: người bệnh định hướng được thời gian, nơi chốn; không tự rút ống, không té ngã.',
    differential: 'Khởi phát nhanh, dao động trong ngày gợi ý lú lẫn cấp (mê sảng). Suy giảm nhận thức tiến triển chậm gợi ý Lú lẫn mạn tính.',
    redFlag: { when: ['fluctuating_consciousness'], text: 'Thay đổi ý thức mới xuất hiện: kiểm tra đường huyết, SpO₂, sinh hiệu và báo bác sĩ ngay.' },
  }),
  R({
    code: '00173', vi: 'Nguy cơ lú lẫn cấp tính', kind: 'risk', priority: 2, actual: ['00128'],
    signs: {},
    factors: { age_65: 2, dementia: 2, sedatives: 2, alcohol: 2, post_op: 1, fever: 1, sleep_disturbance: 1, vision_hearing: 1, hypoxemia: 1, urinary_retention: 1 },
    noc: [
      { code: '0916', vi: 'Mức độ mê sảng', why: 'Sàng lọc mê sảng định kỳ.' },
      { code: '0901', vi: 'Định hướng nhận thức', why: 'Theo dõi định hướng.' },
    ],
    nic: [
      { code: '6650', vi: 'Giám sát', why: 'Sàng lọc sớm thay đổi tri giác.' },
      { code: '4820', vi: 'Định hướng thực tại', why: 'Đồng hồ, lịch, kính, máy trợ thính.' },
      { code: '1850', vi: 'Cải thiện giấc ngủ', why: 'Hạn chế đánh thức ban đêm.' },
    ],
    goal: 'Trong thời gian nằm viện: người bệnh tỉnh táo, định hướng tốt.',
  }),
  R({
    code: '00129', vi: 'Lú lẫn mạn tính', kind: 'problem', priority: 3,
    requires: ['dementia'],
    signs: { dementia: 3, confusion: 2 },
    factors: { age_65: 1, stroke: 1 },
    against: { fluctuating_consciousness: 2 },
    noc: [
      { code: '0920', vi: 'Mức độ sa sút trí tuệ', why: 'Theo dõi chức năng nhận thức.' },
      { code: '1926', vi: 'Đi lang thang an toàn', why: 'Khi người bệnh hay đi lang thang.' },
    ],
    nic: [
      { code: '6460', vi: 'Quản lý sa sút trí tuệ', why: 'Môi trường ổn định, giao tiếp đơn giản.' },
      { code: '4720', vi: 'Kích thích nhận thức', why: 'Duy trì chức năng nhận thức.' },
      { code: '7040', vi: 'Hỗ trợ người chăm sóc', why: 'Hướng dẫn và hỗ trợ người nhà.' },
    ],
    goal: 'Trong thời gian nằm viện: người bệnh an toàn, hợp tác với chăm sóc thường ngày; người nhà biết cách hỗ trợ.',
  }),
  R({
    code: '00051', vi: 'Suy giảm giao tiếp bằng lời', kind: 'problem', priority: 3,
    signs: { speech_difficulty: 3, vision_hearing: 1 },
    factors: { stroke: 2, invasive_device: 1 },
    noc: [
      { code: '0902', vi: 'Giao tiếp', why: 'Đánh giá khả năng truyền đạt và tiếp nhận.' },
      { code: '0903', vi: 'Giao tiếp: diễn đạt', why: 'Khả năng diễn đạt nhu cầu.' },
    ],
    nic: [
      { code: '4976', vi: 'Tăng cường giao tiếp: khiếm khuyết lời nói', why: 'Bảng hình, câu hỏi có/không, viết.' },
      { code: '4974', vi: 'Tăng cường giao tiếp: khiếm khuyết thính giác', why: 'Khi nghe kém.', when: ['vision_hearing'] },
      { code: '4920', vi: 'Lắng nghe tích cực', why: 'Dành thời gian, kiên nhẫn.' },
    ],
    goal: 'Trong 48 giờ: người bệnh dùng được ít nhất một phương tiện giao tiếp để báo nhu cầu.',
  }),

  // ---------------- Tâm lý & đối phó ----------------
  R({
    code: '00400', vi: 'Lo âu quá mức', kind: 'problem', priority: 3,
    signs: { anxiety_signs: 3, sleep_disturbance: 1, tachycardia: 1, agitation: 1 },
    factors: { first_dx: 1, knowledge_gap: 1, post_op: 1, pain_moderate: 1 },
    noc: [
      { code: '1211', vi: 'Mức độ lo âu', why: 'Theo dõi biểu hiện lo âu.' },
      { code: '1402', vi: 'Tự kiểm soát lo âu', why: 'Đánh giá khả năng tự kiểm soát.' },
    ],
    nic: [
      { code: '5820', vi: 'Giảm lo âu', why: 'Lắng nghe, giải thích, tạo môi trường an tâm.' },
      { code: '5880', vi: 'Kỹ thuật làm dịu', why: 'Hướng dẫn thở chậm, thư giãn.' },
      { code: '5580', vi: 'Cung cấp thông tin chuẩn bị về cảm giác', why: 'Giải thích trước thủ thuật.', when: ['knowledge_gap', 'post_op'] },
      { code: '5270', vi: 'Hỗ trợ cảm xúc', why: 'Chia sẻ, động viên.' },
    ],
    goal: 'Trong 24 giờ: người bệnh nói ra được nỗi lo, áp dụng một kỹ thuật thư giãn, ngủ được.',
    differential: 'Nếu nỗi sợ hướng vào một đối tượng cụ thể (phẫu thuật, đau…), cân nhắc Sợ hãi quá mức.',
  }),
  R({
    code: '00390', vi: 'Sợ hãi quá mức', kind: 'problem', priority: 3,
    signs: { fear_specific: 3, anxiety_signs: 1, tachycardia: 1 },
    factors: { post_op: 1, first_dx: 1, knowledge_gap: 1 },
    noc: [
      { code: '1210', vi: 'Mức độ sợ hãi', why: 'Theo dõi biểu hiện sợ hãi.' },
      { code: '1404', vi: 'Tự kiểm soát sợ hãi', why: 'Khả năng đối mặt với điều sợ.' },
    ],
    nic: [
      { code: '5580', vi: 'Cung cấp thông tin chuẩn bị về cảm giác', why: 'Mô tả trước điều sẽ trải qua.' },
      { code: '5610', vi: 'Hướng dẫn: trước phẫu thuật', why: 'Khi sợ phẫu thuật.', when: ['fear_specific'] },
      { code: '5340', vi: 'Hiện diện', why: 'Ở bên người bệnh trong lúc căng thẳng.' },
    ],
    goal: 'Trước thủ thuật/phẫu thuật: người bệnh nói được điều mình sợ và cảm thấy an tâm hơn.',
  }),
  R({
    code: '00405', vi: 'Đối phó không thích ứng', kind: 'problem', priority: 3,
    signs: { poor_coping: 3, crying_sad: 2, nonadherence: 1, sleep_disturbance: 1 },
    factors: { first_dx: 1, low_support: 1, pain_chronic: 1 },
    noc: [
      { code: '1302', vi: 'Đối phó', why: 'Đánh giá chiến lược đối phó.' },
      { code: '1300', vi: 'Chấp nhận: tình trạng sức khỏe', why: 'Mức chấp nhận bệnh.' },
    ],
    nic: [
      { code: '5230', vi: 'Tăng cường đối phó', why: 'Giúp nhận diện và dùng chiến lược đối phó tích cực.' },
      { code: '5270', vi: 'Hỗ trợ cảm xúc', why: 'Lắng nghe, công nhận cảm xúc.' },
      { code: '5440', vi: 'Tăng cường hệ thống hỗ trợ', why: 'Huy động người thân, nhóm hỗ trợ.', when: ['low_support'] },
      { code: '5250', vi: 'Hỗ trợ ra quyết định', why: 'Khi từ chối điều trị.', when: ['poor_coping'] },
    ],
    goal: 'Trong 1 tuần: người bệnh nêu được ít nhất 2 cách đối phó tích cực và hợp tác điều trị.',
  }),
  R({
    code: '00466', vi: 'Nguy cơ hành vi tự gây tổn thương có ý định tự sát', kind: 'risk', priority: 1,
    signs: {},
    factors: { hopeless: 3, crying_sad: 2, low_support: 1, alcohol: 1, pain_chronic: 1 },
    noc: [
      { code: '1408', vi: 'Tự kiềm chế tự sát', why: 'Đánh giá ý tưởng, kế hoạch tự sát.' },
      { code: '1208', vi: 'Mức độ trầm cảm', why: 'Theo dõi triệu chứng trầm cảm.' },
    ],
    nic: [
      { code: '6340', vi: 'Phòng ngừa tự sát', why: 'Đánh giá nguy cơ, không để một mình, phối hợp chuyên khoa.' },
      { code: '6486', vi: 'Quản lý môi trường: an toàn', why: 'Loại bỏ vật dụng nguy hiểm.' },
      { code: '6650', vi: 'Giám sát', why: 'Quan sát liên tục theo mức nguy cơ.' },
      { code: '5330', vi: 'Quản lý khí sắc', why: 'Hỗ trợ ổn định khí sắc.' },
    ],
    goal: 'Trong thời gian nằm viện: người bệnh an toàn, không có hành vi tự gây hại; cam kết báo nhân viên khi có ý nghĩ tự hại.',
    redFlag: { when: ['hopeless'], text: 'Ý tưởng tự sát là tình huống an toàn khẩn: không để người bệnh một mình, báo bác sĩ/chuyên khoa tâm thần ngay theo quy trình.' },
  }),
  R({
    code: '00366', vi: 'Gánh nặng chăm sóc quá mức', kind: 'problem', priority: 3,
    signs: { caregiver_strain: 3 },
    factors: { adl_dependent: 1, dementia: 1, low_support: 1, bedrest: 1 },
    noc: [
      { code: '2210', vi: 'Sức chịu đựng vai trò người chăm sóc', why: 'Đánh giá khả năng tiếp tục chăm sóc.' },
      { code: '2508', vi: 'Sức khỏe tinh thần – thể chất người chăm sóc', why: 'Theo dõi sức khỏe người chăm sóc.' },
    ],
    nic: [
      { code: '7040', vi: 'Hỗ trợ người chăm sóc', why: 'Hướng dẫn kỹ năng, lắng nghe khó khăn.' },
      { code: '7260', vi: 'Chăm sóc thay thế tạm thời', why: 'Sắp xếp người thay phiên nghỉ ngơi.' },
      { code: '7140', vi: 'Hỗ trợ gia đình', why: 'Huy động thành viên khác chia sẻ.' },
    ],
    goal: 'Trong 1 tuần: người chăm sóc có lịch nghỉ ngơi, nêu được nguồn hỗ trợ có thể dùng.',
  }),
  R({
    code: '00259', vi: 'Nguy cơ hội chứng cai chất cấp', kind: 'risk', priority: 1,
    signs: {},
    factors: { alcohol: 3, agitation: 1, sleep_disturbance: 1, tachycardia: 1 },
    noc: [{ code: '2108', vi: 'Mức độ hội chứng cai', why: 'Theo dõi run, vã mồ hôi, kích động.' }],
    nic: [
      { code: '4512', vi: 'Điều trị cai rượu', why: 'Theo dõi thang điểm cai, dùng thuốc theo y lệnh.' },
      { code: '6650', vi: 'Giám sát', why: 'Phát hiện sớm sảng rượu.' },
    ],
    goal: 'Trong 72 giờ đầu: không xuất hiện sảng rượu, co giật; sinh hiệu ổn định.',
  }),

  // ---------------- Giấc ngủ ----------------
  R({
    code: '00337', vi: 'Kiểu ngủ không hiệu quả', kind: 'problem', priority: 3,
    signs: { sleep_disturbance: 3, daytime_sleepy: 1, fatigue: 1 },
    factors: { noisy_env: 2, pain_moderate: 1, anxiety_signs: 1, urinary_incontinence: 1, dyspnea: 1 },
    noc: [
      { code: '0004', vi: 'Giấc ngủ', why: 'Theo dõi thời lượng, chất lượng giấc ngủ.' },
      { code: '0003', vi: 'Nghỉ ngơi', why: 'Cảm nhận được nghỉ ngơi.' },
    ],
    nic: [
      { code: '1850', vi: 'Cải thiện giấc ngủ', why: 'Thói quen ngủ, gom thủ thuật ban đêm.' },
      { code: '6482', vi: 'Quản lý môi trường: tiện nghi', why: 'Giảm tiếng ồn, ánh sáng.', when: ['noisy_env'] },
      { code: '6040', vi: 'Liệu pháp thư giãn', why: 'Thư giãn trước khi ngủ.', when: ['anxiety_signs'] },
    ],
    goal: 'Trong 3 đêm: người bệnh ngủ ≥ 6 giờ/đêm, báo cảm thấy được nghỉ ngơi.',
  }),

  // ---------------- Kiến thức & tự quản lý ----------------
  R({
    code: '00435', vi: 'Kiến thức sức khỏe không đầy đủ', kind: 'problem', priority: 3,
    signs: { knowledge_gap: 3, nonadherence: 1 },
    factors: { first_dx: 2, low_literacy: 1, discharge_soon: 1 },
    noc: [
      { code: '1803', vi: 'Kiến thức: quá trình bệnh', why: 'Đánh giá hiểu biết về bệnh.' },
      { code: '1813', vi: 'Kiến thức: chế độ điều trị', why: 'Hiểu biết về điều trị, chế độ ăn, vận động.' },
      { code: '1808', vi: 'Kiến thức: thuốc', why: 'Hiểu cách dùng thuốc.', when: ['nonadherence'] },
    ],
    nic: [
      { code: '5602', vi: 'Hướng dẫn: quá trình bệnh', why: 'Giải thích bệnh bằng ngôn ngữ dễ hiểu.' },
      { code: '5616', vi: 'Hướng dẫn dùng thuốc theo chỉ định', why: 'Tên, liều, giờ, tác dụng phụ cần báo.' },
      { code: '5515', vi: 'Nâng cao hiểu biết sức khỏe', why: 'Khi hạn chế đọc hiểu: dùng hình ảnh, nói lại.', when: ['low_literacy'] },
      { code: '5520', vi: 'Tạo thuận lợi học tập', why: 'Kiểm tra lại bằng phương pháp “nói lại”.' },
    ],
    goal: 'Trước khi ra viện: người bệnh/người nhà nhắc lại đúng tên bệnh, cách dùng thuốc và dấu hiệu cần tái khám.',
  }),
  R({
    code: '00499', vi: 'Sẵn sàng nâng cao kiến thức sức khỏe', kind: 'promotion', priority: 3,
    signs: { request_info: 3, discharge_soon: 1 },
    factors: {},
    noc: [
      { code: '1803', vi: 'Kiến thức: quá trình bệnh', why: 'Mở rộng hiểu biết về bệnh.' },
      { code: '1813', vi: 'Kiến thức: chế độ điều trị', why: 'Chuẩn bị tự chăm sóc tại nhà.' },
    ],
    nic: [
      { code: '5510', vi: 'Giáo dục sức khỏe', why: 'Đáp ứng nhu cầu học của người bệnh.' },
      { code: '5606', vi: 'Hướng dẫn: cá nhân', why: 'Kế hoạch hướng dẫn riêng.' },
    ],
    goal: 'Trước khi ra viện: người bệnh thực hiện đúng các kỹ năng tự chăm sóc đã học.',
  }),
  R({
    code: '00276', vi: 'Tự quản lý sức khỏe không hiệu quả', kind: 'problem', priority: 3,
    signs: { nonadherence: 3, knowledge_gap: 1 },
    factors: { low_support: 1, low_literacy: 1, diabetes: 1, heart_failure: 1, copd: 1, hypertension: 1 },
    noc: [
      { code: '3102', vi: 'Tự quản lý: bệnh mạn tính', why: 'Đánh giá hành vi tự quản lý bệnh.' },
      { code: '1623', vi: 'Hành vi tuân thủ: thuốc theo chỉ định', why: 'Theo dõi việc dùng thuốc đều.' },
    ],
    nic: [
      { code: '4470', vi: 'Hỗ trợ tự điều chỉnh hành vi', why: 'Đặt mục tiêu nhỏ, theo dõi tiến bộ.' },
      { code: '5616', vi: 'Hướng dẫn dùng thuốc theo chỉ định', why: 'Lập lịch uống thuốc.' },
      { code: '5305', vi: 'Huấn luyện sức khỏe', why: 'Đồng hành thay đổi lối sống.' },
    ],
    goal: 'Trong 1 tháng: người bệnh dùng thuốc đúng ≥ 90% số liều, tái khám đúng hẹn.',
  }),
];

/** Nhãn tiếng Việt biên soạn cho các mã NOC/NIC được trợ lý gợi ý (theo khóa hệ:mã). */
export const LINK_VI = new Map<string, string>();
for (const rule of DIAGNOSIS_RULES) {
  for (const n of rule.noc) LINK_VI.set('noc:' + n.code, n.vi);
  for (const n of rule.nic) LINK_VI.set('nic:' + n.code, n.vi);
}

/** Ghi chép mẫu để thử trợ lý. */
export const SAMPLE_NOTES = [
  {
    title: 'Viêm phổi, cao tuổi',
    text: 'Người bệnh nam 78 tuổi, viêm phổi ngày 2. Ho yếu, đờm đặc khó khạc, ran ẩm hai đáy phổi. Thở nhanh, NT 28 l/p, SpO2 89% khí trời. Nhiệt độ 38.6°C. Ăn kém, mệt mỏi. Đi không vững, có tiền sử té ngã. Đang truyền dịch qua kim luồn.',
  },
  {
    title: 'Hậu phẫu ngày 1',
    text: 'Hậu phẫu ngày 1 mổ mở cắt đại tràng. Đau vết mổ 7/10, nhăn nhó, đau khi ho và khi vận động. Có sonde tiểu, dẫn lưu ổ bụng. Bụng chướng, chưa trung tiện. Lo lắng, hỏi đi hỏi lại về kết quả mổ. Mạch 108 l/p, HA 125/80.',
  },
  {
    title: 'Đột quỵ nằm lâu',
    text: 'Bệnh nhân nữ 82 tuổi, nhồi máu não, yếu nửa người phải, nằm tại giường, không tự xoay trở. Nuốt sặc khi uống nước, nói khó. Tiểu không tự chủ, mặc bỉm, da vùng cùng cụt đỏ không mất khi ấn. Braden 12. Người nhà than mệt, quá tải.',
  },
];
