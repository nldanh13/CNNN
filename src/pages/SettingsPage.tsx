import { Moon, Sun } from 'lucide-react';
import { useApp } from '../store/AppContext';
import type { Theme } from '../store/AppContext';
import { Card, CardHeader, PageHeader, Segmented } from '../components/ui';
import { PlanBackupButtons } from '../components/PlanBackup';
import { AccountSettings } from './AccountPage';

export function SettingsPage() {
  const { t, theme, setTheme, plans } = useApp();

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={t.settings.title} />

      <div className="space-y-6">
        <AccountSettings />
        <Card>
          <CardHeader title={t.settings.display} />
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white">{t.settings.language}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t.settings.languageHint}</p>
              </div>
              <span className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium dark:border-slate-700">Tiếng Việt</span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <p className="text-sm font-medium text-slate-900 dark:text-white">{t.settings.theme}</p>
              <Segmented<Theme>
                value={theme}
                onChange={setTheme}
                options={[
                  { value: 'light', label: t.app.light, icon: <Sun className="h-4 w-4" /> },
                  { value: 'dark', label: t.app.dark, icon: <Moon className="h-4 w-4" /> },
                ]}
              />
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title={t.settings.data} subtitle={`${plans.length} ${t.settings.planCount}`} />
          <div className="space-y-4 px-5 py-4">
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{t.settings.dataHint}</p>
            <div className="flex flex-wrap gap-2">
              <PlanBackupButtons />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
