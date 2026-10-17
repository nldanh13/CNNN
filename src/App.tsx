import { lazy, Suspense } from 'react';
import { Layout } from './components/Layout';
import { useRoute } from './store/router';
import { HomePage } from './pages/HomePage';
import { SettingsPage } from './pages/SettingsPage';
import { PlansPage } from './pages/PlansPage';
import { PlanEditorPage } from './pages/PlanEditorPage';
import { LibraryPage } from './pages/LibraryPage';
import { StandardsPage } from './pages/StandardsPage';
import { QualityPage } from './pages/QualityPage';
import { ReferencesPage } from './pages/ReferencesPage';
import { AssistantPage } from './pages/AssistantPage';
import { UiKitPage } from './pages/UiKitPage';
import { useAuth } from './auth/AuthContext';
import { AccountGate, RecoveryGate } from './pages/AccountPage';
import { PageSkeleton } from './ui';
import { useApp } from './store/AppContext';
import { PatientCloudGate } from './components/PatientCloudGate';

const NicReaderPage = lazy(() => import('./pages/NicReaderPage').then(m => ({ default: m.NicReaderPage })));

export function App() {
  const { path, query } = useRoute();
  const auth = useAuth();
  const { planStatus } = useApp();
  // Production must never silently switch into guest mode when Auth configuration is absent.
  if (import.meta.env.PROD && !auth.enabled) return <div role="alert" className="mx-auto mt-20 max-w-lg rounded-xl border border-danger-500/40 bg-canvas p-6 text-center text-fg">CNNN đang tạm bảo trì đăng nhập. Vui lòng quay lại sau.</div>;
  if (!auth.ready) return <div role="status" className="flex min-h-screen items-center justify-center bg-ink-950 text-white">Đang kiểm tra phiên tài khoản…</div>;
  if (auth.enabled && !auth.user) return <AccountGate />;
  if (auth.enabled && auth.session?.recovery) return <RecoveryGate />;
  const [section = 'home', id] = path;

  let page;
  switch (section) {
    case 'plans':
      page = id ? <PlanEditorPage key={id} id={id} query={query} /> : <PlansPage />;
      break;
    case 'dashboard':
    case 'home':
      page = <HomePage />;
      break;
    case 'assistant':
      page = <AssistantPage />;
      break;
    case 'library':
      page = <LibraryPage query={query} />;
      break;
    case 'nic-reader':
      page = <Suspense fallback={<PageSkeleton label="Đang tải nội dung NIC 8…" />}><NicReaderPage query={query}/></Suspense>;
      break;
    case 'standards':
      page = <StandardsPage />;
      break;
    case 'references':
      page = <ReferencesPage />;
      break;
    case 'settings':
      page = <SettingsPage />;
      break;
    case 'ui':
      page = <UiKitPage />;
      break;
    case 'quality':
      page = <QualityPage />;
      break;
    default:
      page = <HomePage />;
  }

  // Never allow creating/editing plans before Supabase has loaded the account workspace.
  if ((section === 'plans' || section === 'assistant') &&
      planStatus !== 'ready' && planStatus !== 'local') {
    page = <PatientCloudGate />;
  }
  return <Layout section={section}>{page}</Layout>;
}
