/**
 * js/entities/ObstacleManager.js
 * 障礙物工廠與管理器：負責仙人掌（單支/雙支/大小）與飛鳥的生成、位移與銷毀，支援動態難度
 */

import { CONFIG } from '../config.js';

export class ObstacleManager {
  /**
   * @param {HTMLElement} gameContainer
   * @param {Object} [diffConfig]
   */
  constructor(gameContainer, diffConfig = CONFIG.DIFFICULTIES[CONFIG.DEFAULT_DIFFICULTY]) {
    this.gameContainer = gameContainer;
    this.obstacles = [];
    this.setDifficulty(diffConfig);
  }

  /**
   * 設定當前難度生成機率
   * @param {Object} diffConfig
   */
  setDifficulty(diffConfig) {
    this.diffConfig = diffConfig;
    this.birdChance = diffConfig.BIRD_CHANCE;
    this.doubleCactusChance = diffConfig.DOUBLE_CACTUS_CHANCE;
  }

  /**
   * 生成單支或雙支仙人掌群組
   */
  createCactus() {
    const group = document.createElement('div');
    group.className = 'obstacle cactus-group';

    // 依當前難度機率生成雙仙人掌
    const amount = Math.random() < this.doubleCactusChance ? 2 : 1;

    for (let i = 0; i < amount; i++) {
      const cactus = document.createElement('div');
      cactus.className = 'cactus';

      // 30% 機率為小仙人掌
      if (Math.random() < CONFIG.OBSTACLE.SMALL_CACTUS_CHANCE) {
        cactus.classList.add('small');
      }
      group.appendChild(cactus);
    }

    const startX = this.gameContainer.offsetWidth;
    group.style.left = startX + 'px';
    this.gameContainer.appendChild(group);

    this.obstacles.push({
      element: group,
      position: startX,
    });
  }

  /**
   * 生成不同飛行高度的翼龍 (鳥)
   */
  createBird() {
    const bird = document.createElement('div');
    bird.className = 'obstacle bird';

    const heights = CONFIG.OBSTACLE.BIRD_HEIGHTS;
    const height = heights[Math.floor(Math.random() * heights.length)];
    bird.style.bottom = height + 'px';

    const startX = this.gameContainer.offsetWidth;
    bird.style.left = startX + 'px';
    this.gameContainer.appendChild(bird);

    this.obstacles.push({
      element: bird,
      position: startX,
    });
  }

  /**
   * 隨機生成障礙物（依當前難度飛鳥機率判定）
   */
  spawn() {
    if (Math.random() < this.birdChance) {
      this.createBird();
    } else {
      this.createCactus();
    }
  }

  /**
   * 更新所有場景內障礙物位置，並自動回收離開畫面的障礙物
   * @param {number} speed 當前移動步長
   */
  update(speed) {
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i];
      obstacle.position -= speed;
      obstacle.element.style.left = obstacle.position + 'px';

      // 超出左側邊界後移除
      if (obstacle.position < CONFIG.OBSTACLE.DESPAWN_X) {
        obstacle.element.remove();
        this.obstacles.splice(i, 1);
      }
    }
  }

  /**
   * 清除畫面所有障礙物
   */
  clear() {
    for (const obstacle of this.obstacles) {
      obstacle.element.remove();
    }
    this.obstacles = [];

    // 防禦性清理可能殘留的 .obstacle DOM 節點
    const domObstacles = this.gameContainer.querySelectorAll('.obstacle');
    domObstacles.forEach((obs) => obs.remove());
  }

  /**
   * 取得當前存活的障礙物列表
   * @returns {Array<{ element: HTMLElement, position: number }>}
   */
  getActiveObstacles() {
    return this.obstacles;
  }
}
