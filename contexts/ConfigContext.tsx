import React, { createContext, useContext, useEffect, useState } from 'react';
import { SiteConfig } from '../types';
import { mockSupabase } from '../services/mockSupabase';
import { Loader2 } from 'lucide-react';

interface ConfigContextType {
  config: SiteConfig;
  refreshConfig: () => Promise<void>;
  updateConfig: (newConfig: SiteConfig) => Promise<void>;
  isLoading: boolean;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchConfig = async () => {
    try {
      const data = await mockSupabase.getSiteConfig();
      setConfig(data);
      // Inject dynamic colors
      document.documentElement.style.setProperty('--color-primary', data.primaryColor);
      document.documentElement.style.setProperty('--color-secondary', data.secondaryColor);
    } catch (error) {
      console.error('Failed to load config', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const updateConfig = async (newConfig: SiteConfig) => {
    await mockSupabase.updateSiteConfig(newConfig);
    await fetchConfig();
  };

  if (isLoading || !config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <Loader2 className="w-10 h-10 text-green-700 animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Loading Application Configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <ConfigContext.Provider value={{ config, refreshConfig: fetchConfig, updateConfig, isLoading }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useSiteConfig = () => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useSiteConfig must be used within a ConfigProvider');
  }
  return context;
};
