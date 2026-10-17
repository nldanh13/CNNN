import { Database, Monitor, Moon, Palette, Sun } from 'lucide-react';
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
          <SettingRow label={t.settings.theme} hint={t.settings.themeHint}>
            <Segmented<Theme>
              value={theme}
              onChange={setTheme}
              options={[
                { value: 'light', label: t.app.light, icon: <Sun className="h-4 w-4" /> },
                { value: 'dark', label: t.app.dark, icon: <Moon className="h-4 w-4" /> },
                { value: 'system', label: t.app.system, icon: <Monitor className="h-4 w-4" /> },
              ]}
              />
          </SettingRow>
        </Card>

        <Card>
          <CardHeader icon={<Database className="h-4 w-4" />} title={t.settings.data} />
          <SettingRow label={`${plans.length} ${t.settings.planCount}`} hint={plans.length ? t.settings.backupHint : t.settings.backupEmpty}>
            <div className="flex gap-2">
              <PlanBackupButtons />
            </div>
          </SettingRow>
        </Card>
      </div>
    </div>
  );
}
