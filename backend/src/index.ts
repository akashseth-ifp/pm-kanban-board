import "./env";
import "./types/express";
import express, { Express } from "express";
import cors from "cors";
import router from "./routes";
import helmet from "helmet";
import pinoHttp from "pino-http";
import logger from "./lib/logger";
import { initSocket } from "./lib/socket";

console.log("Current Environment:", process.env.NODE_ENV);
console.log("Current Port:", process.env.PORT);

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware for request logging
app.use(
  pinoHttp({
    logger,
    // Suppress the default verbose req/res output on every log line
    serializers: {
      req: () => undefined,
      res: () => undefined,
    },
    // Include reqId for tracing in every log line
    customProps: (req) => ({
      reqId: req.id,
    }),
    // Use a clean one-line message for request success/failure
    customSuccessMessage: function (req, res, responseTime) {
      return `${req.method} ${req.url} ${res.statusCode} - ${responseTime}ms`;
    },
    customErrorMessage: function (req, res, err) {
      return `${req.method} ${req.url} ${res.statusCode} - ${err.message}`;
    },
    customLogLevel: function (req, res, err) {
      if (res.statusCode >= 500 || err) return "error";
      if (res.statusCode >= 400) return "warn";
      return "info";
    },
  })
);

app.use("/api", router);

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

initSocket(server);

export default app;
