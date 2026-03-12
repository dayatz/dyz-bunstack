import { Elysia } from "elysia";
import { httpLogger } from "#/lib/logger";

export const logger = new Elysia({ name: "logger" })
  .onRequest(({ store }) => {
    (store as any).startTime = performance.now();
  })
  .onAfterResponse(({ request, store, set }) => {
    const url = new URL(request.url);
    if (url.pathname === "/") return;
    const duration = (performance.now() - (store as any).startTime).toFixed(1);
    const status = (set as any).status || 200;
    httpLogger.info(`${request.method} ${url.pathname} ${status} ${duration}ms`);
  });
