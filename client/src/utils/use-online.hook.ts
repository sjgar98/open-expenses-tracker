import { onlineManager } from '@tanstack/react-query';
import { useSyncExternalStore } from 'react';
import { getConnectivity, subscribeConnectivity, type Connectivity, } from '../services/connectivity/connectivity.service';

export function useOnline(): boolean {
  return useSyncExternalStore(
    (onStoreChange) => onlineManager.subscribe(onStoreChange),
    () => onlineManager.isOnline()
  );
}

export function useConnectivity(): Connectivity {
  return useSyncExternalStore(subscribeConnectivity, getConnectivity);
}
