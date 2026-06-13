require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const { Server } = require("socket.io");

const { connectDB } = require("./config/db");
const { setupSocket } = require("./config/socket");

const {
  errorHandler,
  notFound,
} = require("./middleware/errorHandler");

const { logger } = require("./utils/logger");

/* =========================
   ROUTES
========================= */

const authRoutes = require("./routes/auth.routes");
const studentRoutes = require("./routes/student.routes");
const resultRoutes = require("./routes/result.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const attendanceRoutes = require("./routes/attendance.routes");
const notificationRoutes = require("./routes/notification.routes");
const activityRoutes = require("./routes/activity.routes");

const app = express();

/* =========================
   DATABASE
========================= */

connectDB();

/* =========================
   SECURITY MIDDLEWARE
========================= */

app.use(helmet());

app.use(mongoSanitize());

app.use(compression());

/* =========================
   CORS
========================= */

app.use(
  cors({
    origin:
      process.env.CORS_ORIGIN ||
      "http://localhost:3000",

    credentials: true,
  })
);

/* =========================
   BODY PARSER
========================= */

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

/* =========================
   LOGGER
========================= */

app.use(
  morgan("combined", {
    stream: {
      write: (message) =>
        logger.info(message.trim()),
    },
  })
);

/* =========================
   RATE LIMITERS
========================= */

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 500,

  standardHeaders: true,

  legacyHeaders: false,

  message: {
    success: false,
    message:
      "Too many requests, please slow down.",
  },
});

app.use(globalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 20,

  message: {
    success: false,
    message:
      "Too many login attempts, please try again later.",
  },
});

/* =========================
   HEALTH CHECK
========================= */

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CampusIQ API Running",
    version: "2.0.0",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,

    uptime: process.uptime(),

    memory: process.memoryUsage(),

    timestamp:
      new Date().toISOString(),
  });
});

/* =========================
   API ROUTES
========================= */

app.use(
  "/api/auth",
  authLimiter,
  authRoutes
);

app.use(
  "/api/students",
  studentRoutes
);

app.use(
  "/api/results",
  resultRoutes
);

app.use(
  "/api/analytics",
  analyticsRoutes
);

app.use(
  "/api/attendance",
  attendanceRoutes
);

app.use(
  "/api/notifications",
  notificationRoutes
);

app.use(
  "/api/activity",
  activityRoutes
);

/* =========================
   404 + ERROR HANDLER
========================= */

app.use(notFound);

app.use(errorHandler);

/* =========================
   SOCKET.IO
========================= */

const server =
  http.createServer(app);

const io = new Server(server, {
  cors: {
    origin:
      process.env.CORS_ORIGIN ||
      "http://localhost:3000",

    credentials: true,
  },
});

setupSocket(io);

app.set("io", io);

/* =========================
   START SERVER
========================= */

const PORT =
  process.env.PORT || 5000;

server.listen(PORT, () => {
  logger.info(
    `🚀 CampusIQ Server running on port ${PORT}`
  );
});

module.exports = app;