function setTeachingMode(mode) {
  currentTeachingMode = mode;
  const directBtn = document.getElementById("mode-direct-btn");
  const socraticBtn = document.getElementById("mode-socratic-btn");
  if (mode === "direct") {
    directBtn.className =
      "px-3 py-1.5 rounded-lg ink-navy text-white transition";
    socraticBtn.className =
      "px-3 py-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition";
  } else {
    socraticBtn.className =
      "px-3 py-1.5 rounded-lg bg-emerald-600 text-white transition";
    directBtn.className =
      "px-3 py-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition";
  }
}

function speakText(text) {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "hi-IN";
    utterance.rate = 1.0;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
  } else {
    alert("आपका ब्राउज़र वॉइस स्पीच सपोर्ट नहीं करता है।");
  }
}

function getGreetingTitle(goal) {
  if (goal === "Eduva Medicos") return "Hello Future Doctor!";
  if (goal === "Eduva Builders") return "Hello Future Engineer!";
  if (goal === "Eduva Scholar") return "Hello Future Scholar!";
  if (goal === "Eduva Ignite") return "Hello Future Champion!";
  return "Hello Future Innovator!";
}

function updateStudentGoal(goal) {
  currentStudentGoal = goal;
  document.getElementById("sidebar-greeting-title").innerText =
    getGreetingTitle(goal);
  document.getElementById("sidebar-batch-label").innerText = goal;
  document.getElementById("header-batch-select").value = goal;

  const welcomeEl = document.getElementById("chat-welcome-msg");
  if (welcomeEl) {
    let titleGreet = getGreetingTitle(goal);
    welcomeEl.innerHTML = `जय श्री राम, चैंपियन! मैं हूँ आपका अपना <b>Edu Sir</b> (${goal}).<br><b>${titleGreet}</b> चाहे 20 बार पूछ, तेरा भाई हर बार प्यार से समझाएगा!`;
  }
}

function submitPrivateFeedback() {
  const message = document.getElementById("fb-message").value.trim();
  if (!message) {
    alert("कृपया अपना सुझाव या कमी लिखकर भेजें!");
    return;
  }
  alert("✅ आपका गुप्त सुझाव सफलतापूर्वक फाउंडर तक पहुँच गया है! धन्यवाद।");
  document.getElementById("fb-message").value = "";
  switchTab("home");
}

function generateCustomTimetable() {
  const wake = document.getElementById("tt-wake").value;
  const sleep = document.getElementById("tt-sleep").value;
  const coaching = document.getElementById("tt-coaching").value;
  const goal = document.getElementById("tt-goal").value;

  switchTab("chat");
  setPromptSuggestion(
    `Edu Sir (${currentStudentGoal}), मैं सुबह ${wake} पर उठता हूँ और रात को ${sleep} पर सोता हूँ। मेरी कोचिंग ${coaching} की है और मेरा लक्ष्य "${goal}" है। कोटा हॉस्टल लाइफ के हिसाब से मेरे लिए प्रैक्टिकल टाइम टेबल बनाओ भाई।`
  );
  sendDoubt();
}

function startCounselingSession(topic) {
  switchTab("chat");
  setPromptSuggestion(
    `Edu Sir (${currentStudentGoal}), ${topic} कोटा में थोड़ा स्ट्रेस हो रहा है, बड़े भाई की तरह समझाओ ना यार।`
  );
  sendDoubt();
}

function sendCustomDoubt(text) {
  switchTab("chat");
  setPromptSuggestion(text);
  sendDoubt();
}

function setPromptSuggestion(text) {
  document.getElementById("chat-input").value = text;
  document.getElementById("chat-input").focus();
}

const BASE_SYSTEM_PROMPT = `You are "Edu Sir", an authentic, high-energy, and deeply affectionate Kota mentor (around 22-24 years old, like a loving elder brother/bhaiya). You speak natural Hinglish with a true Kota student culture vibe.
RULES FOR EDU SIR:
1. ABSOLUTELY NO NEGATIVITY, NO DEMOTIVATION, NO HARSH WORDS. Never use words like 'gadha', 'nalayak', 'ullu', or any abuse.
2. ENDLESS PATIENCE: Answer with 20 times more energy, warmth, and a big smile. Never get annoyed.
3. TEACHING MODES:
   - DIRECT MODE: Give a clear, step-by-step practical explanation with real-world examples.
   - SOCRATIC / HINT MODE: Do NOT give the direct answer immediately! Give a helpful hint, ask guiding questions to make the student think, and encourage them step-by-step. Once solved, give 4-5 similar practice questions for revision.
4. Always address them as "चैंपियन", "फ्यूचर डॉक्टर", "फ्यूचर इंजीनियर", या "मेरे भाई".`;

let conversationHistory = [{ role: "system", content: BASE_SYSTEM_PROMPT }];

function recordVoice() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return;
  const r = new SpeechRecognition();
  r.lang = "hi-IN";
  r.onresult = (e) => {
    document.getElementById("chat-input").value = e.results[0][0].transcript;
  };
  r.start();
}

function handleImage(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      base64Image = e.target.result;
      document
        .getElementById("image-preview-container")
        .classList.remove("hidden");
    };
    reader.readAsDataURL(input.files[0]);
  }
}
function removeImage() {
  base64Image = null;
  document.getElementById("image-preview-container").classList.add("hidden");
  document.getElementById("file-input").value = "";
}

function renderMathInElementCustom(el) {
  if (window.renderMathInElement) {
    renderMathInElement(el, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false },
      ],
      throwOnError: false,
    });
  }
}

async function sendDoubt() {
  const input = document.getElementById("chat-input");
  const text = input.value.trim();
  if (!text && !base64Image) return;

  lastUserQuestion = text;
  const container = document.getElementById("chat-messages");
  container.innerHTML += `
                <div class="flex justify-end">
                    <div class="ink-navy text-white p-4 rounded-3xl rounded-tr-sm text-sm sm:text-base shadow-md max-w-[85%] font-medium">
                        ${ base64Image ? '<span class="block text-xs text-white/80 font-bold mb-1">📷 [Photo Attached]</span>' : "" }
                        ${text}
                    </div>
                </div>
            `;

  input.value = "";
  const currentImg = base64Image;
  removeImage();
  container.scrollTop = container.scrollHeight;

  const loadingId = "loading-" + Date.now();
  container.innerHTML += `
                <div id="${loadingId}" class="flex items-start space-x-3">
                    <div class="w-10 h-10 rounded-xl ink-navy text-white flex items-center justify-center shrink-0 shadow-md font-bold text-xs">ES</div>
                    <div class="bg-white border border-slate-200 p-4 rounded-2xl text-sm sm:text-base text-slate-700 font-medium">Edu Sir (${currentStudentGoal}) कोटा वाले अंदाज़ में समझा रहे हैं...</div>
                </div>
            `;
  lucide.createIcons();
  container.scrollTop = container.scrollHeight;

  try {
    let modeInstruction =
      currentTeachingMode === "socratic"
        ? "[Instruction: Use Socratic/Hint mode. Do not give the direct answer immediately. Give a plain hint, ask guiding questions, and prompt the student to think. Once solved, give 4-5 practice questions.]"
        : "[Instruction: Use Direct Mode. Give a clear, step-by-step practical explanation with real-world Kota examples.]";

    let userContent =
      `${modeInstruction} [Student Goal: ${currentStudentGoal}] ` +
      (text || "कृपया इस प्रश्न को हल करें।");

    let messagePayload;
    let selectedModel;

    if (currentImg) {
      selectedModel = "llama-3.2-11b-vision-preview";
      messagePayload = {
        role: "user",
        content: [
          { type: "text", text: userContent },
          { type: "image_url", image_url: { url: currentImg } },
        ],
      };
    } else {
      selectedModel = "openai/gpt-oss-120b";
      messagePayload = { role: "user", content: userContent };
    }

    conversationHistory.push(messagePayload);

    // API Request — relative URL, always matches same-origin Vercel deployment
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userContent }),
    });

    if (!res.ok) throw new Error(`Server Status ${res.status}`);

    const data = await res.json();

    if (!data.choices || data.choices.length === 0) {
      throw new Error("Invalid response from proxy server.");
    }

    let reply = data.choices[0].message.content
      .replace(/<think>[\s\S]*?<\/think>/g, "")
      .trim();
    conversationHistory.push({ role: "assistant", content: reply });

    document.getElementById(loadingId).remove();

    const messageId = "msg-" + Date.now();
    const plainTextForSpeech = reply.replace(/[*_#`$]/g, "");

    container.innerHTML += `
                    <div class="flex items-start space-x-3 max-w-3xl">
                        <div class="w-10 h-10 rounded-xl ink-navy text-white flex items-center justify-center shrink-0 shadow-md font-bold text-xs">ES</div>
                        <div class="space-y-3 w-full">
                            <div id="${messageId}" class="bg-white border border-slate-200 chat-bubble p-5 sm:p-6 rounded-3xl rounded-tl-sm text-base sm:text-lg text-slate-900 shadow-xs leading-relaxed">
                                ${marked.parse(reply)}
                            </div>
                            <div class="flex items-center gap-2 pt-1 flex-wrap">
                                <button onclick="handleChatReaction('up', '${messageId}')" class="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition flex items-center gap-1 shadow-2xs"><i data-lucide="thumbs-up" class="w-4 h-4 text-emerald-600"></i> Helpful</button>
                                <button onclick="handleChatReaction('down', '${messageId}')" class="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition flex items-center gap-1 shadow-2xs"><i data-lucide="thumbs-down" class="w-4 h-4 text-rose-600"></i> Not Satisfied</button>
                                <button onclick="handleChatReaction('op', '${messageId}')" class="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 font-black text-xs rounded-lg transition flex items-center gap-1 border border-amber-200 shadow-2xs"><i data-lucide="zap" class="w-4 h-4"></i> OP 🔥</button>
                                <button onclick="handleChatReaction('regen', '${messageId}')" class="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition flex items-center gap-1 shadow-2xs"><i data-lucide="rotate-cw" class="w-4 h-4 text-blue-600"></i> Regenerate</button>
                                <button onclick='openNotesModal(document.getElementById("${messageId}").innerText)' class="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-black text-xs rounded-lg transition flex items-center gap-1 border border-indigo-200 shadow-2xs"><i data-lucide="pen-line" class="w-4 h-4"></i> हैंडरिटेन नोट्स 📝</button>
                            </div>
                            <button onclick="speakText('${plainTextForSpeech.replace( /'/g, "\\'" )}')" class="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-slate-100 border border-slate-200 text-slate-800 hover:bg-slate-200 font-bold text-xs sm:text-sm rounded-xl transition shadow-2xs mt-1">
                                <i data-lucide="volume-2" class="w-4 h-4"></i> Edu Sir को बोलकर सुनें
                            </button>
                        </div>
                    </div>
                `;

    renderMathInElementCustom(document.getElementById(messageId));
    lucide.createIcons();
    container.scrollTop = container.scrollHeight;
  } catch (err) {
    document.getElementById(loadingId).remove();
    container.innerHTML += `<div class="text-xs text-red-600 font-bold p-3 bg-red-50 rounded-2xl border border-red-200 mx-2">⚠️ Error: ${err.message}. (ध्यान दें: Render का फ्री सर्वर इनएक्टिव होने पर पहली रिक्वेस्ट पर 30-50 सेकंड ले सकता है, कृपया दोबारा प्रयास करें)।</div>`;
  }
}