import { useCallback, useState } from 'react';

import { runPullToRefresh } from '../lib/appRefresh';

/**
 * Standard swipe-down refresh for main tabs.
 * Reloads cloud progress and applies any pending EAS Update.
 */
export function usePullToRefresh() {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      await runPullToRefresh();
    } finally {
      setRefreshing(false);
    }
  }, [refreshing]);

  return { refreshing, onRefresh };
}
