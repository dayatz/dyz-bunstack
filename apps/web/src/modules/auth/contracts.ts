import { z } from "zod/v4";

export const SignInRequest = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export type SignInRequestData = z.infer<typeof SignInRequest>;

export const SignUpRequest = z.object({
  name: z.string().min(1),
  email: z.email(),
  password: z.string().min(8),
});

export type SignUpRequestData = z.infer<typeof SignUpRequest>;
