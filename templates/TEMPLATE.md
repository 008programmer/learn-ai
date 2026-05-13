# Modular Monolith Application Template

A production-ready **Modular Monolith** template built on ASP.NET Core (.NET 10) with a React 19 frontend. Clone this repository and use it as the foundation for any new application.

---

## Quick Start

### 1. Clone & Rename

```bash
git clone <this-repo> MyNewApp
cd MyNewApp
```

### 2. Find & Replace Namespaces

Search and replace across the entire solution:

| Find | Replace With |
|------|-------------|
| `ModularMonolithTemplate` | `MyNewApp` |
| `ModularMonolith` | `MyNewApp` |
| `modular-monolith` | `my-new-app` |
| `modular_monolith` | `my_new_app` |

### 3. Configure Database

Edit `ModularMonolith.Host/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "Postgres": "Server=localhost;Port=5432;Database=my_new_app;User Id=admin;Password=admin"
  }
}
```

### 4. Configure Auth

Edit the `AuthConfiguration` section in `appsettings.json`:

```json
{
  "AuthConfiguration": {
    "Key": "<your-256-bit-secret>",
    "Issuer": "MyNewApp",
    "Audience": "MyNewApp"
  }
}
```

### 5. Run

```bash
# Option A: Via .NET Aspire (recommended for local dev)
dotnet run --project ModularMonolithTemplate.AppHost

# Option B: Via Docker Compose
docker-compose -f docker-compose.yml build
docker-compose -f docker-compose.yml -p my-new-app up -d

# Option C: Direct
dotnet run --project ModularMonolith.Host
cd ClientApp && bun install && bun run dev
```

---

## What's Included (Base Infrastructure)

### Backend

| Component | Description |
|-----------|-------------|
| **JWT Authentication** | ASP.NET Identity + JWT Bearer + Refresh Tokens |
| **Authorization** | Claims-based policies per module (IPolicyFactory) |
| **Result Pattern** | `Result<T>` / `Error` types — no business exceptions |
| **Event System** | `IEvent` / `IEventHandler<T>` / `IEventPublisher` (parallel execution) |
| **Vertical Slices** | Each feature = Endpoint + Handler + Validators in one folder |
| **Auto-DI** | Assembly-scanned registration for endpoints, handlers, validators |
| **Database** | PostgreSQL with EF Core, snake_case naming, separate schema per module |
| **Auditing** | `IAuditableEntity` auto-sets `CreatedAtUtc` / `UpdatedAtUtc` |
| **Logging** | Serilog → Console + Seq |
| **Tracing** | OpenTelemetry → Jaeger (per-module ActivitySource) |
| **API Docs** | Swagger + Scalar (Development only) |
| **Code Quality** | Meziantou, SonarAnalyzer, Roslynator analyzers (warnings = errors) |
| **Architecture Tests** | NetArchTest.Rules enforcing module isolation |
| **Rate Limiting** | Configurable hourly access limits |

### Frontend (ClientApp/)

| Component | Description |
|-----------|-------------|
| **React 19** | Latest React with TypeScript |
| **Vite + Bun** | Fast dev server and bundling |
| **Zustand** | State management with persistence (auth) |
| **Zod** | Schema validation + TypeScript type inference |
| **React Hook Form** | Form management with Zod resolver |
| **shadcn/ui** | Pre-built accessible UI components |
| **React Router v7** | File-based routing with protected routes |
| **API Client** | Auto token refresh, 401 retry, 429 handling |
| **i18next** | Internationalization support |

### Infrastructure

| Component | Description |
|-----------|-------------|
| **Docker Compose** | App + PostgreSQL + Seq + Jaeger |
| **.NET Aspire** | Local dev orchestration (auto-injects DB + API URLs) |
| **Central Packages** | `Directory.Packages.props` for version management |

---

## Architecture Overview

### Module Structure

Each business module follows this 4-tier pattern:

```
Modules/{ModuleName}/
  Modules.{ModuleName}.Domain/           # Entities, value objects, enums (pure C#)
  Modules.{ModuleName}.Infrastructure/   # EF DbContext, migrations, policies
  Modules.{ModuleName}.Features/         # Endpoints, handlers, validators, DI
  Modules.{ModuleName}.PublicApi/        # Interface contract for cross-module calls
```

### Request Flow

```
HTTP Request
  → IApiEndpoint.MapEndpoint()           # Route matched
  → IValidator<TRequest>                 # FluentValidation
  → IHandler<TRequest, TResponse>        # Business logic
  → Result<TValue>                       # Success or Error
  → Results.Ok() or .ToProblem()         # HTTP response
  → (optional) IEventPublisher           # Publish domain events
```

### Feature Vertical Slice

Each use-case is self-contained in a folder:

```
Features/CreateSomething/
  CreateSomething.Endpoint.cs     # IApiEndpoint — route, auth, validation, result mapping
  CreateSomething.Handler.cs      # IHandler — business logic, returns Result<T>
  CreateSomething.Validators.cs   # FluentValidation rules
  Events/                         # (optional) domain events + handlers
```

### Cross-Module Communication

Modules are **strictly isolated** — enforced by architecture tests. To call across modules:

1. Target module exposes a `PublicApi` project with an interface (e.g., `IProjectsModuleApi`)
2. Target module implements it internally + wraps with tracing decorator
3. Caller module references only the `PublicApi` project
4. Architecture tests verify no internal project references leak

### Database Strategy

- **One PostgreSQL instance**, separate schema per module
- Each module owns its `DbContext` and migrations
- `IModuleDatabaseMigrator` auto-runs migrations on startup (Development)
- snake_case naming convention via `EFCore.NamingConventions`
- `AuditableInterceptor` auto-stamps `CreatedAtUtc` / `UpdatedAtUtc`

---

## Modules to Keep vs Remove

### Keep (Core Infrastructure)

- `Common/` — All common projects (Domain, Application, Infrastructure, API, Tests.Architecture)
- `Modules/Users/` — Authentication & authorization (Identity, JWT, refresh tokens)
- `ModularMonolith.Host/` — Host startup
- `ModularMonolithTemplate.AppHost/` — Aspire orchestration
- `ClientApp/` — Frontend shell, auth pages, API client, layout components

### Example Modules (Todos + Projects)

The template includes two example modules that demonstrate every module concept:

- **Todos** — CRUD + complete action, depends on Projects via `IProjectsModuleApi`
- **Projects** — CRUD, exposes PublicApi, publishes `ProjectDeletedEvent`

Together they demonstrate: vertical slices, Result pattern, authorization policies, cross-module communication (PublicApi), domain events, tracing, and architecture test isolation.

### Replacing Example Modules

When starting a new app, replace Todos and Projects with your own modules:

1. Delete their directories under `Modules/` (keep `Modules/Users/`)
2. Remove their `.Add*Module()` calls from `ModularMonolith.Host/Program.cs`
3. Remove their activity sources from `AddCoreInfrastructure()` call
4. Remove their project references from `ModularMonolithTemplate.sln`
5. Update `ModuleTests.cs` in architecture tests
6. Remove seed data in `ModularMonolith.Host/Seeding/SeedService.cs`
7. Remove their frontend files (pages, stores, schemas, API wrappers, routes)

Then use `templates/prompts/new-module.prompt.md` to generate your own modules.

---

## Customization Checklist

- [ ] Rename solution/project namespaces
- [ ] Update `appsettings.json` — DB name, JWT config, CORS origins
- [ ] Update `docker-compose.yml` — service names, database name
- [ ] Update `AppHost.cs` — project references, service names
- [ ] Replace example modules (Todos, Projects) with your own, or keep as reference
- [ ] Update seed data (`SeedService.cs`, `UserSeedService.cs`)
- [ ] Update `ClientApp/src/components/layout/Shell.tsx` — app name, navigation
- [ ] Update `ClientApp/src/router.tsx` — remove example routes
- [ ] Update architecture tests in `ModuleTests.cs`
- [ ] Create your first business module (see `templates/prompts/new-module.prompt.md`)

---

## Prompt Templates

Use the structured prompts in `templates/prompts/` to generate new modules and features:

| Prompt | Use Case |
|--------|----------|
| `new-module.prompt.md` | Create a full backend module (Domain → Infrastructure → Features → PublicApi) |
| `new-feature.prompt.md` | Add a vertical slice feature to an existing module |
| `new-frontend-module.prompt.md` | Generate frontend files for a module (API, schema, store, pages) |
| `new-cross-module.prompt.md` | Set up cross-module communication via PublicApi + events |
| `advanced-patterns.prompt.md` | Rich domain entities, value objects, enums, error helpers, EF config, unit/integration tests, architecture tests, frontend detail pages, state machines, dynamic forms |
