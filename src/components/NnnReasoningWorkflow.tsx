import { ArrowDown, AlertCircle, ClipboardList, Target, Activity, ListChecks, RefreshCcw } from 'lucide-react';
import { useApp } from '../store/AppContext';

export function NnnReasoningWorkflow() {
  const { t } = useApp();
  const steps = [
    { label: t.reasoningWorkflow.stage1, detail: t.reasoningWorkflow.stage1Detail, icon: ClipboardList },
    { label: t.reasoningWorkflow.stage2, detail: t.reasoningWorkflow.stage2Detail, icon: Target },
    { label: t.reasoningWorkflow.stage3, detail: t.reasoningWorkflow.stage3Detail, icon: Activity },
    { label: t.reasoningWorkflow.stage4, detail: t.reasoningWorkflow.stage4Detail, icon: ListChecks },
    { label: t.reasoningWorkflow.stage5, detail: t.reasoningWorkflow.stage5Detail, icon: RefreshCcw },
  ];
  return (
    <section className="mb-6 rounded-xl border border-sky-200 bg-sky-50/30 p-5 dark:border-sky-900 dark:bg-sky-950/10">
      <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">{t.reasoningWorkflow.title}</h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{t.reasoningWorkflow.subtitle}</p>
      <ol className="mt-4 grid gap-3 md:grid-cols-5">
        {steps.map(({label,detail,icon:StepIcon},index)=>(
          <li key={label} className="relative rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <StepIcon className="h-4 w-4 shrink-0 text-sky-700 dark:text-sky-300" />
              <strong className="text-xs text-slate-900 dark:text-slate-100">{label}</strong>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{detail}</p>
            {index < steps.length - 1 && <ArrowDown className="absolute -bottom-3 left-1/2 z-10 h-4 w-4 -translate-x-1/2 rounded-full bg-white text-sky-600 md:hidden" />}
          </li>
        ))}
      </ol>
      <p className="mt-4 flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{t.reasoningWorkflow.warning}
      </p>
    </section>
  );
}
