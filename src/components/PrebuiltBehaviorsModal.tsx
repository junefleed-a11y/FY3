import React from 'react';
import { GameObject } from '../types/engine';
import { Language, ThemeMode, translations } from '../utils/i18n';
import { PREBUILT_BEHAVIOR_OPTIONS, applyPrebuiltBehavior } from '../utils/prebuiltBehaviors';
import { 
  Move, 
  ShieldAlert, 
  Disc, 
  X, 
  Sparkles, 
  Check, 
  Compass, 
  User,
  Camera
} from 'lucide-react';

interface PrebuiltBehaviorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedObject: GameObject | null;
  onApplyBehavior: (updatedObject: GameObject) => void;
  language: Language;
  theme: ThemeMode;
}

export const PrebuiltBehaviorsModal: React.FC<PrebuiltBehaviorsModalProps> = ({
  isOpen,
  onClose,
  selectedObject,
  onApplyBehavior,
  language,
  theme
}) => {
  if (!isOpen || !selectedObject) return null;
  const t = translations[language];

  const handleSelect = (behaviorId: string) => {
    const updated = applyPrebuiltBehavior(selectedObject, behaviorId);
    onApplyBehavior(updated);
    onClose();
  };

  const renderIcon = (iconType: string) => {
    switch (iconType) {
      case 'arrows':
        return <Move className="w-8 h-8" />;
      case 'player':
        return (
          <div className="relative">
            <User className="w-8 h-8" />
            <Camera className="w-3.5 h-3.5 absolute -top-1 -right-1" />
          </div>
        );
      case 'shield':
        return <ShieldAlert className="w-8 h-8" />;
      case 'circle':
        return <Disc className="w-8 h-8" />;
      default:
        return <Compass className="w-8 h-8" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`w-full max-w-3xl max-h-[90vh] border p-6 flex flex-col ${
        theme === 'dark'
          ? 'bg-black text-white border-white'
          : 'bg-white text-black border-black shadow-2xl'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-700/50">
          <div>
            <h2 className="text-lg md:text-xl font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span>{t.addBehaviorTitle}</span>
            </h2>
            <p className="text-xs opacity-70 mt-1">
              {t.addBehaviorDesc} <span className="font-bold underline">[{selectedObject.name}]</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:opacity-70 transition-opacity cursor-pointer border border-neutral-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Big Clear Options Grid */}
        <div className="py-6 flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {PREBUILT_BEHAVIOR_OPTIONS.map((opt, index) => {
            const title = t[opt.titleKey];
            const desc = t[opt.descKey];

            return (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                className={`group border-2 p-5 text-right flex flex-col justify-between transition-all cursor-pointer relative hover:scale-[1.01] ${
                  theme === 'dark'
                    ? 'border-neutral-800 hover:border-white bg-neutral-950 hover:bg-neutral-900 text-white'
                    : 'border-neutral-300 hover:border-black bg-neutral-50 hover:bg-white text-black'
                }`}
              >
                {/* Number Badge & Icon */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 border ${
                    theme === 'dark'
                      ? 'border-neutral-800 group-hover:border-white bg-black'
                      : 'border-neutral-300 group-hover:border-black bg-white'
                  }`}>
                    {renderIcon(opt.iconType)}
                  </div>
                  <span className="font-mono text-xs border border-current px-2 py-0.5 opacity-60">
                    0{index + 1}
                  </span>
                </div>

                {/* Text */}
                <div className="mb-4">
                  <h3 className="text-base font-bold mb-2 group-hover:underline">
                    {title}
                  </h3>
                  <p className={`text-xs leading-relaxed ${
                    theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'
                  }`}>
                    {desc}
                  </p>
                </div>

                {/* Action CTA */}
                <div className={`mt-auto pt-3 border-t text-xs font-bold flex items-center justify-between font-mono ${
                  theme === 'dark' ? 'border-neutral-900 group-hover:border-neutral-700' : 'border-neutral-200 group-hover:border-neutral-400'
                }`}>
                  <span>{t.applyBehavior}</span>
                  <Check className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-neutral-700/50 flex items-center justify-between text-xs font-mono">
          <span className="opacity-60">
            {t.developerCredit} • FY3 Engine v1.0.1
          </span>
          <button
            onClick={onClose}
            className={`px-4 py-2 border transition-colors cursor-pointer ${
              theme === 'dark'
                ? 'border-neutral-800 hover:border-white text-white'
                : 'border-neutral-300 hover:border-black text-black'
            }`}
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
