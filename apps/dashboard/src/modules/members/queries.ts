import { queryOptions } from "@tanstack/react-query";
import { getOrganization } from "#/modules/organizations/api";

export const memberQueries = {
  all: (orgId: string) => ["organizations", "detail", orgId, "members"] as const,
  list: (orgId: string) =>
    queryOptions({
      queryKey: memberQueries.all(orgId),
      queryFn: async () => {
        const data = await getOrganization(orgId);
        return {
          members: data?.members ?? [],
          invitations: data?.invitations ?? [],
        };
      },
    }),
};
