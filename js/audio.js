/* ============================================================
   音频模块：WebAudio 实时合成武侠音效（无需音频文件）
   ============================================================ */
"use strict";

const AudioSys = (() => {
  let ctx = null;
  let master = null;
  let sfxGain = null;
  let muted = false;

  const F = (n) => 440 * Math.pow(2, (n - 69) / 12);

  function ensureCtx() {
    if (ctx) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = muted ? 0 : 0.9;
      master.connect(ctx.destination);
      sfxGain = ctx.createGain();
      sfxGain.gain.value = 0.85;
      sfxGain.connect(master);
    } catch (e) { ctx = null; }
  }

  function tone(freq, t0, dur, type, vol, slideTo) {
    if (!ctx || !isFinite(freq) || !isFinite(t0) || !isFinite(dur)) return;
    try {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type || "sine";
      o.frequency.setValueAtTime(freq, t0);
      if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), t0 + dur);
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(vol, t0 + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g); g.connect(sfxGain);
      o.start(t0); o.stop(t0 + dur + 0.05);
    } catch (e) {}
  }

  function noise(t0, dur, vol, freq) {
    if (!ctx) return;
    try {
      const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const f = ctx.createBiquadFilter();
      f.type = "bandpass"; f.frequency.value = freq || 2400; f.Q.value = 0.8;
      const g = ctx.createGain();
      g.gain.setValueAtTime(vol, t0);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      src.connect(f); f.connect(g); g.connect(sfxGain);
      src.start(t0);
    } catch (e) {}
  }

  return {
    init() { try { ensureCtx(); if (ctx && ctx.state === "suspended") ctx.resume().catch(() => {}); } catch (e) {} },
    setMuted(m) { muted = m; try { if (master) master.gain.value = m ? 0 : 0.9; } catch (e) {} },
    isMuted() { return muted; },
    click() { try { ensureCtx(); tone(F(72), ctx.currentTime, 0.08, "square", 0.05); } catch (e) {} },
    slash() {
      try {
        ensureCtx(); if (!ctx) return;
        const t = ctx.currentTime;
        noise(t, 0.28, 0.22, 3200);
        tone(1500, t, 0.22, "sawtooth", 0.07, 300);
        tone(2400, t + 0.02, 0.2, "triangle", 0.06, 500);
      } catch (e) {}
    },
    hit() {
      try {
        ensureCtx(); if (!ctx) return;
        const t = ctx.currentTime;
        noise(t, 0.16, 0.3, 4200);
        tone(880, t, 0.14, "square", 0.09, 440);
        tone(1320, t + 0.01, 0.12, "triangle", 0.08, 660);
      } catch (e) {}
    },
    hurt() {
      try {
        ensureCtx(); if (!ctx) return;
        const t = ctx.currentTime;
        tone(220, t, 0.22, "sawtooth", 0.16, 90);
        noise(t, 0.14, 0.18, 500);
      } catch (e) {}
    },
    die() {
      try {
        ensureCtx(); if (!ctx) return;
        const t = ctx.currentTime;
        tone(300, t, 0.4, "sawtooth", 0.1, 60);
        tone(150, t + 0.06, 0.42, "square", 0.08, 40);
        noise(t + 0.02, 0.25, 0.14, 300);
      } catch (e) {}
    },
    thunder() {
      try {
        ensureCtx(); if (!ctx) return;
        const t = ctx.currentTime;

        // 1) 先声：短促“咔嚓”脆响（高频带通噪声，快速衰减）
        noise(t, 0.14, 0.55, 1900);
        noise(t + 0.01, 0.10, 0.35, 3200);

        // 2) 主轰鸣：低频棕噪声滚雷（随机起伏，滚 3 秒多）
        const dur = 3.6;
        const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
        const buf = ctx.createBuffer(1, len, ctx.sampleRate);
        const d = buf.getChannelData(0);
        let last = 0;
        for (let i = 0; i < len; i++) {
          const white = Math.random() * 2 - 1;
          last = (last + 0.02 * white) / 1.02;
          d[i] = last * 3.6;
        }
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass"; lp.frequency.value = 150; lp.Q.value = 0.7;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t + 0.06);
        g.gain.exponentialRampToValueAtTime(0.5, t + 0.4);
        let seg = t + 0.4;
        while (seg < t + dur - 0.45) {
          const nxt = seg + 0.16 + Math.random() * 0.24;
          g.gain.linearRampToValueAtTime(0.22 + Math.random() * 0.55, nxt);
          seg = nxt;
        }
        g.gain.linearRampToValueAtTime(0.0001, t + dur);
        src.connect(lp); lp.connect(g); g.connect(sfxGain);
        src.start(t + 0.06);

        // 3) 尾音：远处回响闷雷（更轻、更低）
        const dur2 = 2.4;
        const len2 = Math.max(1, Math.floor(ctx.sampleRate * dur2));
        const buf2 = ctx.createBuffer(1, len2, ctx.sampleRate);
        const d2 = buf2.getChannelData(0);
        let last2 = 0;
        for (let i = 0; i < len2; i++) {
          const white = Math.random() * 2 - 1;
          last2 = (last2 + 0.014 * white) / 1.014;
          d2[i] = last2 * 3;
        }
        const src2 = ctx.createBufferSource();
        src2.buffer = buf2;
        const lp2 = ctx.createBiquadFilter();
        lp2.type = "lowpass"; lp2.frequency.value = 95;
        const g2 = ctx.createGain();
        g2.gain.setValueAtTime(0.0001, t + 1.5);
        g2.gain.exponentialRampToValueAtTime(0.3, t + 2.0);
        g2.gain.exponentialRampToValueAtTime(0.0001, t + 1.5 + dur2);
        src2.connect(lp2); lp2.connect(g2); g2.connect(sfxGain);
        src2.start(t + 1.5);
      } catch (e) {}
    },
    roar() {
      try {
        ensureCtx(); if (!ctx) return;
        const t = ctx.currentTime;
        tone(190, t, 0.22, "sawtooth", 0.07, 95);
        tone(120, t + 0.04, 0.26, "square", 0.055, 60);
      } catch (e) {}
    },
    win() {
      try {
        ensureCtx(); if (!ctx) return;
        const notes = [60, 64, 67, 72, 74, 79, 84];
        notes.forEach((n, i) => tone(F(n), ctx.currentTime + i * 0.15, 0.6, "triangle", 0.14));
      } catch (e) {}
    },
    lose() {
      try {
        ensureCtx(); if (!ctx) return;
        const notes = [72, 67, 64, 60, 55];
        notes.forEach((n, i) => tone(F(n), ctx.currentTime + i * 0.18, 0.55, "triangle", 0.13));
      } catch (e) {}
    }
  };
})();
