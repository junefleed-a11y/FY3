import React, { useState, useRef, useEffect } from 'react';
import { GameObject, ShapeType, SpriteAnimation, SpriteAnimationFrame } from '../types/engine';
import { Language, ThemeMode, translations } from '../utils/i18n';
import { 
  Upload, 
  Plus, 
  Square, 
  Circle, 
  X, 
  Paintbrush, 
  Eraser, 
  RotateCcw, 
  Play, 
  Pause, 
  Copy, 
  Trash2,
  Save,
  Check
} from 'lucide-react';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddObject: (newObj: GameObject) => void;
  gameWidth: number;
  gameHeight: number;
  language: Language;
  theme: ThemeMode;
}

type GridSize = 8 | 16 | 24 | 32;

const PALETTE = [
  '#000000',
  '#ffffff',
  '#e11d48', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#22c55e', // Green
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#a855f7', // Purple
  '#ec4899', // Pink
  '#78350f', // Brown
  '#64748b'  // Slate
];

const createEmptyGrid = (size: number): string[][] => {
  return Array(size).fill(null).map(() => Array(size).fill(''));
};

export const AddAssetModal: React.FC<AddAssetModalProps> = ({
  isOpen,
  onClose,
  onAddObject,
  gameWidth,
  gameHeight,
  language,
  theme
}) => {
  const [activeTab, setActiveTab] = useState<'pixel' | 'upload' | 'shapes'>('pixel');
  const [objectName, setObjectName] = useState('كائن بكسل');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Pixel Art Editor State
  const [gridSize, setGridSize] = useState<GridSize>(16);
  const [frames, setFrames] = useState<string[][][]>([createEmptyGrid(16)]);
  const [activeFrameIndex, setActiveFrameIndex] = useState(0);
  const [activeTool, setActiveTool] = useState<'pen' | 'eraser'>('pen');
  const [currentColor, setCurrentColor] = useState('#ffffff');
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [frameDurationMs, setFrameDurationMs] = useState(150);
  const [previewAnimFrame, setPreviewAnimFrame] = useState(0);

  const t = translations[language];
  const isDark = theme === 'dark';

  // Animation preview timer
  useEffect(() => {
    if (!isPlaying || frames.length <= 1) return;
    const interval = setInterval(() => {
      setPreviewAnimFrame(prev => (prev + 1) % frames.length);
    }, frameDurationMs);
    return () => clearInterval(interval);
  }, [isPlaying, frames.length, frameDurationMs]);

  // Handle grid size change
  const handleGridSizeChange = (newSize: GridSize) => {
    if (newSize === gridSize) return;
    setGridSize(newSize);
    setFrames([createEmptyGrid(newSize)]);
    setActiveFrameIndex(0);
  };

  // Pixel drawing handlers
  const paintPixel = (r: number, c: number) => {
    setFrames(prevFrames => {
      const newFrames = prevFrames.map((f, fIdx) => {
        if (fIdx !== activeFrameIndex) return f;
        return f.map((row, rowIdx) => {
          if (rowIdx !== r) return row;
          return row.map((col, colIdx) => {
            if (colIdx !== c) return col;
            return activeTool === 'pen' ? currentColor : '';
          });
        });
      });
      return newFrames;
    });
  };

  const handleCellMouseDown = (r: number, c: number) => {
    setIsMouseDown(true);
    paintPixel(r, c);
  };

  const handleCellMouseEnter = (r: number, c: number) => {
    if (isMouseDown) {
      paintPixel(r, c);
    }
  };

  // Frame operations
  const handleAddFrame = () => {
    setFrames(prev => [...prev, createEmptyGrid(gridSize)]);
    setActiveFrameIndex(frames.length);
  };

  const handleDuplicateFrame = () => {
    const current = frames[activeFrameIndex];
    const clone = current.map(row => [...row]);
    setFrames(prev => [...prev, clone]);
    setActiveFrameIndex(frames.length);
  };

  const handleDeleteFrame = (indexToDelete: number) => {
    if (frames.length <= 1) return;
    const nextFrames = frames.filter((_, idx) => idx !== indexToDelete);
    setFrames(nextFrames);
    setActiveFrameIndex(Math.max(0, Math.min(activeFrameIndex, nextFrames.length - 1)));
  };

  const handleClearCurrentFrame = () => {
    setFrames(prev => prev.map((f, idx) => idx === activeFrameIndex ? createEmptyGrid(gridSize) : f));
  };

  // Convert a grid to a data URL via offscreen canvas
  const gridToDataUrl = (grid: string[][], size: number): string => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.clearRect(0, 0, size, size);
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const color = grid[r][c];
        if (color) {
          ctx.fillStyle = color;
          ctx.fillRect(c, r, 1, 1);
        }
      }
    }
    return canvas.toDataURL('image/png');
  };

  // Save Pixel Art Object
  const handleSavePixelArt = () => {
    const mainDataUri = gridToDataUrl(frames[0], gridSize);
    const name = objectName.trim() || 'كائن بكسل';

    let animations: Record<string, SpriteAnimation> | undefined = undefined;
    let defaultAnimationId: string | undefined = undefined;

    if (frames.length > 1) {
      const animFrames: SpriteAnimationFrame[] = frames.map((f, idx) => ({
        id: `frame_${idx}_${Math.random().toString(36).substring(2, 7)}`,
        imageData: gridToDataUrl(f, gridSize)
      }));

      animations = {
        walk: {
          id: 'walk',
          name: 'حركة البكسل',
          frameDurationMs,
          loop: true,
          frames: animFrames
        }
      };
      defaultAnimationId = 'walk';
    }

    const newObj: GameObject = {
      id: 'obj_' + Math.random().toString(36).substring(2, 9),
      name,
      tag: 'pixel',
      x: Math.floor(gameWidth / 2 - 24),
      y: Math.floor(gameHeight / 2 - 24),
      width: 48,
      height: 48,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      shapeType: 'image',
      color: theme === 'dark' ? '#ffffff' : '#000000',
      borderColor: theme === 'dark' ? '#ffffff' : '#000000',
      borderWidth: 0,
      imageData: mainDataUri,
      animations,
      defaultAnimationId,
      currentAnimationId: defaultAnimationId,
      hasCollision: true,
      colliderType: 'box',
      isDynamic: false,
      gravity: 0,
      vx: 0,
      vy: 0,
      bounce: 0,
      variables: {},
      script: '',
      nodeGraph: { nodes: [], connections: [] }
    };

    onAddObject(newObj);
    handleClose();
  };

  // Upload handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUri = event.target?.result as string;
      setPreviewImage(dataUri);
      if (!objectName || objectName === 'كائن بكسل') {
        setObjectName(file.name.replace(/\.[^/.]+$/, ''));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateFromUploadedImage = () => {
    if (!previewImage) return;
    const name = objectName.trim() || 'صورة مخصصة';
    const newObj: GameObject = {
      id: 'obj_' + Math.random().toString(36).substring(2, 9),
      name,
      tag: 'image',
      x: Math.floor(gameWidth / 2 - 30),
      y: Math.floor(gameHeight / 2 - 30),
      width: 60,
      height: 60,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      shapeType: 'image',
      color: theme === 'dark' ? '#ffffff' : '#000000',
      borderColor: theme === 'dark' ? '#ffffff' : '#000000',
      borderWidth: 0,
      imageData: previewImage,
      hasCollision: true,
      colliderType: 'box',
      isDynamic: false,
      gravity: 0,
      vx: 0,
      vy: 0,
      bounce: 0,
      variables: {},
      script: '',
      nodeGraph: { nodes: [], connections: [] }
    };

    onAddObject(newObj);
    handleClose();
  };

  // Geometric Shapes Handlers
  const handleCreateShape = (type: ShapeType) => {
    const name = objectName.trim() || (type === 'circle' ? 'دائرة' : 'مستطيل');
    const newObj: GameObject = {
      id: 'obj_' + Math.random().toString(36).substring(2, 9),
      name,
      tag: 'shape',
      x: Math.floor(gameWidth / 2 - 25),
      y: Math.floor(gameHeight / 2 - 25),
      width: 50,
      height: 50,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      shapeType: type,
      color: theme === 'dark' ? '#ffffff' : '#000000',
      borderColor: theme === 'dark' ? '#000000' : '#ffffff',
      borderWidth: 2,
      hasCollision: true,
      colliderType: type === 'circle' ? 'circle' : 'box',
      isDynamic: false,
      gravity: 0,
      vx: 0,
      vy: 0,
      bounce: 0,
      variables: {},
      script: '',
      nodeGraph: { nodes: [], connections: [] }
    };

    onAddObject(newObj);
    handleClose();
  };

  const handleClose = () => {
    setObjectName('كائن بكسل');
    setPreviewImage(null);
    setFrames([createEmptyGrid(gridSize)]);
    setActiveFrameIndex(0);
    setIsPlaying(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      onMouseUp={() => setIsMouseDown(false)}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 select-none"
    >
      <div className={`w-full max-w-3xl max-h-[92vh] flex flex-col border shadow-2xl overflow-hidden ${
        isDark ? 'bg-black text-white border-neutral-700' : 'bg-white text-black border-neutral-300'
      }`}>
        {/* Header */}
        <div className={`p-3.5 border-b flex items-center justify-between ${
          isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-neutral-100 border-neutral-300'
        }`}>
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <h2 className="font-bold text-sm tracking-wide">إضافة كائن جديد</h2>
          </div>
          <button 
            onClick={handleClose}
            className="p-1.5 border border-neutral-700 hover:border-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className={`flex border-b font-mono text-xs ${
          isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-neutral-100 border-neutral-300'
        }`}>
          <button
            onClick={() => setActiveTab('pixel')}
            className={`flex-1 py-2.5 text-center border-b-2 transition-colors cursor-pointer font-bold ${
              activeTab === 'pixel'
                ? (isDark ? 'border-white text-white bg-black' : 'border-black text-black bg-white')
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            محرر رسوم بكسل ارت (Pixel Art)
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2.5 text-center border-b-2 transition-colors cursor-pointer font-bold ${
              activeTab === 'upload'
                ? (isDark ? 'border-white text-white bg-black' : 'border-black text-black bg-white')
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            رفع صورة من جهازك
          </button>
          <button
            onClick={() => setActiveTab('shapes')}
            className={`flex-1 py-2.5 text-center border-b-2 transition-colors cursor-pointer font-bold ${
              activeTab === 'shapes'
                ? (isDark ? 'border-white text-white bg-black' : 'border-black text-black bg-white')
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            أشكال هندسية
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 flex-1 overflow-y-auto">
          {/* TAB 1: PIXEL ART EDITOR */}
          {activeTab === 'pixel' && (
            <div className="space-y-4">
              {/* Configuration Bar: Resolution & Object Name */}
              <div className={`p-3 border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isDark ? 'border-neutral-800 bg-neutral-950' : 'border-neutral-300 bg-neutral-50'
              }`}>
                {/* Object Name Input */}
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-xs font-bold whitespace-nowrap font-mono">اسم الكائن:</span>
                  <input
                    type="text"
                    value={objectName}
                    onChange={(e) => setObjectName(e.target.value)}
                    placeholder="اسم الكائن..."
                    className={`border px-3 py-1.5 text-xs outline-none flex-1 font-sans ${
                      isDark ? 'bg-black border-neutral-700 text-white focus:border-white' : 'bg-white border-neutral-300 text-black focus:border-black'
                    }`}
                  />
                </div>

                {/* Pixel Resolution Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold whitespace-nowrap font-mono">عدد البكسل:</span>
                  <div className="flex items-center gap-1 font-mono text-xs">
                    {([8, 16, 24, 32] as GridSize[]).map((size) => (
                      <button
                        key={size}
                        onClick={() => handleGridSizeChange(size)}
                        className={`px-2.5 py-1 border transition-all cursor-pointer font-bold ${
                          gridSize === size
                            ? (isDark ? 'bg-white text-black border-white' : 'bg-black text-white border-black')
                            : (isDark ? 'bg-black text-neutral-400 border-neutral-800 hover:border-neutral-600' : 'bg-white text-neutral-600 border-neutral-300 hover:border-black')
                        }`}
                      >
                        {size}×{size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Drawing Board & Tools Area */}
              <div className="flex flex-col md:flex-row gap-4 items-start">
                {/* Tool Palette */}
                <div className={`w-full md:w-48 p-3 border space-y-3 font-mono text-xs ${
                  isDark ? 'border-neutral-800 bg-neutral-950' : 'border-neutral-300 bg-neutral-50'
                }`}>
                  <span className="font-bold block text-[11px] opacity-75">أدوات الرسم:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setActiveTool('pen')}
                      className={`p-2 border flex items-center justify-center gap-1.5 cursor-pointer font-bold transition-all ${
                        activeTool === 'pen'
                          ? (isDark ? 'bg-white text-black border-white' : 'bg-black text-white border-black')
                          : 'border-neutral-700 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Paintbrush className="w-3.5 h-3.5" />
                      <span>قلم</span>
                    </button>

                    <button
                      onClick={() => setActiveTool('eraser')}
                      className={`p-2 border flex items-center justify-center gap-1.5 cursor-pointer font-bold transition-all ${
                        activeTool === 'eraser'
                          ? (isDark ? 'bg-white text-black border-white' : 'bg-black text-white border-black')
                          : 'border-neutral-700 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Eraser className="w-3.5 h-3.5" />
                      <span>ممحاة</span>
                    </button>
                  </div>

                  {/* Color Picker & Swatches */}
                  <div className="space-y-1.5 pt-2 border-t border-neutral-800">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] opacity-75">اختيار لون:</span>
                      <input
                        type="color"
                        value={currentColor}
                        onChange={(e) => {
                          setCurrentColor(e.target.value);
                          setActiveTool('pen');
                        }}
                        className="w-6 h-6 border cursor-pointer bg-transparent"
                      />
                    </div>
                    <div className="grid grid-cols-6 gap-1.5 pt-1">
                      {PALETTE.map((c) => (
                        <button
                          key={c}
                          onClick={() => {
                            setCurrentColor(c);
                            setActiveTool('pen');
                          }}
                          style={{ backgroundColor: c }}
                          className={`w-6 h-6 border transition-transform cursor-pointer ${
                            currentColor === c && activeTool === 'pen' ? 'scale-110 border-white ring-2 ring-purple-500' : 'border-neutral-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-neutral-800">
                    <button
                      onClick={handleClearCurrentFrame}
                      className="w-full py-1.5 px-2 border border-neutral-700 hover:border-red-500 text-red-400 hover:text-red-300 flex items-center justify-center gap-1.5 cursor-pointer transition-colors text-[11px]"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>مسح الإطار</span>
                    </button>
                  </div>
                </div>

                {/* Main Pixel Canvas Grid */}
                <div className="flex-1 flex flex-col items-center justify-center p-3 border border-neutral-800 bg-neutral-900/40 w-full">
                  <div 
                    style={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                      width: gridSize <= 16 ? '320px' : '384px',
                      height: gridSize <= 16 ? '320px' : '384px'
                    }}
                    className="border-2 border-neutral-700 bg-neutral-950 shadow-2xl cursor-crosshair touch-none"
                  >
                    {frames[activeFrameIndex]?.map((row, r) =>
                      row.map((cellColor, c) => (
                        <div
                          key={`${r}-${c}`}
                          onMouseDown={() => handleCellMouseDown(r, c)}
                          onMouseEnter={() => handleCellMouseEnter(r, c)}
                          style={{
                            backgroundColor: cellColor || 'transparent'
                          }}
                          className="border-[0.5px] border-neutral-800/60 hover:ring-1 hover:ring-white/80 transition-colors"
                        />
                      ))
                    )}
                  </div>
                </div>

                {/* Animation Preview Box */}
                <div className={`w-full md:w-36 p-3 border flex flex-col items-center justify-between gap-3 font-mono text-xs ${
                  isDark ? 'border-neutral-800 bg-neutral-950' : 'border-neutral-300 bg-neutral-50'
                }`}>
                  <span className="font-bold text-[11px] opacity-75">معاينة الحركة:</span>
                  <div className="w-24 h-24 border border-neutral-700 bg-neutral-900 flex items-center justify-center p-1 relative overflow-hidden">
                    {frames.length > 0 && (
                      <img
                        src={gridToDataUrl(isPlaying ? (frames[previewAnimFrame] || frames[0]) : frames[activeFrameIndex], gridSize)}
                        alt="Preview"
                        className="w-full h-full object-contain pixelated"
                        style={{ imageRendering: 'pixelated' }}
                      />
                    )}
                  </div>

                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={`w-full py-1.5 px-2 border flex items-center justify-center gap-1.5 cursor-pointer font-bold transition-all ${
                      isPlaying
                        ? 'bg-purple-600 text-white border-purple-500'
                        : (isDark ? 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-white' : 'bg-neutral-200 hover:bg-neutral-300 border-neutral-400 text-black')
                    }`}
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isPlaying ? 'إيقاف' : 'تشغيل'}</span>
                  </button>
                </div>
              </div>

              {/* Bottom Animation Timeline Bar (شريط أنميشن تحت) */}
              <div className={`p-3 border space-y-2 ${
                isDark ? 'border-neutral-800 bg-neutral-950' : 'border-neutral-300 bg-neutral-50'
              }`}>
                <div className="flex items-center justify-between font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">شريط أنميشن الإطارات (Timeline):</span>
                    <span className="opacity-60 text-[11px]">({frames.length} إطارات)</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleAddFrame}
                      className={`border px-2.5 py-1 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                        isDark ? 'bg-white text-black border-white' : 'bg-black text-white border-black'
                      }`}
                    >
                      <Plus className="w-3 h-3" />
                      <span>إطار جديد</span>
                    </button>

                    <button
                      onClick={handleDuplicateFrame}
                      className="border border-neutral-700 hover:border-white px-2 py-1 text-xs flex items-center gap-1 cursor-pointer transition-colors"
                      title="نسخ الإطار الحالي"
                    >
                      <Copy className="w-3 h-3" />
                      <span>نسخ</span>
                    </button>
                  </div>
                </div>

                {/* Frames List Thumbnails */}
                <div className="flex items-center gap-2 overflow-x-auto py-2">
                  {frames.map((f, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActiveFrameIndex(idx)}
                      className={`relative shrink-0 w-16 h-16 border-2 p-1 cursor-pointer flex flex-col items-center justify-center transition-all ${
                        activeFrameIndex === idx
                          ? 'border-purple-500 bg-purple-950/40 ring-1 ring-purple-500'
                          : 'border-neutral-800 bg-neutral-900 hover:border-neutral-600'
                      }`}
                    >
                      <img
                        src={gridToDataUrl(f, gridSize)}
                        alt={`Frame ${idx + 1}`}
                        className="w-10 h-10 object-contain pixelated"
                        style={{ imageRendering: 'pixelated' }}
                      />
                      <span className="text-[9px] font-mono opacity-80 mt-0.5">#{idx + 1}</span>

                      {frames.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFrame(idx);
                          }}
                          className="absolute -top-1.5 -left-1.5 w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 cursor-pointer"
                          title="حذف الإطار"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Final Save Button */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleSavePixelArt}
                  className={`px-6 py-2.5 text-xs font-black font-mono flex items-center gap-2 border transition-all cursor-pointer shadow-lg ${
                    isDark 
                      ? 'bg-white text-black border-white hover:bg-neutral-200' 
                      : 'bg-black text-white border-black hover:bg-neutral-800'
                  }`}
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ وإضافة الكائن للعبة</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: UPLOAD IMAGE */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold whitespace-nowrap font-mono">اسم الكائن:</span>
                <input
                  type="text"
                  value={objectName}
                  onChange={(e) => setObjectName(e.target.value)}
                  placeholder="اسم الصورة..."
                  className={`border px-3 py-1.5 text-xs outline-none flex-1 font-sans ${
                    isDark ? 'bg-black border-neutral-700 text-white focus:border-white' : 'bg-white border-neutral-300 text-black focus:border-black'
                  }`}
                />
              </div>

              <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-neutral-700/50">
                {previewImage ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-28 h-28 border p-2 flex items-center justify-center bg-neutral-900">
                      <img 
                        src={previewImage} 
                        alt="معاينة" 
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleCreateFromUploadedImage}
                        className={`font-bold text-xs px-5 py-2 transition-colors cursor-pointer border ${
                          isDark ? 'bg-white text-black border-white' : 'bg-black text-white border-black'
                        }`}
                      >
                        إضافة الصورة إلى اللعبة
                      </button>
                      <button
                        onClick={() => setPreviewImage(null)}
                        className="border border-neutral-700 text-xs px-4 py-2 opacity-70 hover:opacity-100 cursor-pointer"
                      >
                        تغيير الصورة
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center gap-3 cursor-pointer py-6">
                    <Upload className="w-10 h-10 opacity-60" />
                    <div className="text-center">
                      <span className="text-sm font-bold block mb-1">انقر لاختيار صورة من جهازك</span>
                      <span className="text-xs opacity-60 font-mono block">يدعم PNG, JPG, WebP, SVG</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: GEOMETRIC SHAPES */}
          {activeTab === 'shapes' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold whitespace-nowrap font-mono">اسم الكائن:</span>
                <input
                  type="text"
                  value={objectName}
                  onChange={(e) => setObjectName(e.target.value)}
                  placeholder="اسم الشكل..."
                  className={`border px-3 py-1.5 text-xs outline-none flex-1 font-sans ${
                    isDark ? 'bg-black border-neutral-700 text-white focus:border-white' : 'bg-white border-neutral-300 text-black focus:border-black'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleCreateShape('rectangle')}
                  className={`border p-6 flex flex-col items-center gap-3 transition-colors cursor-pointer ${
                    isDark ? 'border-neutral-800 hover:border-white bg-neutral-950' : 'border-neutral-300 hover:border-black bg-neutral-50'
                  }`}
                >
                  <Square className="w-12 h-12 stroke-[1.5]" />
                  <span className="text-sm font-bold">مستطيل (Rectangle)</span>
                  <span className="text-xs opacity-60 font-mono">مناسب للمنصات والجدران والأرضيات</span>
                </button>

                <button
                  onClick={() => handleCreateShape('circle')}
                  className={`border p-6 flex flex-col items-center gap-3 transition-colors cursor-pointer ${
                    isDark ? 'border-neutral-800 hover:border-white bg-neutral-950' : 'border-neutral-300 hover:border-black bg-neutral-50'
                  }`}
                >
                  <Circle className="w-12 h-12 stroke-[1.5]" />
                  <span className="text-sm font-bold">دائرة (Circle)</span>
                  <span className="text-xs opacity-60 font-mono">مناسب للكرات والعملات والأجسام الدائرية</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
