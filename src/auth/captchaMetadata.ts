/**
 * GoTrue CAPTCHA wire format shared by sign-in, sign-up and password recovery.
 * See Supabase auth-js: gotrue_meta_security.captcha_token.
 */
export function captchaMetadata(token?: string): { gotrue_meta_security?: { captcha_token: string } } {
  return token ? { gotrue_meta_security: { captcha_token: token } } : {};
}
