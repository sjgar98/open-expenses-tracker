import { DateTime } from 'luxon';

export function getLocaleDateTime(isoString: string | null): string {
  if (!isoString) return '';
  const DATETIME = DateTime.fromISO(isoString);
  return `${DATETIME.toLocaleString()} ${DATETIME.toFormat('hh:mm')} UTC${DATETIME.toFormat('Z')}`;
}

