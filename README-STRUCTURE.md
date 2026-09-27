# 📁 EDUVA App — File Structure Guide

> Yeh doc batata hai ki splitting ke baad kaunsi file kahan hai aur editing kaise karein.

## Structure

```
eduva-app/
├── index.html          → Sirf HTML views + 6 chhote init scripts (PWA ke liye zaroori)
├── css/
│   └── app.css         → Saara styling (23 KB)
├── js/
│   ├── core.js         → Chat engine, safety, switchTab, saare features (403 KB)
│   ├── handwriting.js  → Notes/solution canvas renderer, diagram, topic notes (32 KB)
│   ├── studygym.js     → Study Gym ke 5 tools (13 KB)
│   ├── features.js     → Pomodoro, tests, NCERT engine etc. (67 KB)
│   └── features2.js    → Final init scripts (7.5 KB)
├── api/chat.js         → AI API endpoint (ispe haath mat dalna)
└── index-safe.html     → ⚠️ Emergency backup (rename karke index.html banao agar sab bigde)
```

## Load Order (bahut important!)

Browser is order mein load karta hai — **is order ko mat badlo:**
1. CDN libs (Tailwind, Lucide, KaTeX, fonts)
2. 6 chhote init scripts (dark mode, PWA, theme)
3. `js/core.js`
4. `js/handwriting.js`
5. `js/studygym.js`
6. `js/features.js`
7. Baaki feature files (student-phase2, teacher-topics, etc.)
8. `js/features2.js`

## Editing Rules

1. **CSS change** → sirf `css/app.css`
2. **Chat/safety/feature logic** → `js/core.js`
3. **Handwritten solution/notes/diagram** → `js/handwriting.js`
4. **Study Gym tools** → `js/studygym.js`
5. **Kuch bhi edit karne ke baad:** browser console check karo (red error nahi hona chahiye)
6. **Bada change** → pehle GitHub pe branch banao, phir kaam shuru karo

## Emergency Restore

App toot jaye toh:
1. `index-safe.html` ka naam badal ke `index.html` kar do
2. Ya GitHub backup branch se restore karo
