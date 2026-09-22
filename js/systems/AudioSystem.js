/**
 * js/systems/AudioSystem.js
 * 原生 Web Audio API 音效與音樂合成系統
 * 零外部檔案依賴，支援落子打擊音、游標音、勝利號角與復古輕柔 BGM
 */

export class AudioSystem {
  constructor() {
    this.ctx = null;
    this.isMuted = localStorage.getItem('gomoku_muted') === 'true';
    this.bgmPlaying = false;
    this.bgmTimer = null;
    this.bgmStep = 0;

    // 舒緩五子棋古風/復古五聲音階 (Hz)
    this.bgmNotes = [
      261.63, // C4
      293.66, // D4
      329.63, // E4
      392.00, // G4
      440.00, // A4
      523.25, // C5
      440.00, // A4
      392.00, // G4
      329.63, // E4
      293.66, // D4
      392.00, // G4
      329.63, // E4
    ];
  }

  /**
   * 確保 AudioContext 已初始化並處於運行狀態（處理瀏覽器 Autoplay 政策）
   */
  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * 切換靜音狀態
   * @returns {boolean} 目前是否靜音
   */
  toggleMute() {
    this.initContext();
    this.isMuted = !this.isMuted;
    localStorage.setItem('gomoku_muted', this.isMuted ? 'true' : 'false');

    if (this.isMuted) {
      this.stopBGM();
    } else {
      this.startBGM();
    }

    return this.isMuted;
  }

  /**
   * 播放落子清脆敲擊聲（仿實木棋盤「嗒」聲）
   * @param {boolean} isPlayer - 是否為黑棋
   */
  playMoveSound(isPlayer) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const baseFreq = isPlayer ? 420 : 540;

    // 1. 主音調：短促微音階衰減
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.08);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.09);

    // 2. 噪聲微粒：增強實木碰撞感
    try {
      const bufferSize = this.ctx.sampleRate * 0.03;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = isPlayer ? 900 : 1200;

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.3, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      noise.start(t);
      noise.stop(t + 0.035);
    } catch (e) {
      // 忽略部分瀏覽器音頻緩衝異常
    }
  }

  /**
   * 播放游標移動微弱滴答聲
   */
  playCursorSound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(780, t);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.025);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.03);
  }

  /**
   * 播放獲勝勝利號角（8-bit 上行歡慶琶音）
   */
  playWinSound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
    const t = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.1);

      const noteDuration = idx === notes.length - 1 ? 0.6 : 0.12;
      gain.gain.setValueAtTime(0.28, t + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.1 + noteDuration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + idx * 0.1);
      osc.stop(t + idx * 0.1 + noteDuration + 0.02);
    });
  }

  /**
   * 播放落敗低沉音效
   */
  playLoseSound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [369.99, 329.63, 293.66, 246.94];
    const t = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t + idx * 0.16);

      gain.gain.setValueAtTime(0.2, t + idx * 0.16);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.16 + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + idx * 0.16);
      osc.stop(t + idx * 0.16 + 0.24);
    });
  }

  /**
   * 啟動柔和復古背景音樂
   */
  startBGM() {
    if (this.isMuted || this.bgmPlaying) return;
    this.initContext();
    if (!this.ctx) return;

    this.bgmPlaying = true;
    this.bgmStep = 0;

    const playNextNote = () => {
      if (!this.bgmPlaying || this.isMuted) return;

      const freq = this.bgmNotes[this.bgmStep % this.bgmNotes.length];
      this.bgmStep++;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      // 極輕柔的環境背景音量 (0.04)
      gain.gain.setValueAtTime(0.04, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.75);

      this.bgmTimer = setTimeout(playNextNote, 800);
    };

    playNextNote();
  }

  /**
   * 停止背景音樂
   */
  stopBGM() {
    this.bgmPlaying = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}
