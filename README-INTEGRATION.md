# 🧑‍🏫 EDUVA Teacher Panel — Integration Guide

Ye package 4 files ka hai. Live app ko chhoo kar sirf 3 chhote changes karne hain:

## Files
```
📁 (project root)
 ├── 📁 api/
 │    └── chat.js          ← backend patch — DIRECT REPLACE (naam badalne ki zaroorat nahi)
 ├── index.html            ← READY-MADE integrated file — purani index ki JAGAH daalo
 │                           (Teacher Panel ke saath sab kuch pehle se laga hua hai)
 ├── teacher-topics.js      ← root/public mein copy karo
 ├── teacher-panel.js       ← root/public mein copy karo
 └── README-INTEGRATION.md  ← ye file
```
⚠️ Sirf 4 kaam: (1) api/chat.js replace (2) index.html replace (3) do JS files copy (4) deploy.
Purana app code isme bilkul waisa hi hai jaisa tha — sirf Teacher Panel ki entries add hui hain.

## Step 1 — Files copy karo
Charo files project ki root mein daal do (jahan purani index.html hai). `index.html` aur
`api/chat.js` PURANI files ki jagah aayengi, do JS files nayi add hongi.

## Step 2-4 — Already done ✅
Integrated `index.html` mein pehle se hai: script tags, view-teacher section,
desktop sidebar button, mobile More-menu entry, aur Home pe teacher card.
Kuch paste karne ki zaroorat NAHI hai.

<details><summary>Manual paste steps (agar chahiye)</summary>

Script tags (`</body>` se pehle):
```html
<script src="/teacher-topics.js"></script>
<script src="/teacher-panel.js"></script>
```
`teacher-panel.html` ka `<section id="view-teacher">` `<main>` ke andar paste karo,
sidebar mein switchTab('teacher') button, mobile menu mein entry, aur Home pe card.
</details>
Desktop sidebar (sidebar nav ke andar):

```html
<button onclick="switchTab('teacher')" id="dtab-teacher"
  class="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-slate-700 hover:bg-slate-100 transition cursor-pointer">
  <i data-lucide="user-check" class="w-5 h-5 text-indigo-600"></i> 🧑‍🏫 Teacher Panel
</button>
```

Mobile "More" menu (`#header-more-menu`) mein bhi ek item:

```html
<button onclick="switchTab('teacher'); toggleHeaderMoreMenu();"
  class="w-full flex items-center gap-2.5 px-3 py-2.5 bg-slate-50 hover:bg-indigo-50 rounded-xl text-xs font-bold text-slate-700 text-left cursor-pointer">
  <span class="text-base leading-none">🧑‍🏫</span> Teacher Panel
</button>
```

(optional) Home pe marketing card:

```html
<button onclick="switchTab('teacher')"
  class="w-full p-4 rounded-3xl flex items-center gap-4 text-left cursor-pointer hover:scale-[1.01] shadow-lg"
  style="background: linear-gradient(135deg, #312e81, #6d28d9);">
  <div class="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl">🧑‍🏫</div>
  <div class="flex-1">
    <p class="text-white font-black text-sm">Teacher हो? Question Paper FREE बनाओ & Audit करो</p>
    <p class="text-white/80 text-xs font-semibold">🔒 पेपर 2 घंटे में auto-delete — 100% private</p>
  </div>
</button>
```

## Step 5 — Backend patch (READY-MADE INCLUDED)
Zip mein `api/chat.js` (**folder: `api/`**) already sahi naam se hai — ye tumhari purani `api/chat.js` ka v3.5 patched version hai:
- ✅ `images: [base64...]` multi-page array support (max 10 pages, combined ~10MB)
- ✅ `system: "..."` custom system prompt (Teacher Panel calls ke liye — Edu Sir persona override)
- ✅ OpenRouter max_tokens 4096 (lambe audit reports ke liye)
- ✅ purana single `image` (dataURL) field bhi aise hi chalta rahega — purana app code nahi tootega
Is file ko apne `api/chat.js` ki jagah copy kar do (ya diff dekh ke manually merge).

## Kya-kya included hai (3 tabs)
- 📄 **Daily Practice Sheet** — topic select + custom topics, 5-50 सवाल, Short/Mixed/MCQ format,
  "Teacher copy" toggle (answers साथ में), 3 difficulty levels, Answer Key + Solutions buttons
- 📝 **Paper Generator** — class/subject → auto topics (+custom), marks, time, MCQ mode,
  negative marking, **question-type breakdown** (MCQ/V.Short/Short/Long/Case/Match/Compare/Assertion),
  3 difficulty levels, AI time-estimate with warning
- 🧾 **Paper Audit** — multi-page photo upload, Hindi/English report, question-wise errors
  + 💡 असर, QUICK SUMMARY, PAPER HEALTH SCORE /10, DESIGN AUDIT
- 📘 **Full Solution** + 🔑 **Answer Key** — one tap, photos auto-resent (teacher kuch dobara nahi karta)
- 🔒 **2-hour hard auto-delete** — live countdown, sessionStorage TTL purge, consent ke bina
  server/Firestore pe kuch nahi jaata
- 📥 Device save (photos + .txt), 🗂️ optional account save (consent checkbox pattern)

## Honesty note (important)
2-hour claim technically ye hai: photos/text browser ke andar sessionStorage + memory mein rehte hain
(2h TTL purge), API processing se guzar ke khatam; consent na ho to Firestore mein kabhi nahi.
Cloud consent save karwana ho to Firestore function `eduvaSaveTeacherPaper` app ke Firebase module
mein add karna hoga (code main chat mein diya gaya hai).
