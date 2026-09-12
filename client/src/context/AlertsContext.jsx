import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const AlertsContext = createContext({ key: 0, refresh: () => {} });

// Lets pages (e.g. after claiming a deal) ask the navbar bell to refetch its alerts.
export function AlertsProvider({ children }) {
  const [key, setKey] = useState(0);
  const refresh = useCallback(() => setKey((k) => k + 1), []);
  const value = useMemo(() => ({ key, refresh }), [key, refresh]);
  return <AlertsContext.Provider value={value}>{children}</AlertsContext.Provider>;
}

export function useAlertsRefresh() {
  return useContext(AlertsContext);
}
