import { Elysia, t } from "elysia";
import { requireAuth } from "#/middleware/auth";
import { getUploadUrl, getDownloadUrl } from "#/lib/storage";

export const uploadRoutes = new Elysia({ prefix: "/api/uploads" })
  .use(requireAuth)
  .post(
    "/presign",
    async ({ body }) => {
      const key = `${Date.now()}-${body.filename}`;
      const url = await getUploadUrl(key, body.contentType);
      return { url, key };
    },
    {
      body: t.Object({
        filename: t.String(),
        contentType: t.String(),
      }),
    },
  )
  .get(
    "/:key",
    async ({ params }) => {
      const url = await getDownloadUrl(params.key);
      return { url };
    },
    {
      params: t.Object({
        key: t.String(),
      }),
    },
  );
