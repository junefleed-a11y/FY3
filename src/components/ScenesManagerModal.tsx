import { useState } from 'react';
import { GameScene } from '../types/engine';
import { Language, ThemeMode } from '../utils/i18n';
import { 
  X, 
  Plus, 
  Trash2, 
  Copy, 
  Edit2, 
  Check, 
  Film,
  Layers
} from 'lucide-react';

interface ScenesManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenes: GameScene[];
  activeSceneId: string;
  onSelectScene: (sceneId: string) => void;
  onAddScene: (name: string) => void;
  onRenameScene: (sceneId: string, newName: string) => void;
  onDuplicateScene: (sceneId: string) => void;
  onDeleteScene: (sceneId: string) => void;
  language: Language;
  theme: ThemeMode;
}

export const ScenesManagerModal = ({
  isOpen,
  onClose,
  scenes,
  activeSceneId,
  onSelectScene,
  onAddScene,
  onRenameScene,
  onDuplicateScene,
  onDeleteScene,
  language,
  theme
}: ScenesManagerModalProps) => {
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [newSceneName, setNewSceneName] = useState('');

  if (!isOpen) return null;

  const isAr = language === 'ar';
  const isDark = theme === 'dark';

  const handleStartRename = (scene: GameScene) => {
    setEditingSceneId(scene.id);
    setEditingName(scene.name);
  };

  const handleSaveRename = (sceneId: string) => {
    if (editingName.trim()) {
      onRenameScene(sceneId, editingName.trim());
    }
    setEditingSceneId(null);
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newSceneName.trim() || `${isAr ? 'المشهد' : 'Scene'} ${scenes.length + 1}`;
    onAddScene(name);
    setNewSceneName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
      <div className={`w-full max-w-xl border shadow-2xl overflow-hidden flex flex-col ${
        isDark ? 'bg-black text-white border-neutral-700' : 'bg-white text-black border-neutral-400'
      }`}>
        {/* Header */}
        <div className={`h-12 px-4 border-b flex items-center justify-between ${
          isDark ? 'border-neutral-800 bg-neutral-950' : 'border-neutral-300 bg-neutral-100'
        }`}>
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4" />
            <h3 className="font-bold text-sm tracking-tight">
              {isAr ? 'إدارة مشاهد اللعبة (Scenes)' : 'Game Scenes Manager'}
            </h3>
            <span className="text-[11px] font-mono opacity-60">
              ({scenes.length})
            </span>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 border transition-colors cursor-pointer ${
              isDark ? 'border-neutral-800 hover:border-neutral-500 text-neutral-400 hover:text-white' : 'border-neutral-300 hover:border-neutral-600 text-neutral-600 hover:text-black'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Create New Scene Input Bar */}
        <form onSubmit={handleCreateNew} className={`p-3 border-b flex items-center gap-2 ${
          isDark ? 'border-neutral-800 bg-neutral-900/60' : 'border-neutral-300 bg-neutral-50'
        }`}>
          <input
            type="text"
            value={newSceneName}
            onChange={(e) => setNewSceneName(e.target.value)}
            placeholder={isAr ? 'اسم المشهد الجديد (مثال: المرحلة 2، القلعة، شاشة الفوز)' : 'New Scene Name (e.g. Level 2, Boss, Win)'}
            className={`flex-1 border px-3 py-1.5 text-xs outline-none ${
              isDark ? 'bg-neutral-950 border-neutral-700 text-white' : 'bg-white border-neutral-300 text-black'
            }`}
          />
          <button
            type="submit"
            className={`border px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
              isDark ? 'border-white bg-white text-black hover:bg-neutral-200' : 'border-black bg-black text-white hover:bg-neutral-800'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAr ? 'إضافة مشهد' : 'Add Scene'}</span>
          </button>
        </form>

        {/* Scenes List */}
        <div className="max-h-80 overflow-y-auto p-3 space-y-2">
          {scenes.map((scene, idx) => {
            const isActive = scene.id === activeSceneId;
            const isEditing = editingSceneId === scene.id;

            return (
              <div
                key={scene.id}
                className={`p-3 border flex items-center justify-between gap-3 transition-colors ${
                  isActive
                    ? (isDark ? 'border-white bg-neutral-900' : 'border-black bg-neutral-100')
                    : (isDark ? 'border-neutral-800 bg-neutral-950 hover:border-neutral-700' : 'border-neutral-300 bg-white hover:border-neutral-400')
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="font-mono text-xs opacity-50 shrink-0">#{idx + 1}</span>

                  {isEditing ? (
                    <div className="flex items-center gap-1.5 flex-1">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveRename(scene.id);
                          if (e.key === 'Escape') setEditingSceneId(null);
                        }}
                        className={`border px-2 py-0.5 text-xs outline-none font-bold w-full ${
                          isDark ? 'bg-black border-white text-white' : 'bg-white border-black text-black'
                        }`}
                      />
                      <button
                        onClick={() => handleSaveRename(scene.id)}
                        className={`p-1 border cursor-pointer ${
                          isDark ? 'border-neutral-700 hover:border-white' : 'border-neutral-300 hover:border-black'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div 
                      onClick={() => {
                        onSelectScene(scene.id);
                      }}
                      className="cursor-pointer flex-1 min-w-0"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs truncate">{scene.name}</span>
                        {isActive && (
                          <span className={`px-1.5 py-0.2 text-[10px] font-mono border ${
                            isDark ? 'bg-white text-black border-white' : 'bg-black text-white border-black'
                          }`}>
                            {isAr ? 'المشهد النشط' : 'Active'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] opacity-60 mt-0.5 font-mono">
                        <span className="flex items-center gap-1">
                          <Layers className="w-3 h-3" />
                          <span>{scene.objects?.length || 0} {isAr ? 'كائنات' : 'objects'}</span>
                        </span>
                        <span>{scene.layers?.length || 2} {isAr ? 'طبقات' : 'layers'}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {!isActive && (
                    <button
                      onClick={() => onSelectScene(scene.id)}
                      className={`border px-2.5 py-1 text-xs font-bold cursor-pointer ${
                        isDark ? 'border-neutral-700 hover:border-white text-white' : 'border-neutral-300 hover:border-black text-black'
                      }`}
                    >
                      {isAr ? 'فتح المشهد' : 'Open'}
                    </button>
                  )}

                  <button
                    onClick={() => handleStartRename(scene)}
                    title={isAr ? 'إعادة تسمية' : 'Rename'}
                    className={`p-1.5 border transition-colors cursor-pointer text-neutral-400 hover:text-white ${
                      isDark ? 'border-neutral-800 hover:border-neutral-600' : 'border-neutral-300 hover:border-black hover:text-black'
                    }`}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onDuplicateScene(scene.id)}
                    title={isAr ? 'تكرار المشهد' : 'Duplicate'}
                    className={`p-1.5 border transition-colors cursor-pointer text-neutral-400 hover:text-white ${
                      isDark ? 'border-neutral-800 hover:border-neutral-600' : 'border-neutral-300 hover:border-black hover:text-black'
                    }`}
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  {scenes.length > 1 && (
                    <button
                      onClick={() => onDeleteScene(scene.id)}
                      title={isAr ? 'حذف المشهد' : 'Delete'}
                      className={`p-1.5 border transition-colors cursor-pointer text-neutral-400 hover:text-white ${
                        isDark ? 'border-neutral-800 hover:border-neutral-600' : 'border-neutral-300 hover:border-black hover:text-black'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className={`p-3 border-t flex items-center justify-between text-xs ${
          isDark ? 'border-neutral-800 bg-neutral-950' : 'border-neutral-300 bg-neutral-100'
        }`}>
          <span className="text-[11px] opacity-60">
            {isAr 
              ? 'يمكنك الانتقال بين المشاهد برمجياً عبر لغة FY3: إذا كائن تصادم مع كائن = انتقل إلى مشهد ثاني.'
              : 'Switch scenes in FY3 visual script via: When object collides with object -> Transition to scene.'}
          </span>

          <button
            onClick={onClose}
            className={`border px-4 py-1 font-bold cursor-pointer ${
              isDark ? 'border-white bg-white text-black hover:bg-neutral-200' : 'border-black bg-black text-white hover:bg-neutral-800'
            }`}
          >
            {isAr ? 'تم' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
