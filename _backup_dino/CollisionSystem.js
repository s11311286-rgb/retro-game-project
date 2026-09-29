/**
 * js/systems/CollisionSystem.js
 * 碰撞檢測系統：使用具寬容度 Padding 的 AABB 盒碰撞演算法
 */

import { CONFIG } from '../config.js';

export class CollisionSystem {
  /**
   * 檢查恐龍與單一障礙物是否發生碰撞
   * @param {DOMRect} dinoRect
   * @param {DOMRect} obstacleRect
   * @returns {boolean}
   */
  static checkSingleCollision(dinoRect, obstacleRect) {
    const { DINO, OBSTACLE } = CONFIG.COLLISION;

    const dinoLeft = dinoRect.left + DINO.PADDING_LEFT;
    const dinoRight = dinoRect.right - DINO.PADDING_RIGHT;
    const dinoTop = dinoRect.top + DINO.PADDING_TOP;
    const dinoBottom = dinoRect.bottom - DINO.PADDING_BOTTOM;

    const obstacleLeft = obstacleRect.left + OBSTACLE.PADDING_LEFT;
    const obstacleRight = obstacleRect.right - OBSTACLE.PADDING_RIGHT;
    const obstacleTop = obstacleRect.top + OBSTACLE.PADDING_TOP;
    const obstacleBottom = obstacleRect.bottom - OBSTACLE.PADDING_BOTTOM;

    const horizontalCollision = dinoRight > obstacleLeft && dinoLeft < obstacleRight;
    const verticalCollision = dinoBottom > obstacleTop && dinoTop < obstacleBottom;

    return horizontalCollision && verticalCollision;
  }

  /**
   * 檢查恐龍是否與場景中任何障礙物發生碰撞
   * @param {Dino} dino
   * @param {Array<{ element: HTMLElement }>} activeObstacles
   * @returns {boolean}
   */
  static check(dino, activeObstacles) {
    const dinoRect = dino.getRect();

    for (const obs of activeObstacles) {
      const obstacleRect = obs.element.getBoundingClientRect();
      if (this.checkSingleCollision(dinoRect, obstacleRect)) {
        return true;
      }
    }

    return false;
  }
}
