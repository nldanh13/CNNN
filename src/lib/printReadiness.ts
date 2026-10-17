import type { CarePlan } from '../types';
import type { PlanSyncState } from '../store/usePatientPlans';
import { isRiskDiagnosisLabel } from '../components/printNotes';
import { validateCareEntry } from './carePlanSafety';
import { validateName } from './patientValidation';

export interface PrintReadinessIssue {
  id: string;
  section: string;
  message: string;
}

/**
 * Advisory preflight only. Never change clinical text, infer missing findings,
 * silently block printing or treat a technical catalog check as clinical approval.
 */
export function getPrintReadinessIssues(plan: CarePlan): PrintReadinessIssue[] {
  const issues: PrintReadinessIssue[] = [];
  if (validateName(plan.patient.name)) {
    issues.push({ id: 'patient-name', section: 'Người bệnh', message: 'Họ và tên chưa hợp lệ hoặc còn trống.' });
  }
  if (plan.entries.length === 0) {
    issues.push({ id: 'empty-plan', section: 'Kế hoạch', message: 'Chưa có vấn đề chăm sóc nào được ghi nhận.' });
  }

  plan.entries.forEach((entry, index) => {
    const section = `Vấn đề ${index + 1}`;
    // This validates codes, labels and rating formats, not the clinical link.
    validateCareEntry(entry, 'vi').forEach((message, i) => {
      issues.push({ id: `entry-${index}-technical-${i}`, section, message });
    });

    const risk = isRiskDiagnosisLabel(entry.nanda.label) || /^risk for(?:\s|$)/i.test(entry.nanda.label);
    if (entry.nanda.code && risk && !entry.relatedFactors.some((factor) => factor.trim())) {
      issues.push({
        id: `entry-${index}-risk-factors`, section,
        message: 'Chẩn đoán nguy cơ chưa ghi yếu tố nguy cơ; cần đối chiếu nhận định đã thu thập.',
      });
    }
    if (entry.noc.code && entry.noc.current == null) {
      issues.push({
        id: `entry-${index}-not-assessed`, section,
        message: 'Chưa ghi điểm lượng giá NOC hiện tại (có thể phù hợp nếu kế hoạch mới lập).',
      });
    }
  });
  return issues;
}

/** Print still uses the visible local draft, which might not yet exist on Supabase. */
export function getPrintSyncWarning(
  planStatus: 'local' | 'loading' | 'ready' | 'migration' | 'error',
  syncState: PlanSyncState,
): string | null {
  if (planStatus === 'local') return null;
  if (planStatus !== 'ready') {
    return 'Dữ liệu tài khoản chưa tải hoặc đối chiếu xong. Bản in có thể chưa phải phiên bản mới nhất trên tài khoản.';
  }
  if (syncState === 'conflict') {
    return 'Có xung đột giữa bản trên máy và tài khoản. Chưa đối chiếu xong; bản in chỉ phản ánh dữ liệu đang hiển thị trên thiết bị này.';
  }
  if (syncState === 'error') {
    return 'Bản chỉnh sửa chưa đồng bộ lên tài khoản do lỗi lưu. Hãy kiểm tra trạng thái lưu trước khi sử dụng bản in.';
  }
  if (syncState === 'saving') {
    return 'Hệ thống đang lưu bản chỉnh sửa. Bản in có thể chứa thay đổi chưa đồng bộ lên tài khoản.';
  }
  return null;
}
