import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';

interface SettingsContextType {
  logoUrl: string | null;
}

const SettingsContext = createContext<SettingsContextType>({ logoUrl: null });

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'appGlobal'), (snap) => {
      if (snap.exists()) {
        setLogoUrl(snap.data().logoUrl);
      }
    });

    return unsub;
  }, []);

  return (
    <SettingsContext.Provider value={{ logoUrl }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
