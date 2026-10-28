import React, { useState } from 'react';
import { GameProject } from '../types/engine';
import { Language, ThemeMode, translations } from '../utils/i18n';
import { 
  Play, 
  Square, 
  Pause, 
  Plus, 
  ArrowRight, 
  ArrowLeft,
  Save, 
  Download, 
  Settings, 
  Grid,
  BookOpen,
  Film
} from 'lucide-react';

interface TopBarProps {
  project: GameProject;
  activeSceneName?: string;
  isPlaying: boolean;
  isPaused: boolean;
  onPlay: () => void;
  onStop: () => void;
  onPause: () => void;
  onOpenAddModal: () => void;
  onBackToProjects: () => void;
  onSave: () => void;
  onExportStandalone: () => void;
  onUpdateProjectTitle: (title: string) => void;
  onToggleGrid: () => void;
  showGrid: boolean;
  onOpenSettings: () => void;
  onOpenScenesModal: () => void;
  onOpenInfoModal: () => void;
  language: Language;
  theme: ThemeMode;
}

export const TopBar: React.FC<TopBarProps> = ({
  project,
  activeSceneName,
  isPlaying,
  isPaused,
  onPlay,
  onStop,
  onPause,
  onOpenAddModal,
  onBackToProjects,
  onSave,
  onExportStandalone,
  onUpdateProjectTitle,
  onToggleGrid,
  showGrid,
  onOpenSettings,
  onOpenScenesModal,
  onOpenInfoModal,
  language,
  theme
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(project.title);
  const t = translations[language];

  const handleTitleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (titleInput.trim()) {
      onUpdateProjectTitle(titleInput.trim());
    }
    setIsEditingTitle(false);
  };

  return (
    <header className={`h-14 px-4 flex items-center justify-between select-none border-b ${
      theme === 'dark'
        ? 'bg-black text-white border-neutral-800'
        : 'bg-white text-black border-neutral-300 shadow-sm'
    }`}>
      {/* Left: Back Arrow and Scene Selector */}
      <div className="flex items-center gap-2">
        <button
          onClick={onBackToProjects}
          title={t.projects}
          className={`border p-2 text-xs flex items-center justify-center transition-colors cursor-pointer ${
            theme === 'dark'
              ? 'border-neutral-800 hover:border-white text-neutral-300 hover:text-white bg-neutral-950'
              : 'border-neutral-300 hover:border-black text-neutral-700 hover:text-black bg-neutral-100'
          }`}
        >
          {language === 'ar' ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
        </button>

        {/* Scene Selector Button */}
        <button
          onClick={onOpenScenesModal}
          title={language === 'ar' ? 'إدارة مشاهد اللعبة' : 'Manage Scenes'}
          className={`border px-2.5 py-1.5 text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
            theme === 'dark'
              ? 'border-neutral-700 bg-neutral-900 hover:border-white text-white'
              : 'border-neutral-300 bg-neutral-100 hover:border-black text-black'
          }`}
        >
          <Film className="w-3.5 h-3.5" />
          <span className="font-semibold text-xs">
            {activeSceneName || (language === 'ar' ? 'المشهد 1' : 'Scene 1')}
          </span>
          <span className="text-[9px] opacity-60">▼</span>
        </button>
      </div>

      {/* Center: Play, Stop, Add Image, Grid */}
      <div className="flex items-center gap-2">
        {!isPlaying ? (
          <button
            onClick={onPlay}
            title={t.startGame}
            className={`border px-3.5 py-1.5 text-xs font-bold flex items-center justify-center transition-all cursor-pointer shadow-sm ${
              theme === 'dark'
                ? 'bg-white text-black border-white hover:bg-neutral-200'
                : 'bg-black text-white border-black hover:bg-neutral-800'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
          </button>
        ) : (
          <div className="flex items-center gap-1.5">
            <button
              onClick={onStop}
              className={`border px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                theme === 'dark'
                  ? 'bg-neutral-900 hover:bg-neutral-800 text-white border-neutral-700'
                  : 'bg-neutral-200 hover:bg-neutral-300 text-black border-neutral-400'
              }`}
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>{t.stopGame}</span>
            </button>
            <button
              onClick={onPause}
              className={`border p-1.5 text-xs flex items-center transition-colors cursor-pointer ${
                theme === 'dark'
                  ? 'border-neutral-800 hover:border-neutral-600 text-neutral-300 hover:text-white'
                  : 'border-neutral-300 hover:border-neutral-500 text-neutral-700 hover:text-black'
              }`}
              title={isPaused ? t.resumeGame : t.pauseGame}
            >
              <Pause className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className={`h-4 w-[1px] mx-1 ${theme === 'dark' ? 'bg-neutral-800' : 'bg-neutral-300'}`} />

        {/* Add Object / Image Button - Icon Only */}
        <button
          onClick={onOpenAddModal}
          disabled={isPlaying}
          title={language === 'ar' ? 'إضافة كائن' : 'Add Object'}
          className={`border p-2 text-xs flex items-center justify-center transition-colors cursor-pointer ${
            isPlaying 
              ? 'opacity-40 cursor-not-allowed' 
              : (theme === 'dark' ? 'border-neutral-700 hover:border-white text-white' : 'border-neutral-400 hover:border-black text-black')
          }`}
        >
          <Plus className="w-4 h-4" />
        </button>

        {/* Toggle Grid */}
        <button
          onClick={onToggleGrid}
          title={t.gridToggle}
          className={`p-2 border transition-colors cursor-pointer ${
            showGrid 
              ? (theme === 'dark' ? 'border-white text-white bg-neutral-900' : 'border-black text-black bg-neutral-200')
              : 'border-transparent opacity-50 hover:opacity-100'
          }`}
        >
          <Grid className="w-4 h-4" />
        </button>
      </div>

      {/* Right: Info (Book icon), Settings, Export (Download icon), Save (Save icon) */}
      <div className="flex items-center gap-2">
        {/* Info & About Button - Book Icon Only */}
        <button
          onClick={onOpenInfoModal}
          title={language === 'ar' ? 'معلومات' : 'Info'}
          className={`border p-2 text-xs flex items-center justify-center transition-colors cursor-pointer ${
            theme === 'dark' 
              ? 'border-neutral-700 hover:border-white text-white bg-neutral-900' 
              : 'border-neutral-400 hover:border-black text-black bg-neutral-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          title={t.settings}
          className={`p-2 border transition-colors cursor-pointer ${
            theme === 'dark' 
              ? 'border-neutral-800 hover:border-neutral-500 text-neutral-300 hover:text-white' 
              : 'border-neutral-300 hover:border-neutral-600 text-neutral-700 hover:text-black'
          }`}
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Export Button - Download Icon Only */}
        <button
          onClick={onExportStandalone}
          title={language === 'ar' ? 'تصدير' : 'Export'}
          className={`border p-2 text-xs flex items-center justify-center transition-colors cursor-pointer ${
            theme === 'dark'
              ? 'border-neutral-800 hover:border-neutral-500 text-neutral-300 hover:text-white'
              : 'border-neutral-300 hover:border-neutral-600 text-neutral-700 hover:text-black'
          }`}
        >
          <Download className="w-4 h-4" />
        </button>

        {/* Save Button - Save Icon Only */}
        <button
          onClick={onSave}
          title={t.save}
          className={`border p-2 text-xs flex items-center justify-center transition-colors cursor-pointer ${
            theme === 'dark'
              ? 'border-neutral-700 hover:border-white text-white bg-neutral-950'
              : 'border-neutral-400 hover:border-black text-black bg-white'
          }`}
        >
          <Save className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
