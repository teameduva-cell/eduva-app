let base64Image = null;
let lastUserQuestion = "";
let currentStudentGoal = "Eduva Medicos";
let currentTeachingMode = "direct";
let userStreakCount = 12;

// Navigation History Stack for Back Button support
let navigationHistory = ["home"];

// --- DLP & Content Security Guardrails Fixed (Right-click & shortcuts blocked) ---
document.addEventListener("contextmenu", (event) => event.preventDefault());
document.addEventListener("copy", (event) => event.preventDefault());
document.addEventListener("cut", (event) => event.preventDefault());
document.addEventListener("paste", (event) => event.preventDefault());
document.addEventListener("dragstart", (event) => event.preventDefault());

document.addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();
  if ((e.ctrlKey || e.metaKey) && ["s", "p", "c", "u", "x", "a"].includes(k)) {
    e.preventDefault();
    alert(
      "⚠️ सुरक्षा कारणों से EDUVA पर यह एक्शन प्रतिबंधित है। सभी मॉड्यूल्स केवल ऐप के अंदर पढ़ने के लिए सुरक्षित हैं!"
    );
  }
  if (
    e.key === "F12" ||
    (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(k))
  ) {
    e.preventDefault();
    alert("⚠️ Developer tools are disabled under DLP Security Policy.");
  }
});

// Login Modal Handlers
function openLoginModal() {
  document.getElementById("login-modal").classList.remove("hidden");
}

function closeLoginModal() {
  document.getElementById("login-modal").classList.add("hidden");
}

function submitLogin() {
  const val = document.getElementById("login-input-val").value.trim();
  if (!val) {
    alert("कृपया अपना मोबाइल नंबर या ईमेल दर्ज करें!");
    return;
  }
  alert("✅ लॉगिन सफल! आपका स्वागत है चैंपियन।");
  closeLoginModal();
}