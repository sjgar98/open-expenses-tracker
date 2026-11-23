import { OfflineError } from './offline.utils';
import { isServerUnreachableError } from '../services/connectivity/connectivity.service';

export function parseError(error: any): string | null {
  if (error instanceof OfflineError || isServerUnreachableError(error)) {
    return 'offline.requestBlocked';
  }
  const errorMessage = error.response?.data?.message;
  if (Array.isArray(errorMessage) && errorMessage.length > 0) {
    return errorMessage[0];
  }
  if (typeof errorMessage === 'string') {
    return errorMessage;
  }
  return null;
}
