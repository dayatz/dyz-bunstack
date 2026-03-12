import { queryOptions } from "@tanstack/react-query";
import { fetchHealthCheck } from "./api";
import { authClient } from "#/libs/auth";

export const statsQueries = {
  all: () => ["stats"] as const,
  health: () =>
    queryOptions({
      queryKey: [...statsQueries.all(), "health"],
      queryFn: fetchHealthCheck,
      refetchInterval: 30000,
    }),
  userCount: () =>
    queryOptions({
      queryKey: [...statsQueries.all(), "user-count"],
      queryFn: async () => {
        const res = await authClient.admin.listUsers({
          query: { limit: 1 },
        });
        if (res.error) throw res.error;
        return { total: res.data.total };
      },
    }),
  recentUsers: () =>
    queryOptions({
      queryKey: [...statsQueries.all(), "recent-users"],
      queryFn: async () => {
        const res = await authClient.admin.listUsers({
          query: {
            limit: 5,
            sortBy: "createdAt",
            sortDirection: "desc",
          },
        });
        if (res.error) throw res.error;
        return res.data.users;
      },
    }),
};
