/**
 * js/ui/UIManager.js
 * 畫面 UI 介面管理器：負責 HUD 分數、速度顯示、難度切換、面板切換及日夜模式
 */

export class UIManager {
  constructor() {
    this.scoreElement = document.getElementById('score');
    this.highScoreElement = document.getElementById('highScore');
    this.finalScoreElement = document.getElementById('finalScore');
    this.speedTextElement = document.getElementById('speedText');
    this.startScreen = document.getElementById('startScreen');
    this.gameOverElement = document.getElementById('gameOver');
    this.restartBtn = document.getElementById('restartBtn');
    this.modeBtn = document.getElementById('modeBtn');

    this.difficultyBtns = document.querySelectorAll('.diff-btn');
    this.startDiffBadge = document.getElementById('startDiffBadge');
    this.overDiffBadge = document.getElementById('overDiffBadge');
  }

  /**
   * 更新即時分數
   * @param {string} formattedScore
   */
  setScore(formattedScore) {
    if (this.scoreElement) {
      this.scoreElement.textContent = formattedScore;
    }
  }

  /**
   * 更新最高紀錄
   * @param {string} formattedHighScore
   */
  setHighScore(formattedHighScore) {
    if (this.highScoreElement) {
      this.highScoreElement.textContent = formattedHighScore;
    }
  }

  /**
   * 更新速度倍率文字
   * @param {string} speedText
   */
  setSpeed(speedText) {
    if (this.speedTextElement) {
      this.speedTextElement.textContent = speedText;
    }
  }

  /**
   * 設定高亮當前難度
   * @param {string} diffId
   * @param {string} label
   * @param {string} icon
   */
  setActiveDifficulty(diffId, label, icon) {
    if (this.difficultyBtns) {
      this.difficultyBtns.forEach((btn) => {
        if (btn.dataset.diff === diffId) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }

    const badgeText = `${icon} ${label}`;
    if (this.startDiffBadge) {
      this.startDiffBadge.textContent = badgeText;
    }
    if (this.overDiffBadge) {
      this.overDiffBadge.textContent = badgeText;
    }
  }

  /**
   * 顯示開始畫面
   */
  showStartScreen() {
    if (this.startScreen) {
      this.startScreen.style.display = 'flex';
    }
  }

  /**
   * 隱藏開始畫面
   */
  hideStartScreen() {
    if (this.startScreen) {
      this.startScreen.style.display = 'none';
    }
  }

  /**
   * 顯示 Game Over 結算畫面
   * @param {string} formattedFinalScore
   */
  showGameOver(formattedFinalScore) {
    if (this.finalScoreElement) {
      this.finalScoreElement.textContent = formattedFinalScore;
    }
    if (this.gameOverElement) {
      this.gameOverElement.style.display = 'block';
    }
  }

  /**
   * 隱藏 Game Over 結算畫面
   */
  hideGameOver() {
    if (this.gameOverElement) {
      this.gameOverElement.style.display = 'none';
    }
  }

  /**
   * 檢查當前是否處於 Game Over 狀態
   * @returns {boolean}
   */
  isGameOverShowing() {
    return this.gameOverElement && this.gameOverElement.style.display === 'block';
  }

  /**
   * 切換日夜模式
   */
  toggleNight() {
    document.body.classList.toggle('night');
  }

  /**
   * 綁定 UI 元素上的點擊事件
   * @param {Object} handlers
   * @param {Function} handlers.onRestart
   * @param {Function} [handlers.onDifficultyChange]
   */
  bindEvents({ onRestart, onDifficultyChange }) {
    if (this.restartBtn) {
      this.restartBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof onRestart === 'function') {
          onRestart();
        }
      });
    }

    if (this.modeBtn) {
      this.modeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleNight();
      });
    }

    if (this.difficultyBtns) {
      this.difficultyBtns.forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const selectedDiff = btn.dataset.diff;
          if (typeof onDifficultyChange === 'function' && selectedDiff) {
            onDifficultyChange(selectedDiff);
          }
        });
      });
    }
  }
}
