import { apiFetch } from "#/libs/api";
import { UserSchema, type CreateUserRequestData } from "./contracts";

const endpoints = {
  list: "/users",
  detail: (id: string) => `/users/${id}`,
} as const;

export async function getUsers() {
  const data = await apiFetch(endpoints.list);
  return UserSchema.array().parse(data);
}

export async function getUser(id: string) {
  const data = await apiFetch(endpoints.detail(id));
  return UserSchema.parse(data);
}

export async function createUser(body: CreateUserRequestData) {
  const data = await apiFetch(endpoints.list, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return UserSchema.parse(data);
}
