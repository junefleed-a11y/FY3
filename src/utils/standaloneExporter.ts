import { GameProject } from '../types/engine';

function obfuscateJavaScript(rawScript: string): string {
  // UTF-8 safe base64 encoding to prevent encoding issues with Arabic characters
  let encoded = '';
  try {
    encoded = btoa(encodeURIComponent(rawScript).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16))));
  } catch {
    encoded = btoa(unescape(encodeURIComponent(rawScript)));
  }

  return `/* FY3 ENGINE STANDALONE PROTECTED RUNTIME - DEVELOPER: YONIO FLEED (يونيو فليد) */
(function(){
  try {
    var _0xdecode = function(str) {
      return decodeURIComponent(escape(window.atob(str)));
    };
    var _0xlauncher = new Function(_0xdecode("${encoded}"));
    _0xlauncher();
  } catch(err) {
    console.error("FY3 Runtime Launch Error:", err);
  }
})();`;
}

export function generateStandaloneGameHtml(project: GameProject): string {
  const jsonProject = JSON.stringify(project);

  const rawScript = `
    const project = ${jsonProject};
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // Camera System for Infinite World
    const camera = {
      x: 0,
      y: 0,
      target: null,
      follow: function(obj) {
        this.target = obj;
        if (obj) {
          this.x = (obj.x + (obj.width || 0) / 2) - canvas.width / 2;
          this.y = (obj.y + (obj.height || 0) / 2) - canvas.height / 2;
        }
      }
    };

    // Audio Synthesizer
    let audioCtx = null;
    function playSound(type) {
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        if (type === 'jump') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(150, now);
          osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
          osc.start(now); osc.stop(now + 0.15);
        } else if (type === 'laser') {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.exponentialRampToValueAtTime(100, now + 0.12);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
          osc.start(now); osc.stop(now + 0.12);
        } else if (type === 'coin') {
          osc.type = 'square';
          osc.frequency.setValueAtTime(987, now);
          osc.frequency.setValueAtTime(1318, now + 0.08);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
          osc.start(now); osc.stop(now + 0.25);
        } else if (type === 'explosion' || type === 'hit') {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(120, now);
          osc.frequency.linearRampToValueAtTime(20, now + 0.2);
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
          osc.start(now); osc.stop(now + 0.2);
        } else {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, now);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
          osc.start(now); osc.stop(now + 0.1);
        }
      } catch (e) {}
    }

    // Image Caching
    const imageCache = {};
    function preloadImages() {
      if (project.settings.worldBackgroundImage) {
        const bg = new Image();
        bg.src = project.settings.worldBackgroundImage;
        imageCache[project.settings.worldBackgroundImage] = bg;
      }
      if (project.layers) {
        for (const l of project.layers) {
          if (l.backgroundImage) {
            const limg = new Image();
            limg.src = l.backgroundImage;
            imageCache[l.backgroundImage] = limg;
          }
        }
      }
      for (const obj of project.objects) {
        if (obj.shapeType === 'image' && obj.imageData) {
          const img = new Image();
          img.src = obj.imageData;
          imageCache[obj.imageData] = img;
        }
        if (obj.animations) {
          for (const aKey of Object.keys(obj.animations)) {
            const anim = obj.animations[aKey];
            for (const f of anim.frames) {
              if (f.imageData && !imageCache[f.imageData]) {
                const fImg = new Image();
                fImg.src = f.imageData;
                imageCache[f.imageData] = fImg;
              }
            }
          }
        }
      }
    }
    preloadImages();

    // Input Handlers
    const keysDown = new Set();
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
      keysDown.add(e.code);
    });
    window.addEventListener('keyup', (e) => {
      keysDown.delete(e.code);
    });

    const mouse = { x: 0, y: 0, worldX: 0, worldY: 0, isDown: false };
    function updateMousePos(e) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      mouse.x = (e.clientX - rect.left) * scaleX;
      mouse.y = (e.clientY - rect.top) * scaleY;
      mouse.worldX = mouse.x + camera.x;
      mouse.worldY = mouse.y + camera.y;
    }

    canvas.addEventListener('mousemove', updateMousePos);
    canvas.addEventListener('mousedown', (e) => {
      canvas.focus();
      mouse.isDown = true;
      updateMousePos(e);
    });
    window.addEventListener('mouseup', () => { mouse.isDown = false; });

    let runtimeObjects = [];
    let runtimeLayers = [];
    let animStates = new Map();
    let score = 0;
    let lives = 3;
    let customData = {};
    let drawTextCommands = [];
    let animFrame = null;
    let lastTime = 0;
    let behaviors = new Map();
    let globalBehavior = {};

    function initGame() {
      if (animFrame) cancelAnimationFrame(animFrame);
      const activeScene = (project.scenes && project.scenes.find(s => s.id === project.activeSceneId)) || (project.scenes && project.scenes[0]);
      const initialObjs = (activeScene && activeScene.objects) ? activeScene.objects : project.objects;
      const initialLayers = (activeScene && activeScene.layers && activeScene.layers.length > 0) ? activeScene.layers : (project.layers && project.layers.length > 0 ? project.layers : [
        { id: 'world_default', name: 'World', type: 'world', visible: true, locked: false },
        { id: 'ui_default', name: 'UI', type: 'ui', visible: true, locked: false }
      ]);
      runtimeObjects = JSON.parse(JSON.stringify(initialObjs));
      runtimeLayers = JSON.parse(JSON.stringify(initialLayers));

      score = 0;
      lives = 3;
      customData = {};
      drawTextCommands = [];
      camera.x = 0;
      camera.y = 0;
      camera.target = null;
      behaviors.clear();
      animStates.clear();

      try {
        if (project.globalScript) {
          const fn = new Function(project.globalScript + '; return { onStart: typeof onStart === "function" ? onStart : undefined, onUpdate: typeof onUpdate === "function" ? onUpdate : undefined };');
          globalBehavior = fn();
        }
      } catch (e) { console.error('Global script error:', e); }

      for (const obj of runtimeObjects) {
        obj.variables = obj.variables || {};

        const initialAnim = obj.currentAnimationId || obj.defaultAnimationId || (obj.animations ? Object.keys(obj.animations)[0] : '');
        if (initialAnim) {
          animStates.set(obj.id, { animId: initialAnim, frameIdx: 0, timer: 0 });
        }

        obj.playAnimation = function(animName) {
          if (!this.animations) return;
          const targetKey = Object.keys(this.animations).find(k => k === animName || this.animations[k].name === animName);
          if (targetKey) {
            animStates.set(this.id, { animId: targetKey, frameIdx: 0, timer: 0 });
            this.currentAnimationId = targetKey;
          }
        };

        if (obj.script && obj.script.trim()) {
          try {
            const fn = new Function(obj.script + '; return { onStart: typeof onStart === "function" ? onStart : undefined, onUpdate: typeof onUpdate === "function" ? onUpdate : undefined, onCollision: typeof onCollision === "function" ? onCollision : undefined };');
            behaviors.set(obj.id, fn());
          } catch (e) { console.error('Object script error in ' + obj.name, e); }
        }
      }

      // Auto-detect player object for camera follow
      const playerObj = runtimeObjects.find(o => o.tag === 'player') || runtimeObjects.find(o => o.name.includes('اللاعب') || o.name.toLowerCase().includes('player'));
      if (playerObj) {
        camera.follow(playerObj);
      }

      const api = getAPI();
      if (globalBehavior.onStart) {
        try { globalBehavior.onStart(api); } catch (e) { console.error(e); }
      }
      for (const obj of runtimeObjects) {
        const b = behaviors.get(obj.id);
        if (b && b.onStart) {
          try { b.onStart.call(obj, api); } catch (e) { console.error(e); }
        }
      }

      canvas.focus();
      lastTime = performance.now();
      animFrame = requestAnimationFrame(loop);
    }

    function loadScene(sceneNameOrId) {
      if (!project.scenes || project.scenes.length === 0) return;
      const targetScene = project.scenes.find(s => s.id === sceneNameOrId || s.name === sceneNameOrId);
      if (!targetScene) return;

      if (animFrame) cancelAnimationFrame(animFrame);
      runtimeObjects = JSON.parse(JSON.stringify(targetScene.objects || []));
      runtimeLayers = JSON.parse(JSON.stringify(targetScene.layers && targetScene.layers.length > 0 ? targetScene.layers : project.layers || []));
      behaviors.clear();
      animStates.clear();
      drawTextCommands = [];
      camera.x = 0;
      camera.y = 0;
      camera.target = null;

      try {
        var gCode = targetScene.globalScript || project.globalScript || '';
        if (gCode) {
          var fn = new Function(gCode + '; return { onStart: typeof onStart === "function" ? onStart : undefined, onUpdate: typeof onUpdate === "function" ? onUpdate : undefined };');
          globalBehavior = fn();
        }
      } catch(e) { console.error('Global script error:', e); }

      for (var i = 0; i < runtimeObjects.length; i++) {
        var obj = runtimeObjects[i];
        obj.variables = obj.variables || {};
        var initAnim = obj.currentAnimationId || obj.defaultAnimationId || (obj.animations ? Object.keys(obj.animations)[0] : '');
        if (initAnim) animStates.set(obj.id, { animId: initAnim, frameIdx: 0, timer: 0 });

        obj.playAnimation = function(animName) {
          if (!this.animations) return;
          var self = this;
          var k = Object.keys(this.animations).find(function(key) { return key === animName || self.animations[key].name === animName; });
          if (k) {
            animStates.set(this.id, { animId: k, frameIdx: 0, timer: 0 });
            this.currentAnimationId = k;
          }
        };

        if (obj.script && obj.script.trim()) {
          try {
            var fn = new Function(obj.script + '; return { onStart: typeof onStart === "function" ? onStart : undefined, onUpdate: typeof onUpdate === "function" ? onUpdate : undefined, onCollision: typeof onCollision === "function" ? onCollision : undefined };');
            behaviors.set(obj.id, fn());
          } catch(e) { console.error('Object script error in ' + obj.name, e); }
        }
      }

      var playerObj = runtimeObjects.find(function(o) { return o.tag === 'player' || o.name.indexOf('اللاعب') !== -1 || o.name.toLowerCase().indexOf('player') !== -1; });
      if (playerObj) camera.follow(playerObj);

      var api = getAPI();
      if (globalBehavior.onStart) {
        try { globalBehavior.onStart(api); } catch(e){}
      }
      for (var i = 0; i < runtimeObjects.length; i++) {
        var b = behaviors.get(runtimeObjects[i].id);
        if (b && b.onStart) {
          try { b.onStart.call(runtimeObjects[i], api); } catch(e){}
        }
      }

      canvas.focus();
      lastTime = performance.now();
      animFrame = requestAnimationFrame(loop);
    }

    function getAPI() {
      return {
        width: canvas.width,
        height: canvas.height,
        score: score,
        lives: lives,
        camera: camera,
        data: customData,
        input: {
          isKeyDown: (code) => keysDown.has(code),
          mouse: mouse
        },
        playSound: playSound,
        findObject: (name) => runtimeObjects.find(o => o.name === name || o.id === name),
        getObjectsWithTag: (tag) => runtimeObjects.filter(o => o.tag === tag),
        loadScene: loadScene,
        changeScene: loadScene,
        drawText: (text, x, y, opt) => {
          drawTextCommands.push({ 
            text: String(text), 
            x: x, 
            y: y, 
            color: (opt && opt.color) || '#ffffff', 
            size: (opt && opt.size) || 16 
          });
        }
      };
    }

    function getBounds(obj) {
      if (obj.collisionMesh && obj.collisionMesh.enabled) {
        return {
          x: obj.x + (obj.collisionMesh.offsetX || 0),
          y: obj.y + (obj.collisionMesh.offsetY || 0),
          width: obj.collisionMesh.customWidth || obj.width,
          height: obj.collisionMesh.customHeight || obj.height,
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

    function checkCollision(a, b) {
      if (!a.visible || !b.visible || !a.hasCollision || !b.hasCollision) return false;
      const bA = getBounds(a);
      const bB = getBounds(b);

      if (bA.isCircle && bB.isCircle) {
        const rA = Math.min(bA.width, bA.height) / 2;
        const rB = Math.min(bB.width, bB.height) / 2;
        const dist = Math.hypot((bA.x + bA.width / 2) - (bB.x + bB.width / 2), (bA.y + bA.height / 2) - (bB.y + bB.height / 2));
        return dist < (rA + rB);
      }

      return (
        bA.x < bB.x + bB.width &&
        bA.x + bA.width > bB.x &&
        bA.y < bB.y + bB.height &&
        bA.y + bA.height > bB.y
      );
    }

    function loop(now) {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      update(dt);
      render();
      animFrame = requestAnimationFrame(loop);
    }

    function update(dt) {
      const api = getAPI();
      drawTextCommands = [];

      // Camera Follow in Infinite World
      if (camera.target) {
        const tx = camera.target.x + (camera.target.width || 0) / 2;
        const ty = camera.target.y + (camera.target.height || 0) / 2;
        const targetX = tx - canvas.width / 2;
        const targetY = ty - canvas.height / 2;
        camera.x += (targetX - camera.x) * 0.15;
        camera.y += (targetY - camera.y) * 0.15;
      }

      // Update Sprite Animation timers
      for (const obj of runtimeObjects) {
        if (!obj.animations) continue;
        const aState = animStates.get(obj.id);
        if (!aState) continue;
        const anim = obj.animations[aState.animId];
        if (!anim || anim.frames.length <= 1) continue;
        aState.timer += dt * 1000;
        const dur = Math.max(20, anim.frameDurationMs || 150);
        if (aState.timer >= dur) {
          aState.timer = 0;
          aState.frameIdx++;
          if (aState.frameIdx >= anim.frames.length) {
            aState.frameIdx = anim.loop ? 0 : anim.frames.length - 1;
          }
        }
      }

      if (globalBehavior.onUpdate) {
        try { globalBehavior.onUpdate(dt, api); } catch (e) { console.error(e); }
      }

      for (const obj of runtimeObjects) {
        if (!obj.visible) continue;
        obj.variables = obj.variables || {};

        if (obj.isDynamic) {
          const gravity = obj.gravity !== 0 ? obj.gravity : (project.settings.gravity || 0);
          obj.vy = (obj.vy || 0) + gravity * 60 * dt;
          obj.x += (obj.vx || 0);
          obj.y += (obj.vy || 0);
        }

        const b = behaviors.get(obj.id);
        if (b && b.onUpdate) {
          try { b.onUpdate.call(obj, dt, api); } catch (e) { console.error(e); }
        }
      }

      for (let i = 0; i < runtimeObjects.length; i++) {
        for (let j = i + 1; j < runtimeObjects.length; j++) {
          const a = runtimeObjects[i];
          const b = runtimeObjects[j];
          if (checkCollision(a, b)) {
            const bA = behaviors.get(a.id);
            const bB = behaviors.get(b.id);
            if (bA && bA.onCollision) try { bA.onCollision.call(a, b, api); } catch(e){}
            if (bB && bB.onCollision) try { bB.onCollision.call(b, a, api); } catch(e){}
          }
        }
      }

      score = api.score;
      lives = api.lives;
    }

    function drawObj(obj) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, obj.opacity ?? 1));
      const cx = obj.x + obj.width / 2;
      const cy = obj.y + obj.height / 2;
      ctx.translate(cx, cy);
      if (obj.rotation) ctx.rotate((obj.rotation * Math.PI) / 180);

      let currentImgSrc = obj.imageData;
      if (obj.animations) {
        const aState = animStates.get(obj.id);
        if (aState) {
          const anim = obj.animations[aState.animId];
          if (anim && anim.frames[aState.frameIdx]) {
            currentImgSrc = anim.frames[aState.frameIdx].imageData;
          }
        }
      }

      if (obj.shapeType === 'image' || currentImgSrc) {
        const img = currentImgSrc ? imageCache[currentImgSrc] : null;
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
        if (obj.borderWidth > 0) {
          ctx.lineWidth = obj.borderWidth;
          ctx.strokeStyle = obj.borderColor || '#000000';
          ctx.stroke();
        }
      } else {
        ctx.fillStyle = obj.color || '#ffffff';
        ctx.fillRect(-obj.width / 2, -obj.height / 2, obj.width, obj.height);
        if (obj.borderWidth > 0) {
          ctx.lineWidth = obj.borderWidth;
          ctx.strokeStyle = obj.borderColor || '#000000';
          ctx.strokeRect(-obj.width / 2, -obj.height / 2, obj.width, obj.height);
        }
      }

      ctx.restore();
    }

    function render() {
      ctx.imageSmoothingEnabled = !project.settings.pixelated;

      // 1. Effective Background
      const bg = project.settings.worldBackgroundColor || project.settings.backgroundColor || '#333333';
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Infinite World Pattern Background
      if (project.settings.worldBackgroundImage) {
        const bgImg = imageCache[project.settings.worldBackgroundImage];
        if (bgImg && bgImg.complete) {
          if (project.settings.worldBackgroundRepeat === 'stretch') {
            ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
          } else {
            const pattern = ctx.createPattern(bgImg, 'repeat');
            if (pattern) {
              ctx.save();
              const iw = bgImg.naturalWidth || 64;
              const ih = bgImg.naturalHeight || 64;
              ctx.translate(-(Math.round(camera.x) % iw), -(Math.round(camera.y) % ih));
              ctx.fillStyle = pattern;
              ctx.fillRect(-iw, -ih, canvas.width + iw * 2, canvas.height + ih * 2);
              ctx.restore();
            }
          }
        }
      }

      // 3. World Space Layers & Objects with Camera Translation
      ctx.save();
      ctx.translate(-Math.round(camera.x), -Math.round(camera.y));

      const worldLayers = runtimeLayers.filter(l => l.type === 'world');
      for (const lay of worldLayers) {
        if (!lay.visible) continue;
        if (lay.backgroundImage) {
          const lImg = imageCache[lay.backgroundImage];
          if (lImg && lImg.complete) ctx.drawImage(lImg, 0, 0, canvas.width, canvas.height);
        }
        const layerObjs = runtimeObjects.filter(o => o.layerId === lay.id || (!o.layerId && lay === worldLayers[0]));
        for (const o of layerObjs) {
          if (o.visible) drawObj(o);
        }
      }

      ctx.restore(); // restore camera

      // 4. Render UI Layers (Fixed on Screen)
      const uiLayers = runtimeLayers.filter(l => l.type === 'ui');
      for (const lay of uiLayers) {
        if (!lay.visible) continue;
        if (lay.backgroundImage) {
          const lImg = imageCache[lay.backgroundImage];
          if (lImg && lImg.complete) ctx.drawImage(lImg, 0, 0, canvas.width, canvas.height);
        }
        const layerObjs = runtimeObjects.filter(o => o.layerId === lay.id);
        for (const o of layerObjs) {
          if (o.visible) drawObj(o);
        }
      }

      // 5. Render HUD UI Texts (Fixed Screen Overlay)
      for (const cmd of drawTextCommands) {
        ctx.fillStyle = cmd.color;
        ctx.font = 'bold ' + cmd.size + 'px sans-serif';
        ctx.fillText(cmd.text, cmd.x, cmd.y);
      }
    }

    window.restartGame = initGame;

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initGame);
    } else {
      initGame();
    }
  `;

  const obfuscatedScript = obfuscateJavaScript(rawScript);

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project.title} - FY3 (المطور يونيو فليد)</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #000000;
      color: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      overflow: hidden;
      user-select: none;
    }
    #game-container {
      position: relative;
      border: 2px solid #333333;
      box-shadow: 0 15px 35px rgba(0,0,0,0.9);
      background: ${project.settings.backgroundColor || '#000000'};
      max-width: 98vw;
      max-height: 88vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    canvas {
      display: block;
      outline: none;
      max-width: 100%;
      max-height: 85vh;
      object-fit: contain;
    }
    #ui-bar {
      margin-top: 12px;
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      color: #888888;
      font-family: monospace;
      padding: 0 10px;
    }
    .badge {
      background: #ffffff;
      color: #000000;
      padding: 2px 7px;
      font-weight: 900;
      font-size: 11px;
    }
    .credit {
      color: #bbbbbb;
      font-size: 11px;
    }
    button {
      background: #ffffff;
      color: #000000;
      border: 1px solid #ffffff;
      padding: 5px 14px;
      font-weight: bold;
      cursor: pointer;
      font-size: 11px;
      transition: background 0.2s;
    }
    button:hover {
      background: #cccccc;
    }
  </style>
</head>
<body>
  <div id="game-container">
    <canvas id="gameCanvas" width="${project.settings.width}" height="${project.settings.height}" tabindex="0"></canvas>
  </div>
  <div id="ui-bar">
    <span class="badge">FY3</span>
    <span><strong>${project.title}</strong></span>
    <span class="credit">المطور يونيو فليد (yonio fleed)</span>
    <button onclick="restartGame()">إعادة البدء</button>
  </div>

  <script>
${obfuscatedScript}
  </script>
</body>
</html>`;
}
