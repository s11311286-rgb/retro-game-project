/**
 * js/entities/AIPlayer.js
 * 電腦敵方決策管理器：支援三種難度等級（簡單/普通/困難）、啟發式局面評估與雙三/四三雙殺檢測
 */

import { Entity } from './Entity.js';
import { GRID_CONFIG, PIECE_TYPE, AI_CONFIG, RULES, DIFFICULTY_CONFIG } from '../config.js';
import { Physics } from '../systems/Physics.js';

export class AIPlayer extends Entity {
  constructor() {
    super(0, 0);
    this.pieceType = PIECE_TYPE.WHITE;
  }

  /**
   * 計算特定座標對指定玩家的評分權重與型態特徵
   * @param {import('./Board.js').Board} board
   * @param {number} x
   * @param {number} y
   * @param {number} pieceType
   * @returns {{ score: number, liveThrees: number, fours: number, isFive: boolean }}
   */
  evaluatePosition(board, x, y, pieceType) {
    let score = 0;
    let liveThrees = 0;
    let fours = 0;
    let isFive = false;
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
        isFive = true;
      } else if (count === 4) {
        if (openEnds === 2) {
          score += SCORES.LIVE_FOUR;
          fours++;
        } else if (openEnds === 1) {
          score += SCORES.SLEEP_FOUR;
          fours++;
        }
      } else if (count === 3) {
        if (openEnds === 2) {
          score += SCORES.LIVE_THREE;
          liveThrees++;
        } else if (openEnds === 1) {
          score += SCORES.SLEEP_THREE;
        }
      } else if (count === 2) {
        score += openEnds === 2 ? SCORES.LIVE_TWO : SCORES.SLEEP_TWO;
      } else {
        score += SCORES.DEFAULT;
      }
    }

    return { score, liveThrees, fours, isFive };
  }

  /**
   * 計算並選取最佳落子點（支援三種難度等級）
   * @param {import('./Board.js').Board} board
   * @param {Object} [diffConfig]
   * @returns {{x: number, y: number}|null}
   */
  computeBestMove(board, diffConfig = DIFFICULTY_CONFIG.NORMAL) {
    const size = GRID_CONFIG.SIZE;
    let scoredMoves = [];

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (board.isEmpty(x, y)) {
          const offense = this.evaluatePosition(board, x, y, PIECE_TYPE.WHITE);
          const defense = this.evaluatePosition(board, x, y, PIECE_TYPE.BLACK);
          const centerBias = AI_CONFIG.CENTER_BIAS - Math.abs(x - 7) - Math.abs(y - 7);

          let forkBonus = 0;
          // 困難模式：計算進攻雙三/四三與防禦玩家雙三/四三
          if (diffConfig.CHECK_FORKS) {
            // 我方可形成雙三或四三（必殺點）
            if (offense.liveThrees >= 2 || (offense.fours >= 1 && offense.liveThrees >= 1)) {
              forkBonus += 32000;
            }
            // 敵方可形成雙三或四三（必防點）
            if (defense.liveThrees >= 2 || (defense.fours >= 1 && defense.liveThrees >= 1)) {
              forkBonus += 26000;
            }
          }

          const totalScore =
            offense.score * diffConfig.OFFENSE_WEIGHT +
            defense.score * diffConfig.DEFENSE_WEIGHT +
            centerBias +
            forkBonus;

          scoredMoves.push({ x, y, score: totalScore, isFive: offense.isFive, isDefendFive: defense.isFive });
        }
      }
    }

    if (scoredMoves.length === 0) return null;

    // 依照分數由高至低排序
    scoredMoves.sort((a, b) => b.score - a.score);

    // 簡單模式：隨機在次優點落子，創造玩家破綻
    if (diffConfig.RANDOM_BLUNDER_RATE > 0 && Math.random() < diffConfig.RANDOM_BLUNDER_RATE) {
      // 若對方或我方並非即將連五，允許在第 2~5 高分候選中隨機挑選
      if (!scoredMoves[0].isFive && !scoredMoves[0].isDefendFive) {
        const blunderPool = scoredMoves.slice(0, Math.min(5, scoredMoves.length));
        return blunderPool[Math.floor(Math.random() * blunderPool.length)];
      }
    }

    // 收集所有最高分候選點（同分隨機）
    const bestScore = scoredMoves[0].score;
    const bestCandidates = scoredMoves.filter((m) => Math.abs(m.score - bestScore) < 0.001);

    const randomIndex = Math.floor(Math.random() * bestCandidates.length);
    return bestCandidates[randomIndex];
  }
}
