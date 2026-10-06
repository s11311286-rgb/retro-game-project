/**
 * js/systems/QiSystem.js
 * 水墨「氣」流湧動系統：
 * 具象化圍棋「氣」與「勢」的攻防——
 * 1. 同色棋子間水墨氣流相連牽引（黑墨黛流、素白玉流）；
 * 2. 黑白貼身交鋒處產生陰陽二氣交織旋轉的對決氣旋。
 */

import { PIECE_TYPE, GRID_CONFIG } from '../config.js';
import { Physics } from './Physics.js';

export class QiSystem {
  constructor() {
    this.time = 0;
  }

  /**
   * 更新氣流時間狀態
   * @param {number} dt 幀間隔秒數
   */
  update(dt) {
    this.time += dt * 2.2;
  }

  /**
   * 渲染棋盤上的黑白氣流湧動與交鋒氣旋
   * @param {CanvasRenderingContext2D} ctx
   * @param {import('../entities/Board.js').Board} board
   */
  render(ctx, board) {
    const size = GRID_CONFIG.SIZE;
    const pieces = [];

    // 收集所有已落子座標
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const type = board.getPiece(x, y);
        if (type !== PIECE_TYPE.EMPTY) {
          pieces.push({ x, y, type });
        }
      }
    }

    if (pieces.length === 0) return;

    ctx.save();

    // 1. 同色棋子氣流牽引（脈絡貫通）
    this._renderQiConnections(ctx, pieces);

    // 2. 黑白貼身交鋒對決氣旋（爭氣焦點）
    this._renderQiClashes(ctx, pieces);

    ctx.restore();
  }

  /**
   * 繪製同色棋子之間的流動氣脈
   * @private
   */
  _renderQiConnections(ctx, pieces) {
    const connectedPairs = new Set();
    const len = pieces.length;

    for (let i = 0; i < len; i++) {
      const p1 = pieces[i];
      for (let j = i + 1; j < len; j++) {
        const p2 = pieces[j];
        if (p1.type !== p2.type) continue;

        const dx = Math.abs(p1.x - p2.x);
        const dy = Math.abs(p1.y - p2.y);

        // 緊鄰（距離為 1）或跳格成勢（距離為 2 的直線/斜線）
        const isAdjacent = (dx <= 1 && dy <= 1);
        const isJump = (dx === 2 && dy === 0) || (dx === 0 && dy === 2) || (dx === 2 && dy === 2);

        if (isAdjacent || isJump) {
          const key = `${p1.x},${p1.y}-${p2.x},${p2.y}`;
          if (!connectedPairs.has(key)) {
            connectedPairs.add(key);
            this._drawQiStream(ctx, p1, p2, p1.type === PIECE_TYPE.BLACK);
          }
        }
      }
    }
  }

  /**
   * 繪製一條流動的水墨氣脈絲帶
   * @private
   */
  _drawQiStream(ctx, p1, p2, isBlack) {
    const pos1 = Physics.gridToCanvas(p1.x, p1.y);
    const pos2 = Physics.gridToCanvas(p2.x, p2.y);

    const midX = (pos1.x + pos2.x) * 0.5;
    const midY = (pos1.y + pos2.y) * 0.5;

    // 垂直法向量擾動（微風般水墨水波起伏）
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    const dist = Math.hypot(dx, dy);
    if (dist === 0) return;
    const nx = -dy / dist;
    const ny = dx / dist;

    // 氣息正弦流動波浪
    const wave = Math.sin(this.time + p1.x * 2.0 + p1.y * 1.5) * 4.0;
    const ctrlX = midX + nx * wave;
    const ctrlY = midY + ny * wave;

    ctx.save();
    ctx.lineCap = 'round';

    // 氣脈流動顏色
    if (isBlack) {
      // 黑色氣流：如古墨青黛，深沉溫潤
      ctx.strokeStyle = 'rgba(20, 28, 22, 0.42)';
      ctx.lineWidth = 2.0;
    } else {
      // 白色氣流：白玉毫芒，晶瑩溫潤
      ctx.strokeStyle = 'rgba(248, 244, 230, 0.55)';
      ctx.lineWidth = 2.0;
    }

    ctx.beginPath();
    ctx.moveTo(pos1.x, pos1.y);
    ctx.quadraticCurveTo(ctrlX, ctrlY, pos2.x, pos2.y);
    ctx.stroke();

    // 流動在氣流上的「氣韻光絲」（沿著貝茲曲線移動的小墨子）
    const flowT = (this.time * 0.4 + (p1.x + p1.y) * 0.2) % 1;
    const oneMinusT = 1 - flowT;
    const fx = oneMinusT * oneMinusT * pos1.x + 2 * oneMinusT * flowT * ctrlX + flowT * flowT * pos2.x;
    const fy = oneMinusT * oneMinusT * pos1.y + 2 * oneMinusT * flowT * ctrlY + flowT * flowT * pos2.y;

    ctx.beginPath();
    ctx.arc(fx, fy, isBlack ? 1.8 : 1.6, 0, Math.PI * 2);
    ctx.fillStyle = isBlack ? 'rgba(15, 20, 16, 0.75)' : 'rgba(255, 255, 245, 0.85)';
    ctx.fill();

    ctx.restore();
  }

  /**
   * 繪製黑白對峙焦點處的「陰陽對決氣旋」
   * @private
   */
  _renderQiClashes(ctx, pieces) {
    const clashingPairs = new Set();
    const len = pieces.length;

    for (let i = 0; i < len; i++) {
      const p1 = pieces[i];
      for (let j = i + 1; j < len; j++) {
        const p2 = pieces[j];
        if (p1.type === p2.type) continue; // 必須是一黑一白

        const dx = Math.abs(p1.x - p2.x);
        const dy = Math.abs(p1.y - p2.y);

        // 直接緊鄰貼身交鋒（緊氣博弈點）
        if (dx <= 1 && dy <= 1) {
          const key = `${Math.min(p1.x, p2.x)},${Math.min(p1.y, p2.y)}-${Math.max(p1.x, p2.x)},${Math.max(p1.y, p2.y)}`;
          if (!clashingPairs.has(key)) {
            clashingPairs.add(key);
            this._drawQiVortex(ctx, p1, p2);
          }
        }
      }
    }
  }

  /**
   * 繪製一處黑白二氣激烈交織旋轉的微弱太極螺旋氣旋
   * @private
   */
  _drawQiVortex(ctx, p1, p2) {
    const pos1 = Physics.gridToCanvas(p1.x, p1.y);
    const pos2 = Physics.gridToCanvas(p2.x, p2.y);

    const cx = (pos1.x + pos2.x) * 0.5;
    const cy = (pos1.y + pos2.y) * 0.5;

    const angle = this.time * 2.5; // 氣旋旋轉角速度
    const r = 6.5;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    // 黑氣旋臂
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI);
    ctx.strokeStyle = 'rgba(20, 26, 22, 0.75)';
    ctx.lineWidth = 1.6;
    ctx.lineCap = 'round';
    ctx.stroke();

    // 白氣旋臂
    ctx.beginPath();
    ctx.arc(0, 0, r, Math.PI, Math.PI * 2);
    ctx.strokeStyle = 'rgba(250, 245, 230, 0.85)';
    ctx.lineWidth = 1.6;
    ctx.lineCap = 'round';
    ctx.stroke();

    // 核心交匯微小碰撞星火
    ctx.beginPath();
    ctx.arc(0, 0, 1.4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(215, 60, 40, 0.7)'; // 硃砂微火點
    ctx.fill();

    ctx.restore();
  }
}
