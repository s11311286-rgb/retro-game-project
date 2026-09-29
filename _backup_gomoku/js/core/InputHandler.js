/**
 * js/core/InputHandler.js
 * 集中監聽與分發使用者輸入事件（鍵盤、滑鼠、音樂開關），包含畫布座標轉換與音訊解鎖觸發
 */

import { GRID_CONFIG } from '../config.js';

export class InputHandler {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {Object} listeners
   * @param {function(number, number): void} [listeners.onMove] - 游標移動 (dx, dy)
   * @param {function(number, number): void} [listeners.onCellClick] - 點擊網格 (gridX, gridY)
   * @param {function(): void} [listeners.onConfirm] - Enter 確認落子
   * @param {function(): void} [listeners.onRestart] - Space 重新開始
   * @param {function(): void} [listeners.onToggleSound] - M 鍵切換音效
   * @param {function(): void} [listeners.onInteraction] - 任意互動解鎖音訊
   */
  constructor(canvas, listeners = {}) {
    this.canvas = canvas;
    this.listeners = listeners;

    this._onCanvasClick = this._onCanvasClick.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);

    this._attachEvents();
  }

  _attachEvents() {
    this.canvas.addEventListener('click', this._onCanvasClick);
    window.addEventListener('keydown', this._onKeyDown);
  }

  /**
   * 釋放所有事件監聽
   */
  destroy() {
    this.canvas.removeEventListener('click', this._onCanvasClick);
    window.removeEventListener('keydown', this._onKeyDown);
  }

  /**
   * 處理 Canvas 點擊事件，校準視窗與畫布解析度差異
   * @param {MouseEvent} e
   */
  _onCanvasClick(e) {
    if (this.listeners.onInteraction) {
      this.listeners.onInteraction();
    }

    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;

    const canvasX = (e.clientX - rect.left) * scaleX;
    const canvasY = (e.clientY - rect.top) * scaleY;

    const gridX = Math.round((canvasX - GRID_CONFIG.OFFSET) / GRID_CONFIG.CELL_SIZE);
    const gridY = Math.round((canvasY - GRID_CONFIG.OFFSET) / GRID_CONFIG.CELL_SIZE);

    if (this.listeners.onCellClick) {
      this.listeners.onCellClick(gridX, gridY);
    }
  }

  /**
   * 處理鍵盤導航與快捷操作
   * @param {KeyboardEvent} e
   */
  _onKeyDown(e) {
    if (this.listeners.onInteraction) {
      this.listeners.onInteraction();
    }

    const key = e.key.toLowerCase();

    // M 鍵切換音樂音效
    if (key === 'm') {
      if (this.listeners.onToggleSound) {
        e.preventDefault();
        this.listeners.onToggleSound();
        return;
      }
    }

    // 重新開始鍵
    if (e.code === 'Space') {
      if (this.listeners.onRestart) {
        e.preventDefault();
        this.listeners.onRestart();
        return;
      }
    }

    // Enter 落子鍵
    if (e.key === 'Enter') {
      if (this.listeners.onConfirm) {
        e.preventDefault();
        this.listeners.onConfirm();
        return;
      }
    }

    // WASD 與方向鍵導航
    let dx = 0;
    let dy = 0;

    if (key === 'arrowup' || key === 'w') {
      dy = -1;
    } else if (key === 'arrowdown' || key === 's') {
      dy = 1;
    } else if (key === 'arrowleft' || key === 'a') {
      dx = -1;
    } else if (key === 'arrowright' || key === 'd') {
      dx = 1;
    }

    if ((dx !== 0 || dy !== 0) && this.listeners.onMove) {
      e.preventDefault();
      this.listeners.onMove(dx, dy);
    }
  }
}
