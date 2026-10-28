export type ShapeType = 'image' | 'rectangle' | 'circle';

export type LayerType = 'world' | 'ui'; // 'world' moves with camera in infinite space, 'ui' stays fixed on screen (HUD)

export interface GameLayer {
  id: string;
  name: string;
  type: LayerType; // 'world' (متحركة) | 'ui' (ثابتة)
  visible: boolean;
  locked: boolean;
  backgroundColor?: string;
  backgroundImage?: string;
}

export interface SpriteAnimationFrame {
  id: string;
  imageData: string; // base64 or SVG data URL
}

export interface SpriteAnimation {
  id: string;
  name: string;
  frameDurationMs: number; // مدة عرض كل إطار بالمللي ثانية (مثلاً 120ms)
  loop: boolean;
  frames: SpriteAnimationFrame[];
}

export interface CollisionMesh {
  enabled: boolean;
  type: 'box' | 'circle' | 'mesh';
  offsetX: number;
  offsetY: number;
  customWidth?: number;
  customHeight?: number;
  radius?: number;
  padding?: number;
}

// FY3 Node-Based Visual Scripting Types (برمجة العقد والمكعبات المرئية)
export type ScriptNodeCategory = 
  | 'events'      // الأحداث (بداية المشهد، كل إطار، عند الضغط، عند التصادم)
  | 'movement'    // الحركة (حركة منصات مع جاذبية، حركة 4 اتجاهات، تحريك لموقع)
  | 'camera'      // الكاميرا (تتبع كائن، اهتزاز الكاميرا)
  | 'input'       // المدخلات والتحكم (زر كيبورد، النقر على كائن أو صورة)
  | 'actions'     // الإجراءات (تغيير المشهد، تشغيل صوت، إظهار/إخفاء كائن، تدمير كائن)
  | 'vfx'         // المؤثرات (انفجار، بريق، دخان، قطع نقدية)
  | 'gameplay'    // اللعب والشروط (زيادة النقاط، تقليل المحاولات، شرط/إذا)
  | 'ui';         // الواجهة (عرض نص، لوحة نقاط)

export interface NodeSocket {
  id: string;
  name: string;
  type: 'flow' | 'data';
}

export interface ScriptNode {
  id: string;
  type: string;
  title: string;
  category: ScriptNodeCategory;
  x: number;
  y: number;
  inputs: NodeSocket[];
  outputs: NodeSocket[];
  params: Record<string, any>;
}

export interface NodeConnection {
  id: string;
  fromNodeId: string;
  fromSocketId: string;
  toNodeId: string;
  toSocketId: string;
}

export interface NodeGraph {
  nodes: ScriptNode[];
  connections: NodeConnection[];
}

// Legacy FY3 Visual Programming Types (kept for backward compatibility)
export interface FY3Variable {
  id: string;
  name: string;
  type: 'number' | 'string' | 'boolean';
  value: any;
}

export type FY3EventTrigger = 
  | 'on_start'
  | 'on_update'
  | 'on_key_down'
  | 'on_click'
  | 'on_collision';

export type FY3ActionType =
  | 'move_x'
  | 'move_y'
  | 'set_pos'
  | 'change_scene'
  | 'play_sound'
  | 'play_animation'
  | 'change_variable'
  | 'set_variable'
  | 'draw_text'
  | 'camera_follow'
  | 'add_score'
  | 'change_visibility';

export interface FY3Action {
  id: string;
  type: FY3ActionType;
  params: Record<string, any>;
}

export interface FY3Rule {
  id: string;
  enabled: boolean;
  trigger: FY3EventTrigger;
  targetObjectId?: string;
  collideWithObjectId?: string;
  keyCode?: string;
  condition?: {
    varName: string;
    operator: '==' | '!=' | '>' | '<' | '>=' | '<=';
    value: any;
  };
  actions: FY3Action[];
}

export interface FY3ScriptData {
  rawText?: string;
  variables: FY3Variable[];
  rules: FY3Rule[];
}

export interface GameObject {
  id: string;
  name: string;
  tag: string;
  layerId?: string; // Assigned Layer ID (world or ui)
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // in degrees
  opacity: number;  // 0 to 1
  visible: boolean;
  locked: boolean;
  shapeType: ShapeType;
  color: string;      // fill color (e.g., #ffffff, #000000, #888888)
  borderColor: string;
  borderWidth: number;
  imageData?: string; // base64 or SVG data URL

  // Animations System
  animations?: Record<string, SpriteAnimation>;
  defaultAnimationId?: string;
  currentAnimationId?: string;
  
  // Physics & Collision
  hasCollision: boolean;
  colliderType: 'box' | 'circle';
  collisionMesh?: CollisionMesh; // شباك التصادم المخصص للصور والكائنات
  isDynamic: boolean;  // affects physics simulation
  gravity: number;
  vx: number;
  vy: number;
  bounce: number;

  // Custom Scripting
  scriptMode?: 'js' | 'fy3';
  script: string;
  nodeGraph?: NodeGraph; // Independent per-object FY3 Node Graph
  fy3Text?: string;      // Handwritten FY3 code text
  fy3Script?: FY3ScriptData;
  
  // Custom runtime variables
  variables: Record<string, any>;
}

export interface GameSettings {
  width: number;
  height: number;
  backgroundColor: string; // Camera screen frame background
  worldBackgroundColor?: string; // Entire infinite world background color
  worldBackgroundImage?: string; // Entire infinite world background image (base64/URL)
  worldBackgroundRepeat?: 'repeat' | 'stretch';
  gravity: number;
  pixelated: boolean;
  showGrid: boolean;
  gridSize: number;
}

// Scene Interface
export interface GameScene {
  id: string;
  name: string;
  layers: GameLayer[];
  objects: GameObject[];
  globalScript: string;
  globalScriptMode?: 'js' | 'fy3';
  globalFy3Text?: string;
  globalFy3Script?: FY3ScriptData;
  nodeGraph?: NodeGraph;
}

export interface GameProject {
  id: string;
  title: string;
  description: string;
  updatedAt: number;
  settings: GameSettings;
  
  // Active / Legacy Root Scene fields
  layers?: GameLayer[];
  objects: GameObject[];
  globalScript: string;
  globalScriptMode?: 'js' | 'fy3';
  globalFy3Text?: string;
  globalFy3Script?: FY3ScriptData;
  nodeGraph?: NodeGraph;

  // Multi-Scenes Support
  scenes?: GameScene[];
  activeSceneId?: string;
}

export interface EngineLog {
  id: string;
  type: 'info' | 'error' | 'warn';
  message: string;
  timestamp: string;
}

export type EditorMode = 'select' | 'move' | 'pan';

export interface DraggedItem {
  index: number;
  id: string;
}
