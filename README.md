# dyz-bunstack

Monorepo template with React + ElysiaJS + shared UI.

## Initialize a new project

```bash
git clone <this-repo> <project-name>
cd <project-name>
./init.sh <project-name>
make setup
```

Need organization-based multi-tenancy? Add the flag:

```bash
./init.sh <project-name> --with-multi-tenant
```

`init.sh` will:
- Replace all `dyz-bunstack` references with your project name
- Configure multi-tenancy (if `--with-multi-tenant` is passed)
- Re-init git and reinstall dependencies

`make setup` will:
- Install dependencies
- Initialize react-grab in all frontend apps
- Copy `.env.example` to `.env` (if not exists)
- Start PostgreSQL container
- Push database schema
- Seed demo accounts

## Development

```bash
make dev
```

This starts PostgreSQL, then all three apps:

| App       | URL                                          |
|-----------|----------------------------------------------|
| Web       | http://dyz-bunstack.localhost:1355            |
| API       | http://api.dyz-bunstack.localhost:1355        |
| Dashboard | http://dashboard.dyz-bunstack.localhost:1355  |

### Demo Accounts

- `admin@demo.com` / `password123`
- `user@demo.com` / `password123`

## Adding UI Components

Shared components live in `packages/ui` using shadcn/ui:

```bash
cd packages/ui && npx shadcn@latest add <component>
```

Then export it from `packages/ui/src/index.ts`:

```ts
export { Input } from "./components/input";
```

Use it in any app:

```tsx
import { Button, Input } from "@dyz-bunstack-app/ui";

<Input placeholder="Email" />
<Button>Submit</Button>
```

## Claude Code Agents

Specialist agents in `.claude/agents/` for use with [Claude Code](https://claude.com/claude-code).

### Feature workflow

```
/researcher  →  /ux  →  /feature
   (facts)     (design)   (build)
```

### All agents

| Agent | Model | Purpose |
|-------|-------|---------|
| `/researcher` | opus | Gathers codebase context, maps dependencies, produces research brief |
| `/ux` | opus | Designs layouts, user flows, component specs, accessibility |
| `/feature` | opus | Full-stack implementation across all layers |
| `/frontend` | sonnet | React components, routing, data fetching (preloads vercel-react-best-practices) |
| `/backend` | sonnet | ElysiaJS routes, middleware, auth (preloads elysiajs skill) |
| `/db` | sonnet | Drizzle schema, migrations, seeding, queries |
| `/ui` | sonnet | shadcn component management, exports, icon replacement |
| `/reviewer` | sonnet | Convention compliance checks before committing |

## Commands

| Command            | Description                          |
|--------------------|--------------------------------------|
| `make setup`       | First-time project setup             |
| `make dev`         | Start all apps + database            |
| `make dev-web`     | Web app only                         |
| `make dev-server`  | Server only                          |
| `make dev-dashboard` | Dashboard only                     |
| `make install`     | Install dependencies                 |
| `make db-up`       | Start PostgreSQL container           |
| `make db-down`     | Stop PostgreSQL container            |
| `make db-push`     | Push schema to DB                    |
| `make db-generate` | Generate Drizzle migrations          |
| `make db-migrate`  | Run Drizzle migrations               |
| `make db-studio`   | Open Drizzle Studio                  |
| `make db-seed`     | Seed demo accounts                   |
