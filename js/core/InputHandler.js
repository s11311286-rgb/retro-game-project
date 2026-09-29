/**
 * js/core/InputHandler.js
 * 輸入控制處理器：整合鍵盤、滑鼠點擊與觸控手勢
 */

export class InputHandler {
  /**
   * @param {HTMLElement} gameContainer
   * @param {Object} callbacks
   */
  constructor(gameContainer, callbacks) {
    this.gameContainer = gameContainer;
    this.callbacks = callbacks;
    this.init();
  }

  init() {
    // 鍵盤按下事件
    document.addEventListener('keydown', (event) => {
      // Space / ArrowUp: 跳躍或重新開始
      if (event.code === 'Space' || event.code === 'ArrowUp') {
        event.preventDefault();

        if (this.callbacks.isGameOver()) {
          this.callbacks.onRestart();
          return;
        }

        this.callbacks.onJump();
      }

      // ArrowDown: 蹲下
      if (event.code === 'ArrowDown') {
        event.preventDefault();
        this.callbacks.onDuckStart();
      }

      // Enter: 開始或重新開始
      if (event.code === 'Enter' && !this.callbacks.isGameRunning()) {
        if (this.callbacks.isGameOver()) {
          this.callbacks.onRestart();
        } else {
          this.callbacks.onStart();
        }
      }
    });

    // 鍵盤放開事件
    document.addEventListener('keyup', (event) => {
      if (event.code === 'ArrowDown') {
        this.callbacks.onDuckEnd();
      }
    });

    // 滑鼠點擊遊戲畫面
    this.gameContainer.addEventListener('mousedown', () => {
      if (this.callbacks.isGameOver()) {
        this.callbacks.onRestart();
      } else {
        this.callbacks.onJump();
      }
    });

    // 手機觸控螢幕
    this.gameContainer.addEventListener('touchstart', (event) => {
      event.preventDefault();
      if (this.callbacks.isGameOver()) {
        this.callbacks.onRestart();
      } else {
        this.callbacks.onJump();
      }
    });
  }
}
