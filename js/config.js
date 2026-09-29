/**
 * js/config.js
 * 遊戲參數、物理屬性、障礙物生成機率、難度等級與常數設定
 */

export const CONFIG = Object.freeze({
  // 三種難度等級配置
  DIFFICULTIES: Object.freeze({
    EASY: Object.freeze({
      ID: 'EASY',
      LABEL: '簡單',
      ICON: '🟢',
      INITIAL_SPEED: 4.5,
      SPEED_INCREMENT: 0.4,
      BASE_DELAY_MS: 1800,
      MIN_DELAY_MS: 900,
      BIRD_CHANCE: 0.15,
      DOUBLE_CACTUS_CHANCE: 0.15,
    }),
    NORMAL: Object.freeze({
      ID: 'NORMAL',
      LABEL: '普通',
      ICON: '🟡',
      INITIAL_SPEED: 6.0,
      SPEED_INCREMENT: 0.7,
      BASE_DELAY_MS: 1500,
      MIN_DELAY_MS: 650,
      BIRD_CHANCE: 0.25,
      DOUBLE_CACTUS_CHANCE: 0.35,
    }),
    HARD: Object.freeze({
      ID: 'HARD',
      LABEL: '困難',
      ICON: '🔴',
      INITIAL_SPEED: 8.0,
      SPEED_INCREMENT: 1.0,
      BASE_DELAY_MS: 1100,
      MIN_DELAY_MS: 480,
      BIRD_CHANCE: 0.40,
      DOUBLE_CACTUS_CHANCE: 0.50,
    }),
  }),

  // 預設難度與本地儲存 Key
  DEFAULT_DIFFICULTY: 'NORMAL',
  DIFFICULTY_STORAGE_KEY: 'dinoDifficulty',

  // 速度成長間距 (每幾分提升一次速度)
  SPEED_STEP_SCORE: 100,

  // 恐龍跳躍時長（與 CSS @keyframes dinoJump 0.65s 同步）
  JUMP_DURATION_MS: 650,

  // 障礙物通用規則
  OBSTACLE: {
    INITIAL_DELAY_MS: 1000,
    DELAY_FACTOR: 2.5,
    SMALL_CACTUS_CHANCE: 0.30,  // 30% 機率為小仙人掌
    BIRD_HEIGHTS: [105, 145, 185], // 飛鳥三種飛行高度 (bottom px)
    DESPAWN_X: -150,           // 超出左側邊界後移除 (px)
  },

  // 碰撞箱內縮容錯值 (AABB Collision Padding)
  COLLISION: {
    DINO: {
      PADDING_LEFT: 8,
      PADDING_RIGHT: 8,
      PADDING_TOP: 8,
      PADDING_BOTTOM: 5,
    },
    OBSTACLE: {
      PADDING_LEFT: 2,
      PADDING_RIGHT: 2,
      PADDING_TOP: 2,
      PADDING_BOTTOM: 2,
    },
  },

  // 計分定時器間隔 (ms)
  SCORE_INTERVAL_MS: 100,

  // 本地儲存鍵名
  STORAGE_KEY: 'dinoHighScore',
});
