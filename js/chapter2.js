/* ============================================================
   《角丝旁行侠记》第二章：县衙之约
   视觉小说式剧情：对白 + 回忆插画
   ============================================================ */
"use strict";

(function () {
  const $ = (s) => document.querySelector(s);

  /* ---------- 回忆插画（SVG） ---------- */
  const CGS = {
    /* 宫廷：龙椅、面目不清的皇帝、莺歌燕舞的妃子 */
    court: '<svg viewBox="0 0 1280 720" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">' +
      '<defs><radialGradient id="cgCourt" cx="50%" cy="45%" r="58%"><stop offset="0" stop-color="#8a5a2a" stop-opacity=".55"/><stop offset="1" stop-color="#1a0e0a" stop-opacity="0"/></radialGradient></defs>' +
      '<rect width="1280" height="720" fill="#1a0e0e"/>' +
      '<rect width="1280" height="720" fill="url(#cgCourt)"/>' +
      '<path d="M 500 360 L 610 250 L 710 250 L 820 360 L 800 540 L 560 540 Z" fill="#4a3018" stroke="#8a6a3a" stroke-width="4"/>' +
      '<path d="M 610 250 L 660 170 L 710 250 Z" fill="#5a3a20"/>' +
      '<circle cx="660" cy="196" r="26" fill="#8a6a3a"/>' +
      '<g><ellipse cx="660" cy="356" rx="34" ry="30" fill="#0e0a0a"/><path d="M 606 388 Q 660 356 714 388 L 734 462 Q 660 486 586 462 Z" fill="#0e0a0a"/><rect x="606" y="462" width="108" height="62" fill="#0e0a0a"/></g>' +
      '<g fill="#2a1a1a" opacity=".92">' +
      '<g><circle cx="350" cy="468" r="18"/><path d="M 330 490 Q 350 468 370 490 L 382 540 Q 350 556 318 540 Z"/><path d="M 320 478 Q 288 456 310 498 Q 330 520 352 498" fill="none" stroke="#2a1a1a" stroke-width="10"/></g>' +
      '<g><circle cx="470" cy="512" r="16"/><path d="M 454 530 Q 470 512 486 530 L 494 568 Q 470 580 446 568 Z"/><path d="M 446 518 Q 420 500 438 536 Q 454 554 470 536" fill="none" stroke="#2a1a1a" stroke-width="9"/></g>' +
      '<g><circle cx="880" cy="468" r="18"/><path d="M 860 490 Q 880 468 900 490 L 912 540 Q 880 556 848 540 Z"/><path d="M 850 478 Q 818 456 840 498 Q 860 520 882 498" fill="none" stroke="#2a1a1a" stroke-width="10"/></g>' +
      '<g><circle cx="1000" cy="512" r="16"/><path d="M 984 530 Q 1000 512 1016 530 L 1024 568 Q 1000 580 976 568 Z"/><path d="M 976 518 Q 950 500 968 536 Q 984 554 1000 536" fill="none" stroke="#2a1a1a" stroke-width="9"/></g>' +
      '<g><circle cx="640" cy="548" r="15"/><path d="M 626 564 Q 640 548 654 564 L 660 596 Q 640 606 620 596 Z"/></g>' +
      '</g>' +
      '<g><ellipse cx="200" cy="150" rx="26" ry="32" fill="#c0392b" opacity=".8"/><rect x="194" y="112" width="12" height="14" fill="#d9b06a"/></g>' +
      '<g><ellipse cx="1080" cy="150" rx="26" ry="32" fill="#c0392b" opacity=".8"/><rect x="1074" y="112" width="12" height="14" fill="#d9b06a"/></g>' +
      '<rect width="1280" height="720" fill="#080404" opacity=".22"/></svg>',

    /* 村落：被烧杀抢掠、中央哭泣的孩子 */
    village: '<svg viewBox="0 0 1280 720" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">' +
      '<defs><radialGradient id="cgVil" cx="50%" cy="58%" r="62%"><stop offset="0" stop-color="#e86a2a" stop-opacity=".5"/><stop offset="1" stop-color="#1a0a06" stop-opacity="0"/></radialGradient></defs>' +
      '<rect width="1280" height="720" fill="#160a08"/>' +
      '<rect width="1280" height="720" fill="url(#cgVil)"/>' +
      '<g fill="#241008" stroke="#3a1a0c" stroke-width="3">' +
      '<path d="M 120 430 L 120 260 L 260 200 L 400 260 L 400 430 Z"/>' +
      '<path d="M 880 450 L 880 280 L 1020 220 L 1160 280 L 1160 450 Z"/>' +
      '</g>' +
      '<path d="M 220 300 C 200 340 200 372 220 392 C 240 372 240 340 220 300 Z" fill="#e86a2a"/>' +
      '<path d="M 240 312 C 230 342 230 362 244 382 C 258 362 258 342 240 312 Z" fill="#f0a040"/>' +
      '<path d="M 1020 322 C 1000 362 1000 392 1020 412 C 1040 392 1040 362 1020 322 Z" fill="#e86a2a"/>' +
      '<path d="M 1040 332 C 1030 362 1030 382 1044 402 C 1058 382 1058 362 1040 332 Z" fill="#f0a040"/>' +
      '<g stroke="#3a2a1a" stroke-width="10" fill="none" opacity=".5"><path d="M 200 238 Q 180 180 220 118 Q 250 68 230 26"/><path d="M 1060 258 Q 1080 200 1040 138 Q 1010 88 1030 38"/></g>' +
      '<g><ellipse cx="640" cy="502" rx="26" ry="24" fill="#0e0808"/><path d="M 612 526 Q 640 502 668 526 L 684 604 Q 640 622 596 604 Z" fill="#0e0808"/><path d="M 612 530 Q 580 542 570 572" stroke="#0e0808" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M 668 530 Q 700 542 710 572" stroke="#0e0808" stroke-width="10" fill="none" stroke-linecap="round"/><circle cx="628" cy="508" r="3" fill="#9ab8d0"/><circle cx="654" cy="508" r="3" fill="#9ab8d0"/><path d="M 640 526 Q 640 542 640 554" stroke="#9ab8d0" stroke-width="2" fill="none"/></g>' +
      '<rect width="1280" height="720" fill="#060202" opacity=".24"/></svg>',

    /* 母亲跪地抱婴、凶恶衙役、半袋米 */
    mother: '<svg viewBox="0 0 1280 720" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">' +
      '<defs><radialGradient id="cgMom" cx="50%" cy="55%" r="58%"><stop offset="0" stop-color="#b88a5a" stop-opacity=".22"/><stop offset="1" stop-color="#120c0a" stop-opacity="0"/></radialGradient></defs>' +
      '<rect width="1280" height="720" fill="#120c0a"/>' +
      '<rect width="1280" height="720" fill="url(#cgMom)"/>' +
      '<g fill="#0e0808"><ellipse cx="430" cy="520" rx="24" ry="22"/><path d="M 404 542 Q 430 520 456 542 L 470 644 Q 430 664 390 644 Z"/><path d="M 404 546 Q 380 560 366 592" stroke="#0e0808" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M 456 546 Q 480 560 494 592" stroke="#0e0808" stroke-width="10" fill="none" stroke-linecap="round"/><ellipse cx="440" cy="592" rx="26" ry="20" fill="#2a1a14"/><circle cx="442" cy="586" r="12" fill="#3a241c"/></g>' +
      '<g fill="#1a1410"><ellipse cx="860" cy="502" rx="30" ry="28"/><path d="M 828 530 Q 860 502 892 530 L 910 644 Q 860 666 810 644 Z"/><path d="M 822 522 Q 790 502 800 482 Q 806 494 816 498" fill="#1a1410"/><path d="M 898 522 Q 930 502 920 482 Q 914 494 904 498" fill="#1a1410"/><path d="M 830 494 Q 860 468 890 494 L 886 508 Q 860 490 834 508 Z" fill="#0e0a08"/><rect x="920" y="418" width="12" height="222" rx="6" fill="#5a3a22" stroke="#3a2418" stroke-width="2" transform="rotate(14 926 529)"/></g>' +
      '<g><path d="M 560 602 Q 600 582 640 602 L 640 642 Q 600 658 560 642 Z" fill="#b8a878" stroke="#8a7a4a" stroke-width="3"/><path d="M 560 602 Q 600 594 640 602" stroke="#8a7a4a" stroke-width="3" fill="none"/><g fill="#e8dcb0"><circle cx="660" cy="628" r="2.6"/><circle cx="674" cy="634" r="2.4"/><circle cx="650" cy="638" r="2.2"/><circle cx="686" cy="628" r="2.6"/><circle cx="698" cy="636" r="2.2"/><circle cx="666" cy="646" r="2"/><circle cx="700" cy="650" r="2.2"/><circle cx="640" cy="650" r="2"/></g></g>' +
      '<rect width="1280" height="720" fill="#080404" opacity=".28"/></svg>',

    /* 写信：烛下伏案 */
    letter: '<svg viewBox="0 0 1280 720" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">' +
      '<defs><radialGradient id="cgLet" cx="38%" cy="52%" r="42%"><stop offset="0" stop-color="#f0a040" stop-opacity=".5"/><stop offset="1" stop-color="#100c14" stop-opacity="0"/></radialGradient></defs>' +
      '<rect width="1280" height="720" fill="#100c14"/>' +
      '<rect width="1280" height="720" fill="url(#cgLet)"/>' +
      '<rect x="900" y="118" width="240" height="300" rx="6" fill="#1c2434" stroke="#3a2a1a" stroke-width="5"/>' +
      '<rect x="912" y="130" width="100" height="130" fill="#3a4a66" opacity=".7"/>' +
      '<rect x="1024" y="130" width="100" height="130" fill="#3a4a66" opacity=".7"/>' +
      '<circle cx="1020" cy="98" r="40" fill="#e8dcb0" opacity=".92"/>' +
      '<rect x="200" y="430" width="640" height="20" rx="4" fill="#4a3018" stroke="#2a1a0e" stroke-width="2"/>' +
      '<rect x="220" y="450" width="18" height="100" fill="#3a2414"/>' +
      '<rect x="800" y="450" width="18" height="100" fill="#3a2414"/>' +
      '<rect x="700" y="358" width="8" height="82" fill="#8a6a3a"/>' +
      '<path d="M 692 354 L 716 354 L 712 338 L 696 338 Z" fill="#d9b06a"/>' +
      '<path d="M 704 298 C 698 320 696 328 696 336 C 696 344 700 348 704 348 C 708 348 712 344 712 336 C 712 328 710 320 704 298 Z" fill="#f0a040"/>' +
      '<path d="M 704 310 C 701 324 700 330 700 336 C 700 341 702 344 704 344 C 706 344 708 341 708 336 C 708 330 707 324 704 310 Z" fill="#ffdf90"/>' +
      '<g transform="rotate(-3 400 400)"><rect x="260" y="368" width="280" height="60" rx="4" fill="#e8dcc0"/><g stroke="#8a7a5a" stroke-width="2"><line x1="280" y1="386" x2="500" y2="386"/><line x1="280" y1="398" x2="500" y2="398"/><line x1="280" y1="410" x2="440" y2="410"/></g></g>' +
      '<g fill="#0e0a12"><ellipse cx="420" cy="338" rx="26" ry="24"/><path d="M 392 360 Q 420 338 448 360 L 464 472 Q 420 492 376 472 Z"/><path d="M 448 370 Q 480 358 500 348" stroke="#0e0a12" stroke-width="9" fill="none" stroke-linecap="round"/><line x1="498" y1="348" x2="492" y2="328" stroke="#3a2a1a" stroke-width="4" stroke-linecap="round"/></g>' +
      '<rect width="1280" height="720" fill="#06040a" opacity=".24"/></svg>'
  };

  /* ---------- 第二章剧本 ---------- */
  const EVENTS = [
    { type: "say", who: "角丝旁", text: "山下扰民恶匪，已然尽数肃清。" },
    { type: "say", who: "县长", text: "多谢大侠出手相助。" },
    { type: "say", who: "县长", text: "些许薄礼，还望大侠收下。" },
    { type: "action", text: "（追问）" },
    { type: "say", who: "角丝旁", text: "县中小贼作乱，本是官府之事，现在为何反倒劳我一介闲人出手？" },
    { type: "say", who: "县长", text: "（叹气）大侠久居山林，不问俗世，不知当下世道早已大乱。" },
    { type: "banner", text: "回 忆" },
    { type: "cg", cg: "court", who: "县长", text: "当今君主昏庸荒政，耽于享乐、沉迷声色。" },
    { type: "cg", cg: "village", who: "县长", text: "民间税赋一年重过一年，朝廷搜刮民脂，十成尽数供帝王享乐，半分也不肯用来安抚百姓。" },
    { type: "cg", cg: "mother", who: "县长", text: "寻常民户年产米斤八石，官府却强征十石税粮。" },
    { type: "cg", cg: "letter", who: "县长", text: "我屡次上疏陈情，字字恳切，皆是石沉大海。府衙库空，衙役俸禄无从支取，众人无以为生，尽数辞官离去。" },
    { type: "banner", text: "回 到 当 下" },
    { type: "say", who: "角丝旁", text: "世道如此，为何不反？" },
    { type: "say", who: "县长", text: "大侠有所不知，天下早已多有起事之人。只是我县地狭人寡，百姓常年饥寒缠身，身无余力。有心反抗者，甚至算不上义士，顶多称得上是流离流民、乱世刁民罢了。" },
    { type: "say", who: "县长", text: "更别说我县紧邻深山，山中猛虎横行，时常下山伤人。曾有青壮子弟欲进山除虎，反倒白白葬身兽口，枉送性命啊。" },
    { type: "say", who: "角丝旁", text: "已有多少百姓因此受伤？" },
    { type: "say", who: "县长", text: "唉，短短三月，足有二十余人啊……！" },
    { type: "say", who: "角丝旁", text: "……我知晓了，明日我便动身。此番行事……便不必付我酬劳了。" },
    { type: "say", who: "县长", text: "（掩面哭泣）多谢大侠！多谢大侠！我铚县上下百姓，皆要感念大侠恩德！" },
    { type: "say", who: "县长", text: "恕在下失了分寸，按理我本该规劝你前路凶险，切勿涉险，可眼下实在别无他法，县中百姓，快要撑不下去了。" },
    { type: "say", who: "县长", text: "大侠，大侠！我实在不知该如何报答你。" },
    { type: "action", text: "（县长作势就要下跪，你连忙将他扶起。）" },
    { type: "end" }
  ];

  /* ---------- DOM ---------- */
  const heroEl = $("#c2Hero");
  const magEl = $("#c2Mag");
  const cgEl = $("#c2Cg");
  const cgInner = $("#c2CgInner");
  const bannerEl = $("#c2Banner");
  const bannerText = $("#c2BannerText");
  const dialogEl = $("#c2Dialog");
  const speakerEl = $("#c2DialogSpeaker");
  const textEl = $("#c2DialogText");
  const nextEl = $("#c2DialogNext");
  const endEl = $("#c2End");
  const progressEl = $("#c2Progress");

  let idx = 0;
  let typing = false;
  let timer = null;

  /* ---------- 角色光效 ---------- */
  function setSpeaker(who) {
    if (who === "角丝旁") {
      heroEl.classList.add("speaking"); heroEl.classList.remove("dim", "hidden");
      magEl.classList.add("dim"); magEl.classList.remove("speaking", "hidden");
    } else if (who === "县长") {
      magEl.classList.add("speaking"); magEl.classList.remove("dim", "hidden");
      heroEl.classList.add("dim"); heroEl.classList.remove("speaking", "hidden");
    } else {
      heroEl.classList.remove("speaking", "dim");
      magEl.classList.remove("speaking", "dim");
    }
    speakerEl.className = "speaker " + (who === "旁白" ? "narrator" : (who === "角丝旁" ? "hero" : "official"));
  }

  /* ---------- 回忆插画 ---------- */
  function showCg(id) {
    if (id) {
      cgInner.innerHTML = CGS[id];
      cgEl.classList.add("open");
      heroEl.classList.add("hidden");
      magEl.classList.add("hidden");
    } else {
      cgEl.classList.remove("open");
      heroEl.classList.remove("hidden");
      magEl.classList.remove("hidden");
    }
  }

  /* ---------- 打字机 ---------- */
  function typeText(who, text) {
    dialogEl.style.display = "block";
    speakerEl.textContent = who;
    setSpeaker(who);
    textEl.textContent = "";
    nextEl.style.display = "none";
    typing = true;
    let i = 0;
    clearInterval(timer);
    timer = setInterval(() => {
      i += 1;
      textEl.textContent = text.slice(0, i);
      if (i >= text.length) {
        clearInterval(timer); timer = null;
        typing = false;
        nextEl.style.display = "block";
      }
    }, 22);
  }

  /* ---------- 渲染当前事件 ---------- */
  function render() {
    const ev = EVENTS[idx];
    progressEl.textContent = "第二章 · " + (idx + 1) + " / " + EVENTS.length;

    if (ev.type === "banner") {
      dialogEl.style.display = "none";
      showCg(null);
      bannerText.textContent = ev.text;
      bannerEl.classList.add("open");
      return;
    }
    bannerEl.classList.remove("open");
    if (ev.type === "cg") {
      showCg(ev.cg);
      typeText(ev.who, ev.text);
      return;
    }
    showCg(null);
    if (ev.type === "say") {
      typeText(ev.who, ev.text);
    } else if (ev.type === "action") {
      typeText("旁白", ev.text);
    } else if (ev.type === "end") {
      dialogEl.style.display = "none";
      endEl.classList.add("open");
    }
  }

  /* ---------- 前进 ---------- */
  function advance() {
    if (bannerEl.classList.contains("open")) {
      bannerEl.classList.remove("open");
      idx += 1;
      render();
      return;
    }
    if (typing) {
      clearInterval(timer); timer = null;
      const ev = EVENTS[idx];
      textEl.textContent = ev.text;
      nextEl.style.display = "block";
      typing = false;
      return;
    }
    idx += 1;
    if (idx < EVENTS.length) { render(); return; }
  }

  /* ---------- 输入 ---------- */
  function onPointerDown() {
    AudioSys.init();
    if (endEl.classList.contains("open")) return;
    advance();
  }

  /* ---------- 初始化 ---------- */
  let thunderTimer = null;

  function init() {
    // 窗外雷声：约每 3.6 秒一次闷雷（与闪电动画节奏呼应）
    thunderTimer = setInterval(() => {
      try { AudioSys.thunder(); } catch (e) {}
    }, 3600);
    window.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", (ev) => {
      AudioSys.init();
      if (ev.code === "Space" || ev.key === "j" || ev.key === "J") { ev.preventDefault(); onPointerDown(); }
    });
    $("#c2BtnMusic").addEventListener("click", () => {
      const m = AudioSys.isMuted();
      AudioSys.setMuted(!m);
      $("#c2BtnMusic").textContent = m ? "♪ 音效：开" : "♪ 音效：关";
    });
    $("#c2BtnReplay").addEventListener("click", () => { AudioSys.click(); location.reload(); });
    $("#c2BtnCh1").addEventListener("click", () => { AudioSys.click(); location.href = "game.html"; });
    $("#c2BtnTitle").addEventListener("click", () => { AudioSys.click(); location.href = "index.html"; });
    render();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
