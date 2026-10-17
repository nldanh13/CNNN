import type { CareEntry, CarePlan } from '../types';
import { useApp } from '../store/AppContext';
import { computeBmi, formatDate, signed } from '../lib/utils';
import { scaleLabel } from './Likert';
import { optionalPrintMetric, splitClinicalPrintNotes } from './printNotes';
import './PrintView.css';

type PatientField = { label: string; value: string };

function PrintDiagnosis({ entry, tr }: {
  entry: CareEntry; tr: (code: string | null, label: string) => string;
}) {
  const notes = splitClinicalPrintNotes(entry.notes);
  const name = tr(entry.nanda.code, entry.nanda.label);
  const isRisk = /^nguy cơ\b/iu.test(name);
  return (
    <section className="cnnn-print-section">
      <h3 className="cnnn-print-section-title"><span>01</span> Chẩn đoán điều dưỡng <small>NANDA-I</small></h3>
      <p className="cnnn-print-term"><strong>[{entry.nanda.code}]</strong> {name || 'Chưa chọn chẩn đoán'}</p>
      {notes.diagnosticStatement && (
        <div className="cnnn-print-field">
          <div className="cnnn-print-field-label">Diễn giải chẩn đoán đã lưu</div>
          <div>{notes.diagnosticStatement}</div>
        </div>
      )}
      {entry.definingCharacteristics.length > 0 && (
        <div className="cnnn-print-field">
          <div className="cnnn-print-field-label">Đặc điểm xác định</div>
          <ul>{entry.definingCharacteristics.map((v, i) => <li key={i}>{tr(null, v)}</li>)}</ul>
        </div>
      )}
      {entry.relatedFactors.length > 0 && (
        <div className="cnnn-print-field">
          <div className="cnnn-print-field-label">{isRisk ? 'Yếu tố nguy cơ' : 'Yếu tố liên quan / nguy cơ'}</div>
          <ul>{entry.relatedFactors.map((v, i) => <li key={i}>{tr(null, v)}</li>)}</ul>
        </div>
      )}
    </section>
  );
}

function PrintOutcome({ entry, tr, lang }: {
  entry: CareEntry; tr: (code: string | null, label: string) => string; lang: 'vi' | 'en';
}) {
  const notes = splitClinicalPrintNotes(entry.notes);
  const noc = entry.noc;
  return (
    <section className="cnnn-print-section">
      <h3 className="cnnn-print-section-title"><span>02</span> Mục tiêu và kết quả mong đợi <small>NOC</small></h3>
      <p className="cnnn-print-term"><strong>[{noc.code}]</strong> {tr(noc.code, noc.label)}</p>
      {notes.goal && (
        <div className="cnnn-print-field">
          <div className="cnnn-print-field-label">Mục tiêu chăm sóc đã ghi</div>
          <p>{notes.goal}</p>
        </div>
      )}
      <div className="cnnn-print-scores" aria-label="Điểm lượng giá kết quả NOC">
        <div><span>Ban đầu</span><strong>{noc.baseline}/5</strong></div>
        <div><span>Mục tiêu</span><strong>{noc.target}/5</strong></div>
        <div><span>Hiện tại</span><strong>{noc.current == null ? 'Chưa lượng giá' : `${noc.current}/5`}</strong></div>
      </div>
      {noc.scaleCode && <p className="cnnn-print-small">Thang đo NOC: {noc.scaleCode}{noc.current != null ? ` · ${scaleLabel(noc.scaleCode, noc.current, lang)}` : ''}</p>}
      {noc.indicators.length > 0 && (
        <div className="cnnn-print-field">
          <div className="cnnn-print-field-label">Chỉ số kết quả được theo dõi</div>
          <ul className="cnnn-print-indicators">
            {noc.indicators.map(ind => (
              <li key={ind.id}>
                <span>{ind.code && <strong>[{ind.code}] </strong>}{tr(null, ind.name)}</span>
                <span className="cnnn-print-indicator-score">{ind.score == null ? 'Chưa chấm' : `${ind.score}/5`}{ind.scaleCode && ind.scaleCode !== noc.scaleCode ? ` · Thang ${ind.scaleCode}` : ''}{ind.sourcePage ? ` · Tr. ${ind.sourcePage}` : ''}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function PrintInterventions({ entry, tr }: {
  entry: CareEntry; tr: (code: string | null, label: string) => string;
}) {
  return (
    <section className="cnnn-print-section">
      <h3 className="cnnn-print-section-title"><span>03</span> Can thiệp và hoạt động chăm sóc <small>NIC</small></h3>
      {entry.nic.length ? (
        <ol className="cnnn-print-interventions">
          {entry.nic.map((n, i) => (
            <li key={n.code} className="cnnn-print-intervention">
              <div className="cnnn-print-intervention-heading">
                <span className="cnnn-print-intervention-no">{String(i + 1).padStart(2, '0')}</span>
                <span><strong>[{n.code}]</strong> {tr(n.code, n.label)}</span>
              </div>
              {n.activities.length > 0 && (
                <ul className="cnnn-print-activities">
                  {n.activities.map((activity, index) => <li key={index}>{tr(null, activity)}</li>)}
                </ul>
              )}
            </li>
          ))}
        </ol>
      ) : <p className="cnnn-print-small">Chưa ghi nhận can thiệp NIC.</p>}
    </section>
  );
}

function PrintEvaluation({ entry, lang }: {
  entry: CareEntry; lang: 'vi' | 'en';
}) {
  const assessments = entry.noc.assessments ?? [];
  const notes = splitClinicalPrintNotes(entry.notes);
  return (
    <section className="cnnn-print-section">
      <h3 className="cnnn-print-section-title"><span>04</span> Lượng giá và ghi chú</h3>
      {entry.noc.current != null ? (
        <p className="cnnn-print-evaluation-summary">
          Điểm NOC hiện tại: <strong>{entry.noc.current}/5</strong>
          {' · '}Thay đổi so với ban đầu: <strong>{signed(entry.noc.current - entry.noc.baseline)}</strong>
          {entry.noc.current >= entry.noc.target ? ' · Đạt mức điểm mục tiêu' : ' · Chưa đạt mức điểm mục tiêu'}
        </p>
      ) : (
        <p className="cnnn-print-small">Chưa ghi nhận điểm lượng giá hiện tại.</p>
      )}
      {assessments.length > 0 && (
        <div className="cnnn-print-field">
          <div className="cnnn-print-field-label">Lịch sử lượng giá NOC</div>
          <ol className="cnnn-print-assessment-list">
            {assessments.map(a => (
              <li key={a.id}>
                <div><strong>{formatDate(a.assessedAt, lang, true)}</strong> · {a.score}/5 · Thang {a.scaleCode}{a.assessor ? ` · ${a.assessor}` : ''}</div>
                {a.notes && <p>{a.notes}</p>}
                {(a.indicatorRatings ?? []).length > 0 && <p>Chỉ số: {(a.indicatorRatings ?? []).map(r => `${r.code} ${r.score == null ? 'chưa chấm' : r.score + '/5'}`).join('; ')}</p>}
              </li>
            ))}
          </ol>
        </div>
      )}
      {notes.other.length > 0 && (
        <div className="cnnn-print-field">
          <div className="cnnn-print-field-label">Ghi chú bổ sung</div>
          {notes.other.map((line, i) => <p key={i} className="cnnn-print-note">{line}</p>)}
        </div>
      )}
      {notes.provenance.map((line, i) => <p key={i} className="cnnn-print-provenance">{line}</p>)}
    </section>
  );
}

/** A4 clinical record: one care problem per structured block, not three cramped columns. */
export function PrintView({ plan }: { plan: CarePlan }) {
  const { lang, term } = useApp();
  const p = plan.patient;
  const tr = (code: string | null, en: string) => term(code, en).text;
  const fields: PatientField[] = [];
  const append = (label: string, value: string | number | null | undefined) => {
    if (value !== null && value !== undefined && String(value).trim()) fields.push({ label, value: String(value) });
  };
  append('Họ và tên', p.name.trim());
  append('Mã người bệnh', p.mrn.trim());
  if (p.age != null && Number.isFinite(p.age)) append('Tuổi', p.age);
  if (p.name.trim() || p.mrn.trim() || p.age != null) append('Giới tính', p.gender === 'male' ? 'Nam' : p.gender === 'female' ? 'Nữ' : 'Khác');
  append('Khoa', p.ward.trim());
  append('Giường', p.bed.trim());
  if (p.admissionDate) append('Ngày nhập viện', formatDate(p.admissionDate, lang));
  append('Chiều cao', optionalPrintMetric(p.heightCm, 'cm'));
  append('Cân nặng', optionalPrintMetric(p.weightKg, 'kg'));
  const bmi = computeBmi(p.heightCm, p.weightKg);
  if (bmi != null && Number.isFinite(bmi)) append('BMI', bmi.toLocaleString('vi-VN'));
  append('Chẩn đoán y khoa', p.medicalDiagnoses.filter(Boolean).map(d => tr(null, d)).join('; '));
  append('Dị ứng đã ghi', p.allergies.filter(Boolean).join('; '));

  return (
    <div className="cnnn-print-document hidden print:block" aria-label="Kế hoạch chăm sóc điều dưỡng để in">
      <header className="cnnn-print-header">
        <p className="cnnn-print-eyebrow">THƯ VIỆN ĐIỀU DƯỠNG NNN <span>•</span> NANDA-I / NOC / NIC</p>
        <h1>KẾ HOẠCH CHĂM SÓC ĐIỀU DƯỠNG</h1>
        <div className="cnnn-print-document-meta">
          <span>Mã kế hoạch: <strong>{plan.code}</strong></span>
          <span>Ngày lập: <strong>{formatDate(plan.createdAt, lang)}</strong></span>
        </div>
      </header>

      <section className="cnnn-print-patient" aria-labelledby="cnnn-print-patient-title">
        <h2 id="cnnn-print-patient-title">THÔNG TIN NGƯỜI BỆNH</h2>
        {fields.length ? (
          <dl className="cnnn-print-patient-grid">
            {fields.map(({ label, value }) => (
              <div key={label}>
                <dt>{label}</dt><dd>{value}</dd>
              </div>
            ))}
          </dl>
        ) : <p className="cnnn-print-small">Chưa nhập thông tin người bệnh.</p>}
      </section>

      <div className="cnnn-print-plan-heading">
        <h2>NỘI DUNG KẾ HOẠCH CHĂM SÓC</h2>
        <span>{plan.entries.length} vấn đề</span>
      </div>
      {plan.entries.length > 0 ? plan.entries.map((entry, index) => (
        <article className="cnnn-print-entry" key={entry.id}>
          <div className="cnnn-print-entry-heading">
            <h2>VẤN ĐỀ CHĂM SÓC {String(index + 1).padStart(2, '0')}</h2>
            <span>{entry.status === 'resolved' ? 'Đã giải quyết' : 'Đang theo dõi'}</span>
          </div>
          <PrintDiagnosis entry={entry} tr={tr} />
          <PrintOutcome entry={entry} tr={tr} lang={lang} />
          <PrintInterventions entry={entry} tr={tr} />
          <PrintEvaluation entry={entry} lang={lang} />
        </article>
      )) : <p className="cnnn-print-small">Chưa có vấn đề chăm sóc nào được ghi nhận.</p>}

      <footer className="cnnn-print-footer">
        <div className="cnnn-print-footer-note">
          Tài liệu được lập từ dữ liệu đã nhập trong CNNN. Các nội dung chưa được ghi nhận không được tự bổ sung.
        </div>
        <div className="cnnn-print-signature">
          <p>Ngày in: {formatDate(new Date().toISOString(), lang)}</p>
          <strong>Điều dưỡng lập kế hoạch</strong>
          <div className="cnnn-print-signature-space" />
          <p>{plan.nurse.trim() || '(Ký và ghi rõ họ tên)'}</p>
        </div>
      </footer>
    </div>
  );
}
