import { env } from "#/lib/env";
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { auth } from "#/auth";
import { logger } from "#/middleware/logger";
import { errorHandler } from "#/middleware/error-handler";
import { uploadRoutes } from "#/routes/uploads";
import { healthRoutes } from "#/routes/health";
import { ensureBucket } from "#/lib/storage";
import { logger as log } from "#/lib/logger";

const app = new Elysia()
  .use(logger)
  .use(errorHandler)
  .use(
    cors({
      origin: [
        "http://dyz-bunstack.localhost:1355",
        "http://dashboard.dyz-bunstack.localhost:1355",
      ],
      credentials: true,
    }),
  )
  .mount(auth.handler)
  .use(uploadRoutes)
  .use(healthRoutes)
  .get("/", () => ({ message: "dyz-bunstack API" }))
  .listen(env.PORT);

log.success(`Server running at ${app.server?.url}`);

ensureBucket().catch((err) =>
  log.warn("S3 bucket check skipped:", err.message),
);
