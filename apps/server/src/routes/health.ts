import { Elysia } from "elysia";
import { db } from "#/db";
import { sql } from "drizzle-orm";
import {
  S3Client,
  HeadBucketCommand,
} from "@aws-sdk/client-s3";
import { env } from "#/lib/env";

const s3 = new S3Client({
  region: env.S3_REGION,
  endpoint: env.S3_ENDPOINT,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

const bucket = env.S3_BUCKET;

async function checkDb(): Promise<{ ok: boolean; latency: number }> {
  const start = performance.now();
  try {
    await db.execute(sql`SELECT 1`);
    return { ok: true, latency: Math.round(performance.now() - start) };
  } catch {
    return { ok: false, latency: Math.round(performance.now() - start) };
  }
}

async function checkS3(): Promise<{ ok: boolean; latency: number }> {
  const start = performance.now();
  try {
    await s3.send(new HeadBucketCommand({ Bucket: bucket }));
    return { ok: true, latency: Math.round(performance.now() - start) };
  } catch {
    return { ok: false, latency: Math.round(performance.now() - start) };
  }
}

export const healthRoutes = new Elysia().get("/api/health", async ({ set }) => {
  const [database, storage] = await Promise.all([checkDb(), checkS3()]);
  const healthy = database.ok && storage.ok;

  if (!healthy) {
    set.status = 503;
  }

  return {
    status: healthy ? "ok" : "error",
    uptime: Math.round(process.uptime()),
    checks: {
      database: { status: database.ok ? "up" : "down", latency: `${database.latency}ms` },
      storage: { status: storage.ok ? "up" : "down", latency: `${storage.latency}ms` },
    },
  };
});
