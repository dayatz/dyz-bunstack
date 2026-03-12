import { useMutation, useQueryClient } from "@tanstack/react-query";
import { banUser, unbanUser, setUserRole, removeUser } from "./api";
import { adminUserQueries } from "./queries";
import { statsQueries } from "#/modules/stats/queries";

export function useBanUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, banReason }: { userId: string; banReason?: string }) =>
      banUser(userId, banReason),
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: adminUserQueries.lists(),
      });
    },
  });
}

export function useUnbanUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => unbanUser(userId),
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: adminUserQueries.lists(),
      });
    },
  });
}

export function useSetUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: "user" | "admin" }) =>
      setUserRole(userId, role),
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: adminUserQueries.lists(),
      });
    },
  });
}

export function useRemoveUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => removeUser(userId),
    onSuccess: () => {
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: adminUserQueries.lists() }),
        queryClient.invalidateQueries({ queryKey: statsQueries.all() }),
      ]);
    },
  });
}
