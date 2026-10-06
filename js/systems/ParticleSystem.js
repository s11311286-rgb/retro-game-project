/**
 * js/systems/ParticleSystem.js
 * 水墨風粒子系統：
 * 1. 墨滴入水漣漪特效（Ink Splash/Bleeding）
 * 2. 沉穩力量感的水墨拉絲炸裂（Ink Splatter Tendrils/Streaks）
 * 3. 勝利狂草揮毫與硃砂梅瓣
 */

export class ParticleSystem {
  constructor() {
    this.ripples    = []; // 墨水滴入水中擴散的雙重/三重水波漣漪
    this.tendrils   = []; // 水墨拉絲炸裂感（放射狀書法墨筋）
    this.droplets   = []; // 清脆靈動的飛濺墨珠
    this.brushArcs  = []; // 勝利時的書法揮毫水墨弧光
    this.petals     = []; // 勝利飄落的硃砂梅花瓣
  }

  /** 重設並清空所有特效 */
  clear() {
    this.ripples   = [];
    this.tendrils  = [];
    this.droplets  = [];
    this.brushArcs = [];
    this.petals    = [];
  }

  // ─────────────────────────────────────────────
  // 落子反饋：墨滴入水漣漪 + 水墨拉絲炸裂感
  // ─────────────────────────────────────────────
  /**
   * 落子反饋（水墨入水擴散 + 沉穩有力量感的墨筋拉絲）
   * @param {number} x  畫布像素 X
   * @param {number} y  畫布像素 Y
   * @param {boolean} isPlayer  是否為玩家黑棋
   */
  emitPlacement(x, y, isPlayer) {
    const isBlack = isPlayer;
    const colorPrefix = isBlack ? 'rgba(18, 25, 20,' : 'rgba(240, 235, 218,';
    const accentColor = isBlack ? '#141c17' : '#f5f0dc';

    // 1. 【墨滴入水向外擴散漣漪】：三重水波自然擴散
    this._addRipple(x, y, 4, 22, colorPrefix, 2.2, 0.28, 0);
    this._addRipple(x, y, 8, 36, colorPrefix, 1.6, 0.42, 0.05);
    this._addRipple(x, y, 12, 50, colorPrefix, 1.0, 0.58, 0.12);

    // 2. 【水墨拉絲炸裂感（Ink Tendril Streaks）】：
    // 毛筆落盤瞬間向四周迸發的遒勁墨筋（7~9 條放射狀水墨絲線）
    const tendrilCount = 8;
    for (let i = 0; i < tendrilCount; i++) {
      const baseAngle = (Math.PI * 2 * i) / tendrilCount + (Math.random() - 0.5) * 0.45;
      const targetLength = 18 + Math.random() * 20; // 拉絲長度 18~38px
      const curve = (Math.random() - 0.5) * 0.25;   // 書法行筆微弧度

      this.tendrils.push({
        x, y,
        angle: baseAngle,
        curve,
        length: 2,
        maxLength: targetLength,
        color: accentColor,
        alpha: 0.95,
        lineWidth: 1.8 + Math.random() * 1.0,
        maxLife: 0.32 + Math.random() * 0.12,
        life: 0.32 + Math.random() * 0.12,
      });
    }

    // 3. 【末端飛白墨珠】：墨絲末端甩出的幾點精細墨滴
    for (let i = 0; i < 6; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 55;
      this.droplets.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 1.2 + Math.random() * 1.5,
        color: accentColor,
        alpha: 0.9,
        maxLife: 0.35,
        life: 0.35,
        friction: 0.90,
      });
    }
  }

  // ─────────────────────────────────────────────
  // 勝利慶祝：書法揮毫弧光 + 硃砂落英
  // ─────────────────────────────────────────────
  emitWin(cx, cy, canvasW = 620) {
    // 1. 書法揮毫弧線
    for (let i = 0; i < 7; i++) {
      const startAngle = Math.random() * Math.PI * 2;
      const sweep = (Math.PI * 0.6) + Math.random() * Math.PI * 0.7;
      const isVermilion = i % 2 === 1;
      this.brushArcs.push({
        x: cx + (Math.random() - 0.5) * 45,
        y: cy + (Math.random() - 0.5) * 45,
        radius: 20 + Math.random() * 15,
        maxRadius: 70 + Math.random() * 45,
        startAngle,
        endAngle: startAngle + sweep,
        color: isVermilion ? 'rgba(195, 45, 30,' : 'rgba(20, 26, 22,',
        lineWidth: 2.8 + Math.random() * 2,
        duration: 0.75 + Math.random() * 0.4,
        elapsed: 0,
        delay: i * 0.08,
      });
    }

    // 2. 勝利大水墨入水重環
    this._addRipple(cx, cy, 12, 95, 'rgba(22, 28, 24,', 2.8, 0.9);
    this._addRipple(cx, cy, 18, 70, 'rgba(195, 45, 30,', 2.2, 0.75, 0.15);

    // 3. 勝利墨點爆發
    for (let i = 0; i < 28; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 45 + Math.random() * 100;
      const isRed = Math.random() < 0.35;
      this.droplets.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 1.5 + Math.random() * 2.2,
        color: isRed ? '#ba2d20' : '#18201b',
        alpha: 0.95,
        maxLife: 0.65 + Math.random() * 0.45,
        life: 0.65 + Math.random() * 0.45,
        friction: 0.92,
        gravity: 45,
      });
    }

    // 4. 硃砂小花瓣
    const petalColors = ['#c23b2b', '#d34535', '#a8261a', '#e8dfc8'];
    for (let i = 0; i < 30; i++) {
      this.petals.push({
        x: Math.random() * canvasW,
        y: -15 - Math.random() * 90,
        vx: (Math.random() - 0.5) * 35,
        vy: 30 + Math.random() * 45,
        w: 4 + Math.random() * 4,
        h: 2.5 + Math.random() * 2.5,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 3,
        color: petalColors[Math.floor(Math.random() * petalColors.length)],
        alpha: 0.9,
        life: 2.4 + Math.random() * 1.2,
        maxLife: 3.6,
        swaySpeed: 1.5 + Math.random() * 1.5,
        swayRange: 12 + Math.random() * 16,
        delay: Math.random() * 0.4,
      });
    }
  }

  // ─────────────────────────────────────────────
  // 內部輔助：水墨漣漪
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
    // 1. 墨水入水漣漪擴散
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
      // 緩出物理擴散曲線
      const ease = 1 - Math.pow(1 - progress, 2.2);
      r.radius = r.startR + (r.maxR - r.startR) * ease;
      r.alpha  = (1 - progress) * 0.9;
    }

    // 2. 水墨拉絲炸裂（墨筋迅速延伸並隱入宣紙）
    for (let i = this.tendrils.length - 1; i >= 0; i--) {
      const t = this.tendrils[i];
      t.life -= dt;
      if (t.life <= 0) {
        this.tendrils.splice(i, 1);
        continue;
      }
      const progress = 1 - (t.life / t.maxLife);
      // 墨筋迅速向外破紙延伸（先快後停）
      const extend = Math.min(1, progress * 2.5);
      t.length = t.maxLength * (1 - Math.pow(1 - extend, 3));
      t.alpha = Math.max(0, t.life / t.maxLife);
    }

    // 3. 書法揮毫弧線
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

    // 4. 墨珠
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

    // 5. 花瓣
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
      this.tendrils.length === 0 &&
      this.brushArcs.length === 0 &&
      this.droplets.length === 0 &&
      this.petals.length === 0
    ) {
      return;
    }

    ctx.save();

    // 1. 繪製墨滴入水漣漪線圈
    for (const r of this.ripples) {
      if (r.delay > 0) continue;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `${r.colorPrefix} ${Math.max(0, r.alpha)})`;
      ctx.lineWidth = r.lineWidth;
      ctx.stroke();
    }

    // 2. 繪製水墨拉絲炸裂墨筋（放射狀遒勁毛筆墨痕）
    for (const t of this.tendrils) {
      ctx.save();
      ctx.translate(t.x, t.y);
      ctx.rotate(t.angle);

      // 書法墨絲線條（兩頭稍尖，帶微彎弧度）
      const ctrlY = t.length * t.curve;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(t.length * 0.5, ctrlY, t.length, 0);
      ctx.strokeStyle = t.color;
      ctx.lineWidth = t.lineWidth;
      ctx.lineCap = 'round';
      ctx.globalAlpha = Math.max(0, t.alpha);
      ctx.stroke();

      // 拉絲末梢微小甩墨小珠
      ctx.beginPath();
      ctx.arc(t.length + 1.2, 0, t.lineWidth * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = t.color;
      ctx.fill();

      ctx.restore();
    }

    // 3. 繪製書法行筆弧線
    for (const a of this.brushArcs) {
      if (a.delay > 0) continue;
      ctx.beginPath();
      ctx.arc(a.x, a.y, a.curRadius, a.startAngle, a.endAngle);
      ctx.strokeStyle = `${a.color} ${Math.max(0, a.alpha)})`;
      ctx.lineWidth = a.lineWidth;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    // 4. 繪製精巧的小墨珠
    for (const d of this.droplets) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, d.alpha);
      ctx.fillStyle = d.color;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 5. 繪製優雅硃砂花瓣
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
