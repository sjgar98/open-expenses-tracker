import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { del, get, set } from 'idb-keyval';

export const QUERY_CACHE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const QUERY_CACHE_KEY = 'oet_query_cache';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: QUERY_CACHE_MAX_AGE,
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
