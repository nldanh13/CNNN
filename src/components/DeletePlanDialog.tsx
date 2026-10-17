import type { CarePlan } from '../types';
import { Button, Modal, ModalFooter, ModalHeader } from '../ui';

/**
 * Shared confirmation for deleting an entire account-scoped care plan.
 * The parent performs the actual deletion only after explicit confirmation.
 */
export function DeletePlanDialog({
  plan,
  onClose,
  onConfirm,
}: {
  plan: CarePlan | null;
  onClose: () => void;
  onConfirm: (plan: CarePlan) => void;
}) {
  return (
    <Modal open={Boolean(plan)} onClose={onClose} className="max-w-md">
      <ModalHeader title="Xóa kế hoạch chăm sóc?" onClose={onClose} />
      {plan && (
        <>
          <div className="space-y-3 px-5 py-4 text-sm">
            <p className="text-fg-body">
              Bạn đang yêu cầu xóa toàn bộ kế hoạch của người bệnh sau:
            </p>
            <div className="rounded-control border border-line bg-surface-muted px-4 py-3">
              <p className="font-semibold text-fg">{plan.patient.name.trim() || 'Chưa nhập tên'}</p>
              <p className="mt-1 font-mono text-xs text-fg-muted">{plan.code}</p>
              <p className="mt-2 text-xs text-fg-muted">
                {plan.entries.length} vấn đề chăm sóc
              </p>
            </div>
            <p className="text-fg-body">
              Toàn bộ chẩn đoán, kết quả NOC, can thiệp NIC, lịch sử lượng giá
              và ghi chú trong kế hoạch này sẽ bị xóa khỏi tài khoản sau khi đồng bộ.
            </p>
            <p className="text-xs text-fg-muted">
              Có thể chọn Hoàn tác trong thông báo ngay sau khi xóa. Nếu không muốn xóa, chọn Giữ lại.
            </p>
          </div>
          <ModalFooter>
            <Button autoFocus variant="secondary" onClick={onClose}>Giữ lại</Button>
            <Button variant="danger" onClick={() => onConfirm(plan)}>Xác nhận xóa</Button>
          </ModalFooter>
        </>
      )}
    </Modal>
  );
}
