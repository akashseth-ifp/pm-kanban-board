import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";

const getLogger = () => {
  if (isProduction) {
    return pino({
      level: process.env.LOG_LEVEL || "info",
      base: { pid: process.pid },
      timestamp: pino.stdTimeFunctions.isoTime,
      serializers: {
        err: pino.stdSerializers.err,
      },
    });
  }

  const stream = require("pino-pretty")({
    colorize: true,
    translateTime: "HH:MM:ss",
    ignore: "pid,hostname,reqId",
    messageFormat: (log: Record<string, any>, messageKey: string) => {
      const reqId = log.reqId;
      if (reqId) return `(req-${reqId}): ${log[messageKey]}`;
      return log[messageKey] as string;
    },
  });

  return pino(
    {
      level: process.env.LOG_LEVEL || "info",
      base: { pid: process.pid },
    },
    stream
  );
};

const logger = getLogger();

logger.info("Pino logger initialized and transport configured");

export default logger;
