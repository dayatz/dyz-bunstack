import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
// @mt-start
import { admin, organization } from "better-auth/plugins";
// @mt-end
// @no-mt-start
import { admin } from "better-auth/plugins";
// @no-mt-end
import { db } from "#/db";
import * as schema from "#/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: { enabled: true },
  trustedOrigins: [
    "http://dyz-bunstack.localhost:1355",
    "http://dashboard.dyz-bunstack.localhost:1355",
  ],
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
      },
    },
  },
  // @mt-start
  plugins: [admin(), organization()],
  // @mt-end
  // @no-mt-start
  plugins: [admin()],
  // @no-mt-end
});
