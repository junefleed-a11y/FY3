import React, { useState, useEffect } from 'react';
import { GameProject, GameObject, EngineLog, GameLayer, GameSettings, GameScene, FY3ScriptData, NodeGraph } from './types/engine';
import { DEFAULT_PROJECTS, EMPTY_PROJECT_TEMPLATE, DEFAULT_LAYERS } from './utils/defaultProjects';
import { Language, ThemeMode, translations } from './utils/i18n';
import { ProjectsManager } from './components/ProjectsManager';
import { TopBar } from './components/TopBar';
import { RightPanel } from './components/RightPanel';
import { SceneViewport } from './components/SceneViewport';
import { CodeEditorPanel } from './components/CodeEditorPanel';
import { AddAssetModal } from './components/AddAssetModal';
import { SettingsModal } from './components/SettingsModal';
import { PrebuiltBehaviorsModal } from './components/PrebuiltBehaviorsModal';
import { AnimationStudioModal } from './components/AnimationStudioModal';
import { FullscreenGamePlayer } from './components/FullscreenGamePlayer';
import { ExportModal } from './components/ExportModal';
import { InfoModal } from './components/InfoModal';
import { ScenesManagerModal } from './components/ScenesManagerModal';

const STORAGE_KEY = 'fy3_game_engine_projects_v101';
const PREFS_KEY = 'fy3_user_preferences_v101';

export default function App() {
  // Theme and Language State
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const prefs = localStorage.getItem(PREFS_KEY);
      if (prefs) {
        const parsed = JSON.parse(prefs);
        if (parsed.theme === 'light' || parsed.theme === 'dark') return parsed.theme;
      }
    } catch {}
    return 'dark';
  });

  const [language, setLanguage] = useState<Language>(() => {
    try {
      const prefs = localStorage.getItem(PREFS_KEY);
      if (prefs) {
        const parsed = JSON.parse(prefs);
        if (parsed.language === 'en' || parsed.language === 'ar') return parsed.language;
      }
    } catch {}
    return 'ar';
  });

  // Projects State
  const [projects, setProjects] = useState<GameProject[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return DEFAULT_PROJECTS;
  });

  // Navigation State
  const [currentView, setCurrentView] = useState<'projects' | 'editor'>('projects');
  const [activeProjectId, setActiveProjectId] = useState<string | null>(() => {
    return projects[0]?.id || null;
  });

  // Editor State
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showPrebuiltModal, setShowPrebuiltModal] = useState<boolean>(false);
  const [showAnimationStudio, setShowAnimationStudio] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);
  const [showScenesModal, setShowScenesModal] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [logs, setLogs] = useState<EngineLog[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  // Update HTML tag attributes on language and theme changes
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#000000';
      document.body.style.color = '#ffffff';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#ffffff';
      document.body.style.color = '#000000';
    }

    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify({ theme, language }));
    } catch {}
  }, [theme, language]);

  // Persist projects
  const saveProjectsToStorage = (updatedProjects: GameProject[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProjects));
    } catch {}
  };

  const showToast = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 2500);
  };

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0] || {
    ...EMPTY_PROJECT_TEMPLATE,
    id: 'proj_default_fallback',
    title: 'مشروع جديد'
  };

  // Normalize project scenes
  const projectScenes: GameScene[] = (activeProject.scenes && activeProject.scenes.length > 0)
    ? activeProject.scenes
    : [
        {
          id: 'scene_main',
          name: language === 'ar' ? 'المشهد 1' : 'Scene 1',
          layers: activeProject.layers && activeProject.layers.length > 0 ? activeProject.layers : DEFAULT_LAYERS,
          objects: activeProject.objects || [],
          globalScript: activeProject.globalScript || ''
        }
      ];

  const activeSceneId = activeProject.activeSceneId || projectScenes[0]?.id || 'scene_main';
  const currentScene = projectScenes.find(s => s.id === activeSceneId) || projectScenes[0];

  // Ensure active project has layers initialized
  const projectLayers: GameLayer[] = (activeProject.layers && activeProject.layers.length > 0)
    ? activeProject.layers
    : DEFAULT_LAYERS;

  const selectedObject = activeProject?.objects?.find(o => o.id === selectedObjectId) || null;

  const handleOpenProject = (project: GameProject) => {
    setIsPlaying(false);
    setActiveProjectId(project.id);
    setSelectedObjectId(project.objects[0]?.id || null);
    setCurrentView('editor');
  };

  const handlePlayProjectDirectly = (project: GameProject) => {
    setActiveProjectId(project.id);
    setSelectedObjectId(project.objects[0]?.id || null);
    setCurrentView('editor');
    setIsPlaying(true);
  };

  const handleBackToProjects = () => {
    setIsPlaying(false);
    setCurrentView('projects');
  };

  const handleCreateProject = (newProject: GameProject) => {
    const updated = [newProject, ...projects];
    setProjects(updated);
    saveProjectsToStorage(updated);
    handleOpenProject(newProject);
    showToast(`تم إنشاء مشروع "${newProject.title}" بنجاح`);
  };

  const handleDeleteProject = (projectId: string) => {
    const updated = projects.filter(p => p.id !== projectId);
    setProjects(updated);
    saveProjectsToStorage(updated);
    if (activeProjectId === projectId) {
      setActiveProjectId(updated[0]?.id || null);
    }
    showToast('تم حذف المشروع بنجاح');
  };

  const handleDuplicateProject = (project: GameProject) => {
    const duplicated: GameProject = {
      ...JSON.parse(JSON.stringify(project)),
      id: 'proj_' + Math.random().toString(36).substring(2, 9),
      title: `${project.title} (نسخة)`,
      updatedAt: Date.now()
    };
    const updated = [duplicated, ...projects];
    setProjects(updated);
    saveProjectsToStorage(updated);
    showToast('تم تكرار المشروع بنجاح');
  };

  const handleImportProject = (imported: GameProject) => {
    const updated = [imported, ...projects];
    setProjects(updated);
    saveProjectsToStorage(updated);
    showToast('تم استيراد المشروع بنجاح');
  };

  const updateCurrentProject = (updater: (prev: GameProject) => GameProject) => {
    if (!activeProject) return;
    const updatedProj = updater(activeProject);
    updatedProj.updatedAt = Date.now();

    const updatedProjects = projects.map(p => p.id === updatedProj.id ? updatedProj : p);
    setProjects(updatedProjects);
    saveProjectsToStorage(updatedProjects);
  };

  const handleUpdateSettings = (settingsUpdater: (prev: GameSettings) => GameSettings) => {
    updateCurrentProject(prev => ({
      ...prev,
      settings: settingsUpdater(prev.settings)
    }));
    showToast('تم تحديث إعدادات العالم');
  };

  const handleAddObject = (newObj: GameObject) => {
    const defaultLayer = projectLayers[0]?.id;
    const objWithLayer: GameObject = {
      ...newObj,
      layerId: newObj.layerId || defaultLayer
    };

    updateCurrentProject(prev => ({
      ...prev,
      objects: [...prev.objects, objWithLayer]
    }));
    setSelectedObjectId(objWithLayer.id);
    showToast(`تمت إضافة "${newObj.name}"`);
  };

  const handleUpdateObject = (updatedObj: GameObject) => {
    updateCurrentProject(prev => ({
      ...prev,
      objects: prev.objects.map(o => o.id === updatedObj.id ? updatedObj : o)
    }));
  };

  const handleDeleteObject = (id: string) => {
    updateCurrentProject(prev => ({
      ...prev,
      objects: prev.objects.filter(o => o.id !== id)
    }));
    if (selectedObjectId === id) {
      setSelectedObjectId(null);
    }
    showToast('تم حذف الكائن');
  };

  const handleDuplicateObject = (id: string) => {
    const original = activeProject.objects.find(o => o.id === id);
    if (!original) return;

    const copy: GameObject = {
      ...JSON.parse(JSON.stringify(original)),
      id: 'obj_' + Math.random().toString(36).substring(2, 9),
      name: `${original.name} (نسخة)`,
      x: original.x + 20,
      y: original.y + 20
    };

    updateCurrentProject(prev => ({
      ...prev,
      objects: [...prev.objects, copy]
    }));
    setSelectedObjectId(copy.id);
    showToast('تم تكرار الكائن');
  };

  const handleReorderObjects = (sourceIndex: number, targetIndex: number) => {
    updateCurrentProject(prev => {
      const items = [...prev.objects];
      const [moved] = items.splice(sourceIndex, 1);
      items.splice(targetIndex, 0, moved);
      return {
        ...prev,
        objects: items
      };
    });
  };

  // Layers Handlers
  const handleAddLayer = (newLayer: GameLayer) => {
    updateCurrentProject(prev => ({
      ...prev,
      layers: [...(prev.layers || DEFAULT_LAYERS), newLayer]
    }));
    showToast(`تمت إضافة طبقة "${newLayer.name}"`);
  };

  const handleUpdateLayer = (updatedLayer: GameLayer) => {
    updateCurrentProject(prev => ({
      ...prev,
      layers: (prev.layers || DEFAULT_LAYERS).map(l => l.id === updatedLayer.id ? updatedLayer : l)
    }));
  };

  const handleDeleteLayer = (layerId: string) => {
    updateCurrentProject(prev => {
      const remainingLayers = (prev.layers || DEFAULT_LAYERS).filter(l => l.id !== layerId);
      const fallbackLayerId = remainingLayers[0]?.id;
      // Reassign objects of deleted layer to first remaining layer
      const updatedObjects = prev.objects.map(o => o.layerId === layerId ? { ...o, layerId: fallbackLayerId } : o);
      return {
        ...prev,
        layers: remainingLayers,
        objects: updatedObjects
      };
    });
    showToast('تم حذف الطبقة ونقل كائناتها');
  };

  const handleReorderLayers = (sourceIndex: number, targetIndex: number) => {
    updateCurrentProject(prev => {
      const items = [...(prev.layers || DEFAULT_LAYERS)];
      const [moved] = items.splice(sourceIndex, 1);
      items.splice(targetIndex, 0, moved);
      return {
        ...prev,
        layers: items
      };
    });
  };

  const handleUpdateObjectScript = (objectId: string, script: string) => {
    updateCurrentProject(prev => {
      const updatedObjects = prev.objects.map(o => o.id === objectId ? { ...o, script } : o);
      const scenes = (prev.scenes && prev.scenes.length > 0) ? prev.scenes : projectScenes;
      const updatedScenes = scenes.map(s => s.id === activeSceneId ? { ...s, objects: updatedObjects } : s);
      return {
        ...prev,
        objects: updatedObjects,
        scenes: updatedScenes
      };
    });
  };

  const handleUpdateObjectFy3Script = (objectId: string, fy3Data: FY3ScriptData) => {
    updateCurrentProject(prev => {
      const updatedObjects = prev.objects.map(o => o.id === objectId ? { ...o, fy3Script: fy3Data } : o);
      const scenes = (prev.scenes && prev.scenes.length > 0) ? prev.scenes : projectScenes;
      const updatedScenes = scenes.map(s => s.id === activeSceneId ? { ...s, objects: updatedObjects } : s);
      return {
        ...prev,
        objects: updatedObjects,
        scenes: updatedScenes
      };
    });
  };

  const handleUpdateGlobalScript = (script: string) => {
    updateCurrentProject(prev => {
      const scenes = (prev.scenes && prev.scenes.length > 0) ? prev.scenes : projectScenes;
      const updatedScenes = scenes.map(s => s.id === activeSceneId ? { ...s, globalScript: script } : s);
      return {
        ...prev,
        globalScript: script,
        scenes: updatedScenes
      };
    });
  };

  const handleUpdateGlobalFy3Script = (fy3Data: FY3ScriptData) => {
    updateCurrentProject(prev => {
      const scenes = (prev.scenes && prev.scenes.length > 0) ? prev.scenes : projectScenes;
      const updatedScenes = scenes.map(s => s.id === activeSceneId ? { ...s, globalFy3Script: fy3Data } : s);
      return {
        ...prev,
        globalFy3Script: fy3Data,
        scenes: updatedScenes
      };
    });
  };

  const handleUpdateObjectFy3Text = (objectId: string, fy3Text: string, compiledJS: string) => {
    updateCurrentProject(prev => {
      const updatedObjects = prev.objects.map(o => o.id === objectId ? { 
        ...o, 
        fy3Text, 
        script: compiledJS,
        fy3Script: { ...(o.fy3Script || { variables: [], rules: [] }), rawText: fy3Text }
      } : o);
      const scenes = (prev.scenes && prev.scenes.length > 0) ? prev.scenes : projectScenes;
      const updatedScenes = scenes.map(s => s.id === activeSceneId ? { ...s, objects: updatedObjects } : s);
      return {
        ...prev,
        objects: updatedObjects,
        scenes: updatedScenes
      };
    });
  };

  const handleUpdateGlobalFy3Text = (fy3Text: string, compiledJS: string) => {
    updateCurrentProject(prev => {
      const scenes = (prev.scenes && prev.scenes.length > 0) ? prev.scenes : projectScenes;
      const updatedScenes = scenes.map(s => s.id === activeSceneId ? { 
        ...s, 
        globalFy3Text: fy3Text, 
        globalScript: compiledJS,
        globalFy3Script: { ...(s.globalFy3Script || { variables: [], rules: [] }), rawText: fy3Text }
      } : s);
      return {
        ...prev,
        globalFy3Text: fy3Text,
        globalScript: compiledJS,
        globalFy3Script: { ...(prev.globalFy3Script || { variables: [], rules: [] }), rawText: fy3Text },
        scenes: updatedScenes
      };
    });
  };

  const handleUpdateNodeGraph = (newGraph: NodeGraph, compiledJS: string) => {
    updateCurrentProject(prev => {
      const scenes = (prev.scenes && prev.scenes.length > 0) ? prev.scenes : projectScenes;
      const updatedScenes = scenes.map(s => s.id === activeSceneId ? { 
        ...s, 
        nodeGraph: newGraph,
        globalScript: compiledJS
      } : s);
      return {
        ...prev,
        nodeGraph: newGraph,
        globalScript: compiledJS,
        scenes: updatedScenes
      };
    });
  };

  const handleUpdateObjectNodeGraph = (objectId: string, newGraph: NodeGraph, compiledJS: string) => {
    updateCurrentProject(prev => {
      const updatedObjects = prev.objects.map(o => o.id === objectId ? {
        ...o,
        nodeGraph: newGraph,
        script: compiledJS
      } : o);
      const scenes = (prev.scenes && prev.scenes.length > 0) ? prev.scenes : projectScenes;
      const updatedScenes = scenes.map(s => s.id === activeSceneId ? { ...s, objects: updatedObjects } : s);
      return {
        ...prev,
        objects: updatedObjects,
        scenes: updatedScenes
      };
    });
  };


  // Scenes Management Handlers
  const handleSelectScene = (sceneId: string) => {
    const targetScene = projectScenes.find(s => s.id === sceneId);
    if (!targetScene) return;

    updateCurrentProject(prev => {
      // First save current active scene objects and layers
      const scenes = (prev.scenes && prev.scenes.length > 0) ? prev.scenes : projectScenes;
      const syncedScenes: GameScene[] = scenes.map(s => s.id === activeSceneId ? { ...s, objects: prev.objects, layers: prev.layers || projectLayers } : s);
      const target = syncedScenes.find(s => s.id === sceneId) || syncedScenes[0];

      return {
        ...prev,
        scenes: syncedScenes,
        activeSceneId: sceneId,
        objects: target.objects || [],
        layers: target.layers || projectLayers,
        globalScript: target.globalScript ?? prev.globalScript,
        globalFy3Script: target.globalFy3Script ?? prev.globalFy3Script
      };
    });
    setSelectedObjectId(null);
    showToast(`تم التبديل إلى "${targetScene.name}"`);
  };

  const handleAddScene = (name: string) => {
    const newSceneId = 'scene_' + Math.random().toString(36).substring(2, 9);
    const newScene: GameScene = {
      id: newSceneId,
      name,
      layers: JSON.parse(JSON.stringify(projectLayers)),
      objects: [],
      globalScript: ''
    };

    updateCurrentProject(prev => {
      const scenes = (prev.scenes && prev.scenes.length > 0) ? prev.scenes : projectScenes;
      // sync current scene objects first
      const syncedScenes: GameScene[] = scenes.map(s => s.id === activeSceneId ? { ...s, objects: prev.objects, layers: prev.layers || projectLayers } : s);
      return {
        ...prev,
        scenes: [...syncedScenes, newScene],
        activeSceneId: newSceneId,
        objects: [],
        layers: newScene.layers,
        globalScript: ''
      };
    });
    setSelectedObjectId(null);
    showToast(`تمت إضافة المشهد "${name}"`);
  };

  const handleRenameScene = (sceneId: string, newName: string) => {
    updateCurrentProject(prev => {
      const scenes = (prev.scenes && prev.scenes.length > 0) ? prev.scenes : projectScenes;
      return {
        ...prev,
        scenes: scenes.map(s => s.id === sceneId ? { ...s, name: newName } : s)
      };
    });
    showToast('تمت إعادة تسمية المشهد');
  };

  const handleDuplicateScene = (sceneId: string) => {
    const original = projectScenes.find(s => s.id === sceneId);
    if (!original) return;
    const dupId = 'scene_' + Math.random().toString(36).substring(2, 9);
    const duplicated: GameScene = {
      ...JSON.parse(JSON.stringify(original)),
      id: dupId,
      name: `${original.name} (نسخة)`
    };

    updateCurrentProject(prev => {
      const scenes = (prev.scenes && prev.scenes.length > 0) ? prev.scenes : projectScenes;
      return {
        ...prev,
        scenes: [...scenes, duplicated]
      };
    });
    showToast('تم تكرار المشهد');
  };

  const handleDeleteScene = (sceneId: string) => {
    if (projectScenes.length <= 1) {
      showToast('لا يمكن حذف المشهد الوحيد في اللعبة');
      return;
    }
    const remaining = projectScenes.filter(s => s.id !== sceneId);
    const nextActive = remaining[0];

    updateCurrentProject(prev => ({
      ...prev,
      scenes: remaining,
      activeSceneId: nextActive.id,
      objects: nextActive.objects || [],
      layers: nextActive.layers || prev.layers,
      globalScript: nextActive.globalScript || ''
    }));
    setSelectedObjectId(null);
    showToast('تم حذف المشهد');
  };

  const handleApplyPrebuiltBehavior = (updatedObj: GameObject) => {
    handleUpdateObject(updatedObj);
    showToast(`تم تطبيق السلوك على "${updatedObj.name}" بنجاح`);
  };

  return (
    <div className={`w-screen h-screen flex flex-col overflow-hidden font-sans ${
      theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'
    }`}>
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 text-xs font-bold px-4 py-2 border shadow-2xl font-mono ${
          theme === 'dark' ? 'bg-white text-black border-black' : 'bg-black text-white border-white'
        }`}>
          {notification}
        </div>
      )}

      {/* FULLSCREEN IMMERSIVE PLAY MODE */}
      {isPlaying && (
        <FullscreenGamePlayer
          project={activeProject}
          onStop={() => setIsPlaying(false)}
          language={language}
          theme={theme}
        />
      )}

      {currentView === 'projects' ? (
        <ProjectsManager
          projects={projects}
          onOpenProject={handleOpenProject}
          onPlayProjectDirectly={handlePlayProjectDirectly}
          onCreateProject={handleCreateProject}
          onDeleteProject={handleDeleteProject}
          onDuplicateProject={handleDuplicateProject}
          onImportProject={handleImportProject}
          onOpenSettings={() => setShowSettingsModal(true)}
          onOpenInfo={() => setShowInfoModal(true)}
          language={language}
          theme={theme}
        />
      ) : (
        <div className="w-full h-full flex flex-col overflow-hidden">
          {/* Top Bar with FY3 v1.0.1, Play, Add Image, Settings */}
          <TopBar
            project={activeProject}
            activeSceneName={currentScene.name}
            isPlaying={isPlaying}
            isPaused={false}
            onPlay={() => setIsPlaying(true)}
            onStop={() => setIsPlaying(false)}
            onPause={() => {}}
            onOpenAddModal={() => setShowAddModal(true)}
            onBackToProjects={handleBackToProjects}
            onSave={() => showToast('تم حفظ التغييرات محلياً')}
            onExportStandalone={() => setShowExportModal(true)}
            onUpdateProjectTitle={(title) => updateCurrentProject(p => ({ ...p, title }))}
            onToggleGrid={() => setShowGrid(!showGrid)}
            showGrid={showGrid}
            onOpenSettings={() => setShowSettingsModal(true)}
            onOpenScenesModal={() => setShowScenesModal(true)}
            onOpenInfoModal={() => setShowInfoModal(true)}
            language={language}
            theme={theme}
          />

          {/* Main Workspace Body */}
          <div className="flex-1 flex overflow-hidden">
            {/* Center Area: True Infinite World Viewport + Fullscreen Code Editor Panel */}
            <main className="flex-1 flex flex-col overflow-hidden">
              <SceneViewport
                settings={activeProject.settings}
                layers={projectLayers}
                objects={activeProject.objects}
                selectedObjectId={selectedObjectId}
                onSelectObject={setSelectedObjectId}
                onUpdateObject={handleUpdateObject}
                onUpdateSettings={handleUpdateSettings}
                isPlaying={isPlaying}
                showGrid={showGrid}
                language={language}
                theme={theme}
              />

              <CodeEditorPanel
                objects={activeProject.objects}
                selectedObjectId={selectedObjectId}
                onSelectObject={setSelectedObjectId}
                onUpdateObjectScript={handleUpdateObjectScript}
                onUpdateObjectFy3Script={handleUpdateObjectFy3Script}
                onUpdateObjectFy3Text={handleUpdateObjectFy3Text}
                globalScript={activeProject.globalScript}
                onUpdateGlobalScript={handleUpdateGlobalScript}
                globalFy3Script={activeProject.globalFy3Script}
                onUpdateGlobalFy3Script={handleUpdateGlobalFy3Script}
                onUpdateGlobalFy3Text={handleUpdateGlobalFy3Text}
                nodeGraph={currentScene.nodeGraph || activeProject.nodeGraph}
                onUpdateNodeGraph={handleUpdateNodeGraph}
                onUpdateObjectNodeGraph={handleUpdateObjectNodeGraph}
                scenes={projectScenes}
                logs={logs}
                onClearLogs={() => setLogs([])}
                language={language}
                theme={theme}
              />
            </main>

            {/* Right Panel: Hierarchy, Layers, and Inspector */}
            <RightPanel
              objects={activeProject.objects}
              layers={projectLayers}
              selectedObjectId={selectedObjectId}
              onSelectObject={setSelectedObjectId}
              onUpdateObject={handleUpdateObject}
              onReorderObjects={handleReorderObjects}
              onDeleteObject={handleDeleteObject}
              onDuplicateObject={handleDuplicateObject}
              onOpenAddModal={() => setShowAddModal(true)}
              onOpenPrebuiltModal={() => setShowPrebuiltModal(true)}
              onOpenAnimationStudio={() => setShowAnimationStudio(true)}
              onAddLayer={handleAddLayer}
              onUpdateLayer={handleUpdateLayer}
              onDeleteLayer={handleDeleteLayer}
              onReorderLayers={handleReorderLayers}
              settings={activeProject.settings}
              onUpdateSettings={handleUpdateSettings}
              language={language}
              theme={theme}
            />
          </div>

          {/* Add Image / Asset Modal */}
          <AddAssetModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onAddObject={handleAddObject}
            gameWidth={activeProject.settings.width}
            gameHeight={activeProject.settings.height}
            language={language}
            theme={theme}
          />

          {/* Pre-built Behaviors Modal */}
          <PrebuiltBehaviorsModal
            isOpen={showPrebuiltModal}
            onClose={() => setShowPrebuiltModal(false)}
            selectedObject={selectedObject}
            onApplyBehavior={handleApplyPrebuiltBehavior}
            language={language}
            theme={theme}
          />

          {/* Fullscreen Animation Studio Modal */}
          <AnimationStudioModal
            isOpen={showAnimationStudio}
            onClose={() => setShowAnimationStudio(false)}
            object={selectedObject}
            onUpdateObject={handleUpdateObject}
            language={language}
            theme={theme}
          />

          {/* Export Game Modal */}
          <ExportModal
            isOpen={showExportModal}
            onClose={() => setShowExportModal(false)}
            project={activeProject}
            language={language}
            theme={theme}
            onShowToast={showToast}
          />
        </div>
      )}

      {/* Settings Modal (Global) */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        language={language}
        onLanguageChange={setLanguage}
        theme={theme}
        onThemeChange={setTheme}
      />

      {/* Scenes Manager Modal */}
      <ScenesManagerModal
        isOpen={showScenesModal}
        onClose={() => setShowScenesModal(false)}
        scenes={projectScenes}
        activeSceneId={activeSceneId}
        onSelectScene={handleSelectScene}
        onAddScene={handleAddScene}
        onRenameScene={handleRenameScene}
        onDuplicateScene={handleDuplicateScene}
        onDeleteScene={handleDeleteScene}
        language={language}
        theme={theme}
      />

      {/* Info & Terms Modal */}
      <InfoModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        language={language}
        theme={theme}
      />
    </div>
  );
}
