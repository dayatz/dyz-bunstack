import { createAuthClient } from "better-auth/react";
// @mt-start
import { adminClient, organizationClient } from "better-auth/client/plugins";
// @mt-end
// @no-mt-start
import { adminClient } from "better-auth/client/plugins";
// @no-mt-end

export const authClient = createAuthClient({
  baseURL: "",
  // @mt-start
  plugins: [adminClient(), organizationClient()],
  // @mt-end
  // @no-mt-start
  plugins: [adminClient()],
  // @no-mt-end
});
