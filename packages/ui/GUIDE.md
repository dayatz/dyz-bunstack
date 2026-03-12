# @dyz-bunstack-app/ui

Shared React components consumed by `@dyz-bunstack-app/web` and `@dyz-bunstack-app/dashboard`.

## Adding a component

1. Create `src/my-component.tsx`
2. Export from `src/index.ts`
3. Import in apps: `import { MyComponent } from "@dyz-bunstack-app/ui"`

## Modifying a component

Props or behavior changes affect both apps. Check usages:

```sh
grep -r "ComponentName" apps/web/src apps/dashboard/src
```

## Removing a component

1. Remove from `src/index.ts`
2. Delete the source file
3. Remove all imports in `apps/web` and `apps/dashboard`

## Notes

- No build step — Vite resolves TypeScript source directly via workspace link
- Use `workspace:*` in consumer `package.json` dependencies
- Components should use `react` and `react-dom` as peer dependencies (provided by consuming apps)
