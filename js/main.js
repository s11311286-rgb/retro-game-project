/**
 * js/main.js
 * 應用程式模組進入點：顯示難度選單，選擇後初始化遊戲並啟動循環
 */

import { Game } from './core/Game.js';
import { GameLoop } from './core/GameLoop.js';

let game = null;
let loop = null;

/**
 * 啟動遊戲（選單選完難度後呼叫）
 * @param {string} diffId - 'EASY' | 'NORMAL' | 'HARD'
 */
function startGame(diffId) {
  const menuEl   = document.getElementById('menu');
  const gameArea = document.getElementById('gameArea');

  // 隱藏選單、顯示遊戲區
  menuEl.classList.add('hidden');
  gameArea.style.display = '';

  const canvas = document.getElementById('board');
  if (!canvas) {
    console.error('找不到 #board 畫布節點，遊戲初始化中斷。');
    return;
  }

  if (game) {
    // 若已有實例（從結算畫面返回選單再重選），先設定新難度並重啟
    game.setDifficulty(diffId);
    game.restart();
  } else {
    // 第一次進入
    game = new Game(canvas, diffId);
    loop = new GameLoop(
      (dt) => game.update(dt),
      () => game.render()
    );
    loop.start();

    // 綁定結算面板「返回選單」按鈕
    const menuBtn = document.getElementById('menuBtn');
    if (menuBtn) {
      menuBtn.addEventListener('click', () => returnToMenu());
    }

    window.__GAME_INSTANCE__ = game;
    window.__GAME_LOOP__ = loop;
  }

  game.restart();
}

/**
 * 從結算畫面返回選單
 */
function returnToMenu() {
  const menuEl   = document.getElementById('menu');
  const gameArea = document.getElementById('gameArea');
  const overEl   = document.getElementById('over');

  // 隱藏結算與遊戲，顯示選單
  overEl.classList.remove('show');
  gameArea.style.display = 'none';
  menuEl.classList.remove('hidden');
}

function init() {
  // 綁定三張難度卡片
  document.querySelectorAll('.diff-card').forEach((btn) => {
    btn.addEventListener('click', () => {
      const diffId = btn.dataset.diff; // 'EASY' | 'NORMAL' | 'HARD'
      startGame(diffId);
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
