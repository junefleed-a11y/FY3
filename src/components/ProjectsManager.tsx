import React, { useState } from 'react';
import { GameProject } from '../types/engine';
import { EMPTY_PROJECT_TEMPLATE } from '../utils/defaultProjects';
import { Language, ThemeMode, translations } from '../utils/i18n';
import { 
  FolderPlus, 
  Play, 
  Trash2, 
  Copy, 
  Download, 
  Upload, 
  Layers, 
  Clock, 
  Settings,
  Search,
  Smartphone,
  Monitor,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  AlertTriangle,
  BookOpen,
  X
} from 'lucide-react';

interface ProjectsManagerProps {
  projects: GameProject[];
  onOpenProject: (project: GameProject) => void;
  onPlayProjectDirectly?: (project: GameProject) => void;
  onCreateProject: (project: GameProject) => void;
  onDeleteProject: (projectId: string) => void;
  onDuplicateProject: (project: GameProject) => void;
  onImportProject: (project: GameProject) => void;
  onOpenSettings: () => void;
  onOpenInfo?: () => void;
  language: Language;
  theme: ThemeMode;
}

export const ProjectsManager: React.FC<ProjectsManagerProps> = ({
  projects,
  onOpenProject,
  onPlayProjectDirectly,
  onCreateProject,
  onDeleteProject,
  onDuplicateProject,
  onImportProject,
  onOpenSettings,
  onOpenInfo,
  language,
  theme
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // Delete Confirmation Modal State (Fix for sandboxed iframes!)
  const [projectToDelete, setProjectToDelete] = useState<GameProject | null>(null);

  // Orientation and Dimension Settings
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customWidth, setCustomWidth] = useState(800);
  const [customHeight, setCustomHeight] = useState(500);
  const [customBg, setCustomBg] = useState('#000000');
  const [customGravity, setCustomGravity] = useState(0);

  const t = translations[language];

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOrientationChange = (orient: 'landscape' | 'portrait') => {
    setOrientation(orient);
    if (orient === 'landscape') {
      setCustomWidth(800);
      setCustomHeight(500);
    } else {
      setCustomWidth(450);
      setCustomHeight(750);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const width = Math.max(200, customWidth || (orientation === 'landscape' ? 800 : 450));
    const height = Math.max(200, customHeight || (orientation === 'landscape' ? 500 : 750));

    const newProject: GameProject = {
      ...EMPTY_PROJECT_TEMPLATE,
      id: 'proj_' + Math.random().toString(36).substring(2, 9),
      title: newTitle.trim(),
      description: newDesc.trim() || (orientation === 'landscape' ? 'لعبة عرضية (شاشة أفقية)' : 'لعبة طولية (شاشة عمودية)'),
      updatedAt: Date.now(),
      settings: {
        ...EMPTY_PROJECT_TEMPLATE.settings,
        width,
        height,
        backgroundColor: customBg,
        gravity: customGravity
      },
      globalScript: '',
      nodeGraph: { nodes: [], connections: [] },
      objects: []
    };


    onCreateProject(newProject);
    setShowNewModal(false);
    setNewTitle('');
    setNewDesc('');
    setShowAdvanced(false);
  };

  const handleConfirmDelete = () => {
    if (projectToDelete) {
      onDeleteProject(projectToDelete.id);
      setProjectToDelete(null);
    }
  };

  const handleExportJson = (project: GameProject, e: React.MouseEvent) => {
    e.stopPropagation();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${project.title.replace(/\s+/g, '_')}.fy3.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content) as GameProject;
        if (parsed && parsed.settings && parsed.objects) {
          parsed.id = 'proj_' + Math.random().toString(36).substring(2, 9);
          parsed.updatedAt = Date.now();
          onImportProject(parsed);
        }
      } catch {
        alert('ملف المشروع غير صالح');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className={`h-full w-full overflow-y-auto p-6 md:p-10 flex flex-col items-center select-none ${
      theme === 'dark' ? 'bg-black text-white' : 'bg-neutral-50 text-black'
    }`}>
      {/* Top Header */}
      <div className={`w-full max-w-6xl mb-8 border-b pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shrink-0 ${
        theme === 'dark' ? 'border-neutral-800' : 'border-neutral-300'
      }`}>
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 border-2 flex items-center justify-center font-mono font-black text-xl ${
              theme === 'dark' ? 'bg-white text-black border-white' : 'bg-black text-white border-black'
            }`}>
              {t.engineName}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">
                  {t.projects}
                </h1>
                <span className="text-xs font-mono px-2 py-0.5 border border-current opacity-70">
                  v{t.version}
                </span>
              </div>
              <p className="text-xs opacity-75 font-mono">
                {t.developerCredit}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons: Info & Docs, Settings, Import, New Project */}
        <div className="flex items-center gap-2 flex-wrap">
          {onOpenInfo && (
            <button
              onClick={onOpenInfo}
              title={language === 'ar' ? 'معلومات المحرك وشرح لغة FY3 والشروط' : 'Engine Info & FY3 Language Guide'}
              className={`border px-3.5 py-2 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm ${
                theme === 'dark'
                  ? 'border-neutral-700 hover:border-white bg-neutral-900 text-white hover:bg-neutral-800'
                  : 'border-neutral-400 hover:border-black bg-neutral-100 text-black hover:bg-neutral-200'
              }`}
            >
              <BookOpen className="w-4 h-4 text-yellow-500" />
              <span>{language === 'ar' ? 'معلومات' : 'Info'}</span>
            </button>
          )}

          <button
            onClick={onOpenSettings}
            title={t.settings}
            className={`border px-3 py-2 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              theme === 'dark'
                ? 'border-neutral-800 hover:border-white bg-neutral-950 text-neutral-300 hover:text-white'
                : 'border-neutral-300 hover:border-black bg-white text-neutral-700 hover:text-black'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>{t.settings}</span>
          </button>

          <label className={`border px-3 py-2 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
            theme === 'dark'
              ? 'border-neutral-800 hover:border-white bg-neutral-950 text-neutral-300 hover:text-white'
              : 'border-neutral-300 hover:border-black bg-white text-neutral-700 hover:text-black'
          }`}>
            <Upload className="w-4 h-4" />
            <span>{t.importProject}</span>
            <input
              type="file"
              accept=".json,.fy3"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>

          <button
            onClick={() => setShowNewModal(true)}
            className={`border px-4 py-2 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              theme === 'dark'
                ? 'bg-white text-black border-white hover:bg-neutral-200'
                : 'bg-black text-white border-black hover:bg-neutral-800'
            }`}
          >
            <FolderPlus className="w-4 h-4" />
            <span>{t.newProject}</span>
          </button>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="w-full max-w-6xl mb-6 flex items-center justify-between gap-4 shrink-0">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 opacity-50 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder={t.searchProjects}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full border px-9 py-2 text-sm outline-none transition-colors ${
              theme === 'dark'
                ? 'bg-neutral-950 border-neutral-800 focus:border-white text-white placeholder-neutral-600'
                : 'bg-white border-neutral-300 focus:border-black text-black placeholder-neutral-400'
            }`}
          />
        </div>

        <div className="text-xs font-mono opacity-60">
          {t.availableProjects}: {filteredProjects.length}
        </div>
      </div>

      {/* Projects Grid with bottom scroll padding */}
      {filteredProjects.length === 0 ? (
        <div className={`w-full max-w-6xl border-2 border-dashed p-12 text-center my-8 ${
          theme === 'dark' ? 'border-neutral-800 text-neutral-400' : 'border-neutral-300 text-neutral-600'
        }`}>
          <p className="text-sm font-bold mb-3">لا توجد مشاريع حالياً</p>
          <button
            onClick={() => setShowNewModal(true)}
            className={`border px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5 transition-colors ${
              theme === 'dark' ? 'bg-white text-black border-white' : 'bg-black text-white border-black'
            }`}
          >
            <FolderPlus className="w-4 h-4" />
            <span>إنشاء أول مشروع لك</span>
          </button>
        </div>
      ) : (
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-28">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => onOpenProject(project)}
              className={`group border transition-all cursor-pointer flex flex-col justify-between p-5 relative shadow-sm ${
                theme === 'dark'
                  ? 'border-neutral-800 hover:border-white bg-neutral-950'
                  : 'border-neutral-300 hover:border-black bg-white'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-base group-hover:underline transition-colors truncate">
                    {project.title}
                  </h3>
                  <span className="font-mono text-[10px] uppercase border px-1.5 py-0.5 opacity-60">
                    {project.settings.width}x{project.settings.height}
                  </span>
                </div>
                <p className="text-xs opacity-70 line-clamp-2 mb-4 leading-relaxed">
                  {project.description || 'مشروع بدون وصف'}
                </p>
              </div>

              <div className={`border-t pt-3 ${theme === 'dark' ? 'border-neutral-900' : 'border-neutral-200'}`}>
                <div className="flex items-center justify-between text-xs opacity-60 mb-3 font-mono">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    <span>{project.objects.length} كائنات</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(project.updatedAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</span>
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 border-t pt-3 border-neutral-700/20" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => {
                      if (onPlayProjectDirectly) {
                        onPlayProjectDirectly(project);
                      } else {
                        onOpenProject(project);
                      }
                    }}
                    className={`flex-1 border text-xs py-1.5 px-3 flex items-center justify-center gap-1.5 font-medium transition-colors ${
                      theme === 'dark'
                        ? 'bg-neutral-900 hover:bg-white hover:text-black text-white border-neutral-700'
                        : 'bg-neutral-100 hover:bg-black hover:text-white text-black border-neutral-300'
                    }`}
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>{t.openAndPlay}</span>
                  </button>

                  <button
                    title={t.duplicate}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicateProject(project);
                    }}
                    className="p-1.5 opacity-60 hover:opacity-100 border border-transparent hover:border-current transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    title={t.exportProject}
                    onClick={(e) => handleExportJson(project, e)}
                    className="p-1.5 opacity-60 hover:opacity-100 border border-transparent hover:border-current transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  {/* Reliable In-App Delete Button */}
                  <button
                    title={t.delete}
                    onClick={(e) => {
                      e.stopPropagation();
                      setProjectToDelete(project);
                    }}
                    className="p-1.5 opacity-60 hover:opacity-100 text-red-500 border border-transparent hover:border-red-500 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation In-App Modal (Works 100% in all Sandboxes!) */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md p-6 border shadow-2xl ${
            theme === 'dark' ? 'bg-black text-white border-white' : 'bg-white text-black border-black'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 border border-red-500 text-red-500">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base">تأكيد حذف المشروع</h3>
                <p className="text-xs opacity-70">هذا الإجراء نهائي ولا يمكن التراجع عنه</p>
              </div>
            </div>

            <p className="text-sm mb-6 leading-relaxed">
              هل أنت متأكد من رغبتك في حذف مشروع <span className="font-bold underline">"{projectToDelete.title}"</span> نهائياً؟
            </p>

            <div className="flex items-center justify-end gap-3 font-mono">
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                className="px-4 py-2 border text-xs font-bold hover:opacity-70 transition-opacity cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white border border-red-600 text-xs font-bold transition-colors cursor-pointer"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Project Modal with Orientation & Advanced manual dimensions */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className={`w-full max-w-lg p-6 border my-auto ${
            theme === 'dark' ? 'bg-black text-white border-white' : 'bg-white text-black border-black shadow-2xl'
          }`}>
            <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
              <FolderPlus className="w-5 h-5" />
              <span>{t.newProject}</span>
            </h2>
            <p className="text-xs opacity-70 mb-5">
              حدد اسم اللعبة، اتجاه الشاشة (بالطول أو بالعرض)، والأبعاد المطلوبة.
            </p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-mono mb-1.5 opacity-80">اسم اللعبة / المشروع</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: مغامرة البطل 1"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className={`w-full border px-3 py-2 text-sm outline-none ${
                    theme === 'dark'
                      ? 'bg-neutral-900 border-neutral-700 text-white focus:border-white'
                      : 'bg-white border-neutral-300 text-black focus:border-black'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-mono mb-1.5 opacity-80">الوصف (اختياري)</label>
                <input
                  type="text"
                  placeholder="وصف مختصر للعبة..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className={`w-full border px-3 py-2 text-sm outline-none ${
                    theme === 'dark'
                      ? 'bg-neutral-900 border-neutral-700 text-white focus:border-white'
                      : 'bg-white border-neutral-300 text-black focus:border-black'
                  }`}
                />
              </div>

              {/* Orientation Selector: Landscape vs Portrait */}
              <div>
                <label className="block text-xs font-mono mb-1.5 opacity-80">اتجاه شاشة اللعبة</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleOrientationChange('landscape')}
                    className={`border p-3 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                      orientation === 'landscape'
                        ? (theme === 'dark' ? 'bg-white text-black border-white' : 'bg-black text-white border-black')
                        : 'border-neutral-700 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Monitor className="w-6 h-6" />
                    <span className="text-xs font-bold">بالعرض (أفقي)</span>
                    <span className="text-[10px] font-mono opacity-80">800 × 500 px</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOrientationChange('portrait')}
                    className={`border p-3 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                      orientation === 'portrait'
                        ? (theme === 'dark' ? 'bg-white text-black border-white' : 'bg-black text-white border-black')
                        : 'border-neutral-700 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Smartphone className="w-6 h-6" />
                    <span className="text-xs font-bold">بالطول (عمودي)</span>
                    <span className="text-[10px] font-mono opacity-80">450 × 750 px</span>
                  </button>
                </div>
              </div>

              {/* Advanced Dimensions Toggle */}
              <div className="pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center justify-between w-full text-xs font-mono opacity-80 hover:opacity-100 py-1 cursor-pointer"
                >
                  <span className="flex items-center gap-1.5 font-bold">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>إعدادات متقدمة (تحديد الأبعاد بالأرقام يدوياً)</span>
                  </span>
                  {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showAdvanced && (
                  <div className="grid grid-cols-2 gap-3 mt-3 p-3 border border-neutral-800 bg-neutral-900/30">
                    <div>
                      <label className="block text-[11px] font-mono mb-1 opacity-70">العرض يدوي (Width px)</label>
                      <input
                        type="number"
                        min="200"
                        max="3840"
                        value={customWidth}
                        onChange={(e) => setCustomWidth(parseInt(e.target.value) || 800)}
                        className={`w-full border px-2 py-1.5 text-xs outline-none font-mono ${
                          theme === 'dark' ? 'bg-black border-neutral-700 text-white' : 'bg-white border-neutral-300 text-black'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono mb-1 opacity-70">الارتفاع يدوي (Height px)</label>
                      <input
                        type="number"
                        min="200"
                        max="2160"
                        value={customHeight}
                        onChange={(e) => setCustomHeight(parseInt(e.target.value) || 500)}
                        className={`w-full border px-2 py-1.5 text-xs outline-none font-mono ${
                          theme === 'dark' ? 'bg-black border-neutral-700 text-white' : 'bg-white border-neutral-300 text-black'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono mb-1 opacity-70">لون خلفية العالم</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={customBg}
                          onChange={(e) => setCustomBg(e.target.value)}
                          className="w-8 h-8 border cursor-pointer bg-transparent"
                        />
                        <span className="font-mono text-xs">{customBg}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono mb-1 opacity-70">قوة الجاذبية (Gravity)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="2"
                        value={customGravity}
                        onChange={(e) => setCustomGravity(parseFloat(e.target.value) || 0)}
                        className={`w-full border px-2 py-1.5 text-xs outline-none font-mono ${
                          theme === 'dark' ? 'bg-black border-neutral-700 text-white' : 'bg-white border-neutral-300 text-black'
                        }`}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800 font-mono">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 border text-xs font-bold hover:opacity-70 transition-opacity cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 border text-xs font-bold transition-colors cursor-pointer ${
                    theme === 'dark' ? 'bg-white text-black border-white' : 'bg-black text-white border-black'
                  }`}
                >
                  إنشاء وبدء المشروع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
