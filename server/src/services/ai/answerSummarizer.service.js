const prisma = require("../../config/db");
const { generateText } = require("./aiProvider");
const { SUMMARY_ANSWER_THRESHOLD, SUMMARY_REGEN_THRESHOLD } = require("../../config/env");

/**
 * Returns a TL;DR summary for a question's answers, generating one only
 * when needed:
 *  - question must have at least SUMMARY_ANSWER_THRESHOLD answers
 *  - if a cached summary exists, it's reused unless enough NEW answers
 *    have arrived since (SUMMARY_REGEN_THRESHOLD) to justify a refresh
 *
 * This caching is what keeps the app inside free-tier LLM rate limits —
 * summaries aren't regenerated on every page view.
 */
async function getOrGenerateSummary(questionId) {
  const answers = await prisma.answer.findMany({
    where: { questionId, isDeleted: false },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "asc" },
  });

  if (answers.length < SUMMARY_ANSWER_THRESHOLD) {
    return { eligible: false, answerCount: answers.length };
  }

  const existing = await prisma.answerSummary.findUnique({ where: { questionId } });

  const needsRegen =
    !existing || answers.length - existing.answerCountAtGeneration >= SUMMARY_REGEN_THRESHOLD;

  if (existing && !needsRegen) {
    return { eligible: true, summary: existing.summaryText, cached: true, answerCount: answers.length };
  }

  const answerBlock = answers
    .map((a, i) => `Answer ${i + 1} by ${a.user.name}: ${a.body}`)
    .join("\n\n");

  const prompt = `Summarize the following ${answers.length} answers to a student's
technical question into a short TL;DR (max 5 bullet points) that highlights
the consensus, any conflicting advice, and the most upvote-worthy solution
approach. Be concise and neutral.

${answerBlock}

Respond with plain text bullet points only, no preamble.`;

  const summaryText = await generateText(prompt, { maxTokens: 350, temperature: 0.3 });

  const saved = await prisma.answerSummary.upsert({
    where: { questionId },
    update: { summaryText, answerCountAtGeneration: answers.length, generatedAt: new Date() },
    create: { questionId, summaryText, answerCountAtGeneration: answers.length },
  });

  return { eligible: true, summary: saved.summaryText, cached: false, answerCount: answers.length };
}

module.exports = { getOrGenerateSummary };
