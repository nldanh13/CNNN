import { useCallback, useEffect, useRef, useState } from 'react';
import type { CarePlan } from '../types';
import type { AccountSession } from '../auth/supabaseAuth';
import { migrateCarePlans } from '../lib/nandaCodeMigration';
import { carePlanStorageKey } from './planScope';
import { load, save } from './storage';
import {
  PENDING_DRAFT_PREFIX, PARKED_DRAFT_PREFIX, readPlanDraft, writePlanDraft,
  removePlanDraft, parkPlanDraft,
} from './pendingPlanDraft';
import { CloudWorkspaceError } from '../cloud/patientWorkspace';
import {
  MAX_PATIENTS, patientCloudEnabled, loadPatientWorkspace, savePatientWorkspace, findPreviousAccountPlans,
} from '../cloud/patientWorkspace';

type Status = 'local' | 'loading' | 'ready' | 'migration' | 'error';
export type MigrationKind = 'legacy' | 'pending' | 'parked';
export type PlanSyncState = 'idle' | 'saving' | 'saved' | 'error' | 'conflict';
export interface PlansStore {
  plans: CarePlan[];
  status: Status;
  statusError: string;
  syncMessage: string;
  syncState: PlanSyncState;
  hasParkedDraft: boolean;
  reviewParkedDraft: () => void;
  migrationKind: MigrationKind;
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
  const [syncState, setSyncState] = useState<PlanSyncState>('idle');
  const [hasParkedDraft, setHasParkedDraft] = useState(false);
  const [legacyRevision, setLegacyRevision] = useState<number | null>(null);
  const [storageError, setStorageError] = useState(false);
  const [legacyPlans, setLegacyPlans] = useState<CarePlan[]>([]);
  const [migrationKind, setMigrationKind] = useState<MigrationKind>('legacy');
  const [reloadToken, setReloadToken] = useState(0);

  const plansRef = useRef<CarePlan[]>(readPlans(planKey));
  const revisionRef = useRef(0);
  const chainRef = useRef<Promise<void>>(Promise.resolve());
  const timerRef = useRef<number | null>(null);
  const statusRef = useRef(status);
  statusRef.current = status;
  const identityRef = useRef(userId);
  const sessionRef = useRef(auth.session);
  identityRef.current = userId;
  sessionRef.current = auth.session;
  const plans = state.key === planKey ? state.plans : [];

  const cacheKey = userId ? CACHE_PREFIX + userId : null;
  const pendingKey = userId ? PENDING_PREFIX + userId : null;
  const migratedKey = userId ? MIGRATED_PREFIX + userId : null;
  const draftKey = userId ? PENDING_DRAFT_PREFIX + userId : null;
  const parkedKey = userId ? PARKED_DRAFT_PREFIX + userId : null;

  useEffect(() => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = null;
    plansRef.current = readPlans(planKey);
    revisionRef.current = 0;
    chainRef.current = Promise.resolve();
    setState({ key: planKey, plans: plansRef.current });
    statusRef.current = cloud ? 'loading' : 'local';
    setStatus(cloud ? 'loading' : 'local');
    setStatusError('');
    setSyncMessage('');
    setSyncState('idle');
    setHasParkedDraft(false);
    setStorageError(false);
  }, [planKey, cloud]);

  useEffect(() => {
    if (!auth.ready || !cloud || !userId || !auth.session || !cacheKey || !pendingKey || !migratedKey || !draftKey || !parkedKey) return;
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
      const journal = readPlanDraft(draftKey);
      const dirtyCache = Boolean(journal) || load<boolean>(pendingKey, false);
      setHasParkedDraft(Boolean(readPlanDraft(parkedKey)));
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
      const source = dirtyCache ? (journal?.plans ?? cached) : oldUnreviewed ? oldPlans : [];
      // A pending zero-plan draft is a valid deletion. Do not discard it because length === 0.
      const differs = dirtyCache || (oldUnreviewed &&
        source.some(p => !remote.some(r => r.id === p.id)));
      plansRef.current = remote;
      setState({ key: cacheKey, plans: remote });
      if (differs) {
        setLegacyPlans(source);
        setLegacyRevision(journal?.baseRevision ?? null);
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
  }, [auth.ready, cloud, userId, cacheKey, pendingKey, migratedKey, draftKey, parkedKey, reloadToken,
      // Only restart on user change, not token refresh (which could overwrite active edits).
      auth.session?.user.id]);

  const retryLoad = useCallback(() => setReloadToken(v => v + 1), []);

  // Coalesce rapid keystrokes; serialize network writes to preserve optimistic revisions.
  const queueSync = useCallback((immediate = false) => {
    if (!cloud || !userId || !pendingKey || !draftKey) return;
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    const uid = userId;
    setSyncMessage('Đang lưu vào tài khoản…');
    setSyncState('saving');
    const submit = () => {
      timerRef.current = null;
      chainRef.current = chainRef.current.catch(() => undefined).then(async () => {
        const session = sessionRef.current;
        if (identityRef.current !== uid || !session || session.user.id !== uid || statusRef.current !== 'ready') return;
        if (!readPlanDraft(draftKey) && !load<boolean>(pendingKey, false)) return;
        const snapshot = plansRef.current;
        const startingRevision = revisionRef.current;
        try {
          const nextRevision = await savePatientWorkspace(session, startingRevision, snapshot);
          if (identityRef.current !== uid) return;
          revisionRef.current = nextRevision;
          if (plansRef.current === snapshot) {
            const removed = removePlanDraft(draftKey);
            const cleared = save(pendingKey, false);
            if (!removed || !cleared) {
              setStorageError(true);
              setSyncMessage('Đã lưu trên Supabase nhưng không dọn được bản nháp trên thiết bị.');
              setSyncState('error');
              return;
            }
            setSyncMessage('Đã lưu vào tài khoản');
            setSyncState('saved');
          } else if (!writePlanDraft(draftKey, plansRef.current, nextRevision)) {
            setStorageError(true);
          }
        } catch (err) {
          if (identityRef.current !== uid) return;
          if (err instanceof CloudWorkspaceError && err.kind === 'conflict') {
            // Freeze further edits and load server revision; NEVER retry by overwriting.
            setSyncState('conflict');
            statusRef.current = 'loading';
            setStatus('loading');
            setSyncMessage('Có chỉnh sửa từ thiết bị khác. Cần đối chiếu trước khi tiếp tục.');
            const draft = readPlanDraft(draftKey);
            const unsynced = draft?.plans ?? snapshot;
            try {
              const fresh = await loadPatientWorkspace(session);
              if (identityRef.current !== uid) return;
              revisionRef.current = fresh.revision;
              plansRef.current = fresh.plans;
              setState({ key: CACHE_PREFIX + uid, plans: fresh.plans });
              setLegacyPlans(unsynced);
              setLegacyRevision(draft?.baseRevision ?? startingRevision);
              setMigrationKind('pending');
              statusRef.current = 'migration';
              setStatus('migration');
            } catch (loadError) {
              if (identityRef.current !== uid) return;
              setStatus('error');
              setStatusError(loadError instanceof Error ? loadError.message : 'Không tải được dữ liệu để đối chiếu.');
            }
          } else {
            setSyncMessage(err instanceof Error ? err.message : 'Chưa thể đồng bộ. Bản nháp vẫn nằm trên thiết bị.');
            setSyncState('error');
          }
        }
      });
    };
    if (immediate) submit();
    else timerRef.current = window.setTimeout(submit, 650);
  }, [cloud, userId, pendingKey, draftKey]);

  useEffect(() => {
    if (!cloud || !pendingKey || status !== 'ready') return;
    const retry = () => {
      if (load<boolean>(pendingKey, false)) queueSync(true);
    };
    window.addEventListener('online', retry);
    return () => window.removeEventListener('online', retry);
  }, [cloud, pendingKey, status, queueSync]);

  const changePlans = useCallback((fn: (current: CarePlan[]) => CarePlan[]) => {
    if (cloud && status !== 'ready') return;
    const next = fn(plansRef.current);
    if (next.length > MAX_PATIENTS && auth.enabled) {
      setSyncMessage('Mỗi tài khoản chỉ được tạo tối đa 3 người bệnh. Xóa một kế hoạch trước khi tạo mới.');
      return;
    }
    plansRef.current = next;
    setState({ key: planKey, plans: next });
    if (cloud && draftKey && pendingKey) {
      // The journal is the source of truth on reconnect, even for an empty array.
      const journalOk = writePlanDraft(draftKey, next, revisionRef.current);
      const flagOk = save(pendingKey, true);
      if (!journalOk || !flagOk) setStorageError(true);
    }
    if (planKey && !save(planKey, next)) setStorageError(true);
    if (cloud) queueSync();
  }, [auth.enabled, cloud, status, planKey, draftKey, pendingKey, queueSync]);

  const upsertPlan = useCallback((plan: CarePlan) => changePlans(ps =>
    ps.some(p => p.id === plan.id) ? ps.map(p => p.id === plan.id ? plan : p) : [plan, ...ps]), [changePlans]);
  const updatePlan = useCallback((id: string, fn: (p: CarePlan) => CarePlan) => changePlans(ps =>
    ps.map(p => p.id === id ? { ...fn(p), updatedAt: new Date().toISOString() } : p)), [changePlans]);
  const deletePlan = useCallback((id: string) => changePlans(ps => ps.filter(p => p.id !== id)), [changePlans]);
  const mergePlans = useCallback((incoming: CarePlan[]) => changePlans(ps =>
    mergeWithoutLoss(ps, incoming, true)), [changePlans]);

  const importOldPlans = useCallback(async () => {
    const session = sessionRef.current;
    if (!cloud || status !== 'migration' || !session || !userId ||
        !cacheKey || !pendingKey || !migratedKey || !draftKey || !parkedKey) return;
    // Pending changes are a complete replacement, not a merge; deletions must stay deletions.
    // A stale base revision cannot be auto-applied to a newer remote document.
    if (migrationKind !== 'legacy' && legacyRevision !== null &&
        legacyRevision !== revisionRef.current) {
      setStatusError('Tài khoản đã thay đổi trên thiết bị khác. Không thể tự ghi đè. Hãy giữ bản nháp riêng và đối chiếu thủ công.');
      return;
    }
    const next = migrationKind === 'legacy'
      ? mergeWithoutLoss(plansRef.current, legacyPlans, false)
      : legacyPlans;
    if (next.length > MAX_PATIENTS) {
      setStatusError('Tối đa 3 người bệnh. Kế hoạch cũ vẫn được giữ trên thiết bị; không tự xóa phần vượt giới hạn.');
      return;
    }
    setStatusError('');
    try {
      const revision = await savePatientWorkspace(session, revisionRef.current, next);
      if (identityRef.current !== userId) return;
      revisionRef.current = revision;
      plansRef.current = next;
      setState({ key: cacheKey, plans: next });
      const cached = save(cacheKey, next);
      const clean = removePlanDraft(draftKey);
      const cleared = save(pendingKey, false);
      if (migrationKind === 'legacy') save(migratedKey, true);
      if (migrationKind === 'parked') {
        if (!removePlanDraft(parkedKey)) setStorageError(true);
        setHasParkedDraft(false);
      }
      if (!cached || !clean || !cleared) setStorageError(true);
      setLegacyPlans([]);
      setLegacyRevision(null);
      setSyncMessage('Đã lưu dữ liệu vào tài khoản.');
      setSyncState('saved');
      setStatus('ready');
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : 'Không chuyển được dữ liệu cũ.');
    }
  }, [cloud, status, userId, cacheKey, pendingKey, migratedKey, draftKey, parkedKey,
      legacyPlans, legacyRevision, migrationKind]);

  const skipOldPlans = useCallback(() => {
    if (status !== 'migration' || !cacheKey || !pendingKey ||
        !migratedKey || !draftKey || !parkedKey) return;
    if (migrationKind !== 'legacy') {
      // Saving to a second, immutable local slot is mandatory before using server data.
      if (migrationKind === 'pending') {
        const parked = parkPlanDraft(draftKey, parkedKey, {
          version: 1, plans: legacyPlans, baseRevision: legacyRevision,
          savedAt: new Date().toISOString(),
        });
        if (!parked) {
          setStatusError('Đã có một bản nháp khác đang được giữ riêng hoặc bộ nhớ thiết bị đầy. Không thể bỏ qua để tránh mất dữ liệu.');
          return;
        }
      }
      setHasParkedDraft(true);
    }
    if (migrationKind === 'legacy') save(migratedKey, true);
    const cached = save(cacheKey, plansRef.current);
    const cleaned = removePlanDraft(draftKey);
    const cleared = save(pendingKey, false);
    if (!cached || !cleaned || !cleared) {
      setStorageError(true);
      setStatusError('Không thể cập nhật bản nháp trên thiết bị. Vui lòng thử lại.');
      return;
    }
    setLegacyPlans([]);
    setLegacyRevision(null);
    setStatusError('');
    setStatus('ready');
    setSyncState('saved');
    setSyncMessage('Đang dùng dữ liệu Supabase. Bản nháp chưa đồng bộ vẫn được giữ riêng trên thiết bị.');
  }, [status, cacheKey, pendingKey, migratedKey, draftKey, parkedKey, migrationKind, legacyPlans, legacyRevision]);

  const reviewParkedDraft = useCallback(() => {
    if (status !== 'ready' || !parkedKey) return;
    try {
      const parked = readPlanDraft(parkedKey);
      if (!parked) { setHasParkedDraft(false); return; }
      setLegacyPlans(parked.plans);
      setLegacyRevision(parked.baseRevision);
      setMigrationKind('parked');
      setStatusError('');
      setStatus('migration');
    } catch (err) {
      setSyncMessage(err instanceof Error ? err.message : 'Không đọc được bản nháp đã giữ.');
      setSyncState('error');
    }
  }, [status, parkedKey]);

  const retryStorage = useCallback(() => {
    if (!planKey) return;
    const ok = save(planKey, plansRef.current);
    if (cloud && draftKey && pendingKey && load<boolean>(pendingKey, false)) {
      if (!writePlanDraft(draftKey, plansRef.current, revisionRef.current)) setStorageError(true);
      else setStorageError(!ok);
      if (status === 'ready') queueSync(true);
    } else {
      setStorageError(!ok);
    }
  }, [planKey, cloud, draftKey, pendingKey, status, queueSync]);

  return {
    plans, status, statusError, syncMessage, syncState, hasParkedDraft, reviewParkedDraft,
    migrationKind, legacyCount: legacyPlans.length,
    storageError, retryStorage, retryLoad, importOldPlans, skipOldPlans,
    upsertPlan, updatePlan, deletePlan, mergePlans,
  };
}
