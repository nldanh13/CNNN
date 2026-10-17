import { ArrowRight, Monitor, Moon, Sun } from 'lucide-react';
import { useApp } from '../store/AppContext';
import type { Theme } from '../store/AppContext';
import { dataHub } from '../data/dataHub';
import type { TaxonomySystem } from '../types';
import { Badge, PageHeader, Segmented, SettingRow, SettingsSection } from '../ui';
import { AccountSettings } from './AccountPage';

const SYSTEMS: { system: TaxonomySystem; label: string }[] = [
  { system: 'nanda', label: 'NANDA-I' },
  { system: 'noc', label: 'NOC' },
  { system: 'nic', label: 'NIC' },
];

export function SettingsPage() {
  const { t, theme, setTheme } = useApp();

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title={t.settings.title} subtitle="Quản lý hồ sơ, bảo mật và cách ứng dụng hiển thị." />

      <div className="space-y-8">
        <AccountSettings />

        <SettingsSection id="hien-thi" title={t.settings.display} description="Chế độ màu và ngôn ngữ của giao diện.">
          <div className="divide-y divide-line-soft">
            <SettingRow label={t.settings.theme} hint="Theo hệ thống sẽ tự đổi sáng/tối theo máy của bạn.">
              <Segmented<Theme>
                value={theme}
                onChange={setTheme}
                options={[
                  { value: 'light', label: t.app.light, icon: <Sun className="h-4 w-4" /> },
                  { value: 'dark', label: t.app.dark, icon: <Moon className="h-4 w-4" /> },
                  { value: 'system', label: 'Hệ thống', icon: <Monitor className="h-4 w-4" /> },
                ]}
              />
            </SettingRow>
            <SettingRow label={t.settings.language} hint="Mã NANDA-I, NOC và NIC giữ nguyên để đối chiếu theo ấn bản.">
              <Badge className="px-3 py-1 text-xs">Tiếng Việt</Badge>
            </SettingRow>
          </div>
        </SettingsSection>

        <SettingsSection id="gioi-thieu" title="Giới thiệu" description="Ấn bản dữ liệu đang dùng và nguồn tham khảo.">
          <ul className="divide-y divide-line-soft">
            {SYSTEMS.map(({ system, label }) => (
              <li key={system} className="flex items-center justify-between gap-3 px-5 py-3.5 text-sm">
                <span className="font-medium text-fg">{label}</span>
                <span className="text-right text-fg-muted">{dataHub.editionFor(system)} · {dataHub.listLibrary(system).length} mã</span>
              </li>
            ))}
            <li>
              <a href="#/references" className="flex items-center justify-between gap-3 px-5 py-3.5 text-sm font-medium text-primary-700 transition hover:bg-surface-muted dark:text-primary-300">
                Nguồn tham khảo và chất lượng dữ liệu <ArrowRight className="h-4 w-4" />
              </a>
            </li>
          </ul>
          <p className="border-t border-line-soft bg-surface-muted/60 px-5 py-3.5 text-xs leading-relaxed text-fg-muted">
            Công cụ hỗ trợ học tập và tham khảo. Không thay thế đánh giá lâm sàng, y lệnh hay quy trình của cơ sở y tế.
          </p>
        </SettingsSection>
      </div>
    </div>
  );
}
