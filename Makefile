.PHONY: setup dev dev-web dev-server dev-dashboard dev-all build install check module db-generate db-migrate db-push db-studio db-seed db-up db-down reset logs

# First-time project setup
setup:
	bun install
	cd apps/web && npx -y grab@latest init -y
# >>DASHBOARD
	cd apps/dashboard && npx -y grab@latest init -y
# <<DASHBOARD
# >>BACKEND
	@test -f apps/server/.env || cp apps/server/.env.example apps/server/.env
	docker compose up -d --wait
	portless alias minio.dyz-bunstack 9000
	portless alias minio-console.dyz-bunstack 9001
	$(MAKE) db-push
	$(MAKE) db-seed
# <<BACKEND

# >>BACKEND
# Core apps (web + server + dashboard)
dev:
	@docker compose up -d --wait
	@portless alias minio.dyz-bunstack 9000
	@portless alias minio-console.dyz-bunstack 9001
	@printf '\n'
	@printf '  %-16s %s\n' 'App' 'URL'
	@printf '  %-16s %s\n' '───' '───'
	@printf '  %-16s %s\n' 'Web' 'http://dyz-bunstack.localhost:1355'
	@printf '  %-16s %s\n' 'API' 'http://api.dyz-bunstack.localhost:1355'
	@printf '  %-16s %s\n' 'Dashboard' 'http://dashboard.dyz-bunstack.localhost:1355'
	@printf '  %-16s %s\n' 'MinIO' 'http://minio.dyz-bunstack.localhost:1355'
	@printf '  %-16s %s\n' 'MinIO Console' 'http://minio-console.dyz-bunstack.localhost:1355'
	@printf '\n'
	bun --filter @dyz-bunstack-app/web --filter @dyz-bunstack-app/server --filter @dyz-bunstack-app/dashboard dev
# <<BACKEND

# >>FRONTEND_ONLY
#dev:
#	bun --filter @dyz-bunstack-app/web dev
# <<FRONTEND_ONLY

dev-web:
	bun --filter @dyz-bunstack-app/web dev

# >>BACKEND
dev-server:
	bun --filter @dyz-bunstack-app/server dev
# <<BACKEND

# >>DASHBOARD
dev-dashboard:
	bun --filter @dyz-bunstack-app/dashboard dev
# <<DASHBOARD

# All apps including optional ones
dev-all:
	bun --filter '*' dev

build:
	bun --filter '*' build

install:
	bun install

module:
	@./scripts/generate-module.sh $(name) --app=$(or $(app),web)

check:
	bun --filter @dyz-bunstack-app/web typecheck
	bun --filter @dyz-bunstack-app/web check
	bun --filter @dyz-bunstack-app/dashboard typecheck
	bun --filter @dyz-bunstack-app/dashboard check
	bun --filter @dyz-bunstack-app/server typecheck

# >>BACKEND
# Database
db-up:
	docker compose up -d --wait

db-down:
	docker compose down

db-generate:
	bun --filter @dyz-bunstack-app/server db:generate

db-migrate:
	bun --filter @dyz-bunstack-app/server db:migrate

db-push:
	bun --filter @dyz-bunstack-app/server db:push

db-studio:
	bun --filter @dyz-bunstack-app/server db:studio

db-seed:
	bun --filter @dyz-bunstack-app/server db:seed

reset:
	docker compose down -v
	docker compose up -d --wait
	$(MAKE) db-push
	$(MAKE) db-seed

logs:
	docker compose logs -f
# <<BACKEND
