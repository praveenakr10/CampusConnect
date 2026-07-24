const axios = require("axios");
const {
  AI_PROVIDER,
  GROQ_API_KEY,
  GROQ_MODEL,
  GEMINI_API_KEY,
  GEMINI_MODEL,
} = require("../../config/env");

/**
 * generateText(prompt, opts)
 *
 * Single entry point every AI feature in this app calls. Swapping the
 * underlying LLM provider (Groq <-> Gemini, or adding another one later)
 * only requires changes in this file — callers never know the difference.
 * Returns plain text. Throws on failure so callers can decide how to
 * degrade gracefully (e.g. show "AI unavailable, try again later").
 */
async function generateText(prompt, { maxTokens = 500, temperature = 0.4 } = {}) {
  const provider = AI_PROVIDER.toLowerCase();

  if (provider === "groq") return callGroq(prompt, maxTokens, temperature);
  if (provider === "gemini") return callGemini(prompt, maxTokens, temperature);

  throw new Error(`Unknown AI_PROVIDER "${AI_PROVIDER}". Use "groq" or "gemini".`);
}

async function callGroq(prompt, maxTokens, temperature) {
  if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY is not set in .env");

  const { data } = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: GROQ_MODEL,
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxTokens,
      temperature,
    },
    {
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      timeout: 20000,
    }
  );

  return data.choices?.[0]?.message?.content?.trim() || "";
}

async function callGemini(prompt, maxTokens, temperature) {
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not set in .env");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const { data } = await axios.post(
    url,
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: maxTokens, temperature },
    },
    { headers: { "Content-Type": "application/json" }, timeout: 20000 }
  );

  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
}

module.exports = { generateText };
