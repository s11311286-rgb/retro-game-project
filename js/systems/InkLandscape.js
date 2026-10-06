/**
 * js/systems/InkLandscape.js
 * 動態水墨山水意境系統：
 * 遠山煙嵐、流淌江水、風吹修竹搖曳、白鷺歸雁展翅翱翔，營造高雅靜謐的禪意對弈長卷
 */

export class InkLandscape {
  constructor(width = 620, height = 620) {
    this.width = width;
    this.height = height;
    this.time = 0;

    // 飛鳥系統（白鷺歸雁）
    this.birds = [];
    this.birdTimer = 2.0; // 啟動不久便掠過第一隻

    // 竹林節點（左下角與右側邊陲的淡墨修竹葉）
    this.bamboos = this._initBamboos();
  }

  /**
   * 初始化邊角墨竹枝葉結構
   */
  _initBamboos() {
    return [
      // 左下角竹枝 (x, y, 枝幹長度, 基礎角度, 葉子數量)
      { baseX: 10, baseY: this.height - 10, length: 110, angle: -Math.PI * 0.38, leaves: 6, swaySpeed: 1.4 },
      { baseX: 25, baseY: this.height - 5,  length: 90,  angle: -Math.PI * 0.28, leaves: 5, swaySpeed: 1.8 },
      // 右上角竹梢
      { baseX: this.width - 15, baseY: 15, length: 95, angle: Math.PI * 0.65, leaves: 6, swaySpeed: 1.6 },
    ];
  }

  /**
   * 生成一隻優雅橫掠遠山的淡墨飛鳥
   */
  _spawnBird() {
    const fromLeft = Math.random() > 0.3;
    const startY = 60 + Math.random() * 180;
    this.birds.push({
      x: fromLeft ? -25 : this.width + 25,
      y: startY,
      vx: fromLeft ? 28 + Math.random() * 20 : -(28 + Math.random() * 20),
      vy: (Math.random() - 0.5) * 6,
      scale: 0.65 + Math.random() * 0.45,
      wingCycle: Math.random() * Math.PI * 2,
      wingSpeed: 4.5 + Math.random() * 2,
      alpha: 0.45 + Math.random() * 0.3,
    });
  }

  /**
   * 更新動態山水狀態
   * @param {number} dt 幀間隔秒
   */
  update(dt) {
    this.time += dt;

    // 飛鳥定時生成與飛行
    this.birdTimer -= dt;
    if (this.birdTimer <= 0) {
      if (this.birds.length < 3) {
        this._spawnBird();
      }
      this.birdTimer = 6.0 + Math.random() * 7.0; // 每 6~13 秒飛出一隻
    }

    for (let i = this.birds.length - 1; i >= 0; i--) {
      const b = this.birds[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.wingCycle += b.wingSpeed * dt;

      // 飛出畫布則移除
      if (b.vx > 0 && b.x > this.width + 40) {
        this.birds.splice(i, 1);
      } else if (b.vx < 0 && b.x < -40) {
        this.birds.splice(i, 1);
      }
    }
  }

  /**
   * 渲染水墨山水背景長卷
   * @param {CanvasRenderingContext2D} ctx
   */
  render(ctx) {
    ctx.save();

    // 1. 溫潤宣紙古絹底色
    ctx.fillStyle = '#b79f6e';
    ctx.fillRect(0, 0, this.width, this.height);

    // 宣紙纖維暗紋微弱漸變
    const silkGrad = ctx.createLinearGradient(0, 0, this.width, this.height);
    silkGrad.addColorStop(0, 'rgba(235, 222, 185, 0.28)');
    silkGrad.addColorStop(0.5, 'rgba(180, 155, 105, 0.12)');
    silkGrad.addColorStop(1, 'rgba(145, 120, 75, 0.24)');
    ctx.fillStyle = silkGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // 2. 遠山煙嵐（三層遠山剪影，微波浮動）
    this._renderInkMountains(ctx);

    // 3. 流淌江水（若隱若現的水墨水波）
    this._renderInkRiver(ctx);

    // 4. 白鷺歸雁（展翅飛鳥）
    this._renderBirds(ctx);

    // 5. 邊角墨竹（隨微風輕拂）
    this._renderBamboos(ctx);

    ctx.restore();
  }

  /**
   * 繪製三層遠山煙嵐
   */
  _renderInkMountains(ctx) {
    const t = this.time * 0.25;

    // 遠黛（最遠層，淡如青煙）
    ctx.fillStyle = 'rgba(78, 68, 50, 0.18)';
    ctx.beginPath();
    ctx.moveTo(0, this.height * 0.42);
    for (let x = 0; x <= this.width; x += 30) {
      const y = this.height * 0.32 +
        Math.sin(x * 0.007 + 1.2) * 35 +
        Math.cos(x * 0.015 + t * 0.3) * 15;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(this.width, this.height);
    ctx.lineTo(0, this.height);
    ctx.closePath();
    ctx.fill();

    // 中景山巒（水墨層巒）
    ctx.fillStyle = 'rgba(56, 48, 35, 0.22)';
    ctx.beginPath();
    ctx.moveTo(0, this.height * 0.55);
    for (let x = 0; x <= this.width; x += 25) {
      const y = this.height * 0.46 +
        Math.sin(x * 0.011 + 3.4) * 45 +
        Math.sin(x * 0.005 - t * 0.4) * 18;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(this.width, this.height);
    ctx.lineTo(0, this.height);
    ctx.closePath();
    ctx.fill();

    // 近石山嵐（墨痕深穩）
    ctx.fillStyle = 'rgba(42, 35, 25, 0.20)';
    ctx.beginPath();
    ctx.moveTo(0, this.height * 0.72);
    for (let x = 0; x <= this.width; x += 35) {
      const y = this.height * 0.62 +
        Math.sin(x * 0.014 + 0.5) * 30 +
        Math.cos(x * 0.008 + t * 0.2) * 12;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(this.width, this.height);
    ctx.lineTo(0, this.height);
    ctx.closePath();
    ctx.fill();
  }

  /**
   * 繪製流淌水墨水紋
   */
  _renderInkRiver(ctx) {
    const t = this.time * 0.8;
    ctx.save();
    ctx.strokeStyle = 'rgba(65, 54, 38, 0.12)';
    ctx.lineWidth = 1.2;

    const riverLines = [
      { y: this.height * 0.78, speed: 1.0, freq: 0.025, amp: 4 },
      { y: this.height * 0.84, speed: 1.2, freq: 0.032, amp: 5 },
      { y: this.height * 0.90, speed: 0.9, freq: 0.020, amp: 3.5 },
      { y: this.height * 0.95, speed: 1.1, freq: 0.028, amp: 4 },
    ];

    for (const line of riverLines) {
      ctx.beginPath();
      for (let x = 0; x <= this.width; x += 15) {
        const py = line.y + Math.sin(x * line.freq + t * line.speed) * line.amp;
        if (x === 0) ctx.moveTo(x, py);
        else ctx.lineTo(x, py);
      }
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * 繪製展翅白鷺/飛鳥（書法一筆畫鳥形）
   */
  _renderBirds(ctx) {
    ctx.save();
    for (const b of this.birds) {
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.scale(b.scale * (b.vx > 0 ? 1 : -1), b.scale);
      ctx.strokeStyle = `rgba(30, 26, 20, ${b.alpha})`;
      ctx.lineWidth = 1.6;
      ctx.lineCap = 'round';

      // 飛鳥翅膀扇動幅度（正弦函數驅動）
      const wingY = Math.sin(b.wingCycle) * 7;

      // 左翼 (毛筆雙弧)
      ctx.beginPath();
      ctx.moveTo(-10, wingY);
      ctx.quadraticCurveTo(-5, -2 + wingY * 0.5, 0, 0);
      // 右翼
      ctx.quadraticCurveTo(5, -2 + wingY * 0.5, 10, wingY);
      ctx.stroke();

      // 鳥身微小墨痕
      ctx.beginPath();
      ctx.moveTo(0, -1);
      ctx.lineTo(2, 3);
      ctx.stroke();

      ctx.restore();
    }
    ctx.restore();
  }

  /**
   * 繪製微風中搖曳的淡墨修竹
   */
  _renderBamboos(ctx) {
    ctx.save();
    ctx.fillStyle = 'rgba(38, 45, 36, 0.16)';
    ctx.strokeStyle = 'rgba(38, 45, 36, 0.18)';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';

    for (const b of this.bamboos) {
      ctx.save();
      ctx.translate(b.baseX, b.baseY);

      // 微風搖曳角度
      const sway = Math.sin(this.time * b.swaySpeed) * 0.05;
      const angle = b.angle + sway;

      // 繪製竹竿
      const tipX = Math.cos(angle) * b.length;
      const tipY = Math.sin(angle) * b.length;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(tipX, tipY);
      ctx.stroke();

      // 繪製竹葉（分佈在竹梢周圍）
      for (let i = 1; i <= b.leaves; i++) {
        const seg = i / b.leaves;
        const lx = tipX * seg;
        const ly = tipY * seg;
        const leafAngle = angle + (i % 2 === 0 ? 0.65 : -0.65) + Math.sin(this.time * 2 + i) * 0.08;
        const leafLen = 18 + (i % 3) * 5;

        ctx.save();
        ctx.translate(lx, ly);
        ctx.rotate(leafAngle);
        ctx.beginPath();
        // 經典水墨竹葉柳葉形（尖兩端，中間豐滿）
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(leafLen * 0.5, -3.5, leafLen, 0);
        ctx.quadraticCurveTo(leafLen * 0.5, 3.5, 0, 0);
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();
    }
    ctx.restore();
  }
}
