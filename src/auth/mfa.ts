/**
 * Supabase GoTrue TOTP MFA via authenticated endpoints.
 * Optional rollout only: do not enforce MFA for all existing users.
 * Factor secrets / QR code are NEVER stored in browser storage or sent to GitHub.
 */
export interface MfaFactor {
  id: string;
  factor_type: 'totp' | 'phone' | 'webauthn';
  status: 'verified' | 'unverified';
  friendly_name?: string;
}

export interface MfaEnrolledFactor {
  id: string;
  type: 'totp';
  totp: { qr_code: string; secret: string; uri: string };
}

export function verifiedTotpFactors(user: { factors?: MfaFactor[] } | null | undefined): MfaFactor[] {
  return (user?.factors ?? []).filter(f => f.factor_type === 'totp' && f.status === 'verified');
}

/**
 * Read the JWT claim ONLY to control local UI. Backend authorization must
 * validate the JWT and enforce aal=aal2 in RLS where appropriate.
 */
export function getJwtAal(accessToken: string): 'aal1' | 'aal2' {
  try {
    const encoded = accessToken.split('.')[1];
    if (!encoded) return 'aal1';
    const b64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(b64.padEnd(Math.ceil(b64.length / 4) * 4, '='))) as { aal?: string };
    return payload.aal === 'aal2' ? 'aal2' : 'aal1';
  } catch {
    return 'aal1';
  }
}

export function requiresTotp(user: { factors?: MfaFactor[] } | null | undefined, accessToken?: string): boolean {
  return verifiedTotpFactors(user).length > 0 && getJwtAal(accessToken ?? '') !== 'aal2';
}
