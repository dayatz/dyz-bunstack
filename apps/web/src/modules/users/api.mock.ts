import {
  UserSchema,
  type User,
  type CreateUserRequestData,
} from "./contracts";

// In-memory mock data store
let users: User[] = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice@example.com",
    emailVerified: false,
    image: null,
    role: "user",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Bob Smith",
    email: "bob@example.com",
    emailVerified: false,
    image: null,
    role: "user",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let nextId = 3;

function delay(ms = 100) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getUsers() {
  await delay();
  return UserSchema.array().parse(users);
}

export async function getUser(id: string) {
  await delay();
  const user = users.find((u) => u.id === id);
  if (!user) throw new Error(`User ${id} not found`);
  return UserSchema.parse(user);
}

export async function createUser(body: CreateUserRequestData) {
  await delay();
  const now = new Date().toISOString();
  const user: User = {
    id: String(nextId++),
    ...body,
    emailVerified: false,
    image: null,
    role: "user",
    createdAt: now,
    updatedAt: now,
  };
  users.push(user);
  return UserSchema.parse(user);
}
