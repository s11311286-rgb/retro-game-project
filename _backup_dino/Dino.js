/**
 * js/entities/Dino.js
 * 恐龍主角實體：管理跑步、跳躍、蹲下狀態與 DOM 動畫 Class
 */

import { CONFIG } from '../config.js';

export class Dino {
  constructor(element) {
    this.element = element;
    this.jumping = false;
    this.ducking = false;
    this.running = false;
    this.jumpTimer = null;
  }

  /**
   * 恐龍開始跑步
   */
  startRunning() {
    this.running = true;
    this.element.classList.add('running');
  }

  /**
   * 恐龍停止跑步
   */
  stopRunning() {
    this.running = false;
    this.element.classList.remove('running');
  }

  /**
   * 執行跳躍
   * @returns {boolean} 是否成功觸發跳躍
   */
  jump() {
    if (this.jumping || this.ducking || !this.running) {
      return false;
    }

    this.jumping = true;
    this.element.classList.add('jump');

    if (this.jumpTimer) {
      clearTimeout(this.jumpTimer);
    }

    this.jumpTimer = setTimeout(() => {
      this.element.classList.remove('jump');
      this.jumping = false;
      this.jumpTimer = null;
    }, CONFIG.JUMP_DURATION_MS);

    return true;
  }

  /**
   * 蹲下姿態
   */
  duckStart() {
    if (!this.running || this.jumping) {
      return;
    }
    this.ducking = true;
    this.element.classList.add('duck');
  }

  /**
   * 解除蹲下
   */
  duckEnd() {
    this.ducking = false;
    this.element.classList.remove('duck');
  }

  /**
   * 重設恐龍狀態與所有類別
   */
  reset() {
    if (this.jumpTimer) {
      clearTimeout(this.jumpTimer);
      this.jumpTimer = null;
    }
    this.jumping = false;
    this.ducking = false;
    this.running = false;
    this.element.classList.remove('jump', 'duck', 'running');
  }

  /**
   * 取得恐龍邊界盒
   * @returns {DOMRect}
   */
  getRect() {
    return this.element.getBoundingClientRect();
  }
}
