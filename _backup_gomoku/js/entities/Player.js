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

    const px = OFFSET + this.gridX * CELL_SIZE - CURSOR.BOX_OFFSET;
    const py = OFFSET + this.gridY * CELL_SIZE - CURSOR.BOX_OFFSET;

    ctx.save();
    ctx.strokeStyle = CURSOR.STROKE;
    ctx.lineWidth = CURSOR.LINE_WIDTH;

    // 微幅呼吸透明度提升質感 (0.85 ~ 1.0)
    ctx.globalAlpha = 0.85 + Math.sin(this.pulseTime) * 0.15;
    ctx.strokeRect(px, py, CURSOR.BOX_SIZE, CURSOR.BOX_SIZE);
    ctx.restore();
  }
}
