/* ================= EDUVA MEMORY ENGINE ================= */
const EDUVA_MEMORY_KEY = "eduva_student_memory_v1";
function getEduvaMemory() {
  try {
    return (
      JSON.parse(localStorage.getItem(EDUVA_MEMORY_KEY)) || {
        questions: 0,
        concepts: [],
        mistakes: [],
      }
    );
  } catch (e) {
    return { questions: 0, concepts: [], mistakes: [] };
  }
}
function saveEduvaMemory(m) {
  localStorage.setItem(EDUVA_MEMORY_KEY, JSON.stringify(m));
}
function updateMemoryDashboard() {
  const m = getEduvaMemory();
  const q = document.getElementById("mem-questions");
  const mi = document.getElementById("mem-mistakes");
  const c = document.getElementById("mem-concepts");
  const g = document.getElementById("mem-goal");
  if (q) q.textContent = m.questions || 0;
  if (mi) mi.textContent = (m.mistakes || []).length;
  if (c) c.textContent = (m.concepts || []).length;
  if (g) g.textContent = currentStudentGoal;
}
function clearEduvaMemory() {
  if (confirm("क्या आप EDUVA की memory साफ करना चाहते हैं?")) {
    localStorage.removeItem(EDUVA_MEMORY_KEY);
    updateMemoryDashboard();
  }
}