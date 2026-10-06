/**
 * js/systems/ParticleSystem.js
 * 水墨風粒子系統：濃淡墨暈擴散、墨汁飛濺、水墨飛花與飄墨雅緻特效
 */

export class ParticleSystem {
  constructor() {
    this.inkBlooms   = []; // 墨暈擴散層（水墨浸潤宣紙）
    this.splashes    = []; // 墨點飛濺
    this.inkMists    = []; // 墨氣升騰
    this.floatingInk = []; // 勝利飄落的水墨飛絮與硃砂墨花
  }

  /** 重設並清空所有水墨特效 */
  clear() {
    this.inkBlooms   = [];
    this.splashes    = [];
    this.inkMists    = [];
    this.floatingInk = [];
  }

  // ─────────────────────────────────────────────
  // 落子反饋：水墨暈染 + 筆墨飛濺
  // ─────────────────────────────────────────────
  /**
   * 落子水墨綻放反饋
   * @param {number} x  畫布像素 X
   * @param {number} y  畫布像素 Y
   * @param {boolean} isPlayer  是否為玩家黑棋（黑棋濃墨，白棋淡玉墨霜）
   */
  emitPlacement(x, y, isPlayer) {
    if (isPlayer) {
      // 玩家黑棋：濃墨浸染、焦墨飛濺
      // 1. 三層濃淡不同的水墨暈染波
      this._addInkBloom(x, y, 6, 26, 'rgba(18, 24, 20, 0.75)', 0.45);
      this._addInkBloom(x, y, 10, 42, 'rgba(38, 48, 42, 0.45)', 0.65);
      this._addInkBloom(x, y, 14, 58, 'rgba(60, 72, 64, 0.22)', 0.85);

      // 2. 墨滴飛濺（毛筆落紙時細微的濺墨點）
      const count = 16;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.7;
        const speed = 25 + Math.random() * 65;
        this.splashes.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 1.5 + Math.random() * 2.8,
          color: Math.random() > 0.3 ? '#151c17' : '#2b382f',
          alpha: 0.9,
          maxLife: 0.4 + Math.random() * 0.3,
          life: 0.4 + Math.random() * 0.3,
          friction: 0.92,
        });
      }

      // 3. 幾團輕柔的水墨輕煙霧
      for (let i = 0; i < 6; i++) {
        this.inkMists.push({
          x: x + (Math.random() - 0.5) * 12,
          y: y + (Math.random() - 0.5) * 12,
          vx: (Math.random() - 0.5) * 10,
          vy: -8 - Math.random() * 12, // 緩緩向上飄散
          radius: 8 + Math.random() * 12,
          maxRadius: 22 + Math.random() * 10,
          color: 'rgba(28, 36, 30,',
          alpha: 0.35,
          maxLife: 0.7,
          life: 0.7,
        });
      }
    } else {
      // 電腦白棋：素白霜墨、白玉氣韻、淡金墨光
      this._addInkBloom(x, y, 6, 28, 'rgba(240, 235, 215, 0.85)', 0.45);
      this._addInkBloom(x, y, 12, 45, 'rgba(220, 212, 185, 0.45)', 0.65);
      this._addInkBloom(x, y, 16, 56, 'rgba(195, 185, 155, 0.25)', 0.85);

      const count = 14;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.6;
        const speed = 25 + Math.random() * 60;
        this.splashes.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 1.5 + Math.random() * 2.5,
          color: Math.random() > 0.4 ? '#f5f0dc' : '#d8cfb0',
          alpha: 0.9,
          maxLife: 0.4 + Math.random() * 0.3,
          life: 0.4 + Math.random() * 0.3,
          friction: 0.92,
        });
      }

      for (let i = 0; i < 5; i++) {
        this.inkMists.push({
          x: x + (Math.random() - 0.5) * 10,
          y: y + (Math.random() - 0.5) * 10,
          vx: (Math.random() - 0.5) * 8,
          vy: -6 - Math.random() * 10,
          radius: 7 + Math.random() * 10,
          maxRadius: 20 + Math.random() * 8,
          color: 'rgba(245, 240, 225,',
          alpha: 0.4,
          maxLife: 0.65,
          life: 0.65,
        });
      }
    }
  }

  // ─────────────────────────────────────────────
  // 勝利慶祝：大氣潑墨揮毫 + 硃砂落花飛雨
  // ─────────────────────────────────────────────
  /**
   * 勝利水墨大賞：潑墨重彩、宣紙浸潤擴散與飄落水墨硃砂
   * @param {number} cx  中心 X
   * @param {number} cy  中心 Y
   * @param {number} canvasW  畫布寬度
   */
  emitWin(cx, cy, canvasW = 620) {
    // 1. 三波蒼勁大氣的潑墨暈染
    const splashWaves = [
      { color: 'rgba(15, 20, 16, 0.75)',  rMax: 90,  dur: 1.2, delay: 0 },
      { color: 'rgba(180, 40, 30, 0.65)', rMax: 70,  dur: 1.0, delay: 0.2 }, // 硃砂紅
      { color: 'rgba(40, 52, 44, 0.5)',   rMax: 110, dur: 1.5, delay: 0.4 },
    ];

    splashWaves.forEach((wave) => {
      this._addInkBloom(
        cx + (Math.random() - 0.5) * 50,
        cy + (Math.random() - 0.5) * 50,
        15, wave.rMax, wave.color, wave.dur, wave.delay
      );
    });

    // 2. 潑墨四散的粗獷水墨珠滴
    for (let i = 0; i < 70; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 140;
      const isVermilion = Math.random() < 0.28; // 28% 幾率為硃砂印泥紅

      this.splashes.push({
        x: cx + (Math.random() - 0.5) * 30,
        y: cy + (Math.random() - 0.5) * 30,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 20,
        radius: 2 + Math.random() * 4.5,
        color: isVermilion ? '#b83226' : (Math.random() > 0.4 ? '#121614' : '#28332b'),
        alpha: 0.95,
        maxLife: 0.8 + Math.random() * 0.7,
        life: 0.8 + Math.random() * 0.7,
        friction: 0.94,
        gravity: 60,
      });
    }

    // 3. 漫天飄散的古風水墨花瓣與飛絮 (50 枚飄花)
    const petals = ['#1d2420', '#2d3830', '#c23b2b', '#8c2419', '#ded7bc', '#b3392b'];
    for (let i = 0; i < 50; i++) {
      this.floatingInk.push({
        x: Math.random() * canvasW,
        y: -20 - Math.random() * 120,
        vx: (Math.random() - 0.5) * 45,
        vy: 35 + Math.random() * 60,
        w: 5 + Math.random() * 7,
        h: 3 + Math.random() * 5,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 3.5,
        color: petals[Math.floor(Math.random() * petals.length)],
        alpha: 0.9,
        life: 2.0 + Math.random() * 1.5,
        maxLife: 3.5,
        swaySpeed: 1.5 + Math.random() * 2,
        swayRange: 15 + Math.random() * 20,
        spawnDelay: Math.random() * 0.6,
      });
    }
  }

  // ─────────────────────────────────────────────
  // 內部墨暈生成
  // ─────────────────────────────────────────────
  _addInkBloom(x, y, startR, maxR, color, duration, delay = 0) {
    this.inkBlooms.push({
      x,
      y,
      radius: startR,
      startR,
      maxR,
      color,
      duration,
      elapsed: 0,
      delay,
      // 隨機八邊形微調參數，營造毛筆墨汁在紙纖維不規則暈開的自然紋路
      points: Array.from({ length: 10 }, () => 0.82 + Math.random() * 0.36),
    });
  }

  // ─────────────────────────────────────────────
  // 逐幀邏輯更新
  // ─────────────────────────────────────────────
  update(dt) {
    // 1. 更新水墨暈染波
    for (let i = this.inkBlooms.length - 1; i >= 0; i--) {
      const b = this.inkBlooms[i];
      if (b.delay > 0) {
        b.delay -= dt;
        continue;
      }
      b.elapsed += dt;
      const progress = b.elapsed / b.duration;
      if (progress >= 1) {
        this.inkBlooms.splice(i, 1);
        continue;
      }
      // 墨暈擴散初期快、後期慢（滲入宣紙的自然物理擴散曲線）
      const ease = 1 - Math.pow(1 - progress, 2.4);
      b.radius = b.startR + (b.maxR - b.startR) * ease;
      b.alpha = (1 - progress) * 0.9;
    }

    // 2. 更新墨點飛濺
    for (let i = this.splashes.length - 1; i >= 0; i--) {
      const p = this.splashes[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.splashes.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= p.friction;
      p.vy *= p.friction;
      if (p.gravity) p.vy += p.gravity * dt;
      p.alpha = Math.max(0, p.life / p.maxLife);
    }

    // 3. 更新墨氣薄霧
    for (let i = this.inkMists.length - 1; i >= 0; i--) {
      const m = this.inkMists[i];
      m.life -= dt;
      if (m.life <= 0) {
        this.inkMists.splice(i, 1);
        continue;
      }
      m.x += m.vx * dt;
      m.y += m.vy * dt;
      const p = 1 - (m.life / m.maxLife);
      m.curRadius = m.radius + (m.maxRadius - m.radius) * p;
      m.alpha = (1 - p) * 0.35;
    }

    // 4. 更新飄落水墨與硃砂花絮
    for (let i = this.floatingInk.length - 1; i >= 0; i--) {
      const c = this.floatingInk[i];
      if (c.spawnDelay > 0) {
        c.spawnDelay -= dt;
        continue;
      }
      c.life -= dt;
      if (c.life <= 0) {
        this.floatingInk.splice(i, 1);
        continue;
      }
      c.y += c.vy * dt;
      c.x += Math.sin(c.life * c.swaySpeed) * c.swayRange * dt + c.vx * dt;
      c.angle += c.spin * dt;
      c.alpha = Math.min(1, (c.life / c.maxLife) * 1.4);
    }
  }

  // ─────────────────────────────────────────────
  // 逐幀畫面渲染
  // ─────────────────────────────────────────────
  render(ctx) {
    if (
      this.inkBlooms.length === 0 &&
      this.splashes.length === 0 &&
      this.inkMists.length === 0 &&
      this.floatingInk.length === 0
    ) {
      return;
    }

    ctx.save();

    // 1. 繪製水墨暈染波（墨汁在宣紙滲透的不規則自然邊緣）
    for (const b of this.inkBlooms) {
      if (b.delay > 0) continue;
      ctx.save();
      ctx.globalAlpha = Math.max(0, b.alpha);
      ctx.fillStyle = b.color;
      ctx.beginPath();
      const numPts = b.points.length;
      for (let i = 0; i < numPts; i++) {
        const theta = (Math.PI * 2 * i) / numPts;
        const r = b.radius * b.points[i];
        const px = b.x + Math.cos(theta) * r;
        const py = b.y + Math.sin(theta) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // 2. 繪製墨氣升騰（柔和半透明水墨雲氣）
    for (const m of this.inkMists) {
      ctx.save();
      const rad = m.curRadius || m.radius;
      const grad = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, rad);
      grad.addColorStop(0, `${m.color}${m.alpha})`);
      grad.addColorStop(1, `${m.color}0)`);
      ctx.beginPath();
      ctx.arc(m.x, m.y, rad, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();
    }

    // 3. 繪製墨點飛濺（毛筆點墨圓潤水墨滴）
    for (const p of this.splashes) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 4. 繪製飄逸水墨飛絮與硃砂墨花（宛如墨染落櫻）
    for (const c of this.floatingInk) {
      if (c.spawnDelay > 0) continue;
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.angle);
      ctx.globalAlpha = Math.max(0, c.alpha);
      ctx.fillStyle = c.color;
      // 橢圓墨瓣
      ctx.beginPath();
      ctx.ellipse(0, 0, c.w, c.h, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }
}
