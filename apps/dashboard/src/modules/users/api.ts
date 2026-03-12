import { authClient } from "#/libs/auth";
import type { ListUsersParams } from "./contracts";

export async function listUsers(params: ListUsersParams) {
  const query: Record<string, any> = {
    limit: params.limit,
    offset: params.offset,
    sortBy: "createdAt",
    sortDirection: "desc",
  };

  if (params.searchValue) {
    query.searchValue = params.searchValue;
    query.searchField = params.searchField ?? "email";
  }

  const res = await authClient.admin.listUsers({ query });
  if (res.error) throw res.error;
  return res.data;
}

export async function banUser(userId: string, banReason?: string) {
  const res = await authClient.admin.banUser({
    userId,
    banReason,
  });
  if (res.error) throw res.error;
  return res.data;
}

export async function unbanUser(userId: string) {
  const res = await authClient.admin.unbanUser({ userId });
  if (res.error) throw res.error;
  return res.data;
}

export async function setUserRole(userId: string, role: "user" | "admin") {
  const res = await authClient.admin.setRole({
    userId,
    role,
  });
  if (res.error) throw res.error;
  return res.data;
}

export async function removeUser(userId: string) {
  const res = await authClient.admin.removeUser({ userId });
  if (res.error) throw res.error;
  return res.data;
}
