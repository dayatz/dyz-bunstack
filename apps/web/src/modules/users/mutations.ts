import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUser } from "./api";
import { userQueries } from "./queries";

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: userQueries.lists(),
      });
    },
  });
}
