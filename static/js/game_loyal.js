document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("loyal-game-page");
  if (!root) {
    return;
  }

  const sessionUuid = root.dataset.sessionUuid;
  const canvas = document.getElementById("loyal-canvas");
  const ctx = canvas.getContext("2d");
  const startButton = document.getElementById("loyal-start-button");
  const retryButton = document.getElementById("loyal-retry-button");
  const playAgainButton = document.getElementById("play-again-button");
  const reviveButton = document.getElementById("revive-button");
  const restartButton = document.getElementById("restart-button");
  const liveScore = document.getElementById("loyal-live-score");
  const secondaryValue = document.getElementById("loyal-secondary-value");
  const eventTitle = document.getElementById("loyal-event-title");
  const resultTitle = document.getElementById("loyal-result-title");
  const resultCopy = document.getElementById("loyal-result-copy");
  const smileGaugeFill = document.getElementById("smile-gauge-fill");
  const rankBanner = document.getElementById("loyal-rank-banner");
  const adPopupOverlay = document.getElementById("ad-popup-overlay");
  const gameOverOverlay = document.getElementById("game-over-overlay");
  const gameOverTitle = document.getElementById("game-over-title");
  const gameOverDescription = document.getElementById("game-over-description");
  const gameOverRank = document.getElementById("game-over-rank");

  const CANVAS_WIDTH = canvas.width;
  const CANVAS_HEIGHT = canvas.height;
  const GAME_DURATION = 60;
  const KIMCHI_RECT = { x: 447, y: 372, width: 118, height: 118 };
  const KIMCHI_FLOAT_Y = 36;
  const GAUGE_X = 26;
  const GAUGE_Y = 26;
  const GAUGE_WIDTH = 258;
  const GAUGE_HEIGHT = 22;

  const imagePaths = {
    sadBackground: "/images/game_우는단종.png",
    happyBackground: "/images/game_웃는단종.png",
    kimchi: "/images/game_김치찌개.png",
    tiger: "/images/game_호랑이.png",
  };

  const images = {};
  Object.entries(imagePaths).forEach(([key, src]) => {
    const image = new Image();
    image.src = src;
    images[key] = image;
  });

  const state = {
    running: false,
    stage: "idle",
    animationId: 0,
    lastFrameAt: 0,
    timeLeft: GAME_DURATION,
    smileScore: 0,
    displayedSmileScore: 0,
    nextTigerIn: randomTigerDelay(),
    tiger: null,
    saved: false,
    kimchiPulse: 0,
    kimchiBounce: 0,
    floatingTexts: [],
  };

  function randomTigerDelay() {
    return 3 + Math.random() * 2;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function drawImageOrFallback(image, x, y, width, height, color, label) {
    if (image && image.complete && image.naturalWidth > 0) {
      ctx.drawImage(image, x, y, width, height);
      return;
    }
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
    ctx.fillStyle = "#f8f3e9";
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(label, x + width / 2, y + height / 2 + 6);
  }

  function resetUi() {
    rankBanner.classList.add("is-hidden");
    rankBanner.textContent = "";
    adPopupOverlay.classList.add("is-hidden");
    gameOverOverlay.classList.add("is-hidden");
    retryButton.classList.add("is-hidden");
    startButton.classList.remove("is-hidden");
    liveScore.textContent = "0 / 100";
    secondaryValue.textContent = "60초";
    eventTitle.textContent = "대기 중";
    resultTitle.textContent = "시작 버튼을 눌러주세요";
    resultCopy.textContent = "밥상 위 김치찌개를 눌러 단종마마를 웃게 만들고, 허접 호랑이의 방해를 막아보세요.";
    smileGaugeFill.style.width = "0%";
  }

  function resetGame() {
    state.running = false;
    state.stage = "idle";
    state.animationId = 0;
    state.lastFrameAt = 0;
    state.timeLeft = GAME_DURATION;
    state.smileScore = 0;
    state.displayedSmileScore = 0;
    state.nextTigerIn = randomTigerDelay();
    state.tiger = null;
    state.saved = false;
    state.kimchiPulse = 0;
    state.kimchiBounce = 0;
    state.floatingTexts = [];
    resetUi();
  }

  function setStatus(title, description) {
    eventTitle.textContent = title;
    resultCopy.textContent = description;
  }

  function setRankBanner(summary) {
    rankBanner.classList.remove("is-hidden");
    rankBanner.textContent = `현재 ${summary.rank}등 · 상위 ${summary.top_percentile}% · 참여 ${summary.total_players}명`;
    gameOverRank.textContent = `현재 ${summary.rank}등 · 상위 ${summary.top_percentile}% · 참여 ${summary.total_players}명`;
  }

  async function saveScore(score) {
    if (state.saved) {
      return null;
    }
    state.saved = true;
    const response = await fetch("/api/game/record", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_uuid: sessionUuid,
        game_type: "smile",
        score,
      }),
    });
    return response.json();
  }

  function spawnTiger() {
    const fromLeft = Math.random() < 0.5;
    const width = 200;
    const height = 200;
    const targetX = 90 + Math.random() * (CANVAS_WIDTH - width - 180);
    const startX = fromLeft ? -width - 80 : CANVAS_WIDTH + 80;
    const startY = 100 + Math.random() * 200;
    state.tiger = {
      x: startX,
      y: startY,
      width,
      height,
      targetX,
      startX,
      fromLeft,
      vx: fromLeft ? 220 : -220,
      elapsed: 0,
      walkPhase: 0,
      clicks: 0,
      phase: "walking",
    };
    setStatus("허접 호랑이 등장", "3번 빠르게 눌러 호랑이를 쫓아내세요.");
  }

  function addFloatingText(text, x, y, color) {
    state.floatingTexts.push({
      text,
      x,
      y,
      color,
      life: 0.7,
      maxLife: 0.7,
    });
  }

  function handleKimchiClick() {
    state.smileScore = clamp(state.smileScore + 3, 0, 100);
    state.kimchiPulse = 0.5;
    state.kimchiBounce = 0.45;
    addFloatingText("+3", KIMCHI_RECT.x + KIMCHI_RECT.width / 2, KIMCHI_RECT.y - 10, "#ffdd87");
    setStatus("김치찌개 성공", "단종마마의 기분이 조금 풀렸습니다.");
    if (state.smileScore >= 100) {
      endGame("happy");
    }
  }

  function handleTigerClick() {
    if (!state.tiger) {
      return;
    }
    state.tiger.clicks += 1;
    addFloatingText("타격!", state.tiger.x + state.tiger.width / 2, state.tiger.y + 10, "#ffd36f");
    if (state.tiger.clicks >= 3) {
      state.tiger = null;
      state.nextTigerIn = randomTigerDelay();
      state.smileScore = clamp(state.smileScore + 3, 0, 100);
      setStatus("호랑이 퇴치", "허접 호랑이를 쫓아냈습니다.");
      if (state.smileScore >= 100) {
        endGame("happy");
      }
    }
  }

  function handleCanvasClick(event) {
    if (!state.running || state.stage !== "playing") {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
    const y = (event.clientY - rect.top) * (CANVAS_HEIGHT / rect.height);

    if (
      state.tiger &&
      x >= state.tiger.x &&
      x <= state.tiger.x + state.tiger.width &&
      y >= state.tiger.y &&
      y <= state.tiger.y + state.tiger.height
    ) {
      handleTigerClick();
      return;
    }

    if (
      x >= KIMCHI_RECT.x &&
      x <= KIMCHI_RECT.x + KIMCHI_RECT.width &&
      y >= KIMCHI_RECT.y &&
      y <= KIMCHI_RECT.y + KIMCHI_RECT.height
    ) {
      handleKimchiClick();
    }
  }

  function updateFloatingTexts(delta) {
    state.floatingTexts = state.floatingTexts.filter((item) => {
      item.life -= delta;
      item.y -= 34 * delta;
      return item.life > 0;
    });
  }

  function drawFloatingTexts() {
    state.floatingTexts.forEach((item) => {
      const alpha = clamp(item.life / item.maxLife, 0, 1);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = item.color;
      ctx.font = "bold 28px AppleGothic, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(item.text, item.x, item.y);
      ctx.restore();
    });
  }

  function drawHud() {
    ctx.fillStyle = "rgba(8, 12, 22, 0.72)";
    ctx.fillRect(GAUGE_X - 8, GAUGE_Y - 8, GAUGE_WIDTH + 16, 54);
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 2;
    ctx.strokeRect(GAUGE_X - 8, GAUGE_Y - 8, GAUGE_WIDTH + 16, 54);

    ctx.fillStyle = "#f8f3e9";
    ctx.font = "700 18px AppleGothic, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("스마일 게이지", GAUGE_X, GAUGE_Y - 6);

    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    roundRect(ctx, GAUGE_X, GAUGE_Y, GAUGE_WIDTH, GAUGE_HEIGHT, 999);
    ctx.fill();

    const fillWidth = (state.displayedSmileScore / 100) * GAUGE_WIDTH;
    const gradient = ctx.createLinearGradient(GAUGE_X, 0, GAUGE_X + GAUGE_WIDTH, 0);
    gradient.addColorStop(0, "#f3b86a");
    gradient.addColorStop(1, "#ffe39c");
    ctx.fillStyle = gradient;
    roundRect(ctx, GAUGE_X, GAUGE_Y, fillWidth, GAUGE_HEIGHT, 999);
    ctx.fill();

    ctx.strokeStyle = "rgba(255,255,255,0.24)";
    ctx.lineWidth = 2;
    roundRect(ctx, GAUGE_X, GAUGE_Y, GAUGE_WIDTH, GAUGE_HEIGHT, 999);
    ctx.stroke();

    ctx.fillStyle = "#f8f3e9";
    ctx.font = "700 20px AppleGothic, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`${Math.round(state.displayedSmileScore)}/100`, GAUGE_X + GAUGE_WIDTH + 16, GAUGE_Y + 18);

    ctx.textAlign = "right";
    ctx.fillText(`남은 시간: ${Math.ceil(state.timeLeft)}초`, CANVAS_WIDTH - 26, 40);
  }

  function drawKimchi() {
    const pulseScale = 1 + state.kimchiPulse * 0.35;
    const bounce = state.kimchiBounce > 0 ? Math.sin(state.kimchiBounce * Math.PI) * 0.15 : 0;
    const scale = pulseScale + bounce;
    const width = KIMCHI_RECT.width * scale;
    const height = KIMCHI_RECT.height * scale;
    const x = KIMCHI_RECT.x + KIMCHI_RECT.width / 2 - width / 2;
    const y = KIMCHI_RECT.y + KIMCHI_RECT.height / 2 - height / 2;
    drawImageOrFallback(images.kimchi, x, y, width, height, "#d98a52", "김치");
  }

  function drawTiger() {
    if (!state.tiger) {
      return;
    }
    const t = state.tiger;
    const walkBounce = t.phase === "walking"
      ? Math.abs(Math.sin(t.walkPhase * Math.PI * 4)) * 18
      : Math.sin(t.elapsed * 6) * 8;
    const threatPulse = t.phase === "threatening"
      ? 1 + Math.sin(t.elapsed * 12) * 0.04
      : 1;
    const width = t.width * threatPulse;
    const height = t.height * threatPulse;
    const x = t.x + (t.width - width) / 2;
    const y = t.y - walkBounce + (t.height - height) / 2;
    drawImageOrFallback(images.tiger, x, y, width, height, "#d17734", "호랑이");

    ctx.fillStyle = "rgba(10, 12, 18, 0.78)";
    roundRect(ctx, x + 18, y + height - 36, width - 36, 28, 12);
    ctx.fill();
    ctx.fillStyle = "#f8f3e9";
    ctx.font = "700 18px AppleGothic, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${t.clicks}/3 타격`, x + width / 2, y + height - 16);
  }

  function drawBackground() {
    const background = state.smileScore >= 50 ? images.happyBackground : images.sadBackground;
    drawImageOrFallback(background, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, "#1a203c", "배경");
  }

  function updateTiger(delta) {
    if (!state.tiger) {
      return;
    }
    const t = state.tiger;
    t.elapsed += delta;

    if (t.phase === "walking") {
      t.walkPhase += delta * 8;
      const distance = t.targetX - t.x;
      const step = Math.sign(distance) * Math.min(Math.abs(distance), Math.abs(t.vx * delta));
      t.x += step;
      if (Math.abs(distance) > 6) {
        return;
      }
      t.phase = "threatening";
      t.elapsed = 0;
      return;
    }

    if (t.elapsed >= 3) {
      state.tiger = null;
      state.nextTigerIn = randomTigerDelay();
      state.smileScore = clamp(state.smileScore - 20, 0, 100);
      setStatus("허접 호랑이 방해", "호랑이가 웃음을 깎아냈습니다.");
      if (state.smileScore <= 0) {
        endGame("bad");
        return;
      }
      state.stage = "ad";
      state.running = false;
      adPopupOverlay.classList.remove("is-hidden");
    }
  }

  function update(delta) {
    state.displayedSmileScore += (state.smileScore - state.displayedSmileScore) * Math.min(1, delta * 12);
    state.displayedSmileScore = Math.round(state.displayedSmileScore * 10) / 10;

    if (!state.running || state.stage !== "playing") {
      return;
    }

    state.timeLeft = Math.max(0, state.timeLeft - delta);
    state.kimchiPulse = Math.max(0, state.kimchiPulse - delta);
    state.kimchiBounce = Math.max(0, state.kimchiBounce - delta * 6);
    state.nextTigerIn -= delta;
    updateFloatingTexts(delta);

    if (!state.tiger && state.nextTigerIn <= 0) {
      spawnTiger();
    }

    updateTiger(delta);

    liveScore.textContent = `${state.smileScore} / 100`;
    secondaryValue.textContent = `${Math.ceil(state.timeLeft)}초`;
    smileGaugeFill.style.width = `${state.displayedSmileScore}%`;

    if (state.timeLeft <= 0) {
      endGame("timeout");
    }
  }

  function draw() {
    drawBackground();
    drawKimchi();
    drawTiger();
    drawHud();
    drawFloatingTexts();
  }

  async function endGame(reason) {
    state.running = false;
    state.stage = "gameover";
    cancelAnimationFrame(state.animationId);

    const summary = await saveScore(state.smileScore);
    if (summary) {
      setRankBanner(summary);
    }

    if (reason === "happy" || state.smileScore >= 90) {
      gameOverTitle.textContent = "역사 개변 성공!";
      gameOverDescription.textContent = "단종마마가 환하게 웃었습니다. 이제 영월의 밤도 조금 따뜻해집니다.";
      resultTitle.textContent = "단종마마가 크게 웃었습니다";
    } else if (reason === "bad" || state.smileScore <= 0) {
      gameOverTitle.textContent = "역사대로 흘러갔습니다";
      gameOverDescription.textContent = "웃음을 지켜내지 못했습니다. 다시 도전해 단종마마를 웃겨보세요.";
      resultTitle.textContent = "단종마마가 다시 울고 있습니다";
    } else {
      gameOverTitle.textContent = "광천골 명예 주민 등극!";
      gameOverDescription.textContent = "조금은 웃게 만들었습니다. 다음에는 더 높은 점수를 노려보세요.";
      resultTitle.textContent = "단종마마가 조금 웃었습니다";
    }

    resultCopy.textContent = gameOverDescription.textContent;
    retryButton.classList.remove("is-hidden");
    gameOverOverlay.classList.remove("is-hidden");
  }

  function startGame() {
    state.running = true;
    state.stage = "playing";
    state.animationId = 0;
    state.lastFrameAt = 0;
    state.timeLeft = 60;
    state.smileScore = 0;
    state.nextTigerIn = randomTigerDelay();
    state.tiger = null;
    state.saved = false;
    state.kimchiPulse = 0;
    state.kimchiBounce = 0;
    state.displayedSmileScore = 0;
    state.floatingTexts = [];
    adPopupOverlay.classList.add("is-hidden");
    gameOverOverlay.classList.add("is-hidden");
    rankBanner.classList.add("is-hidden");
    retryButton.classList.add("is-hidden");
    startButton.classList.add("is-hidden");
    eventTitle.textContent = "웃기기 작전 시작";
    resultTitle.textContent = "단종마마를 웃게 만들어보세요";
    resultCopy.textContent = "김치찌개를 누르면 점수가 오르고, 호랑이를 3번 눌러야 방해를 막을 수 있습니다.";
    smileGaugeFill.style.width = "0%";
    liveScore.textContent = "0 / 100";
    secondaryValue.textContent = "60초";
    state.animationId = requestAnimationFrame(frame);
  }

  function frame(timestamp) {
    if (!state.lastFrameAt) {
      state.lastFrameAt = timestamp;
    }
    const delta = (timestamp - state.lastFrameAt) / 1000;
    state.lastFrameAt = timestamp;

    update(delta);
    draw();

    if (state.running) {
      state.animationId = requestAnimationFrame(frame);
    }
  }

  function reviveFromAd() {
    adPopupOverlay.classList.add("is-hidden");
    state.stage = "playing";
    state.running = true;
    state.tiger = null;
    state.nextTigerIn = randomTigerDelay();
    setStatus("다시 웃기기 시작", "광고를 보고 돌아왔습니다. 단종마마의 웃음을 지켜보세요.");
    state.animationId = requestAnimationFrame(frame);
  }

  function restartFromAd() {
    adPopupOverlay.classList.add("is-hidden");
    startGame();
  }

  function roundRect(context, x, y, width, height, radius) {
    if (width <= 0 || height <= 0) {
      return;
    }
    const r = Math.min(radius, width / 2, height / 2);
    context.beginPath();
    context.moveTo(x + r, y);
    context.arcTo(x + width, y, x + width, y + height, r);
    context.arcTo(x + width, y + height, x, y + height, r);
    context.arcTo(x, y + height, x, y, r);
    context.arcTo(x, y, x + width, y, r);
    context.closePath();
  }

  canvas.addEventListener("click", handleCanvasClick);
  startButton.addEventListener("click", startGame);
  retryButton.addEventListener("click", startGame);
  playAgainButton.addEventListener("click", startGame);
  reviveButton.addEventListener("click", reviveFromAd);
  restartButton.addEventListener("click", restartFromAd);

  resetUi();
  draw();
});
