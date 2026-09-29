/**
 * js/core/GameLoop.js
 * 核心遊戲主循環，基於 requestAnimationFrame 並提供精確的 Delta Time (dt)
 */

export class GameLoop {
  /**
   * @param {function(number): void} updateFn - 每幀更新邏輯，接收 dt (秒)
   * @param {function(): void} renderFn - 每幀繪製回呼
   */
  constructor(updateFn, renderFn) {
    this.updateFn = updateFn;
    this.renderFn = renderFn;
    this.lastTime = 0;
    this.animationFrameId = null;
    this.isRunning = false;

    this._loop = this._loop.bind(this);
  }

  /**
   * 啟動主循環
   */
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.animationFrameId = requestAnimationFrame(this._loop);
  }

  /**
   * 停止主循環
   */
  stop() {
    if (!this.isRunning) return;
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * 內部循環幀處理
   * @private
   * @param {DOMHighResTimeStamp} currentTime
   */
  _loop(currentTime) {
    if (!this.isRunning) return;

    // 計算幀間隔 dt（秒），並限制最大間隔防止切換分頁後的累積躍進
    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    if (typeof this.updateFn === 'function') {
      this.updateFn(dt);
    }

    if (typeof this.renderFn === 'function') {
      this.renderFn();
    }

    this.animationFrameId = requestAnimationFrame(this._loop);
  }
}
