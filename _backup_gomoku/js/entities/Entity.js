/**
 * js/entities/Entity.js
 * 遊戲實體基類，提供基礎座標與生命週期介面
 */

export class Entity {
  /**
   * @param {number} [x=0]
   * @param {number} [y=0]
   */
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
    this.active = true;
  }

  /**
   * 邏輯更新介面
   * @param {number} dt - 兩幀之間隔時間（秒）
   */
  update(dt) {
    // 由子類覆寫
  }

  /**
   * 繪製介面
   * @param {CanvasRenderingContext2D} ctx
   */
  render(ctx) {
    // 由子類覆寫
  }
}
