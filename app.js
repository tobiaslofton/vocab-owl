(() => {
  const DATA = window.VOCAB_OWL_DATA;

  const STAGES = [
    { id: 0, name: "Core Basics", bands: [1, 2], meaningCount: 4, foilCheckCount: 1 },
    { id: 1, name: "Intermediate", bands: [3, 4], meaningCount: 3, foilCheckCount: 2 },
    { id: 2, name: "Advanced", bands: [5, 6], meaningCount: 3, foilCheckCount: 2 },
    { id: 3, name: "Expert", bands: [7, 8], meaningCount: 3, foilCheckCount: 2 },
    { id: 4, name: "Grandmaster", bands: [9, 10], meaningCount: 3, foilCheckCount: 2 }
  ]; // 25 verified rounds total

  const ARCHETYPES = [
    { max: 7000, title: "The Everyday Conversationalist", desc: "Clear, grounded, and practical—you stick to high-utility language." },
    { max: 14000, title: "The Sharp Generalist", desc: "Strong command of modern journalism, business, and everyday reading." },
    { max: 22000, title: "The Editorial Mind", desc: "Broad command of nuance, tone, and high-signal nonfiction." },
    { max: 31000, title: "The Precision Wordsmith", desc: "Rarely stumped—you catch subtle distinctions most readers skim past." },
    { max: 40000, title: "The Lexicon Heavyweight", desc: "Deep literary and technical range well into the upper percentiles." },
    { max: Infinity, title: "The Grandmaster Archivist", desc: "Outlier territory—you actually know the Grandmaster words." }
  ];

  function mulberry32(seed) {
    let a = seed >>> 0;
    return () => {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function dateSeed() {
    const now = new Date();
    const key = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
    let h = 2166136261;
    for (let i = 0; i < key.length; i++) {
      h ^= key.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return { seed: h >>> 0, label: now.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) };
  }

  function shuffle(arr, rng) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  // Subtle Web Audio UI feedback
  let audioCtx = null;
  let soundEnabled = true;
  function playTone(freq, duration = 0.08) {
    if (!soundEnabled) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration + 0.01);
    } catch (_) {}
  }

  const state = {
    mode: "daily",
    questions: [],
    idx: 0,
    streak: 0,
    answers: [],
    locked: false,
    result: null,
    previewFormat: "story"
  };

  const $ = (id) => document.getElementById(id);
  const views = {
    landing: $("view-landing"),
    arena: $("view-arena"),
    results: $("view-results")
  };

  function showView(name) {
    Object.entries(views).forEach(([k, el]) => el.classList.toggle("active", k === name));
  }

  function buildQuestions(mode) {
    const rng = mode === "daily" ? mulberry32(dateSeed().seed) : Math.random;
    const byBand = new Map();
    DATA.realWords.forEach((item) => {
      if (!byBand.has(item.b)) byBand.set(item.b, []);
      byBand.get(item.b).push({ ...item, isFoil: false });
    });

    const foilPool = shuffle(DATA.foils, rng).map((f) => ({ ...f, b: 0, isFoil: true }));
    let foilCursor = 0;
    const deck = [];

    for (const stage of STAGES) {
      const pool = [];
      for (const b of stage.bands) {
        pool.push(...(byBand.get(b) || []));
      }
      const pickedReal = shuffle(pool, rng);
      const meaningWords = pickedReal.slice(0, stage.meaningCount).map((w) => ({
        kind: "meaning",
        stageId: stage.id,
        stageName: stage.name,
        word: w
      }));

      // Spot-the-word rounds mix real words (from remaining pool) + fake foils
      const spotItems = [];
      const realSpot = pickedReal.slice(stage.meaningCount, stage.meaningCount + 1);
      const foilNeeded = stage.foilCheckCount;
      for (let i = 0; i < foilNeeded; i++) {
        // Alternate or include real words in spot rounds so players can't guess "always fake"
        if (i === 0 && realSpot.length > 0 && rng() > 0.45) {
          spotItems.push({
            kind: "spot",
            stageId: stage.id,
            stageName: stage.name,
            word: realSpot[0]
          });
        } else if (foilCursor < foilPool.length) {
          spotItems.push({
            kind: "spot",
            stageId: stage.id,
            stageName: stage.name,
            word: foilPool[foilCursor++]
          });
        }
      }

      deck.push(...shuffle([...meaningWords, ...spotItems], rng));
    }
    return deck;
  }

  function startRun(mode) {
    state.mode = mode;
    state.questions = buildQuestions(mode);
    state.idx = 0;
    state.streak = 0;
    state.answers = [];
    state.locked = false;
    showView("arena");
    renderQuestion();
  }

  function renderQuestion() {
    state.locked = false;
    const q = state.questions[state.idx];

    // Update 5 stage pips
    document.querySelectorAll(".stage-pip").forEach((el) => {
      const sid = Number(el.dataset.stage);
      el.classList.toggle("done", sid < q.stageId);
      el.classList.toggle("active", sid === q.stageId);
    });

    $("hud-progress-text").textContent = `Question ${state.idx + 1} of ${state.questions.length}`;
    $("hud-streak").textContent = `Streak: ${state.streak}`;
    $("q-pos").textContent = q.word.pos;
    $("q-word").textContent = q.word.w;
    $("q-feedback").className = "q-feedback hidden";

    const optBox = $("q-options");
    optBox.innerHTML = "";

    if (q.kind === "meaning") {
      $("q-type-badge").textContent = "Prove Meaning";
      $("q-prompt").textContent = "Choose the true definition (skipping beats guessing wrong):";
      optBox.className = "q-options";

      const choices = shuffle(
        [
          { label: q.word.d, isCorrect: true },
          ...q.word.x.map((d) => ({ label: d, isCorrect: false }))
        ],
        Math.random
      );

      choices.forEach((c) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "opt-btn";
        btn.textContent = c.label;
        btn.addEventListener("click", () => handleAnswer(q, c.isCorrect ? "correct" : "wrong", btn, q.word.d));
        optBox.appendChild(btn);
      });

      const skipBtn = document.createElement("button");
      skipBtn.type = "button";
      skipBtn.className = "opt-btn skip-btn";
      skipBtn.textContent = "I don't know this word";
      skipBtn.addEventListener("click", () => handleAnswer(q, "skip", skipBtn, q.word.d));
      optBox.appendChild(skipBtn);
    } else {
      $("q-type-badge").textContent = "Real or Fake?";
      $("q-prompt").textContent = "Is this a real English word or a made-up foil?";
      optBox.className = "q-options two-col";

      const isReal = !q.word.isFoil;
      const realBtn = document.createElement("button");
      realBtn.type = "button";
      realBtn.className = "opt-btn";
      realBtn.textContent = "Real English Word";
      realBtn.addEventListener("click", () =>
        handleAnswer(q, isReal ? "correct" : "wrong", realBtn, isReal ? q.word.d : "Made-up foil word!")
      );

      const fakeBtn = document.createElement("button");
      fakeBtn.type = "button";
      fakeBtn.className = "opt-btn";
      fakeBtn.textContent = "Made-Up Foil";
      fakeBtn.addEventListener("click", () =>
        handleAnswer(q, !isReal ? "correct" : "wrong", fakeBtn, isReal ? q.word.d : "Made-up foil word!")
      );

      optBox.appendChild(realBtn);
      optBox.appendChild(fakeBtn);
    }
  }

  function handleAnswer(q, outcome, clickedBtn, explanation) {
    if (state.locked) return;
    state.locked = true;

    const buttons = $("q-options").querySelectorAll("button");
    buttons.forEach((b) => (b.disabled = true));

    if (outcome === "correct") {
      state.streak += 1;
      clickedBtn.classList.add("correct");
      playTone(580);
    } else if (outcome === "wrong") {
      state.streak = 0;
      clickedBtn.classList.add("wrong");
      playTone(240, 0.12);
    } else {
      state.streak = 0;
      playTone(360, 0.06);
    }

    state.answers.push({ q, outcome });

    const fb = $("q-feedback");
    const fbTitle = $("fb-title");
    const fbDetail = $("fb-detail");
    fb.classList.remove("hidden", "good", "bad", "neutral");

    if (outcome === "correct") {
      fb.classList.add("good");
      fbTitle.textContent = q.word.isFoil ? "Foil Spotted!" : "Verified!";
      fbDetail.textContent = explanation;
    } else if (outcome === "wrong") {
      fb.classList.add("bad");
      fbTitle.textContent = q.word.isFoil ? "Gotcha — Fake Word!" : "Not Quite";
      fbDetail.textContent = `${q.word.w}: ${explanation}`;
    } else {
      fb.classList.add("neutral");
      fbTitle.textContent = "Skipped (No Penalty)";
      fbDetail.textContent = `${q.word.w}: ${explanation}`;
    }

    setTimeout(() => {
      state.idx += 1;
      if (state.idx < state.questions.length) {
        renderQuestion();
      } else {
        computeResults();
      }
    }, 950);
  }

  function computeResults() {
    // Score each band based on verified real-word performance
    let rawVocab = 0;
    let prevCap = 0;

    for (const bandInfo of DATA.bands) {
      const bandAns = state.answers.filter((a) => !a.q.word.isFoil && a.q.word.b === bandInfo.band);
      const bandWidth = bandInfo.approxVocab - prevCap;
      if (bandAns.length > 0) {
        const correct = bandAns.filter((a) => a.outcome === "correct").length;
        const wrong = bandAns.filter((a) => a.outcome === "wrong").length;
        const rate = Math.max(0, (correct - wrong * 0.25) / bandAns.length);
        rawVocab += bandWidth * rate;
      }
      prevCap = bandInfo.approxVocab;
    }

    const foilAns = state.answers.filter((a) => a.q.word.isFoil);
    const foilsCaught = foilAns.filter((a) => a.outcome === "correct").length;
    const foilPenalty = foilAns.length ? 0.72 + 0.28 * (foilsCaught / foilAns.length) : 1;

    const finalVocab = Math.max(1200, Math.round((rawVocab * foilPenalty) / 100) * 100);
    const margin = Math.max(400, Math.round((finalVocab * 0.055) / 100) * 100);
    const percentile = Math.max(1, Math.min(99, Math.round(100 - Math.min(98, (finalVocab / 45000) * 95))));
    const archetype = ARCHETYPES.find((a) => finalVocab <= a.max) || ARCHETYPES[ARCHETYPES.length - 1];

    const totalCorrect = state.answers.filter((a) => a.outcome === "correct").length;
    const verifiedReal = state.answers
      .filter((a) => !a.q.word.isFoil && a.outcome === "correct")
      .map((a) => a.q.word)
      .sort((a, b) => b.b - a.b);
    const rarestWord = verifiedReal.length ? verifiedReal[0].w : "—";

    const stageStats = STAGES.map((st) => {
      const rows = state.answers.filter((a) => a.q.stageId === st.id);
      const ok = rows.filter((a) => a.outcome === "correct").length;
      return { name: st.name, ok, total: rows.length };
    });

    const highestPassed = stageStats.filter((s) => s.ok >= Math.ceil(s.total * 0.6)).pop();
    const highestStageLabel = highestPassed ? `Mastered ${highestPassed.name}` : "Reached Stage 1 · Core Basics";

    state.result = {
      vocab: finalVocab,
      margin,
      percentile,
      archetype,
      totalCorrect,
      totalQuestions: state.questions.length,
      foilsCaught,
      foilsTotal: foilAns.length,
      rarestWord,
      stageStats,
      highestStageLabel
    };

    renderResults();
    showView("results");
  }

  const AFFILIATE_TAGS = {
    amazonTag: "algernon123-20"
  };

  function buildAffiliateOffers(vocab) {
    const amz = (q) =>
      `https://www.amazon.com/s?k=${encodeURIComponent(q)}&tag=${encodeURIComponent(AFFILIATE_TAGS.amazonTag)}`;

    if (vocab < 14000) {
      return [
        { title: "Word Power Made Easy — Norman Lewis", sub: "Classic root-word builder to climb into Stage 4+", cta: "View on Amazon", url: amz("Word Power Made Easy Norman Lewis") },
        { title: "Audible Free Trial (2 Audiobooks)", sub: "Absorb richer vocabulary on your commute", cta: "Try Free", url: amz("Audible membership trial") }
      ];
    }
    if (vocab < 30000) {
      return [
        { title: "Garner's Modern English Usage", sub: "Sharpen precision for Editorial & Wordsmith tiers", cta: "View on Amazon", url: amz("Garner's Modern English Usage") },
        { title: "Kindle Unlimited", sub: "Read unlimited literary & nonfiction backlists", cta: "Explore", url: amz("Kindle Unlimited") }
      ];
    }
    return [
      { title: "The Dictionary of Obscure Sorrows", sub: "Grandmaster-tier neologisms & rare literary prose", cta: "View on Amazon", url: amz("The Dictionary of Obscure Sorrows") },
      { title: "The Elements of Eloquence — Mark Forsyth", sub: "Master rhetorical craft behind rare English words", cta: "View on Amazon", url: amz("The Elements of Eloquence Mark Forsyth") }
    ];
  }

  function renderResults() {
    const r = state.result;
    $("result-mode-pill").textContent = state.mode === "daily" ? "Today's Challenge Complete" : "Practice Run Complete";
    $("result-vocab").textContent = r.vocab.toLocaleString();
    $("result-range").textContent = `± ${r.margin.toLocaleString()} words · Est. Top ${r.percentile}%`;
    $("result-highest-stage").textContent = r.highestStageLabel;
    $("result-archetype").textContent = r.archetype.title;
    $("result-archetype-desc").textContent = r.archetype.desc;
    $("result-accuracy").textContent = `${r.totalCorrect} / ${r.totalQuestions}`;
    $("result-foils").textContent = `${r.foilsCaught} / ${r.foilsTotal}`;
    $("result-rarest").textContent = r.rarestWord;

    const sb = $("stage-breakdown");
    sb.innerHTML = "";
    r.stageStats.forEach((s) => {
      const row = document.createElement("div");
      row.className = "stage-row";
      row.innerHTML = `<span>${s.name}</span><strong>${s.ok} / ${s.total}</strong>`;
      sb.appendChild(row);
    });

    const affBox = $("affiliate-box");
    const affLinks = $("affiliate-links");
    affLinks.innerHTML = "";
    buildAffiliateOffers(r.vocab).forEach((offer) => {
      const a = document.createElement("a");
      a.className = "aff-link";
      a.href = offer.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer sponsored";
      a.innerHTML = `<div><strong>${offer.title}</strong><small>${offer.sub}</small></div><span class="aff-cta">${offer.cta}</span>`;
      affLinks.appendChild(a);
    });
    affBox.classList.remove("hidden");

    drawShareCard(state.previewFormat);
  }

  function drawShareCard(format) {
    const canvas = $("share-canvas");
    const ctx = canvas.getContext("2d");
    const isStory = format === "story";
    canvas.width = isStory ? 1080 : 1200;
    canvas.height = isStory ? 1920 : 630;
    const W = canvas.width;
    const H = canvas.height;
    const r = state.result;

    // Warm cream editorial card
    ctx.fillStyle = "#FAF6EE";
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "#FEF3C7";
    ctx.beginPath();
    ctx.arc(W * 0.85, H * 0.16, isStory ? 300 : 190, 0, Math.PI * 2);
    ctx.fill();

    const pad = isStory ? 64 : 44;
    ctx.fillStyle = "#FFFFFF";
    ctx.strokeStyle = "#E5DCCB";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(pad, pad, W - pad * 2, H - pad * 2, 34);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#78350F";
    ctx.font = `700 ${isStory ? 46 : 32}px Georgia, serif`;
    ctx.fillText("VocabOwl", pad + 56, pad + (isStory ? 110 : 76));

    ctx.fillStyle = "#6B635B";
    ctx.font = `700 ${isStory ? 24 : 18}px sans-serif`;
    ctx.fillText(
      state.mode === "daily" ? "5-STAGE DAILY CHALLENGE" : "5-STAGE VERIFIED LEXICON",
      pad + 56,
      pad + (isStory ? 155 : 108)
    );

    if (isStory) {
      ctx.fillStyle = "#6B635B";
      ctx.font = "700 30px sans-serif";
      ctx.fillText("VERIFIED VOCABULARY", pad + 56, 460);

      ctx.fillStyle = "#D97706";
      ctx.font = "700 166px Georgia, serif";
      ctx.fillText(r.vocab.toLocaleString(), pad + 56, 630);

      ctx.fillStyle = "#1C1917";
      ctx.font = "700 40px sans-serif";
      ctx.fillText(`words · Est. Top ${r.percentile}%`, pad + 56, 700);

      ctx.fillStyle = "#F2EADB";
      ctx.beginPath();
      ctx.roundRect(pad + 56, 800, W - (pad + 56) * 2, 230, 22);
      ctx.fill();

      ctx.fillStyle = "#92400E";
      ctx.font = "700 24px sans-serif";
      ctx.fillText(r.highestStageLabel.toUpperCase(), pad + 94, 865);

      ctx.fillStyle = "#1C1917";
      ctx.font = "700 46px Georgia, serif";
      ctx.fillText(r.archetype.title, pad + 94, 938);

      const items = [
        ["VERIFIED ACCURACY", `${r.totalCorrect} / ${r.totalQuestions}`],
        ["FAKE WORDS CAUGHT", `${r.foilsCaught} / ${r.foilsTotal}`],
        ["RAREST WORD MASTERED", r.rarestWord]
      ];
      items.forEach(([k, v], i) => {
        const y = 1170 + i * 145;
        ctx.fillStyle = "#6B635B";
        ctx.font = "700 24px sans-serif";
        ctx.fillText(k, pad + 56, y);
        ctx.fillStyle = "#1C1917";
        ctx.font = "700 54px Georgia, serif";
        ctx.fillText(v, pad + 56, y + 60);
      });

      ctx.fillStyle = "#92400E";
      ctx.font = "700 30px sans-serif";
      ctx.fillText("Can you survive Stage 5 on VocabOwl?", pad + 56, H - pad - 68);
    } else {
      ctx.fillStyle = "#D97706";
      ctx.font = "700 108px Georgia, serif";
      ctx.fillText(r.vocab.toLocaleString(), pad + 56, 285);

      ctx.fillStyle = "#1C1917";
      ctx.font = "700 28px sans-serif";
      ctx.fillText(`words · Est. Top ${r.percentile}% · ${r.archetype.title}`, pad + 56, 338);

      ctx.fillStyle = "#6B635B";
      ctx.font = "700 22px sans-serif";
      ctx.fillText(
        `Score: ${r.totalCorrect}/${r.totalQuestions}   |   Foils Caught: ${r.foilsCaught}/${r.foilsTotal}   |   Rarest: ${r.rarestWord}`,
        pad + 56,
        435
      );

      ctx.fillStyle = "#92400E";
      ctx.font = "700 22px sans-serif";
      ctx.fillText("Challenge: Beat this verified score on VocabOwl", pad + 56, H - pad - 44);
    }
  }

  function downloadCanvas(format) {
    drawShareCard(format);
    const canvas = $("share-canvas");
    const link = document.createElement("a");
    link.download = `vocabowl-${format}-${state.result.vocab}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    drawShareCard(state.previewFormat);
  }

  function challengeUrl() {
    const u = new URL(window.location.href);
    u.searchParams.set("challenge", String(state.result.vocab));
    return u.toString();
  }

  $("daily-date-label").textContent = `Today's 25-word climb (${dateSeed().label})`;
  const params = new URLSearchParams(window.location.search);
  if (params.get("challenge")) {
    const target = Number(params.get("challenge"));
    if (target > 0) {
      const banner = $("challenge-banner");
      banner.textContent = `Friend Challenge: Beat ${target.toLocaleString()} verified words!`;
      banner.classList.remove("hidden");
    }
  }

  $("brand-home").addEventListener("click", () => showView("landing"));
  $("sound-toggle").addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    $("sound-label").textContent = `Sound: ${soundEnabled ? "On" : "Off"}`;
  });
  $("btn-start-daily").addEventListener("click", () => startRun("daily"));
  $("btn-start-adaptive").addEventListener("click", () => startRun("adaptive"));
  $("btn-play-again").addEventListener("click", () => showView("landing"));

  $("tab-story").addEventListener("click", () => {
    state.previewFormat = "story";
    $("tab-story").classList.add("active");
    $("tab-feed").classList.remove("active");
    drawShareCard("story");
  });
  $("tab-feed").addEventListener("click", () => {
    state.previewFormat = "feed";
    $("tab-feed").classList.add("active");
    $("tab-story").classList.remove("active");
    drawShareCard("feed");
  });

  $("btn-dl-story").addEventListener("click", () => downloadCanvas("story"));
  $("btn-dl-feed").addEventListener("click", () => downloadCanvas("feed"));
  $("btn-copy-link").addEventListener("click", async () => {
    const url = challengeUrl();
    try {
      await navigator.clipboard.writeText(url);
      $("btn-copy-link").textContent = "Copied!";
      setTimeout(() => ($("btn-copy-link").textContent = "Copy Challenge Link"), 1800);
    } catch {
      prompt("Copy your challenge link:", url);
    }
  });
  $("btn-share-x").addEventListener("click", () => {
    const r = state.result;
    const text = `My verified VocabOwl score is ${r.vocab.toLocaleString()} words (${r.totalCorrect}/${r.totalQuestions} · Rarest: "${r.rarestWord}"). Can you survive Stage 5?`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(challengeUrl())}`, "_blank");
  });
  $("btn-share-li").addEventListener("click", () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(challengeUrl())}`, "_blank");
  });
})();
