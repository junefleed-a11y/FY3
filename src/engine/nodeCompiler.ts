import { ScriptNode, NodeConnection, NodeGraph, ScriptNodeCategory, GameObject, GameScene } from '../types/engine';

export interface NodeFieldDefinition {
  key: string;
  label: string;
  type: 'select-object' | 'select-scene' | 'select-sound' | 'select-key' | 'select-particle' | 'number' | 'text' | 'select' | 'boolean';
  options?: { label: string; value: any }[];
  defaultValue?: any;
}

export interface NodeTemplate {
  type: string;
  title: string;
  category: ScriptNodeCategory;
  description: string;
  inputs: { id: string; name: string; type: 'flow' | 'data' }[];
  outputs: { id: string; name: string; type: 'flow' | 'data' }[];
  defaultParams: Record<string, any>;
  fields: NodeFieldDefinition[];
}

export const NODE_TEMPLATES: NodeTemplate[] = [
  // 1. الأحداث والمدخلات (Events & Input Triggers)
  {
    type: 'event_start',
    title: 'في بداية المشهد (On Start)',
    category: 'events',
    description: 'يتم تنفيذ الأوامر المرتبطة به فور تشغيل المشهد أو اللعبة.',
    inputs: [],
    outputs: [{ id: 'flow_out', name: 'تنفيذ', type: 'flow' }],
    defaultParams: {},
    fields: []
  },
  {
    type: 'event_update',
    title: 'تكرار مستمر (Every Frame)',
    category: 'events',
    description: 'يتم تشغيل الأوامر المرتبطة به في كل إطار بشكل مستمر.',
    inputs: [],
    outputs: [{ id: 'flow_out', name: 'تنفيذ مستمر', type: 'flow' }],
    defaultParams: {},
    fields: []
  },
  {
    type: 'trigger_button',
    title: 'مكعب زر / ضغط (Button Trigger)',
    category: 'input',
    description: 'خياران: زر من الكيبورد أو النقر على صورة/كائن في المشهد.',
    inputs: [],
    outputs: [{ id: 'flow_out', name: 'عند التفعيل', type: 'flow' }],
    defaultParams: {
      pressType: 'keyboard',
      key: 'KeyW',
      targetObjectId: ''
    },
    fields: [
      {
        key: 'pressType',
        label: 'نوع الزر',
        type: 'select',
        options: [
          { label: 'زر من الكيبورد (Keyboard)', value: 'keyboard' },
          { label: 'صورة / كائن من المشهد (Click Object)', value: 'object_click' }
        ],
        defaultValue: 'keyboard'
      },
      {
        key: 'key',
        label: 'زر الكيبورد',
        type: 'select-key',
        defaultValue: 'KeyW'
      },
      {
        key: 'targetObjectId',
        label: 'صورة / كائن الزر',
        type: 'select-object',
        defaultValue: ''
      }
    ]
  },
  {
    type: 'event_collision',
    title: 'تصادم كائنين (On Collision)',
    category: 'events',
    description: 'يتم التشغيل فور ملامسة الكائن الأول للكائن الثاني.',
    inputs: [],
    outputs: [{ id: 'flow_out', name: 'عند التصادم', type: 'flow' }],
    defaultParams: {
      objectAId: '',
      objectBId: ''
    },
    fields: [
      { key: 'objectAId', label: 'الكائن الأول', type: 'select-object', defaultValue: '' },
      { key: 'objectBId', label: 'الكائن الثاني', type: 'select-object', defaultValue: '' }
    ]
  },

  // 2. مكعبات الحركة المنفصلة الأربعة (Movement Blocks)
  {
    type: 'move_x_pos',
    title: 'حركة +X (تحريك يمين)',
    category: 'movement',
    description: 'تحريك الكائن باتجاه اليمين بمقدار السرعة المحددة.',
    inputs: [{ id: 'flow_in', name: 'تشغيل', type: 'flow' }],
    outputs: [{ id: 'flow_out', name: 'التالي', type: 'flow' }],
    defaultParams: {
      targetObjectId: '',
      speed: 100
    },
    fields: [
      { key: 'targetObjectId', label: 'الكائن المتحرك', type: 'select-object', defaultValue: '' },
      { key: 'speed', label: 'السرعة', type: 'number', defaultValue: 100 }
    ]
  },
  {
    type: 'move_x_neg',
    title: 'حركة -X (تحريك يسار)',
    category: 'movement',
    description: 'تحريك الكائن باتجاه اليسار بمقدار السرعة المحددة.',
    inputs: [{ id: 'flow_in', name: 'تشغيل', type: 'flow' }],
    outputs: [{ id: 'flow_out', name: 'التالي', type: 'flow' }],
    defaultParams: {
      targetObjectId: '',
      speed: 100
    },
    fields: [
      { key: 'targetObjectId', label: 'الكائن المتحرك', type: 'select-object', defaultValue: '' },
      { key: 'speed', label: 'السرعة', type: 'number', defaultValue: 100 }
    ]
  },
  {
    type: 'move_y_pos',
    title: 'حركة +Y (تحريك أسفل)',
    category: 'movement',
    description: 'تحريك الكائن باتجاه الأسفل بمقدار السرعة المحددة.',
    inputs: [{ id: 'flow_in', name: 'تشغيل', type: 'flow' }],
    outputs: [{ id: 'flow_out', name: 'التالي', type: 'flow' }],
    defaultParams: {
      targetObjectId: '',
      speed: 100
    },
    fields: [
      { key: 'targetObjectId', label: 'الكائن المتحرك', type: 'select-object', defaultValue: '' },
      { key: 'speed', label: 'السرعة', type: 'number', defaultValue: 100 }
    ]
  },
  {
    type: 'move_y_neg',
    title: 'حركة -Y (تحريك أعلى / قفز)',
    category: 'movement',
    description: 'تحريك الكائن باتجاه الأعلى بمقدار السرعة المحددة.',
    inputs: [{ id: 'flow_in', name: 'تشغيل', type: 'flow' }],
    outputs: [{ id: 'flow_out', name: 'التالي', type: 'flow' }],
    defaultParams: {
      targetObjectId: '',
      speed: 100
    },
    fields: [
      { key: 'targetObjectId', label: 'الكائن المتحرك', type: 'select-object', defaultValue: '' },
      { key: 'speed', label: 'السرعة', type: 'number', defaultValue: 100 }
    ]
  },

  // 3. الكاميرا (Camera)
  {
    type: 'camera_follow',
    title: 'تتبع الكاميرا (Camera Follow)',
    category: 'camera',
    description: 'تركز الكاميرا وتتحرك بسلاسة مع الكائن المحدد في العالم اللانهائي.',
    inputs: [{ id: 'flow_in', name: 'تشغيل', type: 'flow' }],
    outputs: [{ id: 'flow_out', name: 'التالي', type: 'flow' }],
    defaultParams: {
      targetObjectId: '',
      smoothSpeed: 0.15
    },
    fields: [
      { key: 'targetObjectId', label: 'الكائن المتتبع', type: 'select-object', defaultValue: '' },
      { key: 'smoothSpeed', label: 'سلاسة الحركة', type: 'number', defaultValue: 0.15 }
    ]
  },

  // 4. مكعبات الفيزياء (Physics)
  {
    type: 'physics_solid',
    title: 'كائن صلب (Solid Obstacle)',
    category: 'gameplay',
    description: 'يجعل الكائن حاجزاً صلباً لا يمكن اختراقه.',
    inputs: [{ id: 'flow_in', name: 'تشغيل', type: 'flow' }],
    outputs: [{ id: 'flow_out', name: 'التالي', type: 'flow' }],
    defaultParams: {
      targetObjectId: ''
    },
    fields: [
      { key: 'targetObjectId', label: 'الكائن المستهدف', type: 'select-object', defaultValue: '' }
    ]
  },
  {
    type: 'physics_dynamic',
    title: 'كائن ديناميكي (Dynamic Physics)',
    category: 'gameplay',
    description: 'يجعل الكائن خاضعاً لقوانين الفيزياء والجاذبية والاصطدام.',
    inputs: [{ id: 'flow_in', name: 'تشغيل', type: 'flow' }],
    outputs: [{ id: 'flow_out', name: 'التالي', type: 'flow' }],
    defaultParams: {
      targetObjectId: '',
      gravity: 0.5,
      bounce: 0.2
    },
    fields: [
      { key: 'targetObjectId', label: 'الكائن المستهدف', type: 'select-object', defaultValue: '' },
      { key: 'gravity', label: 'قوة الجاذبية', type: 'number', defaultValue: 0.5 },
      { key: 'bounce', label: 'الارتداد', type: 'number', defaultValue: 0.2 }
    ]
  },
  {
    type: 'physics_trigger',
    title: 'كائن شفاف (Trigger Sensor)',
    category: 'gameplay',
    description: 'كائن شفاف يمكن العبور من خلاله، ويرسل إشارة تصادم فقط.',
    inputs: [{ id: 'flow_in', name: 'تشغيل', type: 'flow' }],
    outputs: [{ id: 'flow_out', name: 'التالي', type: 'flow' }],
    defaultParams: {
      targetObjectId: ''
    },
    fields: [
      { key: 'targetObjectId', label: 'الكائن المستهدف', type: 'select-object', defaultValue: '' }
    ]
  },
  {
    type: 'physics_gravity',
    title: 'حركي بالجاذبية (Kinematic Gravity)',
    category: 'gameplay',
    description: 'يتأثر الكائن بالجاذبية الأرضية ويسقط تلقائياً.',
    inputs: [{ id: 'flow_in', name: 'تشغيل', type: 'flow' }],
    outputs: [{ id: 'flow_out', name: 'التالي', type: 'flow' }],
    defaultParams: {
      targetObjectId: '',
      gravity: 0.6
    },
    fields: [
      { key: 'targetObjectId', label: 'الكائن المستهدف', type: 'select-object', defaultValue: '' },
      { key: 'gravity', label: 'الجاذبية', type: 'number', defaultValue: 0.6 }
    ]
  },

  // 5. الوقت والتحكم (Time & Control)
  {
    type: 'timer_delay',
    title: 'مكعب وقت (Timer Delay)',
    category: 'actions',
    description: 'انتظار مدة زمنية محددة بالثواني قبل تنفيذ الأمر التالي.',
    inputs: [{ id: 'flow_in', name: 'تشغيل', type: 'flow' }],
    outputs: [{ id: 'flow_out', name: 'بعد انتهاء الوقت', type: 'flow' }],
    defaultParams: {
      seconds: 1
    },
    fields: [
      { key: 'seconds', label: 'المدة بالثواني', type: 'number', defaultValue: 1 }
    ]
  },
  {
    type: 'loop_repeat',
    title: 'مكعب تكرار (Loop Repeat)',
    category: 'actions',
    description: 'تكرار تشغيل الأوامر المرتبطة لعدد محدد من المرات.',
    inputs: [{ id: 'flow_in', name: 'تشغيل', type: 'flow' }],
    outputs: [{ id: 'flow_out', name: 'التالي', type: 'flow' }],
    defaultParams: {
      count: 3
    },
    fields: [
      { key: 'count', label: 'عدد مرات التكرار', type: 'number', defaultValue: 3 }
    ]
  },

  // 6. انطلاق ونقاط وتغيير المشهد والمؤثرات (Actions, Score & Scenes)
  {
    type: 'impulse_launch',
    title: 'انطلاق / دفعة سرعة (Launch Impulse)',
    category: 'movement',
    description: 'إعطاء دفعة سرعة فورية للكائن في المحورين X و Y.',
    inputs: [{ id: 'flow_in', name: 'تشغيل', type: 'flow' }],
    outputs: [{ id: 'flow_out', name: 'التالي', type: 'flow' }],
    defaultParams: {
      targetObjectId: '',
      forceX: 10,
      forceY: -10
    },
    fields: [
      { key: 'targetObjectId', label: 'الكائن المستهدف', type: 'select-object', defaultValue: '' },
      { key: 'forceX', label: 'قوة الدفع X', type: 'number', defaultValue: 10 },
      { key: 'forceY', label: 'قوة الدفع Y', type: 'number', defaultValue: -10 }
    ]
  },
  {
    type: 'score_add',
    title: 'مكعب نقاط جاهز (Score +1)',
    category: 'gameplay',
    description: 'إضافة أو تغيير نقاط اللاعب في اللعبة.',
    inputs: [{ id: 'flow_in', name: 'تشغيل', type: 'flow' }],
    outputs: [{ id: 'flow_out', name: 'التالي', type: 'flow' }],
    defaultParams: {
      amount: 1
    },
    fields: [
      { key: 'amount', label: 'عدد النقاط المضافة', type: 'number', defaultValue: 1 }
    ]
  },
  {
    type: 'change_scene',
    title: 'تغيير المشهد (Change Scene)',
    category: 'actions',
    description: 'الانتقال فوراً إلى مشهد آخر مسجل في اللعبة.',
    inputs: [{ id: 'flow_in', name: 'تشغيل', type: 'flow' }],
    outputs: [],
    defaultParams: {
      targetSceneId: ''
    },
    fields: [
      { key: 'targetSceneId', label: 'المشهد المستهدف', type: 'select-scene', defaultValue: '' }
    ]
  },
  {
    type: 'play_sound',
    title: 'تشغيل صوت (Play Sound)',
    category: 'vfx',
    description: 'تشغيل مؤثر صوتي فوري.',
    inputs: [{ id: 'flow_in', name: 'تشغيل', type: 'flow' }],
    outputs: [{ id: 'flow_out', name: 'التالي', type: 'flow' }],
    defaultParams: {
      sound: 'jump'
    },
    fields: [
      { key: 'sound', label: 'اختر المؤثر الصوتي', type: 'select-sound', defaultValue: 'jump' }
    ]
  },
  {
    type: 'spawn_particles',
    title: 'مؤثرات بصرية / انفجار (VFX)',
    category: 'vfx',
    description: 'صنع جسيمات وانفجارات بصرية عند موضع الكائن.',
    inputs: [{ id: 'flow_in', name: 'تشغيل', type: 'flow' }],
    outputs: [{ id: 'flow_out', name: 'التالي', type: 'flow' }],
    defaultParams: {
      particleType: 'coins',
      targetObjectId: '',
      count: 20
    },
    fields: [
      { key: 'particleType', label: 'نوع الجسيمات', type: 'select-particle', defaultValue: 'coins' },
      { key: 'targetObjectId', label: 'الموضع عند الكائن', type: 'select-object', defaultValue: '' },
      { key: 'count', label: 'عدد الجسيمات', type: 'number', defaultValue: 20 }
    ]
  }
];

export function getNodeTemplate(type: string): NodeTemplate | undefined {
  // Support aliases for backwards compatibility
  if (type === 'event_press') return NODE_TEMPLATES.find(t => t.type === 'trigger_button');
  if (type === 'add_score') return NODE_TEMPLATES.find(t => t.type === 'score_add');
  return NODE_TEMPLATES.find(t => t.type === type);
}

// -------------------------------------------------------------
// COMPILER: Turns NodeGraph into high-performance JavaScript
// -------------------------------------------------------------
export function compileNodeGraphToJS(
  graph: NodeGraph,
  objects: GameObject[],
  scenes: GameScene[],
  contextObjectId?: string
): string {
  if (!graph || !graph.nodes || graph.nodes.length === 0) {
    return `// شبكة مكعبات فارغة\nfunction onStart(game) {}\nfunction onUpdate(dt, game) {}`;
  }

  const nodesMap = new Map<string, ScriptNode>();
  for (const n of graph.nodes) {
    nodesMap.set(n.id, n);
  }

  // Get next connected nodes following an output socket
  const getNextNodes = (nodeId: string, socketId: string = 'flow_out'): ScriptNode[] => {
    const conns = graph.connections.filter(c => c.fromNodeId === nodeId && c.fromSocketId === socketId);
    return conns.map(c => nodesMap.get(c.toNodeId)).filter(Boolean) as ScriptNode[];
  };

  const getTargetId = (paramId?: string) => {
    if (paramId && paramId.trim()) return paramId;
    return contextObjectId || (objects[0]?.id || '');
  };

  const getObjectName = (id?: string) => {
    const targetId = getTargetId(id);
    const obj = objects.find(o => o.id === targetId || o.name === targetId);
    return obj ? obj.name : targetId;
  };

  const getSceneName = (id?: string) => {
    if (!id) return '';
    const sc = scenes.find(s => s.id === id || s.name === id);
    return sc ? sc.name : id;
  };

  // Compile chain of action nodes recursively
  const compileActionChain = (startNode: ScriptNode, visited = new Set<string>()): string => {
    if (visited.has(startNode.id)) return '';
    visited.add(startNode.id);

    let code = '';
    const p = startNode.params || {};
    const targetId = getTargetId(p.targetObjectId);
    const targetName = getObjectName(targetId);

    switch (startNode.type) {
      // 1. الحركة المنفصلة
      case 'move_x_pos': {
        const spd = Number(p.speed) || 100;
        code += `
  var obj_xp = game.findObject("${targetId}") || game.findObject("${targetName}");
  if (obj_xp) {
    obj_xp.x += (${spd} >= 10 ? (${spd} * (dt || 0.016)) : ${spd});
  }`;
        break;
      }

      case 'move_x_neg': {
        const spd = Number(p.speed) || 100;
        code += `
  var obj_xn = game.findObject("${targetId}") || game.findObject("${targetName}");
  if (obj_xn) {
    obj_xn.x -= (${spd} >= 10 ? (${spd} * (dt || 0.016)) : ${spd});
  }`;
        break;
      }

      case 'move_y_pos': {
        const spd = Number(p.speed) || 100;
        code += `
  var obj_yp = game.findObject("${targetId}") || game.findObject("${targetName}");
  if (obj_yp) {
    obj_yp.y += (${spd} >= 10 ? (${spd} * (dt || 0.016)) : ${spd});
  }`;
        break;
      }

      case 'move_y_neg': {
        const spd = Number(p.speed) || 100;
        code += `
  var obj_yn = game.findObject("${targetId}") || game.findObject("${targetName}");
  if (obj_yn) {
    obj_yn.y -= (${spd} >= 10 ? (${spd} * (dt || 0.016)) : ${spd});
  }`;
        break;
      }

      // 2. الكاميرا
      case 'camera_follow': {
        const smooth = Number(p.smoothSpeed) || 0.15;
        code += `
  var camTarget = game.findObject("${targetId}") || game.findObject("${targetName}");
  if (camTarget) {
    game.camera.follow(camTarget);
  }`;
        break;
      }

      // 3. الفيزياء
      case 'physics_solid': {
        code += `
  var sObj = game.findObject("${targetId}") || game.findObject("${targetName}");
  if (sObj) {
    sObj.hasCollision = true;
    sObj.isDynamic = false;
    sObj.gravity = 0;
  }`;
        break;
      }

      case 'physics_dynamic': {
        const g = Number(p.gravity) || 0.5;
        const b = Number(p.bounce) || 0.2;
        code += `
  var dObj = game.findObject("${targetId}") || game.findObject("${targetName}");
  if (dObj) {
    dObj.hasCollision = true;
    dObj.isDynamic = true;
    dObj.gravity = ${g};
    dObj.bounce = ${b};
  }`;
        break;
      }

      case 'physics_trigger': {
        code += `
  var tObj = game.findObject("${targetId}") || game.findObject("${targetName}");
  if (tObj) {
    tObj.hasCollision = false;
  }`;
        break;
      }

      case 'physics_gravity': {
        const g = Number(p.gravity) || 0.6;
        code += `
  var gObj = game.findObject("${targetId}") || game.findObject("${targetName}");
  if (gObj) {
    gObj.isDynamic = true;
    gObj.gravity = ${g};
  }`;
        break;
      }

      // 4. انطلاق
      case 'impulse_launch': {
        const fx = Number(p.forceX) || 10;
        const fy = Number(p.forceY) || -10;
        code += `
  var lObj = game.findObject("${targetId}") || game.findObject("${targetName}");
  if (lObj) {
    lObj.vx = ${fx};
    lObj.vy = ${fy};
    lObj.x += ${fx};
    lObj.y += ${fy};
  }`;
        break;
      }

      // 5. نقاط وتغيير مشهد وصوت ومؤثرات
      case 'score_add':
      case 'add_score': {
        const amt = Number(p.amount) || 1;
        code += `
  game.score = (game.score || 0) + ${amt};`;
        break;
      }

      case 'change_scene': {
        const scName = getSceneName(p.targetSceneId);
        code += `
  game.changeScene("${scName}");`;
        break;
      }

      case 'play_sound': {
        const snd = p.sound || 'jump';
        code += `
  game.playSound("${snd}");`;
        break;
      }

      case 'spawn_particles': {
        const pType = p.particleType || 'coins';
        const cnt = Number(p.count) || 20;
        code += `
  var vfxObj = game.findObject("${targetId}") || game.findObject("${targetName}");
  var vfxX = vfxObj ? (vfxObj.x + vfxObj.width / 2) : (game.width / 2);
  var vfxY = vfxObj ? (vfxObj.y + vfxObj.height / 2) : (game.height / 2);
  if (typeof game.spawnParticles === 'function') {
    game.spawnParticles(vfxX, vfxY, { type: "${pType}", count: ${cnt} });
  }`;
        break;
      }

      case 'timer_delay': {
        const sec = Math.max(0.05, Number(p.seconds) || 1);
        const subNodes = getNextNodes(startNode.id, 'flow_out');
        const subChain = subNodes.map(n => compileActionChain(n, new Set(visited))).join('\n');
        code += `
  setTimeout(function() {
${subChain}
  }, ${sec * 1000});`;
        return code;
      }

      case 'loop_repeat': {
        const cnt = Math.max(1, Math.min(100, Number(p.count) || 3));
        const subNodes = getNextNodes(startNode.id, 'flow_out');
        const subChain = subNodes.map(n => compileActionChain(n, new Set(visited))).join('\n');
        code += `
  for (var _loop = 0; _loop < ${cnt}; _loop++) {
${subChain}
  }`;
        return code;
      }
    }

    // Traverse next connected nodes
    const nextNodes = getNextNodes(startNode.id, 'flow_out');
    for (const next of nextNodes) {
      code += compileActionChain(next, visited);
    }

    return code;
  };

  // 1. Compile onStart
  const startNodes = graph.nodes.filter(n => n.type === 'event_start');
  let onStartBody = ``;
  for (const sn of startNodes) {
    const next = getNextNodes(sn.id, 'flow_out');
    for (const n of next) {
      onStartBody += compileActionChain(n);
    }
  }

  // 2. Compile onUpdate
  const updateNodes = graph.nodes.filter(n => n.type === 'event_update');
  let onUpdateBody = ``;
  for (const un of updateNodes) {
    const next = getNextNodes(un.id, 'flow_out');
    for (const n of next) {
      onUpdateBody += compileActionChain(n);
    }
  }

  // 3. Compile Button Triggers (trigger_button / event_press)
  const buttonNodes = graph.nodes.filter(n => n.type === 'trigger_button' || n.type === 'event_press');
  for (const bn of buttonNodes) {
    const p = bn.params || {};
    const nextNodes = getNextNodes(bn.id, 'flow_out');
    if (nextNodes.length === 0) continue;
    const actionCode = nextNodes.map(n => compileActionChain(n)).join('\n');

    if (p.pressType === 'object_click') {
      const clickId = getTargetId(p.targetObjectId);
      const clickName = getObjectName(clickId);
      onUpdateBody += `
  // فحص النقر على كائن/صورة الزر
  if (game.input.mouse && game.input.mouse.clicked) {
    var cObj = game.findObject("${clickId}") || game.findObject("${clickName}");
    if (cObj && cObj.visible) {
      var mx = game.input.mouse.worldX;
      var my = game.input.mouse.worldY;
      if (mx >= cObj.x && mx <= cObj.x + cObj.width &&
          my >= cObj.y && my <= cObj.y + cObj.height) {
        ${actionCode}
      }
    }
  }`;
    } else {
      const key = p.key || 'KeyW';
      onUpdateBody += `
  // فحص ضغط زر الكيبورد "${key}"
  if (game.input.isKeyDown("${key}")) {
    ${actionCode}
  }`;
    }
  }

  // 4. Compile Collision Events
  const colNodes = graph.nodes.filter(n => n.type === 'event_collision');
  for (const cn of colNodes) {
    const p = cn.params || {};
    const idA = getTargetId(p.objectAId);
    const idB = getTargetId(p.objectBId);
    const nameA = getObjectName(idA);
    const nameB = getObjectName(idB);
    const nextNodes = getNextNodes(cn.id, 'flow_out');
    if (nextNodes.length === 0) continue;
    const actionCode = nextNodes.map(n => compileActionChain(n)).join('\n');

    onUpdateBody += `
  var colA = game.findObject("${idA}") || game.findObject("${nameA}");
  var colB = game.findObject("${idB}") || game.findObject("${nameB}");
  if (colA && colB && colA.visible && colB.visible) {
    if (colA.x < colB.x + colB.width &&
        colA.x + colA.width > colB.x &&
        colA.y < colB.y + colB.height &&
        colA.y + colA.height > colB.y) {
      ${actionCode}
    }
  }`;
  }

  return `// كود محرك FY3
function onStart(game) {
${onStartBody}
}

function onUpdate(dt, game) {
${onUpdateBody}
}
`;
}
