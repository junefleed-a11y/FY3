import React from 'react';
import { Language, ThemeMode, translations } from '../utils/i18n';
import { Settings, Sun, Moon, Globe, X, Check, Monitor } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  language,
  onLanguageChange,
  theme,
  onThemeChange
}) => {
  if (!isOpen) return null;
  const t = translations[language];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`w-full max-w-md border p-6 flex flex-col ${
        theme === 'dark' 
          ? 'bg-black text-white border-white' 
          : 'bg-white text-black border-black shadow-2xl'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5" />
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                <span>{t.settings}</span>
                <span className="text-[11px] font-mono border border-current px-1.5 py-0.2">
                  {t.engineName} v{t.version}
                </span>
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:opacity-70 transition-opacity cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="py-5 space-y-6">
          {/* Theme Mode Selector (وضع نهار و وضع ليل) */}
          <div>
            <label className="block text-xs font-mono font-bold mb-2 flex items-center gap-2">
              <Sun className="w-3.5 h-3.5" />
              <span>{t.theme}</span>
            </label>

            <div className="grid grid-cols-2 gap-3">
              {/* Dark / Night Mode */}
              <button
                type="button"
                onClick={() => onThemeChange('dark')}
                className={`p-3 border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'border-white bg-neutral-900 text-white font-bold ring-2 ring-white/30'
                    : 'border-neutral-700 bg-neutral-950 text-neutral-400 hover:text-white hover:border-neutral-400'
                }`}
              >
                <Moon className="w-5 h-5" />
                <span className="text-xs">{t.darkMode}</span>
                {theme === 'dark' && <Check className="w-3.5 h-3.5 text-white" />}
              </button>

              {/* Light / Day Mode */}
              <button
                type="button"
                onClick={() => onThemeChange('light')}
                className={`p-3 border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'border-black bg-neutral-100 text-black font-bold ring-2 ring-black/30'
                    : 'border-neutral-300 bg-white text-neutral-600 hover:text-black hover:border-neutral-600'
                }`}
              >
                <Sun className="w-5 h-5" />
                <span className="text-xs">{t.lightMode}</span>
                {theme === 'light' && <Check className="w-3.5 h-3.5 text-black" />}
              </button>
            </div>
          </div>

          {/* Language Selector (لغة عربية وإنكليزية) */}
          <div>
            <label className="block text-xs font-mono font-bold mb-2 flex items-center gap-2">
              <Globe className="w-3.5 h-3.5" />
              <span>{t.language}</span>
            </label>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <button
                type="button"
                onClick={() => onLanguageChange('ar')}
                className={`p-3 border flex items-center justify-between transition-all cursor-pointer ${
                  language === 'ar'
                    ? theme === 'dark' ? 'border-white bg-neutral-900 text-white font-bold' : 'border-black bg-neutral-100 text-black font-bold'
                    : 'border-neutral-700 opacity-60 hover:opacity-100'
                }`}
              >
                <span>العربية (RTL)</span>
                {language === 'ar' && <Check className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => onLanguageChange('en')}
                className={`p-3 border flex items-center justify-between transition-all cursor-pointer ${
                  language === 'en'
                    ? theme === 'dark' ? 'border-white bg-neutral-900 text-white font-bold' : 'border-black bg-neutral-100 text-black font-bold'
                    : 'border-neutral-700 opacity-60 hover:opacity-100'
                }`}
              >
                <span>English (LTR)</span>
                {language === 'en' && <Check className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Engine Info */}
          <div className="pt-3 border-t border-neutral-800 text-center font-mono text-[11px] opacity-60">
            {t.engineName} Game Engine • Release {t.version} • {t.developerCredit}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className={`px-5 py-2 text-xs font-bold transition-colors cursor-pointer border ${
              theme === 'dark'
                ? 'bg-white text-black border-white hover:bg-neutral-200'
                : 'bg-black text-white border-black hover:bg-neutral-800'
            }`}
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
