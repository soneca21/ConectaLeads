import React from 'react';
import { Globe, DollarSign } from 'lucide-react';
import { useLocalization } from '@/contexts/LocalizationContext';

const LanguageCurrencySwitcher = () => {
  const { language, currency, setLanguage, setCurrency, availableLanguages, availableCurrencies, t } = useLocalization();

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 border border-white/10">
        <Globe size={14} className="text-accent-orange" />
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-transparent text-white text-xs outline-none"
        >
          {availableLanguages.map((lang) => (
            <option key={lang} value={lang} className="bg-[#0a0a0a] text-white">
              {lang.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 border border-white/10">
        <DollarSign size={14} className="text-accent-orange" />
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="bg-transparent text-white text-xs outline-none"
        >
          {availableCurrencies.map((curr) => (
            <option key={curr} value={curr} className="bg-[#0a0a0a] text-white">
              {curr}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default LanguageCurrencySwitcher;

