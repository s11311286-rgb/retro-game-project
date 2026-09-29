/**
 * js/systems/ScoreSystem.js
 * 分數與速度動態遞增系統：管理分數累計、最高分持久化及基於難度的動態速度計算
 */

import { CONFIG } from '../config.js';

export class ScoreSystem {
  /**
   * @param {Object} [diffConfig]
   */
  constructor(diffConfig = CONFIG.DIFFICULTIES[CONFIG.DEFAULT_DIFFICULTY]) {
    this.score = 0;
    this.highScore = this.loadHighScore();
    this.setDifficulty(diffConfig);
    this.timer = null;
  }

  /**
   * 設定當前難度配置
   * @param {Object} diffConfig
   */
  setDifficulty(diffConfig) {
    this.diffConfig = diffConfig;
    this.initialSpeed = diffConfig.INITIAL_SPEED;
    this.speedIncrement = diffConfig.SPEED_INCREMENT;
    this.speed = this.initialSpeed;
  }

  /**
   * 從 LocalStorage 載入最高紀錄
   * @returns {number}
   */
  loadHighScore() {
    try {
      return Number(localStorage.getItem(CONFIG.STORAGE_KEY)) || 0;
    } catch {
      return 0;
    }
  }

  /**
   * 格式化分數為 5 位數字串 (例如 "00125")
   * @param {number} num
   * @returns {string}
   */
  static formatScore(num) {
    return String(num).padStart(5, '0');
  }

  /**
   * 取得速度倍率字串 (例如 "1.0x", "1.7x")
   * @returns {string}
   */
  getSpeedMultiplier() {
    return (this.speed / this.initialSpeed).toFixed(1) + 'x';
  }

  /**
   * 啟動計分循環 (每 100ms +1 分並動態提高速度)
   * @param {Function} onTick 分數更新回呼
   */
  start(onTick) {
    this.stop();

    this.timer = setInterval(() => {
      this.score += 1;

      // 依當前難度係數，每 100 分增加速度
      this.speed =
        this.initialSpeed +
        Math.floor(this.score / CONFIG.SPEED_STEP_SCORE) * this.speedIncrement;

      if (typeof onTick === 'function') {
        onTick({
          score: this.score,
          formattedScore: ScoreSystem.formatScore(this.score),
          speed: this.speed,
          speedText: this.getSpeedMultiplier(),
        });
      }
    }, CONFIG.SCORE_INTERVAL_MS);
  }

  /**
   * 停止計分
   */
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * 重設當前分數與速度
   */
  reset() {
    this.stop();
    this.score = 0;
    this.speed = this.initialSpeed;
  }

  /**
   * 結算最高分
   * @returns {{ highScore: number, isNewRecord: boolean }}
   */
  recordHighScore() {
    let isNewRecord = false;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      isNewRecord = true;
      try {
        localStorage.setItem(CONFIG.STORAGE_KEY, String(this.highScore));
      } catch (err) {
        console.warn('無法寫入 LocalStorage:', err);
      }
    }
    return { highScore: this.highScore, isNewRecord };
  }
}
