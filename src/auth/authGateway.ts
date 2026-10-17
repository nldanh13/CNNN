/**
 * Auth seam for a future migration away from Supabase.
 * UI contexts import this provider-neutral facade; keep session and user IDs
 * stable or provide an explicit identity mapping when replacing the provider.
 */
export {
  authConfigured, bootstrapSession, refreshSession, signIn, signUp,
  requestPasswordReset, changePassword, changeFullName, revokeSession, storeSession,
} from './supabaseAuth';
export type { AccountSession, AccountUser } from './supabaseAuth';
