import { Moon, Sun } from 'lucide-react';
import { useApp } from '../store/AppContext';
import type { Theme } from '../store/AppContext';
import { Badge, Card, CardBody, CardHeader, PageHeader, Segmented, SettingRow } from '../ui';
import { PlanBackupButtons } from '../components/PlanBackup';
import { CloudBackupPanel } from '../components/CloudBackupPanel';
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
          <div className="divide-y divide-line-soft">
            <SettingRow label={t.settings.language} hint={t.settings.languageHint}>
              <Badge className="px-3 py-1 text-xs">Tiếng Việt</Badge>
            </SettingRow>
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
          </div>
        </Card>

        <CloudBackupPanel />

        <Card>
          <CardHeader title={t.settings.data} subtitle={`${plans.length} ${t.settings.planCount}`} />
          <CardBody className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <PlanBackupButtons />
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
