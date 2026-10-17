import { ClipboardList, Target, Activity, ListChecks, RefreshCcw } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { Alert, Steps } from '../ui';

export function NnnReasoningWorkflow() {
  const { t } = useApp();
  const i = 'h-4 w-4';
  // Bỏ số thứ tự trong nhãn vì Steps đã đánh số.
  const n = (label: string) => label.replace(/^\d+\.\s*/, '');
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-fg">{t.reasoningWorkflow.title}</h2>
        <p className="mt-1 text-sm text-fg-muted">{t.reasoningWorkflow.subtitle}</p>
      </div>
      <Steps
        columns={5}
        steps={[
          { title: n(t.reasoningWorkflow.stage1), text: t.reasoningWorkflow.stage1Detail, icon: <ClipboardList className={i} /> },
          { title: n(t.reasoningWorkflow.stage2), text: t.reasoningWorkflow.stage2Detail, icon: <Target className={i} /> },
          { title: n(t.reasoningWorkflow.stage3), text: t.reasoningWorkflow.stage3Detail, icon: <Activity className={i} /> },
          { title: n(t.reasoningWorkflow.stage4), text: t.reasoningWorkflow.stage4Detail, icon: <ListChecks className={i} /> },
          { title: n(t.reasoningWorkflow.stage5), text: t.reasoningWorkflow.stage5Detail, icon: <RefreshCcw className={i} /> },
        ]}
      />
      <Alert tone="warning" size="sm">{t.reasoningWorkflow.warning}</Alert>
    </section>
  );
}
