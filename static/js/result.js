const RESULT_META = {
  "관계형 보호자": {
    line: "처음부터 영웅은 아니지만 결국 사람을 지키기 위해 남는 유형",
  },
  "조용한 동행자": {
    line: "앞에 나서지 않지만 끝까지 곁을 지키는 사람",
  },
  "행동하는 이상가": {
    line: "옳다고 믿는 것을 위해 위험을 감수하고 움직이는 사람",
  },
  "권력형 전략가": {
    line: "감정보다 질서와 권력을 우선하는 사람",
  },
  "책임을 짊어진 중심": {
    line: "자신의 선택이 사람들의 운명을 바꾼다는 것을 아는 사람",
  },
};

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("result-page");
  if (!root) {
    return;
  }

  const sessionUuid = root.dataset.sessionUuid;
  const resultType = root.dataset.resultType;
  const totalScore = Number(root.dataset.totalScore || 0);

  const rarityValue = document.getElementById("rarity-value");
  const rarityCaption = document.getElementById("rarity-caption");
  const rarityMeterFill = document.getElementById("rarity-meter-fill");
  const averageCompare = document.getElementById("average-compare");
  const scoreRankLabel = document.getElementById("score-rank-label");
  const scoreMeterFill = document.getElementById("score-meter-fill");
  const averageMarker = document.getElementById("average-marker");
  const feedback = document.getElementById("share-feedback");
  const shareKakaoButton = document.getElementById("share-kakao-button");
  const shareSmsButton = document.getElementById("share-sms-button");
  const shareInstagramButton = document.getElementById("share-instagram-button");
  const copyLinkButton = document.getElementById("copy-link-button");
  const resultShareCopy = document.getElementById("result-share-copy");
  const resultParticipants = document.getElementById("result-participants");
  const resultShareHintText = document.getElementById("result-share-hint-text");

  const meta = RESULT_META[resultType];
  const resultUrl = `${window.location.origin}/result/${sessionUuid}`;
  const shareSentence =
    resultShareCopy?.textContent?.trim() ||
    `나는 왕과 사는 남자 세계관에서 '${resultType}' 유형입니다.`;
  const shareText = [`${shareSentence}`, `충성도 점수 ${totalScore}점`, meta?.line || "", resultUrl]
    .filter(Boolean)
    .join("\n");

  function formatPercent(value) {
    return `${Number(value || 0).toFixed(2).replace(/\.00$/, "")}%`;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function formatAverageComparison(averageScore) {
    const diff = Number((totalScore - averageScore).toFixed(1));
    if (diff > 0) {
      return `평균보다 ${diff}점 높은 위치예요`;
    }
    if (diff < 0) {
      return `평균보다 ${Math.abs(diff)}점 낮은 위치예요`;
    }
    return "전체 평균과 비슷한 위치예요";
  }

  function renderScorePosition(averageScore) {
    const normalizedScore = clamp(((totalScore - 10) / 90) * 100, 0, 100);
    const normalizedAverage = clamp(((averageScore - 10) / 90) * 100, 0, 100);

    scoreRankLabel.textContent = `${totalScore}점`;
    scoreMeterFill.style.width = `${normalizedScore}%`;
    averageMarker.style.left = `${normalizedAverage}%`;
    averageCompare.textContent = formatAverageComparison(averageScore);
  }

  function renderRarity(matched) {
    if (!matched) {
      rarityValue.textContent = "집계 중";
      rarityCaption.textContent = "충분한 결과가 쌓이면 위치를 보여드릴게요.";
      rarityMeterFill.style.width = "0%";
      return;
    }

    const rarityPercent = Number(matched.ratio || 0);
    const topPercent = clamp(100 - rarityPercent, 0, 100);
    rarityValue.textContent = `상위 ${formatPercent(topPercent)}`;
    rarityCaption.textContent = `전체 참여자 중 ${formatPercent(rarityPercent)}가 같은 유형입니다.`;
    rarityMeterFill.style.width = `${topPercent}%`;
  }

  async function loadStats() {
    try {
      const [summaryResponse, resultsResponse] = await Promise.all([
        fetch("/api/stats/summary"),
        fetch("/api/stats/results"),
      ]);

      const summary = await summaryResponse.json();
      const results = await resultsResponse.json();
      const matched = (results.items || []).find((item) => item.result_type === resultType);

      if (resultParticipants) {
        resultParticipants.innerHTML = `🔥지금까지 <span class="result-count-num">${summary.total_participants || 0}</span>명이 참여했어요`;
      }
      renderScorePosition(Number(summary.average_score || 0));
      renderRarity(matched);
    } catch (error) {
      console.error("Failed to load result stats", error);
      rarityValue.textContent = "집계 중";
      rarityCaption.textContent = "불러오기 실패";
      averageCompare.textContent = "불러오기 실패";
    }
  }

  shareKakaoButton.addEventListener("click", async () => {
    try {
      await window.ResultShare.shareToKakao({
        title: `${resultType} | 왕과 사는 남자`,
        text: shareText,
        url: resultUrl,
      });
      feedback.textContent = "카카오톡 공유를 열었거나 공유 가능한 문구를 준비했습니다.";
    } catch (error) {
      feedback.textContent = error.message || "카카오톡 공유에 실패했습니다.";
    }
  });

  shareSmsButton.addEventListener("click", async () => {
    try {
      await window.ResultShare.shareToSms({
        text: shareText,
        url: resultUrl,
      });
      feedback.textContent = "문자 앱으로 이동했습니다.";
    } catch (error) {
      feedback.textContent = error.message || "문자 공유에 실패했습니다.";
    }
  });

  shareInstagramButton.addEventListener("click", async () => {
    try {
      await window.ResultShare.shareToInstagram({
        text: shareText,
        url: resultUrl,
      });
      feedback.textContent = "인스타그램에 붙여넣을 문구를 복사하고 앱 또는 웹으로 이동했습니다.";
    } catch (error) {
      feedback.textContent = error.message || "인스타그램 공유 준비에 실패했습니다.";
    }
  });

  copyLinkButton.addEventListener("click", async () => {
    try {
      await window.ResultShare.copyText(resultUrl);
      feedback.textContent = "결과 링크를 복사했습니다.";
    } catch (error) {
      feedback.textContent = error.message || "링크 복사에 실패했습니다.";
    }
  });
  resultShareHintText.textContent = shareSentence;

  loadStats();
  renderWordCloud();
});

function renderWordCloud() {
  const container = document.getElementById("result-wordcloud");
  const root = document.getElementById("result-page");
  if (!container || !root) return;

  const emotionWord = root.dataset.emotionWord || "";
  const resultType = root.dataset.resultType || "";
  const taglineEl = document.querySelector(".result-tagline");
  const descEl = document.querySelector(".result-description");
  const tagline = taglineEl?.textContent?.trim() || "";
  const description = descEl?.textContent?.trim() || "";

  const stopWords = new Set([
    "은", "는", "이", "가", "을", "를", "의", "에", "와", "과", "도", "만", "부터",
    "까지", "를", "으로", "로", "에서", "에게", "한", "하는", "있다", "없다",
    "당신", "사람", "것", "수", "때", "등", "그", "이", "저", "그런", "이런",
    "저런", "있다", "없다", "있다는", "없다는", "위해", "통해", "대해", "보다",
    "처럼", "같이", "만큼", "정도", "나", "너", "우리", "그들", "이들",
  ]);

  function tokenize(text) {
    return text
      .replace(/[.,!?;:'"()[\]{}\s]+/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 2 && !stopWords.has(w));
  }

  const words = [];
  if (emotionWord) words.push({ text: emotionWord, weight: 5 });
  resultType.split(/\s+/).forEach((w) => {
    if (w.length >= 2) words.push({ text: w, weight: 3 });
  });
  const taglineWords = tokenize(tagline);
  taglineWords.forEach((w) => words.push({ text: w, weight: 2 }));
  const descWords = tokenize(description);
  descWords.slice(0, 12).forEach((w) => words.push({ text: w, weight: 1 }));

  const seen = new Set();
  const unique = words.filter(({ text }) => {
    if (seen.has(text)) return false;
    seen.add(text);
    return true;
  });

  for (let i = unique.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [unique[i], unique[j]] = [unique[j], unique[i]];
  }

  const sizes = { 1: "0.85rem", 2: "1rem", 3: "1.2rem", 4: "1.4rem", 5: "1.8rem" };
  unique.forEach(({ text, weight }) => {
    const span = document.createElement("span");
    span.className = "wordcloud-word";
    span.textContent = text;
    span.style.fontSize = sizes[weight] || sizes[1];
    span.style.opacity = 0.6 + (weight / 5) * 0.4;
    container.appendChild(span);
  });
}
