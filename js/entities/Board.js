/**
 * js/entities/Board.js
 * 棋盤實體：負責 15x15 矩陣資料管理、棋盤格線、星位、黑白棋子、最後落子標記與勝利連線渲染
 */

import { Entity } from './Entity.js';
import { GRID_CONFIG, CANVAS_CONFIG, THEME, PIECE_TYPE } from '../config.js';

export class Board extends Entity {
  constructor() {
    super(0, 0);
    this.size = GRID_CONFIG.SIZE;
    this.grid = [];
    this.lastMove = null; // { x, y, type }
    this.winLine = null;  // Array<{ x, y }>
    this.pulseTimer = 0;
    this.reset();
  }

  /**
   * 重設棋盤矩陣與視覺標記
   */
  reset() {
    this.grid = Array.from({ length: this.size }, () => Array(this.size).fill(PIECE_TYPE.EMPTY));
    this.lastMove = null;
    this.winLine = null;
    this.pulseTimer = 0;
  }

  /**
   * 記錄最後一手落子座標
   * @param {number} x
   * @param {number} y
   * @param {number} type
   */
  setLastMove(x, y, type) {
    this.lastMove = { x, y, type };
  }

  /**
   * 設定勝利五連線座標序列
   * @param {Array<{x: number, y: number}>|null} line
   */
  setWinLine(line) {
    this.winLine = line;
  }

  /**
   * 取得指定座標之棋子狀態
   * @param {number} x
   * @param {number} y
   * @returns {number}
   */
  getPiece(x, y) {
    if (x >= 0 && x < this.size && y >= 0 && y < this.size) {
      return this.grid[y][x];
    }
    return PIECE_TYPE.EMPTY;
  }

  /**
   * 放置棋子
   * @param {number} x
   * @param {number} y
   * @param {number} type
   */
  setPiece(x, y, type) {
    if (x >= 0 && x < this.size && y >= 0 && y < this.size) {
      this.grid[y][x] = type;
      this.setLastMove(x, y, type);
    }
  }

  /**
   * 指定座標是否為空位
   * @param {number} x
   * @param {number} y
   * @returns {boolean}
   */
  isEmpty(x, y) {
    return this.getPiece(x, y) === PIECE_TYPE.EMPTY;
  }

  /**
   * 邏輯更新（驅動光圈呼吸動畫）
   * @param {number} dt
   */
  update(dt) {
    this.pulseTimer += dt * 4;
  }

  /**
   * 繪製棋盤、格線、星位、棋子、最後一手標記與勝利連線
   * @param {CanvasRenderingContext2D} ctx
   */
  render(ctx) {
    const { OFFSET, CELL_SIZE, SIZE, STAR_POINTS, STAR_POINT_RADIUS } = GRID_CONFIG;
    const { WIDTH, HEIGHT } = CANVAS_CONFIG;

    // 1. 棋盤底色
    ctx.fillStyle = THEME.BOARD_BG;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // 2. 棋盤格線
    ctx.strokeStyle = THEME.GRID_LINE;
    ctx.lineWidth = 2;

    const maxCoord = OFFSET + (SIZE - 1) * CELL_SIZE;

    for (let i = 0; i < SIZE; i++) {
      const pos = OFFSET + i * CELL_SIZE;

      // 橫線
      ctx.beginPath();
      ctx.moveTo(OFFSET, pos);
      ctx.lineTo(maxCoord, pos);
      ctx.stroke();

      // 直線
      ctx.beginPath();
      ctx.moveTo(pos, OFFSET);
      ctx.lineTo(pos, maxCoord);
      ctx.stroke();
    }

    // 3. 星位定位點
    ctx.fillStyle = THEME.STAR_POINT;
    for (let i = 0; i < STAR_POINTS.length; i++) {
      const [sx, sy] = STAR_POINTS[i];
      const px = OFFSET + sx * CELL_SIZE;
      const py = OFFSET + sy * CELL_SIZE;

      ctx.beginPath();
      ctx.arc(px, py, STAR_POINT_RADIUS, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. 繪製棋子
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        const piece = this.grid[y][x];
        if (piece !== PIECE_TYPE.EMPTY) {
          this._renderPiece(ctx, x, y, piece);
        }
      }
    }

    // 5. 繪製最後一手落子標記 (Last Move Marker)
    if (this.lastMove) {
      this._renderLastMoveMarker(ctx, this.lastMove.x, this.lastMove.y, this.lastMove.type);
    }

    // 6. 繪製五連珠獲勝連線 (Winning Line Highlight)
    if (this.winLine && this.winLine.length >= 2) {
      this._renderWinningLine(ctx, this.winLine);
    }
  }

  /**
   * 繪製單枚棋子（水墨墨錠與溫潤玉石質感）
   * @private
   */
  _renderPiece(ctx, x, y, pieceType) {
    const { OFFSET, CELL_SIZE } = GRID_CONFIG;
    const { PIECE_RADIUS } = THEME;

    const px = OFFSET + x * CELL_SIZE;
    const py = OFFSET + y * CELL_SIZE;
    const r  = PIECE_RADIUS;
    const isPlayer = pieceType === PIECE_TYPE.BLACK;

    ctx.save();

    // 1. 水墨在宣紙的自然滲墨外圈（墨暈邊緣）
    const bleedColor = isPlayer ? 'rgba(15, 20, 16, 0.28)' : 'rgba(235, 225, 195, 0.35)';
    const bleedGrad = ctx.createRadialGradient(px, py, r * 0.7, px, py, r * 1.35);
    bleedGrad.addColorStop(0, bleedColor);
    bleedGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.beginPath();
    ctx.arc(px, py, r * 1.35, 0, Math.PI * 2);
    ctx.fillStyle = bleedGrad;
    ctx.fill();

    // 2. 棋子主體（黑棋如油煙墨錠，白棋如羊脂素玉）
    const hiX = px - r * 0.32;
    const hiY = py - r * 0.32;
    const grad = ctx.createRadialGradient(hiX, hiY, r * 0.08, px, py, r);
    if (isPlayer) {
      grad.addColorStop(0, '#3a443e'); // 墨頂微光
      grad.addColorStop(0.35, '#1b221d'); // 濃墨
      grad.addColorStop(0.85, '#0a0d0b'); // 焦墨
      grad.addColorStop(1, '#050705');
    } else {
      grad.addColorStop(0, '#ffffff'); // 白玉凝脂
      grad.addColorStop(0.4, '#ede6ce');
      grad.addColorStop(0.85, '#d3c9aa');
      grad.addColorStop(1, '#b5ab8d'); // 宣紙雅灰
    }

    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // 3. 仿手工雕琢自然墨玉輪廓
    ctx.strokeStyle = isPlayer ? '#28322a' : '#8f866e';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // 4. 水墨反光微光斑
    const hlGrad = ctx.createRadialGradient(hiX, hiY, 0, hiX, hiY, r * 0.4);
    hlGrad.addColorStop(0, isPlayer ? 'rgba(255, 255, 255, 0.22)' : 'rgba(255, 255, 255, 0.7)');
    hlGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.beginPath();
    ctx.arc(hiX, hiY, r * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = hlGrad;
    ctx.fill();

    ctx.restore();
  }

  /**
   * 繪製最後一手提示（古典硃砂印記與水墨朱紅暈染）
   * @private
   */
  _renderLastMoveMarker(ctx, x, y, type) {
    const { OFFSET, CELL_SIZE } = GRID_CONFIG;
    const px = OFFSET + x * CELL_SIZE;
    const py = OFFSET + y * CELL_SIZE;

    ctx.save();
    const isPlayer = type === PIECE_TYPE.BLACK;
    // 硃砂朱紅（古書畫印泥色澤）
    const cinnabar = isPlayer ? 'rgba(196, 44, 30,' : 'rgba(176, 36, 24,';
    const pulse = 0.5 + Math.sin(this.pulseTimer * 3) * 0.5;

    // 1. 外圍硃砂淡墨呼吸暈（微宣紙擴散）
    const haloR = 12 + pulse * 4;
    const haloGrad = ctx.createRadialGradient(px, py, 4, px, py, haloR);
    haloGrad.addColorStop(0, `${cinnabar} ${0.35 + pulse * 0.25})`);
    haloGrad.addColorStop(1, `${cinnabar} 0)`);
    ctx.beginPath();
    ctx.arc(px, py, haloR, 0, Math.PI * 2);
    ctx.fillStyle = haloGrad;
    ctx.fill();

    // 2. 硃砂古印外框（中式古典圓形小印紋）
    ctx.beginPath();
    ctx.arc(px, py, 7.5 + pulse * 1.5, 0, Math.PI * 2);
    ctx.strokeStyle = `${cinnabar} ${0.85 + pulse * 0.15})`;
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // 3. 中心硃砂落款點
    ctx.beginPath();
    ctx.arc(px, py, 2.8, 0, Math.PI * 2);
    ctx.fillStyle = `${cinnabar} 0.95)`;
    ctx.fill();

    ctx.restore();
  }

  /**
   * 繪製五子連線（毛筆揮毫濃淡水墨連貫筆鋒）
   * @private
   */
  _renderWinningLine(ctx, line) {
    const { OFFSET, CELL_SIZE } = GRID_CONFIG;
    const start = line[0];
    const end   = line[line.length - 1];

    const sx = OFFSET + start.x * CELL_SIZE;
    const sy = OFFSET + start.y * CELL_SIZE;
    const ex = OFFSET + end.x   * CELL_SIZE;
    const ey = OFFSET + end.y   * CELL_SIZE;

    const pulse = 0.5 + Math.sin(this.pulseTimer * 2.2) * 0.5;

    ctx.save();

    // 1. 最外層淡墨暈染（水墨在生宣上迅速透化的墨韻）
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.strokeStyle = `rgba(18, 25, 20, ${0.16 + pulse * 0.12})`;
    ctx.lineWidth = 26;
    ctx.lineCap = 'round';
    ctx.stroke();

    // 2. 次層水墨濕筆觸
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.strokeStyle = `rgba(32, 42, 35, ${0.45 + pulse * 0.2})`;
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.stroke();

    // 3. 書法主幹：蒼勁焦墨一筆貫穿
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.strokeStyle = `rgba(12, 16, 13, ${0.85 + pulse * 0.15})`;
    ctx.lineWidth = 4.5;
    ctx.lineCap = 'round';
    ctx.stroke();

    // 4. 書法飛白與硃砂雙色印氣：貫穿五子的硃砂朱線提氣
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.strokeStyle = `rgba(215, 60, 42, ${0.4 + pulse * 0.4})`;
    ctx.lineWidth = 1.8;
    ctx.lineCap = 'round';
    ctx.stroke();

    // 5. 連線每顆棋子外圈的水墨朱文古印環
    line.forEach(({ x, y }) => {
      const px = OFFSET + x * CELL_SIZE;
      const py = OFFSET + y * CELL_SIZE;

      // 宣紙墨暈外環
      ctx.beginPath();
      ctx.arc(px, py, THEME.PIECE_RADIUS + 4 + pulse * 3, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(200, 48, 35, ${0.6 + pulse * 0.35})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // 棋心淡淡墨色聚氣
      const grd = ctx.createRadialGradient(px, py, 0, px, py, THEME.PIECE_RADIUS + 8);
      grd.addColorStop(0, `rgba(210, 50, 36, ${0.22 + pulse * 0.18})`);
      grd.addColorStop(1, 'rgba(18, 25, 20, 0)');
      ctx.beginPath();
      ctx.arc(px, py, THEME.PIECE_RADIUS + 8, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();
    });

    ctx.restore();
  }

  /**
   * 繪製 AI 游標（古風懸空毛筆提筆點墨、墨滴探位意境）
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} gridX  浮點格座標 X
   * @param {number} gridY  浮點格座標 Y
   * @param {number} pulseT 動畫計時器
   * @param {boolean} isArrived 是否已到達目標格（欲點墨頓筆）
   */
  renderAICursor(ctx, gridX, gridY, pulseT, isArrived) {
    const { OFFSET, CELL_SIZE } = GRID_CONFIG;
    const px = OFFSET + gridX * CELL_SIZE;
    const py = OFFSET + gridY * CELL_SIZE;

    const beatSpeed = isArrived ? 7 : 3;
    const beat = 0.5 + Math.sin(pulseT * beatSpeed) * 0.5;

    ctx.save();

    // 1. 提筆懸空的淡淡水墨水氣
    const mistR = isArrived ? 22 + beat * 6 : 16;
    const mistGrad = ctx.createRadialGradient(px, py, 2, px, py, mistR);
    mistGrad.addColorStop(0, isArrived ? `rgba(215, 60, 40, ${0.28 + beat * 0.2})` : 'rgba(40, 50, 42, 0.22)');
    mistGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.beginPath();
    ctx.arc(px, py, mistR, 0, Math.PI * 2);
    ctx.fillStyle = mistGrad;
    ctx.fill();

    // 2. 懸停墨圈（到達時轉為硃砂欲點之色）
    const ringR = isArrived ? 12 + beat * 3 : 11;
    ctx.beginPath();
    ctx.arc(px, py, ringR, 0, Math.PI * 2);
    ctx.strokeStyle = isArrived
      ? `rgba(205, 45, 32, ${0.75 + beat * 0.25})`
      : 'rgba(38, 50, 42, 0.7)';
    ctx.lineWidth = isArrived ? 2.2 : 1.6;
    ctx.stroke();

    // 3. 毛筆筆鋒水滴形核心墨點
    const dropR = isArrived ? 3.5 + beat * 1.5 : 2.5;
    ctx.beginPath();
    ctx.arc(px, py, dropR, 0, Math.PI * 2);
    ctx.fillStyle = isArrived
      ? `rgba(185, 35, 25, ${0.85 + beat * 0.15})`
      : 'rgba(20, 26, 22, 0.85)';
    ctx.fill();

    // 4. 移動中的毛筆行筆虛線微痕
    if (!isArrived) {
      const arm = 6;
      ctx.strokeStyle = 'rgba(45, 58, 48, 0.45)';
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(px - arm, py); ctx.lineTo(px + arm, py); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(px, py - arm); ctx.lineTo(px, py + arm); ctx.stroke();
    }

    ctx.restore();
  }
}

