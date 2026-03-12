import { z } from "zod/v4";

export const AdminUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.string().nullable(),
  banned: z.boolean().nullable(),
  banReason: z.string().nullable().optional(),
  createdAt: z.coerce.date(),
});

export type AdminUser = z.infer<typeof AdminUserSchema>;

export interface ListUsersParams {
  limit: number;
  offset: number;
  searchValue?: string;
  searchField?: "name" | "email";
}
