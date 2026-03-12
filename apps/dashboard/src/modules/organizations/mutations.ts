import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createOrganization, deleteOrganization } from "./api";
import { orgQueries } from "./queries";
import type { CreateOrgRequestData } from "./contracts";

export function useCreateOrg() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrgRequestData) => createOrganization(data),
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: orgQueries.lists(),
      });
    },
  });
}

export function useDeleteOrg() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (organizationId: string) => deleteOrganization(organizationId),
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: orgQueries.lists(),
      });
    },
  });
}
