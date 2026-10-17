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
