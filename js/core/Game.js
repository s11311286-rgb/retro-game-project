/**
 * js/core/Game.js
 * 遊戲總協調器：管理實體、系統、狀態切換、三種難度等級、回合、音效與結算
 */

import {
  CANVAS_CONFIG,
  PIECE_TYPE,
  TURN_STATE,
  GAME_STATUS,
  RULES,
  STORAGE_KEYS,
  DIFFICULTY_CONFIG,
  DEFAULT_DIFFICULTY,
} from '../config.js';
import { Board } from '../entities/Board.js';
import { Player } from '../entities/Player.js';
import { AIPlayer } from '../entities/AIPlayer.js';
import { Physics } from '../systems/Physics.js';
import { ParticleSystem } from '../systems/ParticleSystem.js';
import { AudioSystem } from '../systems/AudioSystem.js';
import { HUD } from '../ui/HUD.js';
import { InputHandler } from './InputHandler.js';

export class Game {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {string} [initialDiffId] - 'EASY' | 'NORMAL' | 'HARD'，由選單傳入
   */
  constructor(canvas, initialDiffId) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // 確保解析度與配置一致
    this.canvas.width = CANVAS_CONFIG.WIDTH;
    this.canvas.height = CANVAS_CONFIG.HEIGHT;

    // 建立實體與系統
    this.board = new Board();
    this.player = new Player(7, 7);
    this.aiPlayer = new AIPlayer();
    this.particleSystem = new ParticleSystem();
    this.audio = new AudioSystem();
    this.hud = new HUD();

    // 難度狀態管理：優先使用選單傳入值，其次 LocalStorage，最後預設值
    this.currentDifficultyId =
      (initialDiffId && DIFFICULTY_CONFIG[initialDiffId])
        ? initialDiffId
        : (localStorage.getItem(STORAGE_KEYS.DIFFICULTY) || DEFAULT_DIFFICULTY);
    if (!DIFFICULTY_CONFIG[this.currentDifficultyId]) {
      this.currentDifficultyId = DEFAULT_DIFFICULTY;
    }
    this.currentDifficulty = DIFFICULTY_CONFIG[this.currentDifficultyId];


    // 遊戲狀態資料
    this.status = GAME_STATUS.IDLE;
    this.isPlayerTurn = true;
    this.score = 0;
    this.highScore = Number(localStorage.getItem(STORAGE_KEYS.HIGH_SCORE)) || 0;
    this.aiTimeoutId = null;

    // 綁定輸入處理器
    this.inputHandler = new InputHandler(this.canvas, {
      onMove: (dx, dy) => this.handleCursorMove(dx, dy),
      onCellClick: (gx, gy) => this.handleCellClick(gx, gy),
      onConfirm: () => this.handleConfirmPlace(),
      onRestart: () => this.handleRestartRequest(),
      onToggleSound: () => this.toggleSound(),
      onInteraction: () => this.audio.initContext(),
    });

    // 綁定 UI 按鈕
    this.hud.bindRestart(() => this.restart());
    this.hud.bindSoundToggle(() => this.toggleSound());
    this.hud.bindDifficultyToggle(() => this.cycleDifficulty());

    // 初始載入顯示、難度與音訊狀態
    this.hud.updateHighScore(this.highScore);
    this.hud.updateSoundStatus(this.audio.isMuted);
    this.hud.updateDifficulty(
      this.currentDifficulty.ID,
      this.currentDifficulty.LABEL,
      this.currentDifficulty.ICON
    );
  }

  /**
   * 循環切換難度 (簡單 -> 普通 -> 困難 -> 簡單)
   */
  cycleDifficulty() {
    const cycle = ['EASY', 'NORMAL', 'HARD'];
    const nextIdx = (cycle.indexOf(this.currentDifficultyId) + 1) % cycle.length;
    this.setDifficulty(cycle[nextIdx]);
  }

  /**
   * 設定當前難度
   * @param {string} diffId
   */
  setDifficulty(diffId) {
    if (!DIFFICULTY_CONFIG[diffId]) return;

    this.currentDifficultyId = diffId;
    this.currentDifficulty = DIFFICULTY_CONFIG[diffId];

    try {
      localStorage.setItem(STORAGE_KEYS.DIFFICULTY, diffId);
    } catch (e) {
      console.warn('無法儲存難度至 LocalStorage:', e);
    }

    this.hud.updateDifficulty(
      this.currentDifficulty.ID,
      this.currentDifficulty.LABEL,
      this.currentDifficulty.ICON
    );
  }

  /**
   * 切換音樂音效開關
   */
  toggleSound() {
    const isMuted = this.audio.toggleMute();
    this.hud.updateSoundStatus(isMuted);
  }

  /**
   * 重新開始一局全新遊戲
   */
  restart() {
    if (this.aiTimeoutId !== null) {
      clearTimeout(this.aiTimeoutId);
      this.aiTimeoutId = null;
    }

    this.board.reset();
    this.player.reset();
    this.particleSystem.clear();

    this.status = GAME_STATUS.PLAYING;
    this.isPlayerTurn = true;
    this.score = 0;

    this.hud.updateScore(this.score);
    this.hud.updateHighScore(this.highScore);
    this.hud.updateTurn(TURN_STATE.PLAYER);
    this.hud.hideGameOver();

    // 播放背景音樂
    this.audio.startBGM();
  }

  /**
   * 處理方向鍵 / WASD 移動游標
   * @param {number} dx
   * @param {number} dy
   */
  handleCursorMove(dx, dy) {
    if (!this.isPlayerTurn || this.status !== GAME_STATUS.PLAYING) return;
    this.player.move(dx, dy);
    this.audio.playCursorSound();
  }

  /**
   * 處理滑鼠點擊格子
   * @param {number} gx
   * @param {number} gy
   */
  handleCellClick(gx, gy) {
    if (!this.isPlayerTurn || this.status !== GAME_STATUS.PLAYING) return;
    if (!Physics.inside(gx, gy)) return;

    this.player.setPosition(gx, gy);
    this.executePlayerPlace(gx, gy);
  }

  /**
   * 處理鍵盤 Enter 鍵落子
   */
  handleConfirmPlace() {
    if (!this.isPlayerTurn || this.status !== GAME_STATUS.PLAYING) return;
    this.executePlayerPlace(this.player.gridX, this.player.gridY);
  }

  /**
   * 處理 Space 鍵請求重新開始
   */
  handleRestartRequest() {
    if (this.status !== GAME_STATUS.PLAYING) {
      this.restart();
    }
  }

  /**
   * 執行玩家落子邏輯
   * @param {number} gx
   * @param {number} gy
   */
  executePlayerPlace(gx, gy) {
    if (!this.board.isEmpty(gx, gy)) return;

    // 1. 放置黑棋並記錄最後一手
    this.board.setPiece(gx, gy, PIECE_TYPE.BLACK);
    this.audio.playMoveSound(true);

    // 2. 觸發落子反饋微粒
    const pos = Physics.gridToCanvas(gx, gy);
    this.particleSystem.emitPlacement(pos.x, pos.y, true);

    // 3. 計分與最高分更新
    this.score += RULES.SCORE_PER_MOVE;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      try {
        localStorage.setItem(STORAGE_KEYS.HIGH_SCORE, this.highScore);
      } catch (e) {
        // 忽略 Storage 配額異常
      }
      this.hud.updateHighScore(this.highScore);
    }
    this.hud.updateScore(this.score);

    // 4. 勝負檢定
    if (Physics.checkWin(this.board, gx, gy, PIECE_TYPE.BLACK)) {
      const line = Physics.getWinningLine(this.board, gx, gy, PIECE_TYPE.BLACK);
      this.board.setWinLine(line);
      this.audio.playWinSound();
      this.endGame(GAME_STATUS.WIN, pos.x, pos.y);
      return;
    }

    if (Physics.isBoardFull(this.board)) {
      this.endGame(GAME_STATUS.DRAW);
      return;
    }

    // 5. 切換為電腦回合
    this.isPlayerTurn = false;
    this.hud.updateTurn(TURN_STATE.COMPUTER);

    // 6. 排程電腦思考後下棋（依當前難度思考時間調節）
    this.aiTimeoutId = setTimeout(() => {
      this.executeAIMove();
    }, this.currentDifficulty.THINK_DELAY_MS);
  }

  /**
   * 執行電腦 AI 落子決策（套用當前難度策略）
   */
  executeAIMove() {
    if (this.status !== GAME_STATUS.PLAYING) return;

    const move = this.aiPlayer.computeBestMove(this.board, this.currentDifficulty);
    if (!move) {
      this.endGame(GAME_STATUS.DRAW);
      return;
    }

    // 1. 放置白棋並記錄最後一手
    this.board.setPiece(move.x, move.y, PIECE_TYPE.WHITE);
    this.audio.playMoveSound(false);

    // 2. 觸發落子微粒反饋
    const pos = Physics.gridToCanvas(move.x, move.y);
    this.particleSystem.emitPlacement(pos.x, pos.y, false);

    // 3. 勝負檢定
    if (Physics.checkWin(this.board, move.x, move.y, PIECE_TYPE.WHITE)) {
      const line = Physics.getWinningLine(this.board, move.x, move.y, PIECE_TYPE.WHITE);
      this.board.setWinLine(line);
      this.audio.playLoseSound();
      this.endGame(GAME_STATUS.LOSE, pos.x, pos.y);
      return;
    }

    if (Physics.isBoardFull(this.board)) {
      this.endGame(GAME_STATUS.DRAW);
      return;
    }

    // 4. 切換回玩家回合
    this.isPlayerTurn = true;
    this.hud.updateTurn(TURN_STATE.PLAYER);
  }

  /**
   * 遊戲結束結算
   * @param {string} status - GAME_STATUS.WIN, LOSE, 或 DRAW
   * @param {number} [effectX]
   * @param {number} [effectY]
   */
  endGame(status, effectX, effectY) {
    this.status = status;

    if (status === GAME_STATUS.WIN && effectX !== undefined && effectY !== undefined) {
      this.particleSystem.emitWin(effectX, effectY, this.canvas.width);
    }

    const diffBadge = `${this.currentDifficulty.ICON} ${this.currentDifficulty.LABEL}`;
    this.hud.showGameOver(status, this.score, diffBadge);
  }

  /**
   * 幀邏輯更新
   * @param {number} dt - 幀間隔秒數
   */
  update(dt) {
    this.board.update(dt);
    this.player.update(dt);
    this.particleSystem.update(dt);
  }

  /**
   * 幀畫面渲染
   */
  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 繪製棋盤、格線、棋子、最後一手標記與勝利連線
    this.board.render(this.ctx);

    // 繪製玩家選取框
    const isEnded = this.status !== GAME_STATUS.PLAYING;
    this.player.render(this.ctx, this.isPlayerTurn, isEnded);

    // 繪製粒子特效
    this.particleSystem.render(this.ctx);
  }
}
