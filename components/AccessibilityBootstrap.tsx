'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type DaltonicContextValue = {
  isDaltonic: boolean;
  setIsDaltonic: (value: boolean) => void;
};

const DaltonicContext = createContext<DaltonicContextValue | undefined>(undefined);

export function AccessibilityBootstrap({ children }: { children: React.ReactNode }) {
  const [isDaltonic, setIsDaltonic] = useState(false);

  useEffect(() => {
    const applyDaltonicMode = () => {
      const saved = window.localStorage.getItem('fiape-daltonic');
      const enabled = saved === 'true';
      setIsDaltonic(enabled);
      document.documentElement.setAttribute('data-daltonic', enabled ? 'true' : 'false');
    };

    applyDaltonicMode();
    window.addEventListener('storage', applyDaltonicMode);

    return () => {
      window.removeEventListener('storage', applyDaltonicMode);
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-daltonic', isDaltonic ? 'true' : 'false');
    window.localStorage.setItem('fiape-daltonic', String(isDaltonic));
    window.dispatchEvent(new Event('storage'));
  }, [isDaltonic]);

  const value = useMemo(() => ({ isDaltonic, setIsDaltonic }), [isDaltonic]);

  return <DaltonicContext.Provider value={value}>{children}</DaltonicContext.Provider>;
}

export function useDaltonicMode() {
  const context = useContext(DaltonicContext);

  if (!context) {
    throw new Error('useDaltonicMode must be used within AccessibilityBootstrap');
  }

  return context;
}
