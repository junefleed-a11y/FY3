import { GameObject, GameProject, EngineLog, GameLayer, SpriteAnimation, GameScene, NodeGraph } from '../types/engine';
import { playSoundEffect, playCustomTone } from '../utils/audio';
import { compileFY3ToJS } from './fy3Compiler';
import { compileNodeGraphToJS } from './nodeCompiler';

export interface RuntimeDrawText {
  text: string;
  x: number;
  y: number;
  color?: string;
  size?: number;
  align?: CanvasTextAlign;
}

export interface CameraState {
  x: number;
  y: number;
  zoom: number;
  target: GameObject | null;
  follow: (obj: GameObject | null) => void;
}

export interface RuntimeParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  type?: 'explosion' | 'sparkles' | 'trail' | 'smoke' | 'coins';
}

export class GameRuntime {
  project: GameProject;
  runtimeObjects: GameObject[] = [];
  runtimeLayers: GameLayer[] = [];
  isRunning: boolean = false;
  isPaused: boolean = false;
  canvas: HTMLCanvasElement | null = null;
  ctx: CanvasRenderingContext2D | null = null;

  // Particle System
  particles: RuntimeParticle[] = [];
  
  // Camera System for Infinite World
  camera: CameraState = {
    x: 0,
    y: 0,
    zoom: 1,
    target: null,
    follow: (objOrId: any) => {
      if (typeof objOrId === 'string') {
        const found = this.runtimeObjects.find(o => o.id === objOrId || o.name === objOrId || o.name?.trim().toLowerCase() === objOrId?.trim().toLowerCase());
        this.camera.target = found || null;
      } else {
        this.camera.target = objOrId;
      }
      const t = this.camera.target;
      if (t) {
        this.camera.x = (t.x + (t.width || 0) / 2) - this.project.settings.width / 2;
        this.camera.y = (t.y + (t.height || 0) / 2) - this.project.settings.height / 2;
      }
    }
  };

  // Input State
  keysDown: Set<string> = new Set();
  mouse = { x: 0, y: 0, worldX: 0, worldY: 0, isDown: false, clicked: false };

  // Runtime Game State
  score: number = 0;
  lives: number = 3;
  customData: Record<string, any> = {};
  drawTextCommands: RuntimeDrawText[] = [];

  // Animation Timing Tracking: objectId -> { animId, frameIndex, timer }
  private animStates: Map<string, { animId: string; frameIdx: number; timer: number }> = new Map();

  // Script cache
  private objectBehaviors: Map<string, {
    onStart?: (game: any) => void;
    onUpdate?: (dt: number, game: any) => void;
    onCollision?: (other: GameObject, game: any) => void;
  }> = new Map();

  private globalBehavior: {
    onStart?: (game: any) => void;
    onUpdate?: (dt: number, game: any) => void;
  } = {};

  // Image cache
  private imageCache: Map<string, HTMLImageElement> = new Map();

  // Animation Frame
  private animFrameId: number | null = null;
  private lastTime: number = 0;

  // Logging callback
  private onLog?: (log: EngineLog) => void;

  constructor(project: GameProject, onLog?: (log: EngineLog) => void) {
    this.project = project;
    this.onLog = onLog;
    this.initImages();
  }

  private log(type: 'info' | 'warn' | 'error', message: string) {
    if (this.onLog) {
      const now = new Date().toLocaleTimeString('ar-EG', { hour12: false });
      this.onLog({
        id: Math.random().toString(36).substring(2, 9),
        type,
        message,
        timestamp: now
      });
    }
  }

  // Synchronous and immediate image loader with caching
  getImage(src: string): HTMLImageElement | null {
    if (!src) return null;
    if (this.imageCache.has(src)) {
      return this.imageCache.get(src)!;
    }
    const img = new Image();
    this.imageCache.set(src, img);
    img.src = src;
    return img;
  }

  private initImages() {
    // Preload project world background
    if (this.project.settings.worldBackgroundImage) {
      this.getImage(this.project.settings.worldBackgroundImage);
    }

    // Preload layer backgrounds
    if (this.project.layers) {
      for (const layer of this.project.layers) {
        if (layer.backgroundImage) {
          this.getImage(layer.backgroundImage);
        }
      }
    }

    // Preload objects and animations
    for (const obj of this.project.objects) {
      if (obj.shapeType === 'image' && obj.imageData) {
        this.getImage(obj.imageData);
      }
      if (obj.animations) {
        for (const animKey of Object.keys(obj.animations)) {
          const anim = obj.animations[animKey];
          for (const frame of anim.frames) {
            if (frame.imageData) {
              this.getImage(frame.imageData);
            }
          }
        }
      }
    }
  }

  preloadImage(src: string): HTMLImageElement {
    return this.getImage(src)!;
  }

  // Set virtual key for mobile on-screen controls
  setVirtualKey(code: string, isDown: boolean) {
    if (isDown) {
      this.keysDown.add(code);
    } else {
      this.keysDown.delete(code);
    }
  }

  // Spawn visual particle effects
  spawnParticles(x: number, y: number, options?: {
    count?: number;
    color?: string;
    type?: 'explosion' | 'sparkles' | 'trail' | 'smoke' | 'coins';
    speed?: number;
    size?: number;
    life?: number;
  }) {
    const type = options?.type || 'sparkles';
    const count = options?.count || (type === 'explosion' ? 24 : type === 'smoke' ? 8 : 12);
    const baseColor = options?.color || (
      type === 'explosion' ? '#ff4400' :
      type === 'coins' ? '#ffd700' :
      type === 'smoke' ? '#888888' : '#ffffff'
    );
    const speed = options?.speed || (type === 'explosion' ? 5 : 2.5);
    const baseSize = options?.size || (type === 'smoke' ? 6 : 3.5);
    const maxLife = options?.life || (type === 'smoke' ? 0.8 : 0.5);

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const spd = (0.3 + Math.random() * 0.7) * speed;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 6,
        y: y + (Math.random() - 0.5) * 6,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        color: baseColor,
        size: baseSize * (0.6 + Math.random() * 0.8),
        alpha: 1,
        life: maxLife * (0.6 + Math.random() * 0.5),
        maxLife: maxLife,
        type
      });
    }
  }

  attachCanvas(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    // Attach canvas mouse listeners
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('mousedown', this.handleMouseDown);
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('mousedown', this.handleMouseDown);

    // Initial render in case game is running or paused
    if (this.isRunning) {
      this.render();
    }
  }

  start() {
    if (this.isRunning) return;

    const activeScene = this.project.scenes?.find(s => s.id === this.project.activeSceneId) || this.project.scenes?.[0];
    const initialObjects = (activeScene && activeScene.objects) ? activeScene.objects : this.project.objects;
    const initialLayers = (activeScene && activeScene.layers && activeScene.layers.length > 0)
      ? activeScene.layers
      : (this.project.layers && this.project.layers.length > 0)
        ? this.project.layers
        : [
            { id: 'layer_world_default', name: 'طبقة العالم (World)', type: 'world', visible: true, locked: false },
            { id: 'layer_ui_default', name: 'طبقة الواجهة (UI / HUD)', type: 'ui', visible: true, locked: false }
          ];

    this.runtimeObjects = JSON.parse(JSON.stringify(initialObjects || []));
    this.runtimeLayers = JSON.parse(JSON.stringify(initialLayers));

    // Initialize object runtime properties and animation states
    this.animStates.clear();
    for (const obj of this.runtimeObjects) {
      obj.variables = obj.variables || {};

      const initialAnim = obj.currentAnimationId || obj.defaultAnimationId || (obj.animations ? Object.keys(obj.animations)[0] : '');
      if (initialAnim) {
        this.animStates.set(obj.id, {
          animId: initialAnim,
          frameIdx: 0,
          timer: 0
        });
      }

      // Inject animation helper methods into runtime object
      (obj as any).playAnimation = (animName: string) => {
        if (!obj.animations) return;
        const targetKey = Object.keys(obj.animations).find(k => k === animName || obj.animations![k].name === animName);
        if (targetKey) {
          const current = this.animStates.get(obj.id);
          if (!current || current.animId !== targetKey) {
            this.animStates.set(obj.id, { animId: targetKey, frameIdx: 0, timer: 0 });
            obj.currentAnimationId = targetKey;
          }
        }
      };

      (obj as any).stopAnimation = () => {
        this.animStates.delete(obj.id);
      };
    }

    this.score = 0;
    this.lives = 3;
    this.customData = {};
    this.drawTextCommands = [];
    this.camera.x = 0;
    this.camera.y = 0;
    this.camera.target = null;
    this.isRunning = true;
    this.isPaused = false;
    this.compileScripts();

    // Auto-detect player object for camera tracking
    const playerObj = this.runtimeObjects.find(o => o.tag === 'player') || 
                      this.runtimeObjects.find(o => o.name.includes('اللاعب') || o.name.toLowerCase().includes('player'));
    if (playerObj) {
      this.camera.follow(playerObj);
    }

    this.setupListeners();

    const gameAPI = this.createGameAPI();

    if (this.globalBehavior.onStart) {
      try {
        this.globalBehavior.onStart(gameAPI);
      } catch (err: any) {
        this.log('error', `خطأ في الكود العام [onStart]: ${err.message}`);
      }
    }

    for (const obj of this.runtimeObjects) {
      const behavior = this.objectBehaviors.get(obj.id);
      if (behavior && behavior.onStart) {
        try {
          behavior.onStart.call(obj, gameAPI);
        } catch (err: any) {
          this.log('error', `خطأ في كائن "${obj.name}" [onStart]: ${err.message}`);
        }
      }
    }

    this.lastTime = performance.now();
    this.log('info', 'بدأ تشغيل اللعبة - FY3 v1.0.1 (المطور يونيو فليد)');
    this.loop(this.lastTime);
  }

  stop() {
    this.isRunning = false;
    this.isPaused = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.removeListeners();
    this.drawTextCommands = [];
    this.log('info', 'تم إيقاف اللعبة');
  }

  pause() {
    this.isPaused = !this.isPaused;
    if (!this.isPaused) {
      this.lastTime = performance.now();
      this.loop(this.lastTime);
    }
  }

  loadScene(sceneNameOrId: string) {
    if (!this.project.scenes || this.project.scenes.length === 0) {
      this.log('warn', `لا توجد مشاهد مسجلة في المشروع للتبديل إليها.`);
      return;
    }

    const trimmed = String(sceneNameOrId).trim().toLowerCase();
    const targetScene = this.project.scenes.find(
      s => s.id === sceneNameOrId || s.name.trim().toLowerCase() === trimmed
    );

    if (!targetScene) {
      this.log('warn', `لم يتم العثور على المشهد المطلوب: "${sceneNameOrId}"`);
      return;
    }

    this.log('info', `انتقال إلى المشهد: "${targetScene.name}"`);

    this.runtimeObjects = JSON.parse(JSON.stringify(targetScene.objects || []));
    this.runtimeLayers = (targetScene.layers && targetScene.layers.length > 0)
      ? JSON.parse(JSON.stringify(targetScene.layers))
      : (this.project.layers && this.project.layers.length > 0)
        ? JSON.parse(JSON.stringify(this.project.layers))
        : [
            { id: 'layer_world_default', name: 'طبقة العالم (World)', type: 'world', visible: true, locked: false },
            { id: 'layer_ui_default', name: 'طبقة الواجهة (UI / HUD)', type: 'ui', visible: true, locked: false }
          ];

    this.animStates.clear();
    for (const obj of this.runtimeObjects) {
      obj.variables = obj.variables || {};

      const initialAnim = obj.currentAnimationId || obj.defaultAnimationId || (obj.animations ? Object.keys(obj.animations)[0] : '');
      if (initialAnim) {
        this.animStates.set(obj.id, { animId: initialAnim, frameIdx: 0, timer: 0 });
      }

      (obj as any).playAnimation = (animName: string) => {
        if (!obj.animations) return;
        const targetKey = Object.keys(obj.animations).find(k => k === animName || obj.animations![k].name === animName);
        if (targetKey) {
          const current = this.animStates.get(obj.id);
          if (!current || current.animId !== targetKey) {
            this.animStates.set(obj.id, { animId: targetKey, frameIdx: 0, timer: 0 });
            obj.currentAnimationId = targetKey;
          }
        }
      };

      (obj as any).stopAnimation = () => {
        this.animStates.delete(obj.id);
      };
    }

    this.camera.x = 0;
    this.camera.y = 0;
    this.camera.target = null;

    this.compileScripts(targetScene);

    const playerObj = this.runtimeObjects.find(o => o.tag === 'player') || 
                      this.runtimeObjects.find(o => o.name.includes('اللاعب') || o.name.toLowerCase().includes('player'));
    if (playerObj) {
      this.camera.follow(playerObj);
    }

    const gameAPI = this.createGameAPI();
    if (this.globalBehavior.onStart) {
      try {
        this.globalBehavior.onStart(gameAPI);
      } catch (err: any) {
        this.log('error', `خطأ في الكود العام [onStart]: ${err.message}`);
      }
    }

    for (const obj of this.runtimeObjects) {
      const behavior = this.objectBehaviors.get(obj.id);
      if (behavior && behavior.onStart) {
        try {
          behavior.onStart.call(obj, gameAPI);
        } catch (err: any) {
          this.log('error', `خطأ في كائن "${obj.name}" [onStart]: ${err.message}`);
        }
      }
    }
  }

  private compileScripts(targetScene?: GameScene) {
    this.objectBehaviors.clear();

    const gScript = (targetScene?.nodeGraph ? compileNodeGraphToJS(targetScene.nodeGraph, targetScene.objects || [], this.project.scenes || []) : '')
      || targetScene?.globalScript 
      || (targetScene?.globalFy3Script ? compileFY3ToJS(targetScene.globalFy3Script, targetScene.name) : '')
      || (this.project.nodeGraph ? compileNodeGraphToJS(this.project.nodeGraph, this.project.objects || [], this.project.scenes || []) : '')
      || this.project.globalScript 
      || (this.project.globalFy3Script ? compileFY3ToJS(this.project.globalFy3Script, 'المشهد العام') : '');

    if (gScript && gScript.trim()) {
      try {
        const globalFunc = new Function(`
          ${gScript}
          return {
            onStart: typeof onStart === 'function' ? onStart : undefined,
            onUpdate: typeof onUpdate === 'function' ? onUpdate : undefined
          };
        `);
        this.globalBehavior = globalFunc();
      } catch (err: any) {
        this.log('error', `خطأ تصريف الكود العام: ${err.message}`);
        this.globalBehavior = {};
      }
    }

    for (const obj of this.runtimeObjects) {
      let code = obj.script;
      if (obj.nodeGraph && obj.nodeGraph.nodes && obj.nodeGraph.nodes.length > 0) {
        code = compileNodeGraphToJS(obj.nodeGraph, this.runtimeObjects, this.project.scenes || [], obj.id);
      } else if ((!code || !code.trim()) && obj.fy3Script) {
        code = compileFY3ToJS(obj.fy3Script, obj.name);
      }
      if (code && code.trim()) {
        try {
          const objFunc = new Function(`
            ${code}
            return {
              onStart: typeof onStart === 'function' ? onStart : undefined,
              onUpdate: typeof onUpdate === 'function' ? onUpdate : undefined,
              onCollision: typeof onCollision === 'function' ? onCollision : undefined
            };
          `);
          this.objectBehaviors.set(obj.id, objFunc());
        } catch (err: any) {
          this.log('error', `خطأ تصريف في كائن "${obj.name}": ${err.message}`);
        }
      }
    }
  }

  private createGameAPI() {
    return {
      width: this.project.settings.width,
      height: this.project.settings.height,
      score: this.score,
      lives: this.lives,
      camera: this.camera,
      data: this.customData,
      input: {
        isKeyDown: (code: string) => this.keysDown.has(code),
        mouse: this.mouse
      },
      playSound: (type: string) => playSoundEffect(type),
      playTone: (freq: number, type: OscillatorType, dur: number) => playCustomTone(freq, type, dur),
      spawnParticles: (x: number, y: number, options?: any) => this.spawnParticles(x, y, options),
      objects: this.runtimeObjects,
      findObject: (nameOrId: string) => this.runtimeObjects.find(o => o.id === nameOrId || o.name === nameOrId || o.name?.trim().toLowerCase() === nameOrId?.trim().toLowerCase()),
      getObjectsWithTag: (tag: string) => this.runtimeObjects.filter(o => o.tag === tag),
      loadScene: (nameOrId: string) => this.loadScene(nameOrId),
      changeScene: (nameOrId: string) => this.loadScene(nameOrId),
      drawText: (text: string, x: number, y: number, options?: { color?: string; size?: number; align?: CanvasTextAlign }) => {
        this.drawTextCommands.push({
          text: String(text),
          x,
          y,
          color: options?.color || '#ffffff',
          size: options?.size || 16,
          align: options?.align || 'left'
        });
      },
      log: (message: any) => {
        const text = typeof message === 'object' ? JSON.stringify(message) : String(message);
        this.log('info', text);
      }
    };
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault();
    }
    this.keysDown.add(e.code);
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keysDown.delete(e.code);
  };

  private handleMouseMove = (e: MouseEvent) => {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.project.settings.width / rect.width;
    const scaleY = this.project.settings.height / rect.height;
    this.mouse.x = (e.clientX - rect.left) * scaleX;
    this.mouse.y = (e.clientY - rect.top) * scaleY;
    this.mouse.worldX = this.mouse.x + this.camera.x;
    this.mouse.worldY = this.mouse.y + this.camera.y;
  };

  private handleMouseDown = () => {
    this.mouse.isDown = true;
    this.mouse.clicked = true;
  };

  private handleMouseUp = () => {
    this.mouse.isDown = false;
  };

  private setupListeners() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    if (this.canvas) {
      this.canvas.addEventListener('mousemove', this.handleMouseMove);
      this.canvas.addEventListener('mousedown', this.handleMouseDown);
    }
    window.addEventListener('mouseup', this.handleMouseUp);
  }

  private removeListeners() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    if (this.canvas) {
      this.canvas.removeEventListener('mousemove', this.handleMouseMove);
      this.canvas.removeEventListener('mousedown', this.handleMouseDown);
    }
    window.removeEventListener('mouseup', this.handleMouseUp);
    this.keysDown.clear();
  }

  private getColliderBounds(obj: GameObject) {
    if (obj.collisionMesh?.enabled) {
      const offX = obj.collisionMesh.offsetX || 0;
      const offY = obj.collisionMesh.offsetY || 0;
      const w = obj.collisionMesh.customWidth ?? obj.width;
      const h = obj.collisionMesh.customHeight ?? obj.height;
      return {
        x: obj.x + offX,
        y: obj.y + offY,
        width: w,
        height: h,
        isCircle: obj.collisionMesh.type === 'circle' || obj.colliderType === 'circle'
      };
    }
    return {
      x: obj.x,
      y: obj.y,
      width: obj.width,
      height: obj.height,
      isCircle: obj.colliderType === 'circle'
    };
  }

  private checkCollision(a: GameObject, b: GameObject): boolean {
    if (!a.visible || !b.visible || !a.hasCollision || !b.hasCollision) return false;

    const bA = this.getColliderBounds(a);
    const bB = this.getColliderBounds(b);

    if (bA.isCircle && bB.isCircle) {
      const rA = Math.min(bA.width, bA.height) / 2;
      const rB = Math.min(bB.width, bB.height) / 2;
      const cAx = bA.x + bA.width / 2;
      const cAy = bA.y + bA.height / 2;
      const cBx = bB.x + bB.width / 2;
      const cBy = bB.y + bB.height / 2;
      const dist = Math.hypot(cAx - cBx, cAy - cBy);
      return dist < (rA + rB);
    }

    return (
      bA.x < bB.x + bB.width &&
      bA.x + bA.width > bB.x &&
      bA.y < bB.y + bB.height &&
      bA.y + bA.height > bB.y
    );
  }

  private loop = (currentTime: number) => {
    if (!this.isRunning || this.isPaused) return;

    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    this.update(dt);
    this.render();

    this.mouse.clicked = false;
    this.animFrameId = requestAnimationFrame(this.loop);
  };

  private update(dt: number) {
    const gameAPI = this.createGameAPI();
    this.drawTextCommands = [];

    // Camera follow update in Infinite World
    let targetObj: GameObject | null = null;
    if (this.camera.target) {
      targetObj = this.runtimeObjects.find(o => o.id === this.camera.target?.id || o.name === this.camera.target?.name) || this.camera.target;
    } else {
      targetObj = this.runtimeObjects.find(o => o.tag === 'player') || 
                  this.runtimeObjects.find(o => o.name.includes('اللاعب') || o.name.toLowerCase().includes('player')) || null;
    }

    if (targetObj) {
      const targetCenterX = targetObj.x + (targetObj.width || 0) / 2;
      const targetCenterY = targetObj.y + (targetObj.height || 0) / 2;
      const desiredX = targetCenterX - this.project.settings.width / 2;
      const desiredY = targetCenterY - this.project.settings.height / 2;

      // Smooth camera interpolation
      this.camera.x += (desiredX - this.camera.x) * 0.15;
      this.camera.y += (desiredY - this.camera.y) * 0.15;
    }

    // Update Animation Frames
    for (const obj of this.runtimeObjects) {
      if (!obj.animations) continue;
      const animState = this.animStates.get(obj.id);
      if (!animState) continue;

      const anim = obj.animations[animState.animId];
      if (!anim || anim.frames.length <= 1) continue;

      animState.timer += dt * 1000;
      const duration = Math.max(20, anim.frameDurationMs || 150);

      if (animState.timer >= duration) {
        animState.timer = 0;
        animState.frameIdx++;
        if (animState.frameIdx >= anim.frames.length) {
          animState.frameIdx = anim.loop ? 0 : anim.frames.length - 1;
        }
      }
    }

    // Global update
    if (this.globalBehavior.onUpdate) {
      try {
        this.globalBehavior.onUpdate(dt, gameAPI);
      } catch (err: any) {
        this.log('error', `خطأ في الكود العام [onUpdate]: ${err.message}`);
      }
    }

    // Object updates
    for (const obj of this.runtimeObjects) {
      if (!obj.visible) continue;
      obj.variables = obj.variables || {};

      if (obj.isDynamic) {
        const gravity = obj.gravity !== 0 ? obj.gravity : (this.project.settings.gravity || 0);
        obj.vy = (obj.vy || 0) + gravity * 60 * dt;
        obj.x += (obj.vx || 0);
        obj.y += (obj.vy || 0);
      }

      const behavior = this.objectBehaviors.get(obj.id);
      if (behavior && behavior.onUpdate) {
        try {
          behavior.onUpdate.call(obj, dt, gameAPI);
        } catch (err: any) {
          this.log('error', `خطأ في كائن "${obj.name}" [onUpdate]: ${err.message}`);
        }
      }
    }

    // Collisions
    for (let i = 0; i < this.runtimeObjects.length; i++) {
      for (let j = i + 1; j < this.runtimeObjects.length; j++) {
        const objA = this.runtimeObjects[i];
        const objB = this.runtimeObjects[j];

        if (this.checkCollision(objA, objB)) {
          const behaviorA = this.objectBehaviors.get(objA.id);
          const behaviorB = this.objectBehaviors.get(objB.id);

          if (behaviorA && behaviorA.onCollision) {
            try {
              behaviorA.onCollision.call(objA, objB, gameAPI);
            } catch (err: any) {
              this.log('error', `خطأ في تصادم "${objA.name}": ${err.message}`);
            }
          }

          if (behaviorB && behaviorB.onCollision) {
            try {
              behaviorB.onCollision.call(objB, objA, gameAPI);
            } catch (err: any) {
              this.log('error', `خطأ في تصادم "${objB.name}": ${err.message}`);
            }
          }
        }
      }
    }

    // Update Particles
    for (const p of this.particles) {
      p.x += p.vx * 60 * dt;
      p.y += p.vy * 60 * dt;
      p.life -= dt;
      p.alpha = Math.max(0, p.life / p.maxLife);
    }
    this.particles = this.particles.filter(p => p.life > 0);

    this.score = gameAPI.score;
    this.lives = gameAPI.lives;
  }

  private drawObject(obj: GameObject) {
    if (!this.ctx) return;
    const ctx = this.ctx;

    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, obj.opacity ?? 1));

    const cx = obj.x + obj.width / 2;
    const cy = obj.y + obj.height / 2;
    ctx.translate(cx, cy);
    if (obj.rotation) {
      ctx.rotate((obj.rotation * Math.PI) / 180);
    }

    // Determine current image frame (Animation or static image)
    let currentImageSrc: string | undefined = obj.imageData;
    if (obj.animations) {
      const animState = this.animStates.get(obj.id);
      if (animState) {
        const anim = obj.animations[animState.animId];
        if (anim && anim.frames[animState.frameIdx]) {
          currentImageSrc = anim.frames[animState.frameIdx].imageData;
        }
      }
    }

    if (obj.shapeType === 'image' || currentImageSrc) {
      const img = currentImageSrc ? this.getImage(currentImageSrc) : null;
      if (img && img.complete && img.naturalWidth > 0) {
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
        ctx.lineWidth = obj.borderWidth;
        ctx.strokeStyle = obj.borderColor || '#000000';
        ctx.stroke();
      }
    } else {
      ctx.fillStyle = obj.color || '#ffffff';
      ctx.fillRect(-obj.width / 2, -obj.height / 2, obj.width, obj.height);
      if (obj.borderWidth && obj.borderWidth > 0) {
        ctx.lineWidth = obj.borderWidth;
        ctx.strokeStyle = obj.borderColor || '#000000';
        ctx.strokeRect(-obj.width / 2, -obj.height / 2, obj.width, obj.height);
      }
    }

    ctx.restore();
  }

  render() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const { width, height, backgroundColor, worldBackgroundColor, worldBackgroundImage, worldBackgroundRepeat, pixelated } = this.project.settings;

    ctx.imageSmoothingEnabled = !pixelated;

    // 1. Fill entire canvas with effective background color
    const effectiveBg = worldBackgroundColor || backgroundColor || this.runtimeLayers.find(l => l.type === 'world' && l.backgroundColor)?.backgroundColor || '#333333';
    ctx.fillStyle = effectiveBg;
    ctx.fillRect(0, 0, width, height);

    // 2. Render Infinite World Background Pattern or Image
    if (worldBackgroundImage) {
      const bgImg = this.getImage(worldBackgroundImage);
      if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
        try {
          if (worldBackgroundRepeat === 'stretch') {
            ctx.drawImage(bgImg, 0, 0, width, height);
          } else {
            const pattern = ctx.createPattern(bgImg, 'repeat');
            if (pattern) {
              ctx.save();
              const imgW = bgImg.naturalWidth;
              const imgH = bgImg.naturalHeight;
              const offX = -(Math.round(this.camera.x) % imgW);
              const offY = -(Math.round(this.camera.y) % imgH);
              ctx.translate(offX, offY);
              ctx.fillStyle = pattern;
              ctx.fillRect(-imgW, -imgH, width + imgW * 2, height + imgH * 2);
              ctx.restore();
            }
          }
        } catch {
          try {
            ctx.drawImage(bgImg, 0, 0, width, height);
          } catch {}
        }
      }
    }

    // 3. Render Infinite World (World Layers, Objects & World Particles with Camera Translation)
    ctx.save();
    ctx.translate(-Math.round(this.camera.x), -Math.round(this.camera.y));

    // World Layers
    const worldLayers = this.runtimeLayers.filter(l => l.type === 'world');
    for (const layer of worldLayers) {
      if (!layer.visible) continue;

      if (layer.backgroundImage) {
        const lImg = this.getImage(layer.backgroundImage);
        if (lImg && lImg.complete) {
          ctx.drawImage(lImg, 0, 0, width, height);
        }
      }

      const layerObjs = this.runtimeObjects.filter(o => o.layerId === layer.id || (!o.layerId && layer === worldLayers[0]));
      for (const obj of layerObjs) {
        if (obj.visible) this.drawObject(obj);
      }
    }

    // Render World Particles (Explosions, Sparkles, Trails, Smoke, Coins)
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
      ctx.fillStyle = p.color;

      if (p.type === 'smoke') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1, p.size), 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'coins') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1, p.size), 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else {
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }
      ctx.restore();
    }

    ctx.restore(); // Restore camera translation

    // 4. Render Fixed UI Layers (HUD / Static on screen)
    const uiLayers = this.runtimeLayers.filter(l => l.type === 'ui');
    for (const layer of uiLayers) {
      if (!layer.visible) continue;

      if (layer.backgroundImage) {
        const lImg = this.getImage(layer.backgroundImage);
        if (lImg && lImg.complete) {
          ctx.drawImage(lImg, 0, 0, width, height);
        }
      }

      const layerObjs = this.runtimeObjects.filter(o => o.layerId === layer.id);
      for (const obj of layerObjs) {
        if (obj.visible) this.drawObject(obj);
      }
    }

    // 5. Draw UI Texts on fixed screen coordinates (HUD overlay)
    for (const cmd of this.drawTextCommands) {
      ctx.save();
      ctx.fillStyle = cmd.color || '#ffffff';
      ctx.font = `600 ${cmd.size || 16}px 'IBM Plex Sans Arabic', monospace`;
      ctx.textAlign = cmd.align || 'left';
      ctx.direction = 'ltr';
      ctx.fillText(cmd.text, cmd.x, cmd.y);
      ctx.restore();
    }
  }
}
