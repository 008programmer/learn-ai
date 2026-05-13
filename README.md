# Modular Monolith Template

A production-ready modular monolith template built with ASP.NET Core (.NET 10) and two frontend options.

## What's included

- **4 example business modules**: Shipments, Carriers, Stocks, Users
- **Vertical slice architecture** with the Result pattern
- **Cross-module communication** via PublicApi interfaces (enforced by architecture tests)
- **Two frontend options**: React (ClientApp/) and Angular (ClientAppAngular/)
- **JWT authentication** with role-based access
- **Observability**: Serilog + OpenTelemetry (Jaeger + Seq)
- **Local dev**: .NET Aspire orchestration

## Tech Stack

- **Frontend (React)**: React 19 + TypeScript + Vite + shadcn/ui + Tailwind CSS
- **Frontend (Angular)**: Angular 19 + TypeScript + standalone components
- **Backend**: ASP.NET Core (.NET 10), Modular Monolith architecture
- **Database**: PostgreSQL (per-module schemas via EF Core)
- **Auth**: JWT Bearer
- **Observability**: Serilog + OpenTelemetry (Jaeger + Seq)
- **Local dev**: .NET Aspire orchestration

## Running Locally

```bash
# Start all services via .NET Aspire (recommended — starts both frontends)
dotnet run --project ModularMonolithTemplate.AppHost

# Or run React frontend standalone (http://localhost:5173)
cd ClientApp && bun install && bun run dev

# Or run Angular frontend standalone (http://localhost:4200)
cd ClientAppAngular && npm install && npm run dev
```

See [CLAUDE.md](./CLAUDE.md) for full build, test, and migration commands.
