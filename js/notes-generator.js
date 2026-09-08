/* ================= HANDWRITTEN NOTES GENERATOR ================= */
const NOTES_CANVAS_WIDTH = 800;
const NOTES_LEFT_MARGIN_X = 100;
const NOTES_RIGHT_PADDING = 40;
const NOTES_TOP_START_Y = 60;
const NOTES_LINE_HEIGHT = 40;
const NOTES_BOTTOM_PADDING = 40;
const NOTES_FONT_SIZE = 28;
const NOTES_FONT = `${NOTES_FONT_SIZE}px "Kalam", cursive`;

function openNotesModal(prefillText) {
  document.getElementById("notes-modal").classList.remove("hidden");
  const textarea = document.getElementById("notesText");
  if (prefillText) textarea.value = prefillText;
  document.fonts.load(NOTES_FONT).then(() => {
    generateNotes();
  });
}

function closeNotesModal() {
  document.getElementById("notes-modal").classList.add("hidden");
}

// टेक्स्ट को \n पर पैराग्राफ में तोड़ो, फिर हर पैराग्राफ को word-wrap करो
function wrapNotesText(ctx, text, maxWidth) {
  const paragraphs = text.split("\n");
  const lines = [];

  paragraphs.forEach((para) => {
    if (para.trim() === "") {
      lines.push(""); // खाली लाइन = पैराग्राफ गैप
      return;
    }
    const words = para.split(" ");
    let line = "";

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const testWidth = ctx.measureText(testLine).width;

      if (testWidth > maxWidth && line !== "") {
        lines.push(line.trim());
        line = words[n] + " ";
      } else {
        line = testLine;
      }
    }
    lines.push(line.trim());
  });

  return lines;
}

function generateNotes() {
  const canvas = document.getElementById("notesCanvas");
  const ctx = canvas.getContext("2d");
  const text = document.getElementById("notesText").value;
  const naturalTilt = document.getElementById("naturalTilt").checked;

  const maxWidth =
    NOTES_CANVAS_WIDTH - NOTES_LEFT_MARGIN_X - NOTES_RIGHT_PADDING;

  // पहले फॉन्ट सेट करो ताकि measureText सही चले
  ctx.font = NOTES_FONT;
  const lines = wrapNotesText(ctx, text, maxWidth);

  // ज़रूरी height calculate करो (dynamic canvas size)
  const neededHeight =
    NOTES_TOP_START_Y + lines.length * NOTES_LINE_HEIGHT + NOTES_BOTTOM_PADDING;
  canvas.height = Math.max(1000, neededHeight);

  // canvas height बदलने के बाद font फिर से सेट करना पड़ता है
  ctx.font = NOTES_FONT;

  drawNotesPaperBackground(ctx, canvas);
  drawNotesRuledLines(ctx, canvas);

  ctx.fillStyle = "#1e3a8a"; // पेन की नीली स्याही का रंग

  let y = NOTES_TOP_START_Y - 8;

  lines.forEach((line) => {
    if (line === "") {
      y += NOTES_LINE_HEIGHT;
      return;
    }

    ctx.save();

    if (naturalTilt) {
      // हर लाइन पर हल्का सा रैंडम टिल्ट और पोजीशन वेरिएशन
      const angle = (Math.random() * 1.6 - 0.8) * (Math.PI / 180); // ±0.8 डिग्री
      const yJitter = Math.random() * 3 - 1.5; // ±1.5px
      const xJitter = Math.random() * 2; // 0-2px

      ctx.translate(NOTES_LEFT_MARGIN_X, y + yJitter);
      ctx.rotate(angle);
      ctx.fillText(line, xJitter, 0);
    } else {
      ctx.fillText(line, NOTES_LEFT_MARGIN_X, y);
    }

    ctx.restore();
    y += NOTES_LINE_HEIGHT;
  });
}

function drawNotesPaperBackground(ctx, canvas) {
  ctx.fillStyle = "#fdfbf7";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawNotesRuledLines(ctx, canvas) {
  // नीली क्षैतिज लाइनें
  ctx.strokeStyle = "#93c5fd";
  ctx.lineWidth = 1;
  for (let y = NOTES_TOP_START_Y; y < canvas.height; y += NOTES_LINE_HEIGHT) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // लाल मार्जिन लाइन (वर्टिकल)
  ctx.strokeStyle = "#f87171";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(80, 0);
  ctx.lineTo(80, canvas.height);
  ctx.stroke();
}

function downloadNotes() {
  const canvas = document.getElementById("notesCanvas");
  const link = document.createElement("a");
  link.download = "eduva-notes-" + Date.now() + ".png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}
/* ================= END HANDWRITTEN NOTES GENERATOR ================= */