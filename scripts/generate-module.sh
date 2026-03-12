#!/bin/bash
set -e

NAME=""
APP="web"

for arg in "$@"; do
  case $arg in
    --app=*) APP="${arg#*=}" ;;
    -h|--help)
      echo "Usage: ./scripts/generate-module.sh <name> --app=<web|dashboard|server|all>"
      echo ""
      echo "Examples:"
      echo "  make module name=posts app=web"
      echo "  make module name=posts app=server"
      echo "  make module name=posts app=all"
      exit 0
      ;;
    *) NAME="$arg" ;;
  esac
done

if [ -z "$NAME" ]; then
  echo "Usage: ./scripts/generate-module.sh <name> --app=<web|dashboard|server|all>"
  exit 1
fi

# Convert name to PascalCase for type names (e.g., user-roles → UserRole, posts → Post)
to_pascal() {
  echo "$1" | sed 's/-/ /g; s/_/ /g' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) substr($i,2)}1' | tr -d ' '
}

# Singularize: remove trailing 's' for type names (simple heuristic)
singularize() {
  local word="$1"
  if [[ "$word" =~ ies$ ]]; then
    echo "${word%ies}y"
  elif [[ "$word" =~ ses$ ]]; then
    echo "${word%es}"
  elif [[ "$word" =~ s$ ]] && [[ ! "$word" =~ ss$ ]]; then
    echo "${word%s}"
  else
    echo "$word"
  fi
}

PASCAL=$(to_pascal "$(singularize "$NAME")")

generate_frontend() {
  local app_name="$1"
  local dir="apps/${app_name}/src/modules/${NAME}"

  if [ -d "$dir" ]; then
    echo "  ⚠ ${dir} already exists, skipping"
    return
  fi

  mkdir -p "$dir"

  # contracts.ts
  cat > "${dir}/contracts.ts" << EOF
import { z } from "zod/v4";

export const ${PASCAL}Schema = z.object({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ${PASCAL} = z.infer<typeof ${PASCAL}Schema>;

export const Create${PASCAL}Request = z.object({});

export type Create${PASCAL}RequestData = z.infer<typeof Create${PASCAL}Request>;
EOF

  # api.ts
  cat > "${dir}/api.ts" << EOF
import { apiFetch } from "#/libs/api";
import { ${PASCAL}Schema, type Create${PASCAL}RequestData } from "./contracts";

const endpoints = {
  list: "/api/${NAME}",
  detail: (id: string) => \`/api/${NAME}/\${id}\`,
} as const;

export async function get${PASCAL}s() {
  const data = await apiFetch(endpoints.list);
  return ${PASCAL}Schema.array().parse(data);
}

export async function get${PASCAL}(id: string) {
  const data = await apiFetch(endpoints.detail(id));
  return ${PASCAL}Schema.parse(data);
}

export async function create${PASCAL}(body: Create${PASCAL}RequestData) {
  const data = await apiFetch(endpoints.list, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return ${PASCAL}Schema.parse(data);
}
EOF

  # queries.ts
  cat > "${dir}/queries.ts" << EOF
import { queryOptions } from "@tanstack/react-query";
import { get${PASCAL}s, get${PASCAL} } from "./api";

export const ${NAME}Queries = {
  all: () => ["${NAME}"] as const,
  lists: () => [...${NAME}Queries.all(), "list"] as const,
  list: () =>
    queryOptions({
      queryKey: [...${NAME}Queries.lists()],
      queryFn: get${PASCAL}s,
    }),
  details: () => [...${NAME}Queries.all(), "detail"] as const,
  detail: (id: string) =>
    queryOptions({
      queryKey: [...${NAME}Queries.details(), id],
      queryFn: () => get${PASCAL}(id),
    }),
};
EOF

  # mutations.ts
  cat > "${dir}/mutations.ts" << EOF
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { create${PASCAL} } from "./api";
import { ${NAME}Queries } from "./queries";

export function useCreate${PASCAL}() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: create${PASCAL},
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: ${NAME}Queries.lists(),
      });
    },
  });
}
EOF

  echo "  ✓ ${dir}/ (contracts, api, queries, mutations)"
}

generate_server() {
  local dir="apps/server/src/routes/${NAME}"

  if [ -d "$dir" ]; then
    echo "  ⚠ ${dir} already exists, skipping"
    return
  fi

  mkdir -p "$dir"

  # index.ts
  cat > "${dir}/index.ts" << EOF
import { Elysia, t } from "elysia";
import { requireAuth } from "#/middleware/auth";

export const ${NAME}Routes = new Elysia({ prefix: "/api/${NAME}" })
  .use(requireAuth)
  .get("/", async () => {
    // TODO: implement list
    return [];
  })
  .get(
    "/:id",
    async ({ params }) => {
      // TODO: implement get by id
      return { id: params.id };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    },
  )
  .post(
    "/",
    async ({ body }) => {
      // TODO: implement create
      return body;
    },
    {
      body: t.Object({}),
    },
  )
  .put(
    "/:id",
    async ({ params, body }) => {
      // TODO: implement update
      return { id: params.id, ...body };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({}),
    },
  )
  .delete(
    "/:id",
    async ({ params }) => {
      // TODO: implement delete
      return { id: params.id };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    },
  );
EOF

  # service.ts
  cat > "${dir}/service.ts" << EOF
import { db } from "#/db";

// TODO: implement ${NAME} service functions

export const ${NAME}Service = {
  async list() {
    return [];
  },

  async getById(id: string) {
    return null;
  },

  async create(data: unknown) {
    return data;
  },

  async update(id: string, data: unknown) {
    return data;
  },

  async remove(id: string) {
    return { id };
  },
};
EOF

  echo "  ✓ ${dir}/ (index, service)"
}

echo "Generating module: ${NAME} (${PASCAL})"

case "$APP" in
  web)
    generate_frontend "web"
    ;;
  dashboard)
    generate_frontend "dashboard"
    ;;
  server)
    generate_server
    ;;
  all)
    generate_frontend "web"
    generate_frontend "dashboard"
    generate_server
    ;;
  *)
    echo "Unknown app: ${APP}. Use web, dashboard, server, or all."
    exit 1
    ;;
esac

echo "Done!"
