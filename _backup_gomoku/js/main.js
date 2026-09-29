/**
 * js/main.js
 * 應用程式模組進入點：初始化 DOM、實例化各子系統並啟動遊戲循環
 */

import { Game } from './core/Game.js';
import { GameLoop } from './core/GameLoop.js';

function init() {
  const canvas = document.getElementById('board');
  if (!canvas) {
    console.error('找不到 #board 畫布節點，遊戲初始化中斷。');
    return;
  }

  // 實例化遊戲主協調器
  const game = new Game(canvas);

  // 實例化並綁定每幀循環
  const loop = new GameLoop(
    (dt) => game.update(dt),
    () => game.render()
  );

  // 初始化並啟動
  game.restart();
  loop.start();

  // 方便在開發控制台中除錯與驗證
  window.__GAME_INSTANCE__ = game;
  window.__GAME_LOOP__ = loop;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
