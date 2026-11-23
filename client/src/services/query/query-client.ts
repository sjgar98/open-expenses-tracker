import { onlineManager, QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { del, get, set } from 'idb-keyval';
import { connectOnlineManager } from '../connectivity/connectivity.service';

export const QUERY_CACHE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const QUERY_CACHE_KEY = 'oet_query_cache';

onlineManager.setEventListener(connectOnlineManager);

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: QUERY_CACHE_MAX_AGE,
      retryDelay: (failureCount) => (onlineManager.isOnline() ? Math.min(1000 * 2 ** failureCount, 30000) : 0),
    },
  },
});

export const queryPersister = createAsyncStoragePersister({
  key: QUERY_CACHE_KEY,
  storage: { getItem: get, setItem: set, removeItem: del },
});

export function deletePersistedCache(): Promise<void> {
  return del(QUERY_CACHE_KEY);
}

export async function clearQueryCache(): Promise<void> {
  queryClient.clear();
  await deletePersistedCache();
}
