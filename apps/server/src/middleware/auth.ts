import { Elysia } from "elysia";
import { auth } from "#/auth";
import { ApiError } from "#/middleware/error-handler";

export const authMiddleware = new Elysia({ name: "auth-middleware" }).derive(
  async ({ request }) => {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    return { session };
  },
);

export const requireAuth = new Elysia({ name: "require-auth" })
  .use(authMiddleware)
  .derive(({ session }) => {
    if (!session) {
      throw new ApiError(401, "Authentication required", "UNAUTHORIZED");
    }
    return { session: session! };
  });

export const requireAdmin = new Elysia({ name: "require-admin" })
  .use(requireAuth)
  .derive(({ session }) => {
    if ((session.user as any).role !== "admin") {
      throw new ApiError(403, "Admin access required", "FORBIDDEN");
    }
    return { session };
  });
