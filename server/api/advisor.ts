import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applyCors } from './_lib.js';

// Groq is OpenAI-compatible. The model is configurable via GROQ_MODEL.
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT = `You are Drover's livestock trading advisor for the Australian beef supply chain.
You write a SHORT (120-180 word) plain-English evaluation for a producer.
Strict rules:
- Use ONLY the figures provided in the user's message. NEVER invent or estimate prices, costs, or weights.
- All money is AUD.
- Comment on which stage(s) contribute most/least margin, whether the route looks profitable, and one clear, actionable consideration.
- If a key figure is zero or missing, say it needs to be entered rather than guessing.
- Be concise and practical. No markdown headings.`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return;
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'GROQ_API_KEY is not configured on the server.' });
    return;
  }

  const { context, evaluation } = (req.body || {}) as {
    context?: string;
    evaluation?: unknown;
  };

  if (!context) {
    res.status(400).json({ error: 'Missing "context".' });
    return;
  }

  const userMessage = [
    context,
    evaluation ? `\nStructured evaluation (JSON, AUD): ${JSON.stringify(evaluation)}` : '',
    '\nWrite the brief now.',
  ].join('');

  try {
    const model = process.env.GROQ_MODEL || DEFAULT_MODEL;
    const groqRes = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        max_tokens: 400,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
      }),
    });

    if (!groqRes.ok) {
      const text = await groqRes.text();
      res.status(502).json({ error: `Groq error ${groqRes.status}: ${text}` });
      return;
    }

    const data = (await groqRes.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const brief = data.choices?.[0]?.message?.content?.trim() || 'No response generated.';
    res.status(200).json({ brief, model });
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'Unknown error' });
  }
}
