require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET || "dev-secret-change-me",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || "http://localhost:5173",

  AI_PROVIDER: process.env.AI_PROVIDER || "groq", // "groq" | "gemini"
  GROQ_API_KEY: process.env.GROQ_API_KEY || "",
  GROQ_MODEL: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-1.5-flash",

  SUMMARY_ANSWER_THRESHOLD: Number(process.env.SUMMARY_ANSWER_THRESHOLD || 10),
  SUMMARY_REGEN_THRESHOLD: Number(process.env.SUMMARY_REGEN_THRESHOLD || 5),
};
