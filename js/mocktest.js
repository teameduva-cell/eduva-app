// Mock Test Engine
const mockQuestions = [
  {
    q: "1. यदि किसी वस्तु का वेग दोगुना कर दिया जाए, तो उसकी गतिज ऊर्जा (Kinetic Energy) कितनी हो जाएगी?",
    options: ["दोगुनी (2x)", "चार गुना (4x)", "आधी (1/2)", "अपरिवर्तित"],
    ans: 1,
  },
  {
    q: "2. मानव शरीर की सबसे बड़ी ग्रंथि (Largest Gland) कौन सी है?",
    options: [
      "अग्न्याशय (Pancreas)",
      "यकृत (Liver)",
      "थायराइड (Thyroid)",
      "पीयूष ग्रंथि (Pituitary)",
    ],
    ans: 1,
  },
  {
    q: "3. ग्लूकोज का अणुसूत्र (Molecular Formula) क्या है?",
    options: ["C6H12O6", "C12H22O11", "CH3COOH", "C2H5OH"],
    ans: 0,
  },
  {
    q: "4. निर्वात में प्रकाश की चाल (Speed of Light) कितनी होती है?",
    options: ["3 × 10^8 m/s", "3 × 10^6 m/s", "3 × 10^10 m/s", "3 × 10^5 m/s"],
    ans: 0,
  },
  {
    q: "5. आवर्त सारणी में सबसे अधिक विद्युतऋणात्मक (Most Electronegative) तत्व कौन सा है?",
    options: ["ऑक्सीजन (O)", "क्लोरिन (Cl)", "फ्लोरिन (F)", "नायट्रोजन (N)"],
    ans: 2,
  },
];
let currentTestQ = 0,
  userAnswers = {},
  testTimerInterval = null;

function startMockTest() {
  document.getElementById("test-intro-box").classList.add("hidden");
  document.getElementById("test-questions-box").classList.remove("hidden");
  document.getElementById("test-timer-box").classList.remove("hidden");
  currentTestQ = 0;
  userAnswers = {};
  loadTestQuestion();

  let timeLeft = 600;
  testTimerInterval = setInterval(() => {
    let m = Math.floor(timeLeft / 60),
      s = timeLeft % 60;
    document.getElementById("timer-display").innerText = `00:${ m < 10 ? "0" + m : m }:${s < 10 ? "0" + s : s}`;
    if (timeLeft <= 0) {
      clearInterval(testTimerInterval);
      submitMockTest();
    }
    timeLeft--;
  }, 1000);
}

function loadTestQuestion() {
  const qData = mockQuestions[currentTestQ];
  let html = `<p class="font-extrabold text-base sm:text-lg text-slate-900">${qData.q}</p><div class="space-y-3 pt-3">`;
  qData.options.forEach((opt, idx) => {
    let isSel =
      userAnswers[currentTestQ] === idx
        ? "bg-blue-50 border-blue-600 text-blue-900 font-bold"
        : "bg-slate-50 border-slate-200 text-slate-700";
    html += `<div onclick="selectTestOption(${currentTestQ}, ${idx})" class="p-4 rounded-2xl border cursor-pointer text-sm sm:text-base transition ${isSel}">${String.fromCharCode( 65 + idx )}. ${opt}</div>`;
  });
  html += `</div>`;
  document.getElementById("test-question-container").innerHTML = html;
  document.getElementById("next-test-btn").innerText =
    currentTestQ === mockQuestions.length - 1
      ? "टेस्ट सबमिट करें 🎯"
      : "अगला प्रश्न";
}

function selectTestOption(qIdx, optIdx) {
  userAnswers[qIdx] = optIdx;
  loadTestQuestion();
}

function nextTestQuestion() {
  if (currentTestQ < mockQuestions.length - 1) {
    currentTestQ++;
    loadTestQuestion();
  } else {
    submitMockTest();
  }
}

function submitMockTest() {
  if (testTimerInterval) clearInterval(testTimerInterval);
  document.getElementById("test-questions-box").classList.add("hidden");
  document.getElementById("test-timer-box").classList.add("hidden");
  document.getElementById("test-result-box").classList.remove("hidden");

  let score = 0,
    correct = 0,
    incorrect = 0;
  mockQuestions.forEach((q, idx) => {
    if (userAnswers[idx] === q.ans) {
      score += 4;
      correct++;
    } else if (userAnswers[idx] !== undefined) {
      score -= 1;
      incorrect++;
    }
  });
  document.getElementById(
    "test-score-summary"
  ).innerText = `कुल अंक: ${score} / 20 (सही: ${correct}, गलत: ${incorrect})`;
}

function resetMockTest() {
  document.getElementById("test-result-box").classList.add("hidden");
  document.getElementById("test-intro-box").classList.remove("hidden");
}