/* ============================================================
   《角丝旁行侠记》游戏引擎
   横版轻动作：←→ 移动 · 空格/J/点击 挥剑
   ============================================================ */
"use strict";

(function () {
  const $ = (s) => document.querySelector(s);

  /* ---------- 数值 ---------- */
  const HERO = { hp: 220, speed: 300, atkCd: 0.3, dmg: 36, reach: 235, killHeal: 30 };
  const ENEMY = {
    bandit: { hp: 80, speed: 105, dmg: 6, atkCd: 1.5, w: 100, tag: "山贼" },
    elite:  { hp: 150, speed: 85, dmg: 9, atkCd: 1.3, w: 130, tag: "恶霸" },
    boss:   { hp: 320, speed: 62, dmg: 12, atkCd: 1.2, w: 170, tag: "山寨主" }
  };
  const WAVES = [
    { title: "第一战 · 古道茶摊", bg: "bg-trail", spawns: [["bandit", 0], ["bandit", 1.4]] },
    { title: "第二战 · 众贼来犯", bg: "bg-village", spawns: [["bandit", 0], ["bandit", 0.9], ["elite", 1.8]] },
    { title: "第三战 · 黑风寨主", bg: "bg-stronghold", spawns: [["boss", 0], ["bandit", 2.2]] }
  ];

  /* ---------- 剧情对白（第一章） ---------- */
  const DIALOGS = [
    [
      { who: "旁白", text: "残阳如血，古道西风。山道旁的茶摊前，几个山贼正围着卖茶的老翁。" },
      { who: "山贼", text: "老东西，这个月的「买路钱」呢？交不出来，这茶摊就别想开了！" },
      { who: "角丝旁", text: "光天化日，欺压良善，恶贼行径。" }
    ],
    [
      { who: "山贼", text: "哪来的野丫头！兄弟们，并肩子上！" }
    ],
    [
      { who: "山寨主", text: "就是你伤我兄弟？！今日叫你横着下山！" },
      { who: "角丝旁", text: "黑风寨主？臭鱼烂虾一群罢了" }
    ]
  ];
  const VICTORY = [
    { who: "旁白", text: "山贼一哄而散。老翁千恩万谢，角丝旁转身没入暮色。" },
    { who: "旁白", text: "江湖传言：有位女剑客，路见不平，拔刀相助——" }
  ];
  const DEFEAT = [
    { who: "旁白", text: "你负伤倒下了……侠客也会暂败，养好伤，再战一场！" }
  ];

  /* ---------- 敌人 AI 行为模型 ----------
     状态：idle(游荡) / seek(追击) / attack(攻击前摇) / retreat(后撤) / stun(受击硬直) */
  const BRAIN = {
    bandit: { aggro: 620, attackRange: 140, retreatRange: 70, retreatChance: 0.35, enrage: false },
    elite:  { aggro: 700, attackRange: 160, retreatRange: 95, retreatChance: 0.2,  enrage: true },
    boss:   { aggro: 820, attackRange: 175, retreatRange: 60, retreatChance: 0.1,  enrage: true }
  };

  /* ---------- DOM ---------- */
  const arena = $("#arena");
  const heroEl = $("#heroEntity");
  const swordEl = $("#sword");
  const bladeEl = $("#blade");
  const dialogEl = $("#dialog");
  const dialogSpeaker = $("#dialogSpeaker");
  const dialogText = $("#dialogText");
  const dialogNext = $("#dialogNext");
  const heroBar = $("#heroBarFill");
  const bossBarWrap = $("#bossBar");
  const bossBarFill = $("#bossBarFill");
  const waveTag = $("#waveTag");
  const resultOverlay = $("#resultOverlay");
  const resultTitle = $("#resultTitle");
  const resultDesc = $("#resultDesc");
  const hurtFlash = $("#hurtFlash");

  /* ---------- 状态 ---------- */
  let state = "intro";        // intro | wave | over
  let hero = null;
  let enemies = [];
  let waveIdx = 0;
  let dlgIdx = 0;
  let dlgList = [];
  let dlgTyping = false;
  let dlgTimer = null;
  let dlgOnDone = null;
  let lastTime = 0;
  const touchHold = { l: false, r: false };
  let queuedSlash = false;
  let rafId = null;
  const keys = {};

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  /* ---------- 主角 ---------- */
  function createHero() {
    hero = {
      x: arena.clientWidth * 0.12,
      hp: HERO.hp, maxHp: HERO.hp,
      lastSlash: -9, hurtUntil: 0, dir: 1,
      el: heroEl,
      img: heroEl.querySelector("img")
    };
    heroEl.classList.remove("dead");
    heroEl.style.left = hero.x + "px";
    updateHeroBar();
  }

  function heroWidth() { return hero ? hero.img.offsetWidth || 120 : 120; }
  function heroHeight() { return hero ? hero.img.offsetHeight || 260 : 260; }

  function updateHeroBar() {
    heroBar.style.width = Math.max(0, (hero.hp / hero.maxHp) * 100) + "%";
  }

  /* ---------- 敌人 ---------- */
  function spawnEnemy(type, delay) {
    setTimeout(() => {
      if (state !== "wave") return;
      const cfg = ENEMY[type];
      const el = document.createElement("div");
      el.className = "entity enemy-entity " + type;
      el.innerHTML = '<span class="name-tag">' + cfg.tag + '</span>' +
        '<span class="hpbar"><span class="fill"></span></span>' +
        '<img class="enemy" src="assets/' + type + '.png" alt="' + cfg.tag + '">';
      arena.appendChild(el);
      const e = {
        type, cfg, el, img: el.querySelector("img"),
        x: arena.clientWidth * 0.8 + Math.random() * 40,
        hp: cfg.hp, maxHp: cfg.hp,
        lastAtk: 0, dead: false,
        brain: BRAIN[type],
        state: "seek",
        strikeAt: 0,
        stunUntil: 0,
        rage: BRAIN[type].enrage,
        walkDir: 1,
        walkUntil: 0
      };
      el.classList.add("show-hp");
      if (type === "elite") el.style.width = "min(24vh,200px)";
      if (type === "boss") { bossBarWrap.classList.add("show"); updateBossBar(e); }
      enemies.push(e);
      el.style.left = (e.x - cfg.w / 2) + "px";
    }, (delay || 0) * 1000);
  }

  function updateBossBar(e) {
    if (e.type === "boss") bossBarFill.style.width = Math.max(0, (e.hp / e.maxHp) * 100) + "%";
  }

  /* ---------- 敌人 AI ---------- */
  function updateEnemy(e, dt) {
    if (e.dead) return;
    const now = performance.now() / 1000;
    const dist = Math.abs(hero.x - e.x);
    const dirToHero = hero.x > e.x ? 1 : -1;
    const brain = e.brain;
    const enraged = e.rage && e.hp < e.maxHp * 0.35;

    if (e.state === "stun" && now >= e.stunUntil) e.state = "seek";

    if (e.state === "attack") {
      if (now >= e.strikeAt) {
        e.state = "seek";
        e.lastAtk = now;
        if (dist <= brain.attackRange * 1.3 && hero.hp > 0) damageHero(e.cfg.dmg);
      }
    } else if (e.state === "stun") {
      // 受击硬直，不动
    } else if (e.state === "retreat") {
      e.x = clamp(e.x - dirToHero * e.cfg.speed * 1.5 * dt, 70, arena.clientWidth + 160);
      if (dist > brain.attackRange * 0.9) e.state = "seek";
    } else if (dist > brain.aggro) {
      if (e.state !== "idle") { e.state = "idle"; e.walkUntil = now + 0.8 + Math.random() * 1.4; }
      if (now >= e.walkUntil) { e.walkDir = Math.random() < 0.5 ? -1 : 1; e.walkUntil = now + 0.8 + Math.random() * 1.4; }
      const bias = dirToHero * 0.7 + e.walkDir * 0.3;
      e.x = clamp(e.x + bias * e.cfg.speed * 0.45 * dt, 70, arena.clientWidth + 160);
    } else if (dist <= brain.attackRange && now - e.lastAtk >= e.cfg.atkCd * (enraged ? 0.7 : 1)) {
      e.state = "attack";
      e.strikeAt = now + 0.28;
      e.img.classList.remove("slash-pose");
      void e.img.offsetWidth;
      e.img.classList.add("slash-pose");
      setTimeout(() => e.img.classList.remove("slash-pose"), 330);
      AudioSys.roar();
    } else if (dist < brain.retreatRange && Math.random() < brain.retreatChance * dt * 3) {
      e.state = "retreat";
    } else {
      e.state = "seek";
      e.x = clamp(e.x + dirToHero * e.cfg.speed * (enraged ? 1.45 : 1) * dt, 70, arena.clientWidth + 160);
    }

    e.el.style.left = (e.x - e.cfg.w / 2) + "px";
    if (enraged && !e.el.classList.contains("enraged")) e.el.classList.add("enraged");
  }

  /* ---------- 挥剑 ---------- */
  function slash() {
    if (state !== "wave") return;
    const now = performance.now() / 1000;
    if (now - hero.lastSlash < HERO.atkCd) { queuedSlash = true; return; }
    doSlash(now);
  }

  function doSlash(now) {
    hero.lastSlash = now;
    AudioSys.slash();
    hero.el.classList.remove("slash-pose");
    void hero.el.offsetWidth;
    hero.el.classList.add("slash-pose");
    setTimeout(() => hero.el.classList.remove("slash-pose"), 360);

    const hw = heroWidth();
    const hr = hero.img.getBoundingClientRect();
    const ar = arena.getBoundingClientRect();
    const hwPx = hr.width;
    const hhPx = hr.height;

    // 剑的位置：主角身前
    const swX = hero.x + (hero.dir > 0 ? hwPx * 0.55 : -hwPx * 0.45);
    const swY = (hr.top - ar.top) + hhPx * 0.5;
    swordEl.style.left = swX + "px";
    swordEl.style.top = swY + "px";
    swordEl.classList.remove("slash");
    void swordEl.offsetWidth;
    swordEl.classList.add("slash");
    const inner = swordEl.querySelector("img");
    if (inner) inner.classList.toggle("flip", hero.dir < 0);

    // 剑气弧光
    bladeEl.style.left = (hero.dir > 0 ? hero.x + hwPx * 0.3 : hero.x - hwPx * 0.3 - 180) + "px";
    bladeEl.style.top = swY - 40 + "px";
    bladeEl.classList.remove("slash");
    void bladeEl.offsetWidth;
    bladeEl.classList.add("slash");

    // 判定
    const front = hero.x + (hero.dir > 0 ? hwPx * 0.45 : -hwPx * 0.45);
    const hitL = hero.dir > 0 ? front : front - HERO.reach;
    const hitR = hero.dir > 0 ? front + HERO.reach : front;
    enemies.forEach((e) => {
      if (e.dead) return;
      const ew = e.cfg.w;
      const el = e.x - ew / 2, er = e.x + ew / 2;
      if (er > hitL && el < hitR) damageEnemy(e, HERO.dmg);
    });
  }

  function damageEnemy(e, dmg) {
    e.hp -= dmg;
    if (e.state !== "stun") { e.state = "stun"; e.stunUntil = performance.now() / 1000 + 0.18; }
    AudioSys.hit();
    e.img.classList.remove("hurt");
    void e.img.offsetWidth;
    e.img.classList.add("hurt");
    e.x -= 34;
    e.el.style.left = (e.x - e.cfg.w / 2) + "px";
    spawnFloat(e.x, e.el.getBoundingClientRect().top - arena.getBoundingClientRect().top + 10, "-" + dmg);
    updateBossBar(e);
    e.el.querySelector(".hpbar .fill").style.width = Math.max(0, (e.hp / e.maxHp) * 100) + "%";
    if (e.hp <= 0) killEnemy(e);
  }

  function killEnemy(e) {
    e.dead = true;
    AudioSys.die();
    hero.hp = Math.min(hero.maxHp, hero.hp + HERO.killHeal);
    updateHeroBar();
    spawnFloat(e.x, arena.clientHeight * 0.42, "+" + HERO.killHeal, true);
    e.el.classList.add("dead");
    if (e.type === "boss") bossBarWrap.classList.remove("show");
    setTimeout(() => {
      e.el.remove();
      const i = enemies.indexOf(e);
      if (i >= 0) enemies.splice(i, 1);
      if (state === "wave" && enemies.length === 0) onWaveCleared();
    }, 520);
  }

  function damageHero(dmg) {
    const now = performance.now() / 1000;
    if (now < hero.hurtUntil) return;
    if (state !== "wave") return;
    hero.hurtUntil = now + 0.85;
    hero.hp -= dmg;
    AudioSys.hurt();
    hurtFlash.classList.remove("go");
    void hurtFlash.offsetWidth;
    hurtFlash.classList.add("go");
    arena.classList.remove("shake");
    void arena.offsetWidth;
    arena.classList.add("shake");
    updateHeroBar();
    hero.el.classList.remove("hurt");
    void hero.el.offsetWidth;
    hero.el.classList.add("hurt");
    spawnFloat(hero.x + heroWidth() * 0.5, arena.clientHeight * 0.5, "-" + dmg, true);
    if (hero.hp <= 0) { hero.hp = 0; updateHeroBar(); gameOver(false); }
  }

  function spawnFloat(x, y, txt, crit) {
    const d = document.createElement("div");
    d.className = "float-num" + (crit ? " crit" : "");
    d.textContent = txt;
    d.style.left = x + "px";
    d.style.top = y + "px";
    arena.appendChild(d);
    setTimeout(() => d.remove(), 850);
  }

  /* ---------- 场景 / 波次 / 对白 ---------- */
  function setScene(bg) {
    document.querySelectorAll(".scene-layer").forEach((l) => l.classList.toggle("active", l.dataset.bg === bg));
  }

  function renderDialogLine() {
    const line = dlgList[dlgIdx];
    dialogSpeaker.textContent = line.who;
    dialogSpeaker.className = "speaker " + (line.who === "旁白" ? "narrator" : (line.who === "角丝旁" ? "hero" : ""));
    dialogText.textContent = "";
    dialogNext.style.display = "none";
    dlgTyping = true;
    let i = 0;
    clearInterval(dlgTimer);
    dlgTimer = setInterval(() => {
      i += 1;
      dialogText.textContent = line.text.slice(0, i);
      if (i >= line.text.length) {
        clearInterval(dlgTimer); dlgTimer = null;
        dlgTyping = false;
        dialogNext.style.display = "block";
      }
    }, 26);
  }

  function showDialog(lines, onDone) {
    dlgList = lines;
    dlgIdx = 0;
    dlgOnDone = onDone || null;
    dialogEl.style.display = "block";
    renderDialogLine();
  }

  function advanceDialog() {
    if (dlgTyping) {
      clearInterval(dlgTimer); dlgTimer = null;
      dialogText.textContent = dlgList[dlgIdx].text;
      dialogNext.style.display = "block";
      dlgTyping = false;
      return;
    }
    dlgIdx += 1;
    if (dlgIdx < dlgList.length) { renderDialogLine(); return; }
    dialogEl.style.display = "none";
    const done = dlgOnDone;
    dlgOnDone = null;
    if (done) done();
  }

  function startWave(i) {
    waveIdx = i;
    setScene(WAVES[i].bg);
    waveTag.textContent = WAVES[i].title;
    // 第三关（黑风寨）使用暗色主角立绘
    if (hero && hero.img) {
      hero.img.src = "assets/" + (i >= 2 ? "hero-dark.png" : "hero.png");
    }
    showDialog(DIALOGS[i], () => {
      state = "wave";
      enemies = [];
      WAVES[i].spawns.forEach((s) => spawnEnemy(s[0], s[1]));
    });
  }

  function onWaveCleared() {
    if (waveIdx + 1 < WAVES.length) {
      setTimeout(() => startWave(waveIdx + 1), 700);
    } else {
      showDialog(VICTORY, () => showResult(true));
    }
  }

  /* ---------- 结果 ---------- */
  function showResult(win) {
    state = "over";
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    dialogEl.style.display = "none";
    if (win) {
      AudioSys.win();
      resultTitle.textContent = "行侠仗义";
      resultTitle.className = "title";
      resultDesc.textContent = "恶贼尽伏，侠名初传。";
    } else {
      AudioSys.lose();
      resultTitle.textContent = "力有不逮";
      resultTitle.className = "title fail";
      resultDesc.textContent = "你负伤倒下了……\n侠客也会暂败，养好伤，再战一场！";
    }
    $("#btnCh2").style.display = win ? "" : "none";
    resultOverlay.classList.add("open");
  }

  function gameOver(win) {
    if (win) {
      showDialog(VICTORY, () => showResult(true));
    } else {
      showDialog(DEFEAT, () => showResult(false));
    }
  }

  /* ---------- 输入 ---------- */
  function onPointerDown(ev) {
    AudioSys.init();
    // 对白打开时：点击=继续
    if (dialogEl.style.display !== "none") { advanceDialog(); return; }
    if (state === "wave") {
      if (ev.target && ev.target.closest && (ev.target.closest(".hud") || ev.target.closest(".touch-ctrl"))) return;
      slash();
    }
  }

  /* ---------- 主循环 ---------- */
  function loop(t) {
    const dt = Math.min(0.05, (t - lastTime) / 1000 || 0.016);
    lastTime = t;
    if (state === "wave" && hero) {
      let mx = 0;
      if (keys["ArrowLeft"] || keys["a"] || keys["A"] || touchHold.l) mx -= 1;
      if (keys["ArrowRight"] || keys["d"] || keys["D"] || touchHold.r) mx += 1;
      const minX = 30, maxX = Math.max(120, arena.clientWidth - heroWidth() - 24);
      if (mx !== 0) {
        hero.x = clamp(hero.x + mx * HERO.speed * dt, minX, maxX);
        hero.el.style.left = hero.x + "px";
        hero.dir = mx;
      }
      enemies.forEach((e) => updateEnemy(e, dt));
    }
    if (queuedSlash && state === "wave") {
      const nw = performance.now() / 1000;
      if (nw - hero.lastSlash >= HERO.atkCd) { queuedSlash = false; doSlash(nw); }
    }
    rafId = requestAnimationFrame(loop);
  }

  /* ---------- 触屏 ---------- */
  function setupTouch() {
    const L = $("#tleft"), R = $("#tright"), A = $("#tatk");
    const bind = (btn, on, off) => {
      const dn = (ev) => { ev.preventDefault(); on(); };
      const up = () => off();
      btn.addEventListener("pointerdown", dn);
      btn.addEventListener("pointerup", up);
      btn.addEventListener("pointercancel", up);
      btn.addEventListener("pointerleave", up);
    };
    bind(L, () => { touchHold.l = true; }, () => { touchHold.l = false; });
    bind(R, () => { touchHold.r = true; }, () => { touchHold.r = false; });
    bind(A, () => { slash(); }, () => {});
  }

  /* ---------- 初始化 ---------- */
  function init() {
    window.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", (ev) => {
      keys[ev.key] = true;
      AudioSys.init();
      if (ev.code === "Space" || ev.key === "j" || ev.key === "J") { ev.preventDefault(); onPointerDown({ target: document.body }); }
    });
    document.addEventListener("keyup", (ev) => { keys[ev.key] = false; });

    $("#btnTitle").addEventListener("click", () => { AudioSys.click(); location.href = "index.html"; });
    $("#btnRetry").addEventListener("click", () => { AudioSys.click(); location.reload(); });
    $("#btnCh2").addEventListener("click", () => { AudioSys.click(); location.href = "chapter2.html"; });
    $("#btnTitleEnd").addEventListener("click", () => { AudioSys.click(); location.href = "index.html"; });
    $("#btnMusic").addEventListener("click", () => {
      const m = AudioSys.isMuted();
      AudioSys.setMuted(!m);
      $("#btnMusic").textContent = m ? "♪ 音效：开" : "♪ 音效：关";
    });
    setupTouch();

    createHero();
    startWave(0);
    lastTime = performance.now();
    rafId = requestAnimationFrame(loop);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
