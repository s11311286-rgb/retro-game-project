/**
 * js/entities/Board.js
 * 棋盤實體：負責 15x15 矩陣資料管理、棋盤格線、星位、黑白棋子、最後落子標記與勝利連線渲染
 */

import { Entity } from './Entity.js';
import { GRID_CONFIG, CANVAS_CONFIG, THEME, PIECE_TYPE } from '../config.js';

export class Board extends Entity {
  constructor() {
    super(0, 0);
    this.size = GRID_CONFIG.SIZE;
    this.grid = [];
    this.lastMove = null; // { x, y, type }
    this.winLine = null;  // Array<{ x, y }>
    this.pulseTimer = 0;
    this.reset();
  }

  /**
   * 重設棋盤矩陣與視覺標記
   */
  reset() {
    this.grid = Array.from({ length: this.size }, () => Array(this.size).fill(PIECE_TYPE.EMPTY));
    this.lastMove = null;
    this.winLine = null;
    this.pulseTimer = 0;
  }

  /**
   * 記錄最後一手落子座標
   * @param {number} x
   * @param {number} y
   * @param {number} type
   */
  setLastMove(x, y, type) {
    this.lastMove = { x, y, type };
  }

  /**
   * 設定勝利五連線座標序列
   * @param {Array<{x: number, y: number}>|null} line
   */
  setWinLine(line) {
    this.winLine = line;
  }

  /**
   * 取得指定座標之棋子狀態
   * @param {number} x
   * @param {number} y
   * @returns {number}
   */
  getPiece(x, y) {
    if (x >= 0 && x < this.size && y >= 0 && y < this.size) {
      return this.grid[y][x];
    }
    return PIECE_TYPE.EMPTY;
  }

  /**
   * 放置棋子
   * @param {number} x
   * @param {number} y
   * @param {number} type
   */
  setPiece(x, y, type) {
    if (x >= 0 && x < this.size && y >= 0 && y < this.size) {
      this.grid[y][x] = type;
      this.setLastMove(x, y, type);
    }
  }

  /**
   * 指定座標是否為空位
   * @param {number} x
   * @param {number} y
   * @returns {boolean}
   */
  isEmpty(x, y) {
    return this.getPiece(x, y) === PIECE_TYPE.EMPTY;
  }

  /**
   * 邏輯更新（驅動光圈呼吸動畫）
   * @param {number} dt
   */
  update(dt) {
    this.pulseTimer += dt * 4;
  }

  /**
   * 繪製棋盤、格線、星位、棋子、最後一手標記與勝利連線
   * @param {CanvasRenderingContext2D} ctx
   */
  render(ctx) {
    const { OFFSET, CELL_SIZE, SIZE, STAR_POINTS, STAR_POINT_RADIUS } = GRID_CONFIG;
    const { WIDTH, HEIGHT } = CANVAS_CONFIG;

    // 1. 棋盤底色
    ctx.fillStyle = THEME.BOARD_BG;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // 2. 棋盤格線
    ctx.strokeStyle = THEME.GRID_LINE;
    ctx.lineWidth = 2;

    const maxCoord = OFFSET + (SIZE - 1) * CELL_SIZE;

    for (let i = 0; i < SIZE; i++) {
      const pos = OFFSET + i * CELL_SIZE;

      // 橫線
      ctx.beginPath();
      ctx.moveTo(OFFSET, pos);
      ctx.lineTo(maxCoord, pos);
      ctx.stroke();

      // 直線
      ctx.beginPath();
      ctx.moveTo(pos, OFFSET);
      ctx.lineTo(pos, maxCoord);
      ctx.stroke();
    }

    // 3. 星位定位點
    ctx.fillStyle = THEME.STAR_POINT;
    for (let i = 0; i < STAR_POINTS.length; i++) {
      const [sx, sy] = STAR_POINTS[i];
      const px = OFFSET + sx * CELL_SIZE;
      const py = OFFSET + sy * CELL_SIZE;

      ctx.beginPath();
      ctx.arc(px, py, STAR_POINT_RADIUS, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. 繪製棋子
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        const piece = this.grid[y][x];
        if (piece !== PIECE_TYPE.EMPTY) {
          this._renderPiece(ctx, x, y, piece);
        }
      }
    }

    // 5. 繪製最後一手落子標記 (Last Move Marker)
    if (this.lastMove) {
      this._renderLastMoveMarker(ctx, this.lastMove.x, this.lastMove.y, this.lastMove.type);
    }

    // 6. 繪製五連珠獲勝連線 (Winning Line Highlight)
    if (this.winLine && this.winLine.length >= 2) {
      this._renderWinningLine(ctx, this.winLine);
    }
  }

  /**
   * 繪製單枚棋子（帶放射漸層光暈）
   * @private
   */
  _renderPiece(ctx, x, y, pieceType) {
    const { OFFSET, CELL_SIZE } = GRID_CONFIG;
    const { PIECE_RADIUS, PLAYER_PIECE, AI_PIECE } = THEME;

    const px = OFFSET + x * CELL_SIZE;
    const py = OFFSET + y * CELL_SIZE;
    const r  = PIECE_RADIUS;
    const isPlayer = pieceType === PIECE_TYPE.BLACK;

    // 外部柔光環
    const glowColor = isPlayer ? 'rgba(100,180,100,0.18)' : 'rgba(255,240,160,0.18)';
    const glowGrad = ctx.createRadialGradient(px, py, r * 0.6, px, py, r * 1.6);
    glowGrad.addColorStop(0, glowColor);
    glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath();
    ctx.arc(px, py, r * 1.6, 0, Math.PI * 2);
    ctx.fillStyle = glowGrad;
    ctx.fill();

    // 棋子主體（放射漸層）
    const hiX = px - r * 0.28;
    const hiY = py - r * 0.28;
    const grad = ctx.createRadialGradient(hiX, hiY, r * 0.05, px, py, r);
    if (isPlayer) {
      grad.addColorStop(0, '#6a7a6a');
      grad.addColorStop(0.4, '#2a2e2a');
      grad.addColorStop(1, '#0d100d');
    } else {
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.4, '#e0dcc8');
      grad.addColorStop(1, '#aaa898');
    }

    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // 輪廓
    const style = isPlayer ? PLAYER_PIECE : AI_PIECE;
    ctx.strokeStyle = style.STROKE;
    ctx.lineWidth = style.LINE_WIDTH;
    ctx.stroke();

    // 高光反射小圓點
    const hlX = px - r * 0.3;
    const hlY = py - r * 0.32;
    const hlR = r * 0.22;
    const hlGrad = ctx.createRadialGradient(hlX, hlY, 0, hlX, hlY, hlR);
    hlGrad.addColorStop(0, isPlayer ? 'rgba(255,255,255,0.38)' : 'rgba(255,255,255,0.65)');
    hlGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.beginPath();
    ctx.arc(hlX, hlY, hlR, 0, Math.PI * 2);
    ctx.fillStyle = hlGrad;
    ctx.fill();
  }

  /**
   * 繪製最後一手提示光環（紅心點與呼吸外環）
   * @private
   */
  _renderLastMoveMarker(ctx, x, y, type) {
    const { OFFSET, CELL_SIZE } = GRID_CONFIG;
    const px = OFFSET + x * CELL_SIZE;
    const py = OFFSET + y * CELL_SIZE;

    ctx.save();
    const isPlayer = type === PIECE_TYPE.BLACK;
    const markerColor = isPlayer ? '#e74c3c' : '#c0392b';

    // 中心小紅點
    ctx.beginPath();
    ctx.arc(px, py, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = markerColor;
    ctx.fill();

    // 呼吸動態外環 (半徑 8 ~ 11px)
    const ringRadius = 9 + Math.sin(this.pulseTimer) * 2;
    ctx.beginPath();
    ctx.arc(px, py, ringRadius, 0, Math.PI * 2);
    ctx.strokeStyle = markerColor;
    ctx.lineWidth = 1.8;
    ctx.globalAlpha = 0.75 + Math.sin(this.pulseTimer) * 0.25;
    ctx.stroke();

    ctx.restore();
  }

  /**
   * 繪製五子連線金色光芒特效（呼吸閃爍動畫）
   * @private
   */
  _renderWinningLine(ctx, line) {
    const { OFFSET, CELL_SIZE } = GRID_CONFIG;
    const start = line[0];
    const end   = line[line.length - 1];

    const sx = OFFSET + start.x * CELL_SIZE;
    const sy = OFFSET + start.y * CELL_SIZE;
    const ex = OFFSET + end.x   * CELL_SIZE;
    const ey = OFFSET + end.y   * CELL_SIZE;

    // 呼吸係數 0.0 ~ 1.0
    const pulse = 0.5 + Math.sin(this.pulseTimer * 2.5) * 0.5;

    ctx.save();

    // 1. 最外層大光暈
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.strokeStyle = `rgba(255, 215, 0, ${0.12 + pulse * 0.18})`;
    ctx.lineWidth = 22;
    ctx.lineCap = 'round';
    ctx.stroke();

    // 2. 中層發光
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.strokeStyle = `rgba(255, 215, 0, ${0.3 + pulse * 0.25})`;
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.stroke();

    // 3. 亮金核心
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.strokeStyle = `rgba(255, 240, 80, ${0.7 + pulse * 0.3})`;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.stroke();

    // 4. 每個勝利棋子周圍金色呼吸環
    line.forEach(({ x, y }) => {
      const px = OFFSET + x * CELL_SIZE;
      const py = OFFSET + y * CELL_SIZE;

      // 外環
      ctx.beginPath();
      ctx.arc(px, py, THEME.PIECE_RADIUS + 3 + pulse * 3, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 215, 0, ${0.5 + pulse * 0.4})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // 內光暈
      const grd = ctx.createRadialGradient(px, py, 0, px, py, THEME.PIECE_RADIUS + 6);
      grd.addColorStop(0, `rgba(255, 240, 100, ${0.25 + pulse * 0.2})`);
      grd.addColorStop(1, 'rgba(255, 215, 0, 0)');
      ctx.beginPath();
      ctx.arc(px, py, THEME.PIECE_RADIUS + 6, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();
    });

    ctx.restore();
  }

  /**
   * 繪製 AI 游標：一個滑動的白色發光圓環，模擬真人手指移到落子位置
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} gridX  浮點格座標 X（支援插值位置）
   * @param {number} gridY  浮點格座標 Y
   * @param {number} pulseT 動畫計時器
   * @param {boolean} isArrived 是否已到達目標格（顯示落子前停頓動畫）
   */
  renderAICursor(ctx, gridX, gridY, pulseT, isArrived) {
    const { OFFSET, CELL_SIZE } = GRID_CONFIG;
    const px = OFFSET + gridX * CELL_SIZE;
    const py = OFFSET + gridY * CELL_SIZE;

    // 呼吸值：移動中微幅脈動，到達後強烈脈動
    const beatSpeed = isArrived ? 8 : 3;
    const beat = 0.5 + Math.sin(pulseT * beatSpeed) * 0.5;

    ctx.save();

    // 1. 外層大光暈（到達時明顯擴張）
    const glowR = isArrived ? 20 + beat * 6 : 18;
    const glowAlpha = isArrived ? 0.18 + beat * 0.2 : 0.12;
    const glowGrad = ctx.createRadialGradient(px, py, 0, px, py, glowR);
    glowGrad.addColorStop(0, `rgba(220, 230, 255, ${glowAlpha})`);
    glowGrad.addColorStop(1, 'rgba(180, 200, 255, 0)');
    ctx.beginPath();
    ctx.arc(px, py, glowR, 0, Math.PI * 2);
    ctx.fillStyle = glowGrad;
    ctx.fill();

    // 2. 主圓環（移動中為細環，到達時加粗並呼吸縮放）
    const ringR = isArrived ? 13 + beat * 3 : 12;
    ctx.beginPath();
    ctx.arc(px, py, ringR, 0, Math.PI * 2);
    ctx.strokeStyle = isArrived
      ? `rgba(255, 255, 220, ${0.7 + beat * 0.3})`
      : 'rgba(220, 220, 255, 0.75)';
    ctx.lineWidth = isArrived ? 2.5 : 1.8;
    ctx.stroke();

    // 3. 內環（到達時才顯示）
    if (isArrived) {
      ctx.beginPath();
      ctx.arc(px, py, 7 + beat * 2, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 255, 180, ${0.5 + beat * 0.4})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // 4. 中心小點（十字準心感）
    ctx.beginPath();
    ctx.arc(px, py, isArrived ? 2 + beat : 2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${isArrived ? 0.7 + beat * 0.3 : 0.6})`;
    ctx.fill();

    // 5. 移動中顯示小十字線（方向感）
    if (!isArrived) {
      const arm = 5;
      ctx.strokeStyle = 'rgba(200, 210, 255, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(px - arm, py); ctx.lineTo(px + arm, py); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(px, py - arm); ctx.lineTo(px, py + arm); ctx.stroke();
    }

    ctx.restore();
  }
}
