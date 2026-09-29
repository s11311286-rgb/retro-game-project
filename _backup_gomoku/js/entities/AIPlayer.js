/**
 * js/entities/AIPlayer.js
 * 電腦敵方決策管理器，實現啟發式局面評估與智慧選點
 */

import { Entity } from './Entity.js';
import { GRID_CONFIG, PIECE_TYPE, AI_CONFIG, RULES } from '../config.js';
import { Physics } from '../systems/Physics.js';

export class AIPlayer extends Entity {
  constructor() {
    super(0, 0);
    this.pieceType = PIECE_TYPE.WHITE;
  }

  /**
   * 計算特定座標對指定玩家的評分權重
   * @param {import('./Board.js').Board} board
   * @param {number} x
   * @param {number} y
   * @param {number} pieceType
   * @returns {number}
   */
  scorePosition(board, x, y, pieceType) {
    let score = 0;
    const { SCORES } = AI_CONFIG;

    for (const [dx, dy] of RULES.DIRECTIONS) {
      let count = 1;
      let openEnds = 0;

      for (const q of [1, -1]) {
        let cx = x + dx * q;
        let cy = y + dy * q;

        while (Physics.inside(cx, cy) && board.getPiece(cx, cy) === pieceType) {
          count++;
          cx += dx * q;
          cy += dy * q;
        }

        if (Physics.inside(cx, cy) && board.getPiece(cx, cy) === PIECE_TYPE.EMPTY) {
          openEnds++;
        }
      }

      if (count >= 5) {
        score += SCORES.FIVE;
      } else if (count === 4) {
        score += openEnds === 2 ? SCORES.LIVE_FOUR : SCORES.SLEEP_FOUR;
      } else if (count === 3) {
        score += openEnds === 2 ? SCORES.LIVE_THREE : SCORES.SLEEP_THREE;
      } else if (count === 2) {
        score += openEnds === 2 ? SCORES.LIVE_TWO : SCORES.SLEEP_TWO;
      } else {
        score += SCORES.DEFAULT;
      }
    }

    return score;
  }

  /**
   * 計算並選取最佳落子點
   * @param {import('./Board.js').Board} board
   * @returns {{x: number, y: number}|null}
   */
  computeBestMove(board) {
    const size = GRID_CONFIG.SIZE;
    let bestScore = -1;
    let candidates = [];

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (board.isEmpty(x, y)) {
          // 進攻評估 (權重 1.15) + 防守評估 + 中心點偏好權重
          const offenseScore = this.scorePosition(board, x, y, PIECE_TYPE.WHITE);
          const defenseScore = this.scorePosition(board, x, y, PIECE_TYPE.BLACK);
          const centerBias = AI_CONFIG.CENTER_BIAS - Math.abs(x - 7) - Math.abs(y - 7);

          const totalScore = offenseScore * AI_CONFIG.OFFENSE_WEIGHT + defenseScore + centerBias;

          if (totalScore > bestScore) {
            bestScore = totalScore;
            candidates = [{ x, y }];
          } else if (totalScore === bestScore) {
            candidates.push({ x, y });
          }
        }
      }
    }

    if (candidates.length === 0) return null;

    // 從最高分候選點中隨機挑選一個
    const randomIndex = Math.floor(Math.random() * candidates.length);
    return candidates[randomIndex];
  }
}
