import { Moon, Sun, ClipboardList, ArrowRight } from 'lucide-react';
import { useApp } from '../store/AppContext';
import type { Theme } from '../store/AppContext';
import { Badge, Card, CardBody, CardHeader, PageHeader, Segmented, SettingRow } from '../ui';
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
          <CardHeader title="Báo cáo dữ liệu" subtitle="Theo dõi góp ý của bạn và phản hồi của quản trị viên." />
          <div className="px-5 py-4">
            <a href="#/reports" className="inline-flex items-center gap-2 rounded-control border border-line px-4 py-2 text-sm font-semibold text-primary-700 hover:bg-surface-muted dark:text-primary-300">
              <ClipboardList className="h-4 w-4" /> Xem các báo cáo <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </Card>
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
