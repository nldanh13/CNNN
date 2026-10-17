import { Database, Moon, Palette, Sun } from 'lucide-react';
import { useApp } from '../store/AppContext';
import type { Theme } from '../store/AppContext';
import { Card, CardHeader, PageHeader, Segmented, SettingRow } from '../ui';
import { PlanBackupButtons } from '../components/PlanBackup';
import { AccountSettings } from './AccountPage';

export function SettingsPage() {
  const { t, theme, setTheme, plans } = useApp();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={t.settings.title} />

      <div className="space-y-5">
        <AccountSettings />

        <Card>
          <CardHeader icon={<Palette className="h-4 w-4" />} title={t.settings.display} />
          <div className="divide-y divide-line-soft">
            <SettingRow label={t.settings.theme}>
              <Segmented<Theme>
                value={theme}
                onChange={setTheme}
                options={[
                  { value: 'light', label: t.app.light, icon: <Sun className="h-4 w-4" /> },
                  { value: 'dark', label: t.app.dark, icon: <Moon className="h-4 w-4" /> },
                ]}
              />
            </SettingRow>
            <SettingRow label={t.settings.language} hint={t.settings.languageHint}>
              <span className="text-sm font-medium text-fg-body">Tiếng Việt</span>
            </SettingRow>
          </div>
        </Card>

        <Card>
          <CardHeader icon={<Database className="h-4 w-4" />} title={t.settings.data} />
          <SettingRow label={`${plans.length} ${t.settings.planCount}`} hint={t.settings.backupHint}>
            <div className="flex gap-2">
              <PlanBackupButtons />
            </div>
          </SettingRow>
        </Card>
      </div>
    </div>
  );
}
