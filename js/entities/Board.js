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
   * 繪製棋盤水墨格線與星位定位點
   * @param {CanvasRenderingContext2D} ctx
   */
  renderGrid(ctx) {
    const { OFFSET, CELL_SIZE, SIZE, STAR_POINTS, STAR_POINT_RADIUS } = GRID_CONFIG;
    const maxCoord = OFFSET + (SIZE - 1) * CELL_SIZE;

    ctx.save();

    // 棋盤格線（蒼勁深黛水墨細線）
    ctx.strokeStyle = 'rgba(48, 38, 25, 0.75)';
    ctx.lineWidth = 1.8;

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

    // 星位定位點（圓潤小墨點）
    ctx.fillStyle = 'rgba(38, 30, 20, 0.85)';
    for (let i = 0; i < STAR_POINTS.length; i++) {
      const [sx, sy] = STAR_POINTS[i];
      const px = OFFSET + sx * CELL_SIZE;
      const py = OFFSET + sy * CELL_SIZE;

      ctx.beginPath();
      ctx.arc(px, py, STAR_POINT_RADIUS, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * 繪製所有棋子、最後一手硃砂落款與勝利書法連線
   * @param {CanvasRenderingContext2D} ctx
   */
  renderPieces(ctx) {
    const { SIZE } = GRID_CONFIG;

    // 1. 繪製棋子
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        const piece = this.grid[y][x];
        if (piece !== PIECE_TYPE.EMPTY) {
          this._renderPiece(ctx, x, y, piece);
        }
      }
    }

    // 2. 繪製最後一手落子標記 (Last Move Marker)
    if (this.lastMove) {
      this._renderLastMoveMarker(ctx, this.lastMove.x, this.lastMove.y, this.lastMove.type);
    }

    // 3. 繪製五連珠獲勝連線 (Winning Line Highlight)
    if (this.winLine && this.winLine.length >= 2) {
      this._renderWinningLine(ctx, this.winLine);
    }
  }

  /**
   * 相容預設渲染（先格線後棋子）
   * @param {CanvasRenderingContext2D} ctx
   */
  render(ctx) {
    this.renderGrid(ctx);
    this.renderPieces(ctx);
  }

  /**
   * 繪製單枚棋子（清爽溫潤的墨玉與白玉質感，無多餘外圈霧影）
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

    // 棋子主體（黑棋如堅實徽墨墨錠，白棋如羊脂玉）
    const hiX = px - r * 0.32;
    const hiY = py - r * 0.32;
    const grad = ctx.createRadialGradient(hiX, hiY, r * 0.08, px, py, r);
    if (isPlayer) {
      grad.addColorStop(0, '#3e4842'); // 墨頂微光
      grad.addColorStop(0.35, '#1e2621'); // 濃墨
      grad.addColorStop(0.85, '#0d120f'); // 焦墨
      grad.addColorStop(1, '#080a08');
    } else {
      grad.addColorStop(0, '#ffffff'); // 白玉凝脂
      grad.addColorStop(0.4, '#ede6ce');
      grad.addColorStop(0.85, '#d5caa9');
      grad.addColorStop(1, '#b8ad8f');
    }

    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // 清晰精緻的天然玉石輪廓線（乾淨俐落）
    ctx.strokeStyle = isPlayer ? '#222b24' : '#887f66';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // 棋面清爽高光
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
   * 繪製最後一手提示（精緻硃砂印記，乾淨醒目）
   * @private
   */
  _renderLastMoveMarker(ctx, x, y, type) {
    const { OFFSET, CELL_SIZE } = GRID_CONFIG;
    const px = OFFSET + x * CELL_SIZE;
    const py = OFFSET + y * CELL_SIZE;

    ctx.save();
    const isPlayer = type === PIECE_TYPE.BLACK;
    const cinnabar = isPlayer ? '#c23022' : '#ac2418';
    const pulse = 0.5 + Math.sin(this.pulseTimer * 3.5) * 0.5;

    // 1. 清爽的硃砂細環（呼吸律動）
    ctx.beginPath();
    ctx.arc(px, py, 8.5 + pulse * 2.2, 0, Math.PI * 2);
    ctx.strokeStyle = cinnabar;
    ctx.lineWidth = 1.8;
    ctx.globalAlpha = 0.85 + pulse * 0.15;
    ctx.stroke();

    // 2. 中心硃砂落款點
    ctx.beginPath();
    ctx.arc(px, py, 3, 0, Math.PI * 2);
    ctx.fillStyle = cinnabar;
    ctx.globalAlpha = 0.95;
    ctx.fill();

    ctx.restore();
  }

  /**
   * 繪製五子連線（蒼勁書法墨線與硃砂貫通，線條俐落非煙霧）
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

    const pulse = 0.5 + Math.sin(this.pulseTimer * 3) * 0.5;

    ctx.save();

    // 1. 書法主幹：蒼勁深墨一筆貫穿
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.strokeStyle = `rgba(18, 24, 20, ${0.85 + pulse * 0.15})`;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.stroke();

    // 2. 硃砂紅心細線提氣（紅白相映）
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.strokeStyle = `rgba(215, 55, 38, ${0.8 + pulse * 0.2})`;
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.stroke();

    // 3. 連線每顆棋子外圈的精緻硃砂印環
    line.forEach(({ x, y }) => {
      const px = OFFSET + x * CELL_SIZE;
      const py = OFFSET + y * CELL_SIZE;

      ctx.beginPath();
      ctx.arc(px, py, THEME.PIECE_RADIUS + 3.5 + pulse * 2, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(210, 48, 35, ${0.75 + pulse * 0.25})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    ctx.restore();
  }

  /**
   * 繪製 AI 游標（清爽乾淨的提筆探位墨線圈）
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} gridX  浮點格座標 X
   * @param {number} gridY  浮點格座標 Y
   * @param {number} pulseT 動畫計時器
   * @param {boolean} isArrived 是否已到達目標格
   */
  renderAICursor(ctx, gridX, gridY, pulseT, isArrived) {
    const { OFFSET, CELL_SIZE } = GRID_CONFIG;
    const px = OFFSET + gridX * CELL_SIZE;
    const py = OFFSET + gridY * CELL_SIZE;

    const beatSpeed = isArrived ? 8 : 3.5;
    const beat = 0.5 + Math.sin(pulseT * beatSpeed) * 0.5;

    ctx.save();

    // 1. 懸停墨圈（移動中清爽細線，到位時轉為醒目硃砂印圈）
    const ringR = isArrived ? 12 + beat * 2.5 : 11;
    ctx.beginPath();
    ctx.arc(px, py, ringR, 0, Math.PI * 2);
    ctx.strokeStyle = isArrived
      ? `rgba(210, 45, 30, ${0.85 + beat * 0.15})`
      : 'rgba(38, 50, 42, 0.8)';
    ctx.lineWidth = isArrived ? 2.2 : 1.6;
    ctx.stroke();

    // 2. 清脆筆鋒核心小點
    const dropR = isArrived ? 3 + beat : 2.2;
    ctx.beginPath();
    ctx.arc(px, py, dropR, 0, Math.PI * 2);
    ctx.fillStyle = isArrived ? '#c52e20' : '#1c241f';
    ctx.fill();

    // 3. 移動中的毛筆行筆指針微痕
    if (!isArrived) {
      const arm = 6;
      ctx.strokeStyle = 'rgba(40, 52, 44, 0.6)';
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(px - arm, py); ctx.lineTo(px + arm, py); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(px, py - arm); ctx.lineTo(px, py + arm); ctx.stroke();
    }

    ctx.restore();
  }
}

