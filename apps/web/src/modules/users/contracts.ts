import { z } from "zod/v4";

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  emailVerified: z.boolean(),
  image: z.string().nullable(),
  role: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type User = z.infer<typeof UserSchema>;

export const CreateUserRequest = z.object({
  name: z.string(),
  email: z.email(),
});

export type CreateUserRequestData = z.infer<typeof CreateUserRequest>;
