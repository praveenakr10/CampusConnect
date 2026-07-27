/*
 * Blocks commits containing common credential formats. It deliberately reads
 * from Git's index, not the working tree, so it checks exactly what will be
 * committed. This is a guardrail, not a replacement for secret rotation.
 */
const { execFileSync } = require("child_process");
const path = require("path");

const repositoryRoot = path.resolve(__dirname, "..", "..");
const secretPatterns = [
  ["AWS access key", /\bAKIA[0-9A-Z]{16}\b/],
  ["Google/Gemini API key", /\bAIza[0-9A-Za-z_-]{20,}\b/],
  ["Groq API key", /\bgsk_[0-9A-Za-z_-]{20,}\b/],
  ["OpenAI-style API key", /\bsk-[0-9A-Za-z_-]{20,}\b/],
  ["Cloudinary URL", /cloudinary:\/\/[^\s"']+/i],
  ["private key", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ["Postgres connection string", /postgres(?:ql)?:\/\/(?!USER:PASSWORD@|user:password@|<)[^\s"']+/i],
];
const sensitiveAssignments = /^(?:JWT(?:_REFRESH)?_SECRET|DATABASE_URL|CLOUDINARY_API_(?:KEY|SECRET)|GROQ_API_KEY|GEMINI_API_KEY|RESEND_API_KEY|SMTP_PASS)\s*=\s*(.+)$/gim;
const placeholder = /^(?:"|')?(?:|your[-_ ]|replace[-_ ]|example|dummy|test|<|\$\{)/i;

function isPlaceholder(value) {
  return (
    placeholder.test(value) ||
    /^['"]?postgres(?:ql)?:\/\/USER:PASSWORD@/i.test(value)
  );
}

function git(args) {
  return execFileSync("git", ["-C", repositoryRoot, ...args], { encoding: "utf8" });
}

const files = git(["diff", "--cached", "--name-only", "--diff-filter=ACMR"])
  .split(/\r?\n/)
  .filter(Boolean);
const findings = [];

for (const file of files) {
  const content = git(["show", `:${file}`]);
  for (const [label, pattern] of secretPatterns) {
    if (pattern.test(content)) findings.push(`${file}: possible ${label}`);
  }

  for (const assignment of content.matchAll(sensitiveAssignments)) {
    if (!isPlaceholder(assignment[1].trim())) {
      findings.push(`${file}: non-placeholder ${assignment[0].split("=")[0]} assignment`);
    }
  }
}

if (findings.length) {
  console.error("Commit blocked: possible secret(s) detected in staged files:");
  for (const finding of [...new Set(findings)]) console.error(`  - ${finding}`);
  console.error("Remove the secret, revoke it if it was exposed, then stage the corrected file.");
  process.exit(1);
}

console.log("No common secret patterns found in staged files.");
