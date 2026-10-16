import type { Lang, TaxonomySystem } from '../types';
import { translateVi } from '../lib/translate';
import { findNanda, findNoc, nandaDomain, nocDomain } from './taxonomy';

/**
 * Original educational explanations (NOT copied textbook definitions/activities).
 * NANDA and NIC concepts marked 'source-reviewed' were checked with the
 * user's editions; the original explanatory prose is a clinical interpretation.
 * NOC notes here explain the meaning of outcome LABELS, not complete licensed
 * indicator lists or a verified scale-to-outcome assignment.
 */
export type ExplanationLevel = 'source-reviewed' | 'editorial';
export interface CodeExplanation {
  summary: string;
  reasoning: string;
  assessment: string[];
  use: string;
  level: ExplanationLevel;
  /** Page number counted from PDF page 1, only where manually verified. */
  sourcePdfPage?: number;
}
type Curated = Partial<Record<TaxonomySystem, Record<string, CodeExplanation>>>;
export const CURATED_EXPLANATIONS: Curated = {
  nanda: {
    '00132': {
      summary: 'Đau cấp là phản ứng cảm giác và cảm xúc khó chịu liên quan đến tổn thương mô thực tế hoặc tiềm tàng, có diễn tiến ngắn. Đây là phản ứng người bệnh cần được điều dưỡng đánh giá, không phải tên bệnh gây đau.',
      reasoning: 'Tổn thương có thể dẫn đến đau; đau lại ảnh hưởng đến vận động, nghỉ ngơi, hô hấp sâu và khả năng hợp tác chăm sóc. Vì vậy phải quan sát cả cường độ lẫn ảnh hưởng đến chức năng, rồi lượng giá lại sau can thiệp.',
      assessment: ['Vị trí, khởi phát, thời gian, tính chất và yếu tố làm đau tăng/giảm.', 'Người bệnh tự báo mức đau bằng thang phù hợp; quan sát hành vi đau khi khó giao tiếp.', 'Ảnh hưởng đến giấc ngủ, hô hấp, vận động và sinh hoạt.'],
      use: 'Ghi dấu hiệu thực tế và yếu tố liên quan; chọn mục tiêu lượng giá phù hợp rồi đánh giá lại sau chăm sóc. Không suy ra một thuốc cụ thể từ mã NANDA.',
      level: 'source-reviewed', sourcePdfPage: 806,
    },
    '00031': {
      summary: 'Làm sạch đường thở không hiệu quả nói đến khó loại bỏ đờm hoặc tác nhân cản trở để duy trì đường dẫn khí thông thoáng.',
      reasoning: 'Dịch tiết hoặc vật cản làm luồng khí đi qua khó khăn; ho không hiệu quả có thể làm tích tụ dịch tiết. Đây là vấn đề thông thoáng đường dẫn khí, khác với rối loạn trao đổi khí tại phế nang.',
      assessment: ['Hiệu quả ho, số lượng và tính chất dịch tiết.', 'Âm thở bất thường, nhịp và kiểu thở, dấu hiệu tăng công hô hấp.', 'Tình trạng oxy hóa và khả năng tự bảo vệ đường thở.'],
      use: 'Cá thể hóa theo tình trạng bệnh, khả năng ho và quy trình của đơn vị; theo dõi đáp ứng sau chăm sóc và báo động khi tình trạng hô hấp xấu đi.',
      level: 'source-reviewed', sourcePdfPage: 734,
    },
    '00004': {
      summary: 'Nguy cơ nhiễm khuẩn mô tả tính dễ bị vi sinh vật gây bệnh xâm nhập, phát triển; không có nghĩa người bệnh đã nhiễm khuẩn.',
      reasoning: 'Hàng rào bảo vệ và miễn dịch suy yếu, dụng cụ xâm lấn, chăm sóc vết thương khó hoặc môi trường không phù hợp làm tăng khả năng phơi nhiễm. Chẩn đoán nguy cơ dựa trên yếu tố nguy cơ, không bắt buộc có dấu hiệu bệnh đang xảy ra.',
      assessment: ['Tình trạng da, niêm mạc, vết thương và các dụng cụ xâm lấn.', 'Yếu tố liên quan đến miễn dịch, dinh dưỡng, vệ sinh và khả năng tự chăm sóc.', 'Dấu hiệu nghi nhiễm khuẩn mới xuất hiện cần đánh giá lâm sàng riêng.'],
      use: 'Ghi rõ yếu tố nguy cơ có thật, chọn hoạt động phòng ngừa phù hợp và đánh giá mức kiểm soát nguy cơ; không mặc định chỉ định kháng sinh.',
      level: 'source-reviewed', sourcePdfPage: 670,
    },
    '00030': {
      summary: 'Trao đổi khí suy giảm là vấn đề về trao đổi oxy hoặc carbon dioxide qua màng phế nang – mao mạch.',
      reasoning: 'Không chỉ là nghẹt đường thở: thông khí và tưới máu hoặc khuếch tán có thể mất tương xứng, khiến oxy hóa hoặc thải CO₂ không đáp ứng nhu cầu. Cần phân biệt với làm sạch đường thở không hiệu quả.',
      assessment: ['Nhịp thở, công hô hấp, màu sắc da và tình trạng tri giác.', 'SpO₂ hoặc kết quả khí máu nếu có chỉ định và sẵn dữ liệu.', 'Bối cảnh bệnh lý ảnh hưởng đến thông khí, tưới máu và khả năng trao đổi khí.'],
      use: 'Theo dõi diễn tiến bằng chỉ số và biểu hiện phù hợp bối cảnh; xử trí tình huống khẩn theo quy trình chuyên môn, không thay thế đánh giá lâm sàng.',
      level: 'source-reviewed', sourcePdfPage: 416,
    },
    '00312': {
      summary: 'Tổn thương do tỳ đè ở người lớn đề cập tổn thương da và/hoặc mô dưới da liên quan đến áp lực kéo dài hoặc áp lực kết hợp lực trượt.',
      reasoning: 'Áp lực cơ học kéo dài làm mô bị chèn ép, cản trở nuôi dưỡng và gây tổn thương; độ ẩm, dinh dưỡng và hạn chế vận động có thể làm quá trình phục hồi phức tạp hơn.',
      assessment: ['Vị trí, kích thước, tình trạng mô và da xung quanh.', 'Khả năng thay đổi tư thế, áp lực tại các vùng xương nhô.', 'Tình trạng dinh dưỡng, độ ẩm da và các yếu tố ảnh hưởng lành thương.'],
      use: 'Mô tả tổn thương khách quan, ghi biện pháp giảm áp và tình trạng thay đổi theo thời gian; sử dụng quy trình phân loại vết thương của đơn vị.',
      level: 'source-reviewed', sourcePdfPage: 697,
    },
    '00343': {
      summary: 'Lượng dinh dưỡng nạp vào không đầy đủ là nhận định về lượng chất dinh dưỡng cung cấp không đáp ứng nhu cầu.',
      reasoning: 'Ăn uống không đầy đủ kéo dài có thể ảnh hưởng năng lượng, miễn dịch và phục hồi mô; nguyên nhân phải được tìm cụ thể thay vì suy luận từ cân nặng đơn lẻ.',
      assessment: ['Khẩu phần thực tế so với nhu cầu và khả năng ăn uống.', 'Khó nuốt, buồn nôn, đau, giảm ngon miệng hoặc trở ngại xã hội.', 'Diễn biến cân nặng và đánh giá dinh dưỡng được phép thực hiện.'],
      use: 'Ghi số liệu thu nhận và các yếu tố liên quan; phối hợp đánh giá dinh dưỡng và theo dõi đáp ứng sau hỗ trợ.',
      level: 'editorial',
    },
    '00085': {
      summary: 'Vận động thể chất suy giảm là khó khăn trong việc tự di chuyển cơ thể có chủ đích.',
      reasoning: 'Đau, yếu cơ, mất thăng bằng hoặc hạn chế vận động có thể làm giảm độc lập, tăng nguy cơ biến chứng do bất động.',
      assessment: ['Mức độ tự đổi tư thế, ngồi, đứng, đi và chuyển giường/ghế.', 'Sức cơ, thăng bằng, đau và khả năng dùng dụng cụ hỗ trợ.', 'Điều kiện môi trường và mức trợ giúp cần thiết.'],
      use: 'Thiết lập mục tiêu chức năng cụ thể; hỗ trợ vận động an toàn và đánh giá lại khả năng tự thực hiện.',
      level: 'editorial',
    },
    '00337': {
      summary: 'Kiểu ngủ không hiệu quả liên quan đến chất lượng hoặc tổ chức giấc ngủ không đáp ứng nhu cầu hồi phục.',
      reasoning: 'Môi trường, triệu chứng, thói quen và lịch chăm sóc có thể làm gián đoạn giấc ngủ, ảnh hưởng sự tỉnh táo và khả năng hoạt động ngày hôm sau.',
      assessment: ['Thời lượng ngủ thực tế, số lần thức giấc, cảm nhận hồi phục.', 'Yếu tố gây thức giấc: đau, tiếng ồn, ánh sáng, lo lắng.', 'Ảnh hưởng đến khả năng hoạt động ban ngày.'],
      use: 'Thống nhất mục tiêu ngủ khả thi, can thiệp vào yếu tố có thể điều chỉnh và theo dõi qua nhiều đêm.',
      level: 'editorial',
    },
    '00047': {
      summary: 'Nguy cơ suy giảm tính toàn vẹn da là khả năng da bị tổn thương, chưa phải tổn thương đã xuất hiện.',
      reasoning: 'Tỳ đè, ma sát, ẩm hoặc hạn chế cảm giác và vận động có thể phá vỡ hàng rào bảo vệ da.',
      assessment: ['Các vị trí nguy cơ, độ ẩm và khả năng đổi tư thế.', 'Tình trạng dinh dưỡng và mức độ tự chăm sóc.', 'Thang đánh giá nguy cơ thích hợp tại cơ sở.'],
      use: 'Ưu tiên phòng ngừa, lưu yếu tố nguy cơ; nếu đã có tổn thương thì cần đánh giá lại chẩn đoán.',
      level: 'editorial',
    },
    '00046': {
      summary: 'Tính toàn vẹn da suy giảm nói đến thay đổi cấu trúc lớp da; khác với trạng thái chỉ có nguy cơ.',
      reasoning: 'Làn da bị phá vỡ làm giảm chức năng hàng rào, có thể ảnh hưởng đến thoải mái, mất dịch và nguy cơ nhiễm khuẩn.',
      assessment: ['Vị trí, độ sâu phù hợp khả năng đánh giá, kích thước và tình trạng vùng tổn thương.', 'Đau, dịch tiết và diễn biến vùng da xung quanh.', 'Yếu tố áp lực, độ ẩm và khả năng chăm sóc.'],
      use: 'Ghi khách quan và so sánh theo thời gian; chăm sóc vết thương theo quy định chuyên môn.',
      level: 'editorial',
    },
    '00007': {
      summary: 'Tăng thân nhiệt là tình trạng nhiệt độ cơ thể vượt giới hạn bình thường do cơ chế điều hòa nhiệt không đáp ứng.',
      reasoning: 'Cân bằng giữa sinh nhiệt và thải nhiệt bị thay đổi; cần tìm nguyên nhân và đánh giá các biểu hiện toàn thân, không xem mã điều dưỡng là chẩn đoán bệnh căn.',
      assessment: ['Nhiệt độ, thời điểm đo và diễn biến.', 'Tình trạng dịch, tri giác, tuần hoàn và các dấu hiệu nguy hiểm.', 'Bối cảnh môi trường, bệnh lý, thuốc hoặc can thiệp.'],
      use: 'Theo dõi đáp ứng chăm sóc và phối hợp xử trí nguyên nhân theo chỉ định, quy trình cơ sở.',
      level: 'editorial',
    },
  },
  noc: {
    '2102': {
      summary: 'Pain Level (Mức độ đau) là kết quả dùng để theo dõi mức đau người bệnh đang trải nghiệm; không phải chẩn đoán nguyên nhân đau.',
      reasoning: 'Đo lúc ban đầu rồi đánh giá lại tại thời điểm rõ ràng cho phép nhận ra xu hướng đáp ứng với chăm sóc. Giảm đau cần được xem cùng chức năng, tác dụng không mong muốn và mục tiêu người bệnh.',
      assessment: ['Chỉ số và thang đo đúng với mục Pain Level trong sách NOC.', 'Điểm ban đầu, điểm đích và thời điểm lượng giá lại.', 'Cách đánh giá nhất quán giữa những người thực hiện.'],
      use: 'Không mặc định Pain Level tương đương thang đau NRS 0–10; điểm NOC 1–5 cần dùng đúng thang được quy định cho kết quả/chỉ số trong sách.',
      level: 'editorial',
    },
    '1101': {
      summary: 'Tình trạng toàn vẹn mô: da và niêm mạc phản ánh các đặc điểm của mô cần được theo dõi trong quá trình chăm sóc.',
      reasoning: 'Mô bị tổn thương cần thời gian phục hồi; thay đổi biểu hiện da/niêm mạc giúp đánh giá tiến triển hay nguy cơ xấu đi.',
      assessment: ['Chỉ số phù hợp đã xác minh từ danh mục NOC.', 'Khác biệt giữa đánh giá ban đầu và các lần tiếp theo.', 'Quan sát bổ sung như vị trí tổn thương, mô xung quanh.'],
      use: 'Không tự kết luận lành thương chỉ vì điểm tổng cao; kết hợp dữ liệu tổn thương thực tế.',
      level: 'editorial',
    },
    '1004': {
      summary: 'Tình trạng dinh dưỡng là kết quả phản ánh mức đáp ứng nhu cầu dinh dưỡng của người bệnh.',
      reasoning: 'Theo dõi tiến triển đòi hỏi cả thông tin thu nhận, khả năng sử dụng dinh dưỡng và biến đổi trạng thái, chứ không chỉ một chỉ số cân nặng.',
      assessment: ['Định nghĩa chỉ số chính thức cần đối chiếu theo sách NOC.', 'Mốc ban đầu, mục tiêu và thời gian theo dõi.', 'Đánh giá dinh dưỡng hoặc nhật ký khẩu phần phù hợp.'],
      use: 'Điểm tổng hợp phải dựa vào quy ước của NOC; không dùng công thức tự tính khi chưa có tài liệu xác nhận.',
      level: 'editorial',
    },
    '0410': {
      summary: 'Tình trạng hô hấp: đường thở thông thoáng cho biết đường dẫn khí có được duy trì thông suốt hay không.',
      reasoning: 'Khi dịch tiết hoặc vật cản giảm, hô hấp có thể dễ dàng hơn, nhưng thông thoáng đường thở không đồng nghĩa trao đổi khí hoàn toàn bình thường.',
      assessment: ['Âm thở, dịch tiết, ho và kiểu thở.', 'Tình trạng oxy hóa nếu phù hợp.', 'Thang đo NOC áp dụng cho từng chỉ số đã được kiểm chứng.'],
      use: 'So sánh diễn tiến sau biện pháp chăm sóc đường thở; xử trí dấu hiệu suy hô hấp theo quy trình cấp cứu.',
      level: 'editorial',
    },
    '0402': {
      summary: 'Tình trạng hô hấp: trao đổi khí nhằm mô tả kết quả của quá trình đưa oxy vào và thải carbon dioxide.',
      reasoning: 'Có thể cải thiện độ thông khí nhưng vẫn có rối loạn trao đổi khí; lượng giá vì vậy phải chọn chỉ số phù hợp với câu hỏi lâm sàng.',
      assessment: ['Các dấu hiệu lâm sàng về oxy hóa và thông khí.', 'Chỉ số cận lâm sàng khi có chỉ định.', 'Thang đo, chu kỳ và điều kiện đánh giá nhất quán.'],
      use: 'Phân biệt điểm NOC với giá trị SpO₂/khí máu thực tế; không quy đổi trực tiếp giữa các thang.',
      level: 'editorial',
    },
    '0300': {
      summary: 'Khả năng tự chăm sóc các hoạt động hằng ngày mô tả mức độc lập của người bệnh trong các việc cơ bản.',
      reasoning: 'Mức độ trợ giúp cần thiết phản ánh chức năng; cải thiện có thể diễn ra dần từng hoạt động dù bệnh nền chưa thay đổi.',
      assessment: ['Các hoạt động người bệnh tự làm và cần hỗ trợ.', 'An toàn khi thực hiện và nguồn trợ giúp.', 'Thang đo cụ thể của kết quả NOC.'],
      use: 'Ghi mức hỗ trợ thực tế thay vì đánh giá chỉ dựa vào tuổi hoặc chẩn đoán y khoa.',
      level: 'editorial',
    },
    '0208': {
      summary: 'Khả năng vận động thể hiện năng lực thay đổi vị trí và di chuyển theo các hoạt động cần thiết.',
      reasoning: 'Đánh giá chức năng theo thời gian phản ánh tác động của phục hồi, giảm đau và hỗ trợ vận động.',
      assessment: ['Vận động tại giường, đứng, chuyển vị trí hoặc di chuyển.', 'Mức trợ giúp và yếu tố mất an toàn.', 'Bằng chứng lượng giá ở mỗi lần theo dõi.'],
      use: 'Cá thể hóa mục tiêu theo khả năng và an toàn; tránh chỉ nhìn vào một điểm chung.',
      level: 'editorial',
    },
    '0004': {
      summary: 'Giấc ngủ là kết quả theo dõi tình trạng ngủ và chất lượng hồi phục sau ngủ.',
      reasoning: 'Giấc ngủ thay đổi theo triệu chứng và môi trường; cần quan sát xu hướng qua nhiều đêm.',
      assessment: ['Thời gian, mức gián đoạn và cảm nhận chất lượng ngủ.', 'Yếu tố ảnh hưởng từ môi trường và triệu chứng.', 'Chỉ số/thang đúng trong sách NOC.'],
      use: 'Kết hợp lời kể và quan sát; không tự quy đổi số giờ ngủ thành điểm NOC.',
      level: 'editorial',
    },
    '1605': {
      summary: 'Kiểm soát đau là kết quả thiên về hành vi và khả năng người bệnh tham gia quản lý tình trạng đau.',
      reasoning: 'Điểm về khả năng kiểm soát đau khác với điểm về cường độ đau: người bệnh có thể vẫn đau nhưng nhận biết được yếu tố khởi phát và cách ứng phó.',
      assessment: ['Hành vi theo dõi và báo cáo đau.', 'Khả năng vận dụng biện pháp giảm đau phù hợp.', 'Mức đạt mục tiêu theo chỉ số NOC.'],
      use: 'Phân biệt mã 1605 (Pain Control) với mã 2102 (Pain Level); không gộp hai kết quả này thành một thang đo.',
      level: 'editorial',
    },
    '1902': {
      summary: 'Kiểm soát nguy cơ là kết quả liên quan đến việc nhận biết và chủ động giảm các yếu tố rủi ro có thể thay đổi.',
      reasoning: 'Giảm nguy cơ không đồng nghĩa sự cố đã xảy ra rồi hồi phục; trọng tâm là năng lực phòng ngừa và môi trường an toàn.',
      assessment: ['Mức nhận biết rủi ro và hành động giảm rủi ro.', 'Mức hỗ trợ cần thiết.', 'Bằng chứng hành vi quan sát được qua thời gian.'],
      use: 'Chọn chỉ số tương ứng với nguy cơ cụ thể và bối cảnh chăm sóc.',
      level: 'editorial',
    },
  },
  nic: {
    '1410': {
      summary: 'Quản lý đau cấp là nhóm can thiệp nhằm giảm đau ngắn hạn, hướng đến mức thoải mái và chức năng chấp nhận được với người bệnh.',
      reasoning: 'Muốn cải thiện đau phải biết tính chất đau và bối cảnh xuất hiện, chọn biện pháp phù hợp, sau đó đo lại mức đau và khả năng hoạt động.',
      assessment: ['Đặc điểm, cường độ và tác động đau trước can thiệp.', 'Đáp ứng sau biện pháp giảm đau.', 'Theo dõi an toàn và tác dụng không mong muốn khi có sử dụng thuốc theo chỉ định.'],
      use: 'Lựa chọn hoạt động phù hợp phạm vi hành nghề và quy trình, phối hợp xử trí y khoa khi cần; mã NIC không tự động cho phép chỉ định thuốc.',
      level: 'source-reviewed',
    },
    '3140': {
      summary: 'Quản lý đường thở là tập hợp can thiệp nhằm duy trì luồng khí đi qua đường hô hấp thông thoáng.',
      reasoning: 'Tư thế, khả năng ho và kiểm soát dịch tiết có thể ảnh hưởng đến thông khí; cần lượng giá lại hô hấp sau biện pháp hỗ trợ.',
      assessment: ['Khả năng ho và làm sạch đờm.', 'Âm thở, kiểu thở, mức gắng sức, oxy hóa.', 'Đáp ứng với tư thế, biện pháp hỗ trợ phù hợp.'],
      use: 'Các kỹ thuật xâm lấn chỉ thực hiện theo chỉ định/phân quyền và quy trình cơ sở; không suy ra cần hút đờm cho tất cả người bệnh.',
      level: 'source-reviewed',
    },
    '3160': {
      summary: 'Hút đường thở là can thiệp loại bỏ dịch tiết bằng thiết bị hút khi có chỉ định phù hợp.',
      reasoning: 'Dịch tiết cản trở đường thở có thể làm hô hấp khó khăn; hút không cần thiết cũng có rủi ro, nên đánh giá nhu cầu trước và đáp ứng sau.',
      assessment: ['Chỉ định lâm sàng, lượng và tính chất dịch tiết.', 'Tình trạng hô hấp, oxy hóa trước và sau thao tác.', 'Nguy cơ biến chứng theo quy trình đơn vị.'],
      use: 'Đây là thủ thuật có yêu cầu kỹ thuật và kiểm soát nhiễm khuẩn; không dùng hướng dẫn tóm tắt thay cho quy trình thực hành.',
      level: 'source-reviewed',
    },
    '3520': {
      summary: 'Chăm sóc tổn thương do tỳ đè bao gồm theo dõi và hỗ trợ quá trình lành vết tổn thương.',
      reasoning: 'Theo dõi đặc điểm tổn thương, giảm áp và chăm sóc điều kiện lành thương có thể cải thiện khả năng hồi phục.',
      assessment: ['Kích thước và tình trạng nền vết thương, dịch tiết và da xung quanh.', 'Áp lực tỳ đè, khả năng trở mình, tình trạng dinh dưỡng.', 'Diễn tiến và dấu hiệu biến chứng.'],
      use: 'Cụ thể hóa hoạt động theo đánh giá vết thương, quy trình và phân quyền; không áp dụng phương pháp chăm sóc vết thương từ tài liệu cũ một cách máy móc.',
      level: 'source-reviewed',
    },
    '3540': {
      summary: 'Phòng ngừa tổn thương do tỳ đè tập trung vào giảm nguy cơ xuất hiện tổn thương mới ở người có yếu tố nguy cơ.',
      reasoning: 'Áp lực, trượt, độ ẩm và bất động là các yếu tố có thể can thiệp theo kế hoạch phòng ngừa.',
      assessment: ['Mức nguy cơ bằng công cụ phù hợp.', 'Vị trí có áp lực cao, độ ẩm và khả năng đổi tư thế.', 'Mức tuân thủ và đáp ứng với biện pháp phòng ngừa.'],
      use: 'Dựa trên nguy cơ riêng từng người, phối hợp quản lý da, vận động và dinh dưỡng.',
      level: 'source-reviewed',
    },
    '6490': {
      summary: 'Phòng ngừa té ngã là nhóm hoạt động làm giảm khả năng xảy ra té ngã trong chăm sóc và sinh hoạt.',
      reasoning: 'Té ngã thường liên quan nhiều yếu tố: khả năng vận động, nhận thức, thuốc và môi trường; giảm một yếu tố đơn lẻ có thể chưa đủ.',
      assessment: ['Lịch sử té ngã và khả năng di chuyển.', 'Ảnh hưởng của môi trường, thị giác, dụng cụ hỗ trợ và thuốc.', 'Thang đánh giá nguy cơ theo chính sách cơ sở.'],
      use: 'Thống nhất hoạt động phòng ngừa phù hợp với người bệnh; không thay thế công cụ đánh giá nguy cơ đã được phê duyệt.',
      level: 'editorial',
    },
    '1100': {
      summary: 'Quản lý dinh dưỡng là nhóm hoạt động hỗ trợ người bệnh đáp ứng nhu cầu dinh dưỡng phù hợp.',
      reasoning: 'Thiếu hoặc không phù hợp lượng dinh dưỡng ảnh hưởng năng lượng và hồi phục; cần hiểu cả nhu cầu lẫn trở ngại thực tế.',
      assessment: ['Chế độ ăn, lượng ăn thực tế và khả năng nuốt.', 'Nhu cầu được đánh giá bởi nhân sự có chuyên môn.', 'Khả năng dung nạp và đáp ứng.'],
      use: 'Phối hợp chuyên gia dinh dưỡng, bác sĩ và điều dưỡng; không tự chỉ định chế độ đặc trị chỉ từ mã NIC.',
      level: 'editorial',
    },
    '1160': {
      summary: 'Theo dõi dinh dưỡng là thu thập và đối chiếu thông tin nhằm nhận ra biến đổi tình trạng dinh dưỡng.',
      reasoning: 'Theo dõi diễn tiến khác với trực tiếp tổ chức can thiệp; dữ liệu giúp quyết định có cần điều chỉnh kế hoạch hay không.',
      assessment: ['Khẩu phần thu nhận, cân nặng và biểu hiện lâm sàng.', 'Khó ăn, tiêu hóa và khả năng dung nạp.', 'Xu hướng theo nhiều lần đánh giá.'],
      use: 'Ghi nhận có thời điểm và so sánh với mục tiêu đã lập.',
      level: 'editorial',
    },
    '2210': {
      summary: 'Sử dụng thuốc giảm đau là can thiệp liên quan đến thực hiện an toàn các thuốc giảm đau được kê theo thẩm quyền.',
      reasoning: 'Hiệu quả giảm đau phải được cân bằng với tác dụng phụ và tình trạng hô hấp/tri giác; lượng giá trước và sau dùng thuốc rất quan trọng.',
      assessment: ['Mức đau trước và sau dùng thuốc.', 'Dị ứng, đường dùng và tình trạng người bệnh.', 'Tác dụng không mong muốn và các chỉ số an toàn theo quy trình.'],
      use: 'Kiểm tra y lệnh, đúng người–thuốc–liều–đường–thời điểm và giám sát theo quy trình; không xem đây là hướng dẫn kê đơn.',
      level: 'editorial',
    },
    '6550': {
      summary: 'Bảo vệ chống nhiễm khuẩn bao gồm các biện pháp giảm phơi nhiễm và hạn chế nguy cơ nhiễm khuẩn.',
      reasoning: 'Giảm tiếp xúc nguồn lây và duy trì hàng rào bảo vệ giúp hạn chế nguy cơ phát sinh nhiễm khuẩn.',
      assessment: ['Yếu tố nguy cơ và mức độ suy yếu hàng rào bảo vệ.', 'Vệ sinh tay, môi trường, dụng cụ và quy trình chăm sóc.', 'Biểu hiện bất thường cần thông báo và đánh giá.'],
      use: 'Tuân thủ quy trình kiểm soát nhiễm khuẩn hiện hành của cơ sở.',
      level: 'editorial',
    },
    '3350': {
      summary: 'Theo dõi hô hấp là can thiệp quan sát có hệ thống tình trạng thở và các thay đổi liên quan.',
      reasoning: 'Tình trạng hô hấp có thể chuyển biến nhanh; theo dõi liên tục hoặc định kỳ giúp nhận ra xấu đi sớm.',
      assessment: ['Tần số, độ sâu, kiểu thở và mức gắng sức.', 'Âm thở, độ bão hòa oxy khi phù hợp.', 'Xu hướng thay đổi và phản ứng sau biện pháp chăm sóc.'],
      use: 'Tần suất theo dõi và ngưỡng báo động theo bệnh cảnh và quy trình, không suy ra từ mã NIC đơn lẻ.',
      level: 'editorial',
    },
    '0840': {
      summary: 'Định vị tư thế là hỗ trợ người bệnh ở tư thế phù hợp nhằm tối ưu sự thoải mái, chức năng và an toàn.',
      reasoning: 'Tư thế có thể ảnh hưởng đến thông khí, áp lực lên da, vận động và cảm nhận đau.',
      assessment: ['Tình trạng da, đau, khả năng tự đổi tư thế.', 'Mục tiêu lâm sàng của tư thế được chọn.', 'Dung nạp, an toàn và sự thoải mái sau điều chỉnh.'],
      use: 'Chú ý chống chỉ định, hạn chế vận động và nguy cơ tổn thương khi di chuyển.',
      level: 'editorial',
    },
  },
};

const nandaType = (label: string): 'risk' | 'readiness' | 'problem' =>
  /^Risk for /i.test(label) ? 'risk' : /^Readiness for /i.test(label) ? 'readiness' : 'problem';

function genericVi(system: TaxonomySystem, code: string, label: string): CodeExplanation {
  const labelVi = translateVi(code, label).text;
  if (system === 'nanda') {
    const type = nandaType(label);
    const item = findNanda(code, label);
    const domain = item ? nandaDomain(item.domainNumber)?.nameVi : null;
    const hint = domain ? ` nằm trong lĩnh vực ${domain}` : '';
    if (type === 'risk') return {
      summary: `Đây là mã chẩn đoán điều dưỡng thuộc nhóm NGUY CƠ${hint}. Thuật ngữ tiếng Việt là “${labelVi}”. Nội dung chỉ ra một phản ứng bất lợi có thể xảy ra, không xác nhận biến cố đã xảy ra.`,
      reasoning: 'Logic lập kế hoạch là nhận diện yếu tố làm tăng nguy cơ → chọn biện pháp giảm nguy cơ → kiểm tra việc thực hiện và theo dõi dấu hiệu mới.',
      assessment: ['Xác minh yếu tố nguy cơ thực tế của từng người bệnh.', 'Ghi yếu tố có thể tác động bằng chăm sóc điều dưỡng.', 'Phân biệt nguy cơ với vấn đề đã xuất hiện.'],
      use: 'Chọn mục tiêu dự phòng và hoạt động tương ứng sau đánh giá; không điền đặc điểm xác định như một chẩn đoán đã xảy ra.',
      level: 'editorial',
    };
    if (type === 'readiness') return {
      summary: `Đây là chẩn đoán điều dưỡng nhóm SẴN SÀNG TĂNG CƯỜNG${hint}, thuật ngữ “${labelVi}”. Trọng tâm là mong muốn hoặc khả năng củng cố một trạng thái sức khỏe.`,
      reasoning: 'Logic chăm sóc là nhận ra điểm mạnh và sự sẵn sàng của người bệnh → thống nhất mục tiêu cải thiện → hỗ trợ hành vi hoặc khả năng tự chăm sóc.',
      assessment: ['Bằng chứng người bệnh mong muốn hoặc có khả năng nâng cao trạng thái hiện tại.', 'Nguồn lực và khó khăn để thực hiện mục tiêu.', 'Mục tiêu người bệnh tự lựa chọn.'],
      use: 'Cá thể hóa mục tiêu tăng cường sức khỏe; không mặc định người bệnh đang có thiếu hụt.',
      level: 'editorial',
    };
    return {
      summary: `Đây là mã chẩn đoán điều dưỡng về phản ứng sức khỏe đang cần được nhận định${hint}, thuật ngữ “${labelVi}”. Mã không phải tên bệnh hay hướng dẫn điều trị.`,
      reasoning: 'Logic sử dụng: thu thập bằng chứng → xem xét dấu hiệu và yếu tố liên quan → xác nhận sự phù hợp của chẩn đoán → chọn kết quả cần đạt và hoạt động chăm sóc.',
      assessment: ['Dấu hiệu, triệu chứng hoặc hành vi quan sát được.', 'Yếu tố ảnh hưởng, thời gian diễn biến và tác động đến người bệnh.', 'Các dấu hiệu cần phân biệt với chẩn đoán khác trong sách NANDA-I.'],
      use: 'Đối chiếu định nghĩa và tiêu chuẩn chẩn đoán chính thức trong sách trước khi xác nhận mã.',
      level: 'editorial',
    };
  }
  if (system === 'noc') {
    const item = findNoc(code);
    const domain = item ? nocDomain(item.domainId)?.nameVi : null;
    return {
      summary: `NOC “${labelVi}” là tên một KẾT QUẢ lượng giá${domain ? ` thuộc lĩnh vực ${domain}` : ''}. Mã cho biết cần theo dõi trạng thái đạt được, không phải tự động là một thang xét nghiệm hay can thiệp.`,
      reasoning: 'Logic: xác định kết quả mong đợi → chọn chỉ số chuẩn và thang tương ứng → ghi điểm ban đầu/mục tiêu → đo lặp lại cùng cách để nhận xét xu hướng.',
      assessment: ['Định nghĩa và các chỉ số thực sự đi kèm kết quả trong sách NOC.', 'Thang Likert phù hợp cho từng chỉ số và ý nghĩa mức 1–5.', 'Thời điểm đo, người lượng giá và bằng chứng quan sát.'],
      use: 'Không suy diễn điểm hoặc mã chỉ số từ tên kết quả; ứng dụng chưa có danh mục chỉ số đầy đủ đã kiểm chứng.',
      level: 'editorial',
    };
  }
  return {
    summary: `NIC “${labelVi}” là tên nhóm CAN THIỆP điều dưỡng được chuẩn hóa, không phải một y lệnh hay một hành động duy nhất.`,
    reasoning: 'Logic: xác định vấn đề và mục tiêu → cân nhắc tình trạng và nguy cơ của người bệnh → chọn các hoạt động phù hợp trong phạm vi hành nghề → thực hiện và lượng giá đáp ứng.',
    assessment: ['Chỉ định, chống chỉ định và điều kiện an toàn liên quan.', 'Mức độ hỗ trợ người bệnh cần và năng lực thực hiện tại cơ sở.', 'Kết quả theo dõi cần ghi sau can thiệp.'],
    use: 'Nhãn NIC 8 đang ở dạng chuyển ngữ chưa thẩm định; phải xác minh chỉ định, chống chỉ định và quy trình chuyên môn trước khi áp dụng. Mã không mặc nhiên cho phép thủ thuật hoặc thuốc.',
    level: 'editorial',
  };
}

function genericEn(system: TaxonomySystem, code: string, label: string): CodeExplanation {
  if (system === 'nanda') {
    const type = nandaType(label);
    const title = type === 'risk' ? 'Risk diagnosis' : type === 'readiness' ? 'Health-promotion diagnosis' : 'Problem-focused nursing diagnosis';
    return {
      summary: `${title}: “${label}” (code ${code}). A nursing diagnosis describes a human response and is not the same as a medical disease label.`,
      reasoning: type === 'risk' ? 'Identify actual risk factors, plan prevention, and reassess emerging signs.' : 'Collect assessment evidence, confirm nursing judgment, plan measurable outcomes, implement care, and reassess.',
      assessment: ['Patient-specific observations and clinical context.', 'Contributing or risk factors; distinguish related diagnoses.', 'Relevant defining characteristics and official criteria where applicable.'],
      use: 'Check the full definition and diagnostic indicators in NANDA-I 2024–2026. Detailed Vietnamese editorial notes may also be available.',
      level: 'editorial',
    };
  }
  return system === 'noc' ? {
    summary: `NOC ${code}: “${label}” is a standardized outcome used to track change in patient status.`,
    reasoning: 'Choose verified indicators and scales, assess baseline, set goals, repeat observations, and interpret trends.',
    assessment: ['Official indicators and scale anchors for this outcome.', 'Baseline, goal, current rating and assessment time.', 'Consistency of measurement and assessment context.'],
    use: 'Do not infer rating scales, indicator codes, or scoring formulas from a label alone.',
    level: 'editorial',
  } : {
    summary: `NIC ${code}: “${label}” names a standardized category of nursing interventions, not a single order or procedure.`,
    reasoning: 'Select individualized activities, assess safety and scope, implement appropriate care, and reassess outcomes.',
    assessment: ['Patient needs and safety considerations.', 'Permitted activities in the setting.', 'Observed response and any adverse effects.'],
    use: 'Verify full NIC definitions and activities in the licensed book and follow local protocols.',
    level: 'editorial',
  };
}

export function explainNnnCode(system: TaxonomySystem, code: string, label: string, lang: Lang): CodeExplanation {
  if (lang === 'vi') return system === 'nic' ? genericVi(system, code, label) : CURATED_EXPLANATIONS[system]?.[code] ?? genericVi(system, code, label);
  return genericEn(system, code, label);
}

export function shortNnnExplanation(system: TaxonomySystem, code: string, label: string, lang: Lang): string {
  return explainNnnCode(system, code, label, lang).summary;
}
