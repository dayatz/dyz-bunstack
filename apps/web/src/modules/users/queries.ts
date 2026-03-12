import { queryOptions } from "@tanstack/react-query";
import { getUsers, getUser } from "./api";

export const userQueries = {
  all: () => ["users"] as const,
  lists: () => [...userQueries.all(), "list"] as const,
  list: () =>
    queryOptions({
      queryKey: [...userQueries.lists()],
      queryFn: getUsers,
    }),
  details: () => [...userQueries.all(), "detail"] as const,
  detail: (id: string) =>
    queryOptions({
      queryKey: [...userQueries.details(), id],
      queryFn: () => getUser(id),
    }),
};
