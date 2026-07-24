const { generateText } = require("./aiProvider");

/**
 * Takes a raw question (title + body) and asks the LLM to rewrite it
 * into a clearer, well-structured version. The original is never
 * overwritten — the caller decides whether to store/show the improved
 * version, so the user can accept or reject it (before/after diff).
 */
async function improveQuestion(title, body) {
  const prompt = `You are helping a college student ask a clearer technical question on a Q&A forum.

Rewrite the question below to be clear, specific, and well-structured, while
keeping the original intent and meaning. Do not invent details that weren't
implied by the original. Keep it concise.

Original title: ${title}
Original body: ${body}

Respond with ONLY valid JSON in exactly this shape, no markdown fences, no extra text:
{"improvedTitle": "...", "improvedBody": "..."}`;

  const raw = await generateText(prompt, { maxTokens: 400, temperature: 0.3 });

  const cleaned = raw.replace(/```json|```/g, "").trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    // Fallback: if the model didn't return clean JSON, surface the raw
    // text as the improved body rather than failing the whole request.
    parsed = { improvedTitle: title, improvedBody: cleaned };
  }

  return {
    improvedTitle: parsed.improvedTitle || title,
    improvedBody: parsed.improvedBody || body,
  };
}

module.exports = { improveQuestion };
