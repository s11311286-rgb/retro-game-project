/**
 * js/core/GameLoop.js
 * 遊戲主循環：基於 requestAnimationFrame 與固定時間步長 (Fixed Time Step) 驅動更新
 */

export class GameLoop {
  /**
   * @param {Function} updateFn 每步邏輯更新 (步長約 20ms)
   */
  constructor(updateFn) {
    this.updateFn = updateFn;
    this.isRunning = false;
    this.rafId = null;
    this.lastTime = 0;
    this.accumulator = 0;
    this.timeStep = 20; // 與原版 setInterval 20ms 步調完全一致
  }

  /**
   * 啟動主循環
   */
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.accumulator = 0;

    const frame = (now) => {
      if (!this.isRunning) return;

      const delta = Math.min(now - this.lastTime, 100); // 避免分頁切換時螺旋累積
      this.lastTime = now;
      this.accumulator += delta;

      while (this.accumulator >= this.timeStep) {
        this.updateFn();
        this.accumulator -= this.timeStep;
      }

      this.rafId = requestAnimationFrame(frame);
    };

    this.rafId = requestAnimationFrame(frame);
  }

  /**
   * 停止主循環
   */
  stop() {
    this.isRunning = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
}
