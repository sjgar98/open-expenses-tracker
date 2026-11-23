import { useSyncExternalStore } from 'react';
import { useQueryClient, type Query } from '@tanstack/react-query';
import OfflineUnavailable from '../OfflineUnavailable/OfflineUnavailable';

function isBlockingOffline(query: Query) {
  return (
    query.getObserversCount() > 0 &&
    query.state.data === undefined &&
    query.state.fetchStatus === 'paused' &&
    !query.meta?.offlineLocal
  );
}

export default function OfflineGate() {
  const queryCache = useQueryClient().getQueryCache();
  const isBlocked = useSyncExternalStore(
    (onStoreChange) => queryCache.subscribe(onStoreChange),
    () => queryCache.getAll().some(isBlockingOffline)
  );
  if (!isBlocked) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 1001, background: 'var(--mantine-color-body)' }}>
      <OfflineUnavailable />
    </div>
  );
}
