import { useIsRestoring, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useOnline } from './use-online.hook';

const ROW_HEIGHT = 43;
const DEFAULT_PAGE_SIZE = 10;

function latestCachedPageSize(queryClient: QueryClient, queryKeyRoot: string): number | undefined {
  const [latest] = queryClient
    .getQueryCache()
    .findAll({ queryKey: [queryKeyRoot] })
    .filter((query) => query.state.data !== undefined && typeof query.queryKey[1] === 'object')
    .sort((a, b) => b.state.dataUpdatedAt - a.state.dataUpdatedAt);
  return (latest?.queryKey[1] as { pageSize?: number } | undefined)?.pageSize;
}

export function useAutoPageSize(viewportHeight: number, queryKeyRoot: string): number {
  const queryClient = useQueryClient();
  const isOnline = useOnline();
  const isRestoring = useIsRestoring();

  if (!isOnline) {
    return (!isRestoring && latestCachedPageSize(queryClient, queryKeyRoot)) || DEFAULT_PAGE_SIZE;
  }
  return viewportHeight > 0 ? Math.floor((viewportHeight - ROW_HEIGHT) / ROW_HEIGHT) : DEFAULT_PAGE_SIZE;
}
