const { PORT, JWT_SECRET } = require("./config/env");

if (process.env.NODE_ENV === "production" && JWT_SECRET === "dev-secret-change-me") {
  throw new Error("JWT_SECRET must not use the development fallback in production.");
}

const app = require("./app");

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
