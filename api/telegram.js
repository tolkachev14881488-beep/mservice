/**
 * Serverless endpoint для безопасной отправки в Telegram.
 * Деплой: Vercel (api/telegram.js) или Netlify Functions.
 *
 * Переменные окружения:
 *   TELEGRAM_BOT_TOKEN — токен бота
 *   TELEGRAM_CHAT_ID   — ID чата (-5172529914)
 *
 * В main.js укажите:
 *   TELEGRAM_ENDPOINT: "https://your-domain.vercel.app/api/telegram"
 */

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return res.status(500).json({ ok: false, error: "Telegram not configured" });
  }

  const { text } = req.body || {};
  if (!text) {
    return res.status(400).json({ ok: false, error: "Missing text" });
  }

  try {
    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" })
    });
    const data = await tgRes.json();
    return res.status(200).json({ ok: !!data.ok });
  } catch {
    return res.status(500).json({ ok: false });
  }
}
