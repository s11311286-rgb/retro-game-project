/**
 * js/main.js
 * 應用程式模組進入點：初始化 DOM、實例化各子系統並啟動遊戲協調器
 */

import { Game } from './core/Game.js';

function init() {
  const game = new Game();

  // 提供開發與測試除錯把手
  window.__DINO_GAME__ = game;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
