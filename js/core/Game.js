/**
 * js/core/Game.js
 * 遊戲主協調器：統整生命週期、子系統運作、難度切換、實體互動與事件回呼
 */

import { CONFIG } from '../config.js';
import { Dino } from '../entities/Dino.js';
import { ObstacleManager } from '../entities/ObstacleManager.js';
import { CollisionSystem } from '../systems/CollisionSystem.js';
import { ScoreSystem } from '../systems/ScoreSystem.js';
import { UIManager } from '../ui/UIManager.js';
import { InputHandler } from './InputHandler.js';
import { GameLoop } from './GameLoop.js';

export class Game {
  constructor() {
    this.gameContainer = document.getElementById('game');
    const dinoElement = document.getElementById('dino');

    // 載入當前難度
    this.currentDifficultyId =
      localStorage.getItem(CONFIG.DIFFICULTY_STORAGE_KEY) || CONFIG.DEFAULT_DIFFICULTY;
    if (!CONFIG.DIFFICULTIES[this.currentDifficultyId]) {
      this.currentDifficultyId = CONFIG.DEFAULT_DIFFICULTY;
    }
    this.currentDifficulty = CONFIG.DIFFICULTIES[this.currentDifficultyId];

    // 初始化實體與系統
    this.dino = new Dino(dinoElement);
    this.obstacleManager = new ObstacleManager(this.gameContainer, this.currentDifficulty);
    this.scoreSystem = new ScoreSystem(this.currentDifficulty);
    this.ui = new UIManager();
    this.gameLoop = new GameLoop(() => this.update());

    this.gameRunning = false;
    this.obstacleTimer = null;

    this.init();
  }

  /**
   * 初始化設定與輸入綁定
   */
  init() {
    // 初始化最高分與儀表板資訊
    this.ui.setHighScore(ScoreSystem.formatScore(this.scoreSystem.highScore));
    this.ui.setScore('00000');
    this.ui.setSpeed('1.0x');
    this.ui.setActiveDifficulty(
      this.currentDifficulty.ID,
      this.currentDifficulty.LABEL,
      this.currentDifficulty.ICON
    );

    // 綁定 UI 專屬按鈕事件
    this.ui.bindEvents({
      onRestart: () => this.restart(),
      onDifficultyChange: (diffId) => this.setDifficulty(diffId),
    });

    // 整合使用者輸入事件
    this.inputHandler = new InputHandler(this.gameContainer, {
      onJump: () => this.handleJump(),
      onDuckStart: () => this.dino.duckStart(),
      onDuckEnd: () => this.dino.duckEnd(),
      onStart: () => this.start(),
      onRestart: () => this.restart(),
      isGameOver: () => this.ui.isGameOverShowing(),
      isGameRunning: () => this.gameRunning,
    });
  }

  /**
   * 切換遊戲難度
   * @param {string} diffId
   */
  setDifficulty(diffId) {
    if (!CONFIG.DIFFICULTIES[diffId]) return;

    this.currentDifficultyId = diffId;
    this.currentDifficulty = CONFIG.DIFFICULTIES[diffId];

    try {
      localStorage.setItem(CONFIG.DIFFICULTY_STORAGE_KEY, diffId);
    } catch (e) {
      console.warn('無法儲存難度設定至 LocalStorage:', e);
    }

    // 更新子系統設定
    this.scoreSystem.setDifficulty(this.currentDifficulty);
    this.obstacleManager.setDifficulty(this.currentDifficulty);

    // 更新 UI 標籤
    this.ui.setActiveDifficulty(
      this.currentDifficulty.ID,
      this.currentDifficulty.LABEL,
      this.currentDifficulty.ICON
    );

    // 若遊戲進行中切換難度，則重新開始本局
    if (this.gameRunning) {
      this.restart();
    }
  }

  /**
   * 處理跳躍動作（若尚未開始則啟動遊戲）
   */
  handleJump() {
    if (!this.gameRunning) {
      this.start();
      return;
    }
    this.dino.jump();
  }

  /**
   * 開始遊戲
   */
  start() {
    if (this.gameRunning) return;

    this.gameRunning = true;

    // 面板狀態切換
    this.ui.hideStartScreen();
    this.ui.hideGameOver();

    // 恐龍狀態初始化
    this.dino.reset();
    this.dino.startRunning();

    // 計分系統初始化（套用當前難度）
    this.scoreSystem.reset();
    this.ui.setScore('00000');
    this.ui.setSpeed('1.0x');

    this.scoreSystem.start(({ formattedScore, speedText }) => {
      this.ui.setScore(formattedScore);
      this.ui.setSpeed(speedText);
    });

    // 啟動主循環
    this.gameLoop.start();

    // 稍候 1 秒生成首個障礙物
    this.obstacleTimer = setTimeout(() => {
      this.scheduleNextObstacle();
    }, CONFIG.OBSTACLE.INITIAL_DELAY_MS);
  }

  /**
   * 週期性安排下一個障礙物生成（依當前難度動態調節生成頻率）
   */
  scheduleNextObstacle() {
    if (!this.gameRunning) return;

    this.obstacleManager.spawn();

    // 分數越高，間隔越短；不同難度擁有不同基準與最低延遲
    const delay = Math.max(
      this.currentDifficulty.MIN_DELAY_MS,
      this.currentDifficulty.BASE_DELAY_MS - this.scoreSystem.score * CONFIG.OBSTACLE.DELAY_FACTOR
    );

    this.obstacleTimer = setTimeout(() => {
      this.scheduleNextObstacle();
    }, delay);
  }

  /**
   * 每幀邏輯更新（位移與碰撞偵測）
   */
  update() {
    if (!this.gameRunning) return;

    // 更新障礙物位置
    this.obstacleManager.update(this.scoreSystem.speed);

    // 執行 AABB 碰撞檢查
    const hasCollision = CollisionSystem.check(
      this.dino,
      this.obstacleManager.getActiveObstacles()
    );

    if (hasCollision) {
      this.gameOver();
    }
  }

  /**
   * 遊戲結束結算
   */
  gameOver() {
    if (!this.gameRunning) return;

    this.gameRunning = false;

    // 清除計時器與主循環
    if (this.obstacleTimer) {
      clearTimeout(this.obstacleTimer);
      this.obstacleTimer = null;
    }
    this.scoreSystem.stop();
    this.gameLoop.stop();

    // 停止恐龍奔跑
    this.dino.stopRunning();

    // 移除場景上障礙物
    this.obstacleManager.clear();

    // 結算分數與記錄歷史最高分
    const { highScore } = this.scoreSystem.recordHighScore();
    this.ui.setHighScore(ScoreSystem.formatScore(highScore));
    this.ui.showGameOver(ScoreSystem.formatScore(this.scoreSystem.score));
  }

  /**
   * 重新開始遊戲
   */
  restart() {
    if (this.obstacleTimer) {
      clearTimeout(this.obstacleTimer);
      this.obstacleTimer = null;
    }
    this.scoreSystem.stop();
    this.gameLoop.stop();
    this.obstacleManager.clear();
    this.dino.reset();
    this.ui.hideGameOver();
    this.gameRunning = false;

    this.start();
  }
}
