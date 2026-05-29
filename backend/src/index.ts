import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import fs from "fs";
import helmet from "helmet";
import https from "https";
import morgan from "morgan";
import path from "path";
import "reflect-metadata";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { AppDataSource } from "./data-source";
import routes from "./routes";
import logger from "./utils/logger";
import { errorHandler } from "./middlewares/errorHandler";

const isDev = process.env.NODE_ENV !== "production";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "CIA API",
      version: "1.0.0",
      description: "CIA Express API",
    },
  },
  apis: ["**/routes/auth.ts", "**/controller/Admin/*.ts"],
};

const specs = swaggerJSDoc(options);

AppDataSource.initialize()
  .then(() => {
    const app = express();

    // ---------------- SECURITY MIDDLEWARES ----------------
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || "https://localhost:3001")
      .split(",")
      .map((o) => o.trim());

    app.use(
      cors({
        origin: (origin, callback) => {
          if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            callback(new Error("Not allowed by CORS"));
          }
        },
        credentials: true,
      })
    );

    app.use(helmet());
    app.use(cookieParser());

    // ---------------- BODY PARSER (with size limit) ----------------
    app.use(express.json({ limit: "10kb" }));
    app.use(express.urlencoded({ extended: false, limit: "10kb" }));

    // ---------------- MORGAN LOGGING (no sensitive data) ----------------
    app.use(
      morgan("[:date[iso]] :method :url :status :response-time ms - :remote-addr", {
        stream: {
          write: (msg) => logger.info(msg.trim()),
        },
      })
    );

    // ---------------- ROUTES ----------------
    app.use("/", routes);

    // ---------------- DEV-ONLY ROUTES ----------------
    if (isDev) {
      const testRoutes = require("./routes/test.routes").default;
      app.use("/test", testRoutes);
      app.use("/api-docs", swaggerUi.serve as any, swaggerUi.setup(specs) as any);
    }

    // ---------------- GLOBAL ERROR HANDLER ----------------
    app.use(errorHandler);

    // ---------------- START HTTPS SERVER ----------------
    const PORT = Number(process.env.PORT) || 3000;
    const certDir = path.join(__dirname, "..", "certs");
    const certPath = path.join(certDir, "localhost+1.pem");
    const keyPath = path.join(certDir, "localhost+1-key.pem");

    if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
      const httpsOptions = {
        cert: fs.readFileSync(certPath),
        key: fs.readFileSync(keyPath),
      };
      https.createServer(httpsOptions, app).listen(PORT, () => {
        logger.info(`HTTPS server started on port ${PORT}`);
      });
    } else {
      logger.warn("TLS certs not found — falling back to HTTP. Run: cd backend/certs && mkcert localhost 127.0.0.1");
      app.listen(PORT, () => {
        logger.info(`HTTP server started on port ${PORT} (no TLS)`);
      });
    }
  })
  .catch((error) => {
    logger.error("Database connection error", error);
  });
