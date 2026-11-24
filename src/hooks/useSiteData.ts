import { useCallback, useEffect, useState } from 'react';
import { fetchSite } from '../lib/api';
import type { SiteData } from '../lib/types';

interface State {
  data: SiteData | null;
  error: string | null;
  loading: boolean;
}

export function useSiteData() {
  const [state, setState] = useState<State>({ data: null, error: null, loading: true });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    fetchSite(controller.signal)
      .then((data) => {
        if (!data?.config?.name) throw new Error('The app details are incomplete.');
        setState({ data, error: null, loading: false });
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        console.error('Fetch error:', err);
        setState({
          data: null,
          loading: false,
          error: err instanceof Error ? err.message : 'Something went wrong.',
        });
      });

    return () => controller.abort();
  }, [attempt]);

  const retry = useCallback(() => {
    setState({ data: null, error: null, loading: true });
    setAttempt((n) => n + 1);
  }, []);
  return { ...state, retry };
}
