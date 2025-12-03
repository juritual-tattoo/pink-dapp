import { useState, useEffect } from 'react';
import { useTranslation as useI18n, getLocale, setLocale, Locale } from '../utils/i18n';

/**
 * Hook React para internacionalização
 * Fornece traduções reativas que atualizam quando o locale muda
 */
export function useTranslation() {
  const [locale, setLocaleState] = useState<Locale>(getLocale());
  const { t } = useI18n();

  const changeLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    setLocaleState(newLocale);
    // Forçar re-render
    window.dispatchEvent(new Event('localechange'));
  };

  useEffect(() => {
    const handleLocaleChange = () => {
      setLocaleState(getLocale());
    };

    window.addEventListener('localechange', handleLocaleChange);
    return () => {
      window.removeEventListener('localechange', handleLocaleChange);
    };
  }, []);

  return {
    t,
    locale,
    setLocale: changeLocale,
  };
}
