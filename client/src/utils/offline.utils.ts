import type { QueryObserverResult } from '@tanstack/react-query';

export const OFFLINE_LOCAL_META = { offlineLocal: true };

export class OfflineError extends Error {
  constructor() {
    super('Request blocked while offline');
    this.name = 'OfflineError';
  }
}

export function isUnavailableOffline(result: Pick<QueryObserverResult, 'fetchStatus' | 'data' | 'isPlaceholderData'>) {
  return result.fetchStatus === 'paused' && (result.data === undefined || result.isPlaceholderData);
}
