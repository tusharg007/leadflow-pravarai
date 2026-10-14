import { useSyncExternalStore } from 'react';
import { statusSchema } from '../api/schemas';

function subscribe(callback: () => void) {
  window.addEventListener('popstate', callback);
  window.addEventListener('leadflow-url', callback);
  return () => {
    window.removeEventListener('popstate', callback);
    window.removeEventListener('leadflow-url', callback);
  };
}
const getSnapshot = () => window.location.search;
const getServerSnapshot = () => '';
export function useLeadUrlState() {
  const search = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const params = new URLSearchParams(search);
  const status = statusSchema.safeParse(params.get('status'));
  function setParam(key: 'status' | 'q' | 'lead', value: string | undefined) {
    const url = new URL(window.location.href);
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
    window.history[key === 'q' ? 'replaceState' : 'pushState'](null, '', url);
    window.dispatchEvent(new Event('leadflow-url'));
  }
  return {
    status: status.success ? status.data : undefined,
    q: (params.get('q') ?? '').slice(0, 100),
    leadId: params.get('lead'),
    setParam,
  };
}
