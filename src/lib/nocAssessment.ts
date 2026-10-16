import type { CareEntry, NocAssessment } from '../types';
import { NOC_SCALES } from '../data/reference';
import { uid } from './utils';

export interface AssessmentDraft {
  score: number;
  assessor: string;
  notes: string;
  indicatorScores?: Record<string, number | null>;
  assessedAt?: string;
}
const valid = (n: number | null): boolean => n === null || (Number.isInteger(n) && n >= 1 && n <= 5);
export const effectiveIndicatorScale = (scale: string | undefined, outcome: string): string => scale || outcome;

/** Appends new snapshots without editing historical assessment records. */
export function recordNocAssessment(entry: CareEntry, draft: AssessmentDraft): CareEntry {
  if (draft.score == null || !valid(draft.score)) throw Error('NOC rating must be 1–5');
  if (!NOC_SCALES.some((s) => s.code === entry.noc.scaleCode)) throw Error('Invalid NOC scale');
  if (!entry.noc.code) throw Error('Missing NOC outcome');
  const assessedAt = draft.assessedAt ?? new Date().toISOString();
  if (!assessedAt || Number.isNaN(Date.parse(assessedAt))) throw Error('Invalid date');
  const indicators = entry.noc.indicators.map((ind) => ({
    ...ind, score: draft.indicatorScores && Object.prototype.hasOwnProperty.call(draft.indicatorScores, ind.code)
      ? draft.indicatorScores[ind.code] : null,
  }));
  for (const ind of indicators) {
    if (!NOC_SCALES.some((s) => s.code === effectiveIndicatorScale(ind.scaleCode, entry.noc.scaleCode))) throw Error('Invalid indicator scale');
    if (!valid(ind.score)) throw Error('Invalid indicator rating');
  }
  const assessment: NocAssessment = {
    id: uid('assessment'), assessedAt, assessor: draft.assessor.trim(), notes: draft.notes.trim(),
    score: draft.score, scaleCode: entry.noc.scaleCode,
    indicatorRatings: indicators.map((ind) => ({
      code: ind.code, score: ind.score,
      scaleCode: effectiveIndicatorScale(ind.scaleCode, entry.noc.scaleCode),
    })),
  };
  return { ...entry, noc: {
    ...entry.noc, current: draft.score, indicators,
    assessments: [...(entry.noc.assessments ?? []), assessment],
  }};
}
