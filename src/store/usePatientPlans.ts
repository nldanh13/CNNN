import { useCallback, useEffect, useRef, useState } from 'react';
import type { CarePlan } from '../types';
import type { AccountSession } from '../auth/supabaseAuth';
import { migrateCarePlans } from '../lib/nandaCodeMigration';
import { carePlanStorageKey } from './planScope';
import { load, save } from './storage';
import {
  MAX_PATIENTS, patientCloudEnabled, loadPatientWorkspace, savePatientWorkspace, findPreviousAccountPlans,
} from '../cloud/patientWorkspace';

type Status = 'local' | 'loading' | 'ready' | 'migration' | 'error';
type MigrationKind = 'legacy' | 'pending';
export interface PlansStore {
  plans: CarePlan[];
  status: Status;
  statusError: string;
  syncMessage: string;
  legacyCount: number;
  storageError: boolean;
  retryStorage: () => void;
  retryLoad: () => void;
  importOldPlans: () => Promise<void>;
  skipOldPlans: () => void;
  upsertPlan: (p: CarePlan) => void;
  updatePlan: (id: string, fn: (p: CarePlan) => CarePlan) => void;
  deletePlan: (id: string) => void;
  mergePlans: (incoming: CarePlan[]) => void;
}

const CACHE_PREFIX = 'clinicalnnn.cloud.plans.user.';
const PENDING_PREFIX = 'clinicalnnn.cloud.pending.user.';
const MIGRATED_PREFIX = 'clinicalnnn.cloud.legacy-reviewed.user.';

const withoutSample = (plans: CarePlan[]) =>
  plans.filter(p => !(p.id === 'plan-sample-1' && p.patient?.mrn === 'BN-240176'));
const readPlans = (key: string | null) =>
  key ? migrateCarePlans(withoutSample(load<CarePlan[] | null>(key, null) ?? [])) : [];

function mergeWithoutLoss(remote: CarePlan[], incoming: CarePlan[], preferIncoming: boolean): CarePlan[] {
  const result = new Map(remote.map(p => [p.id, p]));
  for (const p of incoming) if (preferIncoming || !result.has(p.id)) result.set(p.id, p);
  return [...result.values()];
}

/**
 * Auto-persist changes by authenticated user to ONE Supabase workspace with CAS revision.
 * Legacy local plans remain untouched until explicit one-time migration.
 * A separate account-scoped local cache keeps interrupted edits available.
 */
export function usePatientPlans(auth: {
  ready: boolean;
  enabled: boolean;
  user: { id: string } | null;
  session: AccountSession | null;
}): PlansStore {
  const userId = auth.user?.id ?? null;
  const cloud = auth.enabled && patientCloudEnabled && Boolean(userId);
  const originalKey = carePlanStorageKey(auth.enabled, userId);
  const planKey = cloud && userId ? CACHE_PREFIX + userId : originalKey;
  const [state, setState] = useState<{ key: string | null; plans: CarePlan[] }>(
    () => ({ key: planKey, plans: readPlans(planKey) }),
  );
  const [status, setStatus] = useState<Status>(cloud ? 'loading' : 'local');
  const [statusError, setStatusError] = useState('');
  const [syncMessage, setSyncMessage] = useState('');
  const [storageError, setStorageError] = useState(false);
  const [legacyPlans, setLegacyPlans] = useState<CarePlan[]>([]);
  const [migrationKind, setMigrationKind] = useState<MigrationKind>('legacy');
  const [reloadToken, setReloadToken] = useState(0);

  const plansRef = useRef<CarePlan[]>(readPlans(planKey));
  const revisionRef = useRef(0);
  const chainRef = useRef<Promise<void>>(Promise.resolve());
  const identityRef = useRef(userId);
  const sessionRef = useRef(auth.session);
  identityRef.current = userId;
  sessionRef.current = auth.session;
  const plans = state.key === planKey ? state.plans : [];

  const cacheKey = userId ? CACHE_PREFIX + userId : null;
  const pendingKey = userId ? PENDING_PREFIX + userId : null;
  const migratedKey = userId ? MIGRATED_PREFIX + userId : null;

  useEffect(() => {
    plansRef.current = readPlans(planKey);
    revisionRef.current = 0;
    chainRef.current = Promise.resolve();
    setState({ key: planKey, plans: plansRef.current });
    setStatus(cloud ? 'loading' : 'local');
    setStatusError('');
    setSyncMessage('');
    setStorageError(false);
  }, [planKey, cloud]);

  useEffect(() => {
    if (!auth.ready || !cloud || !userId || !auth.session || !cacheKey || !pendingKey || !migratedKey) return;
    let active = true;
    const session = auth.session;
    const uid = userId;
    setStatus('loading');
    setStatusError('');
    void loadPatientWorkspace(session).then(async workspace => {
      if (!active || identityRef.current !== uid) return;
      revisionRef.current = workspace.revision;
      const remote = workspace.plans;
      const cached = readPlans(cacheKey);
      const dirtyCache = load<boolean>(pendingKey, false);
      const oldPlans = readPlans(carePlanStorageKey(true, uid));
      // Account A may have saved a manual snapshot from another device.
      // Discover it once, but NEVER import/upload until the owner confirms.
      if (!oldPlans.length && !dirtyCache && remote.length === 0 &&
          !load<boolean>(migratedKey, false)) {
        try { oldPlans.push(...await findPreviousAccountPlans(session)); }
        catch { /* Old snapshots may not exist; this must not block normal sign-in. */ }
      }
      if (!active || identityRef.current !== uid) return;
      const oldUnreviewed = !load<boolean>(migratedKey, false) &&
        oldPlans.some(p => !remote.some(r => r.id === p.id));
      // Never overwrite unsynchronized edits or pre-cloud plans silently.
      const source = dirtyCache ? cached : oldUnreviewed ? oldPlans : [];
      const differs = source.length > 0 &&
        (dirtyCache || source.some(p => !remote.some(r => r.id === p.id)));
      plansRef.current = remote;
      setState({ key: cacheKey, plans: remote });
      if (differs) {
        setLegacyPlans(source);
        setMigrationKind(dirtyCache ? 'pending' : 'legacy');
        setStatus('migration');
      } else {
        save(cacheKey, remote);
        save(pendingKey, false);
        setLegacyPlans([]);
        setStatus('ready');
      }
    }).catch(err => {
      if (!active || identityRef.current !== uid) return;
      setStatus('error');
      setStatusError(err instanceof Error ? err.message : 'Không tải được kế hoạch từ Supabase.');
    });
    return () => { active = false; };
  }, [auth.ready, cloud, userId, cacheKey, pendingKey, migratedKey, reloadToken,
      // Only restart on user change, not token refresh (which could overwrite active edits).
      auth.session?.user.id]);

  const retryLoad = useCallback(() => setReloadToken(v => v + 1), []);

  const queueSync = useCallback(() => {
    if (!cloud || !userId || !pendingKey) return;
    const uid = userId;
    setSyncMessage('Đang lưu vào tài khoản…');
    save(pendingKey, true);
    chainRef.current = chainRef.current.catch(() => undefined).then(async () => {
      const session = sessionRef.current;
      if (identityRef.current !== uid || !session || session.user.id !== uid) return;
      const snapshot = plansRef.current;
      try {
        const nextRevision = await savePatientWorkspace(session, revisionRef.current, snapshot);
        if (identityRef.current !== uid) return;
        revisionRef.current = nextRevision;
        if (plansRef.current === snapshot) {
          save(pendingKey, false);
          setSyncMessage('Đã lưu vào tài khoản');
        }
      } catch (err) {
        if (identityRef.current !== uid) return;
        setSyncMessage(err instanceof Error ? err.message : 'Chưa thể đồng bộ, dữ liệu vẫn ở thiết bị.');
      }
    });
  }, [cloud, userId, pendingKey]);

  const changePlans = useCallback((fn: (current: CarePlan[]) => CarePlan[]) => {
    if (cloud && status !== 'ready') return;
    const next = fn(plansRef.current);
    if (next.length > MAX_PATIENTS && auth.enabled) {
      setSyncMessage('Mỗi tài khoản chỉ được tạo tối đa 3 người bệnh. Xóa một kế hoạch trước khi tạo mới.');
      return;
    }
    plansRef.current = next;
    setState({ key: planKey, plans: next });
    if (planKey && !save(planKey, next)) setStorageError(true);
    if (cloud) queueSync();
  }, [auth.enabled, cloud, status, planKey, queueSync]);

  const upsertPlan = useCallback((plan: CarePlan) => changePlans(ps =>
    ps.some(p => p.id === plan.id) ? ps.map(p => p.id === plan.id ? plan : p) : [plan, ...ps]), [changePlans]);
  const updatePlan = useCallback((id: string, fn: (p: CarePlan) => CarePlan) => changePlans(ps =>
    ps.map(p => p.id === id ? { ...fn(p), updatedAt: new Date().toISOString() } : p)), [changePlans]);
  const deletePlan = useCallback((id: string) => changePlans(ps => ps.filter(p => p.id !== id)), [changePlans]);
  const mergePlans = useCallback((incoming: CarePlan[]) => changePlans(ps =>
    mergeWithoutLoss(ps, incoming, true)), [changePlans]);

  const importOldPlans = useCallback(async () => {
    const session = sessionRef.current;
    if (!cloud || status !== 'migration' || !session || !userId || !cacheKey || !pendingKey || !migratedKey) return;
    const next = mergeWithoutLoss(plansRef.current, legacyPlans, migrationKind === 'pending');
    if (next.length > MAX_PATIENTS) {
      setStatusError('Dữ liệu cũ có hơn 3 người bệnh. Dữ liệu cũ vẫn được giữ trên thiết bị; cần chọn tối đa 3 trước khi chuyển.');
      return;
    }
    setStatusError('');
    try {
      const revision = await savePatientWorkspace(session, revisionRef.current, next);
      if (identityRef.current !== userId) return;
      revisionRef.current = revision;
      plansRef.current = next;
      setState({ key: cacheKey, plans: next });
      save(cacheKey, next);
      save(pendingKey, false);
      if (migrationKind === 'legacy') save(migratedKey, true);
      setLegacyPlans([]);
      setSyncMessage('Đã lưu dữ liệu cũ vào tài khoản.');
      setStatus('ready');
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : 'Không chuyển được dữ liệu cũ.');
    }
  }, [cloud, status, userId, cacheKey, pendingKey, migratedKey, legacyPlans, migrationKind]);

  const skipOldPlans = useCallback(() => {
    if (status !== 'migration' || !cacheKey || !pendingKey || !migratedKey) return;
    if (migrationKind === 'pending' && !window.confirm(
      'Bản chưa đồng bộ trên thiết bị sẽ được giữ trong bộ nhớ cũ nhưng không hiển thị. Tiếp tục sử dụng dữ liệu từ Supabase?')) return;
    if (migrationKind === 'legacy') save(migratedKey, true);
    save(cacheKey, plansRef.current);
    save(pendingKey, false);
    setLegacyPlans([]);
    setStatusError('');
    setStatus('ready');
  }, [status, cacheKey, pendingKey, migratedKey, migrationKind]);

  const retryStorage = useCallback(() => {
    if (!planKey) return;
    setStorageError(!save(planKey, plansRef.current));
    if (cloud && status === 'ready') queueSync();
  }, [planKey, cloud, status, queueSync]);

  return {
    plans, status, statusError, syncMessage, legacyCount: legacyPlans.length,
    storageError, retryStorage, retryLoad, importOldPlans, skipOldPlans,
    upsertPlan, updatePlan, deletePlan, mergePlans,
  };
}
