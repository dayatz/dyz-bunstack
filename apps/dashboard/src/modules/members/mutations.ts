import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inviteMember, removeMember, updateMemberRole, cancelInvitation } from "./api";
import { orgQueries } from "#/modules/organizations/queries";

export function useInviteMember(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, role }: { email: string; role: "member" | "admin" | "owner" }) =>
      inviteMember(orgId, email, role),
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: orgQueries.detail(orgId).queryKey,
      });
    },
  });
}

export function useRemoveMember(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberIdOrUserId: string) => removeMember(orgId, memberIdOrUserId),
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: orgQueries.detail(orgId).queryKey,
      });
    },
  });
}

export function useUpdateMemberRole(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: "member" | "admin" | "owner" }) =>
      updateMemberRole(orgId, memberId, role),
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: orgQueries.detail(orgId).queryKey,
      });
    },
  });
}

export function useCancelInvitation(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: string) => cancelInvitation(invitationId),
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: orgQueries.detail(orgId).queryKey,
      });
    },
  });
}
