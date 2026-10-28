import React, { useState } from 'react';
import { GameObject, GameLayer, GameSettings } from '../types/engine';
import { Language, ThemeMode, translations } from '../utils/i18n';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Trash2, 
  Copy, 
  Layers, 
  Sliders, 
  GripVertical,
  Plus,
  Box,
  Circle as CircleIcon,
  Sparkles,
  Zap,
  Film,
  Upload,
  Image as ImageIcon,
  ChevronUp,
  ChevronDown,
  Monitor,
  Globe
} from 'lucide-react';

interface RightPanelProps {
  objects: GameObject[];
  layers?: GameLayer[];
  settings?: GameSettings;
  selectedObjectId: string | null;
  onSelectObject: (id: string | null) => void;
  onUpdateObject: (updatedObj: GameObject) => void;
  onReorderObjects: (sourceIndex: number, targetIndex: number) => void;
  onDeleteObject: (id: string) => void;
  onDuplicateObject: (id: string) => void;
  onOpenAddModal: () => void;
  onOpenPrebuiltModal: () => void;
  onOpenAnimationStudio: () => void;
  onAddLayer?: (newLayer: GameLayer) => void;
  onUpdateLayer?: (updatedLayer: GameLayer) => void;
  onDeleteLayer?: (layerId: string) => void;
  onReorderLayers?: (sourceIndex: number, targetIndex: number) => void;
  onUpdateSettings?: (updater: (prev: GameSettings) => GameSettings) => void;
  language: Language;
  theme: ThemeMode;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  objects,
  layers = [],
  settings,
  selectedObjectId,
  onSelectObject,
  onUpdateObject,
  onReorderObjects,
  onDeleteObject,
  onDuplicateObject,
  onOpenAddModal,
  onOpenPrebuiltModal,
  onOpenAnimationStudio,
  onAddLayer,
  onUpdateLayer,
  onDeleteLayer,
  onReorderLayers,
  onUpdateSettings,
  language,
  theme
}) => {
  const [activeTab, setActiveTab] = useState<'hierarchy' | 'layers' | 'inspector'>('inspector');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(layers[0]?.id || null);

  const t = translations[language];
  const selectedObject = objects.find(o => o.id === selectedObjectId);

  // Drag and Drop handlers for reordering objects
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dropTargetIndex !== index) {
      setDropTargetIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      onReorderObjects(draggedIndex, targetIndex);
    }
    setDraggedIndex(null);
    setDropTargetIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDropTargetIndex(null);
  };

  const handlePropChange = (field: keyof GameObject, value: any) => {
    if (!selectedObject) return;
    onUpdateObject({
      ...selectedObject,
      [field]: value
    });
  };

  // Layer Creation Handler
  const handleCreateLayer = () => {
    if (!onAddLayer) return;
    const count = (layers?.length || 0) + 1;
    const newLayer: GameLayer = {
      id: 'layer_' + Math.random().toString(36).substring(2, 9),
      name: `طبقة ${count}`,
      type: 'world',
      visible: true,
      locked: false
    };
    onAddLayer(newLayer);
    setSelectedLayerId(newLayer.id);
  };

  // Layer Background Image Upload Handler
  const handleLayerBgUpload = (layer: GameLayer, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUpdateLayer) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onUpdateLayer({
          ...layer,
          backgroundImage: dataUrl
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <aside className={`w-80 h-full flex flex-col select-none border-r ${
      theme === 'dark' 
        ? 'bg-black text-white border-neutral-800' 
        : 'bg-white text-black border-neutral-300'
    }`}>
      {/* Top Tabs: Hierarchy, Layers, Inspector */}
      <div className={`flex border-b font-mono text-xs ${
        theme === 'dark' ? 'bg-neutral-950 border-neutral-800' : 'bg-neutral-100 border-neutral-300'
      }`}>
        <button
          onClick={() => setActiveTab('hierarchy')}
          className={`flex-1 py-2.5 flex items-center justify-center gap-1 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'hierarchy'
              ? (theme === 'dark' ? 'border-white text-white font-bold bg-black' : 'border-black text-black font-bold bg-white')
              : 'border-transparent opacity-60 hover:opacity-100'
          }`}
          title="شجرة الكائنات"
        >
          <Box className="w-3.5 h-3.5" />
          <span className="text-[11px]">الكائنات ({objects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('layers')}
          className={`flex-1 py-2.5 flex items-center justify-center gap-1 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'layers'
              ? (theme === 'dark' ? 'border-white text-white font-bold bg-black' : 'border-black text-black font-bold bg-white')
              : 'border-transparent opacity-60 hover:opacity-100'
          }`}
          title="إدارة الطبقات"
        >
          <Layers className="w-3.5 h-3.5" />
          <span className="text-[11px]">الطبقات ({layers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('inspector')}
          className={`flex-1 py-2.5 flex items-center justify-center gap-1 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'inspector'
              ? (theme === 'dark' ? 'border-white text-white font-bold bg-black' : 'border-black text-black font-bold bg-white')
              : 'border-transparent opacity-60 hover:opacity-100'
          }`}
          title="خصائص الكائن"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span className="text-[11px]">{t.inspector}</span>
        </button>
      </div>

      {/* TAB 1: HIERARCHY (الكائنات) */}
      {activeTab === 'hierarchy' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className={`p-2 border-b flex items-center justify-between text-[11px] font-mono ${
            theme === 'dark' ? 'bg-neutral-950 border-neutral-800 text-neutral-400' : 'bg-neutral-50 border-neutral-200 text-neutral-600'
          }`}>
            <span>اسحب لإعادة ترتيب الطبقات</span>
            <button
              onClick={onOpenAddModal}
              title={t.addImageOrObject}
              className={`p-1 border transition-colors cursor-pointer ${
                theme === 'dark' ? 'border-neutral-800 hover:border-white text-white' : 'border-neutral-300 hover:border-black text-black'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {objects.length === 0 ? (
              <div className="text-center py-10 text-xs opacity-50 font-mono">
                {t.noObjects}
              </div>
            ) : (
              objects.map((obj, index) => {
                const isSelected = obj.id === selectedObjectId;
                const isDragging = draggedIndex === index;
                const isDropTarget = dropTargetIndex === index;

                return (
                  <div
                    key={obj.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    onClick={() => {
                      onSelectObject(obj.id);
                      setActiveTab('inspector');
                    }}
                    className={`group flex items-center justify-between p-2 text-xs border transition-all cursor-pointer ${
                      isDragging ? 'opacity-30' : ''
                    } ${
                      isDropTarget ? 'border-t-2 border-t-current' : ''
                    } ${
                      isSelected
                        ? (theme === 'dark' ? 'bg-neutral-900 border-white text-white' : 'bg-neutral-100 border-black text-black')
                        : (theme === 'dark' ? 'bg-black border-neutral-800 text-neutral-300 hover:border-neutral-700' : 'bg-white border-neutral-200 text-neutral-800 hover:border-neutral-300')
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden flex-1">
                      <GripVertical className="w-3.5 h-3.5 opacity-30 group-hover:opacity-100 cursor-grab shrink-0" />
                      
                      {obj.shapeType === 'image' && obj.imageData ? (
                        <img src={obj.imageData} alt="" className="w-4 h-4 object-contain shrink-0" />
                      ) : obj.shapeType === 'circle' ? (
                        <CircleIcon className="w-3.5 h-3.5 shrink-0" />
                      ) : (
                        <Box className="w-3.5 h-3.5 shrink-0" />
                      )}

                      <span className="truncate font-mono font-medium">{obj.name}</span>
                    </div>

                    <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onUpdateObject({ ...obj, visible: !obj.visible })}
                        className="p-1 hover:opacity-100 opacity-60 cursor-pointer"
                        title={obj.visible ? 'مرئي' : 'مخفي'}
                      >
                        {obj.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3 text-neutral-500" />}
                      </button>

                      <button
                        onClick={() => onUpdateObject({ ...obj, locked: !obj.locked })}
                        className="p-1 hover:opacity-100 opacity-60 cursor-pointer"
                        title={obj.locked ? 'مقفل' : 'مفتوح'}
                      >
                        {obj.locked ? <Lock className="w-3 h-3 text-neutral-500" /> : <Unlock className="w-3 h-3" />}
                      </button>

                      <button
                        onClick={() => onDuplicateObject(obj.id)}
                        className="p-1 hover:opacity-100 opacity-60 cursor-pointer"
                        title={t.duplicate}
                      >
                        <Copy className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => onDeleteObject(obj.id)}
                        className="p-1 hover:text-red-500 opacity-60 cursor-pointer"
                        title={t.delete}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: LAYERS (الطبقات - متحركة وثابتة للواجهات وخلفياتها) */}
      {activeTab === 'layers' && (
        <div className="flex-1 flex flex-col overflow-hidden font-mono text-xs">
          <div className={`p-3 border-b flex items-center justify-between ${
            theme === 'dark' ? 'bg-neutral-950 border-neutral-800' : 'bg-neutral-100 border-neutral-300'
          }`}>
            <div className="flex items-center gap-1.5 font-bold">
              <Layers className="w-3.5 h-3.5" />
              <span>إدارة الطبقات</span>
            </div>
            <button
              onClick={handleCreateLayer}
              className={`border px-2.5 py-1 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                theme === 'dark' ? 'bg-white text-black border-white' : 'bg-black text-white border-black'
              }`}
            >
              <Plus className="w-3 h-3" />
              <span>طبقة جديدة</span>
            </button>
          </div>

          {/* World Background Settings (Embedded in Layers Tab as requested) */}
          <div className={`p-3 border-b space-y-2.5 ${
            theme === 'dark' ? 'bg-neutral-900/60 border-neutral-800' : 'bg-neutral-100 border-neutral-300'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                <span>خلفية العالم الكامل (اللانهائي)</span>
              </span>
              {settings?.worldBackgroundImage && (
                <button
                  onClick={() => onUpdateSettings && onUpdateSettings(prev => ({ ...prev, worldBackgroundImage: undefined }))}
                  className="text-[10px] text-red-500 hover:underline cursor-pointer"
                >
                  حذف الصورة
                </button>
              )}
            </div>

            {/* Color Picker for Entire World */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] opacity-75">لون العالم:</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings?.worldBackgroundColor || settings?.backgroundColor || '#333333'}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (onUpdateSettings) {
                      onUpdateSettings(prev => ({ ...prev, worldBackgroundColor: val, backgroundColor: val }));
                    }
                    const firstWorldLayer = layers.find(l => l.type === 'world');
                    if (firstWorldLayer && onUpdateLayer) {
                      onUpdateLayer({ ...firstWorldLayer, backgroundColor: val });
                    }
                  }}
                  className="w-6 h-6 border cursor-pointer bg-transparent"
                  title="تغيير لون العالم الكامل"
                />
                <span className="font-mono text-[10px] opacity-70">
                  {settings?.worldBackgroundColor || settings?.backgroundColor || '#333333'}
                </span>
              </div>
            </div>

            {/* Image Upload for Entire World Pattern */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] opacity-75">صورة متكررة:</span>
              <label className="border border-neutral-700 hover:border-white px-2 py-1 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors">
                <Upload className="w-3 h-3" />
                <span>رفع صورة</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file || !onUpdateSettings) return;
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const dataUrl = event.target?.result as string;
                      if (dataUrl) {
                        onUpdateSettings(prev => ({
                          ...prev,
                          worldBackgroundImage: dataUrl,
                          worldBackgroundRepeat: 'repeat'
                        }));
                      }
                    };
                    reader.readAsDataURL(file);
                    e.target.value = '';
                  }}
                  className="hidden"
                />
              </label>
            </div>

            {settings?.worldBackgroundImage && (
              <div className="h-12 border border-neutral-800 overflow-hidden relative">
                <img
                  src={settings.worldBackgroundImage}
                  alt="World Background"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Layers List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {layers.length === 0 ? (
              <div className="text-center py-10 opacity-50">
                لا توجد طبقات مخصصة.
                <br />
                اضغط على "طبقة جديدة" للبدء.
              </div>
            ) : (
              layers.map((layer, index) => {
                const isSelected = layer.id === selectedLayerId;
                const objectsInLayer = objects.filter(o => o.layerId === layer.id);

                return (
                  <div
                    key={layer.id}
                    onClick={() => setSelectedLayerId(layer.id)}
                    className={`border p-3 transition-all cursor-pointer flex flex-col gap-2.5 ${
                      isSelected
                        ? (theme === 'dark' ? 'border-white bg-neutral-900/90' : 'border-black bg-neutral-50 shadow-sm')
                        : (theme === 'dark' ? 'border-neutral-800 bg-black hover:border-neutral-700' : 'border-neutral-200 bg-white hover:border-neutral-300')
                    }`}
                  >
                    {/* Layer Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {layer.type === 'ui' ? (
                          <span title="طبقة واجهة ثابتة (HUD / UI)"><Monitor className="w-3.5 h-3.5" /></span>
                        ) : (
                          <span title="طبقة عالم متحركة"><Globe className="w-3.5 h-3.5" /></span>
                        )}
                        <input
                          type="text"
                          value={layer.name}
                          onChange={(e) => onUpdateLayer && onUpdateLayer({ ...layer, name: e.target.value })}
                          className={`font-bold text-xs bg-transparent border-b border-transparent focus:border-current outline-none w-32`}
                        />
                      </div>

                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {/* Reorder Up/Down */}
                        {index > 0 && onReorderLayers && (
                          <button
                            onClick={() => onReorderLayers(index, index - 1)}
                            className="p-1 opacity-50 hover:opacity-100 cursor-pointer"
                            title="تحريك لأعلى"
                          >
                            <ChevronUp className="w-3 h-3" />
                          </button>
                        )}
                        {index < layers.length - 1 && onReorderLayers && (
                          <button
                            onClick={() => onReorderLayers(index, index + 1)}
                            className="p-1 opacity-50 hover:opacity-100 cursor-pointer"
                            title="تحريك لأسفل"
                          >
                            <ChevronDown className="w-3 h-3" />
                          </button>
                        )}

                        {layers.length > 1 && onDeleteLayer && (
                          <button
                            onClick={() => onDeleteLayer(layer.id)}
                            className="p-1 opacity-50 hover:text-red-500 cursor-pointer"
                            title="حذف الطبقة"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Layer Type Switcher: World (متحركة) vs UI (ثابتة) */}
                    <div className="flex items-center gap-2 pt-1 border-t border-neutral-800/40">
                      <span className="text-[10px] opacity-70">نوع الطبقة:</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onUpdateLayer && onUpdateLayer({ ...layer, type: 'world' })}
                          className={`px-2 py-0.5 text-[10px] border cursor-pointer ${
                            layer.type === 'world'
                              ? 'bg-white text-black border-white font-bold'
                              : 'border-neutral-800 opacity-60'
                          }`}
                        >
                          متحركة (بالعالم)
                        </button>

                        <button
                          type="button"
                          onClick={() => onUpdateLayer && onUpdateLayer({ ...layer, type: 'ui' })}
                          className={`px-2 py-0.5 text-[10px] border cursor-pointer ${
                            layer.type === 'ui'
                              ? 'bg-white text-black border-white font-bold'
                              : 'border-neutral-800 opacity-60'
                          }`}
                        >
                          ثابتة (أزرار / HUD)
                        </button>
                      </div>
                    </div>

                    {/* Layer Background Settings: Color or Upload Image */}
                    <div className="space-y-2 pt-1 border-t border-neutral-800/40 text-[10px]">
                      <span className="opacity-70 block font-bold">خلفية الطبقة (اختياري):</span>

                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={layer.backgroundColor || settings?.worldBackgroundColor || '#333333'}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (onUpdateLayer) onUpdateLayer({ ...layer, backgroundColor: val });
                              if (layer.type === 'world' && onUpdateSettings) {
                                onUpdateSettings(prev => ({ ...prev, worldBackgroundColor: val, backgroundColor: val }));
                              }
                            }}
                            className="w-5 h-5 border cursor-pointer bg-transparent"
                            title="لون خلفية الطبقة"
                          />
                          <span className="opacity-70 font-mono">{layer.backgroundColor || settings?.worldBackgroundColor || '#333333'}</span>
                        </div>

                        <label className="border border-neutral-700 hover:border-white px-2 py-1 text-[10px] flex items-center gap-1 cursor-pointer transition-colors">
                          <Upload className="w-2.5 h-2.5" />
                          <span>رفع صورة</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleLayerBgUpload(layer, e)}
                            className="hidden"
                          />
                        </label>

                        {layer.backgroundImage && (
                          <button
                            type="button"
                            onClick={() => onUpdateLayer && onUpdateLayer({ ...layer, backgroundImage: undefined })}
                            className="text-red-400 hover:underline cursor-pointer"
                          >
                            حذف الصورة
                          </button>
                        )}
                      </div>

                      {layer.backgroundImage && (
                        <div className="h-10 border border-neutral-800 overflow-hidden relative">
                          <img src={layer.backgroundImage} alt="Layer background" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>

                    <div className="text-[10px] opacity-50 flex items-center justify-between pt-1">
                      <span>{objectsInLayer.length} كائنات مخصصة لهذه الطبقة</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 3: INSPECTOR (خصائص الكائن) */}
      {activeTab === 'inspector' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!selectedObject ? (
            <div className="text-center py-12 text-xs opacity-50 font-mono">
              {t.noneSelected}
            </div>
          ) : (
            <>
              {/* SECTION: ANIMATION STUDIO BUTTON - Icon Only as requested */}
              <div className={`p-2.5 border flex items-center justify-between ${
                theme === 'dark' 
                  ? 'border-neutral-700 bg-neutral-900/90' 
                  : 'border-neutral-300 bg-neutral-100 shadow-sm'
              }`}>
                <div className="flex items-center gap-2">
                  <Film className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold font-mono">أنميشن الكائن</span>
                </div>

                <button
                  type="button"
                  onClick={onOpenAnimationStudio}
                  title="فتح استوديو الأنميشن"
                  className={`p-2 border transition-all cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-white text-black border-white hover:bg-neutral-200'
                      : 'bg-black text-white border-black hover:bg-neutral-800'
                  }`}
                >
                  <Film className="w-4 h-4" />
                </button>
              </div>

              {/* Identity & Layer Selector (Tag removed as requested) */}
              <div className="space-y-3 pb-3 border-b border-neutral-700/50">
                <div>
                  <label className="block text-[11px] font-mono opacity-70 mb-1">{t.objectName}</label>
                  <input
                    type="text"
                    value={selectedObject.name}
                    onChange={(e) => handlePropChange('name', e.target.value)}
                    className={`w-full border px-2.5 py-1.5 text-xs outline-none ${
                      theme === 'dark' ? 'bg-neutral-950 border-neutral-800 focus:border-white text-white' : 'bg-neutral-50 border-neutral-300 focus:border-black text-black'
                    }`}
                  />
                </div>

                {/* Layer Assignment */}
                <div>
                  <label className="block text-[11px] font-mono opacity-70 mb-1">الطبقة (Layer)</label>
                  <select
                    value={selectedObject.layerId || (layers[0]?.id || '')}
                    onChange={(e) => handlePropChange('layerId', e.target.value)}
                    className={`w-full border px-2.5 py-1.5 text-xs outline-none font-mono cursor-pointer ${
                      theme === 'dark' ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-300 text-black'
                    }`}
                  >
                    {layers.map((lay) => (
                      <option key={lay.id} value={lay.id}>
                        {lay.name} ({lay.type === 'ui' ? 'واجهة ثابتة HUD' : 'متحركة بالعالم'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Transform */}
              <div className="space-y-3 pb-3 border-b border-neutral-700/50">
                <span className="text-xs font-bold block">{t.transform}</span>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-mono opacity-70 mb-1">X</label>
                    <input
                      type="number"
                      value={Math.round(selectedObject.x)}
                      onChange={(e) => handlePropChange('x', parseFloat(e.target.value) || 0)}
                      className={`w-full border px-2 py-1 text-xs outline-none font-mono ${
                        theme === 'dark' ? 'bg-neutral-950 border-neutral-800 focus:border-white text-white' : 'bg-neutral-50 border-neutral-300 focus:border-black text-black'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono opacity-70 mb-1">Y</label>
                    <input
                      type="number"
                      value={Math.round(selectedObject.y)}
                      onChange={(e) => handlePropChange('y', parseFloat(e.target.value) || 0)}
                      className={`w-full border px-2 py-1 text-xs outline-none font-mono ${
                        theme === 'dark' ? 'bg-neutral-950 border-neutral-800 focus:border-white text-white' : 'bg-neutral-50 border-neutral-300 focus:border-black text-black'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-mono opacity-70 mb-1">{t.size} W</label>
                    <input
                      type="number"
                      min={4}
                      value={Math.round(selectedObject.width)}
                      onChange={(e) => handlePropChange('width', Math.max(4, parseFloat(e.target.value) || 4))}
                      className={`w-full border px-2 py-1 text-xs outline-none font-mono ${
                        theme === 'dark' ? 'bg-neutral-950 border-neutral-800 focus:border-white text-white' : 'bg-neutral-50 border-neutral-300 focus:border-black text-black'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono opacity-70 mb-1">{t.size} H</label>
                    <input
                      type="number"
                      min={4}
                      value={Math.round(selectedObject.height)}
                      onChange={(e) => handlePropChange('height', Math.max(4, parseFloat(e.target.value) || 4))}
                      className={`w-full border px-2 py-1 text-xs outline-none font-mono ${
                        theme === 'dark' ? 'bg-neutral-950 border-neutral-800 focus:border-white text-white' : 'bg-neutral-50 border-neutral-300 focus:border-black text-black'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-mono opacity-70 mb-1">{t.rotation} (°)</label>
                    <input
                      type="number"
                      value={Math.round(selectedObject.rotation || 0)}
                      onChange={(e) => handlePropChange('rotation', parseFloat(e.target.value) || 0)}
                      className={`w-full border px-2 py-1 text-xs outline-none font-mono ${
                        theme === 'dark' ? 'bg-neutral-950 border-neutral-800 focus:border-white text-white' : 'bg-neutral-50 border-neutral-300 focus:border-black text-black'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono opacity-70 mb-1">{t.opacity}</label>
                    <input
                      type="number"
                      step={0.1}
                      min={0}
                      max={1}
                      value={selectedObject.opacity ?? 1}
                      onChange={(e) => handlePropChange('opacity', Math.max(0, Math.min(1, parseFloat(e.target.value) || 1)))}
                      className={`w-full border px-2 py-1 text-xs outline-none font-mono ${
                        theme === 'dark' ? 'bg-neutral-950 border-neutral-800 focus:border-white text-white' : 'bg-neutral-50 border-neutral-300 focus:border-black text-black'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Collision & Physics */}
              <div className="space-y-3 pb-3 border-b border-neutral-700/50">
                <span className="text-xs font-bold block">{t.collisionAndPhysics}</span>

                <div className="flex items-center justify-between">
                  <span className="text-xs">{t.enableCollision}</span>
                  <input
                    type="checkbox"
                    checked={selectedObject.hasCollision}
                    onChange={(e) => handlePropChange('hasCollision', e.target.checked)}
                    className="w-4 h-4 cursor-pointer"
                  />
                </div>

                {selectedObject.hasCollision && (
                  <div className="space-y-2.5 pt-1">
                    <div>
                      <label className="block text-[10px] font-mono opacity-70 mb-1">{t.colliderType}</label>
                      <select
                        value={selectedObject.colliderType}
                        onChange={(e) => handlePropChange('colliderType', e.target.value as any)}
                        className={`w-full border px-2 py-1 text-xs outline-none font-mono cursor-pointer ${
                          theme === 'dark' ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-300 text-black'
                        }`}
                      >
                        <option value="box">{t.boxCollider}</option>
                        <option value="circle">{t.circleCollider}</option>
                      </select>
                    </div>

                    {/* Collision Mesh (شباك التصادم) */}
                    <div className={`p-2.5 border space-y-2 ${
                      theme === 'dark' ? 'bg-neutral-950 border-neutral-800' : 'bg-neutral-50 border-neutral-300'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold">شباك التصادم (Collision Mesh):</span>
                        <input
                          type="checkbox"
                          checked={selectedObject.collisionMesh?.enabled ?? false}
                          onChange={(e) => {
                            const enabled = e.target.checked;
                            const prevMesh = selectedObject.collisionMesh || {
                              enabled: true,
                              type: 'mesh',
                              offsetX: 0,
                              offsetY: 0,
                              customWidth: selectedObject.width,
                              customHeight: selectedObject.height,
                              padding: 0
                            };
                            handlePropChange('collisionMesh', { ...prevMesh, enabled });
                          }}
                          className="w-3.5 h-3.5 cursor-pointer"
                        />
                      </div>

                      {selectedObject.collisionMesh?.enabled && (
                        <div className="space-y-2 text-[10px] font-mono pt-1 border-t border-neutral-800">
                          <div>
                            <label className="block opacity-70 mb-1">نوع الشباك:</label>
                            <select
                              value={selectedObject.collisionMesh?.type || 'mesh'}
                              onChange={(e) => {
                                const type = e.target.value as any;
                                handlePropChange('collisionMesh', {
                                  ...(selectedObject.collisionMesh || { enabled: true }),
                                  type
                                });
                              }}
                              className={`w-full border px-2 py-1 text-[11px] outline-none cursor-pointer ${
                                theme === 'dark' ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-white border-neutral-300 text-black'
                              }`}
                            >
                              <option value="mesh">شباك مخصص (Custom Mesh)</option>
                              <option value="box">صندوق محكم (Box)</option>
                              <option value="circle">دائرة محكمة (Circle)</option>
                            </select>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block opacity-70 mb-0.5">إزاحة X:</label>
                              <input
                                type="number"
                                value={selectedObject.collisionMesh?.offsetX || 0}
                                onChange={(e) => {
                                  const offsetX = parseFloat(e.target.value) || 0;
                                  handlePropChange('collisionMesh', {
                                    ...(selectedObject.collisionMesh || { enabled: true, type: 'mesh' }),
                                    offsetX
                                  });
                                }}
                                className={`w-full border px-1.5 py-1 text-[11px] outline-none ${
                                  theme === 'dark' ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-white border-neutral-300 text-black'
                                }`}
                              />
                            </div>
                            <div>
                              <label className="block opacity-70 mb-0.5">إزاحة Y:</label>
                              <input
                                type="number"
                                value={selectedObject.collisionMesh?.offsetY || 0}
                                onChange={(e) => {
                                  const offsetY = parseFloat(e.target.value) || 0;
                                  handlePropChange('collisionMesh', {
                                    ...(selectedObject.collisionMesh || { enabled: true, type: 'mesh' }),
                                    offsetY
                                  });
                                }}
                                className={`w-full border px-1.5 py-1 text-[11px] outline-none ${
                                  theme === 'dark' ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-white border-neutral-300 text-black'
                                }`}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block opacity-70 mb-0.5">عرض الشباك:</label>
                              <input
                                type="number"
                                value={selectedObject.collisionMesh?.customWidth ?? selectedObject.width}
                                onChange={(e) => {
                                  const customWidth = Math.max(2, parseFloat(e.target.value) || 2);
                                  handlePropChange('collisionMesh', {
                                    ...(selectedObject.collisionMesh || { enabled: true, type: 'mesh' }),
                                    customWidth
                                  });
                                }}
                                className={`w-full border px-1.5 py-1 text-[11px] outline-none ${
                                  theme === 'dark' ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-white border-neutral-300 text-black'
                                }`}
                              />
                            </div>
                            <div>
                              <label className="block opacity-70 mb-0.5">ارتفاع الشباك:</label>
                              <input
                                type="number"
                                value={selectedObject.collisionMesh?.customHeight ?? selectedObject.height}
                                onChange={(e) => {
                                  const customHeight = Math.max(2, parseFloat(e.target.value) || 2);
                                  handlePropChange('collisionMesh', {
                                    ...(selectedObject.collisionMesh || { enabled: true, type: 'mesh' }),
                                    customHeight
                                  });
                                }}
                                className={`w-full border px-1.5 py-1 text-[11px] outline-none ${
                                  theme === 'dark' ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-white border-neutral-300 text-black'
                                }`}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </aside>
  );
};
