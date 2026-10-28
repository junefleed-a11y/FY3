import { GameObject } from '../types/engine';

export interface PrebuiltBehaviorOption {
  id: 'movement' | 'player_lr' | 'solid' | 'pushable';
  titleKey: 'behaviorMovementTitle' | 'behaviorPlayerTitle' | 'behaviorSolidTitle' | 'behaviorPushableTitle';
  descKey: 'behaviorMovementDesc' | 'behaviorPlayerDesc' | 'behaviorSolidDesc' | 'behaviorPushableDesc';
  iconType: 'arrows' | 'player' | 'shield' | 'circle';
}

export const PREBUILT_BEHAVIOR_OPTIONS: PrebuiltBehaviorOption[] = [
  {
    id: 'movement',
    titleKey: 'behaviorMovementTitle',
    descKey: 'behaviorMovementDesc',
    iconType: 'arrows'
  },
  {
    id: 'player_lr',
    titleKey: 'behaviorPlayerTitle',
    descKey: 'behaviorPlayerDesc',
    iconType: 'player'
  },
  {
    id: 'solid',
    titleKey: 'behaviorSolidTitle',
    descKey: 'behaviorSolidDesc',
    iconType: 'shield'
  },
  {
    id: 'pushable',
    titleKey: 'behaviorPushableTitle',
    descKey: 'behaviorPushableDesc',
    iconType: 'circle'
  }
];

export function applyPrebuiltBehavior(object: GameObject, behaviorId: string): GameObject {
  const updated = { ...object };

  switch (behaviorId) {
    case 'movement':
      // 4-Way Movement (Arrows & WASD)
      updated.hasCollision = true;
      updated.isDynamic = false;
      updated.variables = {
        ...updated.variables,
        speed: 5
      };
      updated.script = `// سلوك: حركة 4 اتجاهات بالأسهم ومفاتيح WASD
// FY3 v1.0.1 - المطور يونيو فليد (yonio fleed)

function onStart(game) {
  this.variables.speed = 5;
}

function onUpdate(dt, game) {
  const speed = this.variables.speed || 5;

  if (game.input.isKeyDown('ArrowRight') || game.input.isKeyDown('KeyD')) {
    this.x += speed;
  }
  if (game.input.isKeyDown('ArrowLeft') || game.input.isKeyDown('KeyA')) {
    this.x -= speed;
  }
  if (game.input.isKeyDown('ArrowUp') || game.input.isKeyDown('KeyW')) {
    this.y -= speed;
  }
  if (game.input.isKeyDown('ArrowDown') || game.input.isKeyDown('KeyS')) {
    this.y += speed;
  }
}
`;
      break;

    case 'player_lr':
      // NEW: حركة لاعب يمين ويسار مع كاميرا تتبع اللاعب تلقائياً في العالم اللانهائي
      updated.hasCollision = true;
      updated.isDynamic = false;
      updated.tag = 'player';
      updated.variables = {
        ...updated.variables,
        speed: 6,
        jumpForce: 11,
        gravity: 0.5,
        isGrounded: false
      };
      updated.script = `// سلوك: حركة لاعب يمين و يسار (مع كاميرا تتبع اللاعب تلقائياً)
// FY3 v1.0.1 - المطور يونيو فليد (yonio fleed)

function onStart(game) {
  this.vx = 0;
  this.vy = 0;
  this.variables.speed = 6;
  this.variables.jumpForce = 11;
  this.variables.gravity = 0.5;
  this.variables.isGrounded = false;
  
  // تفعيل تتبع الكاميرا للاعب في العالم اللانهائي فوراً
  if (game.camera) {
    game.camera.follow(this);
  }
}

function onUpdate(dt, game) {
  const speed = this.variables.speed || 6;
  const gravity = this.variables.gravity || 0.5;
  const jumpForce = this.variables.jumpForce || 11;

  // 1. حركة اللاعب يميناً ويساراً بواسطة الأسهم أو A / D
  if (game.input.isKeyDown('ArrowRight') || game.input.isKeyDown('KeyD')) {
    this.x += speed;
  }
  if (game.input.isKeyDown('ArrowLeft') || game.input.isKeyDown('KeyA')) {
    this.x -= speed;
  }

  // 2. قفز بمسافة أو سهم لأعلى
  const jumpPressed = game.input.isKeyDown('Space') || game.input.isKeyDown('ArrowUp') || game.input.isKeyDown('KeyW');
  if (jumpPressed && this.variables.isGrounded) {
    this.vy = -jumpForce;
    this.variables.isGrounded = false;
    game.playSound('jump');
  }

  // 3. فيزياء الجاذبية
  this.vy += gravity;
  this.y += this.vy;

  // الاستقرار على الأرضية الافتراضية
  if (this.y >= game.height - this.height - 10) {
    this.y = game.height - this.height - 10;
    this.vy = 0;
    this.variables.isGrounded = true;
  }

  // 4. الكاميرا تتبع حركة اللاعب بسلاسة في العالم اللانهائي
  if (game.camera) {
    game.camera.follow(this);
  }
}

function onCollision(other, game) {
  // الهبوط فوق الكائنات الصلبة والمنصات
  if (other.tag === 'solid' || other.tag === 'platform') {
    if (this.vy > 0 && (this.y + this.height - this.vy) <= other.y + 12) {
      this.y = other.y - this.height;
      this.vy = 0;
      this.variables.isGrounded = true;
    }
  }
}
`;
      break;

    case 'solid':
      // Solid Object / Platform
      updated.hasCollision = true;
      updated.isDynamic = false;
      updated.tag = 'solid';
      updated.script = `// سلوك: كائن صلب / جدار ومنصة تمنع السقوط
// FY3 v1.0.1 - المطور يونيو فليد (yonio fleed)

function onStart(game) {
  // كائن صلب ثابت في موضعه
}

function onCollision(other, game) {
  if (other.vy && other.vy > 0 && other.y < this.y) {
    other.y = this.y - other.height;
    other.vy = 0;
    if (other.variables) other.variables.isGrounded = true;
  }
}
`;
      break;

    case 'pushable':
      // Pushable Dynamic Object
      updated.hasCollision = true;
      updated.isDynamic = false;
      updated.tag = 'pushable';
      updated.variables = {
        ...updated.variables,
        friction: 0.94
      };
      updated.script = `// سلوك: كائن ديناميكي قابل للدفع والتصادم (مثل الكرة)
// FY3 v1.0.1 - المطور يونيو فليد (yonio fleed)

function onStart(game) {
  this.vx = 0;
  this.vy = 0;
  this.variables.friction = 0.94;
}

function onUpdate(dt, game) {
  this.x += this.vx;
  this.y += this.vy;

  const friction = this.variables.friction || 0.94;
  this.vx *= friction;
  this.vy *= friction;

  if (Math.abs(this.vx) < 0.05) this.vx = 0;
  if (Math.abs(this.vy) < 0.05) this.vy = 0;

  if (this.vx !== 0 || this.vy !== 0) {
    this.rotation = (this.rotation + this.vx * 3) % 360;
  }
}

function onCollision(other, game) {
  const dx = (this.x + this.width / 2) - (other.x + other.width / 2);
  const dy = (this.y + this.height / 2) - (other.y + other.height / 2);
  const angle = Math.atan2(dy, dx);
  const pushStrength = 7;

  this.vx = Math.cos(angle) * pushStrength;
  this.vy = Math.sin(angle) * pushStrength;

  game.playSound('hit');
}
`;
      break;
  }

  return updated;
}
