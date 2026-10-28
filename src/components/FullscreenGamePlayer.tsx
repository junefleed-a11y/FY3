import React, { useRef, useEffect, useState } from 'react';
import { GameProject } from '../types/engine';
import { GameRuntime } from '../engine/GameRuntime';
import { Language, ThemeMode, translations } from '../utils/i18n';
import { 
  Square, 
  RotateCcw
} from 'lucide-react';

interface FullscreenGamePlayerProps {
  project: GameProject;
  onStop: () => void;
  language: Language;
  theme: ThemeMode;
}

export const FullscreenGamePlayer: React.FC<FullscreenGamePlayerProps> = ({
  project,
  onStop,
  language
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const runtimeRef = useRef<GameRuntime | null>(null);

  const [displaySize, setDisplaySize] = useState<{ width: number; height: number }>({
    width: project.settings.width,
    height: project.settings.height
  });
  const [fps, setFps] = useState(60);

  const frameCountRef = useRef(0);
  const lastFpsUpdateRef = useRef(performance.now());

  const effectiveBgColor = project.settings.worldBackgroundColor || project.settings.backgroundColor || '#333333';

  // Responsive Screen Fitting to fill screen completely while preserving aspect ratio
  useEffect(() => {
    const updateSize = () => {
      const availW = window.innerWidth;
      const availH = window.innerHeight;
      const projW = Math.max(100, project.settings.width);
      const projH = Math.max(100, project.settings.height);

      const aspect = projW / projH;
      let targetW = availW;
      let targetH = targetW / aspect;

      if (targetH > availH) {
        targetH = availH;
        targetW = targetH * aspect;
      }

      setDisplaySize({
        width: Math.floor(targetW),
        height: Math.floor(targetH)
      });
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [project.settings.width, project.settings.height]);

  // FPS Tracker
  useEffect(() => {
    let animId: number;
    const calcFps = (time: number) => {
      frameCountRef.current++;
      if (time - lastFpsUpdateRef.current >= 500) {
        const currentFps = Math.round((frameCountRef.current * 1000) / (time - lastFpsUpdateRef.current));
        setFps(Math.min(60, currentFps));
        frameCountRef.current = 0;
        lastFpsUpdateRef.current = time;
      }
      animId = requestAnimationFrame(calcFps);
    };
    animId = requestAnimationFrame(calcFps);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Launch and bind runtime on mounted canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create fresh runtime
    const runtime = new GameRuntime(project);
    runtimeRef.current = runtime;

    runtime.attachCanvas(canvas);
    runtime.start();
    canvas.focus();

    return () => {
      if (runtimeRef.current) {
        runtimeRef.current.stop();
        runtimeRef.current = null;
      }
    };
  }, [project]);

  // Keyboard navigation & ESC handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onStop();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStop]);

  const handleRestart = () => {
    if (runtimeRef.current && canvasRef.current) {
      runtimeRef.current.stop();
      runtimeRef.current = new GameRuntime(project);
      runtimeRef.current.attachCanvas(canvasRef.current);
      runtimeRef.current.start();
      canvasRef.current.focus();
    }
  };

  return (
    <div 
      ref={containerRef}
      style={{
        backgroundColor: effectiveBgColor,
        backgroundImage: project.settings.worldBackgroundImage ? `url(${project.settings.worldBackgroundImage})` : undefined,
        backgroundRepeat: 'repeat',
        backgroundPosition: 'center'
      }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center select-none overflow-hidden cursor-default"
      tabIndex={-1}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />

      {/* Immersive Game Canvas Container - Cleanly filling screen */}
      <div className="relative z-10 flex items-center justify-center w-full h-full p-2 sm:p-4">
        <canvas
          ref={canvasRef}
          width={project.settings.width}
          height={project.settings.height}
          tabIndex={0}
          onClick={() => canvasRef.current?.focus()}
          className="block outline-none shadow-2xl border border-neutral-700/60 focus:border-white transition-all"
          style={{
            width: `${displaySize.width}px`,
            height: `${displaySize.height}px`,
            maxWidth: '100%',
            maxHeight: '100%',
            backgroundColor: effectiveBgColor
          }}
        />
      </div>

      {/* Tiny Top HUD Bar: Only 3 items as requested: إعادة تشغيل + خروج + رقم فريمات */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-black/90 text-white border border-neutral-700 px-3 py-1.5 flex items-center gap-3 backdrop-blur-md shadow-2xl font-mono text-xs">
          {/* 1. FPS Counter (رقم فريمات جهاز) */}
          <div className="flex items-center gap-1 text-[11px] px-2 py-0.5 bg-neutral-900 border border-neutral-800">
            <span className="opacity-60">FPS:</span>
            <span className="font-bold text-emerald-400">{fps}</span>
          </div>

          {/* 2. Restart Button (إعادة تشغيل) */}
          <button
            onClick={handleRestart}
            className="px-2.5 py-1 hover:bg-neutral-800 border border-neutral-700 transition-colors text-xs flex items-center gap-1.5 cursor-pointer font-bold"
            title="إعادة تشغيل اللعبة"
          >
            <RotateCcw className="w-3.5 h-3.5 text-yellow-400" />
            <span>إعادة تشغيل</span>
          </button>

          {/* 3. Exit Button (خروج) */}
          <button
            onClick={onStop}
            className="bg-white text-black hover:bg-neutral-200 border border-white px-2.5 py-1 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="خروج من اللعبة (ESC)"
          >
            <Square className="w-3.5 h-3.5 fill-current text-red-600" />
            <span>خروج</span>
          </button>
        </div>
      </div>
    </div>
  );
};
