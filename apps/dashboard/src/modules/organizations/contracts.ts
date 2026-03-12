import { z } from "zod/v4";

export const OrgSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string().nullable(),
  logo: z.string().nullable(),
  metadata: z.string().nullable(),
  createdAt: z.coerce.date(),
});

export type Org = z.infer<typeof OrgSchema>;

export const CreateOrgRequest = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).optional(),
});

export type CreateOrgRequestData = z.infer<typeof CreateOrgRequest>;
