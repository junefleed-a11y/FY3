import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameObject, GameSettings, GameLayer } from '../types/engine';
import { Language, ThemeMode, translations } from '../utils/i18n';
import { 
  Move, 
  Maximize2, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Navigation,
  Crosshair,
  Image as ImageIcon,
  Palette,
  Upload,
  X
} from 'lucide-react';

export type TransformTool = 'move' | 'scale' | 'rotate';

interface SceneViewportProps {
  settings: GameSettings;
  layers?: GameLayer[];
  objects: GameObject[];
  selectedObjectId: string | null;
  onSelectObject: (id: string | null) => void;
  onUpdateObject: (updated: GameObject) => void;
  onUpdateSettings?: (updater: (prev: GameSettings) => GameSettings) => void;
  isPlaying: boolean;
  showGrid: boolean;
  language: Language;
  theme: ThemeMode;
}

export const SceneViewport: React.FC<SceneViewportProps> = ({
  settings,
  layers = [],
  objects,
  selectedObjectId,
  onSelectObject,
  onUpdateObject,
  onUpdateSettings,
  isPlaying,
  showGrid,
  language,
  theme
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Active Tool
  const [activeTool, setActiveTool] = useState<TransformTool>('move');
  
  // Infinite World Pan & Zoom State
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const [mouseWorldCoords, setMouseWorldCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Transform Interaction State
  const [isInteracting, setIsInteracting] = useState<boolean>(false);
  const [interactionType, setInteractionType] = useState<'move' | 'scale' | 'rotate' | null>(null);
  const [scaleHandle, setScaleHandle] = useState<'nw' | 'ne' | 'se' | 'sw' | null>(null);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [initialTransform, setInitialTransform] = useState<{ x: number; y: number; width: number; height: number; rotation: number }>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    rotation: 0
  });

  const t = translations[language];

  // Image and Pattern cache
  const imagesMapRef = useRef<Map<string, HTMLImageElement>>(new Map());

  const getOrLoadImage = useCallback((src: string) => {
    if (imagesMapRef.current.has(src)) {
      return imagesMapRef.current.get(src)!;
    }
    const img = new Image();
    img.onload = () => {
      imagesMapRef.current.set(src, img);
      drawEditorScene();
    };
    img.src = src;
    imagesMapRef.current.set(src, img);
    return img;
  }, []);

  // Keyboard shortcuts (W, E, R)
  useEffect(() => {
    const handleKeyShortcut = (e: KeyboardEvent) => {
      if (isPlaying) return;
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      if (e.key === 'w' || e.key === 'W') setActiveTool('move');
      if (e.key === 'e' || e.key === 'E') setActiveTool('scale');
      if (e.key === 'r' || e.key === 'R') setActiveTool('rotate');
    };

    window.addEventListener('keydown', handleKeyShortcut);
    return () => window.removeEventListener('keydown', handleKeyShortcut);
  }, [isPlaying]);

  // Handle Resize of Container to ensure Canvas always covers 100% full viewport
  useEffect(() => {
    const updateCanvasDimensions = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;
      const rect = container.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        if (canvas.width !== Math.floor(rect.width) || canvas.height !== Math.floor(rect.height)) {
          canvas.width = Math.floor(rect.width);
          canvas.height = Math.floor(rect.height);
          drawEditorScene();
        }
      }
    };

    updateCanvasDimensions();
    const observer = new ResizeObserver(updateCanvasDimensions);
    if (containerRef.current) observer.observe(containerRef.current);
    window.addEventListener('resize', updateCanvasDimensions);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateCanvasDimensions);
    };
  }, []);

  // Handle Mouse Wheel Zoom
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const zoomFactor = -e.deltaY * 0.0015;
    setZoom((prevZoom) => {
      const newZoom = Math.min(6, Math.max(0.15, prevZoom + zoomFactor * prevZoom));
      return parseFloat(newZoom.toFixed(2));
    });
  };

  // Convert Client Screen (x, y) to Infinite World coordinates
  const screenToWorld = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const screenX = clientX - rect.left;
    const screenY = clientY - rect.top;

    const originX = canvas.width / 2 + panOffset.x;
    const originY = canvas.height / 2 + panOffset.y;

    const worldX = Math.round((screenX - originX) / zoom);
    const worldY = Math.round((screenY - originY) / zoom);
    return { x: worldX, y: worldY };
  }, [panOffset, zoom]);

  // Draw scene in edit mode with infinite background, layers, grid, and camera bounds
  const drawEditorScene = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width: camW, height: camH, backgroundColor, worldBackgroundColor, worldBackgroundImage } = settings;
    const isDark = theme === 'dark';

    // 1. Clear Full Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. ENTIRE INFINITE WORLD BACKGROUND COLOR
    const effectiveBg = settings.worldBackgroundColor || settings.backgroundColor || layers.find(l => l.type === 'world' && l.backgroundColor)?.backgroundColor || '#333333';
    ctx.fillStyle = effectiveBg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    // Center world origin (0, 0) in canvas
    const originX = canvas.width / 2 + panOffset.x;
    const originY = canvas.height / 2 + panOffset.y;
    ctx.translate(originX, originY);
    ctx.scale(zoom, zoom);

    // Visible World Boundaries in World Space
    const visibleLeft = (-originX) / zoom;
    const visibleTop = (-originY) / zoom;
    const visibleRight = (canvas.width - originX) / zoom;
    const visibleBottom = (canvas.height - originY) / zoom;
    const visibleW = visibleRight - visibleLeft;
    const visibleH = visibleBottom - visibleTop;

    // 3. ENTIRE INFINITE WORLD BACKGROUND PATTERN / IMAGE (Repeating endlessly)
    if (worldBackgroundImage) {
      const bgImg = getOrLoadImage(worldBackgroundImage);
      if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
        try {
          const pattern = ctx.createPattern(bgImg, 'repeat');
          if (pattern) {
            ctx.fillStyle = pattern;
            ctx.fillRect(visibleLeft, visibleTop, visibleW, visibleH);
          }
        } catch {
          // Fallback if cross-origin
        }
      }
    }

    // 4. Draw Infinite Grid spanning from -∞ to +∞
    if (showGrid) {
      const gridSize = settings.gridSize || 40;
      const startGridX = Math.floor(visibleLeft / gridSize) * gridSize;
      const endGridX = Math.ceil(visibleRight / gridSize) * gridSize;
      const startGridY = Math.floor(visibleTop / gridSize) * gridSize;
      const endGridY = Math.ceil(visibleBottom / gridSize) * gridSize;

      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.06)';
      ctx.lineWidth = 1 / zoom;
      ctx.beginPath();
      for (let gx = startGridX; gx <= endGridX; gx += gridSize) {
        ctx.moveTo(gx, visibleTop);
        ctx.lineTo(gx, visibleBottom);
      }
      for (let gy = startGridY; gy <= endGridY; gy += gridSize) {
        ctx.moveTo(visibleLeft, gy);
        ctx.lineTo(visibleRight, gy);
      }
      ctx.stroke();

      // Major grid lines
      const majorGrid = gridSize * 5;
      const startMajorX = Math.floor(visibleLeft / majorGrid) * majorGrid;
      const endMajorX = Math.ceil(visibleRight / majorGrid) * majorGrid;
      const startMajorY = Math.floor(visibleTop / majorGrid) * majorGrid;
      const endMajorY = Math.ceil(visibleBottom / majorGrid) * majorGrid;

      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.12)';
      ctx.lineWidth = 1 / zoom;
      ctx.beginPath();
      for (let mx = startMajorX; mx <= endMajorX; mx += majorGrid) {
        ctx.moveTo(mx, visibleTop);
        ctx.lineTo(mx, visibleBottom);
      }
      for (let my = startMajorY; my <= endMajorY; my += majorGrid) {
        ctx.moveTo(visibleLeft, my);
        ctx.lineTo(visibleRight, my);
      }
      ctx.stroke();
    }

    // 5. Draw Coordinate Axes (X and Y main lines)
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.28)' : 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 1.5 / zoom;
    ctx.beginPath();
    ctx.moveTo(visibleLeft, 0);
    ctx.lineTo(visibleRight, 0);
    ctx.moveTo(0, visibleTop);
    ctx.lineTo(0, visibleBottom);
    ctx.stroke();
    // Axes stroke completed cleanly without bounding box or coordinate overlays

    // Helper to get active frame image for an object (Animation support!)
    const getObjectImageSrc = (obj: GameObject): string | undefined => {
      if (obj.animations) {
        const animId = obj.currentAnimationId || obj.defaultAnimationId || Object.keys(obj.animations)[0];
        const anim = obj.animations[animId];
        if (anim && anim.frames.length > 0) {
          const duration = Math.max(30, anim.frameDurationMs || 150);
          const now = Date.now();
          const frameIndex = Math.floor(now / duration) % anim.frames.length;
          return anim.frames[frameIndex]?.imageData || obj.imageData;
        }
      }
      return obj.imageData;
    };

    // 7. Draw Layered Objects (Grouped by layer order)
    const effectiveLayers = layers.length > 0 ? layers : [{ id: 'default_layer', name: 'الافتراضية', type: 'world' as const, visible: true, locked: false }];

    for (const layer of effectiveLayers) {
      if (!layer.visible) continue;

      // Draw Layer Background Image if any
      if (layer.backgroundImage) {
        const layerBg = getOrLoadImage(layer.backgroundImage);
        if (layerBg && layerBg.complete) {
          ctx.drawImage(layerBg, 0, 0, camW, camH);
        }
      }

      const layerObjects = objects.filter(o => o.layerId === layer.id || (!o.layerId && layer.id === effectiveLayers[0]?.id));

      for (const obj of layerObjects) {
        if (!obj.visible) continue;

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, obj.opacity ?? 1));

        const cx = obj.x + obj.width / 2;
        const cy = obj.y + obj.height / 2;
        ctx.translate(cx, cy);
        if (obj.rotation) {
          ctx.rotate((obj.rotation * Math.PI) / 180);
        }

        const activeImgSrc = getObjectImageSrc(obj);

        if (obj.shapeType === 'image' || activeImgSrc) {
          const img = activeImgSrc ? getOrLoadImage(activeImgSrc) : null;
          if (img && img.complete) {
            ctx.drawImage(img, -obj.width / 2, -obj.height / 2, obj.width, obj.height);
          } else {
            ctx.fillStyle = obj.color || '#ffffff';
            ctx.fillRect(-obj.width / 2, -obj.height / 2, obj.width, obj.height);
          }
        } else if (obj.shapeType === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, Math.min(obj.width, obj.height) / 2, 0, Math.PI * 2);
          ctx.fillStyle = obj.color || '#ffffff';
          ctx.fill();
          if (obj.borderWidth && obj.borderWidth > 0) {
            ctx.lineWidth = obj.borderWidth / zoom;
            ctx.strokeStyle = obj.borderColor || '#000000';
            ctx.stroke();
          }
        } else {
          ctx.fillStyle = obj.color || '#ffffff';
          ctx.fillRect(-obj.width / 2, -obj.height / 2, obj.width, obj.height);
          if (obj.borderWidth && obj.borderWidth > 0) {
            ctx.lineWidth = obj.borderWidth / zoom;
            ctx.strokeStyle = obj.borderColor || '#000000';
            ctx.strokeRect(-obj.width / 2, -obj.height / 2, obj.width, obj.height);
          }
        }

        ctx.restore();
      }
    }

    // 8. Draw Selected Object Transform Gizmos (Move, Scale, Rotate)
    const selected = objects.find(o => o.id === selectedObjectId);
    if (selected && selected.visible) {
      ctx.save();
      const cx = selected.x + selected.width / 2;
      const cy = selected.y + selected.height / 2;
      ctx.translate(cx, cy);
      if (selected.rotation) {
        ctx.rotate((selected.rotation * Math.PI) / 180);
      }

      const halfW = selected.width / 2;
      const halfH = selected.height / 2;

      // Selection bounding box
      ctx.strokeStyle = isDark ? '#ffffff' : '#000000';
      ctx.lineWidth = 1.5 / zoom;
      ctx.strokeRect(-halfW, -halfH, selected.width, selected.height);

      // Tool: SCALE (Corner handles)
      const handleSize = 8 / zoom;
      ctx.fillStyle = isDark ? '#ffffff' : '#000000';
      ctx.fillRect(-halfW - handleSize / 2, -halfH - handleSize / 2, handleSize, handleSize);
      ctx.fillRect(halfW - handleSize / 2, -halfH - handleSize / 2, handleSize, handleSize);
      ctx.fillRect(halfW - handleSize / 2, halfH - handleSize / 2, handleSize, handleSize);
      ctx.fillRect(-halfW - handleSize / 2, halfH - handleSize / 2, handleSize, handleSize);

      // Tool: ROTATE (Top stem and handle)
      const stemLength = 24 / zoom;
      ctx.beginPath();
      ctx.moveTo(0, -halfH);
      ctx.lineTo(0, -halfH - stemLength);
      ctx.strokeStyle = isDark ? '#ffffff' : '#000000';
      ctx.lineWidth = 1.5 / zoom;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, -halfH - stemLength, 5 / zoom, 0, Math.PI * 2);
      ctx.fillStyle = isDark ? '#ffffff' : '#000000';
      ctx.fill();
      ctx.stroke();

      // Tool: MOVE (Center pivot cross)
      ctx.beginPath();
      ctx.arc(0, 0, 3 / zoom, 0, Math.PI * 2);
      ctx.fillStyle = isDark ? '#ffffff' : '#000000';
      ctx.fill();

      ctx.restore();
    }

    ctx.restore(); // Restore world translation
  }, [settings, layers, objects, selectedObjectId, activeTool, zoom, panOffset, showGrid, theme, getOrLoadImage]);

  // Re-render when dependencies change
  useEffect(() => {
    drawEditorScene();
  }, [drawEditorScene]);

  // Animation frame loop to continuously render animated objects in viewport
  useEffect(() => {
    let animId: number;
    const animate = () => {
      drawEditorScene();
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [drawEditorScene]);

  // Mouse Down: Selection, Handle Dragging, or Right-Click Pan
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // 1. Right Click or Middle Click -> Pan Infinite World
    if (e.button === 2 || e.button === 1) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      return;
    }

    // 2. Left Click
    if (e.button === 0) {
      const { x: wX, y: wY } = screenToWorld(e.clientX, e.clientY);
      const selected = objects.find(o => o.id === selectedObjectId);

      // Check Gizmo Handles if an object is selected
      if (selected) {
        const cx = selected.x + selected.width / 2;
        const cy = selected.y + selected.height / 2;
        const rad = (-(selected.rotation || 0) * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);

        // Local coords relative to object center
        const lx = cos * (wX - cx) - sin * (wY - cy);
        const ly = sin * (wX - cx) + cos * (wY - cy);

        const halfW = selected.width / 2;
        const halfH = selected.height / 2;
        const handleThreshold = 12 / zoom;

        // Rotate Handle (0, -halfH - 24/zoom)
        const rotY = -halfH - (24 / zoom);
        if (Math.hypot(lx, ly - rotY) <= handleThreshold) {
          setIsInteracting(true);
          setInteractionType('rotate');
          setDragStartPos({ x: wX, y: wY });
          setInitialTransform({
            x: selected.x,
            y: selected.y,
            width: selected.width,
            height: selected.height,
            rotation: selected.rotation || 0
          });
          return;
        }

        // Scale Handles
        if (Math.hypot(lx - (-halfW), ly - (-halfH)) <= handleThreshold) {
          setIsInteracting(true);
          setInteractionType('scale');
          setScaleHandle('nw');
          setDragStartPos({ x: wX, y: wY });
          setInitialTransform({ x: selected.x, y: selected.y, width: selected.width, height: selected.height, rotation: selected.rotation || 0 });
          return;
        }
        if (Math.hypot(lx - halfW, ly - (-halfH)) <= handleThreshold) {
          setIsInteracting(true);
          setInteractionType('scale');
          setScaleHandle('ne');
          setDragStartPos({ x: wX, y: wY });
          setInitialTransform({ x: selected.x, y: selected.y, width: selected.width, height: selected.height, rotation: selected.rotation || 0 });
          return;
        }
        if (Math.hypot(lx - halfW, ly - halfH) <= handleThreshold) {
          setIsInteracting(true);
          setInteractionType('scale');
          setScaleHandle('se');
          setDragStartPos({ x: wX, y: wY });
          setInitialTransform({ x: selected.x, y: selected.y, width: selected.width, height: selected.height, rotation: selected.rotation || 0 });
          return;
        }
        if (Math.hypot(lx - (-halfW), ly - halfH) <= handleThreshold) {
          setIsInteracting(true);
          setInteractionType('scale');
          setScaleHandle('sw');
          setDragStartPos({ x: wX, y: wY });
          setInitialTransform({ x: selected.x, y: selected.y, width: selected.width, height: selected.height, rotation: selected.rotation || 0 });
          return;
        }

        // Object Body Click -> Move
        if (lx >= -halfW && lx <= halfW && ly >= -halfH && ly <= halfH) {
          setIsInteracting(true);
          setInteractionType(activeTool);
          setDragStartPos({ x: wX, y: wY });
          setInitialTransform({
            x: selected.x,
            y: selected.y,
            width: selected.width,
            height: selected.height,
            rotation: selected.rotation || 0
          });
          return;
        }
      }

      // Hit-test other objects from top to bottom
      let hitObj: GameObject | null = null;
      for (let i = objects.length - 1; i >= 0; i--) {
        const obj = objects[i];
        if (!obj.visible || obj.locked) continue;

        const cx = obj.x + obj.width / 2;
        const cy = obj.y + obj.height / 2;
        const rad = (-(obj.rotation || 0) * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);

        const lx = cos * (wX - cx) - sin * (wY - cy);
        const ly = sin * (wX - cx) + cos * (wY - cy);

        const halfW = obj.width / 2;
        const halfH = obj.height / 2;

        if (lx >= -halfW && lx <= halfW && ly >= -halfH && ly <= halfH) {
          hitObj = obj;
          break;
        }
      }

      if (hitObj) {
        onSelectObject(hitObj.id);
        setIsInteracting(true);
        setInteractionType(activeTool);
        setDragStartPos({ x: wX, y: wY });
        setInitialTransform({
          x: hitObj.x,
          y: hitObj.y,
          width: hitObj.width,
          height: hitObj.height,
          rotation: hitObj.rotation || 0
        });
      } else {
        onSelectObject(null);
      }
    }
  };

  // Mouse Move: Coordinate tracking, Panning, and Gizmo interaction
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x: wX, y: wY } = screenToWorld(e.clientX, e.clientY);
    setMouseWorldCoords({ x: wX, y: wY });

    // Handle Infinite World Panning (Right click or Middle click)
    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
      return;
    }

    // Handle Object Transformation
    if (!isInteracting || !selectedObjectId) return;
    const selected = objects.find(o => o.id === selectedObjectId);
    if (!selected) return;

    const dx = wX - dragStartPos.x;
    const dy = wY - dragStartPos.y;

    if (interactionType === 'move') {
      onUpdateObject({
        ...selected,
        x: Math.round(initialTransform.x + dx),
        y: Math.round(initialTransform.y + dy)
      });
    } else if (interactionType === 'scale') {
      let newW = initialTransform.width;
      let newH = initialTransform.height;
      let newX = initialTransform.x;
      let newY = initialTransform.y;

      if (scaleHandle === 'se' || (!scaleHandle && activeTool === 'scale')) {
        newW = Math.max(10, initialTransform.width + dx);
        newH = Math.max(10, initialTransform.height + dy);
      } else if (scaleHandle === 'nw') {
        newW = Math.max(10, initialTransform.width - dx);
        newH = Math.max(10, initialTransform.height - dy);
        newX = initialTransform.x + (initialTransform.width - newW);
        newY = initialTransform.y + (initialTransform.height - newH);
      } else if (scaleHandle === 'ne') {
        newW = Math.max(10, initialTransform.width + dx);
        newH = Math.max(10, initialTransform.height - dy);
        newY = initialTransform.y + (initialTransform.height - newH);
      } else if (scaleHandle === 'sw') {
        newW = Math.max(10, initialTransform.width - dx);
        newH = Math.max(10, initialTransform.height + dy);
        newX = initialTransform.x + (initialTransform.width - newW);
      }

      onUpdateObject({
        ...selected,
        x: Math.round(newX),
        y: Math.round(newY),
        width: Math.round(newW),
        height: Math.round(newH)
      });
    } else if (interactionType === 'rotate') {
      const cx = initialTransform.x + initialTransform.width / 2;
      const cy = initialTransform.y + initialTransform.height / 2;
      const angle = Math.atan2(wY - cy, wX - cx) * (180 / Math.PI);
      let newRot = Math.round(angle + 90);
      if (newRot < 0) newRot += 360;
      if (newRot >= 360) newRot -= 360;

      onUpdateObject({
        ...selected,
        rotation: newRot
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setIsInteracting(false);
    setInteractionType(null);
    setScaleHandle(null);
  };

  const resetView = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  return (
    <div 
      ref={containerRef}
      onWheel={handleWheel}
      onContextMenu={(e) => e.preventDefault()}
      className={`flex-1 h-full flex flex-col relative overflow-hidden select-none ${
        theme === 'dark' ? 'bg-neutral-950 text-white' : 'bg-neutral-100 text-black'
      }`}
    >
      {/* Compact Top-Right Floating Toolbar */}
      <div className={`absolute top-3 right-3 z-20 flex items-center gap-1 p-1 border backdrop-blur-sm shadow-md font-mono text-xs ${
        theme === 'dark' ? 'bg-black/90 border-neutral-800' : 'bg-white/90 border-neutral-300'
      }`}>
        <button
          onClick={() => setActiveTool('move')}
          title="أداة التحريك (W)"
          className={`px-2 py-1 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer border ${
            activeTool === 'move'
              ? (theme === 'dark' ? 'bg-white text-black border-white' : 'bg-black text-white border-black')
              : 'border-transparent opacity-60 hover:opacity-100'
          }`}
        >
          <Move className="w-3.5 h-3.5" />
          <span>تحريك</span>
        </button>

        <button
          onClick={() => setActiveTool('scale')}
          title="أداة الحجم (E)"
          className={`px-2 py-1 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer border ${
            activeTool === 'scale'
              ? (theme === 'dark' ? 'bg-white text-black border-white' : 'bg-black text-white border-black')
              : 'border-transparent opacity-60 hover:opacity-100'
          }`}
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>حجم</span>
        </button>

        <button
          onClick={() => setActiveTool('rotate')}
          title="أداة التدوير (R)"
          className={`px-2 py-1 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer border ${
            activeTool === 'rotate'
              ? (theme === 'dark' ? 'bg-white text-black border-white' : 'bg-black text-white border-black')
              : 'border-transparent opacity-60 hover:opacity-100'
          }`}
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>تدوير</span>
        </button>

        <div className={`h-4 w-[1px] mx-1 ${theme === 'dark' ? 'bg-neutral-800' : 'bg-neutral-300'}`} />

        {/* Zoom & Reset */}
        <button
          onClick={() => setZoom(z => Math.min(6, parseFloat((z + 0.2).toFixed(2))))}
          title="تقريب (عجلة الماوس)"
          className="p-1 opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <span className="text-[10px] font-mono px-1 opacity-70 min-w-[34px] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom(z => Math.max(0.15, parseFloat((z - 0.2).toFixed(2))))}
          title="تبعيد (عجلة الماوس)"
          className="p-1 opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={resetView}
          title="إعادة ضبط العرض إلى المركز (0, 0)"
          className="p-1 opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Infinite World Canvas (100% of container) */}
      <div 
        className="flex-1 w-full h-full relative cursor-crosshair overflow-hidden"
        onMouseUp={handleMouseUp}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          tabIndex={0}
          className={`w-full h-full block outline-none ${
            isPanning ? 'cursor-grabbing' : 'cursor-default'
          }`}
        />
      </div>
    </div>
  );
};
