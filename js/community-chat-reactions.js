// --- COMMUNITY DOUBT POOL LOGIC ---
let communityDoubts = [
  {
    id: 1,
    author: "राहुल (Kota Student)",
    doubt:
      "क्लास 12 इलेक्ट्रोस्टैटिक्स में गाउस लॉ (Gauss's Law) सिर्फ बंद सतह के लिए ही क्यों लागू होता है, खुले पृष्ठ के लिए क्यों नहीं?",
    answers: [
      {
        text: "भैया, गाउस लॉ सिमेट्रिक क्लोज्ड सरफेस (Gaussian surface) के फ्लक्स को कैलकुलेट करने के लिए बना है ताकि कुल आवेश (Total charge enclosed) आसानी से निकल सके।",
        verified: true,
        by: "प्रिया (AIIMS Aspirant)",
      },
    ],
  },
];

function loadCommunityDoubts() {
  let container = document.getElementById("community-doubts-list");
  if (!container) return;
  if (communityDoubts.length === 0) {
    container.innerHTML = `<p class="text-sm text-slate-400 text-center py-4">अभी कोई डाउट नहीं है। पहला सवाल पूछें!</p>`;
    return;
  }
  container.innerHTML = communityDoubts
    .map(
      (item, index) => ` <div class="p-4 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-2xs"> <div class="flex items-center justify-between"> <span class="text-xs font-bold text-slate-500 mono-font">👤 ${ item.author }</span> <span class="text-xs bg-purple-50 text-purple-700 font-bold px-2.5 py-0.5 rounded-full">Active Doubt</span> </div> <p class="text-sm sm:text-base font-bold text-slate-900">${ item.doubt }</p> <div class="space-y-2 pt-2 border-t border-slate-100"> <p class="text-xs font-black text-slate-400 mono-font">साथी छात्रों के उत्तर:</p> ${item.answers .map( (ans, aIdx) => ` <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5"> <p class="text-sm sm:text-base text-slate-800 font-medium">${ ans.text }</p> <div class="flex items-center justify-between text-xs"> <span class="text-slate-500 font-bold">उत्तरदाता: ${ ans.by }</span> <div> ${ ans.verified ? '<span class="text-emerald-700 font-black bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">✔ Verified by Peer</span>' : `<button onclick="verifyCommunityAnswer(${index}, ${aIdx})" class="px-3.5 py-1.5 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition">सही है (Verify)</button>` } </div> </div> </div> ` ) .join("")} </div> <div class="flex items-center gap-2.5 pt-2"> <input type="text" id="ans-input-${index}" placeholder="इस डाउट का उत्तर लिखें..." class="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-blue-600 font-medium"> <button onclick="submitCommunityAnswer(${index})" class="px-4.5 py-2.5 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-700 transition">उत्तर दें</button> </div> </div> `
    )
    .join("");
  lucide.createIcons();
}

function postCommunityDoubt() {
  const doubtText = document.getElementById("community-new-doubt").value.trim();
  if (!doubtText) {
    alert("कृपया अपना डाउट लिखें!");
    return;
  }
  communityDoubts.unshift({
    id: Date.now(),
    author: "आप (" + currentStudentGoal + ")",
    doubt: doubtText,
    answers: [],
  });
  document.getElementById("community-new-doubt").value = "";
  alert("✅ आपका डाउट कम्युनिटी पूल में सफलतापूर्वक पोस्ट हो गया है!");
  loadCommunityDoubts();
}

function submitCommunityAnswer(dIndex) {
  const ansText = document.getElementById(`ans-input-${dIndex}`).value.trim();
  if (!ansText) {
    alert("कृपया उत्तर लिखें!");
    return;
  }
  communityDoubts[dIndex].answers.push({
    text: ansText,
    verified: false,
    by: "आप (Kota Aspirant)",
  });
  document.getElementById(`ans-input-${dIndex}`).value = "";
  alert("🎉 आपका उत्तर पोस्ट हो गया! अन्य छात्र इसे वेरीफाई करेंगे।");
  loadCommunityDoubts();
}

function verifyCommunityAnswer(dIndex, aIndex) {
  communityDoubts[dIndex].answers[aIndex].verified = true;
  userStreakCount += 1;
  document.getElementById(
    "header-streak-display"
  ).innerText = `${userStreakCount} STREAK`;
  document.getElementById(
    "community-streak-counter"
  ).innerText = `मेरे स्ट्रीक्स: ${userStreakCount}`;
  alert(
    "🌟 शानदार! आपके वेरीफिकेशन से इस उत्तर को अप्रूव कर दिया गया है। आपका स्ट्रीक बढ़ गया है!"
  );
  loadCommunityDoubts();
}

function sendUnsatisfiedToCommunity() {
  if (!lastUserQuestion) {
    alert("कोई पिछला सवाल नहीं मिला जिसे कम्युनिटी में भेजा जाए।");
    return;
  }
  communityDoubts.unshift({
    id: Date.now(),
    author: "आप (" + currentStudentGoal + ")",
    doubt: lastUserQuestion,
    answers: [
      {
        text: "AI का उत्तर संतोषजनक नहीं था, कृपया साथी छात्र इसे आसान भाषा में समझाएं।",
        verified: false,
        by: "सिस्टम नोट",
      },
    ],
  });
  switchTab("community");
  alert("📤 आपका सवाल कम्युनिटी डाउट पूल में भेज दिया गया है!");
}
// --- END COMMUNITY LOGIC ---

// --- CHAT REACTION LOGIC ---
function handleChatReaction(action, msgId) {
  if (action === "up") {
    alert("👍 धन्यवाद! फीडबैक दर्ज कर लिया गया है।");
  } else if (action === "down") {
    alert(
      "👎 क्षमा करें! यह सवाल कम्युनिटी डाउट पूल में भेजा जा रहा है ताकि साथी छात्र और बेहतर समझा सकें।"
    );
    sendUnsatisfiedToCommunity();
  } else if (action === "op") {
    alert(
      "🔥 वाह! इस सवाल और उत्तर को आपके Formula Vault में सेव कर लिया गया है!"
    );
    bookmarkCurrentChat();
  } else if (action === "regen") {
    alert("🔄 उत्तर दोबारा जनरेट किया जा रहा है...");
    sendDoubt();
  }
}
// --- END CHAT REACTION LOGIC ---