/**
 * js/entities/Board.js
 * 棋盤實體：負責 15x15 矩陣資料管理、棋盤格線、星位與黑白棋子渲染
 */

import { Entity } from './Entity.js';
import { GRID_CONFIG, CANVAS_CONFIG, THEME, PIECE_TYPE } from '../config.js';

export class Board extends Entity {
  constructor() {
    super(0, 0);
    this.size = GRID_CONFIG.SIZE;
    this.grid = [];
    this.reset();
  }

  /**
   * 重設棋盤矩陣為全部空位
   */
  reset() {
    this.grid = Array.from({ length: this.size }, () => Array(this.size).fill(PIECE_TYPE.EMPTY));
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
   * 繪製棋盤、格線、星位與所有棋子
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
  }

  /**
   * 繪製單枚棋子
   * @private
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} x - 網格 X
   * @param {number} y - 網格 Y
   * @param {number} pieceType - 棋子類型 (1: 黑, 2: 白)
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
}
