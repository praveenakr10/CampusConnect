const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const { CLIENT_ORIGIN } = require("./config/env");
const errorHandler = require("./middleware/errorHandler.middleware");
const { generalLimiter } = require("./middleware/rateLimiter.middleware");

const authRoutes = require("./routes/auth.routes");
const questionRoutes = require("./routes/question.routes");
const answerRoutes = require("./routes/answer.routes");
const voteRoutes = require("./routes/vote.routes");
const pollRoutes = require("./routes/poll.routes");
const aiRoutes = require("./routes/ai.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();

app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use(generalLimiter);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/answers", answerRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/polls", pollRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/admin", adminRoutes);
app.use("/uploads", express.static("uploads"));
app.use((req, res) => res.status(404).json({ error: "Route not found." }));
app.use(errorHandler);

module.exports = app;
