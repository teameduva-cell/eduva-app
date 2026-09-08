// Flashcards Data & Logic
const flashcardsData = [
  {
    cat: "PHYSICS • MECHANICS",
    q: "गति के समीकरण (Equations of Motion)",
    a: "v = u + at <br> s = ut + 1/2 at² <br> v² = u² + 2as",
  },
  {
    cat: "CHEMISTRY • PHYSICAL",
    q: "आदर्श गैस समीकरण (Ideal Gas Equation)",
    a: "PV = nRT <br> जहाँ P=Pressure, V=Volume, n=Moles, R=Gas Constant, T=Temperature",
  },
  {
    cat: "BIOLOGY • GENETICS",
    q: "मैंडल का स्वतंत्र अपव्यूहन नियम (Law of Independent Assortment)",
    a: "डाईहाइब्रिड क्रॉस का फिनोटाइपिक अनुपात (Phenotypic Ratio): <br> 9 : 3 : 3 : 1",
  },
  {
    cat: "PHYSICS • ELECTROSTATICS",
    q: "कूलाॅम का नियम (Coulomb's Law)",
    a: "F = k * (q₁ * q₂) / r² <br> जहाँ k = 1 / (4πε₀) ≈ 9 × 10⁹ N·m²/C²",
  },
  {
    cat: "CHEMISTRY • ORGANIC",
    q: "मार्कोनीकॉव नियम (Markovnikov's Rule)",
    a: "असममित एल्कीन पर HX के योग में, ऋणात्मक भाग (X⁻) उस कार्बन पर जुड़ता है जिस पर हाइड्रोजन परमाणुओं की संख्या कम होती है।",
  },
];
let currentFCIndex = 0,
  isFCFlipped = false;

function flipFlashcard() {
  const contentEl = document.getElementById("fc-content");
  isFCFlipped = !isFCFlipped;
  if (isFCFlipped) {
    contentEl.innerHTML = `<h3 class="text-lg font-bold text-emerald-400">उत्तर / मुख्य सूत्र:</h3><p class="text-base sm:text-lg font-mono text-white leading-relaxed">${flashcardsData[currentFCIndex].a}</p>`;
  } else {
    contentEl.innerHTML = `<h3 class="text-xl sm:text-2xl font-bold text-amber-300">${flashcardsData[currentFCIndex].q}</h3>`;
  }
}
function nextFlashcard() {
  currentFCIndex = (currentFCIndex + 1) % flashcardsData.length;
  isFCFlipped = false;
  document.getElementById("fc-category").innerText =
    flashcardsData[currentFCIndex].cat;
  document.getElementById("fc-counter").innerText = `${currentFCIndex + 1} / ${ flashcardsData.length }`;
  document.getElementById(
    "fc-content"
  ).innerHTML = `<h3 class="text-xl sm:text-2xl font-bold text-amber-300">${flashcardsData[currentFCIndex].q}</h3>`;
}
function prevFlashcard() {
  currentFCIndex =
    (currentFCIndex - 1 + flashcardsData.length) % flashcardsData.length;
  isFCFlipped = false;
  document.getElementById("fc-category").innerText =
    flashcardsData[currentFCIndex].cat;
  document.getElementById("fc-counter").innerText = `${currentFCIndex + 1} / ${ flashcardsData.length }`;
  document.getElementById(
    "fc-content"
  ).innerHTML = `<h3 class="text-xl sm:text-2xl font-bold text-amber-300">${flashcardsData[currentFCIndex].q}</h3>`;
}