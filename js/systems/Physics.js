/**
 * js/systems/Physics.js
 * 空間幾何與棋盤規則判定系統（邊界、座標換算、連線判定、勝利線提取與滿盤檢查）
 */

import { GRID_CONFIG, RULES, PIECE_TYPE } from '../config.js';

export class Physics {
  /**
   * 檢查座標是否在棋盤網格邊界內
   * @param {number} x
   * @param {number} y
   * @returns {boolean}
   */
  static inside(x, y) {
    return x >= 0 && x < GRID_CONFIG.SIZE && y >= 0 && y < GRID_CONFIG.SIZE;
  }

  /**
   * 計算特定方向上的連續相同棋子數量
   * @param {import('../entities/Board.js').Board} board
   * @param {number} startX
   * @param {number} startY
   * @param {number} dx
   * @param {number} dy
   * @param {number} pieceType
   * @returns {number}
   */
  static countInDirection(board, startX, startY, dx, dy, pieceType) {
    let count = 0;
    let x = startX + dx;
    let y = startY + dy;

    while (this.inside(x, y) && board.getPiece(x, y) === pieceType) {
      count++;
      x += dx;
      y += dy;
    }

    return count;
  }

  /**
   * 檢驗剛落子的座標是否觸發五連珠勝利條件
   * @param {import('../entities/Board.js').Board} board
   * @param {number} x
   * @param {number} y
   * @param {number} pieceType
   * @returns {boolean}
   */
  static checkWin(board, x, y, pieceType) {
    if (pieceType === PIECE_TYPE.EMPTY) return false;

    return RULES.DIRECTIONS.some(([dx, dy]) => {
      const forwardCount = this.countInDirection(board, x, y, dx, dy, pieceType);
      const backwardCount = this.countInDirection(board, x, y, -dx, -dy, pieceType);
      return 1 + forwardCount + backwardCount >= RULES.WIN_COUNT;
    });
  }

  /**
   * 取得觸發獲勝的五顆連珠座標序列（供高亮連線繪製）
   * @param {import('../entities/Board.js').Board} board
   * @param {number} x
   * @param {number} y
   * @param {number} pieceType
   * @returns {Array<{x: number, y: number}>|null}
   */
  static getWinningLine(board, x, y, pieceType) {
    if (pieceType === PIECE_TYPE.EMPTY) return null;

    for (const [dx, dy] of RULES.DIRECTIONS) {
      const forwardPoints = [];
      let cx = x + dx;
      let cy = y + dy;
      while (this.inside(cx, cy) && board.getPiece(cx, cy) === pieceType) {
        forwardPoints.push({ x: cx, y: cy });
        cx += dx;
        cy += dy;
      }

      const backwardPoints = [];
      cx = x - dx;
      cy = y - dy;
      while (this.inside(cx, cy) && board.getPiece(cx, cy) === pieceType) {
        backwardPoints.push({ x: cx, y: cy });
        cx -= dx;
        cy -= dy;
      }

      if (1 + forwardPoints.length + backwardPoints.length >= RULES.WIN_COUNT) {
        // 從最遠的後方向延伸至最遠的前方向排序
        return [...backwardPoints.reverse(), { x, y }, ...forwardPoints];
      }
    }

    return null;
  }

  /**
   * 檢驗棋盤是否已全部填滿
   * @param {import('../entities/Board.js').Board} board
   * @returns {boolean}
   */
  static isBoardFull(board) {
    for (let y = 0; y < GRID_CONFIG.SIZE; y++) {
      for (let x = 0; x < GRID_CONFIG.SIZE; x++) {
        if (board.isEmpty(x, y)) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * 將網格座標轉換為畫布像素座標 (圓心)
   * @param {number} gx
   * @param {number} gy
   * @returns {{x: number, y: number}}
   */
  static gridToCanvas(gx, gy) {
    return {
      x: GRID_CONFIG.OFFSET + gx * GRID_CONFIG.CELL_SIZE,
      y: GRID_CONFIG.OFFSET + gy * GRID_CONFIG.CELL_SIZE,
    };
  }

  /**
   * 將畫布像素座標轉換為最近的網格整數索引
   * @param {number} cx
   * @param {number} cy
   * @returns {{x: number, y: number}}
   */
  static canvasToGrid(cx, cy) {
    return {
      x: Math.round((cx - GRID_CONFIG.OFFSET) / GRID_CONFIG.CELL_SIZE),
      y: Math.round((cy - GRID_CONFIG.OFFSET) / GRID_CONFIG.CELL_SIZE),
    };
  }
}
