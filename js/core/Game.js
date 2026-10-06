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
import { InkLandscape } from '../systems/InkLandscape.js';
import { QiSystem } from '../systems/QiSystem.js';
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
    this.landscape = new InkLandscape(this.canvas.width, this.canvas.height);
    this.board = new Board();
    this.player = new Player(7, 7);
    this.aiPlayer = new AIPlayer();
    this.qiSystem = new QiSystem();
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
    this.aiCursor    = null;   // AI 游標動畫狀態

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
    this.aiCursor = null;

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
   * 電腦 AI 思考完畢 → 建立游標動畫，讓 AI 像真人一樣移動到落子位置
   */
  executeAIMove() {
    if (this.status !== GAME_STATUS.PLAYING) return;

    const move = this.aiPlayer.computeBestMove(this.board, this.currentDifficulty);
    if (!move) {
      this.endGame(GAME_STATUS.DRAW);
      return;
    }

    // 計算游標動畫起點（上一手落子位置，或棋盤中央）
    const last = this.board.lastMove;
    const startX = last ? last.x : 7;
    const startY = last ? last.y : 7;

    // 建立途徑點（EASY 會多繞幾個位置，NORMAL/HARD 直接移動）
    const waypoints = this._buildAIWaypoints(
      { x: startX, y: startY },
      { x: move.x, y: move.y }
    );

    // 每段移動時間（依難度調整速度感）
    const segMs = { EASY: 340, NORMAL: 240, HARD: 160 };
    const segDur = (segMs[this.currentDifficultyId] || 240) / 1000;

    // 落子前停頓時間
    const pauseMs = { EASY: 320, NORMAL: 220, HARD: 120 };
    const pauseDur = (pauseMs[this.currentDifficultyId] || 220) / 1000;

    this.aiCursor = {
      waypoints,
      wpIdx:        0,
      elapsed:      0,
      segDuration:  segDur,
      curX:         startX,
      curY:         startY,
      pausing:      false,
      pauseElapsed: 0,
      pauseDuration: pauseDur,
      move,
    };
  }

  /**
   * 建立 AI 游標路徑點
   * EASY：在目標附近多繞 1~2 個空格（看起來在猶豫）
   * NORMAL / HARD：直線移動
   */
  _buildAIWaypoints(start, target) {
    const waypoints = [start];

    if (this.currentDifficultyId === 'EASY') {
      // 隨機挑 1~2 個目標附近空格當中途點
      const candidates = [];
      for (let dy = -5; dy <= 5; dy++) {
        for (let dx = -5; dx <= 5; dx++) {
          const x = target.x + dx;
          const y = target.y + dy;
          if (x >= 0 && x < 15 && y >= 0 && y < 15 &&
              this.board.isEmpty(x, y) &&
              !(x === target.x && y === target.y)) {
            candidates.push({ x, y });
          }
        }
      }
      // 最多加 2 個中途點
      const count = 1 + Math.floor(Math.random() * 2);
      for (let i = 0; i < count && candidates.length > 0; i++) {
        const idx = Math.floor(Math.random() * candidates.length);
        waypoints.push(candidates.splice(idx, 1)[0]);
      }
    }

    waypoints.push(target);
    return waypoints;
  }

  /**
   * 每幀更新 AI 游標動畫
   */
  _updateAICursor(dt) {
    if (!this.aiCursor || this.status !== GAME_STATUS.PLAYING) return;
    const c = this.aiCursor;

    if (c.pausing) {
      c.pauseElapsed += dt;
      if (c.pauseElapsed >= c.pauseDuration) {
        this._finalizeAIMove(c.move);
        this.aiCursor = null;
      }
      return;
    }

    c.elapsed += dt;
    const t    = Math.min(1, c.elapsed / c.segDuration);
    const ease = this._easeInOut(t);

    const from = c.waypoints[c.wpIdx];
    const to   = c.waypoints[c.wpIdx + 1];
    c.curX = from.x + (to.x - from.x) * ease;
    c.curY = from.y + (to.y - from.y) * ease;

    if (t >= 1) {
      c.wpIdx++;
      c.elapsed = 0;
      if (c.wpIdx >= c.waypoints.length - 1) {
        // 到達目標格，開始落子前停頓
        c.curX   = to.x;
        c.curY   = to.y;
        c.pausing = true;
        c.pauseElapsed = 0;
      }
    }
  }

  /**
   * 實際放置白棋、播放音效、觸發特效、判斷勝負
   */
  _finalizeAIMove(move) {
    if (this.status !== GAME_STATUS.PLAYING) return;

    this.board.setPiece(move.x, move.y, PIECE_TYPE.WHITE);
    this.audio.playMoveSound(false);

    const pos = Physics.gridToCanvas(move.x, move.y);
    this.particleSystem.emitPlacement(pos.x, pos.y, false);

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

    this.isPlayerTurn = true;
    this.hud.updateTurn(TURN_STATE.PLAYER);
  }

  /** 緩入緩出插值 (t: 0→1) */
  _easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
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
    this.landscape.update(dt);
    this.board.update(dt);
    this.qiSystem.update(dt);
    this.player.update(dt);
    this.particleSystem.update(dt);
    this._updateAICursor(dt);
  }

  /**
   * 幀畫面渲染：
   * 1. 溫潤宣紙山水長卷動態背景（遠山、流水、飛鳥、竹影）
   * 2. 棋盤水墨格線與星位
   * 3. 局勢提示：黑白二氣流動相連與陰陽交鋒氣旋
   * 4. 棋子實體、最後一手硃砂落款、五連珠書法揮毫
   * 5. AI 與玩家游標
   * 6. 水墨入水漣漪擴散與落子墨筋拉絲炸裂反饋
   */
  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 1. 水墨山水長卷動態背景
    this.landscape.render(this.ctx);

    // 2. 棋盤水墨格線與星位定位點
    this.board.renderGrid(this.ctx);

    // 3. 局勢提示：水墨「氣」流湧動（同色相連牽引、黑白交鋒氣旋）
    this.qiSystem.render(this.ctx, this.board);

    // 4. 棋子實體、最後一手硃砂落款、五連珠書法墨線
    this.board.renderPieces(this.ctx);

    // 5. 繪製 AI 游標（AI 落子動畫中才顯示）
    if (this.aiCursor) {
      this.board.renderAICursor(
        this.ctx,
        this.aiCursor.curX,
        this.aiCursor.curY,
        this.board.pulseTimer,
        this.aiCursor.pausing
      );
    }

    // 6. 繪製玩家選取框
    const isEnded = this.status !== GAME_STATUS.PLAYING;
    this.player.render(this.ctx, this.isPlayerTurn, isEnded);

    // 7. 繪製落子水墨漣漪、墨筋拉絲炸裂與勝利飛花
    this.particleSystem.render(this.ctx);
  }
}
