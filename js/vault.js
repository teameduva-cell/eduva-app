// Vault Bookmarks Logic
function bookmarkCurrentChat() {
  let vault = JSON.parse(localStorage.getItem("eduva_vault") || "[]");
  vault.push({
    text: lastUserQuestion || "महत्वपूर्ण फॉर्मूला / डाउट",
    date: new Date().toLocaleDateString("hi-IN"),
  });
  localStorage.setItem("eduva_vault", JSON.stringify(vault));
  alert("📌 सफलताપूर्व आपके पर्सनल वॉल्ट में सेव हो गया!");
  loadVaultItems();
}

function loadVaultItems() {
  let vault = JSON.parse(localStorage.getItem("eduva_vault") || "[]");
  let container = document.getElementById("vault-items-container");
  if (!container) return;
  if (vault.length === 0) {
    container.innerHTML = `<p class="text-sm text-slate-400 text-center py-6">आपका वॉल्ट अभी खाली है। चैट से डाउट्स सेव करें!</p>`;
    return;
  }
  container.innerHTML = vault
    .map(
      (item, idx) => ` <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-sm"> <div><p class="font-bold text-slate-900">${item.text}</p><span class="text-xs text-slate-400 font-mono">Saved on: ${item.date}</span></div> <button onclick="removeVaultItem(${idx})" class="text-rose-600 font-bold hover:underline cursor-pointer">हटाएं</button> </div> `
    )
    .join("");
}

function removeVaultItem(idx) {
  let vault = JSON.parse(localStorage.getItem("eduva_vault") || "[]");
  vault.splice(idx, 1);
  localStorage.setItem("eduva_vault", JSON.stringify(vault));
  loadVaultItems();
}

function clearVault() {
  localStorage.removeItem("eduva_vault");
  loadVaultItems();
}

function giveKotaBoost() {
  switchTab("chat");
  setPromptSuggestion(
    "Edu Sir, मैं थोड़ा डीमोटीवेट महसूस कर रहा हूँ। कोटा वाले अंदाज़ में मुझे एक ज़ोरदार मोटिवेशनल बूस्ट दो भाई!"
  );
  sendDoubt();
}