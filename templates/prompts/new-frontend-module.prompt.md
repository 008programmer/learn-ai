# Prompt: Generate Frontend Files for a Module

Use this prompt to generate the React frontend for an existing backend module — API wrapper, Zod schemas, Zustand store, and pages.

---

## Prompt Template

```
Generate the frontend files for the "{ModuleName}" module in my React application (ClientApp/).

## Module Specification

- **Module Name**: {ModuleName} (e.g., "Todos")
- **API Base Route**: {e.g., "/api/todos"}
- **Description**: {What this module does}

### Entities & Fields

{List entity fields that appear in the UI}

Example:
- **TodoItem**
  - id: string (UUID)
  - title: string
  - description: string | null
  - isCompleted: boolean
  - dueDate: string | null

### API Endpoints

{List the backend endpoints with methods and expected payloads}

Example:
- POST /api/todos — Create todo (body: { title, description, dueDate })
- GET /api/todos — Get all todos (response: TodoItem[])
- GET /api/todos/{id} — Get todo by ID (response: TodoItem)
- PATCH /api/todos/{id}/complete — Mark as complete
- DELETE /api/todos/{id} — Delete todo

### Pages Needed

{List the pages/routes}

Example:
- /todos — List page with table + search
- /todos/new — Create form page
- /todos/:id — Detail page

## Architecture Rules — Follow Exactly

### Tech Stack
- React 19 + TypeScript
- Zustand for state management
- Zod for validation schemas
- React Hook Form with zodResolver
- shadcn/ui components (Button, Input, Form, Table, Card, Badge, Dialog)
- React Router v7 (createBrowserRouter)
- Lucide React icons
- i18next for translations

### File Structure

```
ClientApp/src/
  api/{moduleName}.ts                    # Typed API wrapper
  schemas/{moduleName}.schemas.ts        # Zod schemas + TypeScript types
  stores/{moduleName}.store.ts           # Zustand store
  pages/{moduleName}/
    {ModuleName}Page.tsx                 # List page
    {ModuleName}DetailPage.tsx           # Detail/edit page (optional)
    Create{ModuleName}Page.tsx           # Create form (optional)
```

### 1. API Wrapper (`src/api/{moduleName}.ts`)

Follow this exact pattern — uses the shared `apiClient` from `src/api/client.ts`:

```typescript
import { apiClient } from "./client";
import type { {Entity}Response } from "@/schemas/{moduleName}.schemas";

export const {moduleName}Api = {
  create: (body: { name: string; /* fields */ }) =>
    apiClient.post<{Entity}Response>("/api/{route}", body),

  getAll: () =>
    apiClient.get<{Entity}Response[]>("/api/{route}"),

  getById: (id: string) =>
    apiClient.get<{Entity}Response>(`/api/{route}/${id}`),

  update: (id: string, body: { name: string; /* fields */ }) =>
    apiClient.put<{Entity}Response>(`/api/{route}/${id}`, body),

  delete: (id: string) =>
    apiClient.delete(`/api/{route}/${id}`),
};
```

**Important:**
- Import `apiClient` from `./client` (NOT axios or fetch)
- Use typed generics `apiClient.get<T>()` for response types
- Keep method names short and descriptive
- Template literals for dynamic route segments

### 2. Zod Schemas (`src/schemas/{moduleName}.schemas.ts`)

```typescript
import { z } from "zod";

// Form validation schema for create/update
export const create{Entity}Schema = z.object({
  name: z.string().min(1, "{Entity} name is required").max(200),
  // ... fields with validation rules
  price: z.coerce.number().positive("Price must be positive"),
});

export type Create{Entity}FormValues = z.infer<typeof create{Entity}Schema>;

// Optional: update schema (may differ from create)
export const update{Entity}Schema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  // ...
});

export type Update{Entity}FormValues = z.infer<typeof update{Entity}Schema>;

// API response types (plain interfaces — not Zod schemas)
export interface {Entity}Response {
  id: string;
  name: string;
  // ... all response fields
  isActive: boolean;
}
```

**Important:**
- Use `z.coerce.number()` for numeric inputs (HTML inputs return strings)
- Use `.min(1, "message")` instead of `.nonempty()`
- Export both Zod schemas AND plain TypeScript interfaces for API responses
- Schemas are for form validation; interfaces are for API response types

### 3. Zustand Store (`src/stores/{moduleName}.store.ts`)

```typescript
import { create } from "zustand";
import type { {Entity}Response } from "@/schemas/{moduleName}.schemas";
import { {moduleName}Api } from "@/api/{moduleName}";

interface {ModuleName}State {
  {entities}: {Entity}Response[];
  selected: {Entity}Response | null;
  loading: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
  fetchById: (id: string) => Promise<void>;
  create{Entity}: (data: { name: string; /* fields */ }) => Promise<{Entity}Response>;
  setSelected: (item: {Entity}Response | null) => void;
}

export const use{ModuleName}Store = create<{ModuleName}State>()((set) => ({
  {entities}: [],
  selected: null,
  loading: false,
  error: null,

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const {entities} = await {moduleName}Api.getAll();
      set({ loading: false, {entities} });
    } catch {
      set({ loading: false, error: "Failed to fetch {entities}" });
    }
  },

  fetchById: async (id) => {
    set({ loading: true, error: null });
    try {
      const item = await {moduleName}Api.getById(id);
      set({ loading: false, selected: item });
    } catch {
      set({ loading: false, error: "Failed to fetch {entity}" });
    }
  },

  create{Entity}: async (data) => {
    set({ loading: true, error: null });
    try {
      const item = await {moduleName}Api.create(data);
      set((s) => ({ loading: false, {entities}: [...s.{entities}, item] }));
      return item;
    } catch {
      set({ loading: false, error: "Failed to create {entity}" });
      throw new Error("Failed to create {entity}");
    }
  },

  setSelected: (item) => set({ selected: item }),
}));
```

**Important:**
- Use `create` from `zustand` (NOT `create` from `zustand/vanilla`)
- Catch blocks use bare `catch` (no unused error variable)
- `throw` in catch blocks so callers can handle errors
- State updates are immutable (spread operator for arrays)

### 4. List Page (`src/pages/{moduleName}/{ModuleName}Page.tsx`)

```tsx
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { use{ModuleName}Store } from "@/stores/{moduleName}.store";
import {
  create{Entity}Schema,
  type Create{Entity}FormValues,
} from "@/schemas/{moduleName}.schemas";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2 } from "lucide-react";

export function {ModuleName}Page() {
  const { {entities}, loading, error, fetchAll, create{Entity} } =
    use{ModuleName}Store();
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  const form = useForm<Create{Entity}FormValues>({
    resolver: zodResolver(create{Entity}Schema),
    defaultValues: { name: "" },
  });

  async function onSubmit(values: Create{Entity}FormValues) {
    try {
      await create{Entity}(values);
      form.reset();
      setOpen(false);
    } catch {
      // error handled in store
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("{moduleName}.title")}</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t("{moduleName}.new")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("{moduleName}.createTitle")}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("{moduleName}.name")}</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter name..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Add FormFields for other fields */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting
                    ? t("common.creating")
                    : t("common.create")}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t("common.loading")}
        </div>
      ) : {entities}.length === 0 ? (
        <p className="text-muted-foreground text-sm">{t("{moduleName}.empty")}</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("{moduleName}.colName")}</TableHead>
              <TableHead>{t("{moduleName}.colStatus")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {{entities}.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>
                  <Badge variant={item.isActive ? "default" : "secondary"}>
                    {item.isActive ? t("common.active") : t("common.inactive")}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
```

### 5. Router Registration

Update `src/router.tsx` — add routes inside the Shell/ProtectedRoute layout:

```tsx
import { {ModuleName}Page } from "@/pages/{moduleName}/{ModuleName}Page";

// Inside the children array of the ProtectedRoute layout:
{
  path: "{moduleName}",
  element: <{ModuleName}Page />,
},
```

### 6. Navigation

Update `src/components/layout/Shell.tsx` — add to navigation items:

```tsx
import { Package } from "lucide-react"; // choose appropriate icon

// Add to navItems array:
{ to: "/{moduleName}", icon: Package, label: t("nav.{moduleName}") },
```

## Post-Generation Steps

1. Add translation keys to i18n resources
2. Update `router.tsx` with new routes
3. Update `Shell.tsx` navigation
4. Run `bun run lint` to check for issues
5. Run `bun run build` to verify TypeScript types
```
