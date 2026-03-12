import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { authClient } from "#/libs/auth";
import type { SignInRequestData, SignUpRequestData } from "./contracts";

export function useSignIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SignInRequestData) => {
      const { data: session, error } = await authClient.signIn.email(data);
      if (error) throw error;
      return session;
    },
    onSuccess: () => {
      toast.success("Signed in successfully");
      return queryClient.invalidateQueries({ queryKey: ["session"] });
    },
    onError: () => {
      toast.error("Invalid email or password");
    },
  });
}

export function useSignUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SignUpRequestData) => {
      const { data: session, error } = await authClient.signUp.email(data);
      if (error) throw error;
      return session;
    },
    onSuccess: () => {
      toast.success("Account created successfully");
      return queryClient.invalidateQueries({ queryKey: ["session"] });
    },
    onError: () => {
      toast.error("Sign up failed. Try a different email.");
    },
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      const { error } = await authClient.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Signed out");
      queryClient.invalidateQueries({ queryKey: ["session"] });
      router.navigate({ to: "/sign-in" });
    },
  });
}
