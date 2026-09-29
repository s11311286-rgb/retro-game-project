/**
 * js/systems/ParticleSystem.js
 * 粒子系統：提供落子衝擊波反饋與獲勝慶祝特效
 */

export class ParticleSystem {
  constructor() {
    this.particles = [];
    this.rings = [];
  }

  /**
   * 重設並清空所有特效粒子
   */
  clear() {
    this.particles = [];
    this.rings = [];
  }

  /**
   * 觸發落子反饋效果
   * @param {number} x - 畫布像素 X
   * @param {number} y - 畫布像素 Y
   * @param {boolean} isPlayer - 是否為玩家黑棋
   */
  emitPlacement(x, y, isPlayer) {
    const ringColor = isPlayer ? '#303b34' : '#ded8c1';
    const sparkColor = isPlayer ? '#1b2822' : '#ffffff';

    // 擴散圓環
    this.rings.push({
      x,
      y,
      radius: 6,
      maxRadius: 26,
      color: ringColor,
      alpha: 0.9,
      duration: 0.35,
      elapsed: 0,
    });

    // 四散微粒
    const particleCount = 10;
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.4;
      const speed = 40 + Math.random() * 60;

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 2.5,
        color: sparkColor,
        alpha: 1.0,
        maxLife: 0.4 + Math.random() * 0.2,
        life: 0.4 + Math.random() * 0.2,
      });
    }
  }

  /**
   * 觸發勝利慶祝光點噴發
   * @param {number} x - 畫布像素 X
   * @param {number} y - 畫布像素 Y
   */
  emitWin(x, y) {
    const winColors = ['#ffd700', '#ffec8b', '#e9d99d', '#ffffff', '#76e27b'];
    const count = 40;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 140;

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2.5 + Math.random() * 3,
        color: winColors[Math.floor(Math.random() * winColors.length)],
        alpha: 1.0,
        maxLife: 0.8 + Math.random() * 0.5,
        life: 0.8 + Math.random() * 0.5,
      });
    }
  }

  /**
   * 更新所有粒子狀態
   * @param {number} dt - 幀間隔秒數
   */
  update(dt) {
    // 1. 更新圓環
    for (let i = this.rings.length - 1; i >= 0; i--) {
      const r = this.rings[i];
      r.elapsed += dt;
      const progress = r.elapsed / r.duration;

      if (progress >= 1) {
        this.rings.splice(i, 1);
      } else {
        r.radius = 6 + (r.maxRadius - 6) * progress;
        r.alpha = 0.9 * (1 - progress);
      }
    }

    // 2. 更新微粒
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      } else {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.94; // 阻尼阻力
        p.vy *= 0.94;
        p.alpha = Math.max(0, p.life / p.maxLife);
      }
    }
  }

  /**
   * 繪製所有粒子
   * @param {CanvasRenderingContext2D} ctx
   */
  render(ctx) {
    if (this.rings.length === 0 && this.particles.length === 0) return;

    ctx.save();

    // 繪製圓環
    for (const r of this.rings) {
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.strokeStyle = r.color;
      ctx.globalAlpha = Math.max(0, r.alpha);
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // 繪製微粒
    for (const p of this.particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fill();
    }

    ctx.restore();
  }
}
