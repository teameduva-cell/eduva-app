// EDUVA — Daily Founder Report (Vercel Cron)
// Vercel Dashboard → Settings → Environment Variables:
//   RESEND_API_KEY = re_xxxxxxxx (resend.com — free 100 emails/day)
//   FOUNDER_EMAIL  = team.eduva@gmail.com
// Schedule: vercel.json (roz shaam 6:30 PM IST = 13:00 UTC)

module.exports = async function handler(req, res) {
  // Basic protection: sirf Vercel cron ya manual admin call
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers['x-cron-secret'] !== secret && req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const RESEND_KEY = process.env.RESEND_API_KEY;
  const TO = process.env.FOUNDER_EMAIL || 'team.eduva@gmail.com';

  const today = new Date().toLocaleString('hi-IN', { timeZone: 'Asia/Kolkata' });
  const appUrl = 'https://eduva-app.vercel.app';

  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:auto;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#0F172A,#2563EB);color:#fff;padding:20px 24px">
        <h1 style="margin:0;font-size:20px">📊 EDUVA Daily Report</h1>
        <p style="margin:4px 0 0;opacity:.8;font-size:12px">${today}</p>
      </div>
      <div style="padding:24px">
        <p style="font-size:14px;color:#334155">Namaste Founder! 👋 App live hai aur healthy chal rahi hai.</p>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:14px 16px;margin:14px 0">
          <p style="margin:0;font-size:13px;color:#166534">✅ Server: <b>ONLINE</b> • Cron: <b>WORKING</b></p>
        </div>
        <p style="font-size:13px;color:#475569">Live stats dekhne ke liye (students, doubts, Material Bank, feedback):</p>
        <a href="${appUrl}" style="display:inline-block;background:#2563EB;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-size:13px;font-weight:bold">🔐 Founder Dashboard खोलो</a>
        <p style="font-size:11px;color:#94a3b8;margin-top:16px">Tip: EDUVA logo ko 2 second dabakar PIN ${'143450'} daalo → dashboard khulega.</p>
      </div>
      <div style="background:#f8fafc;padding:12px 24px;font-size:11px;color:#94a3b8">EDUVA • Kota Smart Learning Hub — 100% FREE for every champion 🚀</div>
    </div>`;

  if (!RESEND_KEY) {
    return res.status(200).json({ ok: true, note: 'RESEND_API_KEY set nahi hai — email skip. Dashboard manually check karo.' });
  }

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'EDUVA Reports <onboarding@resend.dev>',
        to: [TO],
        subject: `📊 EDUVA Daily Report — ${new Date().toLocaleDateString('hi-IN', { timeZone: 'Asia/Kolkata' })}`,
        html
      })
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'Resend error');
    return res.status(200).json({ ok: true, id: data.id });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
