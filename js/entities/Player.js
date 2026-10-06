/**
 * js/entities/Player.js
 * 玩家控制游標與當前操作狀態實體
 */

import { Entity } from './Entity.js';
import { GRID_CONFIG, THEME, PIECE_TYPE } from '../config.js';

export class Player extends Entity {
  /**
   * @param {number} [initialGridX=7]
   * @param {number} [initialGridY=7]
   */
  constructor(initialGridX = 7, initialGridY = 7) {
    super(0, 0);
    this.gridX = initialGridX;
    this.gridY = initialGridY;
    this.pieceType = PIECE_TYPE.BLACK;
    this.pulseTime = 0;
  }

  /**
   * 重設游標至預設中央位置
   */
  reset() {
    this.gridX = 7;
    this.gridY = 7;
    this.pulseTime = 0;
  }

  /**
   * 設定網格座標
   * @param {number} gx
   * @param {number} gy
   */
  setPosition(gx, gy) {
    this.gridX = gx;
    this.gridY = gy;
  }

  /**
   * 相對位移，支援邊界循環包絡
   * @param {number} dx
   * @param {number} dy
   */
  move(dx, dy) {
    const size = GRID_CONFIG.SIZE;
    this.gridX = (this.gridX + dx + size) % size;
    this.gridY = (this.gridY + dy + size) % size;
  }

  /**
   * 更新游標動畫狀態
   * @param {number} dt
   */
  update(dt) {
    this.pulseTime += dt * 4;
  }

  /**
   * 繪製選取框
   * @param {CanvasRenderingContext2D} ctx
   * @param {boolean} isPlayerTurn - 是否為玩家回合
   * @param {boolean} isEnded - 遊戲是否已結束
   */
  render(ctx, isPlayerTurn, isEnded) {
    if (!isPlayerTurn || isEnded) return;

    const { OFFSET, CELL_SIZE } = GRID_CONFIG;
    const { CURSOR } = THEME;

    const cx = OFFSET + this.gridX * CELL_SIZE;
    const cy = OFFSET + this.gridY * CELL_SIZE;
    const r = CURSOR.BOX_OFFSET; // 半邊距 18
    const arm = 7; // 折角長度

    ctx.save();
    // 雅緻古墨與宣紙暗金
    const alpha = 0.8 + Math.sin(this.pulseTime * 2.5) * 0.2;
    ctx.strokeStyle = `rgba(35, 45, 38, ${alpha})`;
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 左上折角
    ctx.beginPath();
    ctx.moveTo(cx - r, cy - r + arm);
    ctx.lineTo(cx - r, cy - r);
    ctx.lineTo(cx - r + arm, cy - r);
    ctx.stroke();

    // 右上折角
    ctx.beginPath();
    ctx.moveTo(cx + r - arm, cy - r);
    ctx.lineTo(cx + r, cy - r);
    ctx.lineTo(cx + r, cy - r + arm);
    ctx.stroke();

    // 右下折角
    ctx.beginPath();
    ctx.moveTo(cx + r, cy + r - arm);
    ctx.lineTo(cx + r, cy + r);
    ctx.lineTo(cx + r - arm, cy + r);
    ctx.stroke();

    // 左下折角
    ctx.beginPath();
    ctx.moveTo(cx - r + arm, cy + r);
    ctx.lineTo(cx - r, cy + r);
    ctx.lineTo(cx - r, cy + r - arm);
    ctx.stroke();

    // 核心落子預覽微弱水墨淡暈
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(30, 40, 32, ${alpha * 0.7})`;
    ctx.fill();

    ctx.restore();
  }
}
