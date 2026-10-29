import { AppState } from 'react-native';

import { env, isSupabaseConfigured } from './env';

export type ConnectionIssue = 'offline' | 'failed';

type Listener = () => void;

let online: boolean | null = null;
const listeners = new Set<Listener>();
let monitorStop: (() => void) | null = null;

function readErrorMessage(error: unknown): string {
  if (!error) return '';
  if (typeof error === 'string') return error;
  if (error instanceof Error) return `${error.name} ${error.message}`;
  if (typeof error === 'object' && 'message' in error) {
    return String((error as { message?: unknown }).message ?? '');
  }
  return String(error);
}

/** True when a failed request looks like the phone has no usable connection. */
export function isOfflineMessage(message: string): boolean {
  const text = message.toLowerCase();
  return (
    text.includes('network request failed') ||
    text.includes('failed to fetch') ||
    text.includes('failed to send a request') ||
    text.includes('network error') ||
    text.includes('network request timed out') ||
    text.includes('internet connection') ||
    text.includes('offline') ||
    text.includes('enotfound') ||
    text.includes('econnrefused') ||
    text.includes('etimedout') ||
    text.includes('timeout') ||
    text.includes('timed out') ||
    text.includes('aborted') ||
    text.includes('the internet connection appears to be offline')
  );
}

export function requestFailureKind(error: unknown): ConnectionIssue {
  return isOfflineMessage(readErrorMessage(error)) ? 'offline' : 'failed';
}

function notify() {
  listeners.forEach((listener) => listener());
}

export function getOnlineSnapshot(): boolean | null {
  return online;
}

export function subscribeOnline(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setOnline(next: boolean | null) {
  if (online === next) return;
  online = next;
  notify();
}

/** Reach the app server. Any HTTP response means the network works. */
export async function probeOnline(timeoutMs = 4500): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${env.supabaseUrl}/auth/v1/health`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        apikey: env.supabaseAnonKey,
        Authorization: `Bearer ${env.supabaseAnonKey}`,
      },
    });
    return response.status > 0;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

export async function refreshOnline(): Promise<boolean> {
  const ok = await probeOnline();
  setOnline(ok);
  return ok;
}

/** Poll connectivity for the app-wide offline banner. Safe to call once at startup. */
export function startNetworkMonitor(): () => void {
  if (monitorStop) return monitorStop;

  const interval = setInterval(() => {
    void refreshOnline();
  }, 15000);
  const subscription = AppState.addEventListener('change', (state) => {
    if (state === 'active') void refreshOnline();
  });
  void refreshOnline();

  monitorStop = () => {
    clearInterval(interval);
    subscription.remove();
    monitorStop = null;
  };
  return monitorStop;
}
