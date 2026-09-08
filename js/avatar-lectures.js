// --- FULLY FUNCTIONAL AI AVATAR SPEECH & LECTURE ENGINE ---
let currentAvatarTopic = "Physics: Motion in a Straight Line";
let avatarSteps = [
  "चैंपियन, आज हम सीखेंगे कि गति के समीकरण को ग्राफिकल मेथड से कैसे ड्राइव करते हैं। ध्यान से देखना!",
  "स्टेप 1: वेलोसिटी-टाइम ग्राफ बनाएं जहाँ इनिशियल वेलोसिटी u है।",
  "स्टेप 2: ग्राफ का स्लोप हमें एक्सीलरेशन देता है।",
  "स्टेप 3: v = u + at प्रूफ हो गया!",
];
let currentAvatarStepIdx = 0;

function pickEduSirVoice() {
  if (!("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices() || [];
  const hindi = voices.filter(
    (v) => /^hi(-|_)?IN/i.test(v.lang) || /hindi/i.test(v.name)
  );
  return hindi.length ? hindi[0] : voices[0] || null;
}

function loadAvatarLecture(title, stepsArray) {
  currentAvatarTopic = title;
  avatarSteps = stepsArray;
  currentAvatarStepIdx = 0;
  stopLecture();
  document.getElementById("avatar-lecture-title").innerText = title;
  document.getElementById(
    "avatar-lecture-step"
  ).innerText = `"${avatarSteps[0]}"`;
  updateAvatarUI();
}

function updateAvatarUI() {
  const total = avatarSteps.length;
  const current = currentAvatarStepIdx + 1;
  document.getElementById(
    "avatar-step-counter"
  ).innerText = `Step ${current} / ${total}`;
  const pct = (current / total) * 100;
  document.getElementById("avatar-progress-bar").style.width = `${pct}%`;

  const completionBox = document.getElementById("avatar-completion-box");
  if (currentAvatarStepIdx >= avatarSteps.length - 1) {
    completionBox.classList.remove("hidden");
  } else {
    completionBox.classList.add("hidden");
  }
}

function speakLectureStep() {
  if (!("speechSynthesis" in window)) {
    alert("आपका ब्राउज़र वॉइस स्पीच सपोर्ट नहीं करता है।");
    return;
  }
  window.speechSynthesis.cancel();
  const text = avatarSteps[currentAvatarStepIdx];
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "hi-IN";
  utterance.rate = 0.95;
  utterance.pitch = 1.0;

  const voice = pickEduSirVoice();
  if (voice) utterance.voice = voice;

  utterance.onstart = () => {
    const icon = document.getElementById("avatar-speaker-icon");
    if (icon) icon.classList.add("scale-110", "bg-rose-600/50");
  };
  utterance.onend = () => {
    const icon = document.getElementById("avatar-speaker-icon");
    if (icon) icon.classList.remove("scale-110", "bg-rose-600/50");
  };

  window.speechSynthesis.speak(utterance);
}

function pauseLecture() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.pause();
  }
}

function resumeLecture() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.resume();
  }
}

function stopLecture() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
  const icon = document.getElementById("avatar-speaker-icon");
  if (icon) icon.classList.remove("scale-110", "bg-rose-600/50");
}

function nextLectureStep() {
  stopLecture();
  if (currentAvatarStepIdx < avatarSteps.length - 1) {
    currentAvatarStepIdx++;
    document.getElementById(
      "avatar-lecture-step"
    ).innerText = `"${avatarSteps[currentAvatarStepIdx]}"`;
    updateAvatarUI();
    speakLectureStep();
  }
}

function prevLectureStep() {
  stopLecture();
  if (currentAvatarStepIdx > 0) {
    currentAvatarStepIdx--;
    document.getElementById(
      "avatar-lecture-step"
    ).innerText = `"${avatarSteps[currentAvatarStepIdx]}"`;
    updateAvatarUI();
    speakLectureStep();
  }
}

function repeatLectureSimpler() {
  stopLecture();
  avatarSteps.push(
    "कोटा वाले अंदाज़ में दोबारा समझें: इसे आसान बनाने के लिए हम इसका एक और प्रैक्टिकल उदाहरण देखते हैं।"
  );
  currentAvatarStepIdx = avatarSteps.length - 1;
  document.getElementById(
    "avatar-lecture-step"
  ).innerText = `"${avatarSteps[currentAvatarStepIdx]}"`;
  updateAvatarUI();
  speakLectureStep();
}

function understoodYes() {
  stopLecture();
  alert("🌟 बहुत बढ़िया! आपका कॉन्सेप्ट पक्का हो गया है।");
  switchTab("home");
}

function toggleAvatarPlay() {
  if ("speechSynthesis" in window && window.speechSynthesis.speaking) {
    if (window.speechSynthesis.paused) resumeLecture();
    else pauseLecture();
  } else {
    speakLectureStep();
  }
}

function askEduSirAboutLecture() {
  stopLecture();
  switchTab("chat");
  setPromptSuggestion(
    `Edu Sir, मैं अभी AI Lecture में "${currentAvatarTopic}" पढ़ रहा था। मुझे इसके इस स्टेप में थोड़ा डाउट है, इसे आसान भाषा में समझाओ: "${avatarSteps[currentAvatarStepIdx]}"`
  );
  sendDoubt();
}