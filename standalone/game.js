(function () {
  "use strict";

  const GAME_DURATION = 10;
  const STEW_SCORE = 4;
  const TIGER_PENALTY = 30;
  const TIGER_CLICKS_REQUIRED = 3;
  const TIGER_SPAWN_MIN = 1;
  const TIGER_SPAWN_MAX = 2.5;
  const TIGER_DANGER_SEC = 3;

  const board = document.getElementById("game-board");
  const stewHitbox = document.getElementById("stew-hitbox");
  const tigerWrap = document.getElementById("tiger-wrap");
  const timerDisplay = document.getElementById("timer-display");
  const adPopup = document.getElementById("ad-popup");
  const gameOverModal = document.getElementById("game-over");
  const gameOverTitle = document.getElementById("game-over-title");
  const gameOverText = document.getElementById("game-over-text");
  const startScreen = document.getElementById("start-screen");
  const startBtn = document.getElementById("start-btn");
  const reviveBtn = document.getElementById("revive-btn");
  const restartBtn = document.getElementById("restart-btn");
  const retryBtn = document.getElementById("retry-btn");

  let state = {
    running: false,
    smileScore: 0,
    timeLeft: GAME_DURATION,
    timerId: null,
    tigerVisible: false,
    tigerClicks: 0,
    tigerDangerTimer: null,
    nextTigerAt: 0,
  };

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function updateBoard() {
    if (state.smileScore >= 100) {
      board.classList.add("is-happy");
    }
  }

  function randomTigerDelay() {
    return TIGER_SPAWN_MIN + Math.random() * (TIGER_SPAWN_MAX - TIGER_SPAWN_MIN);
  }

  function showTiger() {
    if (state.tigerVisible) return;
    state.tigerVisible = true;
    state.tigerClicks = 0;
    tigerWrap.classList.remove("is-retreating", "is-hidden");
    tigerWrap.style.removeProperty("right");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        tigerWrap.classList.add("is-visible");
      });
    });

    state.tigerDangerTimer = setTimeout(() => {
      tigerWrap.classList.remove("is-visible");
      tigerWrap.classList.add("is-retreating");
      setTimeout(() => tigerWrap.classList.add("is-hidden"), 650);
      state.tigerVisible = false;
      state.smileScore = clamp(state.smileScore - TIGER_PENALTY, 0, 100);
      updateBoard();
      if (state.smileScore <= 0) {
        endGame("bad");
      } else {
        state.running = false;
        adPopup.classList.remove("is-hidden");
      }
    }, TIGER_DANGER_SEC * 1000);
  }

  function hideTiger() {
    clearTimeout(state.tigerDangerTimer);
    state.tigerDangerTimer = null;
    tigerWrap.classList.remove("is-visible");
    tigerWrap.classList.add("is-retreating");
    setTimeout(() => {
      tigerWrap.classList.add("is-hidden");
    }, 650);
    state.tigerVisible = false;
    scheduleNextTiger();
  }

  function scheduleNextTiger() {
    state.nextTigerAt = Date.now() + randomTigerDelay() * 1000;
  }

  function handleTigerClick() {
    if (!state.tigerVisible) return;
    state.tigerClicks += 1;
    if (state.tigerClicks >= TIGER_CLICKS_REQUIRED) {
      hideTiger();
    }
  }

  function handleStewClick() {
    if (!state.running) return;
    state.smileScore = clamp(state.smileScore + STEW_SCORE, 0, 100);
    updateBoard();
    if (state.smileScore >= 100) {
      endGame("happy");
    }
  }

  function tick() {
    if (!state.running) return;
    state.timeLeft = Math.max(0, state.timeLeft - 1);
    timerDisplay.textContent = `${state.timeLeft}초`;

    if (state.timeLeft <= 0) {
      clearInterval(state.timerId);
      state.timerId = null;
      endGame("timeout");
      return;
    }

    if (!state.tigerVisible && Date.now() >= state.nextTigerAt) {
      showTiger();
    }
  }

  function endGame(reason) {
    state.running = false;
    if (state.timerId) {
      clearInterval(state.timerId);
      state.timerId = null;
    }
    if (state.tigerDangerTimer) {
      clearTimeout(state.tigerDangerTimer);
      state.tigerDangerTimer = null;
    }
    tigerWrap.classList.remove("is-visible");
    tigerWrap.classList.add("is-retreating", "is-hidden");
    state.tigerVisible = false;

    if (reason === "happy" || state.smileScore >= 90) {
      gameOverTitle.textContent = "역사 개변 성공!";
      gameOverText.textContent =
        "단종마마가 환하게 웃었습니다. 이제 영월의 밤도 조금 따뜻해집니다.";
    } else if (reason === "bad" || state.smileScore <= 0) {
      gameOverTitle.textContent = "역사대로 흘러갔습니다";
      gameOverText.textContent =
        "웃음을 지켜내지 못했습니다. 다시 도전해 단종마마를 웃겨보세요.";
    } else {
      gameOverTitle.textContent = "광천골 명예 주민 등극!";
      gameOverText.textContent =
        "조금은 웃게 만들었습니다. 다음에는 더 높은 점수를 노려보세요.";
    }
    gameOverModal.classList.remove("is-hidden");
  }

  function startGame() {
    state = {
      running: true,
      smileScore: 0,
      timeLeft: GAME_DURATION,
      timerId: null,
      tigerVisible: false,
      tigerClicks: 0,
      tigerDangerTimer: null,
      nextTigerAt: Date.now() + randomTigerDelay() * 1000,
    };
    board.classList.remove("is-happy");
    gaugeMask.classList.add("is-empty");
    gaugeMask.style.width = "0px";
    updateGauge();
    timerDisplay.textContent = `${state.timeLeft}초`;
    startScreen.classList.add("is-hidden");
    adPopup.classList.add("is-hidden");
    gameOverModal.classList.add("is-hidden");
    state.timerId = setInterval(tick, 1000);
  }

  function reviveFromAd() {
    adPopup.classList.add("is-hidden");
    state.running = true;
    state.nextTigerAt = Date.now() + randomTigerDelay() * 1000;
    state.timerId = setInterval(tick, 1000);
  }

  function restartFromAd() {
    adPopup.classList.add("is-hidden");
    startGame();
  }

  stewHitbox.addEventListener("click", handleStewClick);
  tigerWrap.addEventListener("click", handleTigerClick);
  startBtn.addEventListener("click", startGame);
  reviveBtn.addEventListener("click", reviveFromAd);
  restartBtn.addEventListener("click", restartFromAd);
  retryBtn.addEventListener("click", () => {
    gameOverModal.classList.add("is-hidden");
    startScreen.classList.remove("is-hidden");
    state.running = false;
    board.classList.remove("is-happy");
    timerDisplay.textContent = `${GAME_DURATION}초`;
    tigerWrap.classList.add("is-hidden", "is-retreating");
  });
})();
