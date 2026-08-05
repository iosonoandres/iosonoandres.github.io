import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { contentByLanguage, sharedContent } from '../data/siteContent';

const PreferencesContext = createContext(null);

const getStoredPreference = (key, fallback) => {
  if (typeof window === 'undefined') return fallback;
  return window.localStorage.getItem(key) || fallback;
};

export const PreferencesProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => getStoredPreference('ac-language', 'en'));
  const [theme, setTheme] = useState(() => getStoredPreference('ac-theme-v2', 'dark'));

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0d1725' : '#f4f1e8');
    window.localStorage.setItem('ac-theme-v2', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = language;
    window.localStorage.setItem('ac-language', language);
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      theme,
      content: contentByLanguage[language],
      shared: sharedContent,
      toggleLanguage: () => setLanguage((current) => (current === 'en' ? 'it' : 'en')),
      toggleTheme: () => setTheme((current) => (current === 'light' ? 'dark' : 'light')),
    }),
    [language, theme],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
};

// This module intentionally co-locates the provider and its consumer hook.
// eslint-disable-next-line react-refresh/only-export-components
export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) throw new Error('usePreferences must be used inside PreferencesProvider');
  return context;
};
