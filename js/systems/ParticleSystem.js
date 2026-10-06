/**
 * js/systems/ParticleSystem.js
 * 清爽水墨風粒子系統：
 * 告別模糊厚重煙霧，採用靈動俐落的水墨筆意漣漪、飛濺墨珠與瀟灑的揮毫迴旋筆觸
 */

export class ParticleSystem {
  constructor() {
    this.ripples    = []; // 靈動水墨漣漪線圈（通透細線，絕不糊成一坨霧）
    this.droplets   = []; // 清脆乾淨的小墨珠（微粒飛濺）
    this.brushArcs  = []; // 勝利時的書法揮毫水墨弧光（筆走龍蛇）
    this.petals     = []; // 勝利飄落的硃砂梅花瓣
  }

  /** 重設並清空所有特效 */
  clear() {
    this.ripples   = [];
    this.droplets  = [];
    this.brushArcs = [];
    this.petals    = [];
  }

  // ─────────────────────────────────────────────
  // 落子反饋：清爽水墨漣漪 + 靈動小墨珠
  // ─────────────────────────────────────────────
  /**
   * 落子水墨反饋（乾淨、俐落、不髒棋盤）
   * @param {number} x  畫布像素 X
   * @param {number} y  畫布像素 Y
   * @param {boolean} isPlayer  是否為玩家黑棋
   */
  emitPlacement(x, y, isPlayer) {
    if (isPlayer) {
      // 玩家黑棋：深墨與青黛漣漪
      // 內圈細緻水墨環（迅速擴散）
      this._addRipple(x, y, 6, 24, 'rgba(20, 26, 22,', 2.0, 0.28);
      // 外圈飄逸微波環（稍慢淡出）
      this._addRipple(x, y, 10, 36, 'rgba(40, 52, 44,', 1.2, 0.42);

      // 精巧的小墨珠（6~8 顆，小半徑，不糊在一起）
      const count = 7;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
        const speed = 35 + Math.random() * 45;
        this.droplets.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 1.2 + Math.random() * 1.5,
          color: '#1a221d',
          alpha: 0.9,
          maxLife: 0.35,
          life: 0.35,
          friction: 0.91,
        });
      }
    } else {
      // 電腦白棋：淡雅白玉微瀾
      this._addRipple(x, y, 6, 24, 'rgba(245, 240, 225,', 2.0, 0.28);
      this._addRipple(x, y, 10, 36, 'rgba(215, 205, 180,', 1.2, 0.42);

      const count = 6;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
        const speed = 30 + Math.random() * 40;
        this.droplets.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 1.2 + Math.random() * 1.4,
          color: '#f0ebd8',
          alpha: 0.9,
          maxLife: 0.35,
          life: 0.35,
          friction: 0.91,
        });
      }
    }
  }

  // ─────────────────────────────────────────────
  // 勝利慶祝：書法揮毫弧光 + 硃砂落英
  // ─────────────────────────────────────────────
  /**
   * 勝利水墨筆意：瀟灑水墨書法行筆弧線 + 清麗硃砂小花瓣
   * @param {number} cx  中心 X
   * @param {number} cy  中心 Y
   * @param {number} canvasW  畫布寬度
   */
  emitWin(cx, cy, canvasW = 620) {
    // 1. 書法揮毫弧線（如狂草行筆，乾淨大氣）
    for (let i = 0; i < 6; i++) {
      const startAngle = Math.random() * Math.PI * 2;
      const sweep = (Math.PI * 0.6) + Math.random() * Math.PI * 0.6;
      const isVermilion = i % 2 === 1; // 硃砂與墨色交織
      this.brushArcs.push({
        x: cx + (Math.random() - 0.5) * 40,
        y: cy + (Math.random() - 0.5) * 40,
        radius: 20 + Math.random() * 15,
        maxRadius: 65 + Math.random() * 40,
        startAngle,
        endAngle: startAngle + sweep,
        color: isVermilion ? 'rgba(195, 45, 30,' : 'rgba(22, 28, 24,',
        lineWidth: 2.5 + Math.random() * 2,
        duration: 0.7 + Math.random() * 0.4,
        elapsed: 0,
        delay: i * 0.1,
      });
    }

    // 2. 核心大水墨漣漪
    this._addRipple(cx, cy, 10, 85, 'rgba(25, 32, 28,', 2.5, 0.85);
    this._addRipple(cx, cy, 15, 60, 'rgba(195, 45, 30,', 2.0, 0.7, 0.15);

    // 3. 少許精緻小墨珠濺開
    for (let i = 0; i < 24; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 90;
      const isRed = Math.random() < 0.35;
      this.droplets.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 1.5 + Math.random() * 2,
        color: isRed ? '#ba2d20' : '#1a221d',
        alpha: 0.95,
        maxLife: 0.6 + Math.random() * 0.4,
        life: 0.6 + Math.random() * 0.4,
        friction: 0.93,
        gravity: 40,
      });
    }

    // 4. 清雅舒緩飄落的硃砂小梅瓣（優雅不擁擠）
    const petalColors = ['#c23b2b', '#d34535', '#a8261a', '#e8dfc8'];
    for (let i = 0; i < 28; i++) {
      this.petals.push({
        x: Math.random() * canvasW,
        y: -15 - Math.random() * 80,
        vx: (Math.random() - 0.5) * 35,
        vy: 30 + Math.random() * 45,
        w: 4 + Math.random() * 4,
        h: 2.5 + Math.random() * 2.5,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 3,
        color: petalColors[Math.floor(Math.random() * petalColors.length)],
        alpha: 0.9,
        life: 2.2 + Math.random() * 1.2,
        maxLife: 3.4,
        swaySpeed: 1.5 + Math.random() * 1.5,
        swayRange: 12 + Math.random() * 16,
        delay: Math.random() * 0.4,
      });
    }
  }

  // ─────────────────────────────────────────────
  // 內部輔助：水墨漣漪生成（只用 stroke 畫清爽細線，不填滿色塊）
  // ─────────────────────────────────────────────
  _addRipple(x, y, startR, maxR, colorPrefix, lineWidth, duration, delay = 0) {
    this.ripples.push({
      x,
      y,
      radius: startR,
      startR,
      maxR,
      colorPrefix,
      lineWidth,
      duration,
      elapsed: 0,
      delay,
    });
  }

  // ─────────────────────────────────────────────
  // 逐幀邏輯更新
  // ─────────────────────────────────────────────
  update(dt) {
    // 1. 水墨漣漪更新
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const r = this.ripples[i];
      if (r.delay > 0) {
        r.delay -= dt;
        continue;
      }
      r.elapsed += dt;
      const progress = r.elapsed / r.duration;
      if (progress >= 1) {
        this.ripples.splice(i, 1);
        continue;
      }
      // 緩出曲線：初期漣漪擴散清晰，後期自然隱沒
      const ease = 1 - Math.pow(1 - progress, 2);
      r.radius = r.startR + (r.maxR - r.startR) * ease;
      r.alpha  = (1 - progress) * 0.85;
    }

    // 2. 書法揮毫弧線更新
    for (let i = this.brushArcs.length - 1; i >= 0; i--) {
      const a = this.brushArcs[i];
      if (a.delay > 0) {
        a.delay -= dt;
        continue;
      }
      a.elapsed += dt;
      const progress = a.elapsed / a.duration;
      if (progress >= 1) {
        this.brushArcs.splice(i, 1);
        continue;
      }
      const ease = 1 - Math.pow(1 - progress, 2);
      a.curRadius = a.radius + (a.maxRadius - a.radius) * ease;
      a.alpha = (1 - progress) * 0.85;
    }

    // 3. 墨珠更新
    for (let i = this.droplets.length - 1; i >= 0; i--) {
      const d = this.droplets[i];
      d.life -= dt;
      if (d.life <= 0) {
        this.droplets.splice(i, 1);
        continue;
      }
      d.x  += d.vx * dt;
      d.y  += d.vy * dt;
      d.vx *= d.friction;
      d.vy *= d.friction;
      if (d.gravity) d.vy += d.gravity * dt;
      d.alpha = Math.max(0, d.life / d.maxLife);
    }

    // 4. 硃砂小花瓣更新
    for (let i = this.petals.length - 1; i >= 0; i--) {
      const p = this.petals[i];
      if (p.delay > 0) {
        p.delay -= dt;
        continue;
      }
      p.life -= dt;
      if (p.life <= 0) {
        this.petals.splice(i, 1);
        continue;
      }
      p.y += p.vy * dt;
      p.x += Math.sin(p.life * p.swaySpeed) * p.swayRange * dt + p.vx * dt;
      p.angle += p.spin * dt;
      p.alpha = Math.min(1, (p.life / p.maxLife) * 1.5);
    }
  }

  // ─────────────────────────────────────────────
  // 逐幀畫面渲染
  // ─────────────────────────────────────────────
  render(ctx) {
    if (
      this.ripples.length === 0 &&
      this.brushArcs.length === 0 &&
      this.droplets.length === 0 &&
      this.petals.length === 0
    ) {
      return;
    }

    ctx.save();

    // 1. 繪製清爽的水墨漣漪線圈（用 stroke 勾勒，通透明朗）
    for (const r of this.ripples) {
      if (r.delay > 0) continue;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `${r.colorPrefix} ${Math.max(0, r.alpha)})`;
      ctx.lineWidth = r.lineWidth;
      ctx.stroke();
    }

    // 2. 繪製書法行筆弧線（蒼勁有力，飛筆出鋒）
    for (const a of this.brushArcs) {
      if (a.delay > 0) continue;
      ctx.beginPath();
      ctx.arc(a.x, a.y, a.curRadius, a.startAngle, a.endAngle);
      ctx.strokeStyle = `${a.color} ${Math.max(0, a.alpha)})`;
      ctx.lineWidth = a.lineWidth;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    // 3. 繪製精巧的小墨珠（圓潤分明）
    for (const d of this.droplets) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, d.alpha);
      ctx.fillStyle = d.color;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 4. 繪製優雅硃砂花瓣
    for (const p of this.petals) {
      if (p.delay > 0) continue;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.w, p.h, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }
}
