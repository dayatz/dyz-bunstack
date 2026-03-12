import { queryOptions } from "@tanstack/react-query";
import { listUsers } from "./api";
import type { ListUsersParams } from "./contracts";

export const adminUserQueries = {
  all: () => ["admin-users"] as const,
  lists: () => [...adminUserQueries.all(), "list"] as const,
  list: (params: ListUsersParams) =>
    queryOptions({
      queryKey: [...adminUserQueries.lists(), params],
      queryFn: () => listUsers(params),
    }),
};
