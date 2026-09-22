/**
 * js/ui/HUD.js
 * 抬頭顯示器與 UI 介面管理（得分、最高紀錄、回合狀態、結算對話框與音樂切換）
 */

import { TURN_STATE, GAME_STATUS } from '../config.js';

export class HUD {
  constructor() {
    this.scoreEl = document.getElementById('score');
    this.highEl = document.getElementById('high');
    this.turnEl = document.getElementById('turn');

    this.overEl = document.getElementById('over');
    this.resultEl = document.getElementById('result');
    this.msgEl = document.getElementById('msg');
    this.finalEl = document.getElementById('final');
    this.restartBtn = document.getElementById('restartBtn');
    this.soundBtn = document.getElementById('soundBtn');
  }

  /**
   * 更新當前分數顯示
   * @param {number} score
   */
  updateScore(score) {
    if (this.scoreEl) {
      this.scoreEl.textContent = score;
    }
  }

  /**
   * 更新最高紀錄顯示
   * @param {number} high
   */
  updateHighScore(high) {
    if (this.highEl) {
      this.highEl.textContent = high;
    }
  }

  /**
   * 更新回合指示文字
   * @param {string} turn - TURN_STATE.PLAYER 或 TURN_STATE.COMPUTER
   */
  updateTurn(turn) {
    if (this.turnEl) {
      this.turnEl.textContent = turn;
    }
  }

  /**
   * 更新音樂按鈕狀態
   * @param {boolean} isMuted
   */
  updateSoundStatus(isMuted) {
    if (this.soundBtn) {
      if (isMuted) {
        this.soundBtn.textContent = '🔇 靜音';
        this.soundBtn.classList.add('muted');
      } else {
        this.soundBtn.textContent = '🔊 音樂';
        this.soundBtn.classList.remove('muted');
      }
    }
  }

  /**
   * 綁定音樂切換按鈕事件
   * @param {function(): void} onToggle
   */
  bindSoundToggle(onToggle) {
    if (this.soundBtn) {
      this.soundBtn.onclick = onToggle;
    }
  }

  /**
   * 顯示遊戲結算對話框
   * @param {string} status - GAME_STATUS.WIN, LOSE, 或 DRAW
   * @param {number} finalScore
   */
  showGameOver(status, finalScore) {
    if (!this.overEl) return;

    if (this.finalEl) {
      this.finalEl.textContent = finalScore;
    }

    let title = 'GAME OVER';
    let message = '';

    if (status === GAME_STATUS.WIN) {
      title = 'YOU WIN!';
      message = '恭喜！你成功連成五子！';
    } else if (status === GAME_STATUS.LOSE) {
      title = 'GAME OVER';
      message = '電腦連成五子了！';
    } else {
      title = 'DRAW';
      message = '棋盤已滿，平手！';
    }

    if (this.resultEl) this.resultEl.textContent = title;
    if (this.msgEl) this.msgEl.textContent = message;

    this.overEl.classList.add('show');
  }

  /**
   * 隱藏結算彈窗
   */
  hideGameOver() {
    if (this.overEl) {
      this.overEl.classList.remove('show');
    }
  }

  /**
   * 綁定重新開始按鈕事件
   * @param {function(): void} onRestart
   */
  bindRestart(onRestart) {
    if (this.restartBtn) {
      this.restartBtn.onclick = onRestart;
    }
  }
}
