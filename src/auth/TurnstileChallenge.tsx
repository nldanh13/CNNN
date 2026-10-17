import { useEffect, useRef, useState } from 'react';

interface TurnstileApi {
  render: (container: HTMLElement, options: {
    sitekey: string;
    theme: 'auto';
    callback: (token: string) => void;
    'expired-callback': () => void;
    'error-callback': () => void;
  }) => string;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window { turnstile?: TurnstileApi }
}

export const turnstileSiteKey = (import.meta.env.VITE_TURNSTILE_SITE_KEY ?? '').trim();

// The external script is public; only the Cloudflare Turnstile SECRET goes
// in Supabase Dashboard (never in source, GitHub Actions, or VITE_).
let scriptLoader: Promise<void> | null = null;
function loadTurnstile(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (!scriptLoader) {
    scriptLoader = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.onload = () => window.turnstile ? resolve() : reject(new Error('Không tải được xác minh bảo mật.'));
      script.onerror = () => reject(new Error('Không tải được xác minh bảo mật. Vui lòng kiểm tra mạng.'));
      document.head.appendChild(script);
    }).catch(error => {
      scriptLoader = null; // Permit user to retry by re-opening the form.
      throw error;
    });
  }
  return scriptLoader;
}

interface Props {
  onToken: (token: string | null) => void;
}

/** Unmount/remount on each new authentication attempt so tokens cannot be reused. */
export function TurnstileChallenge({ onToken }: Props) {
  const element = useRef<HTMLDivElement>(null);
  const tokenHandler = useRef(onToken);
  const [error, setError] = useState('');
  tokenHandler.current = onToken;

  useEffect(() => {
    if (!turnstileSiteKey) return;
    let active = true;
    let widgetId: string | null = null;
    tokenHandler.current(null);
    void loadTurnstile().then(() => {
      if (!active || !element.current || !window.turnstile) return;
      widgetId = window.turnstile.render(element.current, {
        sitekey: turnstileSiteKey,
        theme: 'auto',
        callback: token => { if (active) tokenHandler.current(token); },
        'expired-callback': () => { if (active) tokenHandler.current(null); },
        'error-callback': () => { if (active) { tokenHandler.current(null); setError('Xác minh hết hạn hoặc thất bại. Hãy tải lại trang.'); } },
      });
    }).catch(e => { if (active) setError(e instanceof Error ? e.message : 'Lỗi xác minh bảo mật.'); });
    return () => {
      active = false;
      if (widgetId !== null) window.turnstile?.remove(widgetId);
    };
  }, []);

  if (!turnstileSiteKey) return null;
  return <div className="space-y-1.5">
    <div ref={element} aria-label="Xác minh chống bot" />
    {error && <p role="alert" className="text-xs text-danger-600">{error}</p>}
  </div>;
}
