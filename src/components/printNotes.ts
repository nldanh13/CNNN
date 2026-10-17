/**
 * Keep the care entry note verbatim, but restore the sections introduced
 * by the diagnosis assistant. Never infer or invent clinical content.
 */
export interface ClinicalPrintNotes {
  goal: string | null;
  diagnosticStatement: string | null;
  provenance: string[];
  other: string[];
}

export function splitClinicalPrintNotes(raw: string): ClinicalPrintNotes {
  const result: ClinicalPrintNotes = {
    goal: null, diagnosticStatement: null, provenance: [], other: [],
  };
  for (const original of raw.split(/\r?\n/)) {
    const line = original.trim();
    if (!line) continue;
    const goal = line.match(/^Mục tiêu đề xuất:\s*(.*)$/iu);
    const diagnosis = line.match(/^Câu chẩn đoán:\s*(.*)$/iu);
    if (goal && result.goal === null) {
      result.goal = goal[1];
    } else if (diagnosis && result.diagnosticStatement === null) {
      result.diagnosticStatement = diagnosis[1];
    } else if (/^\(?Gợi ý từ Trợ lý chẩn đoán\b/iu.test(line)) {
      result.provenance.push(line);
    } else {
      result.other.push(line);
    }
  }
  return result;
}

/** Render only values that were actually entered, without empty units. */
export function optionalPrintMetric(value: number | null, unit: string): string | null {
  return value != null && Number.isFinite(value) && value > 0 ? `${value.toLocaleString('vi-VN')} ${unit}` : null;
}


/** Vietnamese risk labels need Unicode-aware boundaries: JS `\\b` does not match after "cơ". */
export function isRiskDiagnosisLabel(label: string): boolean {
  return /^nguy\s+cơ(?=$|[^\p{L}\p{N}])/iu.test(label.trim());
}

/** Compare only faithfully repeated details; retain any additional clinical statement. */
function normalizeClinicalText(text: string): string {
  return text.normalize('NFC').toLocaleLowerCase('vi')
    .replace(/\s+/g, ' ').trim().replace(/[.!?;:,\s]+$/gu, '');
}

/**
 * Hides assistant-generated PES phrasing in the PRINT OUTPUT when it repeats
 * the diagnosis title and the full set of already printed risk factors.
 * This never mutates the source notes, diagnoses, or factors in Supabase.
 * Any new clinical detail or mismatched factor keeps the statement visible.
 */
export function shouldPrintDiagnosticStatement(
  statement: string | null,
  diagnosisLabel: string,
  relatedFactors: string[],
): boolean {
  if (!statement?.trim()) return false;
  const title = normalizeClinicalText(diagnosisLabel);
  const phrase = normalizeClinicalText(statement);

  if (phrase === title) return false;
  if (!title || !isRiskDiagnosisLabel(diagnosisLabel) || !relatedFactors.length) return true;

  const prefix = `${title}, yếu tố nguy cơ:`;
  if (!phrase.startsWith(prefix)) return true;
  const factors = phrase.slice(prefix.length).split(';').map(normalizeClinicalText).filter(Boolean);
  const listed = relatedFactors.map(normalizeClinicalText).filter(Boolean);
  if (factors.length !== listed.length) return true;
  return !factors.every((factor, index) => factor === listed[index]);
}
