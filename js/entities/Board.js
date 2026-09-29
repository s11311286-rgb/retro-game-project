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
   * 繪製單枚棋子
   * @private
   */
  _renderPiece(ctx, x, y, pieceType) {
    const { OFFSET, CELL_SIZE } = GRID_CONFIG;
    const { PIECE_RADIUS, PLAYER_PIECE, AI_PIECE } = THEME;

    const px = OFFSET + x * CELL_SIZE;
    const py = OFFSET + y * CELL_SIZE;
    const isPlayer = pieceType === PIECE_TYPE.BLACK;
    const style = isPlayer ? PLAYER_PIECE : AI_PIECE;

    ctx.beginPath();
    ctx.arc(px, py, PIECE_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = style.FILL;
    ctx.fill();

    ctx.strokeStyle = style.STROKE;
    ctx.lineWidth = style.LINE_WIDTH;
    ctx.stroke();
  }

  /**
   * 繪製最後一手提示光環（紅心點與呼吸外環）
   * @private
   */
  _renderLastMoveMarker(ctx, x, y, type) {
    const { OFFSET, CELL_SIZE } = GRID_CONFIG;
    const px = OFFSET + x * CELL_SIZE;
    const py = OFFSET + y * CELL_SIZE;

    ctx.save();
    const isPlayer = type === PIECE_TYPE.BLACK;
    const markerColor = isPlayer ? '#e74c3c' : '#c0392b';

    // 中心小紅點
    ctx.beginPath();
    ctx.arc(px, py, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = markerColor;
    ctx.fill();

    // 呼吸動態外環 (半徑 8 ~ 11px)
    const ringRadius = 9 + Math.sin(this.pulseTimer) * 2;
    ctx.beginPath();
    ctx.arc(px, py, ringRadius, 0, Math.PI * 2);
    ctx.strokeStyle = markerColor;
    ctx.lineWidth = 1.8;
    ctx.globalAlpha = 0.75 + Math.sin(this.pulseTimer) * 0.25;
    ctx.stroke();

    ctx.restore();
  }

  /**
   * 繪製五子連線金色光芒特效
   * @private
   * @param {CanvasRenderingContext2D} ctx
   * @param {Array<{x: number, y: number}>} line
   */
  _renderWinningLine(ctx, line) {
    const { OFFSET, CELL_SIZE } = GRID_CONFIG;
    const start = line[0];
    const end = line[line.length - 1];

    const sx = OFFSET + start.x * CELL_SIZE;
    const sy = OFFSET + start.y * CELL_SIZE;
    const ex = OFFSET + end.x * CELL_SIZE;
    const ey = OFFSET + end.y * CELL_SIZE;

    ctx.save();

    // 1. 金色底層發光寬線
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.45)';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.stroke();

    // 2. 亮金核心連線
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.stroke();

    // 3. 連線各棋子周圍金色光環
    line.forEach(({ x, y }) => {
      const px = OFFSET + x * CELL_SIZE;
      const py = OFFSET + y * CELL_SIZE;
      ctx.beginPath();
      ctx.arc(px, py, THEME.PIECE_RADIUS + 3, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    });

    ctx.restore();
  }
}
