/**
 * js/systems/ParticleSystem.js
 * 粒子系統：落子衝擊波、獲勝煙火慶典、彩帶飄落、多波爆炸
 */

export class ParticleSystem {
  constructor() {
    this.particles = [];   // 一般粒子（火花、彩帶）
    this.rings    = [];    // 衝擊圓環
    this.confetti = [];    // 彩帶飄落
  }

  /** 重設並清空所有特效 */
  clear() {
    this.particles = [];
    this.rings     = [];
    this.confetti  = [];
  }

  // ─────────────────────────────────────────────
  // 落子反饋
  // ─────────────────────────────────────────────
  /**
   * 落子衝擊波 + 火花
   * @param {number} x  畫布像素 X
   * @param {number} y  畫布像素 Y
   * @param {boolean} isPlayer  是否為玩家黑棋
   */
  emitPlacement(x, y, isPlayer) {
    const ringColor  = isPlayer ? '#5a7a60' : '#d0c89a';
    const sparkColor = isPlayer ? ['#88cc88', '#5aff5a', '#ffffff'] : ['#ffe878', '#ffcc00', '#ffffff'];

    // 主衝擊環
    this._addRing(x, y, 5, 28, ringColor, 0.85, 0.3);
    // 外擴大環
    this._addRing(x, y, 8, 42, ringColor, 0.45, 0.5);

    // 火花粒子 (較多，速度更快)
    const count = 20;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 55 + Math.random() * 90;
      const colors = sparkColor;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 1.8 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1.0,
        maxLife: 0.4 + Math.random() * 0.25,
        life:    0.4 + Math.random() * 0.25,
        trail: true,
      });
    }

    // 4 個稍大光點（強調感）
    for (let i = 0; i < 4; i++) {
      const angle = (Math.PI * 2 * i) / 4 + Math.PI / 8;
      const speed = 30 + Math.random() * 40;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 4 + Math.random() * 2,
        color: sparkColor[0],
        alpha: 1.0,
        maxLife: 0.55,
        life:    0.55,
        trail: false,
      });
    }
  }

  // ─────────────────────────────────────────────
  // 勝利慶祝
  // ─────────────────────────────────────────────
  /**
   * 多波煙火爆炸 + 彩帶飄落
   * @param {number} cx  中心 X
   * @param {number} cy  中心 Y
   * @param {number} canvasW  畫布寬度（彩帶隨機 X 用）
   */
  emitWin(cx, cy, canvasW = 620) {
    const WAVE_COLORS = [
      ['#ffd700', '#ffec8b', '#e9d99d', '#ffffff'],  // 金
      ['#76e27b', '#aaffaa', '#c8ffc8', '#ffffff'],  // 綠
      ['#ff6b6b', '#ffaaaa', '#ffdddd', '#ffffff'],  // 紅
    ];

    // 3 波爆炸，間隔 offset
    for (let wave = 0; wave < 3; wave++) {
      const colors = WAVE_COLORS[wave];
      const count  = 45;
      const delay  = wave * 0.18; // 用 spawnDelay 欄位讓後兩波稍晚出現

      // 主爆炸中心有點偏移
      const ex = cx + (Math.random() - 0.5) * 80;
      const ey = cy + (Math.random() - 0.5) * 80;

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 70 + Math.random() * 160;
        const life  = 0.9 + Math.random() * 0.6;

        this.particles.push({
          x: ex, y: ey,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 30, // 輕微上拋
          size: 2.5 + Math.random() * 3.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1.0,
          maxLife: life,
          life,
          spawnDelay: delay,
          gravity: 120,
          trail: false,
        });
      }

      // 大環衝擊波
      this._addRing(ex, ey, 10, 55, WAVE_COLORS[wave][0], 0.7, 0.5 + wave * 0.05);
    }

    // 彩帶飄落 (40 條)
    const confettiColors = ['#ffd700', '#ff6b6b', '#76e27b', '#66ccff', '#ff88ff', '#ffbb44'];
    for (let i = 0; i < 40; i++) {
      this.confetti.push({
        x: Math.random() * canvasW,
        y: -10 - Math.random() * 80,
        vx: (Math.random() - 0.5) * 60,
        vy: 80 + Math.random() * 100,
        w: 6 + Math.random() * 6,
        h: 3 + Math.random() * 3,
        angle: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 6,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        alpha: 1.0,
        life:  1.4 + Math.random() * 0.8,
        maxLife: 2.2,
        spawnDelay: Math.random() * 0.4,
      });
    }
  }

  // ─────────────────────────────────────────────
  // 內部工具
  // ─────────────────────────────────────────────
  _addRing(x, y, minR, maxR, color, alpha, duration) {
    this.rings.push({ x, y, radius: minR, maxRadius: maxR, minRadius: minR, color, alpha, duration, elapsed: 0 });
  }

  // ─────────────────────────────────────────────
  // 更新
  // ─────────────────────────────────────────────
  update(dt) {
    // 圓環
    for (let i = this.rings.length - 1; i >= 0; i--) {
      const r = this.rings[i];
      r.elapsed += dt;
      const p = r.elapsed / r.duration;
      if (p >= 1) { this.rings.splice(i, 1); continue; }
      r.radius = r.minRadius + (r.maxRadius - r.minRadius) * p;
      r.alpha  = (1 - p) * 0.9;
    }

    // 粒子
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      // 延遲生成
      if (p.spawnDelay > 0) { p.spawnDelay -= dt; continue; }

      p.life -= dt;
      if (p.life <= 0) { this.particles.splice(i, 1); continue; }

      p.x  += p.vx * dt;
      p.y  += p.vy * dt;
      p.vx *= 0.93;
      p.vy *= 0.93;
      if (p.gravity) p.vy += p.gravity * dt;
      p.alpha = Math.max(0, p.life / p.maxLife);
    }

    // 彩帶
    for (let i = this.confetti.length - 1; i >= 0; i--) {
      const c = this.confetti[i];
      if (c.spawnDelay > 0) { c.spawnDelay -= dt; continue; }
      c.life -= dt;
      if (c.life <= 0) { this.confetti.splice(i, 1); continue; }
      c.x     += c.vx * dt;
      c.y     += c.vy * dt;
      c.angle += c.spin * dt;
      c.vy    *= 0.995;
      c.alpha  = Math.max(0, c.life / c.maxLife);
    }
  }

  // ─────────────────────────────────────────────
  // 渲染
  // ─────────────────────────────────────────────
  render(ctx) {
    if (this.rings.length === 0 && this.particles.length === 0 && this.confetti.length === 0) return;

    ctx.save();

    // 圓環
    for (const r of this.rings) {
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.strokeStyle = r.color;
      ctx.globalAlpha = Math.max(0, r.alpha);
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    // 粒子（使用 screen 混合讓顏色更亮）
    ctx.globalCompositeOperation = 'lighter';
    for (const p of this.particles) {
      if (p.spawnDelay > 0) continue;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.alpha) * 0.85;
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';

    // 彩帶
    for (const c of this.confetti) {
      if (c.spawnDelay > 0) continue;
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.angle);
      ctx.globalAlpha = Math.max(0, c.alpha);
      ctx.fillStyle = c.color;
      ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
      ctx.restore();
    }

    ctx.restore();
  }
}
