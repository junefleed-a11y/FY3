import React, { useState, useEffect, useRef } from 'react';
import { GameObject, SpriteAnimation, SpriteAnimationFrame } from '../types/engine';
import { BUILTIN_ASSETS } from '../utils/builtinAssets';
import { Language, ThemeMode, translations } from '../utils/i18n';
import { 
  Play, 
  Pause, 
  Plus, 
  Trash2, 
  Upload, 
  X, 
  Check, 
  Clock, 
  Repeat, 
  ArrowLeft, 
  ArrowRight,
  Film,
  Sparkles,
  Layers,
  Star
} from 'lucide-react';

interface AnimationStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  object: GameObject | null;
  onUpdateObject: (updated: GameObject) => void;
  language: Language;
  theme: ThemeMode;
}

export const AnimationStudioModal: React.FC<AnimationStudioModalProps> = ({
  isOpen,
  onClose,
  object,
  onUpdateObject,
  language,
  theme
}) => {
  if (!isOpen || !object) return null;

  const t = translations[language];

  // Initialize animations dictionary if empty
  const animations: Record<string, SpriteAnimation> = object.animations || {};
  const animationKeys = Object.keys(animations);

  // Active selected animation ID
  const [activeAnimId, setActiveAnimId] = useState<string>(() => {
    return object.defaultAnimationId || animationKeys[0] || '';
  });

  // Playback state in preview
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentFrameIdx, setCurrentFrameIdx] = useState<number>(0);
  const [showAssetPicker, setShowAssetPicker] = useState<boolean>(false);

  // Ensure an animation is selected if none active
  useEffect(() => {
    if (!activeAnimId && animationKeys.length > 0) {
      setActiveAnimId(animationKeys[0]);
    }
  }, [activeAnimId, animationKeys]);

  const activeAnimation: SpriteAnimation | undefined = animations[activeAnimId];

  // Live Preview loop
  useEffect(() => {
    if (!isPlaying || !activeAnimation || activeAnimation.frames.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentFrameIdx((prev) => {
        if (prev + 1 >= activeAnimation.frames.length) {
          return activeAnimation.loop ? 0 : prev;
        }
        return prev + 1;
      });
    }, Math.max(20, activeAnimation.frameDurationMs || 150));

    return () => clearInterval(interval);
  }, [isPlaying, activeAnimation]);

  // Keyboard shortcut to close (ESC)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Helper to commit changes to object
  const saveAnimations = (updatedAnimations: Record<string, SpriteAnimation>, newDefaultId?: string) => {
    const defaultId = newDefaultId !== undefined ? newDefaultId : (object.defaultAnimationId || Object.keys(updatedAnimations)[0] || '');
    onUpdateObject({
      ...object,
      animations: updatedAnimations,
      defaultAnimationId: defaultId,
      currentAnimationId: activeAnimId || defaultId
    });
  };

  // Add a new animation
  const handleCreateAnimation = () => {
    const newId = 'anim_' + Math.random().toString(36).substring(2, 8);
    const count = animationKeys.length + 1;
    const initialFrame: SpriteAnimationFrame = {
      id: 'frame_' + Math.random().toString(36).substring(2, 8),
      imageData: object.imageData || BUILTIN_ASSETS[0].svgDataUri
    };

    const newAnim: SpriteAnimation = {
      id: newId,
      name: `حركة ${count}`,
      frameDurationMs: 150,
      loop: true,
      frames: [initialFrame]
    };

    const updated = {
      ...animations,
      [newId]: newAnim
    };

    saveAnimations(updated, object.defaultAnimationId || newId);
    setActiveAnimId(newId);
    setCurrentFrameIdx(0);
  };

  // Delete an animation
  const handleDeleteAnimation = (animId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = { ...animations };
    delete updated[animId];
    const remainingKeys = Object.keys(updated);
    const nextDefault = object.defaultAnimationId === animId ? (remainingKeys[0] || '') : object.defaultAnimationId;
    saveAnimations(updated, nextDefault);
    if (activeAnimId === animId) {
      setActiveAnimId(remainingKeys[0] || '');
      setCurrentFrameIdx(0);
    }
  };

  // Set animation as default
  const handleSetDefaultAnimation = (animId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    saveAnimations(animations, animId);
  };

  // Update active animation properties
  const handleUpdateActiveAnim = (updater: (prev: SpriteAnimation) => SpriteAnimation) => {
    if (!activeAnimation) return;
    const updatedAnim = updater(activeAnimation);
    const updated = {
      ...animations,
      [activeAnimId]: updatedAnim
    };
    saveAnimations(updated);
  };

  // Upload frame images from device
  const handleUploadFrames = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !activeAnimation) return;

    const fileList = Array.from(files);
    let loadedCount = 0;
    const newFrames: SpriteAnimationFrame[] = [];

    fileList.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          newFrames.push({
            id: 'frame_' + Math.random().toString(36).substring(2, 9),
            imageData: dataUrl
          });
        }
        loadedCount++;
        if (loadedCount === fileList.length) {
          handleUpdateActiveAnim((prev) => ({
            ...prev,
            frames: [...prev.frames, ...newFrames]
          }));
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  // Add built-in asset as frame
  const handleSelectBuiltinAsset = (svgUri: string) => {
    if (!activeAnimation) return;
    handleUpdateActiveAnim((prev) => ({
      ...prev,
      frames: [
        ...prev.frames,
        {
          id: 'frame_' + Math.random().toString(36).substring(2, 9),
          imageData: svgUri
        }
      ]
    }));
    setShowAssetPicker(false);
  };

  // Move frame left/right in sequence
  const handleMoveFrame = (idx: number, direction: -1 | 1) => {
    if (!activeAnimation) return;
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= activeAnimation.frames.length) return;

    const newFrames = [...activeAnimation.frames];
    const [moved] = newFrames.splice(idx, 1);
    newFrames.splice(targetIdx, 0, moved);

    handleUpdateActiveAnim((prev) => ({
      ...prev,
      frames: newFrames
    }));

    if (currentFrameIdx === idx) {
      setCurrentFrameIdx(targetIdx);
    }
  };

  // Delete a specific frame
  const handleDeleteFrame = (idx: number) => {
    if (!activeAnimation || activeAnimation.frames.length <= 1) return;
    const newFrames = activeAnimation.frames.filter((_, i) => i !== idx);
    handleUpdateActiveAnim((prev) => ({
      ...prev,
      frames: newFrames
    }));
    if (currentFrameIdx >= newFrames.length) {
      setCurrentFrameIdx(newFrames.length - 1);
    }
  };

  const currentFrame = activeAnimation?.frames[currentFrameIdx] || activeAnimation?.frames[0];

  return (
    <div className="fixed inset-0 z-50 bg-black text-white flex flex-col select-none font-sans overflow-hidden">
      {/* Top Header Bar */}
      <div className="h-14 px-6 border-b border-neutral-800 flex items-center justify-between shrink-0 bg-black font-mono">
        <div className="flex items-center gap-3">
          <div className="bg-white text-black px-2 py-0.5 font-bold text-xs">
            FY3
          </div>
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4" />
            <h1 className="font-bold text-sm tracking-tight">استوديو الأنميشن (Animation Studio)</h1>
          </div>
          <span className="opacity-40">|</span>
          <span className="text-xs opacity-75">
            الكائن: <strong className="text-white underline">{object.name}</strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] opacity-60 hidden md:inline">
            اضغط ESC أو زر الحفظ والإغلاق للعودة
          </span>
          <button
            onClick={onClose}
            className="bg-white text-black hover:bg-neutral-200 border border-white px-4 py-1.5 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>حفظ وإغلاق</span>
          </button>
        </div>
      </div>

      {/* Main Studio Body: 3-column / split layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Animations List */}
        <div className="w-72 border-r border-neutral-800 flex flex-col shrink-0 bg-neutral-950 font-mono">
          <div className="p-3 border-b border-neutral-800 flex items-center justify-between">
            <span className="text-xs font-bold flex items-center gap-1.5 opacity-80">
              <Film className="w-3.5 h-3.5" />
              <span>قائمة الأنميشن ({animationKeys.length})</span>
            </span>
            <button
              onClick={handleCreateAnimation}
              className="bg-white text-black hover:bg-neutral-200 px-2.5 py-1 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>إضافة</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {animationKeys.length === 0 ? (
              <div className="text-center py-12 text-xs opacity-50 border border-dashed border-neutral-800 p-4">
                لا يوجد أنميشن بعد.
                <br />
                اضغط على "إضافة" لإنشاء أول حركة للكائن.
              </div>
            ) : (
              animationKeys.map((key) => {
                const anim = animations[key];
                const isActive = key === activeAnimId;
                const isDefault = object.defaultAnimationId === key;

                return (
                  <div
                    key={key}
                    onClick={() => {
                      setActiveAnimId(key);
                      setCurrentFrameIdx(0);
                    }}
                    className={`p-3 border transition-all cursor-pointer flex flex-col gap-1.5 relative ${
                      isActive
                        ? 'border-white bg-neutral-900 text-white'
                        : 'border-neutral-800 hover:border-neutral-600 bg-black text-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs truncate max-w-[120px]">
                        {anim.name}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          title={isDefault ? 'الأنميشن الافتراضي' : 'تعيين كأنميشن افتراضي'}
                          onClick={(e) => handleSetDefaultAnimation(key, e)}
                          className={`p-1 border text-[10px] flex items-center gap-1 cursor-pointer transition-colors ${
                            isDefault
                              ? 'bg-white text-black border-white font-bold'
                              : 'border-neutral-800 text-neutral-400 hover:text-white'
                          }`}
                        >
                          <Star className="w-2.5 h-2.5 fill-current" />
                          <span>{isDefault ? 'افتراضي' : 'اجعله افتراضي'}</span>
                        </button>

                        <button
                          title="حذف الأنميشن"
                          onClick={(e) => handleDeleteAnimation(key, e)}
                          className="p-1 text-neutral-500 hover:text-red-500 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] opacity-60">
                      <span>{anim.frames.length} إطارات</span>
                      <span>{anim.frameDurationMs}ms</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Center & Right Area: Active Animation Inspector + Live Preview & Frame Strip */}
        {activeAnimation ? (
          <div className="flex-1 flex flex-col overflow-hidden bg-black">
            {/* Top Bar for Active Animation Settings */}
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between flex-wrap gap-4 font-mono bg-neutral-950">
              <div className="flex items-center gap-3">
                <label className="text-xs opacity-70">اسم الأنميشن:</label>
                <input
                  type="text"
                  value={activeAnimation.name}
                  onChange={(e) => handleUpdateActiveAnim((prev) => ({ ...prev, name: e.target.value }))}
                  className="bg-black border border-neutral-700 focus:border-white px-2 py-1 text-xs text-white outline-none font-bold"
                />
              </div>

              <div className="flex items-center gap-6">
                {/* Frame Duration in ms */}
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 opacity-70" />
                  <label className="text-xs opacity-70">مدة الإطار:</label>
                  <input
                    type="number"
                    min="30"
                    max="2000"
                    step="10"
                    value={activeAnimation.frameDurationMs}
                    onChange={(e) => handleUpdateActiveAnim((prev) => ({ ...prev, frameDurationMs: parseInt(e.target.value) || 150 }))}
                    className="w-20 bg-black border border-neutral-700 px-2 py-1 text-xs text-white outline-none font-mono"
                  />
                  <span className="text-[10px] opacity-60">ms</span>
                </div>

                {/* Looping toggle */}
                <button
                  onClick={() => handleUpdateActiveAnim((prev) => ({ ...prev, loop: !prev.loop }))}
                  className={`px-2.5 py-1 text-xs font-mono border flex items-center gap-1.5 cursor-pointer transition-colors ${
                    activeAnimation.loop ? 'bg-white text-black border-white' : 'border-neutral-800 text-neutral-400'
                  }`}
                >
                  <Repeat className="w-3 h-3" />
                  <span>تكرار مستمر</span>
                </button>
              </div>
            </div>

            {/* Middle: Large Live Preview Stage */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#090909]">
              {/* Pattern Background for transparent assets */}
              <div 
                className="w-72 h-72 border-2 border-neutral-700 flex items-center justify-center relative shadow-2xl bg-black"
                style={{
                  backgroundImage: `radial-gradient(#222 1px, transparent 1px)`,
                  backgroundSize: '16px 16px'
                }}
              >
                {currentFrame?.imageData ? (
                  <img
                    src={currentFrame.imageData}
                    alt="Preview"
                    className="max-w-[85%] max-h-[85%] object-contain block drop-shadow-md"
                  />
                ) : (
                  <div className="text-xs opacity-50 font-mono">لا توجد صورة للإطار</div>
                )}

                {/* Frame Counter Badge */}
                <div className="absolute top-2 right-2 bg-black/80 border border-neutral-700 px-2 py-0.5 text-[10px] font-mono text-white">
                  إطار {currentFrameIdx + 1} / {activeAnimation.frames.length}
                </div>
              </div>

              {/* Playback Controls Bar */}
              <div className="mt-4 flex items-center gap-3 bg-neutral-950 border border-neutral-800 px-4 py-2 font-mono">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="bg-white text-black hover:bg-neutral-200 px-3 py-1 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  <span>{isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}</span>
                </button>

                <div className="h-4 w-[1px] bg-neutral-800" />

                <button
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentFrameIdx((prev) => (prev > 0 ? prev - 1 : activeAnimation.frames.length - 1));
                  }}
                  className="p-1 hover:text-white text-neutral-400 cursor-pointer"
                  title="الإطار السابق"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>

                <span className="text-xs opacity-80 min-w-[50px] text-center">
                  #{currentFrameIdx + 1}
                </span>

                <button
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentFrameIdx((prev) => (prev + 1 < activeAnimation.frames.length ? prev + 1 : 0));
                  }}
                  className="p-1 hover:text-white text-neutral-400 cursor-pointer"
                  title="الإطار التالي"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Bottom: Frames Timeline / Strip */}
            <div className="h-44 border-t border-neutral-800 bg-neutral-950 p-4 flex flex-col font-mono">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold opacity-80 flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5" />
                  <span>شريط إطارات الأنميشن ({activeAnimation.frames.length})</span>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAssetPicker(true)}
                    className="border border-neutral-700 hover:border-white px-2.5 py-1 text-xs flex items-center gap-1.5 transition-colors cursor-pointer text-neutral-300 hover:text-white"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>مكتبة الرسوم</span>
                  </button>

                  <label className="bg-white text-black hover:bg-neutral-200 border border-white px-3 py-1 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer">
                    <Upload className="w-3 h-3" />
                    <span>رفع صور من الجهاز</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleUploadFrames}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Frames Horizontal Scrollable Strip */}
              <div className="flex-1 flex items-center gap-3 overflow-x-auto pb-2">
                {activeAnimation.frames.map((frame, idx) => {
                  const isCurrent = idx === currentFrameIdx;

                  return (
                    <div
                      key={frame.id}
                      onClick={() => {
                        setIsPlaying(false);
                        setCurrentFrameIdx(idx);
                      }}
                      className={`h-24 w-24 shrink-0 border-2 p-1.5 flex flex-col justify-between cursor-pointer transition-all relative ${
                        isCurrent
                          ? 'border-white bg-neutral-900 shadow-lg scale-105'
                          : 'border-neutral-800 hover:border-neutral-600 bg-black'
                      }`}
                    >
                      {/* Frame Number */}
                      <span className="text-[10px] font-bold opacity-75">#{idx + 1}</span>

                      {/* Image Thumbnail */}
                      <div className="flex-1 flex items-center justify-center overflow-hidden my-0.5">
                        <img
                          src={frame.imageData}
                          alt={`Frame ${idx + 1}`}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>

                      {/* Frame actions: reorder & delete */}
                      <div className="flex items-center justify-between pt-1 border-t border-neutral-800 text-[10px]" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          {idx > 0 && (
                            <button
                              onClick={() => handleMoveFrame(idx, -1)}
                              className="hover:text-white text-neutral-500 cursor-pointer"
                              title="تحريك للخلف"
                            >
                              <ArrowRight className="w-2.5 h-2.5" />
                            </button>
                          )}
                          {idx < activeAnimation.frames.length - 1 && (
                            <button
                              onClick={() => handleMoveFrame(idx, 1)}
                              className="hover:text-white text-neutral-500 cursor-pointer"
                              title="تحريك للأمام"
                            >
                              <ArrowLeft className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>

                        {activeAnimation.frames.length > 1 && (
                          <button
                            onClick={() => handleDeleteFrame(idx)}
                            className="hover:text-red-500 text-neutral-500 cursor-pointer"
                            title="حذف هذا الإطار"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center font-mono text-xs opacity-50">
            اختر أنميشن من القائمة الجانبية أو اضغط "إضافة" للبدء.
          </div>
        )}
      </div>

      {/* Built-in Asset Picker Modal */}
      {showAssetPicker && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6">
          <div className="w-full max-w-2xl border border-white bg-black p-6 font-mono flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <h3 className="font-bold text-sm">اختر شكلاً من مكتبة الرسوم المدمجة لإضافته كإطار</h3>
              <button
                onClick={() => setShowAssetPicker(false)}
                className="p-1 hover:text-white text-neutral-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 flex-1 overflow-y-auto grid grid-cols-3 sm:grid-cols-4 gap-3">
              {BUILTIN_ASSETS.map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => handleSelectBuiltinAsset(asset.svgDataUri)}
                  className="border border-neutral-800 hover:border-white p-3 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <img src={asset.svgDataUri} alt={asset.name} className="w-12 h-12 object-contain" />
                  <span className="text-[10px] text-center truncate w-full">{asset.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
