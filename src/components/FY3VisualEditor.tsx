import { useState } from 'react';
import { 
  FY3ScriptData, 
  FY3Rule, 
  FY3Action, 
  FY3Variable, 
  FY3EventTrigger, 
  FY3ActionType, 
  GameObject, 
  GameScene 
} from '../types/engine';
import { Language, ThemeMode } from '../utils/i18n';
import { compileFY3ToJS } from '../engine/fy3Compiler';
import { 
  Plus, 
  Trash2, 
  Eye, 
  Code, 
  Check, 
  Copy, 
  Sparkles,
  Zap,
  Sliders,
  Play
} from 'lucide-react';

interface FY3VisualEditorProps {
  scriptData?: FY3ScriptData;
  onChange: (updated: FY3ScriptData) => void;
  availableObjects: GameObject[];
  currentObjectName?: string;
  scenes?: GameScene[];
  language: Language;
  theme: ThemeMode;
}

export const FY3VisualEditor = ({
  scriptData,
  onChange,
  availableObjects,
  currentObjectName,
  scenes = [],
  language,
  theme
}: FY3VisualEditorProps) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'variables' | 'compiledCode'>('rules');
  const [copiedCode, setCopiedCode] = useState(false);

  const isAr = language === 'ar';

  const data: FY3ScriptData = scriptData && (scriptData.variables || scriptData.rules) 
    ? scriptData 
    : { variables: [], rules: [] };

  const compiledJS = compileFY3ToJS(data, currentObjectName);

  // Translations dictionary for FY3 terms
  const t = {
    title: isAr ? 'لغة البرمجة المرئية FY3' : 'FY3 Visual Programming Language',
    rulesTab: isAr ? 'القواعد والشروط' : 'Rules & Conditions',
    variablesTab: isAr ? 'المتغيرات' : 'Variables',
    codeTab: isAr ? 'كود JS المُصرف' : 'Compiled JS Code',
    addRule: isAr ? 'إضافة شرط / قاعدة جديدة' : 'Add Rule / Condition',
    addVariable: isAr ? 'إضافة متغير جديد' : 'Add New Variable',
    emptyRules: isAr ? 'لا توجد قواعد بعد. أضف أول قاعدة برمجية للتحكم في الكائن.' : 'No rules yet. Add your first visual rule.',
    emptyVars: isAr ? 'لا توجد متغيرات محددة لهذا الكائن.' : 'No variables defined yet.',
    variableName: isAr ? 'اسم المتغير' : 'Variable Name',
    variableType: isAr ? 'النوع' : 'Type',
    variableValue: isAr ? 'القيمة الابتدائية' : 'Initial Value',
    number: isAr ? 'رقم' : 'Number',
    string: isAr ? 'نص' : 'String',
    boolean: isAr ? 'منطقي (صح/خطأ)' : 'Boolean',
    ruleWhen: isAr ? 'إذا / عندما' : 'When / If',
    ruleThen: isAr ? 'نفّذ الإجراءات التالية:' : 'Then Execute Actions:',
    addAction: isAr ? 'إضافة إجراء' : 'Add Action',
    deleteRule: isAr ? 'حذف القاعدة' : 'Delete Rule',
    duplicateRule: isAr ? 'تكرار' : 'Duplicate',
    ruleTemplates: isAr ? 'قوالب سريعة جاهزة:' : 'Quick Templates:',
    tplCollisionScene: isAr ? 'تصادم كائن والانتقال لمشهد' : 'Collision -> Next Scene',
    tplClickMove: isAr ? 'ضغط اللاعب وتحريك الكائن' : 'Player Click -> Move X',
    tplArrowKeys: isAr ? 'حركة يمين بضغط مفتاح السهم' : 'Key Pressed -> Move X',
    copyCode: isAr ? 'نسخ الكود المصرف' : 'Copy Compiled JS',
    targetObject: isAr ? 'الكائن المستهدف' : 'Target Object',
    selfObject: isAr ? 'هذا الكائن الحالي' : 'This Current Object',
    anyObject: isAr ? 'أي كائن' : 'Any Object',
    conditionOptional: isAr ? 'شرط إضافي للمتغيرات (اختياري)' : 'Variable Condition (Optional)',
    varOperator: isAr ? 'المقارنة' : 'Operator',
    varTargetVal: isAr ? 'القيمة المقارنة' : 'Target Value',
  };

  const triggerOptions: { id: FY3EventTrigger; label: string }[] = [
    { id: 'on_collision', label: isAr ? 'إذا تصادم الكائن مع كائن آخر' : 'When object collides with another object' },
    { id: 'on_click', label: isAr ? 'إذا ضغط اللاعب على الكائن بالماوس' : 'When player clicks on the object' },
    { id: 'on_key_down', label: isAr ? 'إذا ضغط اللاعب على زر في لوحة المفاتيح' : 'When player presses keyboard key' },
    { id: 'on_start', label: isAr ? 'عند بدء تشغيل اللعبة' : 'On game start' },
    { id: 'on_update', label: isAr ? 'في كل لحظة تحديث (Frame Update)' : 'On every frame update' },
  ];

  const actionOptions: { id: FY3ActionType; label: string }[] = [
    { id: 'move_x', label: isAr ? 'تحرك بمحور X (أفقي)' : 'Move on X axis (Horizontal)' },
    { id: 'move_y', label: isAr ? 'تحرك بمحور Y (عمودي)' : 'Move on Y axis (Vertical)' },
    { id: 'set_pos', label: isAr ? 'تعيين الموقع (X, Y)' : 'Set Position (X, Y)' },
    { id: 'change_scene', label: isAr ? 'انتقل إلى مشهد ثاني' : 'Transition to another Scene' },
    { id: 'play_sound', label: isAr ? 'تشغيل صوت ومؤثر صوتي' : 'Play Sound Effect' },
    { id: 'play_animation', label: isAr ? 'تشغيل أنميشن كائن' : 'Play Sprite Animation' },
    { id: 'add_score', label: isAr ? 'إضافة نقاط إلى النتيجة' : 'Add Points to Score' },
    { id: 'change_variable', label: isAr ? 'تعديل متغير (زيادة / إنقاص)' : 'Modify Variable (+ / -)' },
    { id: 'set_variable', label: isAr ? 'تعيين قيمة لمتغير' : 'Set Variable Value' },
    { id: 'camera_follow', label: isAr ? 'جعل الكاميرا تتبع الكائن' : 'Make Camera Follow Object' },
    { id: 'change_visibility', label: isAr ? 'تغيير الرؤية (إظهار / إخفاء)' : 'Change Visibility (Show/Hide)' },
    { id: 'draw_text', label: isAr ? 'رسم نص على الشاشة' : 'Draw Text on Screen' },
  ];

  const keyCodesList = [
    { code: 'ArrowRight', label: isAr ? 'السهم الأيمن (Right Arrow)' : 'Right Arrow' },
    { code: 'ArrowLeft', label: isAr ? 'السهم الأيسر (Left Arrow)' : 'Left Arrow' },
    { code: 'ArrowUp', label: isAr ? 'السهم للأعلى (Up Arrow)' : 'Up Arrow' },
    { code: 'ArrowDown', label: isAr ? 'السهم للأسفل (Down Arrow)' : 'Down Arrow' },
    { code: 'Space', label: isAr ? 'المسافة (Spacebar)' : 'Spacebar' },
    { code: 'KeyD', label: isAr ? 'مفتاح D (حركة يمين)' : 'Key D' },
    { code: 'KeyA', label: isAr ? 'مفتاح A (حركة يسار)' : 'Key A' },
    { code: 'KeyW', label: isAr ? 'مفتاح W (قفز / فوق)' : 'Key W' },
    { code: 'KeyS', label: isAr ? 'مفتاح S (نزول / تحت)' : 'Key S' },
  ];

  // Helper to update state
  const updateData = (updater: (prev: FY3ScriptData) => FY3ScriptData) => {
    const updated = updater(data);
    onChange(updated);
  };

  // Variable handlers
  const handleAddVariable = () => {
    const newVar: FY3Variable = {
      id: 'var_' + Math.random().toString(36).substring(2, 9),
      name: `متغير_${data.variables.length + 1}`,
      type: 'number',
      value: 0
    };
    updateData(prev => ({
      ...prev,
      variables: [...prev.variables, newVar]
    }));
  };

  const handleUpdateVariable = (id: string, partial: Partial<FY3Variable>) => {
    updateData(prev => ({
      ...prev,
      variables: prev.variables.map(v => v.id === id ? { ...v, ...partial } : v)
    }));
  };

  const handleDeleteVariable = (id: string) => {
    updateData(prev => ({
      ...prev,
      variables: prev.variables.filter(v => v.id !== id)
    }));
  };

  // Rules handlers
  const handleAddRule = () => {
    const newRule: FY3Rule = {
      id: 'rule_' + Math.random().toString(36).substring(2, 9),
      enabled: true,
      trigger: 'on_key_down',
      keyCode: 'ArrowRight',
      actions: [
        {
          id: 'act_' + Math.random().toString(36).substring(2, 9),
          type: 'move_x',
          params: { speed: 150 }
        }
      ]
    };
    updateData(prev => ({
      ...prev,
      rules: [...prev.rules, newRule]
    }));
  };

  const handleUpdateRule = (ruleId: string, partial: Partial<FY3Rule>) => {
    updateData(prev => ({
      ...prev,
      rules: prev.rules.map(r => r.id === ruleId ? { ...r, ...partial } : r)
    }));
  };

  const handleDeleteRule = (ruleId: string) => {
    updateData(prev => ({
      ...prev,
      rules: prev.rules.filter(r => r.id !== ruleId)
    }));
  };

  // Actions within a rule
  const handleAddAction = (ruleId: string) => {
    const newAction: FY3Action = {
      id: 'act_' + Math.random().toString(36).substring(2, 9),
      type: 'move_x',
      params: { speed: 100 }
    };
    updateData(prev => ({
      ...prev,
      rules: prev.rules.map(r => {
        if (r.id !== ruleId) return r;
        return {
          ...r,
          actions: [...r.actions, newAction]
        };
      })
    }));
  };

  const handleUpdateAction = (ruleId: string, actionId: string, partial: Partial<FY3Action>) => {
    updateData(prev => ({
      ...prev,
      rules: prev.rules.map(r => {
        if (r.id !== ruleId) return r;
        return {
          ...r,
          actions: r.actions.map(a => a.id === actionId ? { ...a, ...partial } : a)
        };
      })
    }));
  };

  const handleDeleteAction = (ruleId: string, actionId: string) => {
    updateData(prev => ({
      ...prev,
      rules: prev.rules.map(r => {
        if (r.id !== ruleId) return r;
        return {
          ...r,
          actions: r.actions.filter(a => a.id !== actionId)
        };
      })
    }));
  };

  // Quick Templates as requested by user:
  // 1. إذا كائن تصادم مع كائن = انتقل إلى مشهد ثاني
  const applyTemplateCollisionScene = () => {
    const targetScene = scenes[1]?.name || 'المشهد 2';
    const otherObj = availableObjects.find(o => o.name !== currentObjectName)?.name || 'البوابة';
    const rule: FY3Rule = {
      id: 'rule_' + Math.random().toString(36).substring(2, 9),
      enabled: true,
      trigger: 'on_collision',
      collideWithObjectId: otherObj,
      actions: [
        {
          id: 'act_' + Math.random().toString(36).substring(2, 9),
          type: 'change_scene',
          params: { sceneName: targetScene }
        },
        {
          id: 'act_' + Math.random().toString(36).substring(2, 9),
          type: 'play_sound',
          params: { soundType: 'powerup' }
        }
      ]
    };
    updateData(prev => ({
      ...prev,
      rules: [...prev.rules, rule]
    }));
  };

  // 2. إذا لاعب ضغط (اسم كائن) = تحرك كائن بسرعة 100 بمحور x
  const applyTemplateClickMove = () => {
    const rule: FY3Rule = {
      id: 'rule_' + Math.random().toString(36).substring(2, 9),
      enabled: true,
      trigger: 'on_click',
      targetObjectId: currentObjectName || '',
      actions: [
        {
          id: 'act_' + Math.random().toString(36).substring(2, 9),
          type: 'move_x',
          params: { speed: 100, targetObjectName: currentObjectName }
        },
        {
          id: 'act_' + Math.random().toString(36).substring(2, 9),
          type: 'play_sound',
          params: { soundType: 'jump' }
        }
      ]
    };
    updateData(prev => ({
      ...prev,
      rules: [...prev.rules, rule]
    }));
  };

  // 3. حركة بالأسهم
  const applyTemplateArrowKeys = () => {
    const ruleRight: FY3Rule = {
      id: 'rule_' + Math.random().toString(36).substring(2, 9),
      enabled: true,
      trigger: 'on_key_down',
      keyCode: 'ArrowRight',
      actions: [
        {
          id: 'act_' + Math.random().toString(36).substring(2, 9),
          type: 'move_x',
          params: { speed: 180 }
        }
      ]
    };
    const ruleLeft: FY3Rule = {
      id: 'rule_' + Math.random().toString(36).substring(2, 9),
      enabled: true,
      trigger: 'on_key_down',
      keyCode: 'ArrowLeft',
      actions: [
        {
          id: 'act_' + Math.random().toString(36).substring(2, 9),
          type: 'move_x',
          params: { speed: -180 }
        }
      ]
    };
    updateData(prev => ({
      ...prev,
      rules: [...prev.rules, ruleRight, ruleLeft]
    }));
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(compiledJS);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const isDark = theme === 'dark';

  return (
    <div className={`w-full h-full flex flex-col font-sans select-none overflow-hidden ${
      isDark ? 'bg-black text-white' : 'bg-white text-black'
    }`}>
      {/* Top FY3 Sub-Header */}
      <div className={`flex flex-wrap items-center justify-between px-3 py-2 border-b text-xs gap-2 ${
        isDark ? 'border-neutral-800 bg-neutral-950' : 'border-neutral-300 bg-neutral-100'
      }`}>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 font-mono font-black text-xs border ${
            isDark ? 'bg-white text-black border-white' : 'bg-black text-white border-black'
          }`}>
            FY3
          </span>
          <span className="font-bold text-xs">{t.title}</span>
          {currentObjectName && (
            <span className="text-[11px] opacity-70 font-mono border border-current px-1.5 py-0.2">
              {currentObjectName}
            </span>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 border border-neutral-700 p-0.5">
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-3 py-1 font-bold text-xs transition-colors cursor-pointer ${
              activeTab === 'rules'
                ? (isDark ? 'bg-white text-black' : 'bg-black text-white')
                : (isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-black')
            }`}
          >
            {t.rulesTab} ({data.rules.length})
          </button>
          <button
            onClick={() => setActiveTab('variables')}
            className={`px-3 py-1 font-bold text-xs transition-colors cursor-pointer ${
              activeTab === 'variables'
                ? (isDark ? 'bg-white text-black' : 'bg-black text-white')
                : (isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-black')
            }`}
          >
            {t.variablesTab} ({data.variables.length})
          </button>
          <button
            onClick={() => setActiveTab('compiledCode')}
            className={`px-2.5 py-1 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer ${
              activeTab === 'compiledCode'
                ? (isDark ? 'bg-white text-black' : 'bg-black text-white')
                : (isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-black')
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>{t.codeTab}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* TAB 1: RULES & CONDITIONS */}
        {activeTab === 'rules' && (
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Quick Templates Bar */}
            <div className={`p-3 border text-xs flex flex-wrap items-center justify-between gap-2 ${
              isDark ? 'border-neutral-800 bg-neutral-900/60' : 'border-neutral-300 bg-neutral-50'
            }`}>
              <div className="flex items-center gap-1.5 font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t.ruleTemplates}</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={applyTemplateCollisionScene}
                  className={`border px-2.5 py-1 transition-colors cursor-pointer text-[11px] font-medium ${
                    isDark ? 'border-neutral-700 hover:border-white bg-black' : 'border-neutral-400 hover:border-black bg-white'
                  }`}
                  title={isAr ? 'إذا تصادم كائن مع كائن = انتقل إلى مشهد ثاني' : 'When object collides with object -> Next scene'}
                >
                  + {t.tplCollisionScene}
                </button>
                <button
                  onClick={applyTemplateClickMove}
                  className={`border px-2.5 py-1 transition-colors cursor-pointer text-[11px] font-medium ${
                    isDark ? 'border-neutral-700 hover:border-white bg-black' : 'border-neutral-400 hover:border-black bg-white'
                  }`}
                  title={isAr ? 'إذا لاعب ضغط (كائن) = تحرك كائن بسرعة 100 بمحور x' : 'When player clicks object -> Move on X'}
                >
                  + {t.tplClickMove}
                </button>
                <button
                  onClick={applyTemplateArrowKeys}
                  className={`border px-2.5 py-1 transition-colors cursor-pointer text-[11px] font-medium ${
                    isDark ? 'border-neutral-700 hover:border-white bg-black' : 'border-neutral-400 hover:border-black bg-white'
                  }`}
                >
                  + {t.tplArrowKeys}
                </button>
              </div>
            </div>

            {/* Rules List */}
            {data.rules.length === 0 ? (
              <div className={`text-center py-12 border border-dashed ${
                isDark ? 'border-neutral-800 text-neutral-500' : 'border-neutral-300 text-neutral-600'
              }`}>
                <Zap className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium mb-3">{t.emptyRules}</p>
                <button
                  onClick={handleAddRule}
                  className={`border px-4 py-1.5 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer ${
                    isDark ? 'border-white bg-white text-black hover:bg-neutral-200' : 'border-black bg-black text-white hover:bg-neutral-800'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t.addRule}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {data.rules.map((rule, ruleIdx) => (
                  <div
                    key={rule.id}
                    className={`border transition-all ${
                      rule.enabled !== false 
                        ? (isDark ? 'border-neutral-700 bg-neutral-950' : 'border-neutral-400 bg-white')
                        : 'border-neutral-800 opacity-60'
                    }`}
                  >
                    {/* Rule Header: WHEN / IF */}
                    <div className={`p-3 border-b flex flex-wrap items-center justify-between gap-2 ${
                      isDark ? 'border-neutral-800 bg-neutral-900/80' : 'border-neutral-300 bg-neutral-100'
                    }`}>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 font-mono text-[11px] font-black border ${
                          isDark ? 'bg-white text-black border-white' : 'bg-black text-white border-black'
                        }`}>
                          {isAr ? `قاعدة ${ruleIdx + 1}` : `RULE #${ruleIdx + 1}`}
                        </span>

                        <span className="font-bold text-xs">{t.ruleWhen}</span>

                        {/* Trigger Selection */}
                        <select
                          value={rule.trigger}
                          onChange={(e) => handleUpdateRule(rule.id, { trigger: e.target.value as FY3EventTrigger })}
                          className={`border px-2 py-1 text-xs font-medium outline-none cursor-pointer ${
                            isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-white border-neutral-400 text-black'
                          }`}
                        >
                          {triggerOptions.map(opt => (
                            <option key={opt.id} value={opt.id}>{opt.label}</option>
                          ))}
                        </select>

                        {/* Trigger Specific Parameters */}
                        {rule.trigger === 'on_key_down' && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] opacity-70">
                              {isAr ? 'الزر:' : 'Key:'}
                            </span>
                            <select
                              value={rule.keyCode || 'ArrowRight'}
                              onChange={(e) => handleUpdateRule(rule.id, { keyCode: e.target.value })}
                              className={`border px-2 py-1 text-xs outline-none cursor-pointer font-mono ${
                                isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-white border-neutral-400 text-black'
                              }`}
                            >
                              {keyCodesList.map(k => (
                                <option key={k.code} value={k.code}>{k.label}</option>
                              ))}
                            </select>
                          </div>
                        )}

                        {rule.trigger === 'on_collision' && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] opacity-70">
                              {isAr ? 'الكائن الآخر:' : 'Target:'}
                            </span>
                            <select
                              value={rule.collideWithObjectId || ''}
                              onChange={(e) => handleUpdateRule(rule.id, { collideWithObjectId: e.target.value })}
                              className={`border px-2 py-1 text-xs outline-none cursor-pointer ${
                                isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-white border-neutral-400 text-black'
                              }`}
                            >
                              <option value="">{t.anyObject}</option>
                              {availableObjects.map(obj => (
                                <option key={obj.id} value={obj.name}>{obj.name}</option>
                              ))}
                            </select>
                          </div>
                        )}

                        {rule.trigger === 'on_click' && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] opacity-70">
                              {isAr ? 'الهدف:' : 'Target:'}
                            </span>
                            <select
                              value={rule.targetObjectId || ''}
                              onChange={(e) => handleUpdateRule(rule.id, { targetObjectId: e.target.value })}
                              className={`border px-2 py-1 text-xs outline-none cursor-pointer ${
                                isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-white border-neutral-400 text-black'
                              }`}
                            >
                              <option value="">{t.selfObject}</option>
                              {availableObjects.map(obj => (
                                <option key={obj.id} value={obj.name}>{obj.name}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>

                      {/* Rule Actions Bar (Enable toggle & delete) */}
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1 text-[11px] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={rule.enabled !== false}
                            onChange={(e) => handleUpdateRule(rule.id, { enabled: e.target.checked })}
                            className="cursor-pointer"
                          />
                          <span>{isAr ? 'مفعلة' : 'Active'}</span>
                        </label>

                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          title={t.deleteRule}
                          className={`p-1 border transition-colors cursor-pointer text-neutral-400 hover:text-white ${
                            isDark ? 'border-neutral-800 hover:border-neutral-600' : 'border-neutral-300 hover:border-black hover:text-black'
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Rule Body: Optional Condition + Actions */}
                    <div className="p-3 space-y-3">
                      {/* Optional Condition Row */}
                      <div className={`p-2 border text-xs flex flex-wrap items-center gap-2 ${
                        isDark ? 'border-neutral-800/80 bg-neutral-900/40' : 'border-neutral-200 bg-neutral-50'
                      }`}>
                        <span className="font-semibold text-[11px] flex items-center gap-1 opacity-80">
                          <Sliders className="w-3 h-3" />
                          <span>{t.conditionOptional}:</span>
                        </span>

                        <select
                          value={rule.condition?.varName || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (!val) {
                              handleUpdateRule(rule.id, { condition: undefined });
                            } else {
                              handleUpdateRule(rule.id, {
                                condition: {
                                  varName: val,
                                  operator: rule.condition?.operator || '==',
                                  value: rule.condition?.value ?? 0
                                }
                              });
                            }
                          }}
                          className={`border px-2 py-0.5 text-xs outline-none cursor-pointer ${
                            isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-white border-neutral-300 text-black'
                          }`}
                        >
                          <option value="">{isAr ? 'بدون شرط (دائماً)' : 'No condition (Always)'}</option>
                          {data.variables.map(v => (
                            <option key={v.id} value={v.name}>{v.name}</option>
                          ))}
                        </select>

                        {rule.condition?.varName && (
                          <>
                            <select
                              value={rule.condition.operator}
                              onChange={(e) => handleUpdateRule(rule.id, {
                                condition: { ...rule.condition!, operator: e.target.value as any }
                              })}
                              className={`border px-2 py-0.5 text-xs font-mono outline-none cursor-pointer ${
                                isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-white border-neutral-300 text-black'
                              }`}
                            >
                              <option value="==">== (يساوي)</option>
                              <option value="!=">!= (لا يساوي)</option>
                              <option value=">">&gt; (أكبر من)</option>
                              <option value="<">&lt; (أصغر من)</option>
                              <option value=">=">&gt;= (أكبر أو يساوي)</option>
                              <option value="<=">&lt;= (أصغر أو يساوي)</option>
                            </select>

                            <input
                              type="text"
                              value={String(rule.condition.value ?? '')}
                              onChange={(e) => {
                                const raw = e.target.value;
                                const parsed = !isNaN(Number(raw)) && raw.trim() !== '' ? Number(raw) : raw;
                                handleUpdateRule(rule.id, {
                                  condition: { ...rule.condition!, value: parsed }
                                });
                              }}
                              placeholder={t.varTargetVal}
                              className={`border px-2 py-0.5 text-xs outline-none w-24 font-mono ${
                                isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-white border-neutral-300 text-black'
                              }`}
                            />
                          </>
                        )}
                      </div>

                      {/* THEN: Actions List */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold">{t.ruleThen}</span>
                          <button
                            onClick={() => handleAddAction(rule.id)}
                            className={`border px-2 py-1 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                              isDark ? 'border-neutral-700 hover:border-white bg-black' : 'border-neutral-300 hover:border-black bg-white'
                            }`}
                          >
                            <Plus className="w-3 h-3" />
                            <span>{t.addAction}</span>
                          </button>
                        </div>

                        {rule.actions.length === 0 ? (
                          <div className="text-xs opacity-50 py-2 italic text-center">
                            {isAr ? 'لم تتم إضافة أي إجراء بعد لهذه القاعدة.' : 'No actions added yet.'}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {rule.actions.map((act) => (
                              <div
                                key={act.id}
                                className={`p-2.5 border text-xs flex flex-wrap items-center justify-between gap-2 ${
                                  isDark ? 'border-neutral-800 bg-neutral-900/60' : 'border-neutral-300 bg-neutral-50'
                                }`}
                              >
                                <div className="flex flex-wrap items-center gap-2">
                                  {/* Action Type */}
                                  <select
                                    value={act.type}
                                    onChange={(e) => handleUpdateAction(rule.id, act.id, {
                                      type: e.target.value as FY3ActionType,
                                      params: {}
                                    })}
                                    className={`border px-2 py-1 text-xs font-medium outline-none cursor-pointer ${
                                      isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-white border-neutral-400 text-black'
                                    }`}
                                  >
                                    {actionOptions.map(opt => (
                                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                                    ))}
                                  </select>

                                  {/* Action-Specific Inputs */}
                                  {(act.type === 'move_x' || act.type === 'move_y') && (
                                    <div className="flex items-center gap-1.5 font-mono">
                                      <span className="text-[11px] opacity-70">
                                        {isAr ? 'السرعة:' : 'Speed:'}
                                      </span>
                                      <input
                                        type="number"
                                        value={act.params.speed ?? 100}
                                        onChange={(e) => handleUpdateAction(rule.id, act.id, {
                                          params: { ...act.params, speed: Number(e.target.value) }
                                        })}
                                        className={`border px-2 py-0.5 text-xs w-20 outline-none ${
                                          isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-white border-neutral-300 text-black'
                                        }`}
                                      />
                                    </div>
                                  )}

                                  {act.type === 'set_pos' && (
                                    <div className="flex items-center gap-2 font-mono">
                                      <span>X:</span>
                                      <input
                                        type="number"
                                        value={act.params.x ?? 0}
                                        onChange={(e) => handleUpdateAction(rule.id, act.id, {
                                          params: { ...act.params, x: Number(e.target.value) }
                                        })}
                                        className={`border px-1.5 py-0.5 text-xs w-16 outline-none ${
                                          isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-white border-neutral-300 text-black'
                                        }`}
                                      />
                                      <span>Y:</span>
                                      <input
                                        type="number"
                                        value={act.params.y ?? 0}
                                        onChange={(e) => handleUpdateAction(rule.id, act.id, {
                                          params: { ...act.params, y: Number(e.target.value) }
                                        })}
                                        className={`border px-1.5 py-0.5 text-xs w-16 outline-none ${
                                          isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-white border-neutral-300 text-black'
                                        }`}
                                      />
                                    </div>
                                  )}

                                  {act.type === 'change_scene' && (
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[11px] opacity-70">
                                        {isAr ? 'المشهد المستهدف:' : 'Target Scene:'}
                                      </span>
                                      <select
                                        value={act.params.sceneName || ''}
                                        onChange={(e) => handleUpdateAction(rule.id, act.id, {
                                          params: { ...act.params, sceneName: e.target.value }
                                        })}
                                        className={`border px-2 py-1 text-xs outline-none cursor-pointer ${
                                          isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-white border-neutral-400 text-black'
                                        }`}
                                      >
                                        <option value="">{isAr ? 'اختر المشهد...' : 'Select Scene...'}</option>
                                        {scenes.map(s => (
                                          <option key={s.id} value={s.name}>{s.name}</option>
                                        ))}
                                      </select>
                                    </div>
                                  )}

                                  {act.type === 'play_sound' && (
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[11px] opacity-70">
                                        {isAr ? 'المؤثر:' : 'Sound:'}
                                      </span>
                                      <select
                                        value={act.params.soundType || 'jump'}
                                        onChange={(e) => handleUpdateAction(rule.id, act.id, {
                                          params: { ...act.params, soundType: e.target.value }
                                        })}
                                        className={`border px-2 py-1 text-xs outline-none cursor-pointer ${
                                          isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-white border-neutral-400 text-black'
                                        }`}
                                      >
                                        <option value="jump">قفز (Jump)</option>
                                        <option value="coin">التقاط عملة (Coin)</option>
                                        <option value="hit">ضربة / تصادم (Hit)</option>
                                        <option value="powerup">ترقية (Powerup)</option>
                                        <option value="laser">ليزر / إطلاق (Laser)</option>
                                      </select>
                                    </div>
                                  )}

                                  {act.type === 'play_animation' && (
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[11px] opacity-70">
                                        {isAr ? 'اسم الأنميشن:' : 'Animation Name:'}
                                      </span>
                                      <input
                                        type="text"
                                        placeholder="run / walk / idle"
                                        value={act.params.animName || ''}
                                        onChange={(e) => handleUpdateAction(rule.id, act.id, {
                                          params: { ...act.params, animName: e.target.value }
                                        })}
                                        className={`border px-2 py-0.5 text-xs outline-none w-28 font-mono ${
                                          isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-white border-neutral-300 text-black'
                                        }`}
                                      />
                                    </div>
                                  )}

                                  {act.type === 'add_score' && (
                                    <div className="flex items-center gap-1.5 font-mono">
                                      <span className="text-[11px] opacity-70">
                                        {isAr ? 'النقاط:' : 'Points:'}
                                      </span>
                                      <input
                                        type="number"
                                        value={act.params.amount ?? 10}
                                        onChange={(e) => handleUpdateAction(rule.id, act.id, {
                                          params: { ...act.params, amount: Number(e.target.value) }
                                        })}
                                        className={`border px-2 py-0.5 text-xs w-16 outline-none ${
                                          isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-white border-neutral-300 text-black'
                                        }`}
                                      />
                                    </div>
                                  )}

                                  {act.type === 'change_variable' && (
                                    <div className="flex items-center gap-1.5">
                                      <select
                                        value={act.params.varName || ''}
                                        onChange={(e) => handleUpdateAction(rule.id, act.id, {
                                          params: { ...act.params, varName: e.target.value }
                                        })}
                                        className={`border px-2 py-0.5 text-xs outline-none cursor-pointer ${
                                          isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-white border-neutral-300 text-black'
                                        }`}
                                      >
                                        <option value="">{isAr ? 'اختر المتغير...' : 'Select Variable...'}</option>
                                        {data.variables.map(v => (
                                          <option key={v.id} value={v.name}>{v.name}</option>
                                        ))}
                                      </select>
                                      <span className="text-[11px] font-mono">+=</span>
                                      <input
                                        type="number"
                                        value={act.params.delta ?? 1}
                                        onChange={(e) => handleUpdateAction(rule.id, act.id, {
                                          params: { ...act.params, delta: Number(e.target.value) }
                                        })}
                                        className={`border px-2 py-0.5 text-xs w-16 outline-none font-mono ${
                                          isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-white border-neutral-300 text-black'
                                        }`}
                                      />
                                    </div>
                                  )}

                                  {act.type === 'set_variable' && (
                                    <div className="flex items-center gap-1.5">
                                      <select
                                        value={act.params.varName || ''}
                                        onChange={(e) => handleUpdateAction(rule.id, act.id, {
                                          params: { ...act.params, varName: e.target.value }
                                        })}
                                        className={`border px-2 py-0.5 text-xs outline-none cursor-pointer ${
                                          isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-white border-neutral-300 text-black'
                                        }`}
                                      >
                                        <option value="">{isAr ? 'اختر المتغير...' : 'Select Variable...'}</option>
                                        {data.variables.map(v => (
                                          <option key={v.id} value={v.name}>{v.name}</option>
                                        ))}
                                      </select>
                                      <span className="text-[11px] font-mono">=</span>
                                      <input
                                        type="text"
                                        value={act.params.value ?? ''}
                                        onChange={(e) => handleUpdateAction(rule.id, act.id, {
                                          params: { ...act.params, value: e.target.value }
                                        })}
                                        placeholder={isAr ? 'القيمة الجديدة' : 'New Value'}
                                        className={`border px-2 py-0.5 text-xs w-24 outline-none font-mono ${
                                          isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-white border-neutral-300 text-black'
                                        }`}
                                      />
                                    </div>
                                  )}
                                </div>

                                {/* Delete action button */}
                                <button
                                  onClick={() => handleDeleteAction(rule.id, act.id)}
                                  className="text-neutral-500 hover:text-white p-1 cursor-pointer"
                                  title={isAr ? 'حذف الإجراء' : 'Delete Action'}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={handleAddRule}
                  className={`w-full py-2.5 border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isDark ? 'border-dashed border-neutral-700 hover:border-white hover:bg-neutral-900 text-neutral-300 hover:text-white' : 'border-dashed border-neutral-400 hover:border-black hover:bg-neutral-100 text-neutral-700 hover:text-black'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.addRule}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: VARIABLES */}
        {activeTab === 'variables' && (
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">{t.variablesTab}</h3>
                <p className="text-xs opacity-60">
                  {isAr 
                    ? 'عرّف متغيرات رقمية أو نصية (مثل: score, lives, speed, name) واستخدمها في الشروط والقواعد.'
                    : 'Define custom variables (e.g. score, speed, lives) and use them in visual rules.'}
                </p>
              </div>
              <button
                onClick={handleAddVariable}
                className={`border px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                  isDark ? 'border-white bg-white text-black hover:bg-neutral-200' : 'border-black bg-black text-white hover:bg-neutral-800'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.addVariable}</span>
              </button>
            </div>

            {data.variables.length === 0 ? (
              <div className={`text-center py-12 border border-dashed ${
                isDark ? 'border-neutral-800 text-neutral-500' : 'border-neutral-300 text-neutral-600'
              }`}>
                <p className="text-sm font-medium mb-3">{t.emptyVars}</p>
                <button
                  onClick={handleAddVariable}
                  className={`border px-3.5 py-1.5 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer ${
                    isDark ? 'border-white bg-white text-black' : 'border-black bg-black text-white'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t.addVariable}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {data.variables.map((v, idx) => (
                  <div
                    key={v.id}
                    className={`p-3 border flex flex-wrap items-center justify-between gap-3 ${
                      isDark ? 'border-neutral-800 bg-neutral-950' : 'border-neutral-300 bg-white'
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono text-xs opacity-40">#{idx + 1}</span>
                      
                      {/* Variable Name */}
                      <div>
                        <label className="block text-[10px] opacity-60 mb-0.5">{t.variableName}</label>
                        <input
                          type="text"
                          value={v.name}
                          onChange={(e) => handleUpdateVariable(v.id, { name: e.target.value })}
                          className={`border px-2 py-1 text-xs outline-none font-mono ${
                            isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-neutral-50 border-neutral-300 text-black'
                          }`}
                        />
                      </div>

                      {/* Type */}
                      <div>
                        <label className="block text-[10px] opacity-60 mb-0.5">{t.variableType}</label>
                        <select
                          value={v.type}
                          onChange={(e) => {
                            const newType = e.target.value as any;
                            const defaultVal = newType === 'number' ? 0 : newType === 'boolean' ? true : '';
                            handleUpdateVariable(v.id, { type: newType, value: defaultVal });
                          }}
                          className={`border px-2 py-1 text-xs outline-none cursor-pointer ${
                            isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-neutral-50 border-neutral-300 text-black'
                          }`}
                        >
                          <option value="number">{t.number}</option>
                          <option value="string">{t.string}</option>
                          <option value="boolean">{t.boolean}</option>
                        </select>
                      </div>

                      {/* Initial Value */}
                      <div>
                        <label className="block text-[10px] opacity-60 mb-0.5">{t.variableValue}</label>
                        {v.type === 'boolean' ? (
                          <select
                            value={String(v.value)}
                            onChange={(e) => handleUpdateVariable(v.id, { value: e.target.value === 'true' })}
                            className={`border px-2 py-1 text-xs outline-none cursor-pointer ${
                              isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-neutral-50 border-neutral-300 text-black'
                            }`}
                          >
                            <option value="true">true (صح)</option>
                            <option value="false">false (خطأ)</option>
                          </select>
                        ) : (
                          <input
                            type={v.type === 'number' ? 'number' : 'text'}
                            value={v.value ?? ''}
                            onChange={(e) => {
                              const val = v.type === 'number' ? Number(e.target.value) : e.target.value;
                              handleUpdateVariable(v.id, { value: val });
                            }}
                            className={`border px-2 py-1 text-xs outline-none font-mono ${
                              isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-neutral-50 border-neutral-300 text-black'
                            }`}
                          />
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteVariable(v.id)}
                      className={`p-1.5 border transition-colors cursor-pointer text-neutral-400 hover:text-white ${
                        isDark ? 'border-neutral-800 hover:border-neutral-600' : 'border-neutral-300 hover:border-black hover:text-black'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: COMPILED JAVASCRIPT PREVIEW */}
        {activeTab === 'compiledCode' && (
          <div className="max-w-4xl mx-auto space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">{t.codeTab}</h3>
                <p className="text-xs opacity-60">
                  {isAr 
                    ? 'هذا هو كود الجافا سكربت النهائي الذي تصرفه لغة FY3 المرئية تلقائياً ليتم تنفيذه في اللعبة.'
                    : 'This JavaScript code is auto-compiled from FY3 visual blocks and executed by the runtime.'}
                </p>
              </div>

              <button
                onClick={handleCopyCode}
                className={`border px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                  isDark ? 'border-neutral-700 hover:border-white bg-black' : 'border-neutral-300 hover:border-black bg-white'
                }`}
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? (isAr ? 'تم النسخ!' : 'Copied!') : t.copyCode}</span>
              </button>
            </div>

            <pre className={`p-4 border font-mono text-xs overflow-x-auto leading-relaxed select-text ${
              isDark ? 'bg-neutral-950 border-neutral-800 text-neutral-300' : 'bg-neutral-50 border-neutral-300 text-neutral-800'
            }`}>
              {compiledJS || '// No rules or variables to compile'}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
