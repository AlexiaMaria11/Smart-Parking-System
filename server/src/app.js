import express from "express";
import cors from "cors";
import morgan from "morgan";
import routes from "./routes/index.js";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.clientUrl
    })
  );
  app.use(morgan("dev"));
  app.use(express.json());

  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api", routes);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
