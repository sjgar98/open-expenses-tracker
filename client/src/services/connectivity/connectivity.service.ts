import axios from 'axios';

export type Connectivity = 'online' | 'offline' | 'server-unreachable';

const HEALTH_URL = (import.meta.env.VITE_API_BASE_URL || '') + '/api/health';
const PROBE_TIMEOUT_MS = 5000;
const MIN_PROBE_DELAY_MS = 2000;
const MAX_PROBE_DELAY_MS = 30000;
const GATEWAY_ERROR_STATUSES = [502, 503, 504];

let navigatorOnline = navigator.onLine;
let serverReachable = true;
let probeDelayMs = MIN_PROBE_DELAY_MS;
let probeTimer: ReturnType<typeof setTimeout> | undefined;
let isProbing = false;
const listeners = new Set<() => void>();

export function getConnectivity(): Connectivity {
  if (!navigatorOnline) return 'offline';
  return serverReachable ? 'online' : 'server-unreachable';
}

export function subscribeConnectivity(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function connectOnlineManager(setOnline: (online: boolean) => void): () => void {
  const update = () => setOnline(getConnectivity() === 'online');
  update();
  return subscribeConnectivity(update);
}

export function isServerUnreachableError(error: unknown): boolean {
  if (!axios.isAxiosError(error) || axios.isCancel(error)) return false;
  return !error.response || GATEWAY_ERROR_STATUSES.includes(error.response.status);
}

export function markServerReachable() {
  clearTimeout(probeTimer);
  probeTimer = undefined;
  probeDelayMs = MIN_PROBE_DELAY_MS;
  if (serverReachable) return;
  serverReachable = true;
  notify();
}

export function markServerUnreachable() {
  if (!serverReachable) return;
  serverReachable = false;
  notify();
  scheduleProbe();
}

function notify() {
  listeners.forEach((listener) => listener());
}

function scheduleProbe() {
  clearTimeout(probeTimer);
  probeTimer = setTimeout(probeServer, probeDelayMs);
  probeDelayMs = Math.min(probeDelayMs * 2, MAX_PROBE_DELAY_MS);
}

function probeNow() {
  if (serverReachable || isProbing) return;
  clearTimeout(probeTimer);
  probeServer();
}

async function probeServer() {
  if (serverReachable || isProbing || !navigatorOnline) return;
  isProbing = true;
  try {
    const response = await fetch(HEALTH_URL, { cache: 'no-store', signal: AbortSignal.timeout(PROBE_TIMEOUT_MS) });
    const body = response.ok ? await response.json() : null;
    if (body?.status === 'ok') {
      markServerReachable();
    } else {
      scheduleProbe();
    }
  } catch {
    scheduleProbe();
  } finally {
    isProbing = false;
  }
}

window.addEventListener('online', () => {
  navigatorOnline = true;
  notify();
  probeNow();
});
window.addEventListener('offline', () => {
  navigatorOnline = false;
  notify();
});
window.addEventListener('focus', probeNow);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') probeNow();
});
