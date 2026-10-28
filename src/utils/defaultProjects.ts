import { GameProject } from '../types/engine';
import { BUILTIN_ASSETS } from './builtinAssets';

function getAssetUri(id: string): string {
  const asset = BUILTIN_ASSETS.find(a => a.id === id);
  return asset ? asset.svgDataUri : '';
}

export const DEFAULT_PROJECTS: GameProject[] = [
  {
    id: 'space_shooter_project',
    title: 'مغامرة الفضاء (Space Shooter)',
    description: 'تحكم في المركبة بالأسهم واضغط مسافة لإطلاق الليزر وتدمير كائنات الفضاء.',
    updatedAt: Date.now(),
    settings: {
      width: 700,
      height: 500,
      backgroundColor: '#333333',
      worldBackgroundColor: '#333333',
      gravity: 0,
      pixelated: false,
      showGrid: true,
      gridSize: 20
    },
    globalScript: `// الكود العام للمشهد (Global Game Script)
// يتم تنفيذه مرة واحدة عند بدء اللعبة وفي كل إطار

function onStart(game) {
  game.score = 0;
  game.lives = 3;
}

function onUpdate(dt, game) {
  // رسم لوحة النقاط
  game.drawText("النقاط: " + game.score, 20, 30, { color: "#ffffff", size: 18 });
  game.drawText("المحاولات: " + game.lives, 20, 55, { color: "#aaaaaa", size: 14 });
}
`,
    objects: [
      {
        id: 'obj_player',
        name: 'المركبة (Player)',
        tag: 'player',
        x: 325,
        y: 420,
        width: 50,
        height: 50,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        shapeType: 'image',
        color: '#ffffff',
        borderColor: '#ffffff',
        borderWidth: 0,
        imageData: getAssetUri('spaceship'),
        hasCollision: true,
        colliderType: 'box',
        isDynamic: false,
        gravity: 0,
        vx: 0,
        vy: 0,
        bounce: 0,
        variables: { speed: 6, shootCooldown: 0 },
        script: `// كود المركبة (Player Spaceship)

function onStart(game) {
  this.variables.speed = 6;
  this.variables.shootCooldown = 0;
}

function onUpdate(dt, game) {
  // التحرك يميناً ويساراً بواسطة الأسهم أو A / D
  if (game.input.isKeyDown('ArrowRight') || game.input.isKeyDown('KeyD')) {
    this.x += this.variables.speed;
  }
  if (game.input.isKeyDown('ArrowLeft') || game.input.isKeyDown('KeyA')) {
    this.x -= this.variables.speed;
  }

  // عدم الخروج من حدود الشاشة
  if (this.x < 10) this.x = 10;
  if (this.x > game.width - this.width - 10) this.x = game.width - this.width - 10;

  // تقليل وقت انتظار الإطلاق
  if (this.variables.shootCooldown > 0) {
    this.variables.shootCooldown--;
  }

  // إطلاق الليزر عند الضغط على مسافة (Space)
  if (game.input.isKeyDown('Space') && this.variables.shootCooldown <= 0) {
    const laser = game.findObject('الليزر (Laser)');
    if (laser) {
      laser.x = this.x + (this.width / 2) - (laser.width / 2);
      laser.y = this.y - 15;
      laser.visible = true;
      laser.vy = -12;
      game.playSound('laser');
      this.variables.shootCooldown = 15; // تأخير بين الطلقات
    }
  }
}
`
      },
      {
        id: 'obj_laser',
        name: 'الليزر (Laser)',
        tag: 'bullet',
        x: 345,
        y: -100,
        width: 10,
        height: 22,
        rotation: 0,
        opacity: 1,
        visible: false,
        locked: false,
        shapeType: 'image',
        color: '#ffffff',
        borderColor: '#ffffff',
        borderWidth: 0,
        imageData: getAssetUri('laser_bullet'),
        hasCollision: true,
        colliderType: 'box',
        isDynamic: false,
        gravity: 0,
        vx: 0,
        vy: 0,
        bounce: 0,
        variables: {},
        script: `// كود رصاصة الليزر

function onUpdate(dt, game) {
  if (!this.visible) return;

  // التحرك للأعلى
  this.y += this.vy;

  // إذا خرج الليزر من أعلى الشاشة يتم إخفاؤه
  if (this.y < -30) {
    this.visible = false;
    this.vy = 0;
  }
}

function onCollision(other, game) {
  // فحص التصادم مع العدو
  if (this.visible && other.tag === 'enemy') {
    this.visible = false;
    this.vy = 0;
    
    // زيادة النقاط
    game.score += 10;
    game.playSound('explosion');

    // إعادة وضع العدو في الأعلى بمكان عشوائي
    other.y = -40;
    other.x = Math.random() * (game.width - other.width - 40) + 20;
    other.vy = 2 + Math.random() * 2;
  }
}
`
      },
      {
        id: 'obj_enemy_1',
        name: 'العدو الفضائي 1 (Alien 1)',
        tag: 'enemy',
        x: 200,
        y: 40,
        width: 48,
        height: 34,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        shapeType: 'image',
        color: '#ffffff',
        borderColor: '#ffffff',
        borderWidth: 0,
        imageData: getAssetUri('ufo_enemy'),
        hasCollision: true,
        colliderType: 'box',
        isDynamic: false,
        gravity: 0,
        vx: 1.5,
        vy: 2.2,
        bounce: 0,
        variables: {},
        script: `// كود العدو الفضائي

function onStart(game) {
  this.vy = 2;
  this.vx = (Math.random() - 0.5) * 3;
}

function onUpdate(dt, game) {
  // الهبوط لأسفل والحركة الجانبية
  this.y += this.vy;
  this.x += this.vx;

  // ارتداد جانبي خفيف
  if (this.x < 10 || this.x > game.width - this.width - 10) {
    this.vx *= -1;
  }

  // إذا وصل العدو إلى أسفل الشاشة
  if (this.y > game.height) {
    this.y = -40;
    this.x = Math.random() * (game.width - this.width - 40) + 20;
    game.lives = Math.max(0, game.lives - 1);
    game.playSound('hit');
  }
}
`
      },
      {
        id: 'obj_enemy_2',
        name: 'العدو الفضائي 2 (Alien 2)',
        tag: 'enemy',
        x: 450,
        y: -30,
        width: 48,
        height: 34,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        shapeType: 'image',
        color: '#ffffff',
        borderColor: '#ffffff',
        borderWidth: 0,
        imageData: getAssetUri('ufo_enemy'),
        hasCollision: true,
        colliderType: 'box',
        isDynamic: false,
        gravity: 0,
        vx: -2,
        vy: 2.8,
        bounce: 0,
        variables: {},
        script: `// كود العدو الفضائي الثاني

function onUpdate(dt, game) {
  this.y += this.vy;
  this.x += this.vx;

  if (this.x < 10 || this.x > game.width - this.width - 10) {
    this.vx *= -1;
  }

  if (this.y > game.height) {
    this.y = -50;
    this.x = Math.random() * (game.width - this.width - 40) + 20;
    game.lives = Math.max(0, game.lives - 1);
    game.playSound('hit');
  }
}
`
      }
    ]
  },
  {
    id: 'star_catcher_project',
    title: 'جامع النجوم (Star Catcher)',
    description: 'حرك البطل لجمع النجوم المتساقطة قبل أن تختفي من الشاشة.',
    updatedAt: Date.now() - 3600000,
    settings: {
      width: 650,
      height: 480,
      backgroundColor: '#050505',
      gravity: 0.4,
      pixelated: false,
      showGrid: true,
      gridSize: 20
    },
    globalScript: `// إعدادات اللعبة العامة
function onStart(game) {
  game.score = 0;
}

function onUpdate(dt, game) {
  game.drawText("النجوم المجموعة: " + game.score, 20, 30, { color: "#ffffff", size: 18 });
}
`,
    objects: [
      {
        id: 'obj_hero',
        name: 'البطل (Hero)',
        tag: 'player',
        x: 300,
        y: 380,
        width: 44,
        height: 60,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        shapeType: 'image',
        color: '#ffffff',
        borderColor: '#ffffff',
        borderWidth: 0,
        imageData: getAssetUri('player_hero'),
        hasCollision: true,
        colliderType: 'box',
        isDynamic: false,
        gravity: 0,
        vx: 0,
        vy: 0,
        bounce: 0,
        variables: { speed: 5 },
        script: `// تحكم البطل بالأسهم أو A / D

function onUpdate(dt, game) {
  if (game.input.isKeyDown('ArrowRight') || game.input.isKeyDown('KeyD')) {
    this.x += 6;
  }
  if (game.input.isKeyDown('ArrowLeft') || game.input.isKeyDown('KeyA')) {
    this.x -= 6;
  }

  // حدود الحركة
  if (this.x < 10) this.x = 10;
  if (this.x > game.width - this.width - 10) this.x = game.width - this.width - 10;
}
`
      },
      {
        id: 'obj_star_1',
        name: 'نجمة ذهبية (Star 1)',
        tag: 'coin',
        x: 180,
        y: 20,
        width: 34,
        height: 34,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        shapeType: 'image',
        color: '#ffffff',
        borderColor: '#ffffff',
        borderWidth: 0,
        imageData: getAssetUri('coin_star'),
        hasCollision: true,
        colliderType: 'circle',
        isDynamic: false,
        gravity: 0,
        vx: 0,
        vy: 3,
        bounce: 0,
        variables: {},
        script: `// حركة النجمة ودورانها

function onUpdate(dt, game) {
  this.y += this.vy;
  this.rotation += 2; // دوران جمالي

  // إذا سقطت في القاع
  if (this.y > game.height) {
    this.y = -30;
    this.x = Math.random() * (game.width - this.width - 40) + 20;
    this.vy = 2.5 + Math.random() * 2;
  }
}

function onCollision(other, game) {
  if (other.tag === 'player') {
    game.score += 1;
    game.playSound('coin');
    this.y = -30;
    this.x = Math.random() * (game.width - this.width - 40) + 20;
    this.vy = 2.5 + Math.random() * 2;
  }
}
`
      },
      {
        id: 'obj_star_2',
        name: 'نجمة ذهبية 2 (Star 2)',
        tag: 'coin',
        x: 420,
        y: -100,
        width: 34,
        height: 34,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        shapeType: 'image',
        color: '#ffffff',
        borderColor: '#ffffff',
        borderWidth: 0,
        imageData: getAssetUri('coin_star'),
        hasCollision: true,
        colliderType: 'circle',
        isDynamic: false,
        gravity: 0,
        vx: 0,
        vy: 3.5,
        bounce: 0,
        variables: {},
        script: `// حركة النجمة الثانية

function onUpdate(dt, game) {
  this.y += this.vy;
  this.rotation -= 3;

  if (this.y > game.height) {
    this.y = -40;
    this.x = Math.random() * (game.width - this.width - 40) + 20;
  }
}

function onCollision(other, game) {
  if (other.tag === 'player') {
    game.score += 1;
    game.playSound('coin');
    this.y = -40;
    this.x = Math.random() * (game.width - this.width - 40) + 20;
  }
}
`
      },
      {
        id: 'obj_floor',
        name: 'الأرضية (Floor)',
        tag: 'platform',
        x: 0,
        y: 450,
        width: 650,
        height: 30,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: true,
        shapeType: 'rectangle',
        color: '#222222',
        borderColor: '#ffffff',
        borderWidth: 2,
        hasCollision: false,
        colliderType: 'box',
        isDynamic: false,
        gravity: 0,
        vx: 0,
        vy: 0,
        bounce: 0,
        variables: {},
        script: `// أرضية ثابتة للمشهد
function onStart(game) {}
`
      }
    ]
  },
  {
    id: 'pong_classic_project',
    title: 'تنس الطاولة الكلاسيكي (Pong Classic)',
    description: 'لعبة البونج الكلاسيكية بالأسود والأبيض. اصدم الكرة بالمضرب لجمع النقاط.',
    updatedAt: Date.now() - 7200000,
    settings: {
      width: 600,
      height: 450,
      backgroundColor: '#000000',
      gravity: 0,
      pixelated: false,
      showGrid: true,
      gridSize: 25
    },
    globalScript: `// لعبة تنس الطاولة
function onStart(game) {
  game.score = 0;
}

function onUpdate(dt, game) {
  game.drawText("النتيجة: " + game.score, 20, 30, { color: "#ffffff", size: 20 });
}
`,
    objects: [
      {
        id: 'obj_paddle',
        name: 'المضرب (Paddle)',
        tag: 'paddle',
        x: 250,
        y: 410,
        width: 100,
        height: 18,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        shapeType: 'rectangle',
        color: '#ffffff',
        borderColor: '#ffffff',
        borderWidth: 0,
        hasCollision: true,
        colliderType: 'box',
        isDynamic: false,
        gravity: 0,
        vx: 0,
        vy: 0,
        bounce: 0,
        variables: {},
        script: `// تحكم المضرب بحركة الفأرة أو الأسهم

function onUpdate(dt, game) {
  // التحكم بواسطة الفأرة
  if (game.input.mouse.x > 0) {
    this.x = game.input.mouse.x - (this.width / 2);
  } else {
    // أو بالأسهم
    if (game.input.isKeyDown('ArrowRight')) this.x += 8;
    if (game.input.isKeyDown('ArrowLeft')) this.x -= 8;
  }

  // عدم الخروج من الشاشة
  if (this.x < 0) this.x = 0;
  if (this.x > game.width - this.width) this.x = game.width - this.width;
}
`
      },
      {
        id: 'obj_ball',
        name: 'الكرة (Ball)',
        tag: 'ball',
        x: 290,
        y: 100,
        width: 22,
        height: 22,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        shapeType: 'circle',
        color: '#ffffff',
        borderColor: '#ffffff',
        borderWidth: 0,
        hasCollision: true,
        colliderType: 'circle',
        isDynamic: false,
        gravity: 0,
        vx: 4,
        vy: 4,
        bounce: 1,
        variables: {},
        script: `// حركة وارتداد الكرة

function onStart(game) {
  this.vx = 4;
  this.vy = 4;
}

function onUpdate(dt, game) {
  this.x += this.vx;
  this.y += this.vy;

  // ارتداد من الجدران الجانبية
  if (this.x <= 0 || this.x >= game.width - this.width) {
    this.vx *= -1;
    game.playSound('click');
  }

  // ارتداد من السقف
  if (this.y <= 0) {
    this.vy *= -1;
    game.playSound('click');
  }

  // السقوط في القاع (خسارة)
  if (this.y > game.height) {
    this.x = game.width / 2 - 10;
    this.y = 80;
    this.vy = 4;
    game.score = Math.max(0, game.score - 1);
    game.playSound('hit');
  }
}

function onCollision(other, game) {
  if (other.tag === 'paddle') {
    this.vy = -Math.abs(this.vy);
    // إضافة زاوية بحسب مكان الاصطدام بالمضرب
    const diff = (this.x + this.width / 2) - (other.x + other.width / 2);
    this.vx = diff * 0.12;
    game.score += 1;
    game.playSound('jump');
  }
}
`
      }
    ]
  }
];

export const DEFAULT_LAYERS = [
  {
    id: 'layer_main',
    name: 'الطبقة 1',
    type: 'world' as const,
    visible: true,
    locked: false,
    backgroundColor: '#333333'
  }
];

export const EMPTY_PROJECT_TEMPLATE: GameProject = {
  id: '',
  title: 'مشروع جديد (New Game)',
  description: 'مشروع ألعاب جديد فارغ.',
  updatedAt: Date.now(),
  settings: {
    width: 640,
    height: 480,
    backgroundColor: '#333333',
    worldBackgroundColor: '#333333',
    worldBackgroundRepeat: 'repeat',
    gravity: 0,
    pixelated: false,
    showGrid: true,
    gridSize: 20
  },
  layers: [
    {
      id: 'layer_main',
      name: 'الطبقة 1',
      type: 'world',
      visible: true,
      locked: false,
      backgroundColor: '#333333'
    }
  ],
  globalScript: '',
  nodeGraph: { nodes: [], connections: [] },
  objects: []
};

