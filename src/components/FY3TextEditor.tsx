import React, { useState, useRef, useMemo } from 'react';
import { GameObject, GameScene } from '../types/engine';
import { Language, ThemeMode } from '../utils/i18n';
import { 
  findTyposInFY3Text, 
  fixTypoInText, 
  fixAllTyposInText, 
  parseFY3Text, 
  compileFY3TextToJS,
  FY3_TYPOS_DICTIONARY,
  FY3_COMMANDS_CATALOG,
  FY3CommandInfo
} from '../engine/fy3Compiler';
import { 
  Wand2, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  Play, 
  Sparkles, 
  BookOpen, 
  Code, 
  FileText,
  Search,
  Camera,
  Compass,
  Layers,
  Volume2,
  Film,
  Hash,
  ArrowRightLeft,
  XCircle,
  HelpCircle
} from 'lucide-react';

interface FY3TextEditorProps {
  value: string;
  onChange: (newText: string, compiledJS: string) => void;
  currentObjectName?: string;
  availableObjects: GameObject[];
  scenes?: GameScene[];
  language: Language;
  theme: ThemeMode;
}

export const FY3TextEditor: React.FC<FY3TextEditorProps> = ({
  value,
  onChange,
  currentObjectName = 'كائن',
  availableObjects,
  scenes = [],
  language,
  theme
}) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'parsed' | 'compiled' | 'docs' | 'templates'>('editor');
  const [copiedCode, setCopiedCode] = useState(false);
  const [searchDocQuery, setSearchDocQuery] = useState('');
  const [selectedDocCategory, setSelectedDocCategory] = useState<string>('all');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const isAr = language === 'ar';
  const isDark = theme === 'dark';

  // Real-time typo detection
  const detectedTypos = useMemo(() => findTyposInFY3Text(value), [value]);

  // Real-time parsed syntax analysis
  const parsedLines = useMemo(() => parseFY3Text(value), [value]);

  // Invalid unrecognized lines (MUST BE HIGHLIGHTED IN RED)
  const invalidLines = useMemo(() => parsedLines.filter(l => !l.valid && l.type === 'invalid'), [parsedLines]);

  // Compiled JavaScript code
  const compiledJS = useMemo(() => {
    return compileFY3TextToJS(value, currentObjectName, scenes);
  }, [value, currentObjectName, scenes]);

  const handleTextChange = (newText: string) => {
    const js = compileFY3TextToJS(newText, currentObjectName, scenes);
    onChange(newText, js);
  };

  // Auto-Corrector Handlers
  const handleFixSingleTypo = (typo: string, replacement: string, lineIndex: number) => {
    const fixedText = fixTypoInText(value, typo, replacement, lineIndex);
    handleTextChange(fixedText);
  };

  const handleFixAllTypos = () => {
    const fixedText = fixAllTyposInText(value);
    handleTextChange(fixedText);
  };

  // Quick insertion at cursor
  const handleInsertSnippet = (snippet: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      const newText = value ? `${value}\n${snippet}` : snippet;
      handleTextChange(newText);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = textarea.value;

    const needsPreNewline = start > 0 && current[start - 1] !== '\n' && current[start - 1] !== ' ' ? ' ' : '';
    const toInsert = `${needsPreNewline}${snippet}`;

    const updated = current.substring(0, start) + toInsert + current.substring(end);
    handleTextChange(updated);

    setTimeout(() => {
      textarea.focus();
      const pos = start + toInsert.length;
      textarea.selectionStart = pos;
      textarea.selectionEnd = pos;
    }, 0);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(compiledJS);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Quick chips definitions (including dynamic object names!)
  const quickChipsAr = [
    { label: 'اذا', insert: 'اذا ' },
    { label: 'لمس', insert: 'لمس ' },
    { label: 'ضغط', insert: 'ضغط ' },
    { label: '=', insert: ' = ' },
    { label: 'سهم_يمين', insert: 'سهم_يمين' },
    { label: 'سهم_يسار', insert: 'سهم_يسار' },
    { label: 'مسافة', insert: 'مسافة' },
    { label: 'تحرك 150 x', insert: 'تحرك 150 x' },
    { label: 'تحرك -150 x', insert: 'تحرك -150 x' },
    { label: 'قفز 220', insert: 'قفز 220' },
    { label: 'موت', insert: 'موت' },
    { label: 'تغير مشهد 2', insert: 'تغير مشهد 2' },
    { label: 'تابع كاميرا', insert: 'تابع كاميرا' },
    { label: 'اهتزاز كاميرا', insert: 'اهتزاز كاميرا' },
    { label: 'اضف 10 نقاط', insert: 'اضف 10 نقاط' },
    { label: 'متغير نقاط = 0', insert: 'متغير نقاط = 0\n' },
    { label: 'شغل صوت قفز', insert: 'شغل صوت قفز' }
  ];

  const quickChipsEn = [
    { label: 'if', insert: 'if ' },
    { label: 'touch', insert: 'touch ' },
    { label: 'press', insert: 'press ' },
    { label: '=', insert: ' = ' },
    { label: 'ArrowRight', insert: 'ArrowRight' },
    { label: 'ArrowLeft', insert: 'ArrowLeft' },
    { label: 'Space', insert: 'Space' },
    { label: 'move 150 x', insert: 'move 150 x' },
    { label: 'move -150 x', insert: 'move -150 x' },
    { label: 'jump 220', insert: 'jump 220' },
    { label: 'destroy', insert: 'destroy' },
    { label: 'change scene 2', insert: 'change scene 2' },
    { label: 'camera follow', insert: 'camera follow' },
    { label: 'shake camera', insert: 'shake camera' },
    { label: 'add 10 score', insert: 'add 10 score' },
    { label: 'variable score = 0', insert: 'variable score = 0\n' },
    { label: 'play sound jump', insert: 'play sound jump' }
  ];

  const chips = isAr ? quickChipsAr : quickChipsEn;

  // Filtered 100+ commands in docs tab
  const filteredCommands = useMemo(() => {
    return FY3_COMMANDS_CATALOG.filter(cmd => {
      const matchCat = selectedDocCategory === 'all' || cmd.category === selectedDocCategory;
      const q = searchDocQuery.trim().toLowerCase();
      if (!q) return matchCat;
      const matchText = 
        cmd.syntaxAr.toLowerCase().includes(q) ||
        cmd.syntaxEn.toLowerCase().includes(q) ||
        cmd.descAr.toLowerCase().includes(q) ||
        cmd.descEn.toLowerCase().includes(q) ||
        cmd.exampleAr.toLowerCase().includes(q);
      return matchCat && matchText;
    });
  }, [searchDocQuery, selectedDocCategory]);

  // Ready-to-use template programs (كودات جاهزة كاملة)
  const templates = [
    {
      title: isAr ? '1. حركة لاعب كاملة بالأسهم والقفز' : '1. Player Movement & Jump',
      desc: isAr ? 'تحكم سلس بالأسهم ومفتاح المسافة للقفز' : 'Smooth movement with Arrow keys & Space jump',
      code: isAr 
        ? `// تحكم بحركة اللاعب بالأسهم ومفتاح المسافة للقفز
اذا لاعب ضغط سهم_يمين = تحرك 160 x
اذا لاعب ضغط سهم_يسار = تحرك -160 x
اذا لاعب ضغط مسافة = قفز 240
عند البدء = تابع كاميرا`
        : `// Full player movement with Arrow keys & Space jump
if player press ArrowRight = move 160 x
if player press ArrowLeft = move -160 x
if player press Space = jump 240
on start = camera follow`
    },
    {
      title: isAr ? '2. حركة لاعب بأزرار WASD' : '2. Player Movement WASD',
      desc: isAr ? 'التحكم بالاتجاهات الأربعة بأزرار W A S D' : '4-directional controls with WASD',
      code: isAr 
        ? `// حركة حرة بأزرار WASD
اذا لاعب ضغط d = تحرك 150 x
اذا لاعب ضغط a = تحرك -150 x
اذا لاعب ضغط w = تحرك -150 y
اذا لاعب ضغط s = تحرك 150 y`
        : `// 4-directional controls with WASD
if player press d = move 150 x
if player press a = move -150 x
if player press w = move -150 y
if player press s = move 150 y`
    },
    {
      title: isAr ? '3. تصادم وموت بين كائنين (طلب المستخدم)' : '3. Dynamic Collision & Death',
      desc: isAr ? 'اذا سيارة لمس برميل = موت' : 'Entity-to-entity collision & destruction',
      code: isAr 
        ? `// تصادم وموت بين كائنين بأسماء مخصصة
اذا سيارة لمس برميل = موت برميل
اذا لاعب لمس شوك = موت
اذا لاعب لمس نار = اهتزاز كاميرا`
        : `// Collision and death between custom named objects
if car touch barrel = kill barrel
if player touch spike = destroy
if player touch fire = shake camera`
    },
    {
      title: isAr ? '4. الانتقال بين المشاهد والبوابات' : '4. Scene Transitions & Portals',
      desc: isAr ? 'اذا بطل لمس بوابة = تغير مشهد 2' : 'Load new stage upon reaching portal',
      code: isAr 
        ? `// انتقال ذكي بين المراحل
اذا بطل لمس بوابة = تغير مشهد 2
اذا لاعب لمس علم = المشهد التالي
اذا لاعب لمس حمم = اعادة مشهد`
        : `// Scene portal transitions
if hero touch portal = change scene 2
if player touch flag = next scene
if player touch lava = reload scene`
    },
    {
      title: isAr ? '5. عداد نقاط وجمع العملات مع الأصوات' : '5. Score Counter & Coin Sounds',
      desc: isAr ? 'زيادة النقاط وتشغيل نغمة عند جمع النجوم' : 'Increase points and play pickup chimes',
      code: isAr 
        ? `// عداد النقاط والعملات
متغير نقاط = 0
اذا لاعب لمس نجمة = اضف 10 نقاط
اذا لاعب لمس نجمة = شغل صوت عملة
اذا لاعب لمس جوهرة = اضف 50 نقاط`
        : `// Score collection system
variable score = 0
if player touch star = add 10 score
if player touch star = play sound coin
if player touch gem = add 50 score`
    },
    {
      title: isAr ? '6. كاميرا سينمائية ذكية واهتزاز الشاشة' : '6. Cinematic Camera & Screen Shake',
      desc: isAr ? 'تتبع الكائن، واهتزاز الشاشة عند الضرر والتقريب' : 'Track entity, zoom and shake camera on hits',
      code: isAr 
        ? `// كاميرا سينمائية واهتزاز عند التصادم
عند البدء = تابع كاميرا
اذا لاعب اصطدم مع صخرة = اهتزاز كاميرا
اذا لاعب اصطدم مع صخرة = شغل صوت ضربة
اذا لاعب ضغط z = تقريب كاميرا 1.5`
        : `// Cinematic camera setup
on start = camera follow
if player collide rock = shake camera
if player collide rock = play sound hit
if player press z = zoom in camera 1.5`
    },
    {
      title: isAr ? '7. عدو ذكي يطارد اللاعب (AI Monster)' : '7. AI Monster Homing',
      desc: isAr ? 'وحش يتحرك نحو اللاعب ويلحقه في العالم' : 'Enemy pursues player entity continuously',
      code: isAr 
        ? `// ذكاء اصطناعي لمطاردة اللاعب
في كل لحظة = تحرك نحو لاعب
اذا وحش لمس لاعب = موت لاعب
اذا وحش لمس لاعب = رسالة خسارة`
        : `// Enemy AI homing logic
on update = move toward player
if monster touch player = kill player
if monster touch player = lose message`
    },
    {
      title: isAr ? '8. إطلاق ليزر ومقذوفات' : '8. Laser Projectile Shooting',
      desc: isAr ? 'إطلاق مقذوفات ليزر مع مؤثرات صوتية' : 'Fire laser beams with retro sound effect',
      code: isAr 
        ? `// إطلاق الليزر والمؤثرات
اذا مركبة ضغط مسافة = شغل صوت ليزر
اذا ليزر لمس فضائي = موت فضائي
اذا ليزر لمس فضائي = شغل صوت انفجار
اذا ليزر لمس فضائي = اضف 20 نقاط`
        : `// Laser shooting mechanics
if ship press Space = play sound laser
if laser touch alien = kill alien
if laser touch alien = play sound explosion
if laser touch alien = add 20 score`
    }
  ];

  return (
    <div className={`h-full flex flex-col font-sans select-none overflow-hidden ${
      isDark ? 'bg-black text-white' : 'bg-white text-black'
    }`}>
      {/* Top Bar Navigation */}
      <div className={`h-11 px-4 border-b flex items-center justify-between shrink-0 gap-3 ${
        isDark ? 'border-neutral-800 bg-neutral-950' : 'border-neutral-300 bg-neutral-100'
      }`}>
        <div className="flex items-center gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5 px-2 py-0.5 border border-current text-xs font-mono font-black">
            <span>FY3</span>
            <span className="text-[10px] opacity-70">LANGUAGE</span>
          </div>

          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1.5 font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                activeTab === 'editor'
                  ? (isDark ? 'bg-white text-black border-white' : 'bg-black text-white border-black')
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{isAr ? 'كتابة يدوية' : 'Editor'}</span>
            </button>

            <button
              onClick={() => setActiveTab('templates')}
              className={`px-3 py-1.5 font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                activeTab === 'templates'
                  ? (isDark ? 'bg-white text-black border-white' : 'bg-black text-white border-black')
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
              <span>{isAr ? 'كودات جاهزة' : 'Ready Codes'}</span>
            </button>

            <button
              onClick={() => setActiveTab('parsed')}
              className={`px-3 py-1.5 font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                activeTab === 'parsed'
                  ? (isDark ? 'bg-white text-black border-white' : 'bg-black text-white border-black')
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isAr ? 'تفسير الأوامر' : 'Live Inspector'}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                invalidLines.length > 0 
                  ? 'bg-red-500 text-white font-bold'
                  : (isDark ? 'bg-neutral-800 text-white' : 'bg-neutral-200 text-black')
              }`}>
                {parsedLines.filter(l => l.type === 'rule' || l.type === 'variable').length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('docs')}
              className={`px-3 py-1.5 font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                activeTab === 'docs'
                  ? (isDark ? 'bg-white text-black border-white' : 'bg-black text-white border-black')
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{isAr ? 'موسوعة 100+ أمر' : '100+ Commands'}</span>
            </button>

            <button
              onClick={() => setActiveTab('compiled')}
              className={`px-3 py-1.5 font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                activeTab === 'compiled'
                  ? (isDark ? 'bg-white text-black border-white' : 'bg-black text-white border-black')
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>{isAr ? 'كود JS' : 'JS Code'}</span>
            </button>
          </div>
        </div>

        {/* Status / Typo count / Error Alert */}
        <div className="flex items-center gap-2">
          {invalidLines.length > 0 ? (
            <div className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-black border border-red-500 bg-red-500/20 text-red-400 animate-pulse">
              <XCircle className="w-3.5 h-3.5 text-red-400" />
              <span>{invalidLines.length} {isAr ? 'أسطر غير مفهومة (أحمر)' : 'errors'}</span>
            </div>
          ) : detectedTypos.length > 0 ? (
            <div className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-bold border border-yellow-500 bg-yellow-500/10 text-yellow-400">
              <Wand2 className="w-3.5 h-3.5" />
              <span>{detectedTypos.length} {isAr ? 'أخطاء إملائية' : 'typos'}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[11px] font-mono text-green-400">
              <Check className="w-3.5 h-3.5" />
              <span>{isAr ? 'كل الأكواد مفهومة وجاهزة' : 'All Syntax Valid'}</span>
            </div>
          )}
        </div>
      </div>

      {/* INTELLIGENT AUTO-CORRECTOR BANNER */}
      {detectedTypos.length > 0 && activeTab === 'editor' && (
        <div className={`p-3 border-b flex flex-wrap items-center justify-between gap-2.5 ${
          isDark 
            ? 'bg-neutral-900 border-yellow-600/60 text-white' 
            : 'bg-yellow-50 border-yellow-400 text-black'
        }`}>
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="p-1 rounded bg-yellow-500 text-black font-bold">
              <Wand2 className="w-4 h-4" />
            </span>
            <span className="font-bold">
              {isAr ? '💡 مصحح FY3 الذكي اكتشف خطأ إملائي أثناء كتابتك:' : '💡 FY3 Auto-Corrector found typos:'}
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {detectedTypos.slice(0, 4).map((t, idx) => (
                <button
                  key={`${t.original}_${t.lineIndex}_${idx}`}
                  onClick={() => handleFixSingleTypo(t.original, t.replacement, t.lineIndex)}
                  className={`px-2.5 py-1 text-xs font-mono font-bold border transition-transform active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-sm ${
                    isDark 
                      ? 'bg-white text-black border-white hover:bg-neutral-200' 
                      : 'bg-black text-white border-black hover:bg-neutral-800'
                  }`}
                  title={isAr ? `انقر لتصحيح "${t.original}" إلى "${t.replacement}"` : `Fix "${t.original}" to "${t.replacement}"`}
                >
                  <span className="line-through opacity-70">{t.original}</span>
                  <span>➔</span>
                  <span className="underline">{t.replacement}</span>
                  <span className="text-[10px] opacity-75 font-sans">({isAr ? 'سطر' : 'line'} {t.lineIndex + 1})</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleFixAllTypos}
            className="px-3 py-1 text-xs font-bold font-mono border border-current bg-yellow-500 text-black hover:bg-yellow-400 transition-colors cursor-pointer shadow"
          >
            {isAr ? '⚡ تصحيح الكل فوراً' : '⚡ Fix All Typos'}
          </button>
        </div>
      )}

      {/* UNRECOGNIZED SYNTAX ALERT BANNER (CRITICAL USER REQUEST: IF CODE NOT UNDERSTOOD BECOMES RED) */}
      {invalidLines.length > 0 && activeTab === 'editor' && (
        <div className="p-3 border-b bg-red-950/60 border-red-500 text-red-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="p-1 rounded bg-red-500 text-white font-bold">
              <XCircle className="w-4 h-4" />
            </span>
            <span className="font-bold text-red-300">
              {isAr 
                ? `❌ يوجد ${invalidLines.length} سطر غير مفهوم (مُميز باللون الأحمر بالأسفل):` 
                : `❌ ${invalidLines.length} unrecognized lines (highlighted in red below):`}
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {invalidLines.slice(0, 2).map((l) => (
                <span key={l.lineNumber} className="px-2 py-0.5 border border-red-500 bg-red-900/40 text-red-200 font-mono">
                  {isAr ? 'سطر' : 'line'} {l.lineNumber}: "{l.raw}"
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('templates')}
            className="px-3 py-1 text-xs font-bold font-mono border border-red-400 bg-red-600 text-white hover:bg-red-500 transition-colors cursor-pointer"
          >
            {isAr ? '📋 استعراض الأكواد الجاهزة' : '📋 Browse Ready Templates'}
          </button>
        </div>
      )}

      {/* DYNAMIC SCENE ENTITIES TOOLBAR (USER REQUEST: لاعب يمثل اسم كائن اخلي) */}
      {activeTab === 'editor' && (
        <div className={`px-4 py-2 border-b flex items-center gap-2 overflow-x-auto text-xs shrink-0 select-none ${
          isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
        }`}>
          <span className="text-[11px] font-bold opacity-75 shrink-0 flex items-center gap-1 text-blue-400">
            <Layers className="w-3.5 h-3.5" />
            <span>{isAr ? 'كائنات المشهد الحالية:' : 'Scene Entities:'}</span>
          </span>

          {availableObjects.map(obj => (
            <button
              key={obj.id}
              onClick={() => handleInsertSnippet(obj.name)}
              title={isAr ? `إدراج اسم الكائن (${obj.name})` : `Insert entity name (${obj.name})`}
              className={`px-2.5 py-0.5 text-xs font-bold font-mono border transition-all cursor-pointer whitespace-nowrap shrink-0 shadow-sm ${
                isDark 
                  ? 'border-blue-500/50 bg-blue-950/40 text-blue-200 hover:border-blue-400 hover:bg-blue-900/60' 
                  : 'border-blue-400 bg-blue-50 text-blue-800 hover:border-blue-600'
              }`}
            >
              + {obj.name}
            </button>
          ))}

          <span className="opacity-30 mx-1">|</span>

          {/* Quick Keywords Chips */}
          {chips.map(chip => (
            <button
              key={chip.label}
              onClick={() => handleInsertSnippet(chip.insert)}
              className={`px-2.5 py-0.5 text-xs font-mono border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                isDark 
                  ? 'border-neutral-800 hover:border-white bg-neutral-900 text-neutral-300 hover:text-white' 
                  : 'border-neutral-300 hover:border-black bg-white text-neutral-800 hover:text-black'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      {/* TAB 1: MAIN MANUAL SCRIPT WRITING TEXTAREA WITH RED ERROR HIGHLIGHTING */}
      {activeTab === 'editor' && (
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          {/* Main Textarea */}
          <div className="flex-1 flex flex-col h-full relative overflow-hidden">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder={isAr 
                ? `اكتب هنا كود FY3 يدوياً...\nأمثلة:\nاذا سيارة لمس برميل = موت\nاذا بطل لمس بوابة = تغير مشهد 2\nاذا لاعب ضغط سهم_يمين = تحرك 150 x\nاذا لاعب ضغط مسافة = قفز 240\nاذا لاعب اصطدم مع شوك = اهتزاز كاميرا\nمتغير نقاط = 0` 
                : `Type FY3 handwritten script directly...\nExamples:\nif car touch barrel = destroy\nif hero touch portal = change scene 2\nif player press ArrowRight = move 150 x\nif player press Space = jump 240\nif player collide spike = shake camera\nvariable score = 0`}
              spellCheck={false}
              autoCapitalize="none"
              autoComplete="off"
              className={`flex-1 w-full p-4 font-mono text-sm leading-relaxed resize-none outline-none select-text border-none ${
                invalidLines.length > 0
                  ? (isDark ? 'bg-black text-neutral-100 placeholder-neutral-600' : 'bg-white text-neutral-900 placeholder-neutral-400')
                  : (isDark ? 'bg-black text-white placeholder-neutral-600' : 'bg-white text-black placeholder-neutral-400')
              }`}
              style={{ direction: isAr ? 'rtl' : 'ltr' }}
            />

            {/* Quick Templates Drawer at bottom */}
            <div className={`p-2 border-t flex items-center justify-between text-xs shrink-0 ${
              isDark ? 'border-neutral-800 bg-neutral-950' : 'border-neutral-300 bg-neutral-100'
            }`}>
              <div className="flex items-center gap-2 overflow-x-auto">
                <span className="font-bold opacity-60 text-[11px] whitespace-nowrap">
                  {isAr ? '⚡ إدراج كود جاهز:' : '⚡ Quick Insert:'}
                </span>
                {templates.slice(0, 3).map((tpl, i) => (
                  <button
                    key={i}
                    onClick={() => handleInsertSnippet(`\n${tpl.code}`)}
                    className={`px-2.5 py-1 text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                      isDark 
                        ? 'border-neutral-800 hover:border-white bg-neutral-900 text-neutral-300 hover:text-white' 
                        : 'border-neutral-300 hover:border-black bg-white text-neutral-700 hover:text-black'
                    }`}
                  >
                    + {tpl.title}
                  </button>
                ))}
                <button
                  onClick={() => setActiveTab('templates')}
                  className="px-2.5 py-1 text-xs font-bold text-yellow-500 hover:underline cursor-pointer whitespace-nowrap"
                >
                  {isAr ? 'عرض كل الكودات (8) ➔' : 'View all templates ➔'}
                </button>
              </div>

              <div className="text-[11px] font-mono opacity-50 whitespace-nowrap">
                {value.split('\n').length} {isAr ? 'أسطر' : 'lines'}
              </div>
            </div>
          </div>

          {/* Side Mini Inspector Preview (CRITICAL: UNRECOGNIZED LINES SHOWN IN BRIGHT RED) */}
          <div className={`w-full md:w-80 border-t md:border-t-0 md:border-l flex flex-col h-56 md:h-full overflow-hidden ${
            isDark ? 'border-neutral-800 bg-neutral-950' : 'border-neutral-300 bg-neutral-50'
          }`}>
            <div className={`p-2.5 border-b font-bold text-xs flex items-center justify-between ${
              isDark ? 'border-neutral-800 bg-neutral-900' : 'border-neutral-200 bg-neutral-100'
            }`}>
              <span className="flex items-center gap-1.5">
                {invalidLines.length > 0 ? (
                  <XCircle className="w-3.5 h-3.5 text-red-500" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                )}
                <span>{isAr ? 'فحص وتفسير الأوامر' : 'Live Syntax Check'}</span>
              </span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                invalidLines.length > 0 ? 'bg-red-500 text-white' : 'opacity-60'
              }`}>
                {invalidLines.length > 0 ? `${invalidLines.length} خطأ (أحمر)` : `${parsedLines.filter(l => l.valid && (l.type === 'rule' || l.type === 'variable')).length} مفعل`}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2 select-text text-xs">
              {parsedLines.filter(l => l.type !== 'empty').length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 opacity-50">
                  <BookOpen className="w-6 h-6 mb-2" />
                  <p>{isAr ? 'اكتب أوامرك هنا، وإذا كان السطر غير مفهوم سيتحول فوراً إلى اللون الأحمر مع شرح التصحيح.' : 'Type commands to inspect. Invalid lines turn red.'}</p>
                </div>
              ) : (
                parsedLines.filter(l => l.type !== 'empty').map(item => {
                  const isInvalid = !item.valid;
                  return (
                    <div
                      key={item.lineNumber}
                      className={`p-2.5 border text-[11px] font-mono transition-colors ${
                        isInvalid
                          // USER REQUIREMENT: IF CODE NOT UNDERSTOOD BECOMES RED!
                          ? 'border-red-500 bg-red-950/50 text-red-200 font-bold shadow-md animate-pulse'
                          : item.type === 'comment'
                          ? 'opacity-50 border-neutral-700 bg-transparent'
                          : (isDark ? 'border-neutral-800 bg-black text-neutral-200' : 'border-neutral-200 bg-white text-neutral-800')
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1 text-[10px]">
                        <span className={`px-1.5 py-0.2 rounded font-bold ${
                          isInvalid ? 'bg-red-500 text-white' : 'opacity-75'
                        }`}>
                          {isAr ? 'سطر' : 'Line'} {item.lineNumber}
                        </span>
                        <span className={`font-bold ${isInvalid ? 'text-red-400' : 'text-neutral-400'}`}>
                          {isInvalid ? (isAr ? '❌ غير مفهوم' : '❌ Syntax Error') : `✓ ${item.type}`}
                        </span>
                      </div>

                      <div className={`font-bold mb-1 truncate ${isInvalid ? 'text-red-300 underline' : 'text-white'}`} title={item.raw}>
                        {item.raw}
                      </div>

                      <div className={`text-[10px] font-sans ${isInvalid ? 'text-red-300 font-semibold mt-1' : 'text-green-400'}`}>
                        {isAr ? item.explanationAr : item.explanationEn}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: READY CODES LIBRARY (كودات جاهزة اكدر استخدمه مثل حركة لاعب) */}
      {activeTab === 'templates' && (
        <div className="flex-1 overflow-y-auto p-6 space-y-6 select-text">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className={`p-4 border ${isDark ? 'border-white/30 bg-neutral-950' : 'border-black/30 bg-neutral-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                  <span>{isAr ? 'مكتبة الكودات الجاهزة للاستخدام الفوري' : 'Ready-to-Use Code Library'}</span>
                </h3>
                <button
                  onClick={() => setActiveTab('editor')}
                  className={`px-3 py-1 text-xs font-bold border transition-colors cursor-pointer ${
                    isDark ? 'border-white bg-white text-black' : 'border-black bg-black text-white'
                  }`}
                >
                  {isAr ? 'العودة للمحرر' : 'Back to Editor'}
                </button>
              </div>
              <p className="text-xs opacity-80 leading-relaxed">
                {isAr 
                  ? 'مجموعة متكاملة من الأكواد الجاهزة (حركة لاعب، تصادم وموت، انتقال بين المشاهد، كاميرا ذكية، جمع نقاط، أصوات) يمكنك إدراجها بضغطة زر واحدة والتعديل عليها.' 
                  : 'Prebuilt code scripts you can insert with one click and customize freely.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((tpl, idx) => (
                <div
                  key={idx}
                  className={`p-4 border flex flex-col justify-between transition-colors ${
                    isDark ? 'border-neutral-800 bg-neutral-900/40 hover:border-neutral-600' : 'border-neutral-300 bg-white hover:border-neutral-500'
                  }`}
                >
                  <div>
                    <h4 className="font-bold text-sm mb-1">{tpl.title}</h4>
                    <p className="text-xs opacity-70 mb-3">{tpl.desc}</p>
                    <pre className={`p-3 font-mono text-xs overflow-x-auto border mb-3 select-text ${
                      isDark ? 'bg-black border-neutral-800 text-neutral-200' : 'bg-neutral-100 border-neutral-300 text-neutral-800'
                    }`}>
                      {tpl.code}
                    </pre>
                  </div>

                  <button
                    onClick={() => {
                      handleInsertSnippet(`\n${tpl.code}`);
                      setActiveTab('editor');
                    }}
                    className={`w-full py-2 text-xs font-bold font-mono border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      isDark 
                        ? 'border-white bg-white text-black hover:bg-neutral-200' 
                        : 'border-black bg-black text-white hover:bg-neutral-800'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                    <span>{isAr ? 'إدراج هذا الكود في مشروعي' : 'Insert Code into Project'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 100+ COMMANDS SEARCHABLE ENCYCLOPEDIA */}
      {activeTab === 'docs' && (
        <div className="flex-1 flex flex-col overflow-hidden p-6 select-text">
          <div className="max-w-4xl w-full mx-auto flex flex-col h-full space-y-4">
            {/* Header and Search */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-yellow-500" />
                  <span>{isAr ? 'موسوعة أوامر لغة FY3 (حوالي 100 أمر)' : 'FY3 100+ Commands Encyclopedia'}</span>
                </h3>
                <p className="text-xs opacity-70">
                  {isAr 
                    ? 'دليل شامل لكل الأوامر: الكاميرا، الحركة، التصادم، المشاهد، الأصوات، الأنميشن، والمتغيرات.'
                    : 'Complete command manual for camera, physics, collisions, scenes, audio, and variables.'}
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute right-3 top-2.5 opacity-50 pointer-events-none" />
                <input
                  type="text"
                  value={searchDocQuery}
                  onChange={(e) => setSearchDocQuery(e.target.value)}
                  placeholder={isAr ? 'ابحث في الـ 100 أمر...' : 'Search commands...'}
                  className={`w-full pr-9 pl-3 py-1.5 text-xs border outline-none font-mono ${
                    isDark ? 'bg-black border-neutral-700 text-white' : 'bg-white border-neutral-300 text-black'
                  }`}
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs shrink-0 pb-1">
              {[
                { id: 'all', label: isAr ? 'الكل (100+)' : 'All' },
                { id: 'camera', label: isAr ? 'الكاميرا' : 'Camera' },
                { id: 'movement', label: isAr ? 'الحركة والفيزياء' : 'Movement' },
                { id: 'entity', label: isAr ? 'الكائنات والمظهر' : 'Entities' },
                { id: 'scenes', label: isAr ? 'المشاهد والمراحل' : 'Scenes' },
                { id: 'audio', label: isAr ? 'الأصوات والمؤثرات' : 'Audio' },
                { id: 'animation', label: isAr ? 'استوديو الأنميشن' : 'Animation' },
                { id: 'variables', label: isAr ? 'المتغيرات والنقاط' : 'Variables' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedDocCategory(cat.id)}
                  className={`px-3 py-1 text-xs font-bold border transition-colors cursor-pointer whitespace-nowrap ${
                    selectedDocCategory === cat.id
                      ? (isDark ? 'bg-white text-black border-white' : 'bg-black text-white border-black')
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Commands Cards Grid */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {filteredCommands.length === 0 ? (
                <div className="p-8 text-center opacity-60 text-xs">
                  {isAr ? 'لم يتم العثور على أوامر مطابقة للبحث.' : 'No matching commands found.'}
                </div>
              ) : (
                filteredCommands.map(cmd => (
                  <div
                    key={cmd.id}
                    className={`p-3.5 border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isDark ? 'border-neutral-800 bg-neutral-900/30' : 'border-neutral-300 bg-white'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-black px-2 py-0.5 border border-current bg-black/20">
                          {isAr ? cmd.syntaxAr : cmd.syntaxEn}
                        </span>
                        <span className="text-[10px] opacity-60 font-mono">
                          [{isAr ? cmd.categoryAr : cmd.categoryEn}]
                        </span>
                      </div>
                      <p className="text-xs opacity-80">
                        {isAr ? cmd.descAr : cmd.descEn}
                      </p>
                      <div className="text-[11px] font-mono opacity-60">
                        {isAr ? 'مثال:' : 'Example:'} <code className="text-neutral-300 font-bold">{isAr ? cmd.exampleAr : cmd.exampleEn}</code>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        handleInsertSnippet(`\n${isAr ? cmd.exampleAr : cmd.exampleEn}`);
                        setActiveTab('editor');
                      }}
                      className={`px-3 py-1.5 text-xs font-bold font-mono border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                        isDark 
                          ? 'border-neutral-700 bg-neutral-800 hover:border-white text-neutral-200 hover:text-white' 
                          : 'border-neutral-300 bg-neutral-100 hover:border-black text-neutral-800 hover:text-black'
                      }`}
                    >
                      + {isAr ? 'إدراج الأمر' : 'Insert Command'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DETAILED LIVE PARSED RULES INSPECTOR (RED FOR INVALID) */}
      {activeTab === 'parsed' && (
        <div className="flex-1 overflow-y-auto p-6 space-y-4 select-text">
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">
                  {isAr ? 'فحص وتفسير الأوامر البرمجية' : 'Parsed Rules Inspector'}
                </h3>
                <p className="text-xs opacity-60">
                  {isAr ? 'الأسطر الصحيحة تظهر بعلامة صح خضراء، والأسطر غير المفهومة تظهر باللون الأحمر الفاقع' : 'Valid lines are green; unrecognized lines are red.'}
                </p>
              </div>

              <button
                onClick={() => setActiveTab('editor')}
                className={`px-3 py-1.5 text-xs font-bold border transition-colors cursor-pointer ${
                  isDark ? 'border-white bg-white text-black' : 'border-black bg-black text-white'
                }`}
              >
                {isAr ? 'العودة للمحرر' : 'Back to Editor'}
              </button>
            </div>

            <div className="space-y-3">
              {parsedLines.map(line => {
                const isInvalid = !line.valid;
                return (
                  <div
                    key={line.lineNumber}
                    className={`p-3.5 border flex items-start gap-3 transition-colors ${
                      isInvalid
                        // USER REQUIREMENT: IF CODE NOT UNDERSTOOD BECOMES RED!
                        ? 'border-red-500 bg-red-950/40 text-red-200 font-bold shadow-md'
                        : line.type === 'empty'
                        ? 'opacity-40 border-dashed'
                        : (isDark ? 'border-neutral-800 bg-neutral-950' : 'border-neutral-300 bg-neutral-50')
                    }`}
                  >
                    <span className={`font-mono text-xs px-2 py-0.5 border shrink-0 ${
                      isInvalid ? 'border-red-500 bg-red-600 text-white font-bold' : 'border-current opacity-50'
                    }`}>
                      {line.lineNumber}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className={`font-mono text-xs font-bold mb-1 ${isInvalid ? 'text-red-300 underline' : ''}`}>
                        {line.raw || <span className="italic opacity-40">{isAr ? '(سطر فارغ)' : '(empty line)'}</span>}
                      </div>
                      {line.raw && (
                        <div className={`text-xs flex items-center gap-1.5 ${isInvalid ? 'text-red-300 font-semibold' : 'opacity-80'}`}>
                          {isInvalid ? (
                            <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                          )}
                          <span>{isAr ? line.explanationAr : line.explanationEn}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: COMPILED JAVASCRIPT CODE */}
      {activeTab === 'compiled' && (
        <div className="flex-1 flex flex-col overflow-hidden p-4">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <div>
              <h4 className="font-bold text-xs">
                {isAr ? 'كود JavaScript المولد تلقائياً من لغة FY3:' : 'JavaScript Code Automatically Generated by FY3:'}
              </h4>
              <p className="text-[11px] opacity-60">
                {isAr ? 'هذا الكود هو ما ينفذه المحرك بسرعة 60 إطار بالثانية' : 'This code runs inside the high-performance runtime loop'}
              </p>
            </div>

            <button
              onClick={handleCopyCode}
              className={`px-3 py-1 text-xs font-mono font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                isDark ? 'border-neutral-700 bg-neutral-900 hover:border-white' : 'border-neutral-300 bg-white hover:border-black'
              }`}
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ الكود' : 'Copy JS')}</span>
            </button>
          </div>

          <pre className={`flex-1 p-4 font-mono text-xs overflow-auto border select-text ${
            isDark ? 'bg-neutral-950 border-neutral-800 text-neutral-300' : 'bg-neutral-50 border-neutral-300 text-neutral-800'
          }`}>
            {compiledJS}
          </pre>
        </div>
      )}
    </div>
  );
};
