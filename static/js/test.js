const TEST_QUESTIONS = [
  {
    id: 1,
    text: "왕이 권력을 잃고 유배지에 왔습니다. 마을 사람들은 그를 두려워하고 있습니다. 당신은 어떻게 하시겠습니까?",
    options: [
      { id: "A", text: "먼저 다가가 왕의 처지를 살피고 숨을 곳을 마련한다" },
      { id: "B", text: "눈에 띄지 않게 먹을 것과 잠자리를 챙긴다" },
      { id: "C", text: "마을 분위기를 보며 위험하지 않을 만큼만 돕는다" },
      { id: "D", text: "괜히 엮이지 않기 위해 거리를 둔다" },
    ],
  },
  {
    id: 2,
    text: "권력자가 마을에 내려와 왕을 감시하기 시작했습니다. 당신은 어떤 선택을 하시겠습니까?",
    options: [
      { id: "A", text: "감시를 따돌릴 길을 찾아 직접 움직인다" },
      { id: "B", text: "겉으로는 순응하되 안에서 왕을 돕는다" },
      { id: "C", text: "내 안전을 우선하며 신중하게 관망한다" },
      { id: "D", text: "권력자 편에 서서 상황을 관리한다" },
    ],
  },
  {
    id: 3,
    text: "왕을 지키면 위험합니다. 하지만 떠나면 마음이 편하지 않을 것 같습니다. 당신은 어떻게 하시겠습니까?",
    options: [
      { id: "A", text: "위험을 감수하고서라도 곁에 남는다" },
      { id: "B", text: "멀리서라도 계속 돌보며 자취를 감춘다" },
      { id: "C", text: "상황이 더 나빠지지 않는 선까지만 함께한다" },
      { id: "D", text: "마음을 접고 먼저 떠난다" },
    ],
  },
  {
    id: 4,
    text: "권력에 맞서 싸울 기회가 왔습니다. 그러나 실패하면 모두가 위험해집니다. 당신의 선택은 무엇입니까?",
    options: [
      { id: "A", text: "기회를 놓치지 않고 앞장서서 거사를 준비한다" },
      { id: "B", text: "모두를 지킬 수 있는 방법을 먼저 따져본다" },
      { id: "C", text: "성공 가능성이 보여야 움직인다" },
      { id: "D", text: "질서를 위해 싸움을 막는다" },
    ],
  },
  {
    id: 5,
    text: "마을 사람들이 왕을 돕는 것을 두려워합니다. 당신은 그들을 어떻게 대하겠습니까?",
    options: [
      { id: "A", text: "두려움을 감수하더라도 함께 지키자고 설득한다" },
      { id: "B", text: "드러나지 않게 한 사람씩 마음을 모은다" },
      { id: "C", text: "누구도 다치지 않게 최소한의 도움만 부탁한다" },
      { id: "D", text: "사람들이 따르지 않는다면 현실을 받아들인다" },
    ],
  },
  {
    id: 6,
    text: "누군가 왕을 배신하려 한다는 소문이 돌고 있습니다. 당신은 무엇을 하시겠습니까?",
    options: [
      { id: "A", text: "직접 진실을 확인하고 먼저 왕을 보호한다" },
      { id: "B", text: "조용히 주변을 살피며 위험을 줄인다" },
      { id: "C", text: "소문이 사실인지 더 지켜본다" },
      { id: "D", text: "배신이 현실이라면 강한 쪽을 택한다" },
    ],
  },
  {
    id: 7,
    text: "왕이 스스로 운명을 결정하려 합니다. 당신은 그 결정을 어떻게 받아들이시겠습니까?",
    options: [
      { id: "A", text: "말리더라도 끝까지 함께하며 다른 길을 찾는다" },
      { id: "B", text: "왕의 뜻을 존중하되 마지막까지 곁을 지킨다" },
      { id: "C", text: "그 결정이 모두에게 미칠 영향을 먼저 계산한다" },
      { id: "D", text: "왕의 선택보다 이후 권력 구도가 더 중요하다" },
    ],
  },
  {
    id: 8,
    text: "권력자가 당신에게 협력을 제안합니다. 당신은 무엇을 택하겠습니까?",
    options: [
      { id: "A", text: "제안을 거절하고 왕을 지킬 방도를 찾는다" },
      { id: "B", text: "겉으로는 응하되 속으로는 왕을 돕는다" },
      { id: "C", text: "나와 마을에 유리한 조건인지부터 따진다" },
      { id: "D", text: "질서와 권력을 위해 협력한다" },
    ],
  },
  {
    id: 9,
    text: "마을 사람들이 당신의 선택을 바라보고 있습니다. 당신은 어떤 모습으로 남고 싶습니까?",
    options: [
      { id: "A", text: "사람을 지키기 위해 끝까지 남는 사람" },
      { id: "B", text: "드러나지 않아도 곁을 지키는 사람" },
      { id: "C", text: "때를 보고 움직이는 사람" },
      { id: "D", text: "질서를 읽고 이익을 택하는 사람" },
    ],
  },
  {
    id: 10,
    text: "결국 선택의 순간이 왔습니다. 당신의 마지막 선택은 무엇입니까?",
    options: [
      { id: "A", text: "끝까지 왕과 사람들을 지키는 쪽에 선다" },
      { id: "B", text: "직접 드러나진 않아도 마지막까지 곁에 남는다" },
      { id: "C", text: "누구를 살릴 수 있을지 계산하며 결정한다" },
      { id: "D", text: "권력의 중심으로 이동해 살아남는다" },
    ],
  },
];

const EMOTION_WORDS = ["충성", "연민", "두려움", "분노", "책임", "침묵", "희망", "결의"];
const MID_MESSAGES = {
  3: "지금까지의 선택은 왕의 곁에 남을 가능성을 보여주고 있습니다.",
  6: "유배지의 공포 속에서도 당신의 기준은 조금씩 드러나고 있습니다.",
  9: "이제 마지막 선택만 남았습니다. 누가 당신의 편인지 결정됩니다.",
};

document.addEventListener("DOMContentLoaded", () => {
  const questionStage = document.getElementById("question-stage");
  const emotionStage = document.getElementById("emotion-stage");
  const questionIndex = document.getElementById("question-index");
  const questionText = document.getElementById("question-text");
  const optionsList = document.getElementById("options-list");
  const emotionList = document.getElementById("emotion-list");
  const progressLabel = document.getElementById("progress-label");
  const progressFill = document.getElementById("progress-fill");
  const testMessage = document.getElementById("test-message");
  const formFeedback = document.getElementById("form-feedback");
  const prevButton = document.getElementById("prev-button");
  const nextButton = document.getElementById("next-button");
  const submitButton = document.getElementById("submit-button");

  const state = {
    currentIndex: 0,
    answers: {},
    emotionWord: "",
    isSubmitting: false,
  };

  function getCurrentQuestion() {
    return TEST_QUESTIONS[state.currentIndex];
  }

  function updateProgress() {
    const isEmotionStep = state.currentIndex >= TEST_QUESTIONS.length;
    const baseProgress = isEmotionStep
      ? 100
      : ((state.currentIndex + 1) / TEST_QUESTIONS.length) * 100;

    progressFill.style.width = `${baseProgress}%`;
    progressLabel.textContent = isEmotionStep
      ? "10 / 10 + 감정 선택"
      : `${state.currentIndex + 1} / 10`;
    testMessage.textContent = MID_MESSAGES[state.currentIndex] || "";
  }

  function renderQuestion() {
    const question = getCurrentQuestion();
    const selectedOption = state.answers[question.id];

    questionStage.classList.remove("is-hidden");
    emotionStage.classList.add("is-hidden");
    nextButton.classList.remove("is-hidden");
    submitButton.classList.add("is-hidden");

    questionIndex.textContent = `Q${question.id}`;
    questionText.textContent = question.text;
    optionsList.innerHTML = question.options
      .map(
        (option) => `
          <button
            type="button"
            class="option-button ${selectedOption === option.id ? "is-selected" : ""}"
            data-option-id="${option.id}"
          >
            <span class="option-button__id">${option.id}</span>
            <span>${option.text}</span>
          </button>
        `
      )
      .join("");

    nextButton.disabled = !selectedOption;
    prevButton.disabled = state.currentIndex === 0;
    updateProgress();
  }

  function renderEmotionStep() {
    questionStage.classList.add("is-hidden");
    emotionStage.classList.remove("is-hidden");
    nextButton.classList.add("is-hidden");
    submitButton.classList.remove("is-hidden");

    emotionList.innerHTML = EMOTION_WORDS.map(
      (word) => `
        <button
          type="button"
          class="emotion-button ${state.emotionWord === word ? "is-selected" : ""}"
          data-emotion-word="${word}"
        >
          ${word}
        </button>
      `
    ).join("");

    submitButton.disabled = !state.emotionWord || state.isSubmitting;
    prevButton.disabled = false;
    updateProgress();
  }

  function render() {
    formFeedback.textContent = "";
    if (state.currentIndex < TEST_QUESTIONS.length) {
      renderQuestion();
      return;
    }
    renderEmotionStep();
  }

  function buildPayload() {
    return {
      answers: TEST_QUESTIONS.map((question) => ({
        question_id: question.id,
        selected_option: state.answers[question.id],
      })),
      emotion_word: state.emotionWord,
    };
  }

  async function submitTest() {
    const payload = buildPayload();
    state.isSubmitting = true;
    submitButton.disabled = true;
    formFeedback.textContent = "당신의 세계관 유형을 계산하는 중입니다...";

    try {
      const response = await fetch("/api/test/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "테스트 제출에 실패했습니다.");
      }

      window.location.href = `/result/${data.session_uuid}`;
    } catch (error) {
      state.isSubmitting = false;
      submitButton.disabled = false;
      formFeedback.textContent = error.message || "잠시 후 다시 시도해주세요.";
    }
  }

  optionsList.addEventListener("click", (event) => {
    const button = event.target.closest(".option-button");
    if (!button) {
      return;
    }

    const question = getCurrentQuestion();
    state.answers[question.id] = button.dataset.optionId;
    renderQuestion();
  });

  emotionList.addEventListener("click", (event) => {
    const button = event.target.closest(".emotion-button");
    if (!button) {
      return;
    }

    state.emotionWord = button.dataset.emotionWord;
    renderEmotionStep();
  });

  prevButton.addEventListener("click", () => {
    if (state.currentIndex > 0 && state.currentIndex <= TEST_QUESTIONS.length) {
      state.currentIndex -= 1;
      render();
      return;
    }

    if (state.currentIndex === TEST_QUESTIONS.length) {
      state.currentIndex = TEST_QUESTIONS.length - 1;
      render();
    }
  });

  nextButton.addEventListener("click", () => {
    const currentQuestion = getCurrentQuestion();
    if (!state.answers[currentQuestion.id]) {
      formFeedback.textContent = "선택지를 하나 골라주세요.";
      return;
    }

    state.currentIndex += 1;
    render();
  });

  submitButton.addEventListener("click", () => {
    if (!state.emotionWord) {
      formFeedback.textContent = "감정을 하나 선택해주세요.";
      return;
    }
    submitTest();
  });

  render();
});
