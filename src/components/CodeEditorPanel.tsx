import React, { useState, useRef, useEffect } from 'react';
import { GameObject, EngineLog, GameScene, NodeGraph } from '../types/engine';
import { Language, ThemeMode, translations } from '../utils/i18n';
import { FY3NodeEditor } from './FY3NodeEditor';
import { 
  Code, 
  ChevronUp, 
  ChevronDown, 
  Maximize2, 
  Minimize2, 
  Check, 
  Sliders, 
  ZoomIn, 
  ZoomOut,
  Target
} from 'lucide-react';

interface CodeEditorPanelProps {
  objects: GameObject[];
  selectedObjectId: string | null;
  onSelectObject: (id: string | null) => void;
  onUpdateObjectScript: (objectId: string, script: string) => void;
  globalScript: string;
  onUpdateGlobalScript: (script: string) => void;
  nodeGraph?: NodeGraph;
  onUpdateNodeGraph?: (graph: NodeGraph, compiledJS: string) => void;
  onUpdateObjectNodeGraph?: (objectId: string, graph: NodeGraph, compiledJS: string) => void;
  scenes?: GameScene[];
  logs?: EngineLog[];
  onClearLogs?: () => void;
  language: Language;
  theme: ThemeMode;
  // Kept for backward compatibility
  onUpdateObjectFy3Script?: any;
  onUpdateObjectFy3Text?: any;
  globalFy3Script?: any;
  onUpdateGlobalFy3Script?: any;
  onUpdateGlobalFy3Text?: any;
}

export const CodeEditorPanel: React.FC<CodeEditorPanelProps> = ({
  objects,
  selectedObjectId,
  onSelectObject,
  onUpdateObjectScript,
  globalScript,
  onUpdateGlobalScript,
  nodeGraph,
  onUpdateNodeGraph,
  onUpdateObjectNodeGraph,
  scenes = [],
  language,
  theme
}) => {
  // Only two scripting modes: 'nodes' (مكعبات FY3) and 'js' (JavaScript)
  const [scriptLanguage, setScriptLanguage] = useState<'nodes' | 'js'>('nodes');
  const [isExpanded, setIsExpanded] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [panelHeight, setPanelHeight] = useState(320);
  const [fontSize, setFontSize] = useState(13);
  const [targetType, setTargetType] = useState<'object' | 'global'>('global');
  const [selectedTargetId, setSelectedTargetId] = useState<string>(selectedObjectId || (objects[0]?.id || ''));
  const [savedBadge, setSavedBadge] = useState(false);

  const t = translations[language];

  useEffect(() => {
    if (selectedObjectId) {
      setTargetType('object');
      setSelectedTargetId(selectedObjectId);
    }
  }, [selectedObjectId]);

  // Listen for ESC key to exit fullscreen editor
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isFullscreen]);

  const currentObject = objects.find(o => o.id === selectedTargetId);
  const currentCode = targetType === 'global' ? globalScript : (currentObject?.script || '');
  const activeNodeGraph: NodeGraph = (targetType === 'object' && currentObject ? currentObject.nodeGraph : nodeGraph) || { nodes: [], connections: [] };

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleCodeChange = (newCode: string) => {
    if (targetType === 'global') {
      onUpdateGlobalScript(newCode);
    } else if (currentObject) {
      onUpdateObjectScript(currentObject.id, newCode);
    }
    setSavedBadge(true);
    setTimeout(() => setSavedBadge(false), 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;

      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      handleCodeChange(newValue);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  const linesCount = Math.max(1, currentCode.split('\n').length);
  const lineNumbers = Array.from({ length: linesCount }, (_, i) => i + 1);

  return (
    <div 
      className={`border-t flex flex-col select-none font-mono transition-all duration-150 ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-black text-white'
          : (theme === 'dark' ? 'bg-black text-white border-neutral-800' : 'bg-white text-black border-neutral-300')
      }`}
      style={{ height: isFullscreen ? '100vh' : (isExpanded ? `${panelHeight}px` : '36px') }}
    >
      {/* Header: Mode Switcher + Target Object Selector + Actions */}
      <div className={`h-10 px-3 flex items-center justify-between text-xs border-b shrink-0 ${
        theme === 'dark' || isFullscreen ? 'bg-neutral-950 border-neutral-800' : 'bg-neutral-100 border-neutral-300'
      }`}>
        {/* Left: Mode Switcher (مكعبات FY3 vs JavaScript) & Target Object Selector */}
        <div className="flex items-center gap-3">
          {/* Mode Switcher */}
          <div className="flex items-center border border-neutral-700 p-0.5 text-xs">
            <button
              onClick={() => { setScriptLanguage('nodes'); setIsExpanded(true); }}
              className={`px-3 py-1 font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                scriptLanguage === 'nodes'
                  ? (theme === 'dark' || isFullscreen ? 'bg-white text-black' : 'bg-black text-white')
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'مكعبات FY3' : 'FY3 Nodes'}</span>
            </button>

            <button
              onClick={() => { setScriptLanguage('js'); setIsExpanded(true); }}
              className={`px-3 py-1 font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                scriptLanguage === 'js'
                  ? (theme === 'dark' || isFullscreen ? 'bg-white text-black' : 'bg-black text-white')
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>JavaScript</span>
            </button>
          </div>

          {/* Target Object Selector: "فوق كائن مستهدف اختصره و اكتب كائن" */}
          <div className="flex items-center gap-1.5 border border-neutral-700/80 px-2 py-0.5 bg-neutral-900/40">
            <Target className="w-3.5 h-3.5 opacity-60 text-emerald-400" />
            <span className="text-[11px] opacity-75 font-semibold">{language === 'ar' ? 'كائن:' : 'Target:'}</span>
            <select
              value={targetType === 'global' ? '__global__' : selectedTargetId}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '__global__') {
                  setTargetType('global');
                } else {
                  setTargetType('object');
                  setSelectedTargetId(val);
                  onSelectObject(val);
                }
              }}
              className={`border-none bg-transparent text-xs outline-none cursor-pointer font-bold ${
                theme === 'dark' || isFullscreen ? 'text-white' : 'text-black'
              }`}
            >
              <option value="__global__" className="text-black bg-white dark:text-white dark:bg-black">
                {language === 'ar' ? 'العالم / المشهد العام' : 'Global Scene'}
              </option>
              {objects.length > 0 && (
                <optgroup label="كائنات المشهد">
                  {objects.map((obj) => (
                    <option key={obj.id} value={obj.id} className="text-black bg-white dark:text-white dark:bg-black">
                      {obj.name}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          {savedBadge && (
            <span className="text-[10px] text-emerald-400 flex items-center gap-1">
              <Check className="w-3 h-3" />
              <span>محفوظ</span>
            </span>
          )}
        </div>

        {/* Right Actions: Fullscreen, Font Size (for JS), Expand / Collapse */}
        <div className="flex items-center gap-2">
          {scriptLanguage === 'js' && (
            <div className="hidden sm:flex items-center gap-1 border border-neutral-800 px-1 py-0.5">
              <button
                onClick={() => setFontSize(f => Math.max(10, f - 1))}
                className="p-0.5 opacity-60 hover:opacity-100 cursor-pointer"
                title="تصغير الخط"
              >
                <ZoomOut className="w-3 h-3" />
              </button>
              <span className="text-[10px] px-1">{fontSize}px</span>
              <button
                onClick={() => setFontSize(f => Math.min(22, f + 1))}
                className="p-0.5 opacity-60 hover:opacity-100 cursor-pointer"
                title="تكبير الخط"
              >
                <ZoomIn className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Fullscreen Button */}
          <button
            onClick={() => {
              setIsFullscreen(!isFullscreen);
              setIsExpanded(true);
            }}
            title={isFullscreen ? 'الخروج من ملء الشاشة (ESC)' : 'تكبير المحرر البرمجي على شاشة كاملة'}
            className={`border px-2.5 py-1 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isFullscreen
                ? 'bg-white text-black border-white'
                : (theme === 'dark' ? 'border-neutral-700 hover:border-white text-white' : 'border-neutral-300 hover:border-black text-black')
            }`}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>{isFullscreen ? 'تصغير (ESC)' : 'ملء الشاشة'}</span>
          </button>

          {!isFullscreen && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
              title={isExpanded ? 'طي المحرر' : 'فتح المحرر'}
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="flex-1 flex overflow-hidden">
          {scriptLanguage === 'nodes' ? (
            <FY3NodeEditor
              graph={activeNodeGraph}
              objects={objects}
              scenes={scenes}
              targetObjectId={targetType === 'object' ? currentObject?.id : undefined}
              onUpdateGraph={(newGraph, compiledJS) => {
                if (targetType === 'object' && currentObject) {
                  if (onUpdateObjectNodeGraph) {
                    onUpdateObjectNodeGraph(currentObject.id, newGraph, compiledJS);
                  }
                  onUpdateObjectScript(currentObject.id, compiledJS);
                } else {
                  if (onUpdateNodeGraph) {
                    onUpdateNodeGraph(newGraph, compiledJS);
                  }
                  onUpdateGlobalScript(compiledJS);
                }
                setSavedBadge(true);
                setTimeout(() => setSavedBadge(false), 1500);
              }}
              language={language}
              theme={theme}
            />
          ) : (
            <div className={`flex-1 flex relative overflow-hidden ${theme === 'dark' || isFullscreen ? 'bg-neutral-950' : 'bg-neutral-50'}`}>
              <div 
                className={`w-12 border-l py-3 text-right pr-2 font-mono text-xs select-none overflow-hidden opacity-50 ${
                  theme === 'dark' || isFullscreen ? 'bg-black border-neutral-900' : 'bg-neutral-200 border-neutral-300'
                }`}
                aria-hidden="true"
              >
                {lineNumbers.map((n) => (
                  <div key={n} style={{ lineHeight: `${fontSize + 8}px`, height: `${fontSize + 8}px` }}>{n}</div>
                ))}
              </div>

              <textarea
                ref={textareaRef}
                value={currentCode}
                onChange={(e) => handleCodeChange(e.target.value)}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                placeholder={`// كود جافا سكريبت للكائن: ${targetType === 'global' ? 'المشهد العام' : (currentObject?.name || '')}\n// function onStart(game) {}\n// function onUpdate(dt, game) {}\n// function onCollision(other, game) {}`}
                className={`flex-1 p-3 font-mono outline-none resize-none leading-relaxed overflow-y-auto ${
                  theme === 'dark' || isFullscreen
                    ? 'bg-neutral-950 text-neutral-100 placeholder-neutral-700 selection:bg-neutral-700'
                    : 'bg-white text-neutral-900 placeholder-neutral-400 selection:bg-neutral-300'
                }`}
                style={{
                  fontSize: `${fontSize}px`,
                  lineHeight: `${fontSize + 8}px`,
                  tabSize: 2
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
