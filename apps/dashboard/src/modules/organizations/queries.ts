import { queryOptions } from "@tanstack/react-query";
import { listOrganizations, getOrganization } from "./api";

export const orgQueries = {
  all: () => ["organizations"] as const,
  lists: () => [...orgQueries.all(), "list"] as const,
  list: () =>
    queryOptions({
      queryKey: [...orgQueries.lists()],
      queryFn: listOrganizations,
    }),
  details: () => [...orgQueries.all(), "detail"] as const,
  detail: (orgId: string) =>
    queryOptions({
      queryKey: [...orgQueries.details(), orgId],
      queryFn: () => getOrganization(orgId),
    }),
};
