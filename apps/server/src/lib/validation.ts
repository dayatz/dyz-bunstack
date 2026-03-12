// Re-export Elysia's TypeBox schema builder for convenient imports.
// Usage in routes:
//   import { t } from "../lib/validation";
//   .post("/users", handler, { body: t.Object({ name: t.String() }) })
export { t } from "elysia";
