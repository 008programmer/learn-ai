# Skill: scaffold-react
## React Specialist — Feature Page + Store + API Scaffold

**Invoked by:** scaffold-feature orchestrator (as a subagent)  
**Inputs:** ModuleName, FeatureName, moduleName (camelCase), featureName (camelCase)

---

## Instructions

You are the React specialist subagent. Generate three outputs following the exact patterns of this codebase.

---

### Codebase Patterns to Follow

- **Package manager** — always use `bun`, never `npm`
- **State management** — Zustand stores via `create<State>()((set) => ({...}))`
- **API layer** — `apiClient` from `@/api/client`, typed fetch wrappers per module in `src/api/`
- **Path aliases** — use `@/` for `src/` imports
- **Schemas** — Zod schemas in `src/schemas/` define response types — import from there, not inline
- **Styling** — Tailwind utility classes + shadcn/ui components from `@/components/ui/`

---

### File 1: `Client.React/src/pages/{moduleName}/{FeatureName}Page.tsx`

```tsx
import { use{ModuleName}Store } from "@/stores/{moduleName}.store";

export function {FeatureName}Page() {
  const { loading, error } = use{ModuleName}Store();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{FeatureName}</h1>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {loading && (
        <p className="text-sm text-muted-foreground">Loading...</p>
      )}

      {/* TODO: add feature-specific UI here */}
    </div>
  );
}
```

---

### File 2: Update `Client.React/src/api/{moduleName}.ts`

Add the new API method to the existing `{moduleName}Api` object. Do not rewrite the whole file — add only the new method:

```typescript
// Add to the existing {moduleName}Api object:
{featureName}: (/* params */) =>
  apiClient.post<void>(`/api/{moduleName}/{featureName}`, /* body */),
```

---

### File 3: Update `Client.React/src/stores/{moduleName}.store.ts`

Add the new action to the existing Zustand store. Do not rewrite the whole file — add only:

1. The new method signature to `interface {ModuleName}State`
2. The implementation inside `create<{ModuleName}State>()()`

```typescript
// Add to interface:
{featureName}: (/* params */) => Promise<void>;

// Add to store implementation:
{featureName}: async (/* params */) => {
  set({ loading: true, error: null });
  try {
    await {moduleName}Api.{featureName}(/* params */);
    set({ loading: false });
  } catch {
    set({ loading: false, error: "Failed to {featureName}" });
  }
},
```

---

### After generating files, report to orchestrator

Return:
- Full path of the new page file
- Summary of what was added to the API file
- Summary of what was added to the store file
- Note the route to register in `Client.React/src/router.tsx`
