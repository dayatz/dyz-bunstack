# dyz-bunstack Monorepo

## Structure

- `apps/web` — frontend app (`@dyz-bunstack-app/web`, `http://dyz-bunstack.localhost:1355`)
<!-- >>BACKEND -->
- `apps/server` — backend app (`@dyz-bunstack-app/server`, `http://api.dyz-bunstack.localhost:1355`)
<!-- <<BACKEND -->
<!-- >>DASHBOARD -->
- `apps/dashboard` — admin dashboard (`@dyz-bunstack-app/dashboard`, `http://dashboard.dyz-bunstack.localhost:1355`)
<!-- <<DASHBOARD -->
- `packages/ui` — shared React components (`@dyz-bunstack-app/ui`)

## Shared UI Rules

When modifying `packages/ui`:

- **Adding a component**: export it from `packages/ui/src/index.ts`
- **Adding a shadcn component**: run `cd packages/ui && npx shadcn@latest add <component>` — the CLI places it in `src/components/` and resolves aliases via `components.json`
- **Changing a component's props or behavior**: search for all usages in `apps/web` and `apps/dashboard`, update them to match
- **Removing a component**: remove its export from `index.ts`, then find and remove/replace all imports in `apps/web` and `apps/dashboard`
- **Renaming a component**: update the export in `index.ts` and all imports in consuming apps

Always grep across both apps after any UI package change:
```
grep -r "from \"@dyz-bunstack-app/ui\"" apps/
```

## Tech Stack

### Frontend (`apps/web`, `apps/dashboard`)
- **React 19** with **Vite**
- **TanStack Router** — file-based routing
- **TanStack Query** — data fetching (QueryClient passed via router context)
- **TanStack Form** — form handling
- **Zod** — schema validation
- **Tailwind CSS v4**
- **shadcn/ui** — component primitives in `packages/ui` (uses Radix UI + CVA + tailwind-merge). CSS variables in `packages/ui/src/styles/globals.css`, `cn()` utility in `packages/ui/src/lib/utils.ts`
- **Hugeicons** — icon library (`@hugeicons/react` + `@hugeicons/core-free-icons`)
- **Agentation** — visual feedback for AI agents (dev only, rendered in `__root.tsx`)
- **React Grab** — capture UI elements for AI agents (dev only, loaded in `index.html`)

## Path Aliases

- `#/*` maps to `./src/*` — use for all internal imports
- Import as `import { something } from "#/modules/users/queries"`

## HugeIcons

Import icon data from `@hugeicons/core-free-icons` individually (tree-shakeable), render with `HugeiconsIcon`:

```tsx
import { HugeiconsIcon } from "@hugeicons/react";
import Sun01Icon from "@hugeicons/core-free-icons/Sun01Icon";

<HugeiconsIcon icon={Sun01Icon} size={16} />
```

- Never import from the `@hugeicons/core-free-icons` barrel — always use direct imports
- `components.json` still has `"iconLibrary": "lucide"` for shadcn CLI — swap lucide imports to HugeIcons after running `shadcn add`

<!-- >>BACKEND -->
### Backend (`apps/server`)
- **ElysiaJS** — HTTP framework (Bun-native)
- **Drizzle ORM** — type-safe database queries
- **PostgreSQL** via `postgres` driver
- Schema lives in `apps/server/src/db/schema.ts`
- DB client in `apps/server/src/db/index.ts`
- Config in `apps/server/drizzle.config.ts`
- Copy `apps/server/.env.example` to `apps/server/.env` and set `DATABASE_URL`
- **better-auth** — authentication (email/password + admin plugin)
  - Server auth instance: `apps/server/src/auth.ts`
  - Client auth config: `apps/web/src/libs/auth.ts`, `apps/dashboard/src/libs/auth.ts`
  - Auth middleware for protected routes: `apps/server/src/middleware/auth.ts`
  - Role guards: `requireAuth`, `requireAdmin` in `apps/server/src/middleware/auth.ts`
  - Protected frontend routes use `_authenticated` layout (`routes/_authenticated.tsx`)
  - Demo accounts: `admin@demo.com` / `password123` (admin), `user@demo.com` / `password123` (user)
- **Structured logging** — `apps/server/src/middleware/logger.ts` (method, path, status, duration)
- **Error handling** — `apps/server/src/middleware/error-handler.ts` (`ApiError` class, consistent `{ error: { message, code, statusCode } }` shape)
- **Validation** — use Elysia's built-in `t` schema in route definitions (re-exported from `apps/server/src/lib/validation.ts`)
- **File uploads** — S3-compatible presigned URL uploads via `apps/server/src/routes/uploads.ts` and `apps/server/src/lib/storage.ts`
  - Requires S3 env vars in `.env` (see `.env.example`)
<!-- <<BACKEND -->

## Library Integrations (`apps/web/src/libs/`)

Reusable configuration for third-party libraries lives in `src/libs/<library>.ts` (or `src/libs/<library>/` if multiple files are needed). Use this for any integration that requires custom setup and is imported from multiple places.

Example: `src/libs/auth.ts` for better-auth client config, `src/libs/api.ts` for fetch wrapper.

**Rules:**
- Only put library config here if it's reusable — one-off usage belongs where it's used
- Import as `import { authClient } from "#/libs/auth"`
- Use `apiFetch` from `#/libs/api` for all API calls — it handles credentials, error parsing, and throws `ApiError` with structured error info

## Feature Modules (`apps/web/src/modules/`)

Each feature lives in `src/modules/<feature>/` with direct file imports (no barrel `index.ts`):

```
src/modules/<feature>/
├── api.ts          # Raw fetch functions, responses parsed with zod
├── contracts.ts    # Zod schemas for request/response shapes
├── queries.ts      # Query key factory + queryOptions (NO custom useQuery hooks)
├── mutations.ts    # useMutation hooks with invalidation logic
├── hooks.ts        # Business logic hooks (compose queries, form logic, UI state)
└── config.ts       # Optional per-feature config
```

**Rules:**
- Import from specific files, not barrel exports: `import { userQueries } from "#/modules/users/queries"`
- `contracts.ts` defines Zod schemas + inferred types — single source of truth for API shapes
- `api.ts` uses raw `fetch`, validates responses with Zod schemas from `contracts.ts`
- `hooks.ts` contains feature-specific hooks that compose queries, manage form state, or coordinate UI behavior
  - Named `use{Feature}{Purpose}` (e.g. `useUserForm`, `useUserList`)
  - Import as `import { useUserForm } from "#/modules/users/hooks"`
- Use `zod/v4` for all Zod imports

### Contracts (`contracts.ts`)

Zod schemas + inferred types — single source of truth for API shapes:

```ts
// from apps/web/src/modules/users/contracts.ts
import { z } from "zod/v4";

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
});

export type User = z.infer<typeof UserSchema>;

export const CreateUserRequest = z.object({
  name: z.string(),
  email: z.email(),
});

export type CreateUserRequestData = z.infer<typeof CreateUserRequest>;
```

### API Functions (`api.ts`)

Centralize all endpoint paths in an `endpoints` object at the top of each `api.ts`. API functions reference `endpoints.*` instead of hardcoding URL strings. This makes URL changes a single-line edit.

```ts
// from apps/web/src/modules/users/api.ts
import { UserSchema, type CreateUserRequestData } from "./contracts";

const BASE_URL = "http://localhost:3001";

const endpoints = {
  list: `${BASE_URL}/users`,
  detail: (id: string) => `${BASE_URL}/users/${id}`,
} as const;

export async function getUsers() {
  const res = await fetch(endpoints.list);
  const data = await res.json();
  return UserSchema.array().parse(data);
}

export async function getUser(id: string) {
  const res = await fetch(endpoints.detail(id));
  const data = await res.json();
  return UserSchema.parse(data);
}

export async function createUser(body: CreateUserRequestData) {
  const res = await fetch(endpoints.list, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return UserSchema.parse(data);
}
```

### TanStack Query Conventions

**Query key factory + `queryOptions` in `queries.ts`:**
- Export one `{feature}Queries` object per module combining key factory and `queryOptions()`
- Keys go from generic to specific: `[feature, scope, ...params]`
- Category entries (for invalidation) return plain key arrays
- Specific query entries return `queryOptions({ queryKey, queryFn })`
- Do NOT create custom `useQuery` wrapper hooks — call `useQuery(userQueries.list())` directly in components
- When a component needs `useQuery` but its parent doesn't, extract the query-dependent section into its own component to keep the parent free of data-fetching concerns

```ts
// from apps/web/src/modules/users/queries.ts
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
```

**Mutations in `mutations.ts`:**
- Name hooks `use{Action}{Feature}` (e.g. `useCreateUser`, `useDeletePost`)
- Always invalidate related queries in `onSuccess` — return the promise so mutation stays pending until refetch completes
- Split concerns: query-level logic (invalidation) in `useMutation`, UI-level logic (toasts, redirects) in `mutate()` callbacks

```ts
// from apps/web/src/modules/users/mutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUser } from "./api";
import { userQueries } from "./queries";

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: userQueries.lists(),
      });
    },
  });
}
```

**Usage in routes/components:**
```ts
// Query data
useQuery(userQueries.list())
useSuspenseQuery(userQueries.detail(id))

// Prefetch in route loaders
queryClient.ensureQueryData(userQueries.detail(id))

// Invalidate a category
queryClient.invalidateQueries({ queryKey: userQueries.lists() })
```

## Dialog Pattern

Dialog components are self-contained — they own their trigger button, open/close state, and all internal logic. Callers pass data and actions as props, render a single component. When the dialog content is non-trivial (forms, multi-step flows), create a dedicated file for it.

```tsx
// Self-contained dialog component
export function ConfirmDialog({ item, onConfirm, isPending, trigger }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <p>Acting on {item.name}</p>
      </DialogContent>
    </Dialog>
  );
}

// Caller — owns the trigger button entirely (styling, disabled, tooltip)
<ConfirmDialog
  item={record}
  onConfirm={handleConfirm}
  isPending={isPending}
  trigger={
    <Button variant="outline" size="sm" disabled={!canAct}>
      Trigger Label
    </Button>
  }
/>
```

**Rules:**
- Dialog manages its own `open` state internally via `useState` — callers never manage open/close
- Caller owns the trigger button via a `trigger` slot prop — the dialog doesn't know about button styling, disabled state, or tooltips
- Use `<DialogTrigger asChild>{trigger}</DialogTrigger>` to render the caller's trigger element
- Caller passes data (what to display) and actions (what to do on confirm) as props
- Never forward trigger-related props through the dialog (`disabled`, `buttonClassName`, `buttonVariant`) — these belong on the trigger element the caller provides
- Clear form state in `useEffect` when `open` becomes `false`
- After `onConfirm`, close the dialog internally (`setOpen(false)`)
- Complex dialogs (forms, validation, multi-step) get their own file
- **Escape hatch:** If a dialog component starts accumulating boolean props to handle multiple use cases (e.g. `isEditing`, `showIdField`, `variant="compact"`), stop wrapping — let callers compose the shadcn `Dialog`/`DialogTrigger`/`DialogContent` primitives directly instead

## App-Wide Hooks (`apps/web/src/hooks/`)

Reusable hooks not tied to any feature (e.g. `useMediaQuery`, `useDebounce`).

**Rules:**
- One hook per file, named `use-{name}.ts`
- Import as `import { useDebounce } from "#/hooks/use-debounce"`

## Tools

### RTK (Rust Token Killer)
Always use [RTK](https://github.com/rtk-ai/rtk) for all CLI operations. RTK is a token-optimized CLI proxy that saves 60-90% on dev operations. All shell commands are automatically rewritten via Claude Code hooks (`git status` → `rtk git status`). Use `rtk gain` to check savings.

### Serena MCP
Always use Serena MCP tools for code exploration and editing when available. Prefer Serena's symbolic tools (`find_symbol`, `get_symbols_overview`, `replace_symbol_body`, etc.) over reading entire files. This enables token-efficient, precise code navigation and modification.

- Use `get_symbols_overview` to understand file structure before diving in
- Use `find_symbol` with `include_body=True` only for symbols you need to read
- Use `replace_symbol_body` for precise edits instead of full-file rewrites
- Use `find_referencing_symbols` to understand call sites before refactoring

## Skills

Before making code changes, invoke the relevant skill:

- **Frontend (React/Vite)**: Run `/vercel-react-best-practices` before any FE changes
<!-- >>BACKEND -->
- **Backend (ElysiaJS)**: Run `/elysiajs` before any BE changes
<!-- <<BACKEND -->

## Commands

Use `make`:
- `make setup` — first-time setup (install deps + init react-grab)
<!-- >>BACKEND -->
- `make dev` — web + server
<!-- <<BACKEND -->
<!-- >>FRONTEND_ONLY -->
<!-- - `make dev` — start dev server -->
<!-- <<FRONTEND_ONLY -->
<!-- >>DASHBOARD -->
- `make dev-dashboard` — dashboard only
<!-- <<DASHBOARD -->
- `make dev-all` — all apps
- `make install` — bun install
<!-- >>BACKEND -->
- `make db-generate` — generate Drizzle migrations
- `make db-migrate` — run migrations
- `make db-push` — push schema to DB (no migration files)
- `make db-studio` — open Drizzle Studio
- `make db-seed` — seed demo accounts (admin@demo.com, user@demo.com)
<!-- <<BACKEND -->

<!-- @mt-start -->
## Multi-Tenant Add-On

Organization-based multi-tenancy is included. The org code lives in separate directories for clean separation.

### Multi-tenant files (dashboard)
- `apps/dashboard/src/modules/organizations/` — org CRUD (contracts, api, queries, mutations)
- `apps/dashboard/src/modules/members/` — member/invitation management
- `apps/dashboard/src/routes/_authenticated/organizations.tsx` — org list page
- `apps/dashboard/src/routes/_authenticated/orgs/` — org-scoped routes (overview, members, settings)

### To remove multi-tenancy

1. Delete `apps/dashboard/src/modules/organizations/` and `apps/dashboard/src/modules/members/`
2. Delete `apps/dashboard/src/routes/_authenticated/organizations.tsx` and `apps/dashboard/src/routes/_authenticated/orgs/`
3. Remove `organization()` from `apps/server/src/auth.ts` plugins
4. Remove `organizationClient()` from auth client plugins in `apps/dashboard/src/libs/auth.ts` and `apps/web/src/libs/auth.ts`
5. Remove Organizations nav item from `apps/dashboard/src/components/app-sidebar.tsx`
6. Delete org tables from `apps/server/src/db/schema.ts` (everything below `// --- Organization`)
7. Remove `session.impersonatedBy` and `session.activeOrganizationId` from session table in schema
8. Run `make db-push`
<!-- @mt-end -->
