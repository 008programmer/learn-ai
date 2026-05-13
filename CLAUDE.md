# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Build & Run

```bash
# Build Docker image
Build.bat   # runs: docker-compose -f docker-compose.yml build

# Run all services (app + postgres + seq + jaeger)
Run.bat     # runs: docker-compose -f docker-compose.yml -p modular-monolith-template up -d

# Build the solution
dotnet build ModularMonolithTemplate.sln

# Run via .NET Aspire (preferred for local dev — orchestrates Postgres automatically)
# This starts both the API and the React frontend (via AddExecutable "client-app")
dotnet run --project ModularMonolithTemplate.AppHost
```

### Frontend (ClientApp/)

```bash
# Install dependencies
cd ClientApp && bun install

# Run standalone dev server (proxies /api/* to https://localhost:5001)
cd ClientApp && bun run dev        # http://localhost:5173

# Type-check + production build
cd ClientApp && bun run build

# Lint
cd ClientApp && bun run lint
```

> When running via Aspire, the frontend starts automatically and `VITE_API_BASE_URL`
> is injected from the Aspire service endpoint — no manual config needed.

### Tests

```bash
# Run all tests
dotnet test ModularMonolithTemplate.sln

# Run a specific test project
dotnet test Common/Modules.Common.Tests.Architecture
dotnet test Common/Modules.Common.Result.Tests.Unit
dotnet test Modules/Shipments/Modules.Shipments.Tests.Unit
dotnet test Modules/Shipments/Modules.Shipments.Tests.Integration

# Run a single test by name
dotnet test Modules/Shipments/Modules.Shipments.Tests.Integration --filter "FullyQualifiedName~CreateShipmentTests"
```

### EF Core Migrations

Each module has its own DbContext. Run migrations from the solution root:

```bash
# Add migration for Shipments module
dotnet ef migrations add <MigrationName> \
  --project Modules/Shipments/Modules.Shipments.Infrastructure \
  --startup-project ModularMonolith.Host

# Same pattern for other modules (Carriers, Stocks, Users)
```

Migrations are applied automatically on startup in Development mode via `MigrateModuleDatabasesAsync()`.

## Architecture

This is a **Modular Monolith** built on ASP.NET Core (.NET 10), with four business modules sharing a single host process and a single PostgreSQL database (using separate schemas per module).

### Project Layout

```
ModularMonolith.Host/          # ASP.NET Core host — wires all modules, seeds data
ModularMonolithTemplate.AppHost/   # .NET Aspire orchestration (local dev)
ClientApp/                     # React frontend (Bun + Vite + TypeScript) — Solution Folder in .sln (VS visibility only, not a .NET project)
  src/
    api/                       # Typed fetch wrappers per module
    schemas/                   # Zod schemas (validation + TS types)
    stores/                    # Zustand stores (auth persisted, one per module)
    components/ui/             # shadcn/ui components
    components/layout/         # Shell (sidebar), ProtectedRoute
    pages/                     # auth/, shipments/, carriers/, stocks/, users/
    router.tsx                 # createBrowserRouter — full route tree
Modules/
  Shipments/                   # Business module (same pattern for Carriers, Stocks, Users)
    Modules.Shipments.Domain/
    Modules.Shipments.Infrastructure/
    Modules.Shipments.Features/
    Modules.Shipments.PublicApi/
    Modules.Shipments.Tests.Unit/
    Modules.Shipments.Tests.Integration/
  Carriers/
  Stocks/
  Users/
Common/
  Modules.Common.Domain/
  Modules.Common.Application/
  Modules.Common.Infrastructure/
  Modules.Common.API/
  Modules.Common.Tests.Architecture/
  Modules.Common.Result.Tests.Unit/
```

### Module Project Tiers

| Project | Responsibility |
|---|---|
| `Modules.<X>.Domain` | Entities, value objects, enums, domain logic (pure C#, no EF/infrastructure deps) |
| `Modules.<X>.Infrastructure` | EF Core `DbContext`, migrations, schema config (`snake_case`, named schema), `IPolicyFactory` impl |
| `Modules.<X>.Features` | Use-case handlers, API endpoints, validators, event handlers, DI registration |
| `Modules.<X>.PublicApi` | Interface contract (`I<X>ModuleApi`) that other modules can reference — the only cross-module seam |

### Feature Vertical Slice Pattern

Each use-case inside a Features project is self-contained in its own folder:

```
Features/CreateShipment/
  CreateShipment.Endpoint.cs    # IApiEndpoint — route, validation, result mapping
  CreateShipment.Handler.cs     # IHandler — business logic, returns Result<T>
  CreateShipment.Validators.cs  # FluentValidation rules
  CreateShipment.Mapping.cs     # Request ↔ domain mapping
  Events/
    ShipmentCreatedEvent.cs     # IEvent marker
    CreateCarrierEventHandler.cs  # IEventHandler<T> — calls cross-module PublicApi
```

### Cross-Module Communication

Modules are **strictly isolated** — enforced by architecture tests (`Modules.Common.Tests.Architecture` using NetArchTest.Rules). Cross-module calls go through `PublicApi` interfaces only:

- `ICarrierModuleApi` — Carriers public surface
- `IStockModuleApi` — Stocks public surface

No module may reference another module's Domain, Infrastructure, or Features assemblies. These rules are validated by `ModuleTests.cs`.

### Common Infrastructure

| Project | Role |
|---|---|
| `Modules.Common.Domain` | `Result<T>` / `Error` types, `IEvent`, `IEventHandler<T>`, `IHandler`, `IAuditableEntity` |
| `Modules.Common.Application` | `EventPublisher` (resolves & runs `IEventHandler<T>` in parallel), `HandlerRegistrationExtensions` (assembly-scan DI) |
| `Modules.Common.Infrastructure` | JWT auth setup, OpenTelemetry (OTLP to Jaeger), `AuditableInterceptor`, `IModuleDatabaseMigrator`, `IPolicyFactory` |
| `Modules.Common.API` | `IApiEndpoint`, `IModuleMiddlewareConfigurator`, assembly-scan registration, `GlobalExceptionHandler`, `EndpointResultsExtensions` |
| `ModularMonolithTemplate.ServiceDefaults` | .NET Aspire service defaults (health checks, telemetry) |

### Result Pattern

All handlers return `Result<TValue>` (never throw business exceptions). `Error` has an `ErrorType` enum:

| ErrorType | Maps to HTTP |
|---|---|
| `Validation` | 400 Bad Request |
| `NotFound` | 404 Not Found |
| `Conflict` | 409 Conflict |
| `Unauthorized` | 401 Unauthorized |
| `Forbidden` | 403 Forbidden |
| `Failure` / `Unexpected` | 500 Internal Server Error |

Endpoints call `.ToProblem()` (`EndpointResultsExtensions`) to convert errors to `ProblemDetails`.

### Request Flow

1. HTTP request → `MapApiEndpoints()` calls each `IApiEndpoint.MapEndpoint()` (registered by assembly scan)
2. Endpoint calls `IValidator<T>` (FluentValidation) → returns `ValidationProblem` on failure
3. Endpoint calls `IHandler` implementation (injected via `RegisterHandlersFromAssemblyContaining`)
4. Handler returns `Result<TValue>` → endpoint calls `response.Errors.ToProblem()` or `Results.Ok()`
5. Handler may call `IEventPublisher.PublishAsync()` → runs all `IEventHandler<TEvent>` registrations in parallel

### Host Startup (`ModularMonolith.Host/Program.cs`)

- Calls `AddShipmentsModule`, `AddCarriersModule`, `AddStocksModule`, `AddUsersModule` — each wires its own DI
- In Development: auto-migrates all module DBs and seeds data
- Swagger + Scalar API docs enabled in Development only
- Authentication: JWT Bearer with config from `AuthConfiguration` section
- CORS: `ClientAppPolicy` allows origins from `AllowedCorsOrigins` in `appsettings.Development.json` (defaults to `http://localhost:5173`)
- `IApiMarker` (in Host) is the marker interface used by `WebApplicationFactory<IApiMarker>` in integration tests

### Database

- **PostgreSQL** with EF Core + snake_case naming convention (`EFCore.NamingConventions`)
- Each module uses its own schema (e.g., `shipments`, `carriers`, `stocks`, `users`)
- Each module registers its own `IModuleDatabaseMigrator` — the host calls `MigrateModuleDatabasesAsync()` which iterates all registered migrators

### Observability

- **Logging**: Serilog → Console + Seq (http://localhost:8081)
- **Tracing**: OpenTelemetry OTLP → Jaeger (http://localhost:16686), with per-module `ActivitySource` registered via `ShipmentsTracingConsts.ActivityModuleName`, etc.
- Each module registers custom tracing middleware via `IModuleMiddlewareConfigurator`

### Testing Approach

- **Architecture tests** (`Modules.Common.Tests.Architecture`): NetArchTest.Rules to enforce module isolation at assembly level
- **Unit tests** (`Modules.Shipments.Tests.Unit`): NSubstitute for mocking
- **Integration tests** (`Modules.Shipments.Tests.Integration`): `WebApplicationFactory<IApiMarker>` + Testcontainers (PostgreSQL) + Respawn for DB reset between tests

### Code Analysis

`Directory.Build.props` applies to all projects:
- Analyzers: Meziantou.Analyzer, SonarAnalyzer.CSharp, Roslynator.Analyzers
- `CodeAnalysisTreatWarningsAsErrors=true` (analyzer violations fail the build)
- `EnforceCodeStyleInBuild=true`
- Central package management via `Directory.Packages.props`
