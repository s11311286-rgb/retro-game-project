/**
 * js/config.js
 * 遊戲全域常數、尺寸、規則、三種難度等級與視覺配置
 */

export const CANVAS_CONFIG = Object.freeze({
  WIDTH: 620,
  HEIGHT: 620,
});

export const GRID_CONFIG = Object.freeze({
  SIZE: 15,
  CELL_SIZE: 40,
  OFFSET: 20,
  STAR_POINTS: [
    [3, 3], [7, 3], [11, 3],
    [3, 7], [7, 7], [11, 7],
    [3, 11], [7, 11], [11, 11],
  ],
  STAR_POINT_RADIUS: 5,
});

export const PIECE_TYPE = Object.freeze({
  EMPTY: 0,
  BLACK: 1, // 玩家執黑
  WHITE: 2, // 電腦執白
});

export const TURN_STATE = Object.freeze({
  PLAYER: 'PLAYER',
  COMPUTER: 'COMPUTER',
});

export const GAME_STATUS = Object.freeze({
  IDLE: 'IDLE',
  PLAYING: 'PLAYING',
  WIN: 'WIN',
  LOSE: 'LOSE',
  DRAW: 'DRAW',
});

export const RULES = Object.freeze({
  WIN_COUNT: 5,
  SCORE_PER_MOVE: 10,
  DIRECTIONS: [
    [1, 0],   // 水平
    [0, 1],   // 垂直
    [1, 1],   // 正斜
    [1, -1],  // 反斜
  ],
});

// 三種難度配置 (簡單 / 普通 / 困難)
export const DIFFICULTY_CONFIG = Object.freeze({
  EASY: Object.freeze({
    ID: 'EASY',
    LABEL: '簡單',
    ICON: '🟢',
    THINK_DELAY_MS: 200,
    OFFENSE_WEIGHT: 0.85,
    DEFENSE_WEIGHT: 0.70,
    RANDOM_BLUNDER_RATE: 0.35, // 35% 機率在次優點隨機落子，降低進攻壓迫
    CHECK_FORKS: false,
  }),
  NORMAL: Object.freeze({
    ID: 'NORMAL',
    LABEL: '普通',
    ICON: '🟡',
    THINK_DELAY_MS: 350,
    OFFENSE_WEIGHT: 1.15,
    DEFENSE_WEIGHT: 1.00,
    RANDOM_BLUNDER_RATE: 0.0,
    CHECK_FORKS: false,
  }),
  HARD: Object.freeze({
    ID: 'HARD',
    LABEL: '困難',
    ICON: '🔴',
    THINK_DELAY_MS: 450,
    OFFENSE_WEIGHT: 1.25,
    DEFENSE_WEIGHT: 1.20,
    RANDOM_BLUNDER_RATE: 0.0,
    CHECK_FORKS: true, // 深度計算雙三、雙四、四三等組合殺招與防禦
  }),
});

export const DEFAULT_DIFFICULTY = 'NORMAL';

export const AI_CONFIG = Object.freeze({
  THINK_DELAY_MS: 350,
  OFFENSE_WEIGHT: 1.15,
  CENTER_BIAS: 10,
  SCORES: {
    FIVE: 100000,
    LIVE_FOUR: 10000,
    SLEEP_FOUR: 3000,
    LIVE_THREE: 1000,
    SLEEP_THREE: 200,
    LIVE_TWO: 100,
    SLEEP_TWO: 20,
    DEFAULT: 5,
  },
});

export const THEME = Object.freeze({
  BOARD_BG: '#b59a67',
  GRID_LINE: '#463c29',
  STAR_POINT: '#403624',
  PIECE_RADIUS: 15,
  PLAYER_PIECE: {
    FILL: '#111613',
    STROKE: '#303b34',
    LINE_WIDTH: 2,
  },
  AI_PIECE: {
    FILL: '#ded8c1',
    STROKE: '#77725f',
    LINE_WIDTH: 2,
  },
  CURSOR: {
    STROKE: '#e9d99d',
    LINE_WIDTH: 3,
    BOX_SIZE: 36,
    BOX_OFFSET: 18,
  },
});

export const STORAGE_KEYS = Object.freeze({
  HIGH_SCORE: 'gomokuHigh',
  DIFFICULTY: 'gomokuDifficulty',
});
